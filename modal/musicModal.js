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
    title: {
        type: DataTypes.STRING,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Title must not be empty'
            }
        },
        allowNull: false,
    },
    musicFileUrl:{
        type: DataTypes.STRING,
        allowNull: false
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