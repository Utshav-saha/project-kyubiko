const express = require('express');
const pool = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6543;

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});