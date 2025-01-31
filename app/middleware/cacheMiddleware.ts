import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redisCacheService } from '@/app/lib/services/cache/RedisCacheService';
import { createHash } from 'crypto';

interface CacheConfig {
  ttl?: number;
  paths?: string[];
  methods?: string[];
  headers?: {
    [key: string]: string;
  };
  varyByQuery?: boolean;
  varyByHeaders?: string[];
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 3600, // 1 hour
  paths: ['/api/images', '/api/logos', '/api/auth/session'],
  methods: ['GET'],
  headers: {
    'Cache-Control': 'public, max-age=3600',
    'X-Cache-Status': 'HIT'
  },
  varyByQuery: true,
  varyByHeaders: ['accept', 'accept-encoding']
};

export async function cacheMiddleware(
  request: NextRequest,
  response?: NextResponse,
  config: CacheConfig = {}
): Promise<NextResponse | undefined> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Only cache configured methods
  if (!finalConfig.methods?.includes(request.method)) {
    return response;
  }

  // Only cache configured paths
  const requestPath = new URL(request.url).pathname;
  if (!finalConfig.paths?.some(path => requestPath.startsWith(path))) {
    return response;
  }

  // Generate cache key
  const key = await generateCacheKey(request, finalConfig);

  // Try to get from cache
  const cachedResponse = await redisCacheService.get(key);
  if (cachedResponse) {
    // Add cache status header
    cachedResponse.headers.set('X-Cache-Status', 'HIT');
    return cachedResponse;
  }

  // If no cached response and no new response, return
  if (!response) {
    return undefined;
  }

  // Add cache status header
  response.headers.set('X-Cache-Status', 'MISS');

  // Add configured headers
  Object.entries(finalConfig.headers || {}).forEach(([name, value]) => {
    response.headers.set(name, value);
  });

  // Cache the response
  await redisCacheService.set(key, response, finalConfig.ttl);

  return response;
}

async function generateCacheKey(request: NextRequest, config: CacheConfig): Promise<string> {
  const url = new URL(request.url);
  const components = [
    request.method,
    url.pathname,
    config.varyByQuery ? url.search : '',
  ];

  // Add vary by headers
  if (config.varyByHeaders?.length) {
    const headerValues = config.varyByHeaders
      .map(header => request.headers.get(header) || '')
      .join('|');
    components.push(headerValues);
  }

  // Create hash of components
  return createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
} 