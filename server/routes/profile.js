const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

const isViewerRole = (req) => {
	if (!req.user?.role) return true;
	return req.user.role === "curator" || req.user.role === "manager";
};


router.get("/authorize", authorization, async (req, res) => {
	try {
		if (!isViewerRole(req)) {
			return res.status(403).json("Only Curator or Manager Authorized");
		}
		
		const user_id = req.user?.id || req.user;

		const user = await pool.query(
			`SELECT USERNAME, AVATAR_URL
			 FROM USERS
			 WHERE USER_ID = $1`,
			[user_id]
		);

		res.json({ user: user.rows[0] });
	} catch (error) {
		console.error(error.message);
		res.status(500).json("Server Error");
	}
});

// edit profile pic 
router.post("/avatar", authorization, async (req, res) => {
    try {
        if (!isViewerRole(req)) {
            return res.status(403).json("Only Curator or Manager Authorized");
        }
        const user_id = req.user?.id || req.user;
        const { avatar_url } = req.body;
        
        await pool.query(
            `UPDATE USERS
                SET AVATAR_URL = $1
                WHERE USER_ID = $2`,
                [avatar_url, user_id]
            );  
        res.json({ message: "Avatar updated successfully" });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});

// suggestions
router.get("/suggestions", authorization, async (req, res) => {
	try {
		if (!isViewerRole(req)) {
			return res.status(403).json("Only Curator or Manager Authorized");
		}

		const user_id = req.user?.id || req.user;

		const suggestions = await pool.query(
			`WITH user_history AS (
				SELECT artifact_id
				FROM artifacts_views
				WHERE user_id = $1

				UNION

				SELECT s.artifact_id
				FROM sections s
				JOIN mini_museums mm ON s.mini_museum_id = mm.mini_museum_id
				WHERE mm.curator_id = $1
				  AND s.artifact_id IS NOT NULL
			),
			user_preferences AS (
				SELECT
					a.category_id,
					AVG((a.start_year + a.end_year) / 2.0) AS avg_year,
					COUNT(*) AS category_weight
				FROM user_history uh
				JOIN artifacts a ON uh.artifact_id = a.artifact_id
				WHERE a.start_year IS NOT NULL AND a.end_year IS NOT NULL
				GROUP BY a.category_id
			)
			SELECT
				a.artifact_id,
				a.artifact_name,
				a.description,
				a.creator,
				a.time_period,
				a.acquisition_date,
				a.origin,
				a.category_id,
				c.category_name,
				a.start_year,
				a.end_year,
				a.picture_url,
				m.museum_name,
				ABS(((a.start_year + a.end_year) / 2.0) - up.avg_year) AS era_diff
			FROM artifacts a
			JOIN user_preferences up ON a.category_id = up.category_id
			LEFT JOIN categories c ON a.category_id = c.category_id
			LEFT JOIN museums m ON a.museum_id = m.museum_id
			WHERE a.start_year IS NOT NULL
			  AND a.end_year IS NOT NULL
			  AND NOT EXISTS (
				  SELECT 1
				  FROM sections s
				  JOIN mini_museums mm ON s.mini_museum_id = mm.mini_museum_id
				  WHERE mm.curator_id = $1
					AND s.artifact_id = a.artifact_id

                    UNION
                    SELECT 1
                    FROM FAVORITES f
                    WHERE F.ARTIFACT_ID = a.artifact_id
                    AND f.user_id = $1
			  )
			ORDER BY
				up.category_weight DESC,
				era_diff ASC
			LIMIT 5`,
			[user_id]
		);

		res.json({ suggestions: suggestions.rows });
	} catch (error) {
		console.error(error.message);
		res.status(500).json("Server Error");
	}
});

// achievements
router.get("/achievements", authorization, async (req, res) => {

    try {
        if(req.user?.role && req.user.role !== "curator"){
            return res.status(403).json("Only Curator Authorized");
        }
        const user_id = req.user?.id || req.user;
        const achievements = await pool.query(
            `SELECT a.achievement_title, a.description, a.badge_url
             FROM achievements a
             WHERE a.user_id = $1`,
            [user_id]
        );

        res.json({ achievements: achievements.rows });
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");

    }
});
// museum overview - total mini , total likes , total artifacts 
router.get("/overview", authorization, async (req, res) => {

    try {
        if(req.user?.role && req.user.role !== "curator"){
            return res.status(403).json("Only Curator Authorized");
        }
        const user_id = req.user?.id || req.user;

        const overview = await pool.query(
            `SELECT
                (SELECT COUNT(*) 
                FROM mini_museums 
                WHERE curator_id = $1) AS total_mini_museums,

                (SELECT COUNT(DISTINCT s.artifact_id) 
                FROM sections s 
                JOIN mini_museums mm ON s.mini_museum_id = mm.mini_museum_id 
                WHERE mm.curator_id = $1) AS total_artifacts,

                (SELECT COALESCE(SUM(likes_count), 0) 
                FROM mini_museums 
                WHERE curator_id = $1) AS total_likes`,
            [user_id]
        );

        res.json({ overview: overview.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});

// last 5 quiz results
router.get("/quiz-results", authorization, async (req, res) => {
    try {
        if(req.user?.role && req.user.role !== "curator"){
            return res.status(403).json("Only Curator Authorized");
        }
        const user_id = req.user?.id || req.user;

        const results = await pool.query(
			`SELECT q.quiz_title, uq.score
			 FROM user_quiz uq
			 JOIN quizzes q ON uq.quiz_id = q.quiz_id
			 WHERE uq.user_id = $1
			 ORDER BY uq.user_quiz_id DESC
			 LIMIT 5`,
            [user_id]
        );

		res.json({ results: results.rows.reverse() });
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;