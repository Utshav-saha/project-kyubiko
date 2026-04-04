const axios = require('axios');
const pool = require('../../api/db');

const departments = [
    { departmentId: 1, displayName: "American Decorative Arts" },
    { departmentId: 3, displayName: "Ancient West Asian Art" },
    { departmentId: 4, displayName: "Arms and Armor" },
    { departmentId: 5, displayName: "Arts of Africa, Oceania, and the Americas" },
    { departmentId: 6, displayName: "Asian Art" },
    { departmentId: 7, displayName: "The Cloisters" },
    { departmentId: 8, displayName: "The Costume Institute" },
    { departmentId: 9, displayName: "Drawings and Prints" },
    { departmentId: 10, displayName: "Egyptian Art" },
    { departmentId: 11, displayName: "European Paintings" },
    { departmentId: 12, displayName: "European Sculpture and Decorative Arts" },
    { departmentId: 13, displayName: "Greek and Roman Art" },
    { departmentId: 14, displayName: "Islamic Art" },
    { departmentId: 15, displayName: "The Robert Lehman Collection" },
    { departmentId: 16, displayName: "The Libraries" },
    { departmentId: 17, displayName: "Medieval Art" },
    { departmentId: 18, displayName: "Musical Instruments" },
    { departmentId: 19, displayName: "Photographs" },
    { departmentId: 21, displayName: "Modern Art" }
];

async function seedMetArtifacts() {
  let totalInserted = 0;
  const targetTotal = 100;
  
  const itemsPerDept = Math.ceil(targetTotal / departments.length);

  try {
    for (let dept of departments) {
      if (totalInserted >= targetTotal) break;

      console.log(`\nSearching department: ${dept.displayName}...`);
     
      const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=${dept.departmentId}&q=a&hasImages=true`;
      const searchRes = await axios.get(searchUrl);
      
      if (!searchRes.data || !searchRes.data.objectIDs) {
          continue; 
      }

      const objectIds = searchRes.data.objectIDs.slice(0, 30); 
      let deptInsertCount = 0; 

      for (let id of objectIds) {
        if (totalInserted >= targetTotal) break;
        if (deptInsertCount >= itemsPerDept) break; 

        try {
            const artRes = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
            const art = artRes.data;

            if (!art.isPublicDomain || !art.primaryImageSmall || !art.title || (!art.culture && !art.country) || !art.artistDisplayName) continue;

            const artifact_name = art.title.substring(0, 200);
            const description = `${art.medium || ''} - ${art.creditLine || ''}`;
            const creator = art.artistDisplayName ? art.artistDisplayName.substring(0, 150) : 'Unknown';
            const time_period = art.objectDate ? art.objectDate.substring(0, 100) : 'Unknown Period';
            const picture_url = art.primaryImageSmall;
            
            const isValidYear = /^\d{4}$/.test(art.accessionYear);
            const acquisition_date = isValidYear ? `${art.accessionYear}-01-01` : new Date().toISOString().split('T')[0]; 
            
            let origin = art.culture || art.country ;
            origin = origin.substring(0, 100);

            const museum_id = 2; 
            
            const department_string = art.department || dept.displayName;

            const query = `
              INSERT INTO artifacts 
              (artifact_name, description, creator, time_period, picture_url, acquisition_date, origin, museum_id, category_id)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, get_category($9))
            `;
            
            const values = [
              artifact_name, description, creator, time_period, picture_url, 
              acquisition_date, origin, museum_id, department_string
            ];

            await pool.query(query, values);
            totalInserted++;
            deptInsertCount++;
            
            console.log(`[${totalInserted}/${targetTotal}] Added: "${artifact_name}" -> Sent to category logic as: ${department_string}`);
            
            await new Promise(resolve => setTimeout(resolve, 100)); 

        } catch (itemError) {
            console.error(`Error fetching item ${id}:`, itemError.detail || itemError.message);
        }
      }
    }
    
    console.log(`\nFinished! Successfully inserted ${totalInserted}  artifacts into database.`);

  } catch (itemError) {
    console.error(`\nFAILED on item ${id}. Reason:`);
    console.error(itemError); 
}
}

seedMetArtifacts();


// password : met_manager1234 $2b$10$ERCW8cIAYbq9eXVIpBOIjuCGPEduXVEm8IJ5SB.dygl/PPX76qFne