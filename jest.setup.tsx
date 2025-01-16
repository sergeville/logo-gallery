import '@testing-library/jest-dom';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.join(__dirname, '.env.test') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryTestDB';

let mongoClient: MongoClient;

beforeAll(async () => {
  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  console.log('Connected to MongoDB for testing');

  // Clear all collections before tests
  const db = mongoClient.db();
  const collections = await db.listCollections().toArray();
  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({});
  }
});

afterAll(async () => {
  if (mongoClient) {
    await mongoClient.close();
    console.log('Closed MongoDB connection');
  }
});

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock FormData
class MockFormData implements FormData {
  private data = new Map<string, any>();

  append(name: string, value: string | Blob, fileName?: string): void {
    this.data.set(name, value);
  }

  delete(name: string): void {
    this.data.delete(name);
  }

  get(name: string): FormDataEntryValue | null {
    return this.data.get(name) || null;
  }

  getAll(name: string): FormDataEntryValue[] {
    const value = this.data.get(name);
    return value ? [value] : [];
  }

  has(name: string): boolean {
    return this.data.has(name);
  }

  set(name: string, value: string | Blob, fileName?: string): void {
    this.data.set(name, value);
  }

  forEach(callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void): void {
    this.data.forEach((value, key) => callbackfn(value, key, this));
  }

  entries(): IterableIterator<[string, FormDataEntryValue]> {
    return this.data.entries();
  }

  keys(): IterableIterator<string> {
    return this.data.keys();
  }

  values(): IterableIterator<FormDataEntryValue> {
    return this.data.values();
  }

  [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]> {
    return this.entries();
  }
}

global.FormData = MockFormData as any;

// Mock Next.js Response
const createResponse = (data: any, init?: ResponseInit) => {
  const response = new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  response.json = () => Promise.resolve(data);
  
  Object.defineProperty(response, 'status', {
    get() {
      return init?.status || 200;
    },
  });

  return response;
};

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => createResponse(data, init)),
  },
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
  }),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
})); 