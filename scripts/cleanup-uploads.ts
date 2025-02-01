import fs from 'fs';
import path from 'path';
import { validateEnvironmentVars, isTestEnvironment } from './utils/env-validator';

interface CleanupConfig {
  uploadDir: string;
  maxAge: number; // in milliseconds
  excludePatterns: RegExp[];
}

const config: CleanupConfig = {
  uploadDir: path.join(process.cwd(), 'uploads'),
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  excludePatterns: [/\.gitkeep$/, /^test-/],
};

async function cleanupUploads(): Promise<void> {
  try {
    console.log('Starting cleanup of upload directory...');

    // Ensure we're not running in production
    if (!isTestEnvironment()) {
      throw new Error('Cleanup script can only run in test environment');
    }

    // Validate environment
    validateEnvironmentVars();

    // Check if upload directory exists
    if (!fs.existsSync(config.uploadDir)) {
      console.log('Upload directory does not exist. Nothing to clean up.');
      return;
    }

    const now = Date.now();
    const files = fs.readdirSync(config.uploadDir);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(config.uploadDir, file);

      // Skip if file matches exclude patterns
      if (config.excludePatterns.some(pattern => pattern.test(file))) {
        continue;
      }

      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > config.maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted: ${file}`);
      }
    }

    console.log(`\n✓ Cleanup completed. Deleted ${deletedCount} files.`);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupUploads();
}
