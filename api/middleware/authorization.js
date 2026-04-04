const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async(req, res, next) =>{
    try {
        
        const token = req.header("token");
        if(!token){
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload.user;
        next();
    } catch (error) {
        console.error(error.message);
        res.status(403).json("Not Authorized");
    }
}