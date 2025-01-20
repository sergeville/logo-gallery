import { generateSyncReport } from './check-logo-sync';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { join } from 'path';
import chalk from 'chalk';
import { stat, mkdir } from 'fs/promises';

interface FileInfo {
  size: number;
  created: Date;
}

async function getFileInfo(filePath: string): Promise<FileInfo> {
  const stats = await stat(filePath);
  return {
    size: stats.size,
    created: stats.birthtime
  };
}

async function ensureUploadsDir() {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

async function syncToLocal() {
  console.log(chalk.blue('\n=== Synchronizing Database to Local Files ===\n'));

  try {
    await ensureUploadsDir();
    const report = await generateSyncReport();
    
    if (report.isInSync) {
      console.log(chalk.green('✓ Already in sync! No changes needed.\n'));
      return;
    }

    const { db } = await connectToDatabase();
    const logosCollection = db.collection('logos');
    let changes = 0;

    // 1. Remove orphaned database entries
    if (report.orphanedEntries.length > 0) {
      console.log(chalk.yellow(`\nRemoving ${report.orphanedEntries.length} orphaned database entries...`));
      
      for (const { logoId, imageUrl } of report.orphanedEntries) {
        try {
          const result = await logosCollection.deleteOne({
            _id: new ObjectId(logoId)
          });

          if (result.deletedCount === 1) {
            console.log(chalk.gray(`✓ Removed database entry: ${logoId} (${imageUrl})`));
            changes++;
          }
        } catch (error) {
          console.error(chalk.red(`✗ Failed to remove database entry ${logoId}:`), error);
        }
      }
    }

    // 2. Create entries for unmapped files
    if (report.unmappedFiles.length > 0) {
      console.log(chalk.yellow(`\nCreating ${report.unmappedFiles.length} database entries for unmapped files...`));
      
      for (const filename of report.unmappedFiles) {
        try {
          const filePath = join(process.cwd(), 'public', 'uploads', filename);
          const fileInfo = await getFileInfo(filePath);
          
          const logoEntry = {
            _id: new ObjectId(),
            name: filename.split('.')[0], // Use filename without extension as name
            imageUrl: `/uploads/${filename}`,
            description: 'Auto-generated entry from local file',
            ownerId: new ObjectId(), // You might want to set this to a default user
            tags: [],
            fileSize: fileInfo.size,
            fileType: filename.split('.').pop()?.toLowerCase() || 'unknown',
            createdAt: fileInfo.created,
            updatedAt: new Date(),
            averageRating: 0,
            totalVotes: 0
          };

          const result = await logosCollection.insertOne(logoEntry);
          
          if (result.insertedId) {
            console.log(chalk.gray(`✓ Created database entry for: ${filename}`));
            changes++;
          }
        } catch (error) {
          console.error(chalk.red(`✗ Failed to create database entry for ${filename}:`), error);
        }
      }
    }

    // Final verification
    const finalReport = await generateSyncReport();
    if (finalReport.isInSync) {
      console.log(chalk.green(`\n✓ Synchronization completed successfully! Made ${changes} changes.\n`));
    } else {
      console.log(chalk.yellow('\n⚠ Some synchronization actions failed. Please check the logs above.\n'));
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red('\nError during synchronization:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncToLocal();
}

export { syncToLocal }; 