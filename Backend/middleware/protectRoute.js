import User from "../Models/user.model.js";
import jwt from "jsonwebtoken";

const protectRoute=async(req,res,next)=>{
   try{
          const token =req.cookies.jwt;
          if(!token)
          {
               return res.status(400).json({error:"internal no token found"})

          }
          const decoded=jwt.verify(token,process.env.JWT_SECRETE)

          if(!decoded)
          {
            return res.status(400).json({error:"Invalid token"})
          }
          const user=await User.findOne({_id:decoded.userId}).select("-password");
          if(!user)
          {
            return res.status(400).json({eror:"User Not found"})
          }
          req.user=user;
          next();
   }
   catch(error){
    console.log('error in  protectRoute')
    res.status(500).json({error:"Internel error"})
   }
}

export default protectRoute;