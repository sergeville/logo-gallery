import { jest, expect } from '@jest/globals';
import { vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Import the actual Headers type from lib.dom
type DOMHeadersIterator<T> = Headers[typeof Symbol.iterator] extends () => infer R ? R : never;

interface IteratorObject<T, TReturn = any, TNext = undefined> {
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
  [Symbol.iterator](): IteratorObject<T, TReturn, TNext>;
}

interface HeadersIterator<T> extends IteratorObject<T> {
  map<U>(callbackfn: (value: T, index: number) => U): IteratorObject<U, undefined, unknown>;
  filter(callbackfn: (value: T, index: number) => boolean): IteratorObject<T, undefined, unknown>;
  take(n: number): T[];
  drop(n: number): T[];
  flatMap<U>(callbackfn: (value: T, index: number) => U | U[]): IteratorObject<U, undefined, unknown>;
  reduce<U>(callbackfn: (acc: U, value: T, index: number) => U, initial: U): U;
  toArray(): T[];
  forEach(callbackfn: (value: T, index: number) => void): void;
  some(callbackfn: (value: T, index: number) => boolean): boolean;
  every(callbackfn: (value: T, index: number) => boolean): boolean;
  find(callbackfn: (value: T, index: number) => boolean): T | undefined;
  [Symbol.toStringTag]: string;
  [Symbol.dispose](): void;
}

// 1. Set up Jest globals first
expect.extend(matchers);

// 2. Set up basic globals
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// 3. Set up Response and Request mocks
class MockResponse implements Response {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  readonly body: ReadableStream<Uint8Array> | null;
  #bodyUsed: boolean;
  private bodyContent: BodyInit | null;

  get bodyUsed(): boolean {
    return this.#bodyUsed;
  }

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.headers = new Headers(init?.headers);
    this.ok = init?.status ? init.status >= 200 && init.status < 300 : true;
    this.redirected = false;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.type = 'default';
    this.url = '';
    this.bodyContent = body || null;
    this.body = null;
    this.#bodyUsed = false;
  }

  private markAsUsed(): void {
    if (this.#bodyUsed) throw new Error('Body already read');
    this.#bodyUsed = true;
  }

  private arrayBufferFromString(str: string): ArrayBuffer {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(str);
    const arrayBuffer = new ArrayBuffer(uint8Array.length);
    const view = new Uint8Array(arrayBuffer);
    view.set(uint8Array);
    return arrayBuffer;
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    this.markAsUsed();
    if (this.bodyContent instanceof ArrayBuffer) return this.bodyContent;
    if (typeof this.bodyContent === 'string') {
      return this.arrayBufferFromString(this.bodyContent);
    }
    return new ArrayBuffer(0);
  }

  async blob(): Promise<Blob> {
    this.markAsUsed();
    if (this.bodyContent instanceof Blob) return this.bodyContent;
    const content = this.bodyContent ? [String(this.bodyContent)] : [];
    return new Blob(content, { type: 'text/plain' });
  }

  async formData(): Promise<FormData> {
    this.markAsUsed();
    const formData = new FormData();
    if (typeof this.bodyContent === 'string') {
      const params = new URLSearchParams(this.bodyContent);
      params.forEach((value, key) => formData.append(key, value));
    }
    return formData;
  }

  async json(): Promise<any> {
    this.markAsUsed();
    if (!this.bodyContent) return null;
    if (typeof this.bodyContent === 'string') return JSON.parse(this.bodyContent);
    return this.bodyContent;
  }

  async text(): Promise<string> {
    this.markAsUsed();
    if (!this.bodyContent) return '';
    if (typeof this.bodyContent === 'string') return this.bodyContent;
    if (this.bodyContent instanceof Blob) return await this.bodyContent.text();
    return String(this.bodyContent);
  }

  clone(): Response {
    if (this.#bodyUsed) throw new Error('Body already read');
    return new MockResponse(this.bodyContent, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers
    });
  }

  bytes(): Promise<Uint8Array> {
    return this.arrayBuffer().then(buffer => new Uint8Array(buffer));
  }
}

// Create proper Headers mock
class MockHeaders implements Headers {
  private headers: Map<string, string> = new Map();

  constructor(init?: HeadersInit) {
    if (init) {
      if (init instanceof Headers || init instanceof MockHeaders) {
        init.forEach((value, key) => this.append(key, value));
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.append(key, String(value)));
      } else {
        Object.entries(init).forEach(([key, value]) => this.append(key, String(value)));
      }
    }
  }

  append(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  delete(name: string): void {
    this.headers.delete(name.toLowerCase());
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }

  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }

  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  forEach(callbackfn: (value: string, key: string, parent: Headers) => void): void {
    this.headers.forEach((value, key) => callbackfn(value, key, this as unknown as Headers));
  }

  private createIterator<T>(source: IterableIterator<T>): HeadersIterator<T> {
    const array = Array.from(source);
    let index = 0;

    const iterator: HeadersIterator<T> = {
      next: () => {
        if (index < array.length) {
          return { value: array[index++], done: false };
        }
        return { value: undefined, done: true };
      },
      [Symbol.iterator]: () => iterator,
      [Symbol.toStringTag]: 'Headers Iterator',
      [Symbol.dispose]: () => { /* noop */ },
      map: <U>(callbackfn: (value: T, index: number) => U) => 
        this.createIterator(array.map((v, i) => callbackfn(v, i)).values()),
      filter: (callbackfn: (value: T, index: number) => boolean) =>
        this.createIterator(array.filter((v, i) => callbackfn(v, i)).values()),
      take: (n: number) => array.slice(0, n),
      drop: (n: number) => array.slice(n),
      flatMap: <U>(callbackfn: (value: T, index: number) => U | U[]) =>
        this.createIterator(array.flatMap((v, i) => callbackfn(v, i)).values()),
      reduce: <U>(callbackfn: (acc: U, value: T, index: number) => U, initial: U) =>
        array.reduce((acc, v, i) => callbackfn(acc, v, i), initial),
      toArray: () => array,
      forEach: (callbackfn: (value: T, index: number) => void) =>
        array.forEach((v, i) => callbackfn(v, i)),
      some: (callbackfn: (value: T, index: number) => boolean) =>
        array.some((v, i) => callbackfn(v, i)),
      every: (callbackfn: (value: T, index: number) => boolean) =>
        array.every((v, i) => callbackfn(v, i)),
      find: (callbackfn: (value: T, index: number) => boolean) =>
        array.find((v, i) => callbackfn(v, i))
    };

    return iterator;
  }

  entries(): HeadersIterator<[string, string]> {
    return this.createIterator(this.headers.entries());
  }

  keys(): HeadersIterator<string> {
    return this.createIterator(this.headers.keys());
  }

  values(): HeadersIterator<string> {
    return this.createIterator(this.headers.values());
  }

  [Symbol.iterator](): HeadersIterator<[string, string]> {
    return this.entries();
  }

  getSetCookie(): string[] {
    return [];
  }
}

