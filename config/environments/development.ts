import { config } from 'dotenv';
import path from 'path';

// Load development environment variables
config({ path: path.join(process.cwd(), '.env.development') });

export const developmentConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryDevelopmentDB',
    dbName: 'LogoGalleryDevelopmentDB',
    options: {
      // Development specific options
      retryWrites: true,
      w: 'majority',
    }
  },
  storage: {
    uploadDir: path.join(process.cwd(), 'uploads', 'development'),
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['image/png', 'image/jpeg', 'image/svg+xml']
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000 // 30 seconds
  },
  logging: {
    level: 'debug',
    saveToFile: false
  }
}; 