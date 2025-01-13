// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import fetch, { Request, Response, Headers } from 'node-fetch'

// Mock fetch globally
global.fetch = fetch
global.Request = Request
global.Response = Response
global.Headers = Headers

// Mock NextResponse
global.NextResponse = {
  json: (data, init) => {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      }
    });
  }
};

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }),
  headers: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  })
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    set: jest.fn()
  })
}));

// Mock crypto for NextRequest
global.crypto = {
  getRandomValues: function(buffer) {
    return require('crypto').randomFillSync(buffer)
  },
  subtle: {}
}

// Mock TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder; 