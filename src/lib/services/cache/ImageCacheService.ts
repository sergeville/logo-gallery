import { cacheConfig, cacheServiceConfig } from '@/config/cache.config';
import Redis from 'ioredis';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CacheDriver {
  get(key: string): Promise<Buffer | null>;
  set(key: string, value: Buffer, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

class MemoryDriver implements CacheDriver {
  private cache: Map<string, { value: Buffer; expires: number }> = new Map();

  async get(key: string): Promise<Buffer | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: Buffer, ttl: number = 3600): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

class RedisDriver implements CacheDriver {
  private client: Redis;
  private prefix: string;

  constructor(config: typeof cacheConfig.drivers.redis) {
    this.client = new Redis(config.connection);
    this.prefix = config.options.prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<Buffer | null> {
    const data = await this.client.getBuffer(this.getKey(key));
    return data || null;
  }

  async set(key: string, value: Buffer, ttl: number = 3600): Promise<void> {
    await this.client.set(this.getKey(key), value, 'EX', ttl);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(this.getKey(key));
  }

  async clear(): Promise<void> {
    const keys = await this.client.keys(`${this.prefix}*`);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}

class FilesystemDriver implements CacheDriver {
  private directory: string;
  private maxSize: number;

  constructor(config: typeof cacheConfig.drivers.filesystem) {
    this.directory = config.directory;
    this.maxSize = this.parseSize(config.maxSize);
  }

  private parseSize(size: string): number {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = size.match(/^(\d+)\s*(B|KB|MB|GB)$/i);
    if (!match) throw new Error(`Invalid size format: ${size}`);
    return parseInt(match[1]) * units[match[2] as keyof typeof units];
  }

  private getFilePath(key: string): string {
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return path.join(this.directory, hash);
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const filePath = this.getFilePath(key);
      const stats = await fs.stat(filePath);
      
      // Check if file has expired
      const metadata = JSON.parse(await fs.readFile(`${filePath}.meta`, 'utf-8'));
      if (metadata.expires < Date.now()) {
        await this.delete(key);
        return null;
      }

      return await fs.readFile(filePath);
    } catch (error) {
      return null;
    }
  }

  async set(key: string, value: Buffer, ttl: number = 3600): Promise<void> {
    const filePath = this.getFilePath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Write metadata
    await fs.writeFile(`${filePath}.meta`, JSON.stringify({
      expires: Date.now() + ttl * 1000,
      size: value.length,
    }));

    // Write file
    await fs.writeFile(filePath, value);

    // Cleanup if needed
    await this.cleanup();
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    try {
      await fs.unlink(filePath);
      await fs.unlink(`${filePath}.meta`);
    } catch (error) {
      // Ignore errors if files don't exist
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.rm(this.directory, { recursive: true });
      await fs.mkdir(this.directory, { recursive: true });
    } catch (error) {
      // Ignore errors if directory doesn't exist
    }
  }

  private async cleanup(): Promise<void> {
    let totalSize = 0;
    const files: { path: string; size: number; accessed: number }[] = [];

    // Get all files and their sizes
    for (const file of await fs.readdir(this.directory)) {
      if (file.endsWith('.meta')) continue;
      const filePath = path.join(this.directory, file);
      const stats = await fs.stat(filePath);
      const metadata = JSON.parse(await fs.readFile(`${filePath}.meta`, 'utf-8'));
      
      totalSize += stats.size;
      files.push({
        path: filePath,
        size: stats.size,
        accessed: metadata.expires,
      });
    }

    // Remove oldest files if total size exceeds limit
    if (totalSize > this.maxSize) {
      files.sort((a, b) => a.accessed - b.accessed);
      
      for (const file of files) {
        if (totalSize <= this.maxSize) break;
        await this.delete(path.basename(file.path));
        totalSize -= file.size;
      }
    }
  }
}

export class ImageCacheService {
  private drivers: Map<string, CacheDriver> = new Map();
  private defaultStrategy: string;

  constructor() {
    this.defaultStrategy = cacheServiceConfig.defaultStrategy;
    this.initializeDrivers();
  }

  private initializeDrivers(): void {
    // Initialize memory driver
    if (cacheConfig.drivers.memory.enabled) {
      this.drivers.set('memory', new MemoryDriver());
    }

    // Initialize Redis driver
    if (cacheConfig.drivers.redis.enabled) {
      this.drivers.set('redis', new RedisDriver(cacheConfig.drivers.redis));
    }

    // Initialize filesystem driver
    if (cacheConfig.drivers.filesystem.enabled) {
      this.drivers.set('filesystem', new FilesystemDriver(cacheConfig.drivers.filesystem));
    }
  }

  private getDriver(strategy?: string): CacheDriver {
    const strategyConfig = strategy 
      ? cacheConfig.strategies[strategy]
      : cacheConfig.strategies[this.defaultStrategy];

    const driver = this.drivers.get(strategyConfig.driver);
    if (!driver) {
      throw new Error(`Cache driver '${strategyConfig.driver}' not found`);
    }

    return driver;
  }

  private generateKey(key: string, strategy?: string): string {
    const strategyConfig = strategy 
      ? cacheConfig.strategies[strategy]
      : cacheConfig.strategies[this.defaultStrategy];

    return `${strategyConfig.prefix}${key}`;
  }

  async get(key: string, strategy?: string): Promise<Buffer | null> {
    if (!cacheServiceConfig.enabled) return null;

    try {
      const cacheKey = this.generateKey(key, strategy);
      const driver = this.getDriver(strategy);
      const result = await driver.get(cacheKey);

      if (result) {
        await cacheServiceConfig.events.onCacheHit(key);
      } else {
        await cacheServiceConfig.events.onCacheMiss(key);
      }

      return result;
    } catch (error) {
      await cacheServiceConfig.events.onCacheError(error as Error);
      return null;
    }
  }

  async set(key: string, value: Buffer, strategy?: string): Promise<void> {
    if (!cacheServiceConfig.enabled) return;

    try {
      const cacheKey = this.generateKey(key, strategy);
      const strategyConfig = strategy 
        ? cacheConfig.strategies[strategy]
        : cacheConfig.strategies[this.defaultStrategy];

      await this.getDriver(strategy).set(cacheKey, value, strategyConfig.ttl);
    } catch (error) {
      await cacheServiceConfig.events.onCacheError(error as Error);
    }
  }

  async delete(key: string, strategy?: string): Promise<void> {
    if (!cacheServiceConfig.enabled) return;

    try {
      const cacheKey = this.generateKey(key, strategy);
      await this.getDriver(strategy).delete(cacheKey);
    } catch (error) {
      await cacheServiceConfig.events.onCacheError(error as Error);
    }
  }

  async clear(strategy?: string): Promise<void> {
    if (!cacheServiceConfig.enabled) return;

    try {
      await this.getDriver(strategy).clear();
    } catch (error) {
      await cacheServiceConfig.events.onCacheError(error as Error);
    }
  }
} 