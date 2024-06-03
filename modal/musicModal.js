const {  DataTypes } = require('sequelize') 
const {sequelize} = require("../database/dbconnection.js")
const User = require("./userModal.js");


const Music = sequelize.define('music', {
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
    fileName:{
        type:DataTypes.STRING
    }
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