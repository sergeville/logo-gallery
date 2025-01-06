import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: envFile });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/LogGalleryDB';
const DB_NAME = process.env.NODE_ENV === 'test' 
  ? 'MockForLogGalleryTestData'
  : process.env.NODE_ENV === 'production'
    ? 'LogGalleryProductionDB'
    : 'LogGalleryDevelopmentDB';

let mongoClient: MongoClient | null = null;

export async function getMongoClient() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
  }
  return mongoClient;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(DB_NAME);
}

export async function closeConnection() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
} 