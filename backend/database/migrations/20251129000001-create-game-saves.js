'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_saves', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      current_location: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Otthon'
      },
      location_indices: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      discovered_locations: {
        type: Sequelize.JSONB,
        defaultValue: ['Otthon']
      },
      game_flags: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      collected_items: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      seen_once_scenes: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      investigation_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lucas_dialogue_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lucas_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('game_saves', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('game_saves');
  }
};

