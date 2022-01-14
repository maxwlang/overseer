'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class React extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  React.init({
    uuid: DataTypes.UUIDV4,
    snowflake: DataTypes.STRING,
    isCustom: DataTypes.BOOLEAN,
    customId: DataTypes.STRING,
    unicodeValue: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'React',
  });
  return React;
};