import { connectToDatabase } from '@/lib/mongodb';
import { Logo } from '@/app/models/Logo';
import { mkdir, copyFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

async function downloadLogos() {
  console.log(chalk.blue('\n=== Copying Logos ===\n'));

  try {
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Get all logos from database
    const { db } = await connectToDatabase();
    const logosCollection = db.collection<Logo>('logos');
    const logos = await logosCollection.find({}).toArray();

    console.log(`Found ${chalk.yellow(logos.length)} logos in database.`);

    for (const logo of logos) {
      if (!logo.imageUrl) continue;
      
      const filename = logo.imageUrl.split('/').pop();
      if (!filename) continue;

      const sourcePath = join(process.cwd(), 'public', logo.imageUrl);
      const destPath = join(uploadsDir, filename);
      
      try {
        // Copy the file
        await copyFile(sourcePath, destPath);
        console.log(chalk.gray(`✓ Copied: ${filename}`));
      } catch (error) {
        console.error(chalk.red(`✗ Failed to copy ${filename}:`), error);
      }
    }

    console.log(chalk.green('\n✓ Copy completed!\n'));
  } catch (error) {
    console.error(chalk.red('\nError during copy:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  downloadLogos();
}

export { downloadLogos }; 