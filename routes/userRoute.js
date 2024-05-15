const express = require("express")
const router = express.Router()
const {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword
} = require("../controller/userController");

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/password/forgot").post(forgotPassword)

router.route("/password/reset/:userId").post(resetPassword)

module.exports = router