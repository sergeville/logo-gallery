import { useState } from 'react';

interface UseImageValidationOptions {
  maxSize?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export function useImageValidation(options: UseImageValidationOptions = {}) {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    minWidth = 100,
    minHeight = 100,
    maxWidth = 4096,
    maxHeight = 4096,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  } = options;

  const validateImage = async (file: File): Promise<boolean> => {
    try {
      setIsValidating(true);
      setError(null);

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an allowed image type.');
      }

      // Check file extension
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!allowedExtensions.includes(extension)) {
        throw new Error('Invalid file extension. Please upload an allowed image type.');
      }

      // Check file size
      if (file.size > maxSize) {
        throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit.`);
      }

      // Check image dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error('Failed to load image for validation'));
        img.src = URL.createObjectURL(file);
      });

      URL.revokeObjectURL(img.src);

      if (dimensions.width < minWidth || dimensions.height < minHeight) {
        throw new Error(`Image dimensions must be at least ${minWidth}x${minHeight} pixels.`);
      }

      if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
        throw new Error(`Image dimensions must not exceed ${maxWidth}x${maxHeight} pixels.`);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate image');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateImage,
    isValidating,
    error
  };
} 