import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load development environment variables
dotenv.config({ path: '.env.development' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryDevelopmentDB';
const UPLOAD_DIR = path.join(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads');

async function main() {
  console.log('Starting sync process in development environment...');
  console.log(`Using MongoDB URI: ${MONGODB_URI}`);
  console.log(`Using uploads directory: ${UPLOAD_DIR}`);

  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOAD_DIR)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // Connect to MongoDB
  console.log('Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();
  const logosCollection = db.collection('logos');

  try {
    // Get all files in the uploads directory
    console.log('Reading uploads directory...');
    const files = fs.readdirSync(UPLOAD_DIR)
      .filter(file => !file.startsWith('.')) // Exclude hidden files
      .map(file => file.toLowerCase());
    console.log(`Found ${files.length} files in uploads directory`);

    // Get all logos from the database
    console.log('Fetching logos from database...');
    const logos = await logosCollection.find({}).toArray();
    console.log(`Found ${logos.length} logos in database`);

    // Check for logos with missing files
    console.log('Checking for logos with missing files...');
    const logosWithMissingFiles = logos.filter(logo => {
      if (!logo.imageUrl) {
        console.log(`Logo ${logo._id} has no imageUrl`);
        return true;
      }

      const imageFile = path.basename(logo.imageUrl).toLowerCase();
      const hasFile = files.includes(imageFile);
      
      if (!hasFile) {
        console.log(`Logo ${logo._id} (${logo.name}) is missing file: ${imageFile}`);
      }
      
      return !hasFile;
    });

    console.log(`Found ${logosWithMissingFiles.length} logos with missing files`);

    // Generate sync report
    console.log('\nSync Report:');
    console.log('=============');
    console.log(`Total logos in database: ${logos.length}`);
    console.log(`Total files in uploads: ${files.length}`);
    console.log(`Logos with missing files: ${logosWithMissingFiles.length}`);

    if (logosWithMissingFiles.length > 0) {
      console.log('\nRemoving logos with missing files...');
      const logosToRemove = logosWithMissingFiles.map(logo => logo._id);
      console.log('Logos to remove:', logosToRemove);

      const result = await logosCollection.deleteMany({
        _id: { $in: logosToRemove }
      });

      console.log(`Removed ${result.deletedCount} logos from database`);
    }

    console.log('\nSync complete. Database is now in sync with uploads directory.');
  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    await client.close();
  }
}

main().catch(console.error); 