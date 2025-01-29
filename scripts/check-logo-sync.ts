import { connectToDatabase } from '@/lib/mongodb';
import { Logo } from '@/app/models/Logo';
import { readdir } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

interface SyncReport {
  orphanedEntries: { logoId: string; imageUrl: string }[]; // DB entries without files
  unmappedFiles: string[]; // Files without DB entries
  validPairs: { logoId: string; filename: string }[]; // Matching pairs
  totalLogos: number;
  totalFiles: number;
  isInSync: boolean;
}

// Add debug logging
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI
});

async function generateSyncReport(): Promise<SyncReport> {
  const { db } = await connectToDatabase();
  const logosCollection = db.collection<Logo>('logos');

  // Get all logos from database
  const logos = await logosCollection.find({}).toArray();
  const uploadsDir = join(process.cwd(), 'public', 'uploads');

  // Get all files from uploads directory
  const files = await readdir(uploadsDir);
  const actualFiles = files.filter(f => f !== '.gitkeep' && f !== '.keep');

  // Create maps for comparison
  const databaseFiles = new Map(
    logos.filter(logo => logo.imageUrl).map(logo => {
      const filename = logo.imageUrl?.split('/').pop() || '';
      return [filename, { id: logo._id.toString(), url: logo.imageUrl }];
    })
  );
  const filesOnDisk = new Set(actualFiles);

  // Find orphaned database entries (entries without files)
  const orphanedEntries = logos
    .filter(logo => logo.imageUrl)
    .filter(logo => {
      const filename = logo.imageUrl?.split('/').pop();
      return filename && !filesOnDisk.has(filename);
    })
    .map(logo => ({
      logoId: logo._id.toString(),
      imageUrl: logo.imageUrl || ''
    }));

  // Find unmapped files (files without database entries)
  const unmappedFiles = actualFiles.filter(
    file => !databaseFiles.has(file)
  );

  // Find valid pairs (files with matching database entries)
  const validPairs = logos
    .filter(logo => logo.imageUrl)
    .filter(logo => {
      const filename = logo.imageUrl?.split('/').pop();
      return filename && filesOnDisk.has(filename);
    })
    .map(logo => ({
      logoId: logo._id.toString(),
      filename: logo.imageUrl?.split('/').pop() || ''
    }));

  return {
    orphanedEntries,
    unmappedFiles,
    validPairs,
    totalLogos: logos.length,
    totalFiles: actualFiles.length,
    isInSync: orphanedEntries.length === 0 && unmappedFiles.length === 0
  };
}

async function printReport(report: SyncReport) {
  console.log('\n=== Logo Synchronization Report ===\n');
  
  console.log('Summary:');
  console.log(`Total files in uploads (master): ${chalk.blue(report.totalFiles)}`);
  console.log(`Total logos in database: ${chalk.blue(report.totalLogos)}`);
  console.log(`Valid pairs: ${chalk.green(report.validPairs.length)}`);
  console.log(`Synchronization status: ${report.isInSync ? chalk.green('✓ In sync') : chalk.red('✗ Out of sync')}\n`);

  if (report.orphanedEntries.length > 0) {
    console.log(chalk.yellow('Orphaned Database Entries:'));
    console.log('These database entries have no corresponding files in the uploads directory:');
    report.orphanedEntries.forEach(({ logoId, imageUrl }) => {
      console.log(chalk.gray(`- Logo ID: ${logoId}, Expected file: ${imageUrl}`));
    });
    console.log(chalk.cyan('\nSuggestion: Remove these database entries to match the local files:'));
    console.log(chalk.gray('npm run sync-to-local\n'));
  }

  if (report.unmappedFiles.length > 0) {
    console.log(chalk.yellow('Unmapped Files:'));
    console.log('These files exist in the uploads directory but have no database entries:');
    report.unmappedFiles.forEach(file => {
      console.log(chalk.gray(`- ${file}`));
    });
    console.log(chalk.cyan('\nSuggestion: Create database entries for these files:'));
    console.log(chalk.gray('npm run sync-to-local\n'));
  }

  if (report.isInSync) {
    console.log(chalk.green('✓ Local files and database are perfectly synchronized!\n'));
  }
}

async function main() {
  try {
    const report = await generateSyncReport();
    await printReport(report);

    // Exit with appropriate code
    process.exit(report.isInSync ? 0 : 1);
  } catch (error) {
    console.error(chalk.red('Error running sync check:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateSyncReport, type SyncReport }; 