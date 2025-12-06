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
