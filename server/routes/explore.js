const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

const normalizeRole = (role) =>
	typeof role === "string" ? role.trim().toLowerCase() : "";

const isViewerRole = (req) => {
	if (!req.user?.role) return true;
	const role = normalizeRole(req.user.role);
	return role === "curator" || role === "manager";
};

const getCommunityCategory = (museum) => {
	const text = `${museum.name || ""} ${museum.description || ""}`.toLowerCase();

	if (
		text.includes("art") ||
		text.includes("painting") ||
		text.includes("sculpt")
	) {
		return "Art";
	}

	if (
		text.includes("history") ||
		text.includes("ancient") ||
		text.includes("dynasty") ||
		text.includes("roman") ||
		text.includes("pharaoh")
	) {
		return "History";
	}

	if (
		text.includes("science") ||
		text.includes("machine") ||
		text.includes("industrial") ||
		text.includes("tech")
	) {
		return "Science";
	}

	if (
		text.includes("culture") ||
		text.includes("heritage") ||
		text.includes("tradition")
	) {
		return "Cultural";
	}

	return "Uncategorized";
};

// get infos
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

// archive suggestions
router.get("/archives/suggest", authorization, async (req, res) => {
	try {
		if (!isViewerRole(req)) {
			return res.status(403).json("Only Curator or Manager Authorized");
		}

		const letters = req.query.letters || "";

		const suggestions = await pool.query(
			`SELECT m.museum_id AS id, m.museum_name AS name
			 FROM museums m
			 WHERE m.museum_name ILIKE $1
			 LIMIT 5`,
			[`%${letters}%`]
		);

		res.json(suggestions.rows);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// archives list (actual museums)
router.get("/archives", authorization, async (req, res) => {
	try {
		if (!isViewerRole(req)) {
			return res.status(403).json("Only Curator or Manager Authorized");
		}
		

		const values = [];
		let filters = " WHERE 1=1";

		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 6;
		const offset = (page - 1) * limit;

		const category = req.query.category;
		const country = req.query.country;
		const search = req.query.search;

		if (category && category !== "All") {
			values.push(category);
			filters += ` AND m.category = $${values.length}`;
		}

		if (country && country !== "All") {
			values.push(country);
			filters += ` AND c.name = $${values.length}`;
		}

		if (search) {
			values.push(`%${search}%`);
			filters += ` AND (
				m.museum_name ILIKE $${values.length}
				OR m.description ILIKE $${values.length}
				OR u.username ILIKE $${values.length}
			)`;
		}

		const countQuery = `
			SELECT COUNT(*)
			FROM museums m
			JOIN locations l ON m.location_id = l.location_id
			JOIN country c ON l.country_id = c.country_id
			LEFT JOIN users u ON m.manager_id = u.user_id
			${filters}
		`;

		const dataQuery = `
			SELECT
				m.museum_id AS id,
				m.museum_name AS name,
				m.description,
				m.picture_url AS image,
				l.latitude AS lat,
				l.longitude AS lng,
				c.name AS country,
				m.category,
				COALESCE(u.username, 'Unknown') AS creator
			FROM museums m
			JOIN locations l ON m.location_id = l.location_id
			JOIN country c ON l.country_id = c.country_id
			LEFT JOIN users u ON m.manager_id = u.user_id
			${filters}
			ORDER BY m.museum_id DESC
			LIMIT ${limit} OFFSET ${offset}
		`;

		const countRes = await pool.query(countQuery, values);
		const archivesRes = await pool.query(dataQuery, values);

		const total = parseInt(countRes.rows[0].count);

		res.json({
			museums: archivesRes.rows,
			total,
			current: page,
			total_pages: Math.ceil(total / limit),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// community suggestions
router.get("/community/suggest", authorization, async (req, res) => {
	try {
		if (!isViewerRole(req)) {
			return res.status(403).json("Only Curator or Manager Authorized");
		}

		const letters = req.query.letters || "";

		const suggestions = await pool.query(
			`SELECT mm.mini_museum_id AS id, mm.mini_museum_name AS name
			 FROM mini_museums mm
			 WHERE mm.mini_museum_name ILIKE $1 OR mm.description ILIKE $1
			 LIMIT 5`,
			[`%${letters}%`]
		);

		res.json(suggestions.rows);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// community list (mini museums)
router.get("/community", authorization, async (req, res) => {
	try {
		if (!isViewerRole(req)) {
			return res.status(403).json("Only Curator or Manager Authorized");
		}

		const values = [];
		let filters = " WHERE 1=1";

		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 6;

		const search = req.query.search;
		const category = req.query.category;
		const sort = req.query.sort || "most_liked";

		if (search) {
			values.push(`%${search}%`);
			filters += ` AND (
				mm.mini_museum_name ILIKE $${values.length}
				OR mm.description ILIKE $${values.length}
				OR u.username ILIKE $${values.length}
			)`;
		}

		const communityRes = await pool.query(
			`SELECT
				mm.mini_museum_id AS id,
				mm.mini_museum_name AS name,
				mm.description,
				mm.picture_url AS image,
				mm.likes_count AS likes,
				COALESCE(u.username, 'Unknown') AS creator
			 FROM mini_museums mm
			 LEFT JOIN users u ON mm.curator_id = u.user_id
			 ${filters}`,
			values
		);

		let museums = communityRes.rows.map((museum) => ({
			...museum,
			category: getCommunityCategory(museum),
			createdAt: null,
		}));

		if (category && category !== "All") {
			museums = museums.filter((museum) => museum.category === category);
		}

		if (sort === "most_liked") {
			museums.sort((a, b) => b.likes - a.likes);
		} else if (sort === "recent") {
			museums.sort((a, b) => b.id - a.id);
		} else if (sort === "a_z") {
			museums.sort((a, b) => a.name.localeCompare(b.name));
		}

		const total = museums.length;
		const offset = (page - 1) * limit;
		const paginated = museums.slice(offset, offset + limit);

		res.json({
			museums: paginated,
			total,
			current: page,
			total_pages: Math.ceil(total / limit),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// like community museum
router.post("/community/:id/like", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (req.user?.role && req.user.role !== "curator") {
			return res.status(403).json("Only Curator Authorized");
		}

		const museumId = req.params.id;

		await client.query("BEGIN");

		const liked = await client.query(
			`UPDATE mini_museums
			 SET likes_count = likes_count + 1
			 WHERE mini_museum_id = $1
			 RETURNING likes_count`,
			[museumId]
		);

		if (liked.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Mini museum not found" });
		}

		await client.query("COMMIT");

		res.json({ msg: "Museum liked", likes: liked.rows[0].likes_count });
	} catch (error) {
		await client.query("ROLLBACK");
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});

module.exports = router;
