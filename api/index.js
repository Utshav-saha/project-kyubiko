const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6543;

app.use(cors());
app.use(express.json());

// Vercel rewrite keeps /api prefix; strip it so existing route mounts still work.
if (process.env.VERCEL) {
	app.use((req, _res, next) => {
		if (req.url === '/api') req.url = '/';
		else if (req.url.startsWith('/api/')) req.url = req.url.slice(4);
		next();
	});
}

app.use("/auth", require("../server/routes/auth"));
app.use("/my-museums", require("../server/routes/myMuseums"));
app.use("/search", require("../server/routes/search"));
app.use("/card", require("../server/routes/card"));
app.use("/view", require("../server/routes/view"));
app.use("/explore", require("../server/routes/explore"));
app.use("/museum", require("../server/routes/museum"));
app.use("/leaderboard", require("../server/routes/leaderboard"));
app.use('/profile', require('../server/routes/profile'));
app.use("/landing", require("../server/routes/landing"));
app.use("/manager", require("../server/routes/manager"));
app.use("/quiz", require("../server/routes/quiz"));
app.use("/manager-quiz", require("../server/routes/manager_quiz"));
app.use("/tour", require("../server/routes/tour"));
app.use("/analytics", require("../server/routes/analytics"));

if (!process.env.VERCEL) {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}

module.exports = app;