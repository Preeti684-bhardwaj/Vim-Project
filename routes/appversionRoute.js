const express = require("express")
const router = express.Router()
const { verifyJWt } = require("../middleware/auth");

router.get("/appVersion",(req,res)=>{
const data={
    "app_link_android":"", 
    "app_link_ios":"",
    "message": "",
    "update_type": "FORCE",
    "playstore_app_version": "5.2",
    "app_store_version":"3.3"
  }
  return res.status(200).send({success:true,data})
})

module.exports = router