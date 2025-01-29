import { generateSyncReport } from '@/scripts/check-logo-sync';
import { unlink } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

async function cleanupOrphanedFiles() {
  console.log(chalk.blue('\n=== Cleaning up orphaned files ===\n'));

  try {
    const report = await generateSyncReport();
    
    if (report.orphanedEntries.length === 0) {
      console.log(chalk.green('✓ No orphaned files found. Everything is clean!\n'));
      return;
    }

    console.log(`Found ${chalk.yellow(report.orphanedEntries.length)} orphaned files to clean up.`);
    
    for (const entry of report.orphanedEntries) {
      const filename = entry.imageUrl.split('/').pop();
      if (!filename) continue;
      
      const filePath = join(process.cwd(), 'public', 'uploads', filename);
      try {
        await unlink(filePath);
        console.log(chalk.gray(`✓ Deleted: ${filename}`));
      } catch (error) {
        console.error(chalk.red(`✗ Failed to delete ${filename}:`), error);
      }
    }

    console.log(chalk.green('\n✓ Cleanup completed!\n'));
  } catch (error) {
    console.error(chalk.red('\nError during cleanup:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupOrphanedFiles();
}

export { cleanupOrphanedFiles }; 