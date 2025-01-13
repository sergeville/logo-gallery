export const databaseConfig = {
  uri: process.env.MONGODB_URI,
  dbName: 'LogoGalleryProductionDB',
  options: {
    retryWrites: true,
    w: 'majority',
    ssl: true,
    authSource: 'admin',
    maxPoolSize: 50
  }
}; 