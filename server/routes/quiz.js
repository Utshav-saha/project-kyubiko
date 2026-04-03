const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

const getUserId = (req) => req.user?.id || req.user;
const isAllowedRole = (req) => {
	if (!req.user?.role) return true;
	return req.user.role === "curator" || req.user.role === "manager";
};

router.get("/:quizId/meta", authorization, async (req, res) => {
	try {
		if (!isAllowedRole(req)) {
			return res.status(403).json("Only Curator or Manager Authorized");
		}

		const quizId = req.params.quizId;
		const quizRows = await pool.query(
			`SELECT q.quiz_id, q.quiz_title, q.total_points, q.museum_id,
				m.museum_name, m.picture_url AS museum_image
			 FROM quizzes q
			 JOIN museums m ON q.museum_id = m.museum_id
			 WHERE q.quiz_id = $1
			 LIMIT 1`,
			[quizId]
		);

		if (quizRows.rows.length === 0) {
			return res.status(404).json({ error: "Quiz not found" });
		}

		const quiz = quizRows.rows[0];
		const userId = getUserId(req);

		const attempts = await pool.query(
			`SELECT COALESCE(total_attempts, 0) AS total_attempts
			 FROM user_quiz
			 WHERE user_id = $1 AND quiz_id = $2
			 ORDER BY user_quiz_id DESC
			 LIMIT 1`,
			[userId, quiz.quiz_id]
		);

		const totalAttempts = Number(attempts.rows[0]?.total_attempts || 0);

		res.json({
			quiz_id: quiz.quiz_id,
			quiz_title: quiz.quiz_title,
			total_points: Number(quiz.total_points) || 0,
			museum_id: quiz.museum_id,
			museum_name: quiz.museum_name,
			museum_image: quiz.museum_image || "",
			total_attempts: totalAttempts,
			previous_attempts: totalAttempts,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: error.message });
	}
});

router.get("/museum/:museumId/meta", authorization, async (req, res) => {
	try {
		if (!isAllowedRole(req)) {
			return res.status(403).json("Only Curator or Manager Authorized");
		}

		const museumId = req.params.museumId;
		const quizRows = await pool.query(
			`SELECT q.quiz_id, q.quiz_title, q.total_points, q.museum_id,
				m.museum_name, m.picture_url AS museum_image
				,COUNT(qq.question_id) AS question_count
			 FROM quizzes q
			 JOIN museums m ON q.museum_id = m.museum_id
			 LEFT JOIN questions qq ON qq.quiz_id = q.quiz_id
			 WHERE q.museum_id = $1
			 GROUP BY q.quiz_id, m.museum_id
			 ORDER BY COUNT(qq.question_id) DESC, q.total_points DESC, q.quiz_id ASC
			 LIMIT 1`,
			[museumId]
		);

		if (quizRows.rows.length === 0) {
			return res.status(404).json({ error: "No quiz found for this museum" });
		}

		const quiz = quizRows.rows[0];
		const userId = getUserId(req);

		const attempts = await pool.query(
			`SELECT COALESCE(total_attempts, 0) AS total_attempts
			 FROM user_quiz
			 WHERE user_id = $1 AND quiz_id = $2
			 ORDER BY user_quiz_id DESC
			 LIMIT 1`,
			[userId, quiz.quiz_id]
		);

		const totalAttempts = Number(attempts.rows[0]?.total_attempts || 0);

		res.json({
			quiz_id: quiz.quiz_id,
			quiz_title: quiz.quiz_title,
			total_points: Number(quiz.total_points) || 0,
			museum_id: quiz.museum_id,
			museum_name: quiz.museum_name,
			museum_image: quiz.museum_image || "",
			total_attempts: totalAttempts,
			previous_attempts: totalAttempts,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: error.message });
	}
});

