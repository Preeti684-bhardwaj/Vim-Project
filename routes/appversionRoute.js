const express = require("express")
const router = express.Router()
const {
  createAppVersion,
  getAppVersion,
  updateAppVersion
} = require("../controller/appVersionController");

router.route("/create-version").post(createAppVersion)

router.route("/get-version").get(getAppVersion)

router.route("/update-version").put(updateAppVersion)

module.exports = router