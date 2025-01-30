import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '../rateLimitMiddleware';
import { performanceMiddleware } from '../performanceMiddleware';
import { cacheMiddleware } from '../cacheMiddleware';
import { cdnMiddleware } from '../cdnMiddleware';
import { imageCacheService } from '@/app/lib/services/ImageCacheService';
import { performanceMonitor } from '@/app/lib/services/PerformanceMonitoringService';
import { cdnService } from '@/app/lib/services/CDNService';

const mockNextResponse = {
  json: jest.fn().mockImplementation((data, options = {}) => ({
    data,
    headers: new Headers(),
    status: options.status || 200,
    clone: () => ({
      arrayBuffer: () => Promise.resolve(Buffer.from(JSON.stringify(data))),
      headers: new Headers(),
      status: options.status || 200
    })
  }))
};

jest.mock('@/app/lib/services/ImageCacheService');
jest.mock('@/app/lib/services/PerformanceMonitoringService');
jest.mock('@/app/lib/services/CDNService');

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should limit requests based on IP address', async () => {
    const middleware = rateLimitMiddleware({ limit: 2, windowMs: 1000 });
    const request = new NextRequest('http://localhost:3000/api');
    request.headers.set('x-forwarded-for', '127.0.0.1');

    // First request should pass
    let result = await middleware(request);
    expect(result.status).toBe(200);

    // Second request should pass
    result = await middleware(request);
    expect(result.status).toBe(200);

    // Third request should be rate limited
    result = await middleware(request);
    expect(result.status).toBe(429);
    expect(result.headers.get('Retry-After')).toBeDefined();
  });

  it('should handle distributed rate limiting', async () => {
    const middleware = rateLimitMiddleware({ 
      limit: 5, 
      windowMs: 1000,
      distributed: true 
    });
    const requests = Array(6).fill(null).map(() => middleware(
      new NextRequest('http://localhost:3000/api')
    ));

    const results = await Promise.all(requests);
    expect(results.filter(r => r.status === 200)).toHaveLength(5);
    expect(results.filter(r => r.status === 429)).toHaveLength(1);
  });
});

describe('Performance Budgets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enforce response time budgets', async () => {
    const middleware = performanceMiddleware({
      budgets: {
        responseTime: 100 // ms
      }
    });
    const request = new NextRequest('http://localhost:3000/api');
    const slowHandler = () => new Promise(resolve => 
      setTimeout(() => resolve(mockNextResponse.json({})), 150)
    );

    const result = await middleware(request, slowHandler);
    expect(performanceMonitor.recordBudgetViolation).toHaveBeenCalled();
    expect(result.headers.get('Server-Timing')).toContain('responseTime');
  });

  it('should track memory usage thresholds', async () => {
    const middleware = performanceMiddleware({
      budgets: {
        memoryMB: 100
      }
    });
    const request = new NextRequest('http://localhost:3000/api');
    
    // Simulate high memory usage
    const originalMemoryUsage = process.memoryUsage;
    process.memoryUsage = () => ({ heapUsed: 150 * 1024 * 1024 } as any);

    const result = await middleware(request, () => Promise.resolve(mockNextResponse.json({})));
    expect(performanceMonitor.recordBudgetViolation).toHaveBeenCalled();

    process.memoryUsage = originalMemoryUsage;
  });
});

describe('Image Optimization Metrics', () => {
  it('should track image optimization metrics', async () => {
    const middleware = performanceMiddleware();
    const request = new NextRequest('http://localhost:3000/api/images/test.jpg');
    const response = mockNextResponse.json({
      originalSize: 1000000,
      optimizedSize: 500000,
      format: 'webp'
    });

    const result = await middleware(request, () => Promise.resolve(response));
    expect(performanceMonitor.recordImageMetrics).toHaveBeenCalledWith({
      compressionRatio: 0.5,
      format: 'webp',
      originalSize: 1000000,
      optimizedSize: 500000
    });
  });
});

describe('Concurrent Request Handling', () => {
  it('should handle multiple concurrent requests', async () => {
    const middleware = cacheMiddleware();
    const requests = Array(10).fill(null).map((_, i) => 
      middleware(new NextRequest(`http://localhost:3000/api/images/${i}.jpg`))
    );

    const results = await Promise.all(requests);
    expect(results.every(r => r.status === 200)).toBe(true);
    expect(imageCacheService.getImage).toHaveBeenCalledTimes(10);
  });

  it('should maintain response order', async () => {
    const middleware = cacheMiddleware();
    const delays = [300, 200, 100];
    const requests = delays.map((delay, i) => {
      const handler = () => new Promise(resolve => 
        setTimeout(() => resolve(mockNextResponse.json({ id: i })), delay)
      );
      return middleware(new NextRequest(`http://localhost:3000/api/${i}`), handler);
    });

    const results = await Promise.all(requests);
    const ids = results.map(r => r.data.id);
    expect(ids).toEqual([0, 1, 2]);
  });
});

