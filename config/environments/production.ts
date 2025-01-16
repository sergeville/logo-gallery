import { config } from 'dotenv';
import path from 'path';

// Load production environment variables
config({ path: path.join(process.cwd(), '.env.production') });

export const productionConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: 'LogoGalleryProductionDB',
    options: {
      // Production specific options
      retryWrites: true,
      w: 'majority',
      ssl: true,
      authSource: 'admin',
      maxPoolSize: 50
    }
  },
  storage: {
    uploadDir: path.join(process.cwd(), 'uploads', 'production'),
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['image/png', 'image/jpeg', 'image/svg+xml']
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    timeout: 60000 // 60 seconds
  },
  logging: {
    level: 'info',
    saveToFile: true,
    logDir: path.join(process.cwd(), 'logs')
  },
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
      credentials: true
    }
  }
}; 