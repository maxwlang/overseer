'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Word extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Word.init({
    uuid: DataTypes.UUIDV4,
    word: DataTypes.STRING,
    solved: DataTypes.BOOLEAN,
    solver: DataTypes.UUIDV4
  }, {
    sequelize,
    modelName: 'Word',
  });
  return Word;
};