import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) {
    return { client, db };
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  let dbName: string;

  switch (process.env.NODE_ENV) {
    case 'development':
      dbName = 'LogoGalleryDevelopmentDB';
      break;
    case 'test':
      dbName = 'LogoGalleryTestDB';
      break;
    case 'production':
      dbName = 'LogoGalleryDB';
      break;
    default:
      dbName = 'LogoGalleryDevelopmentDB';
  }

  try {
    client = await MongoClient.connect(uri);
    db = client.db(dbName);
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export function getDb(): Db | null {
  return db;
}

export function getClient(): MongoClient | null {
  return client;
}
