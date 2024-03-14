const { JWT_SECRET } = require("./config");
const jwt = require('jsonwebtoken');

function authMiddleware(req,res,next){
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            message:"User not authenticated"
        });
    }

    const token = authHeader.split(' ')[1];
    try{
        console.log(jwt.verify(token,JWT_SECRET));
        const validUser = jwt.verify(token,JWT_SECRET);
        req.userId = validUser.userId;
        next();
    }
    catch{
        return res.status(411).json({
            message:"User Not authenticated"
        })
    }
}

module.exports = authMiddleware;