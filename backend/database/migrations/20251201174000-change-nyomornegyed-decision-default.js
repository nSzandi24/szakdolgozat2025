// Migration: Set nyomornegyed_decision to STRING, not null, default 'accepted_help'
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('game_saves', 'nyomornegyed_decision', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'accepted_help',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('game_saves', 'nyomornegyed_decision', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  }
};
