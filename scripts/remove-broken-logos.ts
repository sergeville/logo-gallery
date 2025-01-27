import { generateSyncReport } from './check-logo-sync';
import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';
import chalk from 'chalk';

async function removeBrokenLogos() {
  console.log(chalk.blue('\n=== Removing broken logo entries ===\n'));

  try {
    const report = await generateSyncReport();
    
    if (report.unmappedFiles.length === 0) {
      console.log(chalk.green('No broken logo entries found.\n'));
      return;
    }

    console.log(chalk.yellow(`Found ${report.unmappedFiles.length} broken logo entries to remove...`));
    
    // Get database connection
    const { db } = await connectToDatabase();
    const logosCollection = db.collection('logos');

    // Remove each broken logo entry
    for (const file of report.unmappedFiles) {
      try {
        const result = await logosCollection.deleteOne({
          imageUrl: `/uploads/${file}`
        });

        if (result.deletedCount === 1) {
          console.log(chalk.gray(`✓ Removed logo entry for file: ${file}`));
        } else {
          console.log(chalk.yellow(`⚠ Logo entry not found for file: ${file}`));
        }
      } catch (error) {
        console.error(chalk.red(`✗ Failed to remove logo entry for file: ${file}`), error);
      }
    }

    console.log(chalk.green('\n✓ Database cleanup completed!\n'));

    // Run another sync check to verify
    const finalReport = await generateSyncReport();
    if (finalReport.unmappedFiles.length === 0) {
      console.log(chalk.green('✓ Verification passed: All broken entries removed successfully!\n'));
    } else {
      console.log(chalk.yellow('⚠ Some broken entries could not be removed. Please check the logs above.\n'));
    }
  } catch (error) {
    console.error(chalk.red('\nError during database cleanup:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  removeBrokenLogos();
}

export { removeBrokenLogos }; 