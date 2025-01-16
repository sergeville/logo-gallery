import path from 'path';

export const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryTestDB',
  dbName: 'LogoGalleryTestDB',
  options: {
    retryWrites: true,
    w: 'majority',
  }
}; 