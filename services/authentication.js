require('dotenv').config()
const jwt = require('jsonwebtoken');



function authenticateToken(req,res,next){
    // user will give input of key in header section of postman
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(token==null)
    return res.sendStatus(401);
    
    //  if key is given then check with access token
    jwt.verify(token,process.env.ACCESS_TOKEN,(err,response)=>{
        if(err)
        return res.sendStatus(403);
        res.locals = response;
        next()
    })
}

module.exports  = {authenticateToken:authenticateToken};