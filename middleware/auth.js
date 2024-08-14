const HttpError=require("../models/HttpError")
require("dotenv").config()
const User=require("../models/user")
const jwt=require("jsonwebtoken")
const auth=async(req,res,next)=>{
   
    try{
        if(req.method==="OPTIONS")
        {
            return next()
        }
        // const token=req.headers?.authorization?.split(" ")[1]
        const token = req.cookies.token;
        
        if(!token)
        {
            return next(new HttpError("Token is required",401))
        }
       const decoded= jwt.verify(token,process.env.SECRET_KEY)
       if(!decoded)
       {
        return next(new HttpError("Invalid token",401))
       }
       const user=await User.findOne({_id:decoded.userId})
       if(!user)
       {
        return next(new HttpError("Unauthorized access",406))
       }
       req.user=decoded.userId;
        next()
    }
    catch(err){
        return next(new HttpError("Token Invalid/expired",401))
    }
}

module.exports=auth