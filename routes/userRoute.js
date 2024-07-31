const express = require("express")
const router = express.Router()
const {
  loginUser,
  signUp,
  registerCustomer,
  registerUser,
  forgotPassword,
  resetPassword,
  resendOtp,
  getUserById,
  updateUser,
  deleteUser
} = require("../controller/userController");
const { verifyJWt } = require("../middleware/auth");

router.post("/register",registerCustomer)
router.post("/signUp", signUp)

router.post("/login",loginUser)

router.post("/password/forgot",forgotPassword)

router.post("/password/reset/:userId",resetPassword)
router.post("/resendOtp",resendOtp)
router.get("/getById/:id",getUserById)
router.put('/updateUser',verifyJWt,updateUser)
router.delete('/deleteUser',deleteUser)

module.exports = router