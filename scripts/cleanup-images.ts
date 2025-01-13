import { readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { getLogos } from '../app/lib/store';

async function cleanupImages() {
  try {
    // Get all logos from the store
    const logos = getLogos();
    const referencedImages = new Set(logos.map(logo => {
      // Extract filename from URL
      const url = logo.url;
      return url.split('/').pop();
    }));

    // Get all files in the uploads directory
    const uploadsDir = join(process.cwd(), 'uploads');
    const files = await readdir(uploadsDir);

    let deletedCount = 0;
    let errorCount = 0;

    // Find and delete unreferenced files
    for (const file of files) {
      if (!referencedImages.has(file) && !file.startsWith('.')) {
        try {
          await unlink(join(uploadsDir, file));
          console.log(`Deleted unreferenced file: ${file}`);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete file ${file}:`, error);
          errorCount++;
        }
      }
    }

    console.log(`
Cleanup completed:
- Total files checked: ${files.length}
- Files deleted: ${deletedCount}
- Errors encountered: ${errorCount}
- Referenced images: ${referencedImages.size}
`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupImages();
}

export default cleanupImages; 