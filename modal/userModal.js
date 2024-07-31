const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/dbconnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserModel = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    unique_id: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    resetOtp: DataTypes.STRING,
    resetOtpExpire: DataTypes.DATE,
    agreePolicy: DataTypes.BOOLEAN,
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }
  // {
  //   hooks: {
  //     beforeCreate: async (user) => {
  //       user.password = await bcrypt.hash(user.password, 10);
  //     },
  //     beforeUpdate: async (user) => {
  //       if (user.changed("password")) {
  //         user.password = await bcrypt.hash(user.password, 10);
  //       }
  //     },
  //   },
  // }
);

UserModel.prototype.generateOtp = function () {
  // Define the possible characters for the OTP
  const chars = "0123456789";
  // Define the length of the OTP
  const len = 6;
  let otp = "";
  // Generate the OTP
  for (let i = 0; i < len; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }

  this.resetOtp = otp;
  this.resetOtpExpire = Date.now() + 15 * 60 * 1000;

  return otp;
};

UserModel.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserModel.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.uuid,
      //   isAdmin: this.type
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

module.exports = UserModel;
