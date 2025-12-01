"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("solution", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      weapon: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      killer: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      motive: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      kidnapper: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      kidnapMotive: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ghostskin: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("solution");
  },
};
