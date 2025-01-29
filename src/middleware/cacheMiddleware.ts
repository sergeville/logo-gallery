import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RequestCacheService } from '@/lib/services/cache/RequestCacheService';

interface CacheConfig {
  ttl?: number;
  strategy?: string;
  tags?: string[];
  methods?: string[];
  paths?: string[];
  exclude?: {
    methods?: string[];
    paths?: string[];
    headers?: string[];
  };
}

const defaultConfig: CacheConfig = {
  ttl: 3600, // 1 hour
  methods: ['GET'],
  paths: ['/api/logos', '/api/stats'],
  exclude: {
    methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
    paths: ['/api/auth', '/api/upload'],
    headers: ['authorization', 'cookie'],
  },
};

export function createCacheMiddleware(config: CacheConfig = {}) {
  const mergedConfig = { ...defaultConfig, ...config };
  const cacheService = new RequestCacheService();

  return async function cacheMiddleware(
    request: NextRequest,
    response: NextResponse
  ) {
    const { method, url, headers } = request;
    const parsedUrl = new URL(url);

    // Check if request should be cached
    if (!shouldCache(request, mergedConfig)) {
      return response;
    }

    // Try to get from cache
    const cachedResponse = await cacheService.get(
      method,
      parsedUrl.pathname,
      Object.fromEntries(parsedUrl.searchParams),
      {
        ttl: mergedConfig.ttl,
        strategy: mergedConfig.strategy,
        tags: mergedConfig.tags,
      }
    );

    if (cachedResponse) {
      return cachedResponse;
    }

    // Cache the response
    try {
      const clonedResponse = response.clone();
      await cacheService.set(
        method,
        parsedUrl.pathname,
        clonedResponse,
        Object.fromEntries(parsedUrl.searchParams),
        {
          ttl: mergedConfig.ttl,
          strategy: mergedConfig.strategy,
          tags: mergedConfig.tags,
        }
      );
    } catch (error) {
      console.error('Failed to cache response:', error);
    }

    return response;
  };
}

function shouldCache(request: NextRequest, config: CacheConfig): boolean {
  const { method, url, headers } = request;
  const parsedUrl = new URL(url);
  const path = parsedUrl.pathname;

  // Check method
  if (config.methods && !config.methods.includes(method)) {
    return false;
  }

  // Check path
  if (config.paths && !config.paths.some(p => path.startsWith(p))) {
    return false;
  }

  // Check excluded methods
  if (config.exclude?.methods?.includes(method)) {
    return false;
  }

  // Check excluded paths
  if (
    config.exclude?.paths?.some(excludedPath => path.startsWith(excludedPath))
  ) {
    return false;
  }

  // Check excluded headers
  if (config.exclude?.headers) {
    for (const header of config.exclude.headers) {
      if (headers.has(header)) {
        return false;
      }
    }
  }

  return true;
}

// Export a configured instance with default settings
export const cacheMiddleware = createCacheMiddleware(); 