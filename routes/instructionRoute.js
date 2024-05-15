const express = require("express")
const router = express.Router()
const {
  createInstruction,
  getInstruction,
  updateInstruction
} = require("../controller/instructionController");

router.route("/create-instruction").post(createInstruction)

router.route("/get-instruction").get(getInstruction)

router.route("/update-instruction").post(updateInstruction)

module.exports = router