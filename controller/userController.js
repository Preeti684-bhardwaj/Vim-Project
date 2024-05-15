const ErrorHandler = require("../utils/errorHandler");
const UserModel = require("../modal/userModal")
const {isValidEmail,isValidPhone ,isValidPassword, isValidLength} = require("../utils/validation");
const asyncHandler = require("../utils/asyncHandler");
// const sendEmail = require("../utils/sendEmail.js")
const jwt = require("jsonwebtoken")


const registerUser = asyncHandler(async (req, res, next) => {

    const { name, phone , password } = req.body;

    if(
        [name,phone, password].some((field)=> field?.trim() == "")
    ){
        return next(
            new ErrorHandler(
                "Please provide all necessary fields" ,
                 400
            )
        ) 
    }

    // check phone is valid
    if (!isValidPhone(phone)) {
        return next(new ErrorHandler(
            "Invalid Phone Number", 
            400
            )
        )
    }

    // check password matches the regex
    if(!isValidPassword(password)){
        return next(
            new ErrorHandler(
                "Password Should contain atleast 8 character in which 1 Uppercase letter , 1 LowerCase letter , 1 Number and 1 Special character" ,
                400
            ) 
        ) 
    }

    if(!isValidLength(name)){
        return next(
            new ErrorHandler(
                "name should be greater than 3 character and less than 30 character" ,
                400
            ) 
        ) 
    }

    const isExistedUser = await UserModel.findOne({
        where:{
            phone:phone.trim(),
        }
    })

    if(isExistedUser){
        return next(
            new ErrorHandler(
                "user alredy been registered with this phone",
                409
            )
        )
    }
  
    const user = await UserModel.create({
        name,
        password,
        phone
    });

    const createdUser = await UserModel.findByPk(user.id,{
        attributes:{
            exclude: ["password"]
        }
    })

    if(!createdUser){
        return next(
            new ErrorHandler(
                "Something went wrong while registering the user", 
                500
            )
        )
    }

    return res.status(201).json({
        success: true,
        message: "User Register Successfully",
        data: createdUser
    })
})

const loginUser = asyncHandler(async (req , res , next)=>{

    const { phone, password } = req.body;

    if (!phone || !password) {
        return next(
            new ErrorHandler(
                "Please Enter Phone & Password", 
                400
            )
        );
    }

    const user = await UserModel.findOne({
      where: { phone: phone.trim() },
    });

    if(!user){
        return next(
            new ErrorHandler(
                "Invalid Phone or password", 
                401
            )
        )
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(
            new ErrorHandler(
                "Invalid Phone or password",
                 401
            )
        );
    }

    const accessToken = await user.generateAccessToken()

    const loggedInUser = await UserModel.findByPk(user.id , {
        attributes:{
            exclude: ["password"]
        }
    })
    
    return res.status(200).json({
        success: true,
        data:loggedInUser,
        token: accessToken,
      });
    
})

const forgotPassword = asyncHandler(async(req,res,next)=>{
    try {
    const { phone } = req.body

    if(!phone){
        return next(
            new ErrorHandler(
                "phone is missing",
                400
            )
        )
    }

    const user = await UserModel.findOne({
        where:{
            phone: phone.trim()
        }
    })

    if(!user){
        return next(
            new ErrorHandler(
                "user not found",
                404
            )
        )
    }
    return res.status(200).send({"success":true,"message":"valid phone",userID:user.id});
    } catch (error) {
        return next(
            new ErrorHandler(
                "An error occurred",
                error,
                500
            )
        )
    }

})

const resetPassword = asyncHandler(async(req,res,next)=>{

    const { password } = req.body
    const userId = req.params.userId;

    const user = await UserModel.findByPk(userId)

    if(!user){
        return next(
            new ErrorHandler(
                "user not found",
                404
            )
        )
    }

    if(!password){
        return next(
            new ErrorHandler(
                "Password is missing",
                400
            )
        )
    }

    user.password = password

    await user.save({validate: false})

    const loggedInUser = await UserModel.findByPk(user.id , {
        attributes:{
            exclude: ["password"]
        }
    })
    
    return res.status(200).json({
        success: true,
        data:loggedInUser,
      });
     
})





module.exports = { 
    registerUser, 
    loginUser,
    forgotPassword,
    resetPassword
 };