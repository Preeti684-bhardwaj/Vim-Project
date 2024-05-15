const { title } = require("process");
const Music = require("../modal/musicModal.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ErrorHandler = require("../utils/errorHandler.js");
const fs = require("fs")
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

// Upload video file
const uploadMusic = asyncHandler(async(req , res , next)=>{

  const videoFilePath = req?.files?.["music"]?.[0]?.filename;

  console.log(req.files.music[0]);
  console.log(req.user.id);

  const audio = await Music.create({
    title:req.files.music[0].originalname,
    musicFileUrl:req.files.music[0].filename,
    createdById: req.user.id
  });

//   const videoData = await Video.findByPk(video.video_id)

  if(!audio){
    return next(
      new ErrorHandler(
        "Something went wrong while creating the data", 
        500
      )
    )
  }

  return res.status(201).json({
    success: true,
    message: "Video Data Created Successfully",
    audio,
  });

//   const userAudio = await Music.findOne({
//     where:{
//     //   video_id: req.params.id,
//       createdById: req.user.id
//     }
//   })

//   if(!userAudio){
//     return next(
//       new ErrorHandler(
//         "user not found",
//          404
//       )
//     )
//   }

  // const videoLocalFilePath = req?.files?.["video"]?.[0]?.path
  // if(!videoLocalFilePath){
  //   return next(
  //     new ErrorHandler(
  //       "Missing Video File , Provide video file",
  //        400
  //     )
  //   )
  // }

  // const uploadFileOnAwsS3 = await uploadFileToS3(videoLocalFilePath)

  // if(!uploadFileOnAwsS3){
  //   return next(
  //     new ErrorHandler(
  //       "Something went wrong while uploding file on Aws s3 cloud",
  //        500
  //     )
  //   )
  // }

  // return res.status(201).json({
  //   success: true,
  //   message: "Video Uploaded Successfully",
  //   videoUrl: uploadFileOnAwsS3
  // })

//   if(!videoFilePath){
//     return next(
//       new ErrorHandler(
//         "Missing audio File , Provide audio file",
//          400
//       )
//     )
//   }

//   return res.status(201).json({
//     success:true,
//     message:"music Uploaded Successfully",
//     videoUrl: videoFilePath
//   })
})

// get all created Video Data 
const getAllMusic = asyncHandler(async (req, res, next) => {

  const musicResult = await Music.findAll(
    {
      where:{
        createdById: req.user.id
      }
    }
  );

  return res.status(200).json({
    success: true,
    musicResult
  })
})

// get specific Video by Id
const getMusicById = asyncHandler(async (req, res, next) => {

  const {id} = req.params
  
  if(!id) {
    return next(
      new ErrorHandler(
        "audio_id is Missing" ,
         400
      )
    )
  }

  const musicData = await Music.findOne({
    where: { 
      id: id,
    }
  })
  
  if (!musicData) {
    return next(
      new ErrorHandler(
        "Video data not Found",
        404
      )
    )
  }

  return res.status(200).json({
    success: true,
    message: "Data Send Successfully",
    data: musicData
  })
})

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
}