// Create a type-safe mock request function
interface MockRequestInit extends RequestInit {
  signal?: AbortSignal;
}

const mockRequest = function(input: string | URL | Request, init?: MockRequestInit): Request {
  const headers = new MockHeaders();
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => headers.append(key, value));
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => headers.append(key, String(value)));
    } else {
      Object.entries(init.headers).forEach(([key, value]) => headers.append(key, String(value)));
    }
  }

  const request = {
    url: typeof input === 'string' ? input : input.toString(),
    method: init?.method || 'GET',
    headers,
    body: init?.body,
    cache: init?.cache || 'default',
    credentials: init?.credentials || 'same-origin',
    destination: 'document' as RequestDestination,
    integrity: '',
    keepalive: false,
    mode: init?.mode || 'cors',
    redirect: init?.redirect || 'follow',
    referrer: '',
    referrerPolicy: init?.referrerPolicy || '',
    signal: init?.signal,
    clone: function(): Request {
      return mockRequest(this.url, {
        method: this.method,
        headers: Array.from(this.headers.entries()),
        body: this.body,
        mode: this.mode as RequestMode,
        credentials: this.credentials as RequestCredentials,
        cache: this.cache as RequestCache,
        redirect: this.redirect as RequestRedirect,
        referrerPolicy: this.referrerPolicy as ReferrerPolicy,
        integrity: this.integrity,
        keepalive: this.keepalive,
        signal: this.signal
      });
    },
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    bodyUsed: false
  };
  return request as unknown as Request;
};

