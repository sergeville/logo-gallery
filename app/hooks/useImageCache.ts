import { useState, useCallback } from 'react';

interface CacheEntry {
  url: string;
  timestamp: number;
}

interface ImageCacheResult {
  getCachedUrl: (originalUrl: string) => string;
  cacheUrl: (originalUrl: string, cachedUrl: string) => void;
  clearCache: () => void;
  isCached: (url: string) => boolean;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useImageCache(): ImageCacheResult {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());

  const isCached = useCallback((url: string): boolean => {
    const entry = cache.get(url);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {
      // Cache expired
      const newCache = new Map(cache);
      newCache.delete(url);
      setCache(newCache);
      return false;
    }

    return true;
  }, [cache]);

  const getCachedUrl = useCallback((originalUrl: string): string => {
    const entry = cache.get(originalUrl);
    if (!entry) return originalUrl;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {
      // Cache expired
      const newCache = new Map(cache);
      newCache.delete(originalUrl);
      setCache(newCache);
      return originalUrl;
    }

    return entry.url;
  }, [cache]);

  const cacheUrl = useCallback((originalUrl: string, cachedUrl: string) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(originalUrl, {
        url: cachedUrl,
        timestamp: Date.now()
      });
      return newCache;
    });
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return {
    getCachedUrl,
    cacheUrl,
    clearCache,
    isCached
  };
} 