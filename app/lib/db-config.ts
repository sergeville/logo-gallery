import { MongoClient, Db } from 'mongodb';

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

// In test mode or if MONGODB_URI is defined, proceed
if (!isTestMode && !process.env.MONGODB_URI && process.env.NODE_ENV !== 'test') {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (!client) {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    db = client.db(process.env.MONGODB_DB || 'logo-gallery');
  }

  return { db, client };
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
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