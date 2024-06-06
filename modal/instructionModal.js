const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/dbconnection");

const InstructionModel = sequelize.define("instruction", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
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
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "description is Mandatory",
      },
    },
  },
});

module.exports = InstructionModel;
