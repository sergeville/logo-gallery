import { config } from 'dotenv';
import { UpdateCollectionSchemaMigration } from '@/scripts/migrations/001-update-collection-schema';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'LogoGalleryDB';

async function runMigrations() {
  // List of migrations to run in order
  const migrations = [
    new UpdateCollectionSchemaMigration(MONGODB_URI, DB_NAME, {
      backupBeforeMigration: true,
      batchSize: 100,
      progressCallback: (progress, message) => {
        console.log(`Progress: ${progress.toFixed(2)}% - ${message}`);
      }
    })
  ];

  console.log('Starting migrations...\n');

  for (const migration of migrations) {
    console.log(`Running migration: ${migration.name}`);
    console.log(`Description: ${migration.description}\n`);

    const startTime = Date.now();
    const success = await migration.migrate();
    const duration = Date.now() - startTime;

    if (success) {
      console.log(`\n✓ Migration ${migration.name} completed successfully`);
      console.log(`Duration: ${(duration / 1000).toFixed(2)} seconds\n`);
    } else {
      console.error(`\n✗ Migration ${migration.name} failed`);
      console.error(`Duration: ${(duration / 1000).toFixed(2)} seconds\n`);
      process.exit(1);
    }
  }

  console.log('All migrations completed successfully!');
}

// Run migrations
runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 