// Set up global mocks
global.Headers = MockHeaders as any;
global.Response = MockResponse as any;
global.Request = mockRequest as any;

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    forEach: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    toString: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn().mockImplementation((body: any, init?: ResponseInit) => new MockResponse(body, init)),
    redirect: vi.fn(),
  },
  NextRequest: mockRequest,
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(() => Promise.resolve(null)),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt = '', width = 200, height = 200, ...props }: any) {
    // Ensure required properties are present
    const imgProps = {
      src,
      alt,
      width: typeof width === 'string' ? parseInt(width, 10) : width,
      height: typeof height === 'string' ? parseInt(height, 10) : height,
      loading: props.loading || 'lazy',
      decoding: props.decoding || 'async',
      style: {
        maxWidth: '100%',
        height: 'auto',
        ...props.style
      },
      ...props
    };
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', imgProps);
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock canvas and related APIs
class MockCanvasContext {
  drawImage = vi.fn();
  canvas: any;

  constructor(canvas: any) {
    this.canvas = canvas;
  }
}

class MockCanvas {
  width: number = 0;
  height: number = 0;
  style: any = {};
  getContext = vi.fn().mockReturnValue(new MockCanvasContext(this));
  toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock');
  toBlob = vi.fn().mockImplementation(callback => callback(new Blob()));
}

global.HTMLCanvasElement = MockCanvas as any;

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve(new MockResponse())
) as unknown as typeof fetch;

// Add cleanup
afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  window.localStorage.clear();
});

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Suppress console warnings and errors in tests
beforeAll(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Set test environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock window.URL
class MockURL {
  pathname: string;
  searchParams: URLSearchParams;
  href: string;

  constructor(url: string, base?: string) {
    this.pathname = url.split('?')[0];
    this.searchParams = new URLSearchParams(url.split('?')[1] || '');
    this.href = url;
  }
}

global.URL = MockURL as any;

// Mock Image with proper dimensions
class MockImage {
  width: number = 800;
  height: number = 600;
  src: string = '';
  onload: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;

  constructor() {
    setTimeout(() => {
      if (this.src && this.onload) {
        this.onload();
      }
    }, 10);
  }

  decode() {
    return Promise.resolve();
  }
}

Object.defineProperty(global, 'Image', {
  value: MockImage,
});

// Mock window.URL
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback: Function) {
    this.callback = callback;
  }
  callback: Function;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback: Function) {
    this.callback = callback;
  }
  callback: Function;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  value: MockResizeObserver,
});

// Mock useAuth using Jest's built-in mock functionality
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '123',
      email: 'test@example.com',
      name: 'Test User'
    },
    loading: false
  })
}));

