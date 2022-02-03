'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Words extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User_Words.init({
    uuid: DataTypes.UUIDV4,
    useruuid: DataTypes.UUIDV4,
    worduuid: DataTypes.UUIDV4
  }, {
    sequelize,
    modelName: 'User_Words',
  });
  return User_Words;
};