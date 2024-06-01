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

  if (isExistedUser) {
    return next(
      new ErrorHandler("user alredy been registered with this phone", 409)
    );
  }

  //   start transaction

  //   const transaction= await sequelize.transaction()

  const user = await UserModel.create({
    name,
    phone,
    email,
    password,
  });

  const createdUser = await UserModel.findByPk(user.id, {
    attributes: {
      exclude: ["password", "resetOtp", "resetOtpExpire"],
    },
    // "resetOtp", "resetOtpExpire"
  });

  if (!createdUser) {
    return next(
      new ErrorHandler("Something went wrong while registering the user", 500)
    );
  }
  const otpGenerate = createdUser.generateOtp();
  console.log(otpGenerate);
  console.log(email);
  createdUser.save({ validate: false });
  const message = `Your One Time Password is ${otpGenerate}`;
  console.log(message);

  try {
    await sendEmail({
      email: user.email,
      subject: `Password Recovery`,
      message,
    });

    //     await transaction.commit()
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
    // res.status(200).json({
    //           success: true,
    //           message: "customer created",
    //           createdUser
    //         });
  } catch (error) {
    //     user.resetOtp = null;
    //     user.resetOtpExpire = null;
    //     // await user.save();
    // //  await transaction.rollback()

    return next(new ErrorHandler(error.message, 500));
  }
});

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

  const accessToken = await user.generateAccessToken();

  const loggedInUser = await UserModel.findByPk(user.id, {
    attributes: {
      exclude: ["password"],
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
  loginUser,
  forgotPassword,
  resetPassword,
};
