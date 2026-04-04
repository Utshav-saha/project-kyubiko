const router = require("express").Router();
const pool = require("../db"); 
const authorization = require("../middleware/authorization");

router.post("/view", authorization, async(req, res)=>{

    const client = await pool.connect();

    try {
        const user_id = req.user?.id || req.user;
        const artifact_id = req.body.artifact_id;

        if (!artifact_id) {
            return res.status(400).json({ msg: "artifact_id is required" });
        }

        await client.query("BEGIN");

        // const check = await client.query(
        //     `
        //     SELECT 1 FROM ARTIFACTS_VIEWS
        //     WHERE USER_ID = $1 AND ARTIFACT_ID = $2
        //     `, [user_id, artifact_id]
        // );
        // if(check.rows.length > 0){
        //     await client.query("ROLLBACK");
        //     return res.status(200).json({ msg: "View already recorded" });
        // }

        const add = await client.query(`
            INSERT INTO ARTIFACTS_VIEWS 
            (USER_ID, ARTIFACT_ID, VIEW_TIME)
            VALUES($1, $2, NOW())
            `, [user_id, artifact_id])

        await client.query("COMMIT");
        // console.log("[card/view] inserted", {
        //     user_id,
        //     artifact_id,
        //     rowCount: add.rowCount,
        // });
        res.json({ msg: "artifact viewed" });

    } catch (error) {
        await client.query("ROLLBACK");
        // console.error("[card/view] insert failed", {
        //     user_id: req.user?.id || req.user,
        //     artifact_id: req.body?.artifact_id,
        //     error: error.message,
        // });
        res.status(500).json({ msg: "Could not record artifact view", error: error.message });
    }
    finally{
        client.release();
    }
});

router.post("/fav", authorization, async(req, res)=>{

    const client = await pool.connect();
    try {

        const user_id = req.user?.id || req.user;
        if(req.user?.role && req.user.role !== "curator"){
            return res.status(403).json("Only Curator Authorized");
        }
        const artifact_id = req.body.artifact_id;


        
        await client.query("BEGIN");
            
        const insert = await client.query(
                `INSERT INTO FAVORITES 
                (USER_ID, ARTIFACT_ID) 
                VALUES ($1, $2)`,
                [user_id, artifact_id]
        );
        await client.query("COMMIT");
        res.json({ msg: "Artifact added to favorites" });

        
    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: error.message });
    }
    finally{
        client.release();
    }
});

// Get reviwes , stars and replies 
router.get("/reviews", async(req, res)=>{


    try {

        const artifact_id = req.query.artifact_id;
        const reveiws = await pool.query(
            `SELECT R.REVIEW_ID , R.STARS, R.REVIEW_BODY, R.REVIEW_TIME, R.REPLY_ID, U.USERNAME , U.AVATAR_URL
            FROM REVIEWS R
            JOIN USERS U ON R.USER_ID = U.USER_ID
            WHERE R.ARTIFACT_ID = $1
             ORDER BY R.REVIEW_TIME DESC
             `, [artifact_id]
            
        );

        const nested = build_reviews(reveiws.rows);
        res.json(nested);
        
    } catch (error) {
           res.status(500).json({ error: error.message });
    }
});

// add review
router.post("/add_review", authorization, async(req, res)=>{
    const client = await pool.connect();
    try {

        const user_id = req.user?.id || req.user;
        const artifact_id = req.body.artifact_id;

        await client.query("BEGIN");
        const insert = await client.query(
            `INSERT INTO REVIEWS
            (STARS, REVIEW_BODY, REVIEW_TIME , USER_ID, ARTIFACT_ID, REPLY_ID)
            VALUES($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)`,
            [req.body.stars, req.body.review_body, user_id, artifact_id, req.body.reply_id || null]
        );
        await client.query("COMMIT");
        res.json({ msg: "Review added successfully" });

        
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Database Error:", error.message);
        res.status(500).json({ error: error.message });
    }
    finally{
        client.release();
    }
});

function build_reviews(reviews){

    const mp = new Map();
    const main_reviews = [];

    reviews.forEach(element => {
        mp.set(element.review_id, {
            ... element, replies: []
        });
    });

    reviews.forEach(element => {

        const current = mp.get(element.review_id);
        if(!current.reply_id){
            main_reviews.push(current);
        } else {
            const parent = mp.get(element.reply_id);
            if(parent){
                parent.replies.push(current);
            }
        }
    });


    return main_reviews;
};


module.exports = router;