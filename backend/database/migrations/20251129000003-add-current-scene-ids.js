'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('game_saves');
    if (!table['current_scene_ids']) {
      await queryInterface.addColumn('game_saves', 'current_scene_ids', {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      });
    }


    await queryInterface.sequelize.query(`
      UPDATE game_saves 
      SET current_scene_ids = location_indices 
      WHERE location_indices IS NOT NULL;
    `);


  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('game_saves', 'current_scene_ids');
  }
};
