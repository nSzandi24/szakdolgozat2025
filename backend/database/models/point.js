const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Point extends Model {}
  Point.init({
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Point',
    tableName: 'point',
    timestamps: false,
  });
  return Point;
};
