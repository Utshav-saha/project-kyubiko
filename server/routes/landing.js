const router = require("express").Router();
const pool = require("../db");

// top four artifacts
router.get("/top-artifacts", async (req, res) => {
    try {
        const top = await pool.query(
            `SELECT a.artifact_id, a.artifact_name, a.description, a.creator, a.time_period,
             a.picture_url, a.acquisition_date, a.origin, m.museum_name , c.category_name
             FROM artifacts a
             JOIN museums m ON a.museum_id = m.museum_id
             JOIN categories c on a.category_id = c.category_id
             ORDER BY a.artifact_views DESC
             LIMIT 4`
        );

        res.json(top.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;