router.get("/:quizId/questions", authorization, async (req, res) => {
	try {
		if (!isAllowedRole(req)) {
			return res.status(403).json("Only Curator or Manager Authorized");
		}

		const quizId = Number(req.params.quizId);
		if (!quizId) {
			return res.status(400).json({ error: "Invalid quiz id" });
		}

		const quizRes = await pool.query(
			`SELECT quiz_id, museum_id, total_points
			 FROM quizzes
			 WHERE quiz_id = $1
			 LIMIT 1`,
			[quizId]
		);

		if (quizRes.rows.length === 0) {
			return res.status(404).json({ error: "Quiz not found" });
		}

		let effectiveQuizId = quizId;
		let effectiveTotalPoints = Number(quizRes.rows[0]?.total_points || 0);
		let hasArtifactLink = false;

		const artifactColumnRes = await pool.query(
			`SELECT EXISTS (
				SELECT 1
				FROM information_schema.columns
				WHERE table_schema = 'public'
				AND table_name = 'questions'
				AND column_name = 'artifact_id'
			) AS has_artifact_id`
		);
		hasArtifactLink = Boolean(artifactColumnRes.rows[0]?.has_artifact_id);
		const getQuestionLimit = () => (effectiveTotalPoints > 0 ? effectiveTotalPoints : 2147483647);

		let questionsRes = await pool.query(
			hasArtifactLink
				? `SELECT q.question_id, q.question_text, q.image_url, q.question_description,
					q.artifact_id,
					a.artifact_name,
					a.picture_url AS artifact_image_url
				 FROM questions q
				 LEFT JOIN artifacts a ON a.artifact_id = q.artifact_id
				 WHERE q.quiz_id = $1
				 ORDER BY RANDOM()
				 LIMIT $2`
				: `SELECT q.question_id, q.question_text, q.image_url, q.question_description,
					NULL::int AS artifact_id,
					NULL::text AS artifact_name,
					NULL::text AS artifact_image_url
				 FROM questions q
				 WHERE q.quiz_id = $1
				 ORDER BY RANDOM()
				 LIMIT $2`,
			[effectiveQuizId, getQuestionLimit()]
		);

		if (questionsRes.rows.length === 0) {
			const fallbackQuizRes = await pool.query(
				`SELECT q.quiz_id, q.total_points
				 FROM quizzes q
				 LEFT JOIN questions qq ON qq.quiz_id = q.quiz_id
				 WHERE q.museum_id = $1
				 GROUP BY q.quiz_id, q.total_points
				 ORDER BY COUNT(qq.question_id) DESC, q.total_points DESC, q.quiz_id ASC
				 LIMIT 1`,
				[quizRes.rows[0].museum_id]
			);

			const fallbackQuizId = Number(fallbackQuizRes.rows[0]?.quiz_id || 0);
			if (fallbackQuizId && fallbackQuizId !== effectiveQuizId) {
				effectiveQuizId = fallbackQuizId;
				effectiveTotalPoints = Number(fallbackQuizRes.rows[0]?.total_points || 0);
				questionsRes = await pool.query(
					hasArtifactLink
						? `SELECT q.question_id, q.question_text, q.image_url, q.question_description,
							q.artifact_id,
							a.artifact_name,
							a.picture_url AS artifact_image_url
						 FROM questions q
						 LEFT JOIN artifacts a ON a.artifact_id = q.artifact_id
						 WHERE q.quiz_id = $1
						 ORDER BY RANDOM()
						 LIMIT $2`
						: `SELECT q.question_id, q.question_text, q.image_url, q.question_description,
							NULL::int AS artifact_id,
							NULL::text AS artifact_name,
							NULL::text AS artifact_image_url
						 FROM questions q
						 WHERE q.quiz_id = $1
						 ORDER BY RANDOM()
						 LIMIT $2`,
					[effectiveQuizId, getQuestionLimit()]
				);
			}
		}

		const questionIds = questionsRes.rows.map((q) => q.question_id);
		if (questionIds.length === 0) {
			return res.json({ quiz_id: effectiveQuizId, questions: [] });
		}

		const optionsRes = await pool.query(
			`SELECT option_id, question_id, option_text, is_correct
			 FROM options
			 WHERE question_id = ANY($1::int[])
			 ORDER BY option_id ASC`,
			[questionIds]
		);

		const optionsByQuestion = optionsRes.rows.reduce((acc, row) => {
			if (!acc[row.question_id]) {
				acc[row.question_id] = {
					list: [],
					seenText: new Set(),
				};
			}

			const normalizedText = String(row.option_text || "").trim().toLowerCase();
			if (!normalizedText) return acc;
			if (acc[row.question_id].seenText.has(normalizedText)) return acc;
			if (acc[row.question_id].list.length >= 4) return acc;

			acc[row.question_id].seenText.add(normalizedText);
			acc[row.question_id].list.push({
				option_id: row.option_id,
				option_text: row.option_text,
				is_correct: row.is_correct,
			});
			return acc;
		}, {});

		const questions = questionsRes.rows.map((q) => ({
			question_id: q.question_id,
			question_text: q.question_text,
			image_url: q.image_url || "",
			artifact_id: q.artifact_id || null,
			artifact_name: q.artifact_name || "",
			artifact_image_url: q.artifact_image_url || "",
			subject_label: q.artifact_id
				? `Artifact #${q.artifact_id}${q.artifact_name ? ` - ${q.artifact_name}` : ""}`
				: "Museum",
			display_image_url: q.artifact_image_url || q.image_url || "",
			question_description: q.question_description || "",
			options: optionsByQuestion[q.question_id]?.list || [],
		}));

		res.json({ quiz_id: effectiveQuizId, total_points: effectiveTotalPoints, questions });
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: error.message });
	}
});

