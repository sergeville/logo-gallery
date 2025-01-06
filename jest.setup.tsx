import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { jest } from '@jest/globals';
import React from 'react';
import { getMongoClient, closeConnection, getDb } from './app/lib/db-config';
import { config } from 'dotenv';

config({ path: '.env.test' });

let mongoClient: MongoClient;

beforeAll(async () => {
  mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/MockForLogGalleryTestData');
  await mongoClient.connect();
  
  // Clear all collections before tests
  const db = await getDb();
  const collections = await db.listCollections().toArray();
  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({});
  }
});

afterAll(async () => {
  if (mongoClient) {
    await mongoClient.close();
  }
  await closeConnection();
});

// Mock Response and Request
class MockResponse {
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: ResponseType;
  url: string;
  body: ReadableStream | null;
  bodyUsed: boolean;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.headers = new Headers(init?.headers);
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.ok = this.status >= 200 && this.status < 300;
    this.redirected = false;
    this.type = 'default';
    this.url = '';
    this.body = null;
    this.bodyUsed = false;
    
    if (body && typeof body === 'string') {
      try {
        const parsedBody = JSON.parse(body);
        this._bodyInit = parsedBody;
      } catch {
        this._bodyInit = body;
      }
    } else {
      this._bodyInit = body || null;
    }
  }

  _bodyInit: any;

  async arrayBuffer(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }

  async blob(): Promise<Blob> {
    return new Blob();
  }

  async formData(): Promise<FormData> {
    return new FormData();
  }

  async json(): Promise<any> {
    return this._bodyInit || {};
  }

  async text(): Promise<string> {
    return this._bodyInit ? JSON.stringify(this._bodyInit) : '';
  }

  clone(): Response {
    return new MockResponse(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
    });
  }
}

class MockRequest {
  cache: RequestCache;
  credentials: RequestCredentials;
  destination: RequestDestination;
  headers: Headers;
  integrity: string;
  keepalive: boolean;
  method: string;
  mode: RequestMode;
  redirect: RequestRedirect;
  referrer: string;
  referrerPolicy: ReferrerPolicy;
  signal: AbortSignal;
  url: string;
  body: ReadableStream | null;
  bodyUsed: boolean;

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    this.cache = 'default';
    this.credentials = 'same-origin';
    this.destination = 'document';
    this.headers = new Headers(init?.headers);
    this.integrity = '';
    this.keepalive = false;
    this.method = init?.method || 'GET';
    this.mode = 'cors';
    this.redirect = 'follow';
    this.referrer = 'about:client';
    this.referrerPolicy = 'strict-origin-when-cross-origin';
    this.signal = new AbortController().signal;
    this.url = typeof input === 'string' ? input : input.toString();
    this.body = null;
    this.bodyUsed = false;
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }

  async blob(): Promise<Blob> {
    return new Blob();
  }

  async formData(): Promise<FormData> {
    return new FormData();
  }

  async json(): Promise<any> {
    return {};
  }

  async text(): Promise<string> {
    return '';
  }

  clone(): Request {
    return new MockRequest(this.url, {
      method: this.method,
      headers: this.headers,
    });
  }
}

// Set up global mocks
Object.defineProperty(global, 'Response', {
  writable: true,
  value: MockResponse,
});

Object.defineProperty(global, 'Request', {
  writable: true,
  value: MockRequest,
});

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

// Mock Next.js components and hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return React.createElement('img', { ...props, alt: props.alt || '' });
  },
}));

// Mock Dialog from @headlessui/react
const Dialog = {
  Root: ({ open, onClose, children }: any) => {
    if (!open) return null;
    return (
      <div role="dialog" aria-modal="true" data-testid="auth-modal">
        {children}
      </div>
    );
  },
  Panel: ({ children, className }: any) => (
    <div role="dialog-panel" className={className}>
      {children}
    </div>
  ),
  Title: ({ children, className }: any) => (
    <h3 role="dialog-title" className={className}>
      {children}
    </h3>
  ),
  Description: ({ children, className }: any) => (
    <p role="dialog-description" className={className}>
      {children}
    </p>
  ),
};

jest.mock('@headlessui/react', () => ({
  __esModule: true,
  Dialog: Object.assign(Dialog.Root, {
    Panel: Dialog.Panel,
    Title: Dialog.Title,
    Description: Dialog.Description,
  }),
}));

// Mock NextResponse
const NextResponse = {
  json: (data: any, init?: ResponseInit) => {
    const response = new MockResponse(JSON.stringify(data), {
      ...init,
      headers: {
        ...init?.headers,
        'content-type': 'application/json',
      },
    });
    return response;
  },
  redirect: (url: string, init?: number | ResponseInit) => {
    const status = typeof init === 'number' ? init : init?.status || 307;
    const response = new MockResponse(null, { status });
    response.headers.set('Location', url);
    return response;
  },
  next: (init?: ResponseInit) => {
    return new MockResponse(null, init);
  },
};

// Mock next/server module
jest.mock('next/server', () => ({
  __esModule: true,
  NextResponse,
})); 