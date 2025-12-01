'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('point', {
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('point');
  }
};
