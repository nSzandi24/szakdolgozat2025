const { Sequelize } = require('sequelize');
const config = require('./config');
const path = require('path');

// Read DB connection settings from env with sane defaults
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

// Initialize models
const User = require('./models/user')(sequelize);
const GameSave = require('./models/gameSave')(sequelize);
const Solution = require('./models/solution')(sequelize);

// Define associations
User.hasOne(GameSave, { foreignKey: 'userId', as: 'gameSave' });
GameSave.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Solution, { foreignKey: 'userId', as: 'solutions' });
Solution.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { sequelize, User, GameSave, Solution };