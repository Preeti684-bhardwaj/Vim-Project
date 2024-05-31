const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/dbconnection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

const UserModel = sequelize.define("user", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Name is Mandatory",
        },
        len:{
          args:[4,30],
          msg: "Name Should be greater than 4 character and less than 30 character"
        }
      },
    },
    email:{
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty: {
          msg: "email is Mandatory",
        }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Phone is Mandatory",
        },
      },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is Mandatory",
          },
        },
      },
    resetOtp: {
      type:DataTypes.STRING
    },
    resetOtpExpire: {
    type:DataTypes.DATE
    },
    agreePolicy:{
      type: DataTypes.BOOLEAN,
      // allowNull: false,
      defaultValue:false
    }
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user) => {
        if(user.changed("password")){
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    },
  }
);

UserModel.prototype.generateOtp = function () {

  // Define the possible characters for the OTP
  const chars = '0123456789';
  // Define the length of the OTP
  const len = 6;
  let otp = '';
  // Generate the OTP
  for (let i = 0; i < len; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }

  this.resetOtp = otp
  this.resetOtpExpire = Date.now() + 15 * 60 * 1000;

  return otp;
};

UserModel.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UserModel.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id, 
    //   isAdmin: this.type
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  )
}


module.exports = UserModel;