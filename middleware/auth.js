const User = require("../modal/userModal.js")
const jwt = require("jsonwebtoken")
const ErrorHandler = require("../utils/errorHandler.js")

const verifyJWt = async (req , res , next)=>{
   try {

     let token = req.headers["authorization"]
 
     if(!token){
         return next(
             new ErrorHandler(
                 "Please Login to access this resource",
                 401
             )
         )
     }
 
     token = token.split(" ")[1]
 
     if(!token || token == "null"){
         return next(
             new ErrorHandler(
                 "Please Login to access this resource",
                 401
             )
         )
     }
 
     const decodedToken = jwt.verify(token , process.env.JWT_SECRET)
 
     if(!decodedToken){
         return next(
             new ErrorHandler(
                 "Invalid token or Token is Expired",
                 401
             )
         )
     }
 
     const user = await User.findByPk(decodedToken.id,{
        attributes:{
            exclude: ["password"]
        }
     })

     if(!user){
        return next(
            new ErrorHandler(
                "Invalid Access Token",
                401
            )
        )
     }

     req.user = user
     next()

   } catch (error) {
     return next(
        new ErrorHandler(
            "Invalid Access Token",
            401
        )
     )
   }
}

module.exports = {verifyJWt}