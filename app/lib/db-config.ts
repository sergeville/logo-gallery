import { MongoClient, Db } from 'mongodb';
import { createLogoIndexes } from './logo-validation';

// Environment-specific database names
export const DB_NAMES = {
  development: 'LogoGalleryDevelopmentDB',
  test: 'LogoGalleryTestDB',
  production: 'LogoGalleryDB'
} as const;

// Environment-specific options
export const DB_OPTIONS = {
  development: {
    retryWrites: true,
    w: 'majority',
  },
  test: {
    retryWrites: true,
    w: 'majority',
  },
  production: {
    retryWrites: true,
    w: 'majority',
    ssl: true,
    authSource: 'admin',
    maxPoolSize: 50
  }
} as const;

// For testing purposes
let isTestMode = false;
export const __setTestMode = (enabled: boolean) => {
  isTestMode = enabled;
};

// Use caching for database connections
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Check for required environment variables
if (!isTestMode && !process.env.MONGODB_URI && process.env.NODE_ENV !== 'test') {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

export async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    
    // If we have a cached connection, verify it's still alive
    if (cachedClient && cachedDb) {
      try {
        await cachedClient.db().admin().ping();
        return { client: cachedClient, db: cachedDb };
      } catch (error) {
        // Connection is dead, clean up
        console.error('Cached connection is dead:', error);
        await closeDatabase();
      }
    }

    // Get database configuration
    const dbName = process.env.NODE_ENV === 'test' ? DB_NAMES.test : DB_NAMES.development;
    const options = {
      ...(process.env.NODE_ENV === 'test' ? DB_OPTIONS.test : DB_OPTIONS.development),
      serverSelectionTimeoutMS: 5000, // Reduce timeout for faster test failures
      connectTimeoutMS: 5000
    };

    // Create new connection
    const client = new MongoClient(uri, options);
    await client.connect();
    const db = client.db(dbName);

    // Verify connection is alive
    await db.admin().ping();

    // Create indexes
    await createLogoIndexes(db);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

export async function disconnectFromDatabase() {
  await closeDatabase();
}

// Query helper functions
export function getPaginationOptions(page: number = 1, limit: number = 10) {
  return {
    skip: (page - 1) * limit,
    limit,
  };
}

export function getProjectionOptions(fields: string[]) {
  const projection: Record<string, number> = {};
  fields.forEach(field => {
    projection[field] = 1;
  });
  return projection;
}

// Default export for backward compatibility
export default connectToDatabase; 