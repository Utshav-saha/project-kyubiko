const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

const rankSuffix = (rank) => {
	if (rank % 100 >= 11 && rank % 100 <= 13) return `${rank}th`;
	if (rank % 10 === 1) return `${rank}st`;
	if (rank % 10 === 2) return `${rank}nd`;
	if (rank % 10 === 3) return `${rank}rd`;
	return `${rank}th`;
};

const sortCompletionTime = (value) => {
	const numeric = Number(value);
	if (!Number.isFinite(numeric) || numeric <= 0) return Number.MAX_SAFE_INTEGER;
	return numeric;
};

const normalizeCompletionSeconds = (value) => {
	const numeric = Number(value);
	if (!Number.isFinite(numeric) || numeric <= 0) return null;

	// Backward compatibility for earlier writes that stored minutes instead of seconds.
	if (numeric < 5) return Number((numeric * 60).toFixed(2));

	return numeric;
};

router.get("/:id", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "curator") {
			return res.status(403).json("Only Curator Authorized");
		}

		const museumId = req.params.id;

		const pointsColumnRes = await pool.query(
			`SELECT column_name
			 FROM information_schema.columns
			 WHERE table_schema = 'public'
			   AND table_name = 'user_quiz'
			   AND column_name IN ('total_points', 'score')`
		);

		const availableColumns = new Set(
			pointsColumnRes.rows.map((row) => String(row.column_name || "").toLowerCase())
		);

		const hasTotalPoints = availableColumns.has("total_points");
		const hasScore = availableColumns.has("score");

		if (!hasTotalPoints && !hasScore) {
			return res.status(500).json({ error: "No points column found in user_quiz" });
		}

		const pointsExpr = hasTotalPoints && hasScore
			? "COALESCE(uq.total_points, uq.score, 0)"
			: hasTotalPoints
				? "COALESCE(uq.total_points, 0)"
				: "COALESCE(uq.score, 0)";

		const museumRes = await pool.query(
			`SELECT museum_id, museum_name
			 FROM museums
			 WHERE museum_id = $1`,
			[museumId]
		);

		if (museumRes.rows.length === 0) {
			return res.status(404).json({ error: "Museum not found" });
		}

		const scoreRes = await pool.query(
			`WITH ranked_attempts AS (
				SELECT
					u.user_id,
					u.username,
					COALESCE(u.avatar_url, '') AS avatar_url,
					${pointsExpr}::int AS points,
					uq.completion_time::numeric AS completion_time,
					ROW_NUMBER() OVER (
						PARTITION BY u.user_id
						ORDER BY ${pointsExpr} DESC, COALESCE(uq.completion_time, 999999) ASC, uq.user_quiz_id DESC
					) AS row_rank
				FROM quizzes q
				JOIN user_quiz uq ON uq.quiz_id = q.quiz_id
				JOIN users u ON u.user_id = uq.user_id
				WHERE q.museum_id = $1
			)
			SELECT user_id, username, avatar_url, points, completion_time
			FROM ranked_attempts
			WHERE row_rank = 1`,
			[museumId]
		);

		const realEntries = scoreRes.rows
			.map((row) => ({
				user_id: row.user_id,
				username: row.username,
				avatar_url: row.avatar_url,
				points: Number(row.points) || 0,
				completion_time: normalizeCompletionSeconds(row.completion_time),
			}))
			.sort((a, b) => {
				if (b.points !== a.points) return b.points - a.points;
				if (sortCompletionTime(a.completion_time) !== sortCompletionTime(b.completion_time)) {
					return sortCompletionTime(a.completion_time) - sortCompletionTime(b.completion_time);
				}
				return a.username.localeCompare(b.username);
			});

		const leaderboardSeed = [...realEntries];
		const placeholderStartRank = Math.max(leaderboardSeed.length + 1, 2);

		for (let rankNumber = placeholderStartRank; rankNumber <= 100; rankNumber += 1) {
			leaderboardSeed.push({
				user_id: -rankNumber,
				username: `Curator ${rankNumber}`,
				avatar_url: "",
				points: 0,
				completion_time: rankNumber + 6,
			});
		}

		leaderboardSeed.sort((a, b) => {
			if (b.points !== a.points) return b.points - a.points;
			if (sortCompletionTime(a.completion_time) !== sortCompletionTime(b.completion_time)) {
				return sortCompletionTime(a.completion_time) - sortCompletionTime(b.completion_time);
			}
			return a.username.localeCompare(b.username);
		});

		const topHundred = leaderboardSeed.slice(0, 100);
		const ranked = [];
		let currentRank = 1;

		topHundred.forEach((entry, index) => {
			if (index > 0) {
				const prev = topHundred[index - 1];
				if (
					entry.points !== prev.points ||
					entry.completion_time !== prev.completion_time
				) {
					currentRank = index + 1;
				}
			}

			ranked.push({
				...entry,
				rank: currentRank,
				rank_label: rankSuffix(currentRank),
			});
		});

		res.json({
			museum_id: museumRes.rows[0].museum_id,
			museum_name: museumRes.rows[0].museum_name,
			total_eager_minds_participated: realEntries.length,
			leaderboard: ranked,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
