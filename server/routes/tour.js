const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

const getUserId = (req) => req.user?.id || req.user;

const ensureManager = (req, res) => {
	if (req.user?.role && req.user.role !== "manager") {
		res.status(403).json("Only Manager Authorized");
		return false;
	}
	return true;
};

const getManagerMuseum = async (userId) => {
	const museum = await pool.query(
		`SELECT museum_id, museum_name, picture_url, open_days
		 FROM museums
		 WHERE manager_id = $1
		 ORDER BY museum_id ASC
		 LIMIT 1`,
		[userId]
	);
	return museum.rows[0] || null;
};

const parseOpenDays = (openDaysRaw) => {
	const text = String(openDaysRaw || "").toLowerCase();
	const map = {
		sun: "Sun",
		sunday: "Sun",
		mon: "Mon",
		monday: "Mon",
		tue: "Tue",
		tues: "Tue",
		tuesday: "Tue",
		wed: "Wed",
		wednesday: "Wed",
		thu: "Thu",
		thur: "Thu",
		thurs: "Thu",
		thursday: "Thu",
		fri: "Fri",
		friday: "Fri",
		sat: "Sat",
		saturday: "Sat",
	};

	const matches = text.match(/sun(day)?|mon(day)?|tue(s|sday)?|wed(nesday)?|thu(r|rs|rsday|rsday)?|fri(day)?|sat(urday)?/g) || [];
	const normalized = new Set(matches.map((m) => map[m] || map[m.replace(/day$/, "")]));
	return normalized;
};

const computeStatus = (tourDate, startTime, endTime) => {
	const now = new Date();
	const date = new Date(tourDate);
	const pad = (n) => String(n).padStart(2, "0");
	const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	const nowDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

	if (dateStr > nowDateStr) return "upcoming";
	if (dateStr < nowDateStr) return "expired";
	if (startTime <= nowTime && nowTime < endTime) return "ongoing";
	if (nowTime >= endTime) return "expired";
	return "upcoming";
};

const normalizeSlotColor = (value) => {
	if (value === undefined || value === null || value === "") return 0;
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 0 || parsed > 11) return null;
	return parsed;
};

