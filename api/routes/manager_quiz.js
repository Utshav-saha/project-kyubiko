const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Delete from cloudinary
const delete_clound = async (url) => {
	if (!url || !url.includes("cloudinary.com")) return;
	try {
		// Example URL: https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg
		// We need "sample" ( publicId) to delete it
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

// authorize
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

// get manager quiz + questions
router.get("/data", authorization, async (req, res) => {
    try {
        if (req.user?.role && req.user.role !== "manager") {
            return res.status(403).json("Only Manager Authorized");
        }

        const user_id = req.user?.id || req.user;
        const museum = await get_museum(user_id);
        if (!museum) {
            return res.status(200).json({ quiz: null, questions: [] });
        }

        const quizRes = await pool.query(
            `SELECT quiz_id, quiz_title, total_points
             FROM quizzes
             WHERE museum_id = $1
             ORDER BY quiz_id DESC
             LIMIT 1`,
            [museum.museum_id]
        );

        if (quizRes.rows.length === 0) {
            return res.status(200).json({ quiz: null, questions: [] });
        }

        const quiz = quizRes.rows[0];
        const questionRows = await pool.query(
            `SELECT
                q.question_id,
                q.question_text,
                COALESCE(q.question_description, '') AS question_description,
                COALESCE(q.image_url, '') AS image_url,
                o.option_id,
                COALESCE(o.option_text, '') AS option_text,
                COALESCE(o.is_correct, false) AS is_correct
             FROM questions q
             LEFT JOIN options o ON q.question_id = o.question_id
             WHERE q.quiz_id = $1
             ORDER BY q.question_id ASC, o.option_id ASC`,
            [quiz.quiz_id]
        );

        // prottek 4 option er sathe same ques - so map 

        const map = new Map();
        for (const row of questionRows.rows) {
            if (!map.has(row.question_id)) {
                map.set(row.question_id, {
                    id: row.question_id,
                    question_text: row.question_text,
                    description: row.question_description,
                    question_description: row.question_description,
                    image_url: row.image_url,
                    options: [],
                    correct_answer: 0,
                });
            }
            if (row.option_id) {
                const q = map.get(row.question_id);
                q.options.push(row.option_text);
                if (row.is_correct) {
                    q.correct_answer = q.options.length - 1;
                }
            }
        }

        // map to array of ques objects
        const questions = Array.from(map.values()).map((q) => ({
            ...q,
            options: [...q.options, "", "", ""].slice(0, 4),
        }));

        res.json({ quiz, questions });
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});

// create quiz 
router.post("/new", authorization, async (req, res) => {

    const client = await pool.connect();
    try {
        if (req.user?.role && req.user.role !== "manager") {
            return res.status(403).json("Only Manager Authorized");
        }

        const user_id = req.user?.id || req.user;
        const museum = await get_museum(user_id);
        const quiz_title = req.body.quiz_title || "New Quiz";
        const total_points = Number(req.body.total_points ?? 10);

        if (!museum) {
            return res.status(400).json("Manager does not have a museum");
        }
        await client.query("BEGIN");
        const new_quiz = await client.query(
            `INSERT INTO quizzes (museum_id, quiz_title, total_points)
             VALUES ($1, $2, $3)
             RETURNING quiz_id`,
            [museum.museum_id, quiz_title, total_points]
        );
        await client.query("COMMIT");

        res.json({ quiz_id: new_quiz.rows[0].quiz_id });
    } catch (error) {
        console.error(error.message);
        await client.query("ROLLBACK");
        res.status(500).json("Server Error");
    } finally {
        await client.release();
    }
});

// edit quiz
router.put("/edit-quiz", authorization, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user?.role && req.user.role !== "manager") {
            return res.status(403).json("Only Manager Authorized");
        }

        const { quiz_id, quiz_title, total_points } = req.body;
        if (!quiz_id || !quiz_title || total_points === undefined) {
            return res.status(400).json("Missing required fields");
        }

        const user_id = req.user?.id || req.user;
        const museum = await get_museum(user_id);
        if (!museum) {
            return res.status(400).json("Manager does not have a museum");
        }

        await client.query("BEGIN");

        const updated = await client.query(
            `UPDATE quizzes
             SET quiz_title = $1,
                 total_points = $2
             WHERE quiz_id = $3
             AND museum_id = $4
             RETURNING quiz_id`,
            [quiz_title, Number(total_points), quiz_id, museum.museum_id]
        );

        if (updated.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json("Quiz not found");
        }

        await client.query("COMMIT");
        res.json({ message: "Quiz updated successfully" });
    } catch (error) {
        console.error(error.message);
        await client.query("ROLLBACK");
        res.status(500).json("Server Error");
    } finally {
        await client.release();
    }
});

