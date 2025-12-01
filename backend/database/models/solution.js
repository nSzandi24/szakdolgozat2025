const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Solution extends Model {}
  Solution.init({
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    weapon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    killer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    motive: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kidnapper: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kidnapMotive: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ghostskin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Solution',
    tableName: 'solution',
  });
  return Solution;
};
