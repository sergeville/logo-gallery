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

console.log('Verifying files in:', uploadsDir);
console.log('Total files to check:', referencedFiles.length);

const results = {
  found: [],
  missing: [],
  notReadable: []
};

referencedFiles.forEach(file => {
  const filePath = path.join(uploadsDir, file);
  try {
    // Check if file exists
    if (fs.existsSync(filePath)) {
      try {
        // Try to read the file to verify access
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          results.found.push({ file, size: stats.size });
        } else {
          results.notReadable.push({ file, error: 'File is empty' });
        }
      } catch (error) {
        results.notReadable.push({ file, error: error.message });
      }
    } else {
      results.missing.push(file);
    }
  } catch (error) {
    results.notReadable.push({ file, error: error.message });
  }
});

console.log('\nResults:');
console.log('✅ Found and accessible:', results.found.length);
results.found.forEach(({ file, size }) => {
  console.log(`  - ${file} (${(size / 1024).toFixed(2)} KB)`);
});

if (results.missing.length > 0) {
  console.log('\n❌ Missing files:', results.missing.length);
  results.missing.forEach(file => console.log(`  - ${file}`));
}

if (results.notReadable.length > 0) {
  console.log('\n⚠️ Not readable:', results.notReadable.length);
  results.notReadable.forEach(({ file, error }) => console.log(`  - ${file}: ${error}`));
} 