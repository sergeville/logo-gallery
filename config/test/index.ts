import path from 'path';

export const testConfig = {
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
    baseUrl: 'http://localhost:3000',
    timeout: 5000
  },
  auth: {
    nextAuthUrl: 'http://localhost:3000',
    nextAuthSecret: 'test-secret',
    jwtSecret: 'test-jwt-secret'
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
}

export default testConfig 