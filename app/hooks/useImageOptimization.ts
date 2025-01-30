import { useState } from 'react';

interface UseImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp';
}

interface OptimizedImage {
  file: File;
  size: number;
  type: string;
  width: number;
  height: number;
}

export function useImageOptimization(options: UseImageOptimizationOptions = {}) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  const optimizeImage = async (file: File): Promise<OptimizedImage | undefined> => {
    try {
      setIsOptimizing(true);
      setError(null);

      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please upload an image.');
      }

      // Create image object
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth * height) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (maxHeight * width) / height;
        height = maxHeight;
      }

      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          `image/${format}`,
          quality
        );
      });

      // Clean up
      URL.revokeObjectURL(objectUrl);

      const optimizedFile = new File([blob], file.name, {
        type: `image/${format}`,
      });

      return {
        file: optimizedFile,
        size: optimizedFile.size,
        type: optimizedFile.type,
        width,
        height,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize image');
      return undefined;
    } finally {
      setIsOptimizing(false);
    }
  };

  const getCompressionRatio = (originalSize: number, optimizedSize: number): string => {
    const ratio = ((originalSize - optimizedSize) / originalSize) * 100;
    return `${Math.round(ratio)}%`;
  };

  return {
    optimizeImage,
    isOptimizing,
    error,
    getCompressionRatio,
  };
} 