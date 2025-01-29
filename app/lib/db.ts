import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryDevelopmentDB';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  try {
    if (cachedClient) {
      console.log('Using existing database connection');
      return { db: cachedClient.db() };
    }

    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(MONGODB_URI);
    cachedClient = client;
    console.log('Connected to MongoDB successfully');
    return { db: client.db() };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
}

// For backward compatibility
export default connectToDatabase;
