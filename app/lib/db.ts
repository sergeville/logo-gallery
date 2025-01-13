import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  try {
    if (!client) {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
    }
    
    db = client.db();
    return db;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
    }
  } catch (error) {
    console.error('Failed to disconnect from database:', error);
    throw error;
  }
}

// Export the database instance for direct access when needed
export { db }; 