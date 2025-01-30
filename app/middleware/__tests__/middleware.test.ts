import { NextRequest, NextResponse } from 'next/server';
import { createCacheMiddleware } from '../cacheMiddleware';
import { createPerformanceMiddleware } from '../performanceMiddleware';
import { imageCacheService } from '@/app/lib/services/ImageCacheService';
import { performanceMonitor } from '@/app/lib/services/PerformanceMonitoringService';
import { getSession } from 'next-auth/react';

interface MockResponse extends NextResponse {
  data?: any;
  headers: Headers;
  status: number;
  clone: () => MockResponse;
}

describe('Middleware Tests', () => {
  let mockNextResponse: MockResponse;

  beforeEach(() => {
    mockNextResponse = {
      data: {},
      headers: new Headers(),
      status: 200,
      clone: jest.fn().mockImplementation(function(this: MockResponse) {
        return {
          arrayBuffer: () => Promise.resolve(Buffer.from(JSON.stringify(this.data))),
          headers: this.headers,
          status: this.status
        };
      })
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle response cloning', async () => {
    const response = mockNextResponse.clone();
    expect(response).toBeDefined();
    expect(response.headers).toBeDefined();
    expect(response.status).toBe(200);
  });

  it('should handle array buffer conversion', async () => {
    const response = mockNextResponse.clone();
    const buffer = await response.arrayBuffer();
    expect(buffer).toBeDefined();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});

jest.mock('@/app/lib/services/ImageCacheService', () => ({
  imageCacheService: {
    getImage: jest.fn(),
    cacheImage: jest.fn(),
    setImage: jest.fn()
  }
}));

jest.mock('next/server', () => {
  return {
    ...jest.requireActual('next/server'),
    NextResponse: {
      json: (...args) => {
        const response = mockNextResponse.json(...args);
        response.headers = new Headers();
        response.headers.set('X-Cache', 'HIT');
        return response;
      }
    },
    NextRequest: jest.fn().mockImplementation((input) => {
      return {
        url: input,
        method: 'GET',
        headers: new Headers(),
        clone: () => this
      };
    })
  };
});

jest.mock('@/app/lib/services/PerformanceMonitoringService', () => ({
  performanceMonitor: {
    recordApiMetrics: jest.fn().mockResolvedValue(undefined)
  }
}));

describe('Cache Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should bypass cache for non-GET requests', async () => {
    const middleware = createCacheMiddleware();
    const request = new NextRequest('http://localhost:3000/api/logos', {
      method: 'POST',
    });
    const next = jest.fn().mockResolvedValue(new NextResponse());

    const response = await middleware(request, next);
    expect(response).toBeDefined();
    expect(imageCacheService.getImage).not.toHaveBeenCalled();
  });

  it('should bypass cache for non-configured paths', async () => {
    const middleware = createCacheMiddleware();
    const request = new NextRequest('http://localhost:3000/api/uncached');
    const next = jest.fn().mockResolvedValue(new NextResponse());

    const response = await middleware(request, next);
    expect(response).toBeDefined();
    expect(imageCacheService.getImage).not.toHaveBeenCalled();
  });

  it('should return cached response if available', async () => {
    const middleware = createCacheMiddleware();
    const request = new NextRequest('http://localhost:3000/api/logos');
    const cachedResponse = new NextResponse(JSON.stringify({ data: 'cached' }), {
      headers: { 'Content-Type': 'application/json' },
    });

    (imageCacheService.getImage as jest.Mock).mockResolvedValueOnce(cachedResponse);

    const next = jest.fn();
    const response = await middleware(request, next);

    expect(response).toBe(cachedResponse);
    expect(next).not.toHaveBeenCalled();
  });

  it('should cache new response if not in cache', async () => {
    const middleware = createCacheMiddleware();
    const request = new NextRequest('http://localhost:3000/api/logos');
    const newResponse = new NextResponse(JSON.stringify({ data: 'new' }), {
      headers: { 'Content-Type': 'application/json' },
    });

    (imageCacheService.getImage as jest.Mock).mockResolvedValueOnce(null);
    const next = jest.fn().mockResolvedValue(newResponse);

    const response = await middleware(request, next);
    expect(response).toBeDefined();
    expect(imageCacheService.getImage).toHaveBeenCalled();
    expect(imageCacheService.setImage).toHaveBeenCalled();
  });

  it('should handle cache errors gracefully', async () => {
    const middleware = createCacheMiddleware();
    const request = new NextRequest('http://localhost:3000/api/logos');
    const next = jest.fn().mockResolvedValue(new NextResponse());

    (imageCacheService.getImage as jest.Mock).mockRejectedValueOnce(new Error('Cache error'));

    const response = await middleware(request, next);
    expect(response).toBeDefined();
    expect(imageCacheService.getImage).toHaveBeenCalled();
  });
});

describe('Performance Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should record successful request metrics', async () => {
    const middleware = createPerformanceMiddleware();
    const request = new NextRequest('http://localhost:3000/api/logos');
    const next = jest.fn().mockResolvedValue(
      new NextResponse(null, { status: 200 })
    );

    const response = await middleware(request, next);
    expect(response.status).toBe(200);
    expect(performanceMonitor.recordMetric).toHaveBeenCalledWith(
      expect.stringContaining('request_duration'),
      expect.any(Number),
      { path: '/api/logos', status: 200 }
    );
  });

  it('should record error metrics on request failure', async () => {
    const middleware = createPerformanceMiddleware();
    const request = new NextRequest('http://localhost:3000/api/logos');
    const next = jest.fn().mockResolvedValue(
      new NextResponse(null, { status: 500 })
    );

    const response = await middleware(request, next);
    expect(response.status).toBe(500);
    expect(performanceMonitor.recordMetric).toHaveBeenCalledWith(
      expect.stringContaining('request_duration'),
      expect.any(Number),
      { path: '/api/logos', status: 500 }
    );
  });

  it('should handle metric recording errors gracefully', async () => {
    const middleware = createPerformanceMiddleware();
    const request = new NextRequest('http://localhost:3000/api/logos');
    const next = jest.fn().mockResolvedValue(
      new NextResponse(null, { status: 200 })
    );

    (performanceMonitor.recordMetric as jest.Mock).mockRejectedValueOnce(
      new Error('Metric error')
    );

    const response = await middleware(request, next);
    expect(response.status).toBe(200);
  });
}); 