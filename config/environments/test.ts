import type { Config } from './types'

const testConfig: Config = {
  env: 'test',
  server: {
    port: 3001,
    host: 'localhost'
  },
  database: {
    uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017',
    name: 'LogoGalleryTestDB'
  },
  mongodb: {
    uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017',
    dbName: 'LogoGalleryTestDB',
    options: {
      retryWrites: true,
      w: 'majority'
    }
  },
  auth: {
    nextAuthUrl: 'http://localhost:3001',
    nextAuthSecret: 'test-secret',
    jwtSecret: 'test-jwt-secret'
  },
  storage: {
    uploadDir: './public/uploads',
    maxFileSize: 1 * 1024 * 1024, // 1MB for tests
    allowedFormats: ['image/png', 'image/jpeg', 'image/svg+xml']
  },
  api: {
    baseUrl: 'http://localhost:3001',
    timeout: 5000
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

export { testConfig }
export default testConfig 