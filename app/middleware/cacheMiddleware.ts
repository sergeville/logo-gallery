import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { imageCacheService } from '@/app/lib/services/ImageCacheService';

interface CacheConfig {
  ttl?: number;
  maxSize?: number;
  paths?: string[];
  methods?: string[];
  headers?: {
    [key: string]: string;
  };
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 100 * 1024 * 1024, // 100MB
  paths: ['/api/images', '/api/logos'],
  methods: ['GET'],
  headers: {
    'Cache-Control': 'public, max-age=3600'
  }
};

export function createCacheMiddleware(config: CacheConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async function cacheMiddleware(
    request: NextRequest,
    response?: NextResponse
  ) {
    // Only cache configured methods
    if (!finalConfig.methods?.includes(request.method)) {
      return response;
    }

    // Only cache configured paths
    const requestPath = new URL(request.url).pathname;
    if (!finalConfig.paths?.some(path => requestPath.startsWith(path))) {
      return response;
    }

    // Generate cache key from request
    const cacheKey = await generateCacheKey(request);

    try {
      // Check if we have a cached response
      const cachedResponse = await getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }

      // If no cached response and no response provided, return null
      if (!response) {
        return null;
      }

      // Cache the response
      await cacheResponse(cacheKey, response);

      // Add cache headers
      Object.entries(finalConfig.headers || {}).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('Cache middleware error:', error);
      return response;
    }
  };
}

async function generateCacheKey(request: NextRequest): Promise<string> {
  const url = new URL(request.url);
  return `${request.method}:${url.pathname}${url.search}`;
}

async function getCachedResponse(key: string): Promise<NextResponse | null> {
  try {
    const cached = await imageCacheService.getImage(key);
    if (cached) {
      const response = NextResponse.json(cached.buffer, {
        headers: {
          'Content-Type': cached.contentType,
          'X-Cache': 'HIT'
        }
      });
      return response;
    }
  } catch (error) {
    console.error('Error getting cached response:', error);
  }
  return null;
}

async function cacheResponse(key: string, response: NextResponse): Promise<void> {
  try {
    const clone = response.clone();
    const buffer = await clone.arrayBuffer();
    const contentType = clone.headers.get('Content-Type') || 'application/octet-stream';
    
    await imageCacheService.cacheImage(key, {
      buffer: Buffer.from(buffer),
      contentType
    });
  } catch (error) {
    console.error('Error caching response:', error);
  }
}

export const cacheMiddleware = createCacheMiddleware(); 