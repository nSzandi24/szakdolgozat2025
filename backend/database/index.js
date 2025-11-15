const { Sequelize } = require('sequelize');
const path = require('path');

// Read DB connection settings from env with sane defaults
const DB_NAME = 'szakdoga';
const DB_USER = 'postgres';
const DB_PASS = 'CiCuska030424';
const DB_HOST = 'localhost';
const DB_PORT = 5432;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
});

// Initialize models
const User = require('./models/user')(sequelize);

module.exports = { sequelize, User };