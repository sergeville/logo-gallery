import LRUCache from 'lru-cache';

interface CachedImage {
  buffer: Buffer;
  contentType: string;
  lastAccessed: number;
}

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  buffer?: Buffer;
  contentType?: string;
}

export class ImageCacheService {
  private memoryCache: LRUCache<string, CachedImage>;

  constructor(maxMemorySize: number = 100 * 1024 * 1024) { // 100MB default memory cache
    this.memoryCache = new LRUCache({
      max: 500, // Maximum number of items
      maxSize: maxMemorySize,
      sizeCalculation: (value) => value.buffer.length,
      ttl: 1000 * 60 * 60, // 1 hour
      allowStale: false,
      updateAgeOnGet: true,
      updateAgeOnHas: false
    });
  }

  private generateCacheKey(imagePath: string, options?: ImageProcessingOptions): string {
    // Simple hash function for strings
    let str = imagePath + JSON.stringify(options || {});
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  async getImage(
    imagePath: string,
    options?: ImageProcessingOptions
  ): Promise<{ buffer: Buffer; contentType: string } | null> {
    const cacheKey = this.generateCacheKey(imagePath, options);

    // Try memory cache first
    const memoryCache = this.memoryCache.get(cacheKey);
    if (memoryCache) {
      return {
        buffer: memoryCache.buffer,
        contentType: memoryCache.contentType
      };
    }

    // If options include buffer and contentType, cache them
    if (options?.buffer && options?.contentType) {
      const cacheEntry = {
        buffer: options.buffer,
        contentType: options.contentType,
        lastAccessed: Date.now()
      };
      this.memoryCache.set(cacheKey, cacheEntry);
      return {
        buffer: options.buffer,
        contentType: options.contentType
      };
    }

    return null;
  }

  async clearCache(): Promise<void> {
    this.memoryCache.clear();
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService();