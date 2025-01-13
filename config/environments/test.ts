import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.join(process.cwd(), '.env.test') });

export const testConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryTestDB',
    dbName: 'LogoGalleryTestDB',
    options: {
      // Test specific options
      retryWrites: true,
      w: 'majority',
    }
  },
  storage: {
    uploadDir: path.join(process.cwd(), 'uploads', 'test'),
    maxFileSize: 1 * 1024 * 1024, // 1MB for tests
    allowedFormats: ['image/png', 'image/jpeg', 'image/svg+xml']
  },
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 5000 // 5 seconds for faster tests
  },
  logging: {
    level: 'error',
    saveToFile: false
  },
  testing: {
    cleanupAfterEach: true,
    seedDataPath: path.join(process.cwd(), 'test', 'seed-data'),
    defaultTimeout: 5000
  }
}; 