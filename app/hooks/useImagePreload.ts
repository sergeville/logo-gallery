import { useState, useCallback } from 'react';

export function useImagePreload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedUrls, setLoadedUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);

  const preloadImages = useCallback(async (urls: string[]) => {
    if (!urls.length) {
      setLoadedUrls([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setIsCancelled(false);
    const loaded: string[] = [];

    try {
      await Promise.all(
        urls.map(async (url, index) => {
          if (isCancelled) return;

          try {
            await new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = reject;
              img.src = url;
            });

            if (!isCancelled) {
              loaded.push(url);
              setProgress(Math.round(((index + 1) / urls.length) * 100));
            }
          } catch (err) {
            console.error(`Failed to load image: ${url}`, err);
          }
        })
      );

      if (!isCancelled) {
        if (loaded.length < urls.length) {
          setError('Failed to preload some images');
        }
        setLoadedUrls(loaded);
      }
    } catch (err) {
      if (!isCancelled) {
        setError('Failed to preload images');
        setLoadedUrls([]);
      }
    } finally {
      if (!isCancelled) {
        setIsLoading(false);
      }
    }
  }, [isCancelled]);

  const cancel = useCallback(() => {
    setIsCancelled(true);
    setIsLoading(false);
    setLoadedUrls([]);
    setProgress(0);
  }, []);

  return {
    preloadImages,
    isLoading,
    error,
    loadedUrls,
    progress,
    cancel,
  };
} 