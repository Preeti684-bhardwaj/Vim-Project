const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/dbconnection");

const AppVersionModel = sequelize.define("appVersion", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  app_link_android:  DataTypes.STRING,
  app_link_ios:DataTypes.STRING,
  message:DataTypes.STRING,
  update_type:DataTypes.STRING,
  playstore_app_version:DataTypes.STRING,
  app_store_version:DataTypes.STRING
});

module.exports = AppVersionModel;
