const router = require("express").Router();
const pool = require("../db"); 
const authorization = require("../middleware/authorization");

router.post("/view", authorization, async(req, res)=>{

    const client = await pool.connect();

    try {
        const user_id = req.user?.id || req.user;
        const artifact_id = req.body.artifact_id;

        await client.query("BEGIN");

        const check = await client.query(
            `
            SELECT 1 FROM ARTIFACTS_VIEWS
            WHERE USER_ID = $1 AND ARTIFACT_ID = $2
            `, [user_id, artifact_id]
        );
        if(check.rows.length > 0){
            await client.query("ROLLBACK");
            return res.status(200).json({ msg: "View already recorded" });
        }

        const add = await client.query(`
            INSERT INTO ARTIFACTS_VIEWS 
            (USER_ID, ARTIFACT_ID, VIEW_TIME)
            VALUES($1, $2, NOW())
            `, [user_id, artifact_id])
        await client.query("COMMIT");
        res.json({ msg: "artifact viewed" });

    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: error.message });
    }
    finally{
        client.release();
    }
})

module.exports = router;