'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add currentSceneIds column if it does not exist
    const table = await queryInterface.describeTable('game_saves');
    if (!table['current_scene_ids']) {
      await queryInterface.addColumn('game_saves', 'current_scene_ids', {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      });
    }

    // Migrate existing data: copy locationIndices to currentSceneIds
    // This won't work perfectly since we're changing from indexes to IDs,
    // but it will preserve the structure
    await queryInterface.sequelize.query(`
      UPDATE game_saves 
      SET current_scene_ids = location_indices 
      WHERE location_indices IS NOT NULL;
    `);

    // Note: The actual scene index -> sceneId conversion will happen
    // when users load the game - the game engine will handle the migration
    // by finding the first scene with startFromHereUnless property
  },

  down: async (queryInterface, Sequelize) => {
    // Remove currentSceneIds column
    await queryInterface.removeColumn('game_saves', 'current_scene_ids');
  }
};
