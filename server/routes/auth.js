const router = require("express").Router();
const pool = require("../db"); 
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");

// Register Route
router.post("/register", async(req, res)=>{

    const client =await pool.connect();
    try {
        const {firstName, lastName, email, pass, role } = req.body;

        const userName = `${firstName}_${lastName}`;

        const user = await pool.query(                  // user = array of rows returned by the query
            `SELECT * 
             FROM USERS 
             WHERE EMAIL = $1 AND ROLE = $2`, 
            [email, role]
        );
        if(user.rows.length !== 0){ 
            return res.status(401).json("User already exists");
        }

        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPass = await bcrypt.hash(pass,salt);

        await client.query("BEGIN");
        const newUser = await client.query(
            `INSERT INTO USERS (USERNAME, EMAIL , PASSWORD, ROLE)
            VALUES
            ($1, $2, $3, $4)
            RETURNING *`, 
            [userName, email, bcryptPass , role]
        );
        await client.query("COMMIT");

        const token = jwtGenerator(newUser.rows[0].user_id, newUser.rows[0].role);
        const username = newUser.rows[0].username;
        const avatar_url = newUser.rows[0].avatar_url;
        res.json({ token, username, avatar_url , role: newUser.rows[0].role});

    } catch (error) {
        console.error(error.message);
        await client.query("ROLLBACK");

        res.status(500).send("Server error");
    }
    finally{
        client.release();
    }
});

//Login Route
router.post("/login", async(req, res)=>{
    try {
        const {email, pass} = req.body;

        const user = await pool.query(
            `SELECT * 
             FROM USERS 
             WHERE EMAIL = $1`, 
            [email]
        );
        if(user.rows.length === 0){ 
            return res.status(401).json("Invalid Email");
        }

        const validity = await bcrypt.compare(pass, user.rows[0].password);
        if(!validity){
            return res.status(401).json("Incorrect Password");
        }

        const token = jwtGenerator(user.rows[0].user_id, user.rows[0].role);
        const username = user.rows[0].username;
        const avatar_url = user.rows[0].avatar_url;
        res.json({ token, username, avatar_url , role: user.rows[0].role});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
