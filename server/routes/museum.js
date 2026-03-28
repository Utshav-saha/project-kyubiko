const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

// get user info
router.get("/authorize", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "curator") {
			return res.status(403).json("Only Curator Authorized");
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

// favorites ids for heart state
router.get("/favorites", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "curator") {
			return res.status(403).json("Only Curator Authorized");
		}

		const user_id = req.user?.id || req.user;

		const favorites = await pool.query(
			`SELECT artifact_id
			 FROM favorites
			 WHERE user_id = $1`,
			[user_id]
		);

		res.json(favorites.rows);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// toggle favorite
router.post("/favorite", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (req.user?.role && req.user.role !== "curator") {
			return res.status(403).json("Only Curator Authorized");
		}

		const user_id = req.user?.id || req.user;
		const artifact_id = req.body.artifact_id;

		await client.query("BEGIN");

		const check = await client.query(
			`SELECT favorite_id
			 FROM favorites
			 WHERE user_id = $1 AND artifact_id = $2
			 LIMIT 1`,
			[user_id, artifact_id]
		);

		if (check.rows.length > 0) {
			await client.query(
				`DELETE
				 FROM favorites
				 WHERE user_id = $1 AND artifact_id = $2`,
				[user_id, artifact_id]
			);
			await client.query("COMMIT");
			return res.json({ msg: "Removed from Favorites", added: false });
		}

		await client.query(
			`INSERT INTO favorites (user_id, artifact_id)
			 VALUES ($1, $2)`,
			[user_id, artifact_id]
		);

		await client.query("COMMIT");
		res.json({ msg: "Added to Favorites", added: true });
	} catch (error) {
		await client.query("ROLLBACK");
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});

// museum details by id
router.get("/info/:id", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "curator") {
			return res.status(403).json("Only Curator Authorized");
		}

		const museumId = req.params.id;

		const museum = await pool.query(
			`SELECT
				m.museum_id AS id,
				m.museum_name AS name,
				m.description,
				m.picture_url AS image,
				c.name AS country,
				m.category,
				COALESCE(u.username, 'Unknown') AS creator
			FROM museums m
			JOIN locations l ON m.location_id = l.location_id
			JOIN country c ON l.country_id = c.country_id
			LEFT JOIN users u ON m.manager_id = u.user_id
			WHERE m.museum_id = $1`,
			[museumId]
		);

		if (museum.rows.length === 0) {
			return res.status(404).json({ error: "Museum not found" });
		}

		res.json(museum.rows[0]);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// museum artifact suggestions
router.get("/:id/suggest", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "curator") {
			return res.status(403).json("Only Curator Authorized");
		}

		const museumId = req.params.id;
		const letters = req.query.letters || "";

		const suggestions = await pool.query(
			`SELECT artifact_id, artifact_name, creator, picture_url
			 FROM artifacts
			 WHERE museum_id = $1
			 AND (artifact_name ILIKE $2 OR creator ILIKE $2)
			 LIMIT 5`,
			[museumId, `%${letters}%`]
		);

		res.json(suggestions.rows);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// search artifacts within one museum
router.get("/:id/artifacts", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "curator") {
			return res.status(403).json("Only Curator Authorized");
		}

		const museumId = req.params.id;
		const letters = req.query.letters;
		const order = req.query.order;

		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const offset = (page - 1) * limit;

		const values = [museumId];
		let filters = ` WHERE artifacts.museum_id = $1`;

		if (letters) {
			values.push(`%${letters}%`);
			filters += ` AND (artifact_name ILIKE $${values.length} OR creator ILIKE $${values.length})`;
		}

		let query = `SELECT
			artifacts.artifact_id,
			artifact_name,
			artifacts.description,
			artifacts.creator,
			artifacts.picture_url,
			artifacts.time_period,
			artifacts.acquisition_date,
			artifacts.origin,
			categories.category_name,
			museums.museum_name
			FROM artifacts
			JOIN museums ON artifacts.museum_id = museums.museum_id
			LEFT JOIN categories ON artifacts.category_id = categories.category_id`;

		query += filters;

		if (order) {
			if (order === "newest added") {
				query += " ORDER BY acquisition_date DESC";
			} else if (order === "oldest artefact") {
				query += " ORDER BY acquisition_date ASC";
			} else if (order === "most popular") {
				query += " ORDER BY artifact_views DESC";
			}
		} else {
			query += " ORDER BY artifacts.artifact_id DESC";
		}

		const countQuery = `SELECT COUNT(*) FROM artifacts${filters}`;
		const countRes = await pool.query(countQuery, values);
		const total = parseInt(countRes.rows[0].count);

		query += ` LIMIT ${limit} OFFSET ${offset}`;
		const artifacts = await pool.query(query, values);

		res.json({
			artifacts: artifacts.rows,
			total,
			current: page,
			total_pages: Math.ceil(total / limit),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