router.post("/:quizId/complete", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (!isAllowedRole(req)) {
			return res.status(403).json("Only Curator or Manager Authorized");
		}

		const quizId = req.params.quizId;
		const userId = getUserId(req);
		const totalPoints = Number(req.body.total_points ?? req.body.score ?? 0);
		const elapsedSeconds = Number(req.body.elapsedSeconds || 0);
		const completionTime = Number(Math.max(0, elapsedSeconds).toFixed(2));

		const pointsColumnRes = await client.query(
			`SELECT column_name
			 FROM information_schema.columns
			 WHERE table_schema = 'public'
			   AND table_name = 'user_quiz'
			   AND column_name IN ('total_points', 'score')`
		);

		const availableColumns = new Set(
			pointsColumnRes.rows.map((row) => String(row.column_name || "").toLowerCase())
		);

		const pointsColumn = availableColumns.has("total_points")
			? "total_points"
			: availableColumns.has("score")
				? "score"
				: null;

		if (!pointsColumn) {
			throw new Error("No points column found in user_quiz");
		}

		await client.query("BEGIN");

		const existing = await client.query(
			`SELECT user_quiz_id,
					COALESCE(total_attempts, 0) AS total_attempts,
					COALESCE(${pointsColumn}, 0) AS saved_points,
					completion_time
			 FROM user_quiz
			 WHERE user_id = $1 AND quiz_id = $2
			 ORDER BY COALESCE(${pointsColumn}, 0) DESC,
					  COALESCE(completion_time, 999999) ASC,
					  user_quiz_id DESC
			 LIMIT 1`,
			[userId, quizId]
		);

		if (existing.rows.length === 0) {
			await client.query(
				`INSERT INTO user_quiz (${pointsColumn}, completion_time, total_attempts, user_id, quiz_id)
				 VALUES ($1, $2, 1, $3, $4)`,
				[totalPoints, completionTime, userId, quizId]
			);
		} else {
			const currentBest = existing.rows[0];
			const savedPoints = Number(currentBest.saved_points) || 0;
			const savedTimeRaw = Number(currentBest.completion_time);
			const savedTime = Number.isFinite(savedTimeRaw) && savedTimeRaw > 0
				? savedTimeRaw
				: Number.MAX_SAFE_INTEGER;
			const candidateTime = completionTime > 0 ? completionTime : Number.MAX_SAFE_INTEGER;

			const isBetterAttempt =
				totalPoints > savedPoints ||
				(totalPoints === savedPoints && candidateTime < savedTime);

			if (isBetterAttempt) {
				await client.query(
					`UPDATE user_quiz
					 SET ${pointsColumn} = $1,
						 completion_time = $2,
						 total_attempts = COALESCE(total_attempts, 0) + 1
					 WHERE user_quiz_id = $3`,
					[totalPoints, completionTime, currentBest.user_quiz_id]
				);
			} else {
				await client.query(
					`UPDATE user_quiz
					 SET total_attempts = COALESCE(total_attempts, 0) + 1
					 WHERE user_quiz_id = $1`,
					[currentBest.user_quiz_id]
				);
			}
		}

		await client.query("COMMIT");
		res.json({ msg: "Quiz attempt processed" });
	} catch (error) {
		await client.query("ROLLBACK");
		console.error(error.message);
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});

module.exports = router;
