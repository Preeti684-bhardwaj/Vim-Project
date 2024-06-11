const express = require("express")
const router = express.Router()
const {
  loginUser,
  signUp,
  registerUser,
  forgotPassword,
  resetPassword,
  resendOtp
} = require("../controller/userController");

router.post("/register",registerUser)
router.post("/signUp", signUp)

router.post("/login",loginUser)

router.post("/password/forgot",forgotPassword)

router.post("/password/reset/:userId",resetPassword)
router.post("/resendOtp",resendOtp)

module.exports = router