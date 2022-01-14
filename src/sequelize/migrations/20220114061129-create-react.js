'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reacts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        allowNull: false,
        unique: true,
        type: Sequelize.UUIDV4
      },
      snowflake: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isCustom: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      customId: {
        type: Sequelize.STRING
      },
      unicodeValue: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Reacts');
  }
};