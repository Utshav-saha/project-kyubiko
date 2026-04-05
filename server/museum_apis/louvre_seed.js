const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const { Pool } = require("pg");

// ─── Configure Cloudinary ───────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Configure NeonDB ───────────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing. Add it to server/.env before running this script."
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── ARK IDs to fetch ───────────────────────────────────────────────────────
// These are some of the Louvre's most famous works.
// You can expand this list by browsing collections.louvre.fr and copying ARK IDs.
const ARK_IDS = [
  "cl010062370",  // Mona Lisa
  "cl010065566",  // Venus de Milo
  "cl010277627",  // Winged Victory of Samothrace
  "cl010062167",  // Liberty Leading the People (Delacroix)
  "cl010064465",  // The Wedding at Cana (Véronèse)
  "cl010066819",  // Portrait of Louis XIV (Rigaud)
  "cl010063752",  // The Coronation of Napoleon (David)
  "cl010065579",  // Sleeping Hermaphroditus
  "cl010059083",  // The Raft of the Medusa (Géricault)
  "cl010065571",  // Laocoon and His Sons
];

// ─── 1. Fetch a single artifact's JSON from the Louvre ──────────────────────
async function fetchArtifact(arkId) {
  try {
    const url = `https://collections.louvre.fr/ark:/53355/${arkId}.json`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { "Accept": "application/json" }
    });
    return response.data;
  } catch (err) {
    console.warn(`⚠️  Could not fetch ${arkId}:`, err.message);
    return null;
  }
}

// ─── 2. Transform raw Louvre JSON → your DB schema ──────────────────────────
function transformArtifact(data) {
  // Creator: comes as "DELACROIX Eugène" — reformat to "Eugène Delacroix"
  let creator = "Unknown";
  if (data.creator && data.creator.length > 0) {
    const raw = data.creator[0].label || "";
    // Louvre stores as "LASTNAME Firstname", flip it
    const parts = raw.split(" ");
    if (parts.length >= 2) {
      const last = parts[0];
      const first = parts.slice(1).join(" ");
      creator = `${first} ${last}`.trim();
    } else {
      creator = raw;
    }
  }

  // Time period: use displayDateCreated, strip the French prefix
  // e.g. "Date de création/fabrication : 1830" → "1830"
  let time_period = null;
  if (data.displayDateCreated) {
    time_period = data.displayDateCreated
      .replace(/^Date de création\/fabrication\s*:\s*/i, "")
      .trim()
      .substring(0, 100);
  }

  // Acquisition date: dig into acquisitionDetails
  let acquisition_date = new Date().toISOString().split("T")[0]; // default today
  if (data.acquisitionDetails && data.acquisitionDetails.length > 0) {
    const dates = data.acquisitionDetails[0].dates;
    if (dates && dates.length > 0) {
      const raw = dates[0].value || "";
      // Could be "DD/MM/YYYY" or "YYYY" format
      if (/^\d{4}$/.test(raw)) {
        acquisition_date = `${raw}-01-01`;
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
        const [d, m, y] = raw.split("/");
        acquisition_date = `${y}-${m}-${d}`;
      }
    }
  }

  // Origin: prefer placeOfCreation, fallback to provenance
  let origin = data.placeOfCreation || data.provenance || "France";
  // Trim to something short — these can be very long strings
  // e.g. "Florence (Italy -> Tuscany)" → just take up to first "("
  origin = origin.split("(")[0].trim().substring(0, 100);

  // Image: take position 0 (primary image)
  let raw_image_url = null;
  if (data.image && data.image.length > 0) {
    // Sort by position to ensure we get the primary image
    const sorted = [...data.image].sort((a, b) => a.position - b.position);
    raw_image_url = sorted[0].urlImage || sorted[0].urlThumbnail || null;
  }

  // Description — may be in French, that's okay for a university project
  const description = data.description
    ? data.description.substring(0, 1000)
    : null;

  return {
    artifact_name: (data.title || "Untitled").substring(0, 200),
    description,
    creator: creator.substring(0, 100),
    time_period,
    raw_image_url,
    origin,
    acquisition_date,
  };
}

