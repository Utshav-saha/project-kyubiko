const router = require("express").Router();
const pool = require("../db"); 
const authorization = require("../middleware/authorization");

const normalizeRole = (role) =>
    typeof role === "string" ? role.trim().toLowerCase() : "";

const isViewerRole = (req) => {
    if (!req.user?.role) return true;
    const role = normalizeRole(req.user.role);
    return role === "curator" || role === "manager";
};



// get infos
router.get("/authorize", authorization, async (req, res) => {
    try {
        if(!isViewerRole(req)){
            return res.status(403).json("Only Curator or Manager Authorized");
        }
        const user_id = req.user?.id || req.user;

        const user = await pool.query(
            `SELECT USERNAME, AVATAR_URL 
            FROM USERS 
            WHERE USER_ID = $1`, 
            [user_id]
        );

        res.json({
            user: user.rows[0], 
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});


// Show suggestions 
router.get("/suggest", authorization, async (req , res)=>{

    try {
        const letters = req.query.letters;

        // ILIKE = case insensitive 
        const suggestion = await pool.query(
            `SELECT ARTIFACT_NAME , CREATOR , ARTIFACTS.PICTURE_URL
            FROM ARTIFACTS
            WHERE ARTIFACT_NAME ILIKE $1 OR CREATOR ILIKE $2    
            LIMIT 5`
        , [`%${letters}%`, `%${letters}%`]);
            
        res.json(suggestion.rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search for artifacts
router.get("/", authorization, async (req , res)=>{

    try {

        if(!isViewerRole(req)){
            return res.status(403).json("Only Curator or Manager Authorized");
        }
        
        let query = `SELECT ARTIFACTS.ARTIFACT_ID, ARTIFACT_NAME , ARTIFACTS.DESCRIPTION , ARTIFACTS.CREATOR , ARTIFACTS.PICTURE_URL ,
        ARTIFACTS.TIME_PERIOD, ARTIFACTS.ACQUISITION_DATE, ARTIFACTS.ORIGIN, CATEGORIES.CATEGORY_NAME, MUSEUMS.MUSEUM_NAME
                     FROM ARTIFACTS
                     JOIN MUSEUMS ON ARTIFACTS.MUSEUM_ID = MUSEUMS.MUSEUM_ID
                     JOIN CATEGORIES ON ARTIFACTS.CATEGORY_ID = CATEGORIES.CATEGORY_ID`;

        let filters = ' WHERE 1=1';
        let count = 'SELECT COUNT(*) FROM ARTIFACTS';

        const values = [];
        let page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const letters = req.query.letters;

        if (letters) {

            values.push(`%${letters}%`);
            filters += ` AND (ARTIFACT_NAME ILIKE $${values.length} OR CREATOR ILIKE $${values.length})`;
        }

        const museum = req.query.museum;
        if (museum) {
            values.push(museum);
            count += ` JOIN MUSEUMS ON ARTIFACTS.MUSEUM_ID = MUSEUMS.MUSEUM_ID`;
            filters += ` AND MUSEUM_NAME = $${values.length}`;
        }

        const category = req.query.category;
        if (category) {
            values.push(category);
            count += ` JOIN CATEGORIES ON ARTIFACTS.CATEGORY_ID = CATEGORIES.CATEGORY_ID`;
            filters += ` AND CATEGORY_NAME  = $${values.length}`;
        }

        const start = Number(req.query.start);
        const end = Number(req.query.end);
        if (Number.isFinite(start) && Number.isFinite(end)) {
            values.push(start, end);
            filters += ` AND (start_year IS NULL OR start_year >= $${values.length - 1}) AND (end_year IS NULL OR end_year <= $${values.length})`;
        }

        const origin = req.query.origin;
        if (origin) {
            values.push(origin);
            filters += ` AND ORIGIN = $${values.length}`;
            
        }
        

        count += filters;
        let count_res = await pool.query(count, values);
        const total_items = parseInt(count_res.rows[0].count);


        query += filters;

        const order = req.query.order;
        if (order) {
            if(order === "newest added") {
                query += " ORDER BY ACQUISITION_DATE DESC";
            }
            else if(order === "oldest artefact") {
                    query += " ORDER BY ACQUISITION_DATE ASC";
            }

            else if(order === "most popular"){
                query += " ORDER BY ARTIFACT_VIEWS DESC";
            }
        }

        query += ` LIMIT ${limit} OFFSET ${offset}`;


        const search = await pool.query(query, values);
        res.json({

            artifacts : search.rows,
            total : total_items,
            current : page,
            total_pages : Math.ceil(total_items / limit)

        }
        );

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get filters & wishlist items
router.get("/filters", authorization, async (req , res)=>{

    try {
        const user_id = req.user?.id || req.user;

        if(!isViewerRole(req)){
            return res.status(403).json("Only Curator or Manager Authorized");
        }


        let categories = await pool.query(
            `SELECT CATEGORY_NAME
            FROM CATEGORIES`
        );

        let origins = await pool.query(
            `SELECT DISTINCT ORIGIN
            FROM ARTIFACTS`
        );

        let museums = await pool.query(
            `SELECT MUSEUM_NAME
            FROM MUSEUMS`
        );

        let wishlist = await pool.query(
            `SELECT FAVORITES.ARTIFACT_ID, ARTIFACT_NAME , CREATOR , PICTURE_URL
            FROM FAVORITES
            JOIN ARTIFACTS ON FAVORITES.ARTIFACT_ID = ARTIFACTS.ARTIFACT_ID
            WHERE USER_ID = $1
            `, [user_id]
        );

        res.json({ categories: categories.rows, origins: origins.rows, museums: museums.rows, wishlist: wishlist.rows});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});

// Remove from favorites
router.post("/remove", authorization, async(req, res)=>{

        const client = await pool.connect();

    try {
        
        const user_id = req.user?.id || req.user;
        if(!isViewerRole(req)){
            return res.status(403).json("Only Curator or Manager Authorized");
        }

        await client.query("BEGIN");

        const artifact_id = req.body.artifact_id;
        const remove = await client.query(
            `DELETE
            FROM FAVORITES
            WHERE USER_ID = $1 AND ARTIFACT_ID = $2`,
            [user_id, artifact_id]
        );

        await client.query("COMMIT");
        res.json({ msg: "Artifact removed from favorites" });
    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: error.message });
    }
    finally{
        client.release();
    }
})



module.exports = router;