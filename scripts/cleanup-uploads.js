const fs = require('fs');
const path = require('path');

// Files that are referenced in the database
const referencedFiles = [
  '1738370094125-Screenshot2025-01-28at11.01.20AM.png.webp',
  '1738370094125-Screenshot2025-01-28at11.01.20AM.png-thumb.webp',
  '1738370641522-Screenshot2025-01-30at12.24.30PM.png.webp',
  '1738370641522-Screenshot2025-01-30at12.24.30PM.png-thumb.webp',
  '1738370811292-Screenshot2025-01-28at10.54.55AM.png.webp',
  '1738370811292-Screenshot2025-01-28at10.54.55AM.png-thumb.webp',
  '1738370981081-Screenshot2025-01-28at11.09.03AM.png.webp',
  '1738370981081-Screenshot2025-01-28at11.09.03AM.png-thumb.webp',
  '1738371003534-Screenshot2025-01-28at10.55.10AM.png.webp',
  '1738371003534-Screenshot2025-01-28at10.55.10AM.png-thumb.webp',
  '1738371200951-BrigitePierreLogo.jpeg.webp',
  '1738371200951-BrigitePierreLogo.jpeg-thumb.webp',
  '1738371388950-Screenshot2025-01-28at10.54.55AM.png.webp',
  '1738371388950-Screenshot2025-01-28at10.54.55AM.png-thumb.webp',
  '1738371924915-Screenshot2025-01-31at6.04.44PM.png.webp',
  '1738371924915-Screenshot2025-01-31at6.04.44PM.png-thumb.webp',
  // Also include original files
  '1738370094125-Screenshot2025-01-28at11.01.20AM.png-original.png',
  '1738370641522-Screenshot2025-01-30at12.24.30PM.png-original.png',
  '1738370811292-Screenshot2025-01-28at10.54.55AM.png-original.png',
  '1738370981081-Screenshot2025-01-28at11.09.03AM.png-original.png',
  '1738371003534-Screenshot2025-01-28at10.55.10AM.png-original.png',
  '1738371200951-BrigitePierreLogo.jpeg-original.jpeg',
  '1738371388950-Screenshot2025-01-28at10.54.55AM.png-original.png',
  '1738371924915-Screenshot2025-01-31at6.04.44PM.png-original.png'
];

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Get all files in the uploads directory
const files = fs.readdirSync(uploadsDir);

console.log('Files in uploads directory:', files.length);
console.log('Referenced files:', referencedFiles.length);

// Find orphaned files
const orphanedFiles = files.filter(file => !referencedFiles.includes(file));

console.log('\nOrphaned files:', orphanedFiles.length);
console.log('Files to be removed:');
orphanedFiles.forEach(file => console.log(file));

// Ask for confirmation before deleting
console.log('\nWould you like to remove these files? (yes/no)');
process.stdin.once('data', (data) => {
  const answer = data.toString().trim().toLowerCase();
  if (answer === 'yes') {
    orphanedFiles.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${file}`);
      } catch (error) {
        console.error(`Error deleting ${file}:`, error.message);
      }
    });
    console.log('\nCleanup completed!');
  } else {
    console.log('Cleanup cancelled.');
  }
  process.exit();
}); 