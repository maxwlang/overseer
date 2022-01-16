'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Emote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Emote.init({
    uuid: DataTypes.UUIDV4,
    isCustom: DataTypes.BOOLEAN,
    customId: DataTypes.STRING,
    unicodeValue: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Emote',
  });
  return Emote;
};