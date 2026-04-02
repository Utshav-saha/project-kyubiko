const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

const getManagerMuseum = async (userId) => {
	const museum = await pool.query(
		`SELECT museum_id
		 FROM museums
		 WHERE manager_id = $1
		 ORDER BY museum_id ASC
		 LIMIT 1`,
		[userId]
	);

	return museum.rows[0] || null;
};

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

router.get("/museum", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const user_id = req.user?.id || req.user;
		const managerMuseum = await getManagerMuseum(user_id);

		if (!managerMuseum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		const museum = await pool.query(
			`SELECT
				m.museum_id AS id,
				m.museum_name AS name,
				COALESCE(m.description, '') AS description,
				COALESCE(m.picture_url, '') AS image,
				COALESCE(c.name, 'Unknown') AS country,
				m.category,
				COALESCE(u.username, 'Unknown') AS creator
			 FROM museums m
			 LEFT JOIN locations l ON m.location_id = l.location_id
			 LEFT JOIN country c ON l.country_id = c.country_id
			 LEFT JOIN users u ON m.manager_id = u.user_id
			 WHERE m.museum_id = $1`,
			[managerMuseum.museum_id]
		);

		if (museum.rows.length === 0) {
			return res.status(404).json({ error: "Museum data not found" });
		}

		res.json(museum.rows[0]);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: error.message });
	}
});

router.get("/categories", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const categories = await pool.query(
			`SELECT category_name
			 FROM categories
			 ORDER BY category_name ASC`
		);

		res.json(categories.rows);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get("/artifacts", authorization, async (req, res) => {
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const user_id = req.user?.id || req.user;
		const managerMuseum = await getManagerMuseum(user_id);
		if (!managerMuseum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		const letters = req.query.letters;
		const category = req.query.category;
		const order = req.query.order;

		const values = [managerMuseum.museum_id];
		let filters = ` WHERE a.museum_id = $1`;

		if (letters) {
			values.push(`%${letters}%`);
			filters += ` AND (a.artifact_name ILIKE $${values.length} OR a.creator ILIKE $${values.length})`;
		}

		if (category) {
			values.push(category);
			filters += ` AND c.category_name = $${values.length}`;
		}

		let query = `SELECT
			a.artifact_id,
			a.artifact_name,
			COALESCE(a.description, '') AS description,
			COALESCE(a.creator, '') AS creator,
			COALESCE(a.picture_url, '') AS picture_url,
			COALESCE(a.time_period, '') AS time_period,
			a.acquisition_date,
			COALESCE(a.origin, '') AS origin,
			COALESCE(c.category_name, 'Unknown') AS category_name,
			m.museum_name
			FROM artifacts a
			JOIN museums m ON a.museum_id = m.museum_id
			LEFT JOIN categories c ON a.category_id = c.category_id`;

		query += filters;

		if (order === "newest added") {
			query += " ORDER BY a.acquisition_date DESC";
		} else if (order === "oldest artefact") {
			query += " ORDER BY a.acquisition_date ASC";
		} else if (order === "most popular") {
			query += " ORDER BY a.artifact_views DESC";
		} else {
			query += " ORDER BY a.artifact_id DESC";
		}

		const artifacts = await pool.query(query, values);
		res.json({ artifacts: artifacts.rows });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.put("/artifact/:id", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const user_id = req.user?.id || req.user;
		const managerMuseum = await getManagerMuseum(user_id);
		if (!managerMuseum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		const artifactId = req.params.id;
		const {
			artifact_name,
			description,
			creator,
			time_period,
			origin,
			picture_url,
			category_name,
		} = req.body;

		await client.query("BEGIN");

		const current = await client.query(
			`SELECT artifact_name, description, creator, time_period, origin, picture_url, category_id
			 FROM artifacts
			 WHERE artifact_id = $1
			 AND museum_id = $2
			 LIMIT 1`,
			[artifactId, managerMuseum.museum_id]
		);

		if (current.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Artifact not found for this manager museum" });
		}

		let categoryId = current.rows[0].category_id;
		if (category_name && category_name.trim()) {
			const categoryRes = await client.query(
				`SELECT category_id
				 FROM categories
				 WHERE category_name = $1
				 LIMIT 1`,
				[category_name]
			);
			categoryId = categoryRes.rows[0]?.category_id || current.rows[0].category_id;
		}

		const updated = await client.query(
			`UPDATE artifacts
			 SET artifact_name = $1,
				 description = $2,
				 creator = $3,
				 time_period = $4,
				 origin = $5,
				 picture_url = $6,
				 category_id = $7
			 WHERE artifact_id = $8
			 AND museum_id = $9
			 RETURNING artifact_id`,
			[
				artifact_name ?? current.rows[0].artifact_name,
				description ?? current.rows[0].description,
				creator ?? current.rows[0].creator,
				time_period ?? current.rows[0].time_period,
				origin ?? current.rows[0].origin,
				picture_url ?? current.rows[0].picture_url,
				categoryId,
				artifactId,
				managerMuseum.museum_id,
			]
		);

		if (updated.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Artifact not found for this manager museum" });
		}

		await client.query("COMMIT");
		res.json({ msg: "Artifact updated" });
	} catch (error) {
		await client.query("ROLLBACK");
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});

router.delete("/artifact/:id", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (req.user?.role && req.user.role !== "manager") {
			return res.status(403).json("Only Manager Authorized");
		}

		const user_id = req.user?.id || req.user;
		const managerMuseum = await getManagerMuseum(user_id);
		if (!managerMuseum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		const artifactId = req.params.id;
		await client.query("BEGIN");
		const removed = await client.query(
			`DELETE FROM artifacts
			 WHERE artifact_id = $1
			 AND museum_id = $2
			 RETURNING artifact_id`,
			[artifactId, managerMuseum.museum_id]
		);

		if (removed.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Artifact not found for this manager museum" });
		}

		await client.query("COMMIT");
		res.json({ msg: "Artifact removed" });
	} catch (error) {
		await client.query("ROLLBACK");
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});

module.exports = router;
