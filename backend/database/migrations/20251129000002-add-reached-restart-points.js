'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('game_saves', 'reached_restart_points', {
      type: Sequelize.JSONB,
      defaultValue: [],
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('game_saves', 'reached_restart_points');
  }
};
