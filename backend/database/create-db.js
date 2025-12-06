
/**
 * Database creation script.
 * Creates the database if it doesn't exist using Sequelize.
 * @module create-db
 */

const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

/**
 * Creates the database if it does not exist.
 * Connects to the PostgreSQL server, checks for the database, and creates it if necessary.
 * Handles connection and access errors with troubleshooting tips.
 * @async
 * @function createDatabase
 * @returns {Promise<void>}
 */
async function createDatabase() {
  const sequelize = new Sequelize({
    username: dbConfig.username,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    database: 'postgres', 
    dialect: 'postgres',
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✓ Connected to PostgreSQL server');

    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}';`
    );

    if (results.length > 0) {
      console.log(`✓ Database '${dbConfig.database}' already exists`);
    } else {
      console.log(`→ Creating database '${dbConfig.database}'...`);
      await sequelize.query(`CREATE DATABASE "${dbConfig.database}";`);
      console.log(`✓ Database '${dbConfig.database}' created successfully`);
    }

    console.log('\n✅ Database is ready!');
    console.log(`   Run 'npm run migrate' to create tables.`);

  } catch (error) {
    console.error('\n❌ Error creating database:', error.message);
    
    if (error.name === 'SequelizeConnectionRefusedError') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Make sure PostgreSQL is running');
      console.error('   - Check if the connection details are correct in database/config.js');
    } else if (error.name === 'SequelizeAccessDeniedError') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your database username and password in database/config.js');
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}


/**
 * If this script is run directly, create the database.
 */
if (require.main === module) {
  createDatabase();
}

module.exports = { createDatabase };