describe('Cache Eviction', () => {
  it('should evict items based on LRU policy', async () => {
    const middleware = cacheMiddleware({
      maxItems: 2,
      policy: 'lru'
    });

    // Add three items
    await middleware(new NextRequest('http://localhost:3000/api/1'));
    await middleware(new NextRequest('http://localhost:3000/api/2'));
    await middleware(new NextRequest('http://localhost:3000/api/3'));

    // First item should be evicted
    expect(imageCacheService.getImage).toHaveBeenCalledWith('1');
    expect(imageCacheService.removeImage).toHaveBeenCalledWith('1');
  });

  it('should handle memory pressure eviction', async () => {
    const middleware = cacheMiddleware({
      maxMemoryMB: 100
    });

    // Simulate memory pressure
    const originalMemoryUsage = process.memoryUsage;
    process.memoryUsage = () => ({ heapUsed: 150 * 1024 * 1024 } as any);

    await middleware(new NextRequest('http://localhost:3000/api/test'));
    expect(imageCacheService.clear).toHaveBeenCalled();

    process.memoryUsage = originalMemoryUsage;
  });
});

describe('CDN Integration', () => {
  it('should route requests through CDN', async () => {
    const middleware = cdnMiddleware();
    const request = new NextRequest('http://localhost:3000/api/images/test.jpg');

    await middleware(request);
    expect(cdnService.getUrl).toHaveBeenCalledWith('test.jpg');
    expect(cdnService.upload).toHaveBeenCalled();
  });

  it('should handle CDN failures gracefully', async () => {
    const middleware = cdnMiddleware();
    const request = new NextRequest('http://localhost:3000/api/images/test.jpg');

    (cdnService.getUrl as jest.Mock).mockRejectedValueOnce(new Error('CDN Error'));

    const result = await middleware(request);
    expect(result.status).toBe(200); // Should fall back to direct serving
  });
});

describe('Error Recovery', () => {
  it('should retry failed requests', async () => {
    const middleware = performanceMiddleware({
      retry: {
        attempts: 3,
        backoff: 100
      }
    });
    const request = new NextRequest('http://localhost:3000/api');
    const handler = jest.fn()
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce(mockNextResponse.json({}));

    const result = await middleware(request, handler);
    expect(result.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('should implement circuit breaker', async () => {
    const middleware = performanceMiddleware({
      circuitBreaker: {
        failureThreshold: 3,
        resetTimeout: 1000
      }
    });
    const request = new NextRequest('http://localhost:3000/api');

    // Trigger circuit breaker
    for (let i = 0; i < 3; i++) {
      await middleware(request, () => Promise.reject(new Error('Service down')));
    }

    // Circuit should be open
    const result = await middleware(request, () => Promise.resolve(mockNextResponse.json({})));
    expect(result.status).toBe(503);
  });
});

describe('Resource Cleanup', () => {
  it('should clean up temporary files', async () => {
    const middleware = performanceMiddleware();
    const request = new NextRequest('http://localhost:3000/api/upload');
    const cleanup = jest.fn();

    await middleware(request, async () => {
      const response = mockNextResponse.json({});
      response.cleanup = cleanup;
      return response;
    });

    expect(cleanup).toHaveBeenCalled();
  });

  it('should release database connections', async () => {
    const middleware = performanceMiddleware();
    const request = new NextRequest('http://localhost:3000/api/db');
    const releaseConnection = jest.fn();

    await middleware(request, async () => {
      const response = mockNextResponse.json({});
      response.releaseConnection = releaseConnection;
      return response;
    });

    expect(releaseConnection).toHaveBeenCalled();
  });
});

describe('Memory Usage', () => {
  it('should track memory leaks', async () => {
    const middleware = performanceMiddleware();
    const request = new NextRequest('http://localhost:3000/api');
    const initialMemory = process.memoryUsage().heapUsed;

    // Make multiple requests
    for (let i = 0; i < 100; i++) {
      await middleware(request, () => Promise.resolve(mockNextResponse.json({})));
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const leak = finalMemory - initialMemory;
    expect(leak).toBeLessThan(1024 * 1024); // Less than 1MB growth
  });

  it('should handle memory intensive operations', async () => {
    const middleware = performanceMiddleware();
    const request = new NextRequest('http://localhost:3000/api/memory');

    const result = await middleware(request, async () => {
      // Simulate memory intensive operation
      const data = Buffer.alloc(50 * 1024 * 1024); // 50MB
      return mockNextResponse.json({ size: data.length });
    });

    expect(result.status).toBe(200);
    expect(performanceMonitor.recordMemoryUsage).toHaveBeenCalled();
  });
});

describe('Load Balancing', () => {
  it('should distribute requests across instances', async () => {
    const middleware = performanceMiddleware({
      loadBalancing: {
        strategy: 'round-robin',
        instances: ['instance1', 'instance2', 'instance3']
      }
    });

    const requests = Array(6).fill(null).map(() => 
      middleware(new NextRequest('http://localhost:3000/api'))
    );

    const results = await Promise.all(requests);
    const instances = results.map(r => r.headers.get('X-Served-by'));
    
    expect(instances).toEqual([
      'instance1', 'instance2', 'instance3',
      'instance1', 'instance2', 'instance3'
    ]);
  });

  it('should handle instance failures', async () => {
    const middleware = performanceMiddleware({
      loadBalancing: {
        strategy: 'failover',
        instances: ['primary', 'secondary', 'backup']
      }
    });

    // Mock primary instance failure
    const handler = jest.fn()
      .mockRejectedValueOnce(new Error('Primary down'))
      .mockResolvedValueOnce(mockNextResponse.json({ instance: 'secondary' }));

    const result = await middleware(new NextRequest('http://localhost:3000/api'), handler);
    expect(result.data.instance).toBe('secondary');
  });
}); 