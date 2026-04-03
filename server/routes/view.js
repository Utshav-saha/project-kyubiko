const router = require("express").Router();
const pool = require("../db"); 
const authorization = require("../middleware/authorization");


// get infos
router.get("/authorize", authorization, async (req, res) => {
    try {

        if(req.user?.role && (req.user.role !== "curator" && req.user.role !== "manager")){
            return res.status(403).json("Only Curator or Manager Authorized");
        }
        const user_id = req.user?.id || req.user;
        let isOwner = false;

        const user = await pool.query(
            `SELECT USERNAME, ROLE , AVATAR_URL
            FROM USERS 
            WHERE USER_ID = $1`, 
            [user_id]
        );

        const miniMuseum = await pool.query(
            `SELECT *
            FROM MINI_MUSEUMS
            WHERE MINI_MUSEUM_ID = $1`,
            [req.query.id]
        );

        if(miniMuseum.rows[0].curator_id === user_id){
            isOwner = true;
        }

        res.json({
            user: user.rows[0], 
            miniMuseum: miniMuseum.rows[0],
            isOwner: isOwner
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});

// get sections and items
router.get("/sections", async (req, res) => {
    try {
        const { mini_museum_id } = req.query; 

        const sections = await pool.query(
        `SELECT 
            'section-' || s.position AS id, 
            s.name,
            COALESCE(
                json_agg(
                    json_build_object(
                        'artifact_id', a.artifact_id,
                        'name', a.artifact_name, 
                        'image', a.picture_url,  
                        'description', a.description,
                        'creator', a.creator,
                        'time_period', a.time_period,
                        'acquisition_date', a.acquisition_date,
                        'origin', a.origin,
                        'category_name', cat.category_name
                    ) 
                ) FILTER (WHERE a.artifact_id IS NOT NULL),
                '[]'::json
            ) AS items
        FROM sections s
        LEFT JOIN artifacts a ON s.artifact_id = a.artifact_id
        LEFT JOIN categories cat ON a.category_id = cat.category_id
        WHERE s.mini_museum_id = $1
        GROUP BY s.name, s.position, s.mini_museum_id
        ORDER BY s.position ASC;`,
        [mini_museum_id]
    );

    res.json(sections.rows);

    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json("Server Error");
    }
});

// Add from wishlist to mini museum
router.post("/add", authorization, async(req, res)=>{

    const client = await pool.connect();
    try {
        const user_id = req.user?.id || req.user;
        if(req.user?.role && req.user.role !== "curator"){
            return res.status(403).json("Only Curator Authorized");
        }
        const { artifact_id, mini_museum_id , section_position , section_name } = req.body;
        await client.query("BEGIN");

        const check = await client.query(
            `SELECT artifact_id
             FROM sections
             WHERE mini_museum_id = $1 AND artifact_id = $2`,
             [mini_museum_id, artifact_id]
         );
            if(check.rows.length > 0){
                await client.query("ROLLBACK");
                return res.status(400).json({ message: "Artifact already exists in the mini museum" });
            }

        const insert = await client.query(
            `INSERT INTO sections (mini_museum_id, name, position, artifact_id)
             VALUES ($1, $2, $3, $4) RETURNING id`, 
             [mini_museum_id, section_name, section_position, artifact_id]
        );

        await client.query(
            `DELETE FROM favorites 
             WHERE user_id = $1 AND artifact_id = $2`, 
             [user_id, artifact_id]
        );

        await client.query("COMMIT");
        res.json({ message: "Artifact added to mini museum "});
         
        
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Database Error:", error.message);
        res.status(500).json("Server Error");
    }
    finally{
        client.release();
    }
});

// Create section 
router.post("/create", authorization, async(req, res)=>{

    const client = await pool.connect();
    try {
        const user_id = req.user?.id || req.user;
        if(req.user?.role && (req.user.role !== "curator" && req.user.role !== "manager")){
            return res.status(403).json("Only Curator or Manager Authorized");
        }

        const { mini_museum_id, section_name } = req.body;
        await client.query("BEGIN");

        const insert = await client.query(
        `INSERT INTO sections (mini_museum_id, name, position)
        VALUES ($1, $2, GET_POSITION($1)) RETURNING id`, 
        [mini_museum_id, section_name]
        );

        await client.query("COMMIT");
        res.json({ message: "Section created"});
         
        
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Database Error:", error.message);
        res.status(500).json("Server Error");
    }
    finally{
        client.release();
    }
});


// rmv section
router.delete("/section", authorization, async (req, res) => {

    const client = await pool.connect();
    try {
        const { mini_museum_id, position } = req.query;
        await client.query("BEGIN");
        await client.query(
            `DELETE 
            FROM sections 
            WHERE mini_museum_id = $1 AND position = $2`,
            [mini_museum_id, position]
        );
        await client.query("COMMIT");
        res.json({ message: "Section deleted" });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error.message);
        res.status(500).json("Server Error");
    }finally{
        client.release();
    }
});

// rmv artifact from section
router.delete("/artifact", authorization, async (req, res) => {

    const client = await pool.connect();
    try {
        const { mini_museum_id, position, artifact_id } = req.query;
        await client.query("BEGIN");
        await client.query(
            `DELETE 
            FROM sections 
            WHERE mini_museum_id = $1 AND position = $2 AND artifact_id = $3`,
            [mini_museum_id, position, artifact_id]
        );
        await client.query("COMMIT");
        res.json({ message: "Artifact removed" });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error.message);
        res.status(500).json("Server Error");
    }
    finally{
        client.release();
    }
});


router.get("/wishlist", authorization, async(req, res)=>{
    try {
        
        const user_id = req.user?.id || req.user;
        if(req.user?.role && req.user.role !== "curator"){
            return res.status(403).json("Only Curator Authorized");
        }
        
        const wishlist = await pool.query(
            `SELECT a.artifact_id, a.artifact_name, a.picture_url, a.description, a.creator, a.time_period, a.acquisition_date, a.origin, cat.category_name
             FROM favorites f
             JOIN artifacts a ON f.artifact_id = a.artifact_id
             JOIN categories cat ON a.category_id = cat.category_id
             WHERE f.user_id = $1`,
             [user_id]
        );
        res.json(wishlist.rows);
    } catch (error) {
        console.error(error.message);
    }
})
module.exports = router;

// coalesce = NVL , if null then empty json array [] :: json
// filter works on aggregation, section e kono artifact na thakle null na kore empty array dibe (case when er moto)