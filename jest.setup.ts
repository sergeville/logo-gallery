require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');
import React from 'react';
import { jest } from '@jest/globals';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Add Response global
global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
  }

  json() {
    return Promise.resolve(this.body);
  }
};

// Mock Request and NextRequest
const mockRequest = function(input, init) {
  return {
    url: input,
    method: init?.method || 'GET',
    headers: new Headers(init?.headers),
    body: init?.body,
  };
};

global.Request = mockRequest;

// Mock next/server
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextRequest: mockRequest,
    NextResponse: {
      json: jest.fn().mockImplementation((body, init) => new Response(body, init)),
      redirect: jest.fn(),
    },
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: '2024-12-31',
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next-auth/next
jest.mock('next-auth/next', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
  })),
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
    expires: '2024-12-31',
  })),
}));

// Mock MongoDB
jest.mock('mongodb', () => {
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    aggregate: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue([]),
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };

  const mockClient = {
    connect: jest.fn().mockResolvedValue(true),
    db: jest.fn().mockReturnValue(mockDb),
    close: jest.fn().mockResolvedValue(true),
  };

  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
    ObjectId: jest.fn(id => id),
  };
});

// Mock mongoose
jest.mock('mongoose', () => {
  const mockModel = {
    findByUserId: jest.fn().mockResolvedValue([]),
    searchByTitle: jest.fn().mockResolvedValue([]),
    safeDelete: jest.fn().mockResolvedValue({ success: true }),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue([]),
    exec: jest.fn().mockResolvedValue(null),
  };

  return {
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    model: jest.fn().mockReturnValue(mockModel),
    models: {
      Logo: null,
      User: null
    },
    Schema: jest.fn().mockImplementation(() => ({
      pre: jest.fn().mockReturnThis(),
      index: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      virtual: jest.fn().mockReturnThis(),
      methods: {},
      statics: {},
    })),
    Types: {
      ObjectId: String,
      Mixed: class Mixed {},
      Decimal128: class Decimal128 {},
    },
  };
});

// Mock the Logo model
jest.mock('@/app/lib/models/logo');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Update URL mock with proper TypeScript interface
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

// Mock canvas and related APIs
class MockCanvasContext {
  drawImage = jest.fn();
  canvas: any;

  constructor(canvas: any) {
    this.canvas = canvas;
  }
}

class MockCanvas {
  width: number = 0;
  height: number = 0;
  style: any = {};

  getContext() {
    return new MockCanvasContext(this);
  }

  toBlob(callback: (blob: Blob) => void) {
    const blob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    callback(blob);
  }

  toDataURL() {
    return 'data:image/jpeg;base64,mock-image-data';
  }
}

// @ts-ignore - Replace global HTMLCanvasElement
global.HTMLCanvasElement = MockCanvas;

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
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn(),
  },
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback: Function) {
    this.callback = callback;
  }
  callback: Function;
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
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
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  value: MockResizeObserver,
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
  })
);

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(),
    forEach: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(() => Promise.resolve(null)),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => React.createElement('img', props),
}));

// Mock Headers
global.Headers = class {
  private headers: { [key: string]: string } = {};

  append(name: string, value: string) {
    this.headers[name.toLowerCase()] = value;
  }

  delete(name: string) {
    delete this.headers[name.toLowerCase()];
  }

  get(name: string) {
    return this.headers[name.toLowerCase()] || null;
  }

  has(name: string) {
    return name.toLowerCase() in this.headers;
  }

  set(name: string, value: string) {
    this.headers[name.toLowerCase()] = value;
  }

  forEach(callback: (value: string, name: string) => void) {
    Object.entries(this.headers).forEach(([name, value]) => callback(value, name));
  }
};

// Update NextResponse mock
const mockNextResponse = {
  json: (data: any, init?: ResponseInit) => ({
    ...mockNextResponse,
    data,
    status: init?.status || 200,
    headers: new Headers(init?.headers),
    clone: function() { return this; }
  }),
  redirect: (url: string) => ({
    ...mockNextResponse,
    url,
    status: 302,
    headers: new Headers({ Location: url })
  }),
  next: () => mockNextResponse,
  rewrite: (url: string) => ({
    ...mockNextResponse,
    url,
    headers: new Headers()
  })
};

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse,
  NextRequest: jest.fn().mockImplementation((input) => ({
    url: input,
    method: 'GET',
    headers: new Headers(),
    nextUrl: new MockURL(input),
    clone: function() { return this; }
  }))
}));

// Mock console methods
const originalError = console.error;
console.error = (...args) => {
  const message = String(args[0]);
  if (
    message.includes('Warning: ReactDOM.render is no longer supported') ||
    message.includes('Please add your Mongo URI to .env.local')
  ) {
    return;
  }
  originalError(...args);
};

// Set test environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Initialize global.jest if it doesn't exist
if (!global.jest) {
  global.jest = {
    fn: () => jest.fn()
  };
}

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

// Mock Image optimization
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props) {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', props);
  },
}));

// Mock useImageValidation hook
jest.mock('@/hooks/useImageValidation', () => ({
  useImageValidation: () => {
    const [isValidating, setIsValidating] = React.useState(false);
    const [error, setError] = React.useState(null);

    const validateImage = async (file) => {
      setIsValidating(true);
      setError(null);

      try {
        if (!file || !file.type.startsWith('image/')) {
          setError('Invalid file type. Please upload an image.');
          return false;
        }

        if (file.size > 1024 * 1024) {
          setError('File size exceeds the maximum limit of 1MB.');
          return false;
        }

        const allowedExtensions = ['.png', '.gif'];
        const fileName = file.name.toLowerCase();
        if (!allowedExtensions.some(ext => fileName.endsWith(ext))) {
          setError('Invalid file extension. Allowed extensions: .png, .gif');
          return false;
        }

        // Validate dimensions
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });

        if (img.width < 100 || img.height < 100) {
          setError('Image dimensions must be at least 100x100 pixels.');
          return false;
        }

        return true;
      } catch (err) {
        setError('Failed to validate image.');
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
    const [error, setError] = React.useState(null);

    const optimizeImage = async (file) => {
      setIsOptimizing(true);
      setError(null);

      try {
        if (!file || !file.type.startsWith('image/')) {
          throw new Error('Invalid image file');
        }

        // Create a smaller version of the image
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedBlob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', 0.8);
        });

        return new File([optimizedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), {
          type: 'image/jpeg'
        });
      } catch (err) {
        setError(err.message);
        throw err;
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

// Add proper cleanup between tests
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear localStorage
  window.localStorage.clear();
  
  // Clear URL object mocks
  URL.createObjectURL.mockClear();
  URL.revokeObjectURL.mockClear();
  
  // Reset fetch mock
  global.fetch.mockClear();
});

// Add proper async handling
beforeAll(() => {
  // Increase timeout for all tests
  jest.setTimeout(30000);
  
  // Mock createImageBitmap globally
  global.createImageBitmap = jest.fn().mockResolvedValue({
    width: 1920,
    height: 1080
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Fail the test if there are unhandled rejections
  throw reason;
});

// Instead of declaring a new jest object, extend the existing one
Object.assign(global.jest, {
  clearAllMocks: jest.fn(),
  resetAllMocks: jest.fn(),
  restoreAllMocks: jest.fn()
});

// Suppress console warnings and errors in tests
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  jest.restoreAllMocks()
})

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

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
}) 