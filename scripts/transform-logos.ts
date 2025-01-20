import { connectToDatabase } from '../lib/mongodb';
import { Logo } from '../app/models/Logo';
import { readdir, readFile, writeFile, unlink, access } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
import sharp from 'sharp';

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function findMatchingFile(filename: string, directory: string): Promise<string | null> {
  try {
    const files = await readdir(directory);
    
    // If the filename is a timestamp-based name, try to find a match
    if (filename.match(/^\d{13}-/)) {
      const matchingFile = files.find(file => file === filename);
      return matchingFile ? join(directory, matchingFile) : null;
    }
    
    // If it's a UUID-based name, try to find a file with matching content
    const baseFilename = filename.split('.')[0].toLowerCase();
    const matchingFile = files.find(file => {
      const parts = file.split('-');
      return parts.length > 1 && parts[parts.length - 1].toLowerCase().includes(baseFilename);
    });
    return matchingFile ? join(directory, matchingFile) : null;
  } catch {
    return null;
  }
}

async function transformLogos() {
  console.log(chalk.blue('\n=== Transforming Logos to PNG ===\n'));

  try {
    // Connect to database
    const { db } = await connectToDatabase();
    const logosCollection = db.collection<Logo>('logos');

    // Get all logos from database
    const logos = await logosCollection.find({}).toArray();
    console.log(`Found ${chalk.yellow(logos.length)} logos in database.`);

    // Get the directory paths
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const imagesDir = join(process.cwd(), 'public', 'images');

    // Process each logo
    for (const logo of logos) {
      if (!logo.imageUrl) {
        console.log(chalk.yellow(`⚠ Skipped (no URL): ${logo._id}`));
        continue;
      }
      
      const filename = logo.imageUrl.split('/').pop();
      if (!filename) {
        console.log(chalk.yellow(`⚠ Skipped (invalid URL): ${logo.imageUrl}`));
        continue;
      }

      // Skip if already PNG
      if (filename.toLowerCase().endsWith('.png')) {
        console.log(chalk.gray(`✓ Skipped (already PNG): ${filename}`));
        continue;
      }

      const uploadPath = join(uploadsDir, filename);
      const imagePath = join(imagesDir, filename);
      let sourcePath = '';

      // Check which directory has the file
      if (await fileExists(uploadPath)) {
        sourcePath = uploadPath;
      } else if (await fileExists(imagePath)) {
        sourcePath = imagePath;
      } else {
        // Try to find a matching file in the images directory
        const matchingFile = await findMatchingFile(filename, imagesDir);
        if (matchingFile) {
          sourcePath = matchingFile;
          console.log(chalk.blue(`ℹ Found matching file: ${matchingFile}`));
        } else {
          console.log(chalk.yellow(`⚠ Skipped (file not found): ${filename}`));
          continue;
        }
      }

      const newFilename = filename.replace(/\.(jpg|jpeg)$/i, '.png');
      const newFilePath = join(uploadsDir, newFilename);

      try {
        // Read the file
        const fileBuffer = await readFile(sourcePath);
        
        // Transform to PNG using sharp
        const pngBuffer = await sharp(fileBuffer)
          .png()
          .toBuffer();

        // Write the new PNG file
        await writeFile(newFilePath, pngBuffer);

        // Delete the original file if it's in uploads directory
        if (sourcePath === uploadPath) {
          await unlink(sourcePath);
        }

        // Update database entry
        await logosCollection.updateOne(
          { _id: logo._id },
          { $set: { imageUrl: `/uploads/${newFilename}` } }
        );
        console.log(chalk.gray(`✓ Transformed and updated: ${filename} -> ${newFilename}`));
      } catch (error) {
        console.error(chalk.red(`✗ Failed to transform ${filename}:`), error);
      }
    }

    console.log(chalk.green('\n✓ Transformation completed!\n'));
  } catch (error) {
    console.error(chalk.red('\nError during transformation:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  transformLogos();
}

export { transformLogos }; 