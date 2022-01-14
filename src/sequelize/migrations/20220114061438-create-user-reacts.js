'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_reacts', {
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
      useruuid: {
        allowNull: false,
        type: Sequelize.UUIDV4
      },
      reactoruuid: {
        allowNull: false,
        type: Sequelize.UUIDV4
      },
      reactuuid: {
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
    await queryInterface.dropTable('user_reacts');
  }
};