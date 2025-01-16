export const databaseConfig = {
  uri: process.env.MONGODB_URI,
  dbName: 'LogoGalleryDB',
  options: {
    retryWrites: true,
    w: 'majority',
    ssl: true,
    authSource: 'admin',
    maxPoolSize: 50
  }
}; 