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
    return next(new ErrorHandler(
      "Password should contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
      400
    ));
  }

  if (!isValidLength(name)) {
    return next(new ErrorHandler(
      "Name should be greater than 3 characters and less than 30 characters",
      400
    ));
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
      // Check if email matches
      if (existingUserByPhone.email !== email) {
        return next(new ErrorHandler("Email does not match the existing user", 400));
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
      return next(new ErrorHandler("Phone number does not match the existing user", 400));
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
      return next(new ErrorHandler("Something went wrong while registering the user", 500));
    }

    const otpGenerate = createdUser.generateOtp();
    createdUser.resetOtp = otpGenerate;
    createdUser.resetOtpExpire = Date.now() + 15 * 60 * 1000; // Set OTP expiration time (e.g., 15 minutes)
    await createdUser.save({ validate: false });

    const message = `Your One Time Password is ${otpGenerate}`;

    await sendEmail({
      email: createdUser.email,
      subject: `One Time Password (OTP)`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent to ${createdUser.email} successfully`,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new ErrorHandler("User already exists with the provided phone or email", 409));
    }
    return next(new ErrorHandler(error.message, 500));
  }
});

// signUp customer
const signUp = asyncHandler(async (req, res, next) => {
  const { phone, otp, termPolicy } = req.body;

  // Validate the termPolicy
  if (typeof termPolicy !== 'boolean' || !termPolicy) {
    return res
      .status(400)
      .json({
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
      return res
        .status(400)
        .json({
          success: false,
          message: "User not found or invalid details.",
        });
    }

    // Check OTP validity
    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if(user.resetOtpExpire < Date.now()){
        return res.status(400).json({ success: false, message: 'expired OTP.' });
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
    return next(new ErrorHandler("Please verify your OTP before logging in", 403));
  }

  const accessToken = await user.generateAccessToken();

  const loggedInUser = await UserModel.findByPk(user.id, {
    attributes: {
      exclude: ["password", "resetOtp", "resetOtpExpire","isVerified"],
    },
  });

  return res.status(200).json({
    success: true,
    data: loggedInUser,
    token: accessToken,
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("missing email id", 400));
  }

  if (!isValidEmail(email)) {
    return next(new ErrorHandler("Invalid email Address", 400));
  }

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
  const otp = user.getResetOtp();

  await user.save();
  const message = `Your One Time Password is ${otp}`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetOtp = null;
    user.resetOtpExpire = null;

    await user.save();

    return next(new ErrorHandler(error.message, 500));
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, password, OTP } = req.body;
  const userId = req.params.userId;

  const user = await UserModel.findByPk(userId);

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  if (!password) {
    return next(new ErrorHandler("Password is missing", 400));
  }

  user.password = password;

  await user.save({ validate: false });

  const loggedInUser = await UserModel.findByPk(user.id, {
    attributes: {
      exclude: ["password"],
    },
  });

  return res.status(200).json({
    success: true,
    data: loggedInUser,
  });
});

module.exports = {
  registerUser,
  signUp,
  loginUser,
  forgotPassword,
  resetPassword,
};
