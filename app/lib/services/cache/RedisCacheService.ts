import Redis from 'ioredis';
import { NextResponse } from 'next/server';

class RedisCacheService {
  private redis: Redis;
  private prefix: string;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.prefix = 'app:cache:';
  }

  async get(key: string): Promise<NextResponse | null> {
    try {
      const data = await this.redis.get(this.prefix + key);
      if (!data) return null;

      const { body, headers, status } = JSON.parse(data);
      return new NextResponse(body, { headers, status });
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  async set(key: string, response: NextResponse, ttl: number = 3600): Promise<void> {
    try {
      const body = await response.clone().text();
      const headers = Object.fromEntries(response.headers.entries());
      const status = response.status;

      await this.redis.setex(
        this.prefix + key,
        ttl,
        JSON.stringify({ body, headers, status })
      );
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(this.prefix + key);
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys(this.prefix + '*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis cache clear error:', error);
    }
  }
}

export const redisCacheService = new RedisCacheService(); 