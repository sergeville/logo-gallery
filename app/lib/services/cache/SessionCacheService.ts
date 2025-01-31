import { redisCacheService } from './RedisCacheService';
import { Session } from 'next-auth';

class SessionCacheService {
  private prefix = 'session:';
  private defaultTTL = 60 * 5; // 5 minutes

  async getSession(sessionToken: string): Promise<Session | null> {
    try {
      const cachedSession = await redisCacheService.get(this.prefix + sessionToken);
      if (cachedSession) {
        const data = await cachedSession.json();
        return data as Session;
      }
      return null;
    } catch (error) {
      console.error('Error getting session from cache:', error);
      return null;
    }
  }

  async setSession(sessionToken: string, session: Session, ttl?: number): Promise<void> {
    try {
      const response = new Response(JSON.stringify(session), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await redisCacheService.set(
        this.prefix + sessionToken,
        response,
        ttl || this.defaultTTL
      );
    } catch (error) {
      console.error('Error setting session in cache:', error);
    }
  }

  async deleteSession(sessionToken: string): Promise<void> {
    try {
      await redisCacheService.delete(this.prefix + sessionToken);
    } catch (error) {
      console.error('Error deleting session from cache:', error);
    }
  }
}

export const sessionCacheService = new SessionCacheService(); 