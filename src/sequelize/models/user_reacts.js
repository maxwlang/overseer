'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_reacts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user_reacts.init({
    uuid: DataTypes.UUIDV4,
    useruuid: DataTypes.UUIDV4,
    reactoruuid: DataTypes.UUIDV4,
    reactuuid: DataTypes.UUIDV4
  }, {
    sequelize,
    modelName: 'user_reacts',
  });
  return user_reacts;
};