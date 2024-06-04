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

  if ([name, phone, email, password].some((field) => field?.trim() == "")) {
    return next(new ErrorHandler("Please provide all necessary fields", 400));
  }

  // check phone is valid
  if (!isValidPhone(phone)) {
    return next(new ErrorHandler("Invalid Phone Number", 400));
  }

  // check email is valid

  if (!isValidEmail(email)) {
    return next(new ErrorHandler("Invalid email", 400));
  }

  // check password matches the regex
  if (!isValidPassword(password)) {
    return next(
      new ErrorHandler(
        "Password Should contain atleast 8 character in which 1 Uppercase letter , 1 LowerCase letter , 1 Number and 1 Special character",
        400
      )
    );
  }

  if (!isValidLength(name)) {
    return next(
      new ErrorHandler(
        "name should be greater than 3 character and less than 30 character",
        400
      )
    );
  }

  const isExistedUser = await UserModel.findOne({
    where: {
      phone: phone.trim(),
    },
  });

  let user;

  if (isExistedUser) {
    // User exists, update OTP
    user = isExistedUser;
    const otpGenerate = user.generateOtp();
    user.resetOtp = otpGenerate;
    user.resetOtpExpire = Date.now() + 15 * 60 * 1000; // Set OTP expiration time (e.g., 15 minutes)
    await user.save({ validate: false });

    const message = `Your One Time Password is ${otpGenerate}`;

    try {
      await sendEmail({
        email: user.email,
        subject: `One Time Password (OTP)`,
        message,
      });

      return res.status(200).json({
        success: true,
        message: `OTP sent to ${user.email} successfully`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } else {
    // User does not exist, create a new user
    user = await UserModel.create({
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

    const otpGenerate = createdUser.generateOtp();
    createdUser.resetOtp = otpGenerate;
    createdUser.resetOtpExpire = Date.now() + 15 * 60 * 1000; // Set OTP expiration time (e.g., 15 minutes)
    await createdUser.save({ validate: false });

    const message = `Your One Time Password is ${otpGenerate}`;

    try {
      await sendEmail({
        email: user.email,
        subject: `One Time Password (OTP)`,
        message,
      });

      res.status(200).json({
        success: true,
        message: `OTP sent to ${user.email} successfully`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
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
    return next(new ErrorHandler("Invalid Phone or password", 401));
  }

  
  const isPasswordMatched = await user.comparePassword(password);
  
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Phone or password", 401));
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
