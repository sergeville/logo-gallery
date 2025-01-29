import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';
import '@testing-library/jest-dom';
import React from 'react';

// Polyfill TextEncoder/TextDecoder
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Set environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';
process.env.MONGODB_DB = 'test_db';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock MongoDB
jest.mock('mongodb', () => {
  const mockCollection = {
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
    findOne: jest.fn().mockResolvedValue(null),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    countDocuments: jest.fn().mockResolvedValue(0),
    toArray: jest.fn().mockResolvedValue([]),
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
    listCollections: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
  };

  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    db: jest.fn().mockReturnValue(mockDb),
    close: jest.fn().mockResolvedValue(undefined),
  };

  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
    ObjectId: jest.fn(id => ({ toString: () => id || 'mock-id' })),
  };
});

// Mock next/server
jest.mock('next/server', () => {
  class MockResponse {
    private body: any;
    private init: Record<string, any>;
    public status: number;

    constructor(body: any = {}, init: Record<string, any> = {}) {
      this.body = body;
      this.init = init;
      this.status = init.status || 200;
    }

    json() {
      return Promise.resolve(this.body);
    }

    static json(body: any, init: Record<string, any> = {}) {
      return new MockResponse(body, init);
    }
  }

  class MockRequest {
    private url: string;
    private method: string;
    private headers: Headers;
    private body: any;

    constructor(url: string = '', init: { method?: string; headers?: HeadersInit; body?: any } = {}) {
      this.url = url;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body;
    }

    async json() {
      return this.body;
    }
  }

  return {
    NextResponse: {
      json: (body: any, init: Record<string, any> = {}) => new MockResponse(body, init),
    },
    NextRequest: MockRequest,
  };
});

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ src, alt, width, height, ...props }: any) {
    return React.createElement('img', {
      src,
      alt,
      width,
      height,
      ...props
    });
  }
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  }),
  usePathname: () => '/'
}));

// Mock environment variables
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 