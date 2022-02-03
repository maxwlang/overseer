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
        type: Sequelize.UUIDV4
      },
      wordUuid: {
        allowNull: true,
        type: Sequelize.UUIDV4
      },
      threadUuid: {
        allowNull: true,
        type: Sequelize.UUIDV4
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