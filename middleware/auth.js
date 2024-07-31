const User = require("../modal/userModal.js");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler.js");

const verifyJWt = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];

    if (!token) {
      return next(
        new ErrorHandler("Please Login to access this resource", 401)
      );
    }

    token = token.split(" ")[1];

    if (!token || token === "null") {
      return next(
        new ErrorHandler("Please Login to access this resource", 401)
      );
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure the token contains the UUID as `id`
    const userId = decodedToken.id;

    // Find the user by UUID
    const user = await User.findOne({
      where: { unique_id: userId },
      attributes: { exclude: ["password"] },
    });
// console.log(user);
    if (!user) {
      return next(
        new ErrorHandler("Invalid Access Token or user not found", 401)
      );
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("catch auth error", error.message);

    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired. Please login again.", 401));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token. Please login again.", 401));
    }

    return next(new ErrorHandler("Invalid Access Token", 401));
  }
};

module.exports = { verifyJWt };
