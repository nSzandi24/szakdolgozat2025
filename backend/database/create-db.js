/**
 * Database creation script
 * Creates the database if it doesn't exist using Sequelize
 */

const { Sequelize } = require('sequelize');
const config = require('./config');

// Get the database config for current environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

async function createDatabase() {
  // Connect to 'postgres' database to create our target database
  const sequelize = new Sequelize({
    username: dbConfig.username,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    database: 'postgres', // Connect to default postgres database
    dialect: 'postgres',
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✓ Connected to PostgreSQL server');

    // Check if database exists
    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}';`
    );

    if (results.length > 0) {
      console.log(`✓ Database '${dbConfig.database}' already exists`);
    } else {
      // Create the database
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

// Run if called directly
if (require.main === module) {
  createDatabase();
}

module.exports = { createDatabase };

