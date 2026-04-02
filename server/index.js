const express = require('express');
const pool = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6543;

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/my-museums", require("./routes/myMuseums"));
app.use("/search", require("./routes/search"));
app.use("/card", require("./routes/card"));
app.use("/view", require("./routes/view"));
app.use("/explore", require("./routes/explore"));
app.use("/museum", require("./routes/museum"));
app.use("/leaderboard", require("./routes/leaderboard"));
app.use('/profile', require('./routes/profile'));
app.use("/landing", require("./routes/landing"));
app.use("/manager", require("./routes/manager"));
app.use("/quiz", require("./routes/quiz"));
app.use("/manager-quiz", require("./routes/manager_quiz"));
app.use("/tour", require("./routes/tour"));
app.use("/analytics", require("./routes/analytics"));


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});