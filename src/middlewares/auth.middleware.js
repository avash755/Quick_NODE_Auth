const userModel = require('../db/models/userModel');
const jwt = require('jsonwebtoken');


async function authenticate(req, res, next){
    try{
        const token = req.cookies.token; // get token
        if(!token){ // if token is empty
            return res.status(401).json({
                message: "Unauthorized :-("
            })
        }
        
        /// decode and find the user
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decode.id);
        
        // verify user and match the token version
        if(!user || user.tokenVersion !== decode.tokenVersion){
            return res.status(401).json({
                message: "Session expired"
            })
        }

        req.user = user;
        next();

    }catch(err){
        return res.status(401).json({
            message: "Invalid or expired session"
        })
    }
}


module.exports = authenticate;