// ─── 3. Upload image to Cloudinary ──────────────────────────────────────────
async function uploadToCloudinary(imageUrl, artifactName) {
  try {
    const publicId = `museums/louvre/${artifactName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .substring(0, 80)}`;

    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      overwrite: false,
      resource_type: "image",
    });

    return result.secure_url;
  } catch (err) {
    console.warn(`⚠️  Cloudinary upload failed for "${artifactName}":`, err.message);
    return null;
  }
}

// ─── 4. Insert museum record ─────────────────────────────────────────────────
async function insertLouvreMuseum(client) {
  // Upload Louvre building image
  let museumImageUrl = null;
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/djiuqhg6i/raw/upload/v1775233225/louvre-museum_r72hqc.jpg",
      { public_id: "museums/louvre_main", overwrite: false }
    );
    museumImageUrl = result.secure_url;
  } catch (err) {
    console.warn("Could not upload Louvre museum image:", err.message);
  }

  const query = `
    INSERT INTO museums (museum_name, description, category, open_days, picture_url, location_id, manager_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT DO NOTHING
    RETURNING museum_id
  `;

  const result = await client.query(query, [
    "Louvre Museum",
    "The Louvre is the world's largest art museum and a historic monument in Paris, France. With a permanent collection of over 480,000 works, it is one of the most visited museums in the world.",
    "Art",
    "Mon, Thu, Sat, Sun",     // Louvre is CLOSED on Tuesdays
    museumImageUrl,
    4,     // ← Your location_id for Paris — change this to match your locations table
    17,  // ← manager_id, set if you have one
  ]);

  // If ON CONFLICT fired (already exists), fetch the existing ID
  if (result.rows.length === 0) {
    const existing = await client.query(
      "SELECT museum_id FROM museums WHERE museum_name = 'Louvre Museum'"
    );
    return existing.rows[0]?.museum_id;
  }

  return result.rows[0]?.museum_id;
}

// ─── 5. Insert one artifact into NeonDB ─────────────────────────────────────
async function insertArtifact(client, artifact, cloudinaryUrl, museumId, categoryId) {
  const query = `
    INSERT INTO artifacts 
      (artifact_name, description, creator, time_period, picture_url,
       acquisition_date, origin, museum_id, category_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT DO NOTHING
  `;

  await client.query(query, [
    artifact.artifact_name,
    artifact.description,
    artifact.creator,
    artifact.time_period,
    cloudinaryUrl,
    artifact.acquisition_date,
    artifact.origin,
    museumId,
    categoryId,
  ]);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const client = await pool.connect();
  console.log("✅ Connected to NeonDB");

  try {
    // Step 1: Insert the Louvre museum and get its ID
    const museumId = await insertLouvreMuseum(client);
    console.log(`✅ Louvre museum ready — museum_id: ${museumId}`);

    let successCount = 0;

    // Step 2: Loop through each ARK ID
    for (const arkId of ARK_IDS) {
      console.log(`\n🔍 Fetching ARK: ${arkId}`);

      // Step 3: Fetch the artifact JSON from Louvre
      const data = await fetchArtifact(arkId);
      if (!data) {
        console.log(`⏭️  Skipping ${arkId} — fetch failed`);
        continue;
      }

      // Step 4: Transform into your schema shape
      const artifact = transformArtifact(data);
      console.log(`📋 Artifact: "${artifact.artifact_name}" by ${artifact.creator}`);

      if (!artifact.raw_image_url) {
        console.log(`⚠️  No image found for "${artifact.artifact_name}", inserting with null image`);
      }

      // Step 5: Upload image to Cloudinary
      let cloudinaryUrl = null;
      if (artifact.raw_image_url) {
        console.log(`☁️  Uploading image to Cloudinary...`);
        cloudinaryUrl = await uploadToCloudinary(
          artifact.raw_image_url,
          artifact.artifact_name
        );
        if (cloudinaryUrl) {
          console.log(`✅ Image uploaded: ${cloudinaryUrl}`);
        }
      }

      // Step 6: Insert into NeonDB (category_id = 1 = Art, adjust to your categories table)
      await insertArtifact(client, artifact, cloudinaryUrl, museumId, 1);
      console.log(`💾 Inserted into DB: "${artifact.artifact_name}"`);
      successCount++;
    }

    console.log(`\n🎉 Done! Successfully inserted ${successCount}/${ARK_IDS.length} artifacts.`);

  } catch (err) {
    console.error("❌ Fatal error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();