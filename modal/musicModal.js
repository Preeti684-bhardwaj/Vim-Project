const {  DataTypes } = require('sequelize') 
const {sequelize} = require("../database/dbconnection.js")
const User = require("./userModal.js");


const Music = sequelize.define('music', {
    // video_id: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    //     unique: {
    //         args: true,
    //         msg: 'Video ID must be unique.'
    //     },
    //     primaryKey: true
    // },
    musicUrl:{
        type:DataTypes.STRING
    },
    angle: {
        type: DataTypes.JSONB
    },
    gyrometer: {
        type: DataTypes.JSONB
    },
    acceleration:{
        type: DataTypes.JSONB
    },
    // videoData:{
    //     type: DataTypes.JSON,
    //     allowNull: false,
    //     validate:{
    //      notEmpty:{
    //        msg: "VideoData is Required"
    //      }
    //     }
    // },
//     videoSelectedFile: {
//         type: DataTypes.JSONB,
//         allowNull: false,
//     },
//     isShared: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false
//     }
});

Music.belongsTo(User,{
    foreignKey:"createdById",
    as: "createdByRes"
})

// Video.hasMany(Feedback, { // Assuming each video can have multiple feedbacks
//     foreignKey: 'videoId',
//     as: "feedback"
// });

module.exports = Music