const Music = require("../modal/musicModal.js");
const FalseMusic = require("../modal/falseDataModal.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ErrorHandler = require("../utils/errorHandler");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

ffmpeg.setFfmpegPath(ffmpegPath);

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
    "horizontal_x_negative_vertical_y_negative.mp3", //Vim-Project/public/temp/horizontal_x_negative_vertical_y_negative.mp3
  horizontal_x_negative_vertical_y_positive:
    "horizontal_x_negative_vertical_y_positive.mp3",
  horizontal_x_positive_horizontal_x_negative:
    "horizontal_x_positive_horizontal_x_negative.mp3",
  horizontal_x_positive_vertical_y_negative:
    "horizontal_x_positive_vertical_y_negative.mp3",
  horizontal_x_positive_vertical_y_positive:
    "horizontal_x_positive_vertical_y_positive.mp3",
  vertical_y_positive_vertical_y_negative:
    "vertical_y_positive_vertical_y_negative.mp3",
  horizontal_x_positive__45_degree_positive:
    "horizontal_x_positive_45_degree_positive.mp3",
  horizontal_x_positive__45_degree_negative:
    "horizontal_x_positive_45_degree_negative.mp3",
  horizontal_x_positive__135_degree_positive:
    "horizontal_x_positive_135_degree_positive.mp3",
  horizontal_x_positive__135_degree_negative:
    "horizontal_x_positive_135_degree_negative.mp3",
  horizontal_x_negative__45_degree_positive:
    "horizontal_x_negative_45_degree_positive.mp3",
  horizontal_x_negative__45_degree_negative:
    "horizontal_x_negative_45_degree_negative.mp3",
  horizontal_x_negative__135_degree_positive:
    "horizontal_x_negative_135_degree_positive.mp3",
  horizontal_x_negative__135_degree_negative:
    "horizontal_x_negative_135_degree_negative.mp3",
  vertical_y_positive__45_degree_positive:
    "vertical_y_positive_45_degree_positive.mp3",
  vertical_y_positive__45_degree_negative:
    "vertical_y_positive_45_degree_negative.mp3",
  vertical_y_positive__135_degree_positive:
    "vertical_y_positive_135_degree_positive.mp3",
  vertical_y_positive__135_degree_negative:
    "vertical_y_positive_135_degree_negative.mp3",
  vertical_y_negative__45_degree_positive:
    "vertical_y_negative_45_degree_positive.mp3",
  vertical_y_negative__45_degree_negative:
    "vertical_y_negative_45_degree_negative.mp3",
  vertical_y_negative__135_degree_positive:
    "vertical_y_negative_135_degree_positive.mp3",
  vertical_y_negative__135_degree_negative:
    "vertical_y_negative_135_degree_negative.mp3",
  _45_degree_positive__45_degree_negative:
    "_45_degree_positive_45_degree_negative.mp3",
  _45_degree_positive__135_degree_positive:
    "_45_degree_positive_135_degree_positive.mp3",
  _45_degree_positive__135_degree_negative:
    "_45_degree_positive_135_degree_negative.mp3",
  _45_degree_negative__135_degree_positive:
    "_45_degree_negative_135_degree_positive.mp3",
  _45_degree_negative__135_degree_negative:
    "_45_degree_negative_135_degree_negative.mp3",
  _135_degree_positive__135_degree_negative:
    "_135_degree_positive_135_degree_negative.mp3",
  // Add other combinations as needed
};

// Function to get audio duration
// const getAudioDuration = async (filePath) => {
//   try {
//     const metadata = await MusicMetadataReader.parseFile(filePath);
//     const duration = metadata.format.duration;
//     return duration;
//   } catch (error) {
//     throw new ErrorHandler("Error while extracting audio duration", 500);
//   }
// };

// Function to get audio duration using ffmpeg
const getAudioDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error(`Error in ffprobe: ${err.message}`);
        reject(err);
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
};

// const saveFalseData = async (data, errorMessage) => {
//   try {
//     await FalseMusic.create({
//       ...data,
//       errorMessage: errorMessage || 'Unknown error'
//     });
//   } catch (error) {
//     console.error('Failed to save false data:', error);
//   }
// };

const saveFalseData = async (data, errorMessage) => {
  try {
    await FalseMusic.create({
      ...data,
      errorMessage: errorMessage || "Unknown error",
    });
  } catch (error) {
    console.error("Failed to save false data:", error);
  }
};

// // Upload audio file

// const uploadMusic = asyncHandler(async (req, res, next) => {
//   // upload wav file
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

