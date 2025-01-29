import { cacheConfig } from '@/config/cache.config';
import { ImageCacheService } from '@/src/lib/services/cache/ImageCacheService';
import crypto from 'crypto';

interface CacheOptions {
  ttl?: number;
  strategy?: string;
  key?: string;
  tags?: string[];
}

interface CachedResponse {
  data: any;
  headers: Record<string, string>;
  status: number;
  timestamp: number;
}

export class RequestCacheService {
  private cacheService: ImageCacheService;

  constructor() {
    this.cacheService = new ImageCacheService();
  }

  private generateCacheKey(method: string, url: string, params: any = {}): string {
    const data = {
      method: method.toUpperCase(),
      url,
      params,
    };
    
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');

    return `req:${hash}`;
  }

  private isResponseCacheable(response: Response): boolean {
    // Check cache-control header
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) {
      if (cacheControl.includes('no-store') || cacheControl.includes('no-cache')) {
        return false;
      }
    }

    // Check response status
    if (!response.ok || response.status !== 200) {
      return false;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return false;
    }

    return true;
  }

  private async serializeResponse(response: Response): Promise<CachedResponse> {
    const data = await response.json();
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      data,
      headers,
      status: response.status,
      timestamp: Date.now(),
    };
  }

  private createResponse(cached: CachedResponse): Response {
    return new Response(JSON.stringify(cached.data), {
      status: cached.status,
      headers: cached.headers,
    });
  }

  async get(
    method: string,
    url: string,
    params: any = {},
    options: CacheOptions = {}
  ): Promise<Response | null> {
    const cacheKey = options.key || this.generateCacheKey(method, url, params);
    
    try {
      const cachedData = await this.cacheService.get(cacheKey, options.strategy);
      if (cachedData) {
        const cached = JSON.parse(cachedData.toString()) as CachedResponse;
        
        // Check if cache has expired
        const now = Date.now();
        const maxAge = options.ttl || cacheConfig.strategies.optimized.ttl;
        if (now - cached.timestamp > maxAge * 1000) {
          await this.cacheService.delete(cacheKey, options.strategy);
          return null;
        }

        return this.createResponse(cached);
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }

    return null;
  }

  async set(
    method: string,
    url: string,
    response: Response,
    params: any = {},
    options: CacheOptions = {}
  ): Promise<void> {
    if (!this.isResponseCacheable(response)) {
      return;
    }

    const cacheKey = options.key || this.generateCacheKey(method, url, params);
    
    try {
      const clonedResponse = response.clone();
      const serialized = await this.serializeResponse(clonedResponse);
      const buffer = Buffer.from(JSON.stringify(serialized));
      
      await this.cacheService.set(cacheKey, buffer, options.strategy);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(
    method: string,
    url: string,
    params: any = {},
    options: CacheOptions = {}
  ): Promise<void> {
    const cacheKey = options.key || this.generateCacheKey(method, url, params);
    
    try {
      await this.cacheService.delete(cacheKey, options.strategy);
      
      // Invalidate by tags if provided
      if (options.tags?.length) {
        for (const tag of options.tags) {
          const tagPattern = `req:${tag}:*`;
          // Note: This requires implementing pattern-based deletion in the cache service
          await this.cacheService.delete(tagPattern, options.strategy);
        }
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  async clear(strategy?: string): Promise<void> {
    try {
      await this.cacheService.clear(strategy);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
} 