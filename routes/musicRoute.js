
const express = require("express");
const router = express.Router();
const {
  getAllMusic,
  getMusicById,
  uploadMusic,
//   createVideoData,
//   deleteVideoData,
//   updateVideoData,
//   updateVideoShared
} = require("../controller/musicController.js");
const upload = require("../middleware/multer.js")
const {verifyJWt} = require("../middleware/auth.js")


// router.post("/upload/multipleMedia", verifyJWt ,  upload.any() , createVideoData);

router.get("/getAllMusic", verifyJWt ,  getAllMusic);

router.get("/getMusicById/:id" ,  getMusicById);

router.post("/upload/media", verifyJWt ,  upload.fields([{ name: "music" }]), uploadMusic);

// router.put("/updateVideo/:id", verifyJWt , upload.any() , updateVideoData )

// router.delete("/deleteVideo/:id", verifyJWt , deleteVideoData )

// router.put("/update/shared/:id", verifyJWt , updateVideoShared)



module.exports = router;