// const uploadMusic = asyncHandler(async (req, res, next) => {
//   // If records exist, we will append new data based on the provided input
//   const audioFilePath = req?.files?.["music"]?.[0]?.filename;
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
//     // Exclude certain fields from the musicData object
//     const filteredaudioFileData = {
//       id: audioFile.id,
//       musicUrl: audioFile.musicUrl,
//       createdById: audioFile.createdById,
//       updatedAt: audioFile.updatedAt,
//       createdAt: audioFile.createdAt,
//     };
//     return res.status(201).json({
//       success: true,
//       message: "Data Created Successfully",
//       filteredaudioFileData,
//     });
//   }

//   const { angle, gyrometer, acceleration, topTwoAxis, fileName } = req.body;
//   console.log(req.user.id);

//   // Handle topTwoAxis case
//   if (topTwoAxis) {
//     if (!Array.isArray(topTwoAxis) || topTwoAxis.length !== 2) {
//       return next(
//         new ErrorHandler("topTwoAxis must be an array of two strings", 400)
//       );
//     }

//     const trimmedTopTwoAxis = topTwoAxis.map(axis => axis.trim());
//     const axisCombinationKey = trimmedTopTwoAxis.join("_");
//     const reversedAxisCombinationKey = trimmedTopTwoAxis.slice().reverse().join("_");

//     console.log("axisCombinationKey:", axisCombinationKey);
//     console.log("reversedAxisCombinationKey:", reversedAxisCombinationKey);

//     // Check if the topTwoAxis combination already exists for the user
//     const existingMusic = await Music.findOne({
//       where: {
//         topTwoAxis: trimmedTopTwoAxis,
//         createdById: req.user.id,
//       },
//     });

//     let audioFileUrl;
//     if (existingMusic) {
//       // If it exists, find a different audio file URL
//       const availableAudioUrls = Object.values(axisCombinationAudioMap).filter(url => url !== existingMusic.musicUrl);
//       if (availableAudioUrls.length > 0) {
//         audioFileUrl = availableAudioUrls[0];
//       } else {
//         return next(new ErrorHandler("No available audio files for the given combination", 400));
//       }
//     } else {
//       // If it doesn't exist, use the original logic
//       audioFileUrl = axisCombinationAudioMap[axisCombinationKey] || axisCombinationAudioMap[reversedAxisCombinationKey];
//       if (!audioFileUrl) {
//         return next(new ErrorHandler("Invalid axis combination", 400));
//       }
//     }

//     try {
//       const musicData = await Music.create({
//         topTwoAxis: trimmedTopTwoAxis,
//         fileName: fileName,
//         musicUrl: audioFileUrl,
//         createdById: req.user.id,
//       });

//       if (!musicData) {
//         return next(
//           new ErrorHandler("Something went wrong while creating the data", 500)
//         );
//       }

//       const filteredMusicData = {
//         id: musicData.id,
//         topTwoAxis: musicData.topTwoAxis,
//         fileName: musicData.fileName,
//         musicUrl: musicData.musicUrl,
//         createdById: musicData.createdById,
//         updatedAt: musicData.updatedAt,
//         createdAt: musicData.createdAt,
//       };

//       return res.status(201).json({
//         success: true,
//         message: "Data Created Successfully",
//         data: filteredMusicData,
//       });
//     } catch (error) {
//       return next(
//         new ErrorHandler("Something went wrong while creating the data", 500)
//       );
//     }
//   }

//   // Upload from parameters
//   const audio = await Music.create({
//     angle: angle,
//     gyrometer: gyrometer,
//     acceleration: acceleration,
//     fileName: fileName,
//     createdById: req.user.id,
//   });
//   if (!audio) {
//     return next(
//       new ErrorHandler("Something went wrong while creating the data", 500)
//     );
//   }
//   // Exclude certain fields from the musicData object
//   const filteredAudioData = {
//     id: audio.id,
//     angle: audio.angle,
//     gyrometer: audio.gyrometer,
//     acceleration: audio.acceleration,
//     createdById: audio.createdById,
//     updatedAt: audio.updatedAt,
//     createdAt: audio.createdAt,
//   };

//   return res.status(201).json({
//     success: true,
//     message: "Data Created Successfully",
//     filteredAudioData,
//   });
// });

// const uploadMusic = asyncHandler(async (req, res, next) => {
//   // If records exist, we will append new data based on the provided input
//   const audioFilePath = req?.files?.["music"]?.[0]?.path;
//   console.log(audioFilePath);
//   if (audioFilePath) {
//     const duration = await getAudioDuration(audioFilePath);
//     const audioFile = await Music.create({
//       musicUrl: audioFilePath,
//       createdById: req.user.id,
//       duration: duration,
//     });
//     if (!audioFile) {
//       return next(
//         new ErrorHandler("Something went wrong while creating the data", 500)
//       );
//     }
//     // Exclude certain fields from the musicData object
//     const filteredaudioFileData = {
//       id: audioFile.id,
//       musicUrl: audioFile.musicUrl,
//       createdById: audioFile.createdById,
//       duration: audioFile.duration,
//       updatedAt: audioFile.updatedAt,
//       createdAt: audioFile.createdAt,
//     };
//     return res.status(201).json({
//       success: true,
//       message: "Data Created Successfully",
//       filteredaudioFileData,
//     });
//   }

