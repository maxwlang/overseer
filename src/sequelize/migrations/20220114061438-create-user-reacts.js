'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('User_Reacts', {
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
      messageSnowflake: {
        allowNull: false,
        type: Sequelize.STRING
      },
      userUuid: {
        allowNull: false,
        type: Sequelize.UUIDV4
      },
      reactorUuid: {
        allowNull: false,
        type: Sequelize.UUIDV4
      },
      emoteUuid: {
        allowNull: false,
        type: Sequelize.UUIDV4
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
    await queryInterface.dropTable('User_Reacts');
  }
};