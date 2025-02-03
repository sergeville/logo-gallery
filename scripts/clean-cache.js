const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function cleanCache() {
  const cacheDirectories = [
    '.next/cache',  // Next.js build cache
    'node_modules/.cache'  // Webpack and other build caches
  ];

  console.log('🧹 Cleaning build caches...');

  cacheDirectories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Cleaned ${dir}`);
      } catch (error) {
        console.error(`❌ Error cleaning ${dir}:`, error.message);
      }
    } else {
      console.log(`ℹ️ ${dir} does not exist, skipping...`);
    }
  });

  // Clean npm cache
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ Cleaned npm cache');
  } catch (error) {
    console.error('❌ Error cleaning npm cache:', error.message);
  }

  console.log('🎉 Cache cleaning completed!');
}

// Export for testing
if (typeof exports !== 'undefined') {
  exports.cleanCache = cleanCache;
}

// Run if called directly
if (require.main === module) {
  cleanCache();
}