// add question 
router.post("/add-question", authorization, async (req, res) => {
    const client = await pool.connect(); 
    
    try {
        if (req.user?.role && req.user.role !== "manager") {
            return res.status(403).json("Only Manager Authorized");
        }
        
        const {quiz_id,question_text,image_url,options,correct_option,description,question_description,} = req.body;
        const final_description = question_description ?? description ?? null;
        if (!quiz_id || !question_text || !options || correct_option === undefined) {
            return res.status(400).json("Missing required fields");
        }

        if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json("Options must contain exactly 4 items");
        }

        const user_id = req.user?.id || req.user;
        const museum = await get_museum(user_id);
        
        if (!museum) {
            return res.status(400).json("Manager does not have a museum");
        }

        let final_image_url = image_url;

        if(!final_image_url){
            const res = await client.query(
                `SELECT picture_url FROM museums WHERE museum_id = $1`,
                [museum.museum_id]
            );
            if(res.rows.length > 0){
                final_image_url = res.rows[0].picture_url;
            }
        }
        

        const new_question = await client.query(
            `CALL create_ques_ops($1, $2, $3, $4, $5, $6, $7)`,
            [quiz_id, question_text, options, correct_option, final_image_url, final_description, null]
        );
        const ques_id = new_question.rows[0].p_question_id;

        res.json({ message: "Question added successfully", question_id: ques_id });
    } catch (error) {
        console.error(error.message);
        await client.query("ROLLBACK"); 
        res.status(500).json("Server Error");
    } finally {
        await client.release(); 
    }
});

// Edit question
router.put("/edit-question", authorization, async (req, res) => {
    
    const client = await pool.connect();    
    try {
        if (req.user?.role && req.user.role !== "manager") {
            return res.status(403).json("Only Manager Authorized");
        }
        
        const {question_id,question_text,image_url,options,correct_option,description,question_description,} = req.body;
        const final_description = question_description ?? description ?? null;
        if (!question_id || !question_text || !options || correct_option === undefined) {
            return res.status(400).json("Missing required fields");
        }
        
        if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json("Options must contain exactly 4 items");
        }

        const user_id = req.user?.id || req.user;
        const museum = await get_museum(user_id);
        if (!museum) {
            return res.status(400).json("Manager does not have a museum");
        }
        
        await client.query("BEGIN");

        const oldImageRes = await client.query(
            `SELECT image_url FROM questions WHERE question_id = $1`, 
            [question_id]
        );
        const oldImage = oldImageRes.rows[0]?.image_url;

        await client.query(
            `UPDATE questions
             SET question_text = $1,
                 image_url = $2,
                 question_description = $3
             WHERE question_id = $4`,
            [question_text, image_url || null, final_description, question_id]
        );

        await client.query(
            `DELETE FROM options WHERE question_id = $1`,
            [question_id]
        );

        if (oldImage && oldImage !== image_url && oldImage.includes('cloudinary.com')) {
            const museumImageRes = await pool.query(`SELECT picture_url 
                FROM museums 
                WHERE museum_id = $1`, [museum.museum_id]);
            if (oldImage !== museumImageRes.rows[0]?.picture_url) {
                await delete_clound(oldImage);
            }
        }

        for(let i = 0; i < options.length; i++) {
            await client.query(
                `INSERT INTO options (question_id, option_text, is_correct)
                 VALUES ($1, $2, $3)`,
                [question_id, options[i], correct_option === i]
            );
        };

        await client.query("COMMIT");
        res.json({ message: "Question updated successfully" });
    }
    catch (error) {
        console.error(error.message);
        await client.query("ROLLBACK");
        return res.status(500).json("Server Error");
    }finally {
        await client.release();
    }
});


// delete question
router.delete("/delete-question/:question_id", authorization, async (req, res) => {
    
    const client = await pool.connect();    
    try {
        if (req.user?.role && req.user.role !== "manager") {
            return res.status(403).json("Only Manager Authorized");
        }
        
        const { question_id } = req.params;
        if (!question_id) {
            return res.status(400).json("Missing question_id");
        }

        const user_id = req.user?.id || req.user;
        const museum = await get_museum(user_id);
        if (!museum) {
            return res.status(400).json("Manager does not have a museum");
        }
        
        await client.query("BEGIN");

        const oldImageRes = await client.query(
            `SELECT image_url FROM questions WHERE question_id = $1`, 
            [question_id]
        );
        const oldImage = oldImageRes.rows[0]?.image_url;


        await client.query(
            `DELETE FROM questions
             WHERE question_id = $1`,
            [question_id]
        );

        if (oldImage && oldImage.includes('cloudinary.com')) {
            const museumImageRes = await pool.query(`SELECT picture_url 
                FROM museums 
                WHERE museum_id = $1`, [museum.museum_id]);
            if (oldImage !== museumImageRes.rows[0]?.picture_url) {
                await delete_clound(oldImage);
            }
        }

        await client.query("COMMIT");
        res.json({ message: "Question deleted successfully" });
    }
    catch (error) {
        console.error(error.message);
        await client.query("ROLLBACK");
        return res.status(500).json("Server Error");
    }finally {
        await client.release();
    }
});
    
module.exports = router;