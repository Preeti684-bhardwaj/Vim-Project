const Music = require("../modal/musicModal.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ErrorHandler = require("../utils/errorHandler.js");
const fs = require("fs");
// const {deleteObjectsFromS3,uploadFileToS3} = require("../utils/aws.js")

// CREATING UPLOADMEDIA DATA
// const createVideoData = asyncHandler(async (req, res, next) => {

//   const data = JSON.parse(JSON.stringify(req.body));

//   if(!data.video_id || !data.title || !data.videoSelectedFile || !data.videoData || !data.videoFileUrl){
//     return next(
//       new ErrorHandler(
//         "All field are required",
//         400
//       )
//     )
//   }

//   const isVideoIdExist = await Video.findByPk(data.video_id)

//   if(isVideoIdExist){
//     return next(
//       new ErrorHandler(
//         "Video_id already exist",
//         409
//       )
//     )
//   }

//   const video = await Video.create({
//     ...data,
//     createdById: req.user.id
//   });

//   const videoData = await Video.findByPk(video.video_id)

//   if(!videoData){
//     return next(
//       new ErrorHandler(
//         "Something went wrong while creating the data",
//         500
//       )
//     )
//   }

//   return res.status(201).json({
//     success: true,
//     message: "Video Data Created Successfully",
//     videoData,
//   });
// })

// Define the combination-to-audio map with .wav files
const axisCombinationAudioMap = {
  horizontal_x_negative_vertical_y_negative:
    "horizontal_x_negative_vertical_y_negative.wav",
  horizontal_x_negative_vertical_y_positive:
    "horizontal_x_negative_vertical_y_positive.wav",
  horizontal_x_positive_horizontal_x_negative:
    "horizontal_x_positive_horizontal_x_negative.wav",
  horizontal_x_positive_vertical_y_negative:
    "horizontal_x_positive_vertical_y_negative.wav",
  horizontal_x_positive_vertical_y_positive:
    "horizontal_x_positive_vertical_y_positive.wav",
  vertical_y_positive_vertical_y_negative:
    "vertical_y_positive_vertical_y_negative.wav",
  horizontal_x_positive_45_degree_positive:
    "horizontal_x_positive_45_degree_positive.wav",
  horizontal_x_positive__45_degree_negative:
    "horizontal_x_positive_45_degree_negative.wav",
  horizontal_x_positive__135_degree_positive:
    "horizontal_x_positive_135_degree_positive.wav",
  horizontal_x_positive__135_degree_negative:
    "horizontal_x_positive_135_degree_negative.wav",
  horizontal_x_negative__45_degree_positive:
    "horizontal_x_negative_45_degree_positive.wav",
  horizontal_x_negative__45_degree_negative:
    "horizontal_x_negative_45_degree_negative.wav",
  horizontal_x_negative__135_degree_positive:
    "horizontal_x_negative_135_degree_positive.wav",
  horizontal_x_negative__135_degree_negative:
    "horizontal_x_negative_135_degree_negative.wav",
  vertical_y_positive__45_degree_positive:
    "vertical_y_positive_45_degree_positive.wav",
  vertical_y_positive__45_degree_negative:
    "vertical_y_positive_45_degree_negative.wav",
  vertical_y_positive__135_degree_positive:
    "vertical_y_positive_135_degree_positive.wav",
  vertical_y_positive__135_degree_negative:
    "vertical_y_positive_135_degree_negative.wav",
  vertical_y_negative__45_degree_positive:
    "vertical_y_negative_45_degree_positive.wav",
  vertical_y_negative__45_degree_negative:
    "vertical_y_negative_45_degree_negative.wav",
  vertical_y_negative__135_degree_positive:
    "vertical_y_negative_135_degree_positive.wav",
  vertical_y_negative__135_degree_negative:
    "vertical_y_negative_135_degree_negative.wav",
  _45_degree_positive__45_degree_negative:
    "_45_degree_positive_45_degree_negative.wav",
  _45_degree_positive__135_degree_positive:
    "_45_degree_positive_135_degree_positive.wav",
  _45_degree_positive__135_degree_negative:
    "_45_degree_positive_135_degree_negative.wav",
  _45_degree_negative__135_degree_positive:
    "_45_degree_negative_135_degree_positive.wav",
  _45_degree_negative__135_degree_negative:
    "_45_degree_negative_135_degree_negative.wav",
  _135_degree_positive__135_degree_negative:
    "_135_degree_positive_135_degree_negative",
  // Add other combinations as needed
};

// // Upload audio file
// const uploadMusic = asyncHandler(async (req, res, next) => {
//   // upload mp3 file
//   const audioFilePath = req?.files?.["music"]?.[0]?.filename;
//   console.log(req.files["music"]?.[0])
//   console.log(audioFilePath);
//   if (audioFilePath) {
//     const audioFile = await Music.create({
//       musicUrl: audioFilePath,
//       createdById: req.user.id,
//     });
//     if (!audioFile) {
//       return next(
//         new ErrorHandler("Something went wrong while creating the data", 500)
//       );
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Data Created Successfully",
//       audioFile,
//     });
//   }

//   // upload from req.body
//   const { angle, gyrometer, acceleration, topTwoAxis } = req.body;
//   // console.log(req.files.music[0]);
//   console.log(req.user.id);

// // upload from topTwoAxis===================
//   // Handle topTwoAxis case
//   if (topTwoAxis) {
//     if (!Array.isArray(topTwoAxis) || topTwoAxis.length !== 2) {
//       return next(
//         new ErrorHandler("topTwoAxis must be an array of two strings", 400)
//       );
//     }
//     const axisCombinationKey = topTwoAxis.join("_");
//     const audioFileUrl = axisCombinationAudioMap[axisCombinationKey];
//     console.log(axisCombinationKey);
//     console.log(audioFileUrl);
//     if (!audioFileUrl) {
//       return next(new ErrorHandler("Invalid axis combination", 400));
//     }
//     const musicData = await Music.create({
//       topTwoAxis,
//       musicUrl: audioFileUrl,
//       createdById: req.user.id,
//     });

//     if (!musicData) {
//       return next(
//         new ErrorHandler("Something went wrong while creating the data", 500)
//       );
//     }
//     return res.status(201).json({
//       success: true,
//       message: "Data Created Successfully",
//       musicData,
//     });
//   }

//   // upload from parameters
//   const audio = await Music.create({
//     angle: angle,
//     gyrometer: gyrometer,
//     acceleration: acceleration,
//     createdById: req.user.id,
//   });
//   if (!audio) {
//     return next(
//       new ErrorHandler("Something went wrong while creating the data", 500)
//     );
//   }

//   return res.status(201).json({
//     success: true,
//     message: "Data Created Successfully",
//     audio,
//   });
// });

const uploadMusic = asyncHandler(async (req, res, next) => {
  // If records exist, we will append new data based on the provided input
  const audioFilePath = req?.files?.["music"]?.[0]?.filename;
  console.log(audioFilePath);
  if (audioFilePath) {
    const audioFile = await Music.create({
      musicUrl: audioFilePath,
      createdById: req.user.id,
    });
    if (!audioFile) {
      return next(
        new ErrorHandler("Something went wrong while creating the data", 500)
      );
    }
    // Exclude certain fields from the musicData object
    const filteredaudioFileData = {
      id: audioFile.id,
      musicUrl: audioFile.musicUrl,
      createdById: audioFile.createdById,
      updatedAt: audioFile.updatedAt,
      createdAt: audioFile.createdAt,
    };
    return res.status(201).json({
      success: true,
      message: "Data Created Successfully",
      filteredaudioFileData,
    });
  }

  const { angle, gyrometer, acceleration, topTwoAxis, fileName } = req.body;
  console.log(req.user.id);
  
  // Handle topTwoAxis case
  if (topTwoAxis) {
    if (!Array.isArray(topTwoAxis) || topTwoAxis.length !== 2) {
      return next(
        new ErrorHandler("topTwoAxis must be an array of two strings", 400)
      );
    }
  
    const trimmedTopTwoAxis = topTwoAxis.map(axis => axis.trim());
    const axisCombinationKey = trimmedTopTwoAxis.join("_");
    const reversedAxisCombinationKey = trimmedTopTwoAxis.slice().reverse().join("_");
    
    console.log("axisCombinationKey:", axisCombinationKey);
    console.log("reversedAxisCombinationKey:", reversedAxisCombinationKey);
  
    // Check if the audio file URL exists in the map for either combination
    let audioFileUrl = axisCombinationAudioMap[axisCombinationKey] || axisCombinationAudioMap[reversedAxisCombinationKey];
    if (!audioFileUrl) {
      audioFileUrl = axisCombinationAudioMap[reversedAxisCombinationKey];
    }
  
    if (!audioFileUrl) {
      return next(new ErrorHandler("Invalid axis combination", 400));
    }
  
    try {
      const musicData = await Music.create({
        topTwoAxis: trimmedTopTwoAxis,
        fileName: fileName,
        musicUrl: audioFileUrl,
        createdById: req.user.id,
      });

      if (!musicData) {
        return next(
          new ErrorHandler("Something went wrong while creating the data", 500)
        );
      }

      const filteredMusicData = {
        id: musicData.id,
        topTwoAxis: musicData.topTwoAxis,
        fileName: musicData.fileName,
        musicUrl: musicData.musicUrl,
        createdById: musicData.createdById,
        updatedAt: musicData.updatedAt,
        createdAt: musicData.createdAt,
      };

      return res.status(201).json({
        success: true,
        message: "Data Created Successfully",
        data: filteredMusicData,
      });
    } catch (error) {
      return next(
        new ErrorHandler("Something went wrong while creating the data", 500)
      );
    }
  }

  
  // Upload from parameters
  const audio = await Music.create({
    angle: angle,
    gyrometer: gyrometer,
    acceleration: acceleration,
    fileName: fileName,
    createdById: req.user.id,
  });
  if (!audio) {
    return next(
      new ErrorHandler("Something went wrong while creating the data", 500)
    );
  }
  // Exclude certain fields from the musicData object
  const filteredAudioData = {
    id: audio.id,
    angle: audio.angle,
    gyrometer: audio.gyrometer,
    acceleration: audio.acceleration,
    createdById: audio.createdById,
    updatedAt: audio.updatedAt,
    createdAt: audio.createdAt,
  };

  return res.status(201).json({
    success: true,
    message: "Data Created Successfully",
    filteredAudioData,
  });
});
// get all created Video Data
const getAllMusic = asyncHandler(async (req, res, next) => {
  const musicResult = await Music.findAll({
    where: {
      createdById: req.user.id,
    },
  });

  return res.status(200).json({
    success: true,
    musicResult,
  });
});

// get specific Video by Id
const getMusicById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler("audio_id is Missing", 400));
  }

  const musicData = await Music.findOne({
    where: {
      id: id,
    },
  });

  if (!musicData) {
    return next(new ErrorHandler("Video data not Found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Data Send Successfully",
    data: musicData,
  });
});

// update UploadMultiMedia Data
// const updateVideoData = asyncHandler( async (req, res, next)=>{
//   // take id and check video exist or not
//   // take parameter frm user
//   // validate the field videoSelectedFile , videoData , title
//   // update the data
//   // verify successfully updated or not
//   // successfully updated send respond to user

//   const video = await Video.findOne({
//     where:{
//       video_id: req.params.id,
//       createdById: req.user.id
//     }
//   })

//   if(!video){
//     return next(
//       new ErrorHandler(
//         "Video not found",
//          404
//       )
//     )
//   }

//   const data = JSON.parse(JSON.stringify(req.body))

//   let filterVideoFile = []

//   // unlink all files from local
//   if (
//     video &&
//     video.videoFileUrl &&
//     video?.videoFileUrl.length > 0 &&
//     data?.videoFileUrl &&
//     Array.isArray(data?.videoFileUrl) &&
//     data?.videoFileUrl.length > 0
//   ) {
//     filterVideoFile = video?.videoFileUrl.filter(
//       (videoStr) => !data.videoFileUrl.includes(videoStr)
//     );
//   }

//   if(filterVideoFile.length>0){
//     filterVideoFile.forEach(videoPath => {
//       fs.unlinkSync(`public/temp/${videoPath}`)
//     })
//   }

//   // if(filterVideoFile.length>0){
//   //   const deleteFileOnAwsS3 = await deleteObjectsFromS3(filterVideoFile)

//   //   if(!deleteFileOnAwsS3){
//   //     return next(
//   //       new ErrorHandler(
//   //         "Something went wrong while updating video file from Aws s3 cloud",
//   //         500
//   //       )
//   //     )
//   //   }
//   // }

//   const [rowsUpdated, [updatedVideoData]] = await Video.update(
//     data,
//     {
//       where:{
//         video_id: req.params.id,
//         createdById: req.user.id
//       },
//       returning: true
//     }
//   )

//   if(rowsUpdated == 0){
//     return next(
//       new ErrorHandler(
//         "Something went wrong while updating the videoData",
//         500
//       )
//     )
//   }

//   return res.status(200).json({
//     success: true,
//     vidoData: updatedVideoData,
//     message: "update the videoData successfully"
//   })

// })

// delete MultiMedia Data
// const deleteVideoData = asyncHandler(async (req,res,next)=>{
//   if (!req.params.id) {
//     return next(new ErrorHandler("Missing Video id", 400));
//   }

//   const video = await Video.findOne({
//     where: {
//       video_id: req.params.id,
//       createdById: req.user.id,
//     },
//   });

//   if (!video) {
//     return next(new ErrorHandler("VideoData not found", 404));
//   }

//   // unlink all files from cloudinary
//   // if(video && video.videoFileUrl && video?.videoFileUrl.length>0){
//   //   const deleteFileOnAwsS3 = await deleteObjectsFromS3(video?.videoFileUrl)

//   //   if(!deleteFileOnAwsS3){
//   //     return next(
//   //       new ErrorHandler(
//   //         "Somwthing went wrong while deleting video file from aws s3 cloud"
//   //       )
//   //     )
//   //   }
//   // }

//   const deleteVideo = await Video.destroy({
//     where: {
//       video_id: req.params.id,
//       createdById: req.user.id,
//     },
//   });

//   if (!deleteVideo) {
//     return next(
//       new ErrorHandler("Something went wrong while deleting the video", 500)
//     );
//   }

//   // unlink all files from local
//   if (
//     video &&
//     video.videoFileUrl &&
//     Array.isArray(video?.videoFileUrl) &&
//     video?.videoFileUrl?.length > 0
//   ) {
//     video?.videoFileUrl.forEach((videoPath) => {
//       fs.unlinkSync(`public/temp/${videoPath}`);
//     });
//   }

//   return res.status(200).json({
//     success: true,
//     message: "Video data deleted successufully",
//   });
// })

// const updateVideoShared = asyncHandler( async(req , res, next)=>{

//   const { isShared } = req.body

//   const video = await Video.findOne({
//     where:{
//       video_id: req.params.id,
//       createdById: req.user.id
//     }
//   })

//   if(!video){
//     return next(
//       new ErrorHandler(
//         "Video not found",
//          404
//       )
//     )
//   }

//   if(!isShared || typeof(isShared) !== "boolean"){
//     return next(
//       new ErrorHandler(
//         "shared Field is required and type is boolean"
//       )
//     )
//   }

//   await Video.update(
//     {
//       isShared: isShared
//     },
//     {
//       where:{
//         video_id: req.params.id,
//         createdById: req.user.id
//       }
//     }
//   )

//   return res.status(200).json({
//     success: true,
//     message: "Data update successfully"
//   })
// })

module.exports = {
  uploadMusic,
  //   createVideoData ,
  getAllMusic,
  getMusicById,
  //   updateVideoData,
  //   deleteMusicData,
  //   updateVideoShared
};
