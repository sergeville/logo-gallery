import { LRUCache } from 'lru-cache';
import sharp from 'sharp';
import { readFile, writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import crypto from 'crypto';

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
}

export class ImageCacheService {
  private memoryCache: LRUCache<string, CachedImage>;
  private diskCachePath: string;

  constructor(
    maxMemorySize: number = 100 * 1024 * 1024, // 100MB default memory cache
    diskCachePath: string = join(process.cwd(), 'cache', 'images')
  ) {
    this.memoryCache = new LRUCache({
      max: maxMemorySize,
      // Calculate size of entries for maxSize limit
      sizeCalculation: (value) => value.buffer.length,
      // Remove from disk cache when evicted from memory
      dispose: (key, value) => {
        this.removeFromDiskCache(key).catch(console.error);
      }
    });
    this.diskCachePath = diskCachePath;
    this.initializeDiskCache().catch(console.error);
  }

  private async initializeDiskCache(): Promise<void> {
    try {
      await mkdir(this.diskCachePath, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize disk cache directory:', error);
    }
  }

  private generateCacheKey(imagePath: string, options?: ImageProcessingOptions): string {
    const data = JSON.stringify({ path: imagePath, options });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  private getDiskCachePath(key: string): string {
    return join(this.diskCachePath, `${key}.cache`);
  }

  private async saveToMemoryCache(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void> {
    this.memoryCache.set(key, {
      buffer,
      contentType,
      lastAccessed: Date.now()
    });
  }

  private async saveToDiskCache(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void> {
    const cachePath = this.getDiskCachePath(key);
    try {
      const cacheData = {
        buffer: buffer.toString('base64'),
        contentType,
        lastAccessed: Date.now()
      };
      await mkdir(dirname(cachePath), { recursive: true });
      await writeFile(cachePath, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save to disk cache:', error);
    }
  }

  private async removeFromDiskCache(key: string): Promise<void> {
    try {
      const cachePath = this.getDiskCachePath(key);
      await unlink(cachePath);
    } catch (error) {
      // Ignore if file doesn't exist
      if (error.code !== 'ENOENT') {
        console.error('Failed to remove from disk cache:', error);
      }
    }
  }

  private async processImage(
    buffer: Buffer,
    options?: ImageProcessingOptions
  ): Promise<{ buffer: Buffer; contentType: string }> {
    let image = sharp(buffer);

    if (options?.width || options?.height) {
      image = image.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    if (options?.format) {
      image = image.toFormat(options.format, {
        quality: options?.quality || 80
      });
    }

    const processedBuffer = await image.toBuffer();
    const metadata = await image.metadata();
    const contentType = `image/${metadata.format}`;

    return { buffer: processedBuffer, contentType };
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

    try {
      // Try disk cache
      const diskCachePath = this.getDiskCachePath(cacheKey);
      const diskCache = await readFile(diskCachePath, 'utf-8')
        .then(JSON.parse)
        .catch(() => null);

      if (diskCache) {
        const buffer = Buffer.from(diskCache.buffer, 'base64');
        await this.saveToMemoryCache(cacheKey, buffer, diskCache.contentType);
        return { buffer, contentType: diskCache.contentType };
      }

      // Process and cache the image
      const originalBuffer = await readFile(imagePath);
      const { buffer, contentType } = await this.processImage(originalBuffer, options);

      // Save to both caches
      await Promise.all([
        this.saveToMemoryCache(cacheKey, buffer, contentType),
        this.saveToDiskCache(cacheKey, buffer, contentType)
      ]);

      return { buffer, contentType };
    } catch (error) {
      console.error('Error processing or caching image:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    this.memoryCache.clear();
    // Clear disk cache implementation
    try {
      const files = await readdir(this.diskCachePath);
      await Promise.all(
        files.map(file => unlink(join(this.diskCachePath, file)))
      );
    } catch (error) {
      console.error('Failed to clear disk cache:', error);
    }
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService(); 