import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

export async function connectToDatabase() {
  if (!client) {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_db';
    client = new MongoClient(uri);
    await client.connect();
  }
  return { client, db: client.db() };
}

export async function disconnectFromDatabase() {
  if (client) {
    await client.close();
    client = null;
  }
}

export default {
  connectToDatabase,
  disconnectFromDatabase
};
