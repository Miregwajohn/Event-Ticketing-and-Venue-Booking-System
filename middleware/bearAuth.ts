import Jwt  from "jsonwebtoken"
import { NextFunction, Request,Response } from "express";
import dotenv from "dotenv"

dotenv.config()

type DecodedToken = {
  userId: number,
  email: string,
  role: string,
  firstname: string,
  lastname: string,
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}



//we have two function 1. ~ AUTHENTICATION MIDDLEWARE
export const verifyToken=async(token:string,secret:string)=>{
try {
  const decoded=Jwt.verify(token,secret) as DecodedToken
  return decoded;

} catch (error) {
  return null;
}
}


// function 2   AUTHORAZATION  MIDDLEWARE
export const authMiddleware=async(req:Request,res:Response,next:NextFunction,requiredRoles:string)=>{
   const token=req.header("Authorization")
   if(!token){
    res.status(401).json({error:"Authorization header is missing"})
    return;
   }

   const decodedToken=await verifyToken(token,process.env.JWT_SECRET as string)

   if(!decodedToken){
    res.status(401).json({error:"Invalid or expired token"})
    return;
   }

   const role=decodedToken?.role

   if(requiredRoles === "both" && (role === "admin" || role === "user")){
     if (decodedToken) req.user = decodedToken;
     next();
     return;
   } else if(role === requiredRoles){
     if (decodedToken) req.user = decodedToken;
     next();
     return;
   } else {
     res.status(403).json({error:"Forbidden you do not have permission to access this resources"})
     return;
   }
}



//Middleware to check if the user is admin
export const adminRoleAuth=async(req:Request,res:Response,next:NextFunction)=>await authMiddleware(req,res,next,"admin")
export  const userRoleAuth=async(req:Request,res:Response,next:NextFunction)=>await authMiddleware(req,res,next,"user")
export  const bothRoleAuth=async(req:Request,res:Response,next:NextFunction)=>await authMiddleware(req,res,next,"both")