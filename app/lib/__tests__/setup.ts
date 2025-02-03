import { config } from 'dotenv';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, closeDatabase } from '../db-config';

// Load test environment variables
config({ path: path.resolve(process.cwd(), '.env.test') });

let mongoServer: MongoMemoryServer | null = null;

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        // Increase startup timeout to 30 seconds
        startupTimeoutMS: 30000,
      },
    });

    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    await connectToDatabase();
  } catch (error) {
    console.error('Failed to start MongoDB Memory Server:', error);
    throw error;
  }
}, 35000); // Increase Jest timeout to 35 seconds

afterAll(async () => {
  try {
    await closeDatabase();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Failed to stop MongoDB Memory Server:', error);
    throw error;
  }
}, 10000); // 10 second timeout for cleanup

beforeEach(async () => {
  try {
    const { db } = await connectToDatabase();
    const collections = await db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Failed to clean up collections:', error);
    throw error;
  }
});
