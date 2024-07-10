const ErrorHandler = require("../utils/errorHandler");
const AppVersionModel = require("../modal/appVersionModal");
// const {isValidEmail,isValidPhone ,isValidPassword, isValidLength} = require("../utils/validation");
const asyncHandler = require("../utils/asyncHandler");

const createAppVersion = asyncHandler(async (req, res, next) => {
  const {
    app_link_android,
    app_link_ios,
    message,
    update_type,
    playstore_app_version,
    app_store_version,
  } = req.body;

  if (
    [
      update_type,
      playstore_app_version,
      app_store_version,
    ].some((field) => field?.trim() == "")
  ) {
    return next(new ErrorHandler("Please provide all necessary fields", 400));
  }
  if (!update_type) {
    return next(new ErrorHandler("Please provide update type", 400));
  }
  if (!playstore_app_version) {
    return next(new ErrorHandler("Please provide playstore app version", 400));
  }
  if (!app_store_version) {
    return next(new ErrorHandler("Please provide app store version", 400));
  }

  const appVersionData = await AppVersionModel.findOne();
  if (appVersionData) {
    return next(new ErrorHandler("app version data already created", 400));
  }

  const appVersion = await AppVersionModel.create({
    app_link_android,
    app_link_ios,
    message,
    update_type,
    playstore_app_version,
    app_store_version,
  });

  return res.status(201).json({
    success: true,
    message: "App Version created Successfully",
    data: appVersion,
  });
});

const getAppVersion = asyncHandler(async (req, res, next) => {
const appVersionData = await AppVersionModel.findOne();
  if (!appVersionData) {
    return next(new ErrorHandler("app version data not found", 400));
  }

  return res.status(200).json({
    success: true,
    data: appVersionData,
  });
});
const updateAppVersion = asyncHandler(async (req, res, next) => {
  const { app_link_android,
    app_link_ios,
    message,
    update_type,
    playstore_app_version,
    app_store_version, } = req.body;

    if (
        [
          update_type,
          playstore_app_version,
          app_store_version,
        ].some((field) => field?.trim() == "")
      ) {
        return next(new ErrorHandler("Please provide all necessary fields", 400));
      }
      if (!update_type) {
        return next(new ErrorHandler("Please provide update type", 400));
      }
      if (!playstore_app_version) {
        return next(new ErrorHandler("Please provide playstore app version", 400));
      }
      if (!app_store_version) {
        return next(new ErrorHandler("Please provide app store version", 400));
      }

  try {
    // Find existing instruction data
    const appVersionInfo = await AppVersionModel.findOne();
    console.log(appVersionInfo);

    // If instruction data not found, return an error
    if (!appVersionInfo) {
      return next(new ErrorHandler("App Version data not found", 404));
    }

    // Update instruction data with new values
    appVersionInfo.app_link_android = app_link_android;
    appVersionInfo.app_link_ios = app_link_ios;
    appVersionInfo.message=message
    appVersionInfo.update_type=update_type
    appVersionInfo.playstore_app_version=playstore_app_version
    appVersionInfo.app_store_version=app_store_version
    // Save the updated instruction data to the database
    await appVersionInfo.save({ validate: false });

    // Return the updated instruction data in the response
    res.status(200).json({
      success: true,
      data: appVersionInfo,
      message: "App Version data updated successfully",
    });
  } catch (error) {
    // Handle database errors
    return next(new ErrorHandler("Failed to update instruction data", 500));
  }
});

module.exports = {
  createAppVersion,
  updateAppVersion,
  getAppVersion,
};
