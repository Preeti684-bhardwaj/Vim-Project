const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/dbconnection");

const InstructionModel = sequelize.define("instruction", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "title is Mandatory",
          },
        },
      },
      description: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "description is Mandatory",
          },
        },
      },

})

module.exports = InstructionModel;