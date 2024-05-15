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
    // type: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   defaultValue: "salePerson",
    // },
    // organizationId: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
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