//   const { angle, gyrometer, acceleration, topTwoAxis, fileName } = req.body;
//   console.log(req.user.id);

//   // Handle topTwoAxis case
//   if (topTwoAxis) {
//     if (!Array.isArray(topTwoAxis) || topTwoAxis.length !== 2) {
//       return next(
//         new ErrorHandler("topTwoAxis must be an array of two strings", 400)
//       );
//     }

//     const trimmedTopTwoAxis = topTwoAxis.map((axis) => axis.trim());
//     const axisCombinationKey = trimmedTopTwoAxis.join("_");
//     const reversedAxisCombinationKey = trimmedTopTwoAxis
//       .slice()
//       .reverse()
//       .join("_");

//     console.log("axisCombinationKey:", axisCombinationKey);
//     console.log("reversedAxisCombinationKey:", reversedAxisCombinationKey);

//     // Check if the topTwoAxis combination already exists for the user
//     const existingMusic = await Music.findOne({
//       where: {
//         topTwoAxis: trimmedTopTwoAxis,
//         createdById: req.user.id,
//       },
//     });

//     let audioFileUrl;
//     if (existingMusic) {
//       // If it exists, find a different audio file URL
//       const availableAudioUrls = Object.values(axisCombinationAudioMap).filter(
//         (url) => url !== existingMusic.musicUrl
//       );
//       if (availableAudioUrls.length > 0) {
//         audioFileUrl = availableAudioUrls[0];
//       } else {
//         return next(
//           new ErrorHandler("No available audio files for the given combination", 400)
//         );
//       }
//     } else {
//       // If it doesn't exist, use the original logic
//       audioFileUrl =
//         axisCombinationAudioMap[axisCombinationKey] ||
//         axisCombinationAudioMap[reversedAxisCombinationKey];
//       if (!audioFileUrl) {
//         return next(new ErrorHandler("Invalid axis combination", 400));
//       }
//     }

//     try {
//       const duration = await getAudioDuration(`./public/temp/${audioFileUrl}`);
//       const musicData = await Music.create({
//         topTwoAxis: trimmedTopTwoAxis,
//         fileName: fileName,
//         musicUrl: audioFileUrl,
//         createdById: req.user.id,
//         duration: duration,
//       });

//       if (!musicData) {
//         return next(
//           new ErrorHandler("Something went wrong while creating the data", 500)
//         );
//       }

//       const filteredMusicData = {
//         id: musicData.id,
//         topTwoAxis: musicData.topTwoAxis,
//         fileName: musicData.fileName,
//         musicUrl: musicData.musicUrl,
//         duration: musicData.duration,
//         createdById: musicData.createdById,
//         updatedAt: musicData.updatedAt,
//         createdAt: musicData.createdAt,
//       };

//       return res.status(201).json({
//         success: true,
//         message: "Data Created Successfully",
//         data: filteredMusicData,
//       });
//     } catch (error) {
//       return next(
//         new ErrorHandler("Something went wrong while creating the data", 500)
//       );
//     }
//   }

//   // Upload from parameters
//   const audio = await Music.create({
//     angle: angle,
//     gyrometer: gyrometer,
//     acceleration: acceleration,
//     fileName: fileName,
//     createdById: req.user.id,
//     duration: 0, // Set a default value if there's no file associated to calculate duration
//   });
//   if (!audio) {
//     return next(
//       new ErrorHandler("Something went wrong while creating the data", 500)
//     );
//   }
//   // Exclude certain fields from the musicData object
//   const filteredAudioData = {
//     id: audio.id,
//     angle: audio.angle,
//     gyrometer: audio.gyrometer,
//     acceleration: audio.acceleration,
//     createdById: audio.createdById,
//     updatedAt: audio.updatedAt,
//     createdAt: audio.createdAt,
//     duration: audio.duration,
//   };

//   return res.status(201).json({
//     success: true,
//     message: "Data Created Successfully",
//     filteredAudioData,
//   });
// });

