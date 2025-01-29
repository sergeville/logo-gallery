import { connectToDatabase } from '@/app/lib/db';
import { Logo } from '@/app/lib/types';
import fs from 'fs/promises';
import path from 'path';

async function cleanupImages() {
  try {
    const { db } = await connectToDatabase();
    const logosCollection = db.collection<Logo>('logos');
    const logos = await logosCollection.find().toArray();

    const referencedImages = new Set(logos.map((logo: Logo) => {
      const imageUrl = logo.imageUrl?.split('/').pop();
      const thumbnailUrl = logo.thumbnailUrl?.split('/').pop();
      return [imageUrl, thumbnailUrl].filter(Boolean);
    }).flat());

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const files = await fs.readdir(uploadsDir);

    for (const file of files) {
      if (!referencedImages.has(file)) {
        await fs.unlink(path.join(uploadsDir, file));
        console.log(`Deleted unreferenced file: ${file}`);
      }
    }

    console.log('Image cleanup completed successfully');
  } catch (error) {
    console.error('Error during image cleanup:', error);
    process.exit(1);
  }
}

cleanupImages(); 