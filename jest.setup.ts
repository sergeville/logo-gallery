import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import React from 'react'
import { jest } from '@jest/globals'
import 'jest-environment-jsdom'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    isFallback: false,
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt = '', ...props }: { src: string; alt?: string; [key: string]: any }) => ({
    type: 'img',
    props: {
      src,
      alt,
      ...props,
    },
  }),
}))

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
})

// Mock mongodb
jest.mock('mongodb', () => {
  const mockMongodb = jest.requireActual('./scripts/test-data/utils/__mocks__/mongodb') as {
    MongoClient: any;
    ObjectId: any;
  }
  return {
    MongoClient: mockMongodb.MongoClient,
    ObjectId: mockMongodb.ObjectId,
  }
})

type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
const mockFetch = jest.fn<FetchFunction>((input: RequestInfo | URL, init?: RequestInit) => {
  return Promise.resolve(new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  }))
})

global.fetch = mockFetch as unknown as typeof global.fetch

// Set environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

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
  hash: jest.fn().mockImplementation((data) => Promise.resolve(`hashed_${data}`)),
  compare: jest.fn().mockImplementation((data, hash) => Promise.resolve(hash === `hashed_${data}`))
})) 