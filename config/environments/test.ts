import path from 'path';

export interface Config {
  mongodb: {
    uri: string;
    dbName: string;
    options: {
      retryWrites: boolean;
      w: string;
    };
  };
  storage: {
    uploadDir: string;
    maxFileSize: number;
    allowedFormats: string[];
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  auth: {
    nextAuthUrl: string;
    nextAuthSecret: string;
    jwtSecret: string;
  };
  logging: {
    level: string;
    saveToFile: boolean;
  };
  cleanup: {
    afterEach: boolean;
    afterAll: boolean;
  };
  defaultTimeout: number;
}

export const testConfig: Config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryTestDB',
    dbName: 'LogoGalleryTestDB',
    options: {
      retryWrites: true,
      w: 'majority'
    }
  },
  storage: {
    uploadDir: path.join(process.cwd(), 'uploads', 'test'),
    maxFileSize: 1 * 1024 * 1024, // 1MB
    allowedFormats: ['image/png', 'image/jpeg', 'image/svg+xml']
  },
  api: {
    baseUrl: 'http://localhost:3001',
    timeout: 5000
  },
  auth: {
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3001',
    nextAuthSecret: process.env.NEXTAUTH_SECRET || 'test-secret-do-not-use-in-production',
    jwtSecret: process.env.JWT_SECRET || 'test-jwt-secret-do-not-use-in-production'
  },
  logging: {
    level: 'error',
    saveToFile: false
  },
  cleanup: {
    afterEach: true,
    afterAll: true
  },
  defaultTimeout: 5000
};

export default testConfig; 