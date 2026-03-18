const router = require("express").Router();
const pool = require("../db"); 
const authorization = require("../middleware/authorization");


// get infos and museums
router.get("/", authorization, async (req, res) => {
    try {

        if(req.user.role !== "curator"){
            return res.status(403).json("Only Curator Authorized");
        }
        const user_id = req.user.id; 

        const user = await pool.query(
            `SELECT USERNAME, AVATAR_URL 
            FROM USERS 
            WHERE USER_ID = $1`, 
            [user_id]
        );

        const museums = await pool.query(
            `SELECT * 
            FROM MINI_MUSEUMS WHERE CURATOR_ID = $1`, 
            [user_id]
        );

        res.json({
            user: user.rows[0], 
            museums: museums.rows
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});


// create a new museum
router.post("/", authorization, async (req, res) => {
    try {
        if(req.user.role !== "curator"){
            return res.status(403).json("Only Curator Authorized");
        }
        const { mini_museum_name, description, picture_url } = req.body; 
        const curator_id = req.user.id;

        const newMuseum = await pool.query(
            `INSERT INTO MINI_MUSEUMS (CURATOR_ID, MINI_MUSEUM_NAME, DESCRIPTION, PICTURE_URL)
            VALUES ($1, $2, $3, $4)
            RETURNING *`, 
            [curator_id, mini_museum_name, description, picture_url]
        );
        
        res.json(newMuseum.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;