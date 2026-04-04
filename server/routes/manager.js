const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Delete from cloudinary
const delete_clound = async (url) => {
	if (!url || !url.includes("cloudinary.com")) return;
	try {
		// https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg
		// we need "sample" ( publicId) to delete it
		const parts = url.split("/");
		const last_part = parts[parts.length - 1];
		const publicId = last_part.split(".")[0];
		
		await cloudinary.uploader.destroy(publicId);
	} catch (err) {
		console.error("Cloudinary delete error:", err);
	}
};


const get_museum = async (user_id) => {
	const museum = await pool.query(
		`SELECT museum_id
		 FROM museums
		 WHERE manager_id = $1
		 ORDER BY museum_id ASC
		 LIMIT 1`,
		[user_id]
	);

	return museum.rows[0] || null;
};

const parseCoordinate = (value) => {
	if (value === undefined || value === null || value === "") return null;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? null : parsed;
};


router.get("/authorize", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const user_id = req.user?.id || req.user;
		const user = await pool.query(
			`SELECT username, avatar_url
			 FROM users
			 WHERE user_id = $1`,
			[user_id]
		);

		res.json({ user: user.rows[0] || null });
	} catch (error) {
		console.error(error.message);
		res.status(500).json("Server Error");
	}
});

router.get("/museum", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const user_id = req.user?.id || req.user;
		const managerMuseum = await get_museum
	(user_id);

		if (!managerMuseum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		const museum = await pool.query(
			`SELECT
				m.museum_id AS id,
				m.museum_name AS museum_name,
				m.museum_name AS name,
				COALESCE(m.description, '') AS description,
				COALESCE(m.picture_url, '') AS image,
				COALESCE(m.open_days, '') AS open_days,
				COALESCE(l.city, '') AS city,
				l.latitude,
				l.longitude,
				COALESCE(c.name, 'Unknown') AS country,
				m.category,
				COALESCE(u.username, 'Unknown') AS creator
			 FROM museums m
			 LEFT JOIN locations l ON m.location_id = l.location_id
			 LEFT JOIN country c ON l.country_id = c.country_id
			 LEFT JOIN users u ON m.manager_id = u.user_id
			 WHERE m.museum_id = $1`,
			[managerMuseum.museum_id]
		);

		if (museum.rows.length === 0) {
			return res.status(404).json({ error: "Museum data not found" });
		}

		res.json(museum.rows[0]);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: error.message });
	}
});

router.get("/locations-data", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const [citiesRes, countriesRes] = await Promise.all([
			pool.query(
				`SELECT city
				 FROM locations
				 ORDER BY city ASC`
			),
			pool.query(
				`SELECT name AS country
				 FROM country
				 ORDER BY name ASC`
			),
		]);

		res.json({
			cities: citiesRes.rows.map((row) => row.city),
			countries: countriesRes.rows.map((row) => row.country),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get("/categories", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const categories = await pool.query(
			`SELECT category_name
			 FROM categories
			 ORDER BY category_name ASC`
		);

		res.json(categories.rows);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get("/artifacts", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const user_id = req.user?.id || req.user;
		const managerMuseum = await get_museum
	(user_id);
		if (!managerMuseum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		const letters = req.query.letters;
		const category = req.query.category;
		const order = req.query.order;

		const values = [managerMuseum.museum_id];
		let filters = ` WHERE a.museum_id = $1`;

		if (letters) {
			values.push(`%${letters}%`);
			filters += ` AND (a.artifact_name ILIKE $${values.length} OR a.creator ILIKE $${values.length})`;
		}

		if (category) {
			values.push(category);
			filters += ` AND c.category_name = $${values.length}`;
		}

		let query = `SELECT
			a.artifact_id,
			a.artifact_name,
			COALESCE(a.description, '') AS description,
			COALESCE(a.creator, '') AS creator,
			COALESCE(a.picture_url, '') AS picture_url,
			COALESCE(a.time_period, '') AS time_period,
			a.acquisition_date,
			COALESCE(a.origin, '') AS origin,
			COALESCE(c.category_name, 'Unknown') AS category_name,
			m.museum_name
			FROM artifacts a
			JOIN museums m ON a.museum_id = m.museum_id
			LEFT JOIN categories c ON a.category_id = c.category_id`;

		query += filters;

		if (order === "newest added") {
			query += " ORDER BY a.acquisition_date DESC";
		} else if (order === "oldest artefact") {
			query += " ORDER BY a.acquisition_date ASC";
		} else if (order === "most popular") {
			query += " ORDER BY a.artifact_views DESC";
		} else {
			query += " ORDER BY a.artifact_id DESC";
		}

		const artifacts = await pool.query(query, values);
		res.json({ artifacts: artifacts.rows });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.put("/artifact/:id", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const user_id = req.user?.id || req.user;
		const managerMuseum = await get_museum
	(user_id);
		if (!managerMuseum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		const artifactId = req.params.id;
		const {artifact_name,description,creator,time_period,origin,picture_url,category_name,} = req.body;

		await client.query("BEGIN");

		const current = await client.query(
			`SELECT artifact_name, description, creator, time_period, origin, picture_url, category_id
			 FROM artifacts
			 WHERE artifact_id = $1
			 AND museum_id = $2
			 LIMIT 1`,
			[artifactId, managerMuseum.museum_id]
		);

		if (current.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Artifact not found for this manager museum" });
		}

		let categoryId = current.rows[0].category_id;
		if (category_name && category_name.trim()) {
			const categoryRes = await client.query(
				`SELECT category_id
				 FROM categories
				 WHERE category_name = $1
				 LIMIT 1`,
				[category_name]
			);
			categoryId = categoryRes.rows[0]?.category_id || current.rows[0].category_id;
		}

		if (picture_url && picture_url !== current.rows[0].picture_url && current.rows[0].picture_url) {
			await delete_clound(current.rows[0].picture_url);
		}

		const updated = await client.query(
			`UPDATE artifacts
			 SET artifact_name = $1,
				 description = $2,
				 creator = $3,
				 time_period = $4,
				 origin = $5,
				 picture_url = $6,
				 category_id = $7
			 WHERE artifact_id = $8
			 AND museum_id = $9
			 RETURNING artifact_id`,
			[
				artifact_name ?? current.rows[0].artifact_name,
				description ?? current.rows[0].description,
				creator ?? current.rows[0].creator,
				time_period ?? current.rows[0].time_period,
				origin ?? current.rows[0].origin,
				picture_url ?? current.rows[0].picture_url,
				categoryId,
				artifactId,
				managerMuseum.museum_id,
			]
		);

		if (updated.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Artifact not found" });
		}

		await client.query("COMMIT");
		res.json({ msg: "Artifact updated" });
	} catch (error) {
		await client.query("ROLLBACK");
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});

router.delete("/artifact/:id", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const user_id = req.user?.id || req.user;
		const managerMuseum = await get_museum
	(user_id);
		if (!managerMuseum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		const artifactId = req.params.id;
		await client.query("BEGIN");
		const removed = await client.query(
			`DELETE FROM artifacts
			 WHERE artifact_id = $1
			 AND museum_id = $2
			 RETURNING artifact_id , picture_url`,
			[artifactId, managerMuseum.museum_id]
		);

		if (removed.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Artifact not found for this manager museum" });
		}

		if (removed.rows[0].picture_url) {
			await delete_clound(removed.rows[0].picture_url);
		}

		await client.query("COMMIT");
		res.json({ msg: "Artifact removed" });
	} catch (error) {
		await client.query("ROLLBACK");
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});


// add new artifact
router.post("/add", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}
		
		const user_id = req.user?.id || req.user;
		const managerMuseum = await get_museum
	(user_id);
		if (!managerMuseum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}
		
		const {artifact_name,description,creator,time_period,origin,picture_url,category_name} = req.body;

		await client.query("BEGIN");

		let categoryId = null;
		if (category_name && category_name.trim()) {
			const categoryRes = await client.query(
				`SELECT category_id
				 FROM categories
				 WHERE category_name = $1
				 LIMIT 1`,
				[category_name]
			);
			categoryId = categoryRes.rows[0]?.category_id || null;
		}

		const newArtifact = await client.query(
			`INSERT INTO artifacts (artifact_name, description, creator, time_period, origin, picture_url, category_id, museum_id)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			 RETURNING artifact_id`,
			[
				artifact_name,description,creator,time_period,origin,picture_url,categoryId,
				managerMuseum.museum_id
			]
		);

		await client.query("COMMIT");
		res.status(201).json({ msg: "Artifact added", artifactId: newArtifact.rows[0].artifact_id });
	} catch (error) {
		await client.query("ROLLBACK");
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});


// create a museum 
router.post("/create", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const user_id = req.user?.id || req.user;
		const {museum_name,description,picture_url,location_id,category,open_days,city,country,latitude,longitude,} = req.body;

		await client.query("BEGIN");

		const duplicate = await client.query(
			`SELECT museum_id
			 FROM museums
			 WHERE museum_name ilike $1
			 LIMIT 1`,
			[museum_name]
		);

		if (duplicate.rows.length > 0) {
			await client.query("ROLLBACK");
			return res.status(400).json({ error: "Museum already exists" });
		}

		const parsedLat = parseCoordinate(latitude);
		const parsedLon = parseCoordinate(longitude);

		const loc_res = await client.query(
    		`SELECT get_location_id($1, $2, $3, $4, $5) AS location_id`,
    		[location_id || null, city, country, parsedLat, parsedLon]
			);
		const res_loc_id = loc_res.rows[0].location_id;

		if (!res_loc_id) {
			await client.query("ROLLBACK");
			return res.status(400).json({ error: "City and country are required" });
		}

		const newMuseum = await client.query(
			`INSERT INTO museums (museum_name, description, picture_url, location_id, category, open_days, manager_id)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 RETURNING museum_id`,
			[museum_name,description,picture_url,res_loc_id,category,open_days,user_id,]
		);

		// returning na dile abar select kora lagbe

		await client.query("COMMIT");
		res.status(201).json({ msg: "Museum created", museumId: newMuseum.rows[0].museum_id });
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("CREATE MUSEUM ERROR:", error.message);
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});


// edit museum infos
router.put("/edit", authorization, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user?.role && req.user.role !== "manager") {
            return res.status(403).json("Only Manager Authorized");
        }
        
        const user_id = req.user?.id || req.user;
        const managerMuseum = await get_museum(user_id);    
        if (!managerMuseum) {
            return res.status(404).json({ error: "No museum assigned to this manager" });
        }

        const {museum_name,description,picture_url,category,open_days,city,country,latitude,longitude,} = req.body;

        await client.query("BEGIN");

        // current datas
        const current = await client.query(
            `SELECT m.museum_name, m.description, m.picture_url, m.location_id, m.category, m.open_days,
                    COALESCE(l.city, '') AS city,
                    l.latitude,
                    l.longitude,
                    COALESCE(c.name, '') AS country
             FROM museums m
             LEFT JOIN locations l ON m.location_id = l.location_id
             LEFT JOIN country c ON l.country_id = c.country_id
             WHERE museum_id = $1
             AND manager_id = $2
             LIMIT 1`,
            [managerMuseum.museum_id, user_id]
        );

        if (current.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Museum not found for this manager" });
        }

        const country_cng = country !== undefined && country.trim() !== current.rows[0].country;
        const loc_id = country_cng ? null : current.rows[0].location_id;

        const updated_city = city !== undefined ? city : current.rows[0].city;
        const updated_country = country !== undefined ? country : current.rows[0].country;
        
        const updated_lat = latitude !== undefined ? parseCoordinate(latitude) : current.rows[0].latitude;
        const updated_long = longitude !== undefined ? parseCoordinate(longitude) : current.rows[0].longitude;

        const loc_res = await client.query(
            `SELECT get_location_id($1, $2, $3, $4, $5) AS location_id`,
            [loc_id,updated_city,updated_country,updated_lat,updated_long]
        );
        const res_loc_id = loc_res.rows[0].location_id;

        if (!res_loc_id) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "City and country are required" });
        }

        // delete old image if changed
        if (picture_url && picture_url !== current.rows[0].picture_url && current.rows[0].picture_url) {
            await delete_clound(current.rows[0].picture_url);
        }

        // update main museum
        const updated = await client.query(
            `UPDATE museums
             SET museum_name = $1, description = $2, picture_url = $3, location_id = $4, category = $5, open_days = $6 
             WHERE museum_id = $7 AND manager_id = $8
             RETURNING museum_id`,
            [museum_name ?? current.rows[0].museum_name,description ?? current.rows[0].description,picture_url ?? current.rows[0].picture_url,
                res_loc_id, category ?? current.rows[0].category,open_days ?? current.rows[0].open_days,
                managerMuseum.museum_id,user_id]
        );

        if (updated.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Museum not found" });
        }

        await client.query("COMMIT");
        res.json({ msg: "Museum updated" });
    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