// Mock useImageValidation hook
jest.mock('@/hooks/useImageValidation', () => ({
  useImageValidation: () => {
    const [isValidating, setIsValidating] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const validateImage = async (file: File) => {
      setIsValidating(true);
      setError(null);

      try {
        if (!file || !file.type.startsWith('image/')) {
          const error = new Error('Invalid file type. Please upload an image.');
          setError(error);
          return false;
        }

        if (file.size > 1024 * 1024) {
          const error = new Error('File size exceeds the maximum limit of 1MB.');
          setError(error);
          return false;
        }

        const allowedExtensions = ['.png', '.gif'];
        const fileName = file.name.toLowerCase();
        if (!allowedExtensions.some(ext => fileName.endsWith(ext))) {
          const error = new Error('Invalid file extension. Allowed extensions: .png, .gif');
          setError(error);
          return false;
        }

        // Validate dimensions
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = URL.createObjectURL(file);
        });

        if (img.width < 100 || img.height < 100) {
          const error = new Error('Image dimensions must be at least 100x100 pixels.');
          setError(error);
          return false;
        }

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to validate image.');
        setError(error);
        return false;
      } finally {
        setIsValidating(false);
      }
    };

    return {
      validateImage,
      isValidating,
      error
    };
  }
}));

// Mock useImageOptimization hook
jest.mock('@/hooks/useImageOptimization', () => ({
  useImageOptimization: () => {
    const [isOptimizing, setIsOptimizing] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const optimizeImage = async (file: File) => {
      setIsOptimizing(true);
      setError(null);

      try {
        if (!file || !file.type.startsWith('image/')) {
          throw new Error('Invalid image file');
        }

        // Create a smaller version of the image
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = URL.createObjectURL(file);
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const optimizedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob || new Blob()), 'image/jpeg', 0.8);
        });

        return new File([optimizedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), {
          type: 'image/jpeg'
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to optimize image');
        setError(error);
        throw error;
      } finally {
        setIsOptimizing(false);
      }
    };

    const getCompressionRatio = () => '50%';

    return {
      optimizeImage,
      isOptimizing,
      error,
      getCompressionRatio
    };
  }
}));

// Mock useImagePreload hook
jest.mock('@/hooks/useImagePreload', () => ({
  useImagePreload: () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [loadedUrls, setLoadedUrls] = React.useState([]);
    const [error, setError] = React.useState(null);
    const isCancelled = React.useRef(false);

    const preloadImages = async (urls) => {
      if (!urls || urls.length === 0) {
        return [];
      }

      setIsLoading(true);
      setProgress(0);
      setError(null);
      isCancelled.current = false;

      try {
        const loaded = [];
        const total = urls.length;

        for (let i = 0; i < total && !isCancelled.current; i++) {
          const url = urls[i];
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              loaded.push(url);
              setLoadedUrls(loaded);
              setProgress(Math.round(((i + 1) / total) * 100));
              resolve(undefined);
            };
            img.onerror = reject;
            img.src = url;
          });
        }

        if (isCancelled.current) {
          throw new Error('Preloading cancelled');
        }

        return urls;
      } catch (err) {
        setError('Failed to preload images');
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    const cancel = () => {
      isCancelled.current = true;
    };

    return {
      preloadImages,
      isLoading,
      progress,
      loadedUrls,
      error,
      cancel
    };
  }
}));

// Mock useAuth hook
jest.mock('@/app/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
  })),
}));

// Mock dbConnect
jest.mock('@/app/lib/db-config', () => ({
  dbConnect: vi.fn().mockResolvedValue(true),
}));

// Mock TestDbHelper
jest.mock('@/scripts/test-data/utils/test-db-helper', () => {
  const mockCollection = {
    find: vi.fn().mockReturnThis(),
    findOne: vi.fn().mockResolvedValue(null),
    insertOne: vi.fn().mockResolvedValue({ insertedId: 'mock-id' }),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    aggregate: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockResolvedValue([]),
    listCollections: vi.fn().mockResolvedValue([]),
  };

  return {
    TestDbHelper: vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(true),
      disconnect: vi.fn().mockResolvedValue(true),
      db: {
        collection: vi.fn().mockReturnValue(mockCollection),
        listCollections: vi.fn().mockResolvedValue([]),
      },
    })),
  };
});

// Add missing fetch mock
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
  })
) as vi.Mock; 