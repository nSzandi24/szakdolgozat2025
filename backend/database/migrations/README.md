# Database Migrations

This directory contains Sequelize CLI migrations for the database schema.

## Running Migrations

All migration commands should be run from the `backend` directory:

```bash
cd backend

# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Undo the last migration
npm run migrate:undo

# Undo all migrations (caution!)
npm run migrate:undo:all
```

## How It Works

### Sequelize CLI
This project uses the official **Sequelize CLI** for migrations:
- Migrations are tracked in the `SequelizeMeta` table
- Each migration runs in a transaction
- Safe to run multiple times (skips completed migrations)

### Configuration
- **Config file:** `backend/database/config.js`
- **Sequelize RC:** `backend/.sequelizerc` (tells CLI where files are located)

### Migration Naming
Sequelize CLI uses timestamps in migration filenames:
- Format: `YYYYMMDDHHMMSS-description.js`
- Example: `20251129000001-create-game-saves.js`

## Current Migrations

### 20251129000001-create-game-saves.js
Creates the `game_saves` table with:
- All game state fields (location, items, flags, etc.)
- Foreign key to `users` table (user_id)
- Automatic `created_at` and `updated_at` (handled by Sequelize)
- Index on `user_id` for performance

**Note:** No database triggers needed! Sequelize automatically handles `updated_at` timestamps.

## Creating New Migrations

Use Sequelize CLI to generate migration files:

```bash
cd backend

# Create a new migration
npx sequelize-cli migration:generate --name add-achievements-table
```

This creates a new file in `database/migrations/` with the current timestamp.

Then edit the file:

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add your migration code here
    await queryInterface.createTable('achievements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      // ... more fields
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Undo the migration
    await queryInterface.dropTable('achievements');
  }
};
```

Then run:
```bash
npm run migrate
```

## Environment-Specific Configuration

The config supports multiple environments (development, test, production).

Set the `NODE_ENV` variable:
```bash
# Use test database
NODE_ENV=test npm run migrate

# Use production database
NODE_ENV=production npm run migrate
```

## Troubleshooting

### Error: "relation already exists"
The table was already created. Either:
1. Undo the migration: `npm run migrate:undo`
2. Or manually remove it from SequelizeMeta:
   ```sql
   DELETE FROM "SequelizeMeta" WHERE name = '20251129000001-create-game-saves.js';
   ```

### Error: "relation 'users' does not exist"
The `users` table needs to exist first (it's created by Sequelize.sync() in server.js).

Make sure you've started the server at least once before running migrations.

### Connection errors
Check your database credentials in `backend/database/config.js`.

## Best Practices

✅ Always write reversible migrations (proper `down` function)  
✅ Use transactions (handled automatically)  
✅ Test on development database first  
✅ Never edit executed migrations (create new ones)  
✅ Keep migrations small and focused  

## More Commands

```bash
# Check which migrations have been run
npm run migrate:status

# Undo last migration
npm run migrate:undo

# Undo specific migration
npx sequelize-cli db:migrate:undo --name 20251129000001-create-game-saves.js

# Undo all migrations (danger!)
npm run migrate:undo:all
```

## Documentation

For more information, see the official Sequelize CLI documentation:
https://sequelize.org/docs/v6/other-topics/migrations/
