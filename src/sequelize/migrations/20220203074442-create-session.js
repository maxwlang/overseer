'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        allowNull: false,
        unique: true,
        type: Sequelize.UUID
      },
      wordUuid: {
        allowNull: true,
        type: Sequelize.UUID
      },
      wordExpireDateTime: {
        allowNull: true,
        type: Sequelize.DATE
      },
      threadUuid: {
        allowNull: true,
        type: Sequelize.UUID
      },
      leaderboardMessageSnowflake: {
        allowNull: true,
        type: Sequelize.STRING
      },
      challengeMessageSnowflake: {
        allowNull: true,
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
    await queryInterface.dropTable('Sessions');
  }
};