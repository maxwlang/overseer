'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message_Sync extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Message_Sync.init({
    channelSnowflake: DataTypes.STRING,
    lastMessageSnowflake: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Message_Sync',
  });
  return Message_Sync;
};