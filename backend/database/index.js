const { Sequelize } = require('sequelize');
const config = require('./config');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

const User = require('./models/user')(sequelize);
const GameSave = require('./models/gameSave')(sequelize);
const Solution = require('./models/solution')(sequelize);
const Point = require('./models/point')(sequelize);

User.hasOne(GameSave, { foreignKey: 'userId', as: 'gameSave' });
GameSave.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Solution, { foreignKey: 'userId', as: 'solutions' });
Solution.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Point.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { sequelize, User, GameSave, Solution, Point };