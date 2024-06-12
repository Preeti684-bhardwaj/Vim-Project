const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/dbconnection.js");
const User = require("./userModal.js");

const FalseMusic = sequelize.define("falsemusic", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  musicUrl: {
    type: DataTypes.STRING,
  },
  angle: {
    type: DataTypes.JSONB,
  },
  gyrometer: {
    type: DataTypes.JSONB,
  },
  acceleration: {
    type: DataTypes.JSONB,
  },
  fileName: {
    type: DataTypes.STRING,
  },
  topTwoAxis: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  }, 
  duration:{
    type: DataTypes.FLOAT, // Adding duration field
    // allowNull: false,
  }
});

FalseMusic.belongsTo(User, {
  foreignKey: "createdById",
  as: "createdByRes",
});

// Video.hasMany(Feedback, { // Assuming each video can have multiple feedbacks
//     foreignKey: 'videoId',
//     as: "feedback"
// });

module.exports = FalseMusic;
