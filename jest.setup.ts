import { jest, expect } from '@jest/globals';
import { vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Define types for global objects
declare global {
  interface Window {
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
    localStorage: Storage;
    sessionStorage: Storage;
    matchMedia: (query: string) => MediaQueryList;
    ResizeObserver: typeof ResizeObserver;
    IntersectionObserver: typeof IntersectionObserver;
    React: typeof React;
    jest: typeof jest;
    fetch: typeof fetch;
    Headers: typeof Headers;
  }
}

interface IteratorObject<T, TReturn = unknown, TNext = undefined> {
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
Object.assign(window, {
  TextEncoder,
  TextDecoder
});

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
  private bodyUsed = false;
  private bodyContent: BodyInit | null;

  get bodyUsed(): boolean {
    return this.bodyUsed;
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
  }

  private markAsUsed(): void {
    if (this.bodyUsed) throw new Error('Body already read');
    this.bodyUsed = true;
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

  async json<T>(): Promise<T> {
    this.markAsUsed();
    if (!this.bodyContent) return null as unknown as T;
    if (typeof this.bodyContent === 'string') return JSON.parse(this.bodyContent);
    return this.bodyContent as T;
  }

  async text(): Promise<string> {
    this.markAsUsed();
    if (!this.bodyContent) return '';
    if (typeof this.bodyContent === 'string') return this.bodyContent;
    if (this.bodyContent instanceof Blob) return await this.bodyContent.text();
    return String(this.bodyContent);
  }

  clone(): Response {
    if (this.bodyUsed) throw new Error('Body already read');
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

type MockRequestFunction = (input: string | URL | Request, init?: MockRequestInit) => Request;

const mockRequest: MockRequestFunction = (input, init) => {
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

  return {
    headers,
    method: init?.method || 'GET',
    url: input instanceof URL ? input.toString() : input.toString(),
    body: init?.body || null,
    cache: init?.cache || 'default',
    credentials: init?.credentials || 'same-origin',
    integrity: init?.integrity || '',
    keepalive: init?.keepalive || false,
    mode: init?.mode || 'cors',
    redirect: init?.redirect || 'follow',
    referrer: init?.referrer || 'about:client',
    referrerPolicy: init?.referrerPolicy || '',
    signal: init?.signal || null,
  } as unknown as Request;
};

// 4. Set up global fetch mock
Object.assign(window, {
  fetch: vi.fn().mockImplementation((_input: RequestInfo | URL, _init?: RequestInit) => {
    return Promise.resolve(new MockResponse(null, { status: 200 }));
  })
});

// 5. Set up global Headers mock
Object.assign(window, {
  Headers: MockHeaders
});

// 6. Set up React mock
Object.assign(window, {
  React
});

// 7. Set up Jest mock functions
Object.assign(window, {
  jest
});

// 8. Set up localStorage mock
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

Object.assign(window, {
  localStorage: new LocalStorageMock(),
  sessionStorage: new LocalStorageMock()
});

// 9. Set up matchMedia mock
Object.assign(window, {
  matchMedia: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
});

// 10. Set up ResizeObserver mock
Object.assign(window, {
  ResizeObserver: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
});

// 11. Set up IntersectionObserver mock
Object.assign(window, {
  IntersectionObserver: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
});

// 12. Set up URL.createObjectURL mock
Object.assign(window, {
  URL: {
    createObjectURL: vi.fn(),
    revokeObjectURL: vi.fn()
  }
});