// get all created Video Data
const uploadMusic = asyncHandler(async (req, res, next) => {
  const audioFilePath = req?.files?.["music"]?.[0]?.path;
  const { angle, gyrometer, acceleration, topTwoAxis, fileName } = req.body;
  const createdById = req.user.id;

  try {
    if (audioFilePath) {
      const duration = await getAudioDuration(audioFilePath);
      const audioFile = await Music.create({
        musicUrl: audioFilePath,
        createdById,
        duration,
      });

      if (!audioFile) {
        throw new ErrorHandler(
          "Something went wrong while creating the data",
          500
        );
      }

      const filteredaudioFileData = {
        id: audioFile.id,
        musicUrl: audioFile.musicUrl,
        createdById: audioFile.createdById,
        duration: audioFile.duration,
        updatedAt: audioFile.updatedAt,
        createdAt: audioFile.createdAt,
      };

      return res.status(201).json({
        success: true,
        message: "Data Created Successfully",
        filteredaudioFileData,
      });
    }

    if (topTwoAxis) {
      if (!Array.isArray(topTwoAxis) || topTwoAxis.length !== 2) {
        throw new ErrorHandler(
          "topTwoAxis must be an array of two strings",
          400
        );
      }

      const trimmedTopTwoAxis = topTwoAxis.map((axis) => axis.trim());
      const axisCombinationKey = trimmedTopTwoAxis.join("_");
      const reversedAxisCombinationKey = trimmedTopTwoAxis
        .slice()
        .reverse()
        .join("_");

      const existingMusic = await Music.findOne({
        where: {
          topTwoAxis: trimmedTopTwoAxis,
          createdById,
        },
      });

      let audioFileUrl;
      if (existingMusic) {
        const availableAudioUrls = Object.values(
          axisCombinationAudioMap
        ).filter((url) => url !== existingMusic.musicUrl);
        if (availableAudioUrls.length > 0) {
          audioFileUrl = availableAudioUrls[0];
        } else {
          throw new ErrorHandler(
            "No available audio files for the given combination",
            400
          );
        }
      } else {
        audioFileUrl =
          axisCombinationAudioMap[axisCombinationKey] ||
          axisCombinationAudioMap[reversedAxisCombinationKey];
        if (!audioFileUrl) {
          throw new ErrorHandler("Invalid axis combination", 400);
        }
      }

      // // Check if the filename already exists
      // const existingFileName = await Music.findOne({
      //   where: {
      //     fileName: fileName,
      //   },
      // });

      // if (existingFileName) {
      //   throw new ErrorHandler("Filename already exists", 400);
      // }

      const duration = await getAudioDuration(`./public/temp/${audioFileUrl}`);
      const musicData = await Music.create({
        topTwoAxis: trimmedTopTwoAxis,
        fileName,
        musicUrl: audioFileUrl,
        createdById,
        duration,
      });

      if (!musicData) {
        throw new ErrorHandler(
          "Something went wrong while creating the data",
          500
        );
      }

      const filteredMusicData = {
        id: musicData.id,
        topTwoAxis: musicData.topTwoAxis,
        fileName: musicData.fileName,
        musicUrl: musicData.musicUrl,
        duration: musicData.duration,
        createdById: musicData.createdById,
        updatedAt: musicData.updatedAt,
        createdAt: musicData.createdAt,
      };

      return res.status(201).json({
        success: true,
        message: "Data Created Successfully",
        data: filteredMusicData,
      });
    }

    const audio = await Music.create({
      angle,
      gyrometer,
      acceleration,
      fileName,
      createdById,
      duration: 0,
    });

    if (!audio) {
      throw new ErrorHandler(
        "Something went wrong while creating the data",
        500
      );
    }

    const filteredAudioData = {
      id: audio.id,
      angle: audio.angle,
      gyrometer: audio.gyrometer,
      acceleration: audio.acceleration,
      createdById: audio.createdById,
      updatedAt: audio.updatedAt,
      createdAt: audio.createdAt,
      duration: audio.duration,
    };

    return res.status(201).json({
      success: true,
      message: "Data Created Successfully",
      filteredAudioData,
    });
  } catch (error) {
    // Save false data
    await saveFalseData(
      {
        musicUrl: audioFilePath || null,
        angle,
        gyrometer,
        acceleration,
        topTwoAxis,
        fileName,
        createdById,
      },
      error.message
    );

    // Send response with false data
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
      falseData: {
        musicUrl: audioFilePath || null,
        angle,
        gyrometer,
        acceleration,
        topTwoAxis,
        fileName,
        createdById,
      },
    });
  }
});

const getAllMusic = asyncHandler(async (req, res, next) => {
  const musicResult = await Music.findAll({
    where: {
      createdById: req.user.id,
    },
    order: [["createdAt", "DESC"]],
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
    return next(new ErrorHandler("Audio data not Found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Data Send Successfully",
    data: musicData,
  });
});

module.exports = {
  uploadMusic,
  getAllMusic,
  getMusicById,
};
