import { useState, useEffect, useCallback, useRef } from 'react';

// Example 1: Image Optimization Hook
interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export const useImageOptimization = () => {
  const optimizeImage = useCallback(async (
    file: File | Blob,
    options: OptimizationOptions = {}
  ): Promise<Blob> => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 85,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to desired format
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          `image/${format}`,
          quality / 100
        );

        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }, []);

  return { optimizeImage };
};

// Example 2: Image Preloading Hook
export const useImagePreload = () => {
  const cache = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((url: string): Promise<void> => {
    if (cache.current.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        cache.current.add(url);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  const preloadImages = useCallback((urls: string[]): Promise<void[]> => {
    return Promise.all(urls.map(preloadImage));
  }, [preloadImage]);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { preloadImage, preloadImages, clearCache };
};

// Example 3: Image Validation Hook
interface ValidationOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSize?: number;
  allowedFormats?: string[];
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  dimensions?: { width: number; height: number };
}

export const useImageValidation = () => {
  const validateImage = useCallback(async (
    file: File,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> => {
    const {
      maxWidth = 2000,
      maxHeight = 2000,
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedFormats = ['image/jpeg', 'image/png', 'image/webp']
    } = options;

    // Check file type
    if (!allowedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid format. Allowed formats: ${allowedFormats.join(', ')}`
      };
    }

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
      };
    }

    // Check dimensions
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const dimensions = { width: img.width, height: img.height };

        if (img.width > maxWidth || img.height > maxHeight) {
          resolve({
            valid: false,
            error: `Image dimensions exceed maximum allowed (${maxWidth}x${maxHeight})`,
            dimensions
          });
        } else {
          resolve({ valid: true, dimensions });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          valid: false,
          error: 'Failed to load image for validation'
        });
      };

      img.src = url;
    });
  }, []);

  return { validateImage };
};

// Example 4: Image Cache Hook
interface CacheOptions {
  maxSize?: number;
  maxAge?: number;
}

export const useImageCache = () => {
  const cache = useRef<Map<string, { blob: Blob; timestamp: number }>>(new Map());
  const [size, setSize] = useState(0);

  const clearOldEntries = useCallback((maxAge: number) => {
    const now = Date.now();
    for (const [key, value] of cache.current.entries()) {
      if (now - value.timestamp > maxAge) {
        cache.current.delete(key);
      }
    }
  }, []);

  const cacheImage = useCallback(async (
    key: string,
    blob: Blob,
    options: CacheOptions = {}
  ) => {
    const { maxSize = 50 * 1024 * 1024, maxAge = 24 * 60 * 60 * 1000 } = options;

    // Clear old entries
    clearOldEntries(maxAge);

    // Check cache size
    if (size + blob.size > maxSize) {
      cache.current.clear();
      setSize(0);
    }

    cache.current.set(key, {
      blob,
      timestamp: Date.now()
    });
    setSize(prev => prev + blob.size);
  }, [size, clearOldEntries]);

  const getCachedImage = useCallback((key: string): Blob | null => {
    const entry = cache.current.get(key);
    return entry ? entry.blob : null;
  }, []);

  return { cacheImage, getCachedImage };
};

// Example 5: Image Compression Utility
interface CompressionResult {
  blob: Blob;
  compressionRatio: number;
  originalSize: number;
  compressedSize: number;
}

export const compressImage = async (
  file: File,
  targetSize: number = 1024 * 1024 // 1MB
): Promise<CompressionResult> => {
  let quality = 0.9;
  let result: Blob | null = null;
  const originalSize = file.size;

  // Convert to base64 for manipulation
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  // Create image for dimension calculations
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = base64;
  });

  // Binary search for optimal quality
  let min = 0;
  let max = 1;
  
  while (min <= max && (!result || result.size > targetSize)) {
    quality = (min + max) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    ctx.drawImage(img, 0, 0);

    result = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality);
    });

    if (result.size > targetSize) {
      max = quality - 0.1;
    } else {
      min = quality + 0.1;
    }
  }

  if (!result) throw new Error('Compression failed');

  return {
    blob: result,
    compressionRatio: result.size / originalSize,
    originalSize,
    compressedSize: result.size
  };
}; 