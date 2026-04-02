const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

const getUserIdFromReq = (req) => req.user?.id || req.user;

const ensureManager = async (req) => {
    if (req.user?.role) {
        return req.user.role === "manager";
    }

    const user_id = getUserIdFromReq(req);
    if (!user_id) return false;

    const roleRes = await pool.query(
        `SELECT role FROM users WHERE user_id = $1 LIMIT 1`,
        [user_id]
    );

    return roleRes.rows[0]?.role === "manager";
};


router.get("/museum/distribution", authorization, async (req, res) => {
    try {
        const isManager = await ensureManager(req);
        if(!isManager){
            return res.status(403).json("Only Manager Authorized");
        }

        const user_id = getUserIdFromReq(req);

        const museumRes = await pool.query(`
            SELECT museum_id 
            FROM museums 
            WHERE manager_id = $1`, [user_id]);
        if (museumRes.rows.length === 0) return res.json([]);

        const museumId = museumRes.rows[0].museum_id;

        // :: integer na dile string return kore
        const distribution = await pool.query(
            `SELECT 
                c.category_name as name, 
                COUNT(a.artifact_id)::INTEGER as value
             FROM artifacts a
             JOIN categories c ON a.category_id = c.category_id
             WHERE a.museum_id = $1
             GROUP BY c.category_name`,
            [museumId]
        );

        res.json(distribution.rows);
    } catch (error) {
        console.error(" Error:", error.message);
        res.status(500).json("Server Error");
    }
});


router.get("/museum/engagement", authorization, async (req, res) => {
    try {
        const isManager = await ensureManager(req);
        if(!isManager){
            return res.status(403).json("Only Manager Authorized");
        }

        const user_id = getUserIdFromReq(req);

        const museumRes = await pool.query(`
            SELECT museum_id 
            FROM museums 
            WHERE manager_id = $1`, [user_id]);
        if (museumRes.rows.length === 0) return res.json([]);

        const museumId = museumRes.rows[0].museum_id;

        // last 30 days of stats
        const engagement = await pool.query(
            `SELECT 
                TO_CHAR(stat_date, 'Mon DD') as date,
                COALESCE(daily_views, 0) as new_views,
                COALESCE(daily_additions, 0) as new_inclusions,
                COALESCE(daily_bookings, 0) as new_bookings
             FROM museum_daily_stats
             WHERE museum_id = $1
             ORDER BY stat_date ASC
             LIMIT 30`,
            [museumId]
        );

        res.json(engagement.rows);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;