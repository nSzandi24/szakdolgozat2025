'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('game_saves');
    if (!table['reached_restart_points']) {
      await queryInterface.addColumn('game_saves', 'reached_restart_points', {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('game_saves', 'reached_restart_points');
  }
};
