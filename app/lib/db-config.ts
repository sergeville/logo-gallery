import { MongoClient } from 'mongodb';
import { getConfig } from '../../config/environments';

let mongoClient: MongoClient | null = null;

export async function getMongoClient() {
  if (!mongoClient) {
    const config = getConfig();
    mongoClient = new MongoClient(config.mongodb.uri);
    await mongoClient.connect();
  }
  return mongoClient;
}

export async function getDb() {
  const client = await getMongoClient();
  const config = getConfig();
  return client.db(config.mongodb.dbName);
}

export const connectToDatabase = getDb;

export async function closeConnection() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
} 