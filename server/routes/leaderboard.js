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

router.get("/:id", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "curator") {
			return res.status(403).json("Only Curator Authorized");
		}

		const museumId = req.params.id;

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
			`SELECT
				u.user_id,
				u.username,
				COALESCE(u.avatar_url, '') AS avatar_url,
				MAX(uq.score)::int AS points,
				MIN(COALESCE(uq.completion_time, 999999))::numeric AS completion_time
			 FROM quizzes q
			 JOIN user_quiz uq ON uq.quiz_id = q.quiz_id
			 JOIN users u ON u.user_id = uq.user_id
			 WHERE q.museum_id = $1
			 GROUP BY u.user_id, u.username, u.avatar_url`,
			[museumId]
		);

		const realEntries = scoreRes.rows
			.map((row) => ({
				user_id: row.user_id,
				username: row.username,
				avatar_url: row.avatar_url,
				points: Number(row.points) || 0,
				completion_time: Number(row.completion_time) || 999999,
			}))
			.sort((a, b) => {
				if (b.points !== a.points) return b.points - a.points;
				if (a.completion_time !== b.completion_time) return a.completion_time - b.completion_time;
				return a.username.localeCompare(b.username);
			});

		const leaderboard = [...realEntries];
		let serial = leaderboard.length + 1;

		while (leaderboard.length < 100) {
			leaderboard.push({
				user_id: -serial,
				username: `Curator ${serial}`,
				avatar_url: "",
				points: Math.max(5, 500 - serial * 4),
				completion_time: 999999,
			});
			serial += 1;
		}

		const topHundred = leaderboard.slice(0, 100);
		const ranked = [];
		let currentRank = 1;

		topHundred.forEach((entry, index) => {
			if (index > 0) {
				const prev = topHundred[index - 1];
				if (entry.points !== prev.points) {
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