router.get("/authorize", authorization, async (req, res) => {
	try {
		if (!ensureManager(req, res)) return;

		const userId = getUserId(req);
		const user = await pool.query(
			`SELECT username, avatar_url
			 FROM users
			 WHERE user_id = $1
			 LIMIT 1`,
			[userId]
		);

		res.json({ user: user.rows[0] || null });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get("/overview", authorization, async (req, res) => {
	try {
		if (!ensureManager(req, res)) return;

		const userId = getUserId(req);
		const museum = await getManagerMuseum(userId);
		if (!museum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		const tourRes = await pool.query(
			`SELECT tour_id
			 FROM tours
			 WHERE museum_id = $1
			 LIMIT 1`,
			[museum.museum_id]
		);

		if (tourRes.rows.length === 0) {
			return res.json({
				museum: {
					id: museum.museum_id,
					name: museum.museum_name,
					image: museum.picture_url || "",
					open_days: museum.open_days || "",
				},
				total_created_tours: 0,
				ongoing_tour: null,
				active_tours: [],
			});
		}

		const slotsRes = await pool.query(
			`SELECT
				 ts.time_slot_id,
				 ts.start_time::text AS start_time,
				 ts.end_time::text AS end_time,
				 ts.capacity,
				 COALESCE(ts.total_bookings, 0) AS total_bookings,
				 COALESCE(ts.slot_color, 0) AS slot_color,
				 t.tour_id,
				 t.tour_title,
				 t.price,
				 t.tour_date,
				 COALESCE(bk.bookings_count, 0) AS bookings_count
			 FROM time_slots ts
			 JOIN tours t ON t.tour_id = ts.tour_id
			 LEFT JOIN (
				 SELECT time_slot_id, COUNT(*)::int AS bookings_count
				 FROM bookings
				 GROUP BY time_slot_id
			 ) bk ON bk.time_slot_id = ts.time_slot_id
			 WHERE t.museum_id = $1
			 ORDER BY t.tour_date ASC, ts.start_time ASC`,
			[museum.museum_id]
		);

		const activeTours = [];
		let ongoingTour = null;

		for (const row of slotsRes.rows) {
			const status = computeStatus(row.tour_date, row.start_time, row.end_time);
			if (status === "expired") continue;

			const booked = Math.max(Number(row.total_bookings || 0), Number(row.bookings_count || 0));
			const capacity = Number(row.capacity || 0);
			const seatsRemaining = Math.max(0, capacity - booked);

			const item = {
				time_slot_id: row.time_slot_id,
				tour_id: row.tour_id,
				tour_title: row.tour_title,
				price: Number(row.price),
				tour_date: row.tour_date,
				start_time: row.start_time,
				end_time: row.end_time,
				capacity,
				total_bookings: booked,
				seats_remaining: seatsRemaining,
				slot_color: Number(row.slot_color || 0),
				status,
				capacity_status: booked >= capacity ? "fully booked" : "seats remaining",
			};

			if (!ongoingTour && status === "ongoing") {
				ongoingTour = item;
			}

			activeTours.push(item);
		}

		res.json({
			museum: {
				id: museum.museum_id,
				name: museum.museum_name,
				image: museum.picture_url || "",
				open_days: museum.open_days || "",
			},
			total_created_tours: slotsRes.rows.length,
			ongoing_tour: ongoingTour,
			active_tours: activeTours,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.post("/time-slot", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (!ensureManager(req, res)) return;

		const {
			tour_title,
			price,
			tour_date,
			capacity,
			start_time,
			end_time,
			slot_color,
		} = req.body;

		if (!tour_title || !tour_date || !start_time || !end_time) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		const parsedCapacity = Number(capacity);
		const parsedPrice = Number(price);
		if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
			return res.status(400).json({ error: "Capacity must be a positive number" });
		}
		if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
			return res.status(400).json({ error: "Price must be valid" });
		}
		if (start_time >= end_time) {
			return res.status(400).json({ error: "End time must be after start time" });
		}

		const parsedSlotColor = normalizeSlotColor(slot_color);
		if (parsedSlotColor === null) {
			return res.status(400).json({ error: "slot_color must be an integer between 0 and 11" });
		}

		const userId = getUserId(req);
		const museum = await getManagerMuseum(userId);
		if (!museum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		const openDaysSet = parseOpenDays(museum.open_days);
		if (openDaysSet.size > 0) {
			const day = new Date(tour_date).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
			if (!openDaysSet.has(day)) {
				return res.status(400).json({ error: `Selected date is not within museum open days (${museum.open_days})` });
			}
		}

		await client.query("BEGIN");

			let tourRes = await client.query(
				`SELECT tour_id
				 FROM tours
				 WHERE museum_id = $1
				 AND tour_date = $2
				 ORDER BY tour_id ASC
				 LIMIT 1`,
				[museum.museum_id, tour_date]
			);

		let tourId;
		if (tourRes.rows.length === 0) {
			const inserted = await client.query(
				`INSERT INTO tours (tour_title, price, tour_date, museum_id)
				 VALUES ($1, $2, $3, $4)
				 RETURNING tour_id`,
				[tour_title, parsedPrice, tour_date, museum.museum_id]
			);
			tourId = inserted.rows[0].tour_id;
			} else {
			tourId = tourRes.rows[0].tour_id;
			await client.query(
				`UPDATE tours
				 SET tour_title = $1,
						 price = $2,
							 tour_date = $3
				 WHERE tour_id = $4`,
				[tour_title, parsedPrice, tour_date, tourId]
			);
		}

		const slot = await client.query(
			`INSERT INTO time_slots (start_time, end_time, capacity, total_bookings, slot_color, tour_id)
			 VALUES ($1, $2, $3, 0, $4, $5)
			 RETURNING time_slot_id`,
			[start_time, end_time, parsedCapacity, parsedSlotColor, tourId]
		);

		await client.query("COMMIT");
		res.json({ msg: "Tour time-slot created", time_slot_id: slot.rows[0].time_slot_id, tour_id: tourId });
	} catch (error) {
		await client.query("ROLLBACK");
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});

router.put("/time-slot/:id", authorization, async (req, res) => {
	const client = await pool.connect();
	try {
		if (!ensureManager(req, res)) return;

		const slotId = Number(req.params.id);
		if (!slotId) return res.status(400).json({ error: "Invalid time slot id" });

		const {
			tour_title,
			price,
			tour_date,
			capacity,
			start_time,
			end_time,
			slot_color,
		} = req.body;

		const parsedCapacity = Number(capacity);
		const parsedPrice = Number(price);
		if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
			return res.status(400).json({ error: "Capacity must be a positive number" });
		}
		if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
			return res.status(400).json({ error: "Price must be valid" });
		}
		if (!tour_title || !tour_date || !start_time || !end_time || start_time >= end_time) {
			return res.status(400).json({ error: "Invalid tour information" });
		}

		const parsedSlotColor = normalizeSlotColor(slot_color);
		if (parsedSlotColor === null) {
			return res.status(400).json({ error: "slot_color must be an integer between 0 and 11" });
		}

		const userId = getUserId(req);
		const museum = await getManagerMuseum(userId);
		if (!museum) {
			return res.status(404).json({ error: "No museum assigned to this manager" });
		}

		await client.query("BEGIN");
		const existing = await client.query(
			`SELECT ts.time_slot_id, ts.tour_id
			 FROM time_slots ts
			 JOIN tours t ON t.tour_id = ts.tour_id
			 WHERE ts.time_slot_id = $1 AND t.museum_id = $2
			 LIMIT 1`,
			[slotId, museum.museum_id]
		);

		if (existing.rows.length === 0) {
			await client.query("ROLLBACK");
			return res.status(404).json({ error: "Time slot not found" });
		}

		const currentTourId = existing.rows[0].tour_id;

		const tourByDate = await client.query(
			`SELECT tour_id
			 FROM tours
			 WHERE museum_id = $1
			 AND tour_date = $2
			 ORDER BY tour_id ASC
			 LIMIT 1`,
			[museum.museum_id, tour_date]
		);

		let destinationTourId = currentTourId;
		if (tourByDate.rows.length === 0) {
			const createdTour = await client.query(
				`INSERT INTO tours (tour_title, price, tour_date, museum_id)
				 VALUES ($1, $2, $3, $4)
				 RETURNING tour_id`,
				[tour_title, parsedPrice, tour_date, museum.museum_id]
			);
			destinationTourId = createdTour.rows[0].tour_id;
		} else {
			destinationTourId = tourByDate.rows[0].tour_id;
			await client.query(
				`UPDATE tours
				 SET tour_title = $1, price = $2
				 WHERE tour_id = $3`,
				[tour_title, parsedPrice, destinationTourId]
			);
		}

		await client.query(
			`UPDATE time_slots
			 SET start_time = $1,
					 end_time = $2,
					 capacity = $3,
					 slot_color = $4,
					 tour_id = $5
			 WHERE time_slot_id = $6`,
			[start_time, end_time, parsedCapacity, parsedSlotColor, destinationTourId, slotId]
		);

		await client.query(
			`DELETE FROM tours t
			 WHERE t.tour_id = $1
			 AND t.museum_id = $2
			 AND NOT EXISTS (
				 SELECT 1 FROM time_slots ts WHERE ts.tour_id = t.tour_id
			 )`,
			[currentTourId, museum.museum_id]
		);

		await client.query("COMMIT");
		res.json({ msg: "Tour time-slot updated" });
	} catch (error) {
		await client.query("ROLLBACK");
		res.status(500).json({ error: error.message });
	} finally {
		client.release();
	}
});

router.get("/revenue/:timeSlotId", authorization, async (req, res) => {
	try {
		if (!ensureManager(req, res)) return;

		const slotId = Number(req.params.timeSlotId);
		if (!slotId) return res.status(400).json({ error: "Invalid time slot id" });

		const userId = getUserId(req);
		const row = await pool.query(
			`SELECT
				 ts.time_slot_id,
				 t.price,
				 COALESCE(ts.total_bookings, 0) AS total_bookings,
				 COALESCE(bk.bookings_count, 0) AS bookings_count
			 FROM time_slots ts
			 JOIN tours t ON t.tour_id = ts.tour_id
			 JOIN museums m ON m.museum_id = t.museum_id
			 LEFT JOIN (
				 SELECT time_slot_id, COUNT(*)::int AS bookings_count
				 FROM bookings
				 GROUP BY time_slot_id
			 ) bk ON bk.time_slot_id = ts.time_slot_id
			 WHERE ts.time_slot_id = $1
			 AND m.manager_id = $2
			 LIMIT 1`,
			[slotId, userId]
		);

		if (row.rows.length === 0) {
			return res.status(404).json({ error: "Time slot not found" });
		}

		const slot = row.rows[0];
		const bookings = Math.max(Number(slot.total_bookings || 0), Number(slot.bookings_count || 0));
		const revenue = Number((bookings * Number(slot.price || 0)).toFixed(2));

		res.json({ time_slot_id: slot.time_slot_id, revenue, currency: "USD" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
