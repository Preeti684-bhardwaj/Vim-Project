const express = require("express")
const router = express.Router()
const {
  loginUser,
  signUp,
  registerUser,
  forgotPassword,
  resetPassword,
  resendOtp,
  updateUser
} = require("../controller/userController");
const { verifyJWt } = require("../middleware/auth");

router.post("/register",registerUser)
router.post("/signUp", signUp)

router.post("/login",loginUser)

router.post("/password/forgot",forgotPassword)

router.post("/password/reset/:userId",resetPassword)
router.post("/resendOtp",resendOtp)
router.put('/updateUser',verifyJWt,updateUser)

module.exports = router