const ErrorHandler = require("../utils/errorHandler");
const UserModel = require("../modal/userModal");
const {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidLength,
} = require("../utils/validation");
const sendEmail = require("../utils/sendEmail");
const asyncHandler = require("../utils/asyncHandler");
// const sendEmail = require("../utils/sendEmail.js")
const jwt = require("jsonwebtoken");
const { sequelize } = require("../database/dbconnection");

// register customer
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, phone, email, password } = req.body;

  // Validate input fields
  if ([name, phone, email, password].some((field) => field?.trim() === "")) {
    return next(new ErrorHandler("Please provide all necessary fields", 400));
  }

  if (!isValidPhone(phone)) {
    return next(new ErrorHandler("Invalid Phone Number", 400));
  }

  if (!isValidEmail(email)) {
    return next(new ErrorHandler("Invalid email", 400));
  }

  if (!isValidPassword(password)) {
    return next(
      new ErrorHandler(
        "Password contain atleast 8 characters,including uppercase,lowercase,number and special character",
        400
      )
    );
  }

  if (!isValidLength(name)) {
    return next(
      new ErrorHandler(
        "Name should be greater than 3 characters and less than 40 characters and should not start with number",
        400
      )
    );
  }

  try {
    // Check if a user with the same phone or email already exists
    const existingUserByPhone = await UserModel.findOne({
      where: { phone: phone.trim() },
    });

    const existingUserByEmail = await UserModel.findOne({
      where: { email: email.trim() },
    });

    // Check if phone already exists
    if (existingUserByPhone) {
      if (existingUserByPhone.isVerified) {
        return next(
          new ErrorHandler("User already exists and is verified", 400)
        );
      }

      // Check if email matches
      if (existingUserByPhone.email !== email) {
        return next(
          new ErrorHandler("Email does not match the existing user", 400)
        );
      }

      // Update OTP for existing user
      const otpGenerate = existingUserByPhone.generateOtp();
      existingUserByPhone.resetOtp = otpGenerate;
      existingUserByPhone.resetOtpExpire = Date.now() + 15 * 60 * 1000; // Set OTP expiration time (e.g., 15 minutes)
      await existingUserByPhone.save({ validate: false });

      const message = `Your One Time Password is ${otpGenerate}`;

      await sendEmail({
        email: existingUserByPhone.email,
        subject: `One Time Password (OTP)`,
        message,
      });

      return res.status(200).json({
        success: true,
        message: `OTP sent to ${existingUserByPhone.email} successfully`,
      });
    }

    // Check if email already exists
    if (existingUserByEmail) {
      // Email exists but phone does not match
      return next(new ErrorHandler("Email already in use", 400));
    }

    // Create a new user if no existing user is found
    const user = await UserModel.create({
      name,
      phone,
      email,
      password,
    });

    const createdUser = await UserModel.findByPk(user.id, {
      attributes: {
        exclude: ["password", "resetOtp", "resetOtpExpire", "isVerified"],
      },
    });

    if (!createdUser) {
      return next(
        new ErrorHandler("Something went wrong while registering the user", 500)
      );
    }
    res.status(200).json({
      success: true,
      message: "user registered successfully",
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return next(
        new ErrorHandler(
          "User already exists with the provided phone or email",
          409
        )
      );
    }
    return next(new ErrorHandler(error.message, 500));
  }
});

// signUp customer
const signUp = asyncHandler(async (req, res, next) => {
  const { phone, otp, termPolicy } = req.body;

  // Validate the termPolicy
  if (typeof termPolicy !== "boolean" || !termPolicy) {
    return res.status(400).json({
      success: false,
      message: "You must agree to the terms and conditions.",
    });
  }

  // Validate the OTP
  if (!otp) {
    return res
      .status(400)
      .json({ success: false, message: "OTP is required." });
  }

  try {
    const user = await UserModel.findOne({ where: { phone } });
    console.log(user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found or invalid details.",
      });
    }

    // Check OTP validity
    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "expired OTP." });
    }

    // Update user details
    user.isVerified = true;
    user.agreePolicy = termPolicy;
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();

    res.status(201).json({
      success: true,
      message: "User data",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
});

// login customer
const loginUser = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return next(new ErrorHandler("Please Enter Phone & Password", 400));
  }

  const user = await UserModel.findOne({
    where: { phone: phone.trim() },
  });

  if (!user) {
    return next(new ErrorHandler("user does not exist", 404));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid password", 401));
  }

  if (!user.isVerified) {
    return next(
      new ErrorHandler("Please verify your OTP before logging in", 403)
    );
  }

  const accessToken = await user.generateAccessToken();

  const loggedInUser = await UserModel.findByPk(user.id, {
    attributes: {
      exclude: ["password", "resetOtp", "resetOtpExpire", "isVerified"],
    },
  });

  return res.status(200).json({
    success: true,
    data: loggedInUser,
    token: accessToken,
  });
});

// forget password
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Validate input fields
  if (!email) {
    return next(new ErrorHandler("Missing email id", 400));
  }

  if (!isValidEmail(email)) {
    return next(new ErrorHandler("Invalid email address", 400));
  }

  try {
    // Find the user by email
    const user = await UserModel.findOne({
      where: {
        email: email.trim(),
      },
    });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Get ResetPassword Token
    const otp = user.generateOtp(); // Assuming you have a method to generate the OTP
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 15 * 60 * 1000; // Set OTP expiration time (e.g., 15 minutes)

    await user.save({ validate: false });

    const message = `Your One Time Password is ${otp}`;

    await sendEmail({
      email: user.email,
      subject: `Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent to ${user.email} successfully`,
      userId: user.id,
    });
  } catch (error) {
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save({ validate: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// reset password
const resetPassword = asyncHandler(async (req, res, next) => {
  const { password, otp } = req.body;
  const userId = req.params.userId;

  // Validate input fields
  if (!password || !otp) {
    return next(
      new ErrorHandler("Missing required fields: password or OTP", 400)
    );
  }

  try {
    // Find the user by ID
    const user = await UserModel.findByPk(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Verify the OTP
    if (user.resetOtp !== otp.trim()) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }
    if (user.resetOtpExpire < Date.now()) {
      return next(new ErrorHandler("expired OTP", 400));
    }

    // Update the user's password and clear OTP fields
    user.password = password;
    user.resetOtp = null;
    user.resetOtpExpire = null;

    await user.save({ validate: true });

    // Exclude password from the response
    const updatedUser = await UserModel.findByPk(user.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    return res.status(200).json({
      success: true,
      message: `Password updated for ${updatedUser.email}`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// send OTP 
const resendOtp = asyncHandler(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return next(new ErrorHandler("Missing phone", 400));
  }

  if (!isValidPhone(phone)) {
    return next(new ErrorHandler("Invalid phone", 400));
  }

  try {
    const user = await UserModel.findOne({
      where: {
        phone: phone.trim(),
      },
    });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const otp = user.generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 15 * 60 * 1000;

    await user.save({ validate: false });

    const message = `Your One Time Password (OTP) is ${otp}`;
    try {
      await sendEmail({
        email: user.email,
        subject: `One-Time Password (OTP) for Verification`,
        message,
      });

      res.status(200).json({
        success: true,
        message: `OTP sent to ${user.email} successfully`,
        email: user.email,
        userId: user.id,
      });
    } catch (emailError) {
      user.resetOtp = null;
      user.resetOtpExpire = null;
      await user.save({ validate: false });

      console.error("Failed to send OTP email:", emailError);
      return next(new ErrorHandler(emailError.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Update user
const updateUser = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  // Validate input fields
  if ([name].some((field) => field?.trim() === "")) {
    return next(new ErrorHandler("Please provide all necessary field", 400));
  }

  if (!isValidLength(name)) {
    return next(
      new ErrorHandler(
        "Name should be greater than 3 characters and less than 40 characters and should not start with number",
        400
      )
    );
  }

  try {
    // Create a new user if no existing user is found
    const [num, [updatedUser]] = await UserModel.update(
      { name },
      {
        where: {
          id: req.user.id,
        },
        returning: true,
      }
    );

    if (num === 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot update user with id=${req.user.id}. Maybe user was not found or req.body is empty!`,
      });
    }
    // Exclude sensitive fields from the updated user object
    const {
      id,
      name: updatedName,
      email,
      phone,
      agreePolicy,
      createdAt,
      updatedAt,
    } = updatedUser;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id,
        name: updatedName,
        email,
        phone,
        agreePolicy,
        createdAt,
        updatedAt,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// delete customer
const deleteUser=asyncHandler(async(req,res,next)=>{
const {phone}=req.body;
try {
  const user = await UserModel.findOne({ where: { phone } });
  console.log(user);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found or invalid details.",
    });
  }
  await user.destroy();
  res.status(200).send({success:true,message:`user with phone ${user.phone} deleted successfully`})
}catch(err){
  return next(new ErrorHandler(err.message, 500));
}

})

module.exports = {
  registerUser,
  updateUser,
  signUp,
  loginUser,
  forgotPassword,
  resetPassword,
  resendOtp,
  deleteUser
};
