const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database');

async function runMigration() {
    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, '../migrations/sms_logs.sql');
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');

        // Run the migration
        await db.query(migrationSQL);
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration(); 