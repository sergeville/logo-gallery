import { renderHook, act } from '@testing-library/react';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { useImagePreload } from '@/hooks/useImagePreload';
import { useImageValidation } from '@/hooks/useImageValidation';
import { useImageCache } from '@/hooks/useImageCache';

describe('Image Processing Integration', () => {
  beforeEach(() => {
    // Clear cache and mocks before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should handle complete image processing workflow', async () => {
    // Initialize all hooks
    const { result: optimizationResult } = renderHook(() => useImageOptimization());
    const { result: preloadResult } = renderHook(() => useImagePreload());
    const { result: validationResult } = renderHook(() => useImageValidation());
    const { result: cacheResult } = renderHook(() => useImageCache());

    // Create test image
    const testImage = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(testImage, 'size', { value: 2 * 1024 * 1024 }); // 2MB

    // Step 1: Validate image
    await act(async () => {
      const isValid = await validationResult.current.validateImage(testImage, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['image/jpeg', 'image/png'],
        maxDimensions: { width: 1920, height: 1080 }
      });

      expect(isValid).toBe(true);
    });

    // Step 2: Optimize image
    let optimizedImage;
    await act(async () => {
      optimizedImage = await optimizationResult.current.optimizeImage(testImage, {
        maxWidth: 800,
        quality: 85,
        format: 'webp'
      });

      expect(optimizedImage.type).toBe('image/webp');
      expect(optimizedImage.size).toBeLessThan(testImage.size);
    });

    // Step 3: Cache optimized image
    await act(async () => {
      await cacheResult.current.cacheImage('test-image', optimizedImage);
      const cachedImage = await cacheResult.current.getCachedImage('test-image');
      
      expect(cachedImage).toBeTruthy();
      expect(cachedImage.type).toBe('image/webp');
    });

    // Step 4: Preload image
    await act(async () => {
      const imageUrl = URL.createObjectURL(optimizedImage);
      await preloadResult.current.preloadImage(imageUrl);
      
      expect(preloadResult.current.isLoaded(imageUrl)).toBe(true);
      URL.revokeObjectURL(imageUrl);
    });
  });

  it('should handle error cases in workflow', async () => {
    const { result: optimizationResult } = renderHook(() => useImageOptimization());
    const { result: validationResult } = renderHook(() => useImageValidation());
    const { result: cacheResult } = renderHook(() => useImageCache());

    // Create invalid image
    const invalidImage = new File(['not an image'], 'test.txt', { type: 'text/plain' });

    // Step 1: Validation should fail
    await act(async () => {
      const isValid = await validationResult.current.validateImage(invalidImage, {
        maxSize: 1024 * 1024,
        allowedFormats: ['image/jpeg', 'image/png']
      });

      expect(isValid).toBe(false);
    });

    // Step 2: Optimization should throw
    await expect(
      optimizationResult.current.optimizeImage(invalidImage)
    ).rejects.toThrow();

    // Step 3: Cache should handle missing image
    await act(async () => {
      const cachedImage = await cacheResult.current.getCachedImage('non-existent');
      expect(cachedImage).toBeNull();
    });
  });

  it('should handle concurrent operations', async () => {
    const { result: optimizationResult } = renderHook(() => useImageOptimization());
    const { result: cacheResult } = renderHook(() => useImageCache());

    // Create multiple test images
    const images = Array.from({ length: 3 }, (_, i) => 
      new File([''], `test${i}.jpg`, { type: 'image/jpeg' })
    );

    // Process images concurrently
    await act(async () => {
      const optimizationPromises = images.map(image =>
        optimizationResult.current.optimizeImage(image, {
          maxWidth: 800,
          quality: 85
        })
      );

      const optimizedImages = await Promise.all(optimizationPromises);
      
      // Cache optimized images
      const cachePromises = optimizedImages.map((image, i) =>
        cacheResult.current.cacheImage(`test-image-${i}`, image)
      );

      await Promise.all(cachePromises);

      // Verify all images are cached
      for (let i = 0; i < images.length; i++) {
        const cachedImage = await cacheResult.current.getCachedImage(`test-image-${i}`);
        expect(cachedImage).toBeTruthy();
      }
    });
  });

  it('should handle cache eviction', async () => {
    const { result: optimizationResult } = renderHook(() => useImageOptimization());
    const { result: cacheResult } = renderHook(() => useImageCache());

    // Create large test image
    const testImage = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(testImage, 'size', { value: 5 * 1024 * 1024 }); // 5MB

    await act(async () => {
      // Optimize and cache multiple versions
      for (let i = 0; i < 5; i++) {
        const optimized = await optimizationResult.current.optimizeImage(testImage, {
          maxWidth: 800 - i * 100, // Different sizes
          quality: 85
        });

        await cacheResult.current.cacheImage(`test-image-${i}`, optimized);
      }

      // Verify cache size management
      const cacheSize = await cacheResult.current.getCacheSize();
      expect(cacheSize).toBeLessThanOrEqual(cacheResult.current.maxCacheSize);

      // Oldest entries should be evicted
      const oldestImage = await cacheResult.current.getCachedImage('test-image-0');
      expect(oldestImage).toBeNull();
    });
  });

  it('should maintain image metadata through processing', async () => {
    const { result: optimizationResult } = renderHook(() => useImageOptimization());
    const { result: cacheResult } = renderHook(() => useImageCache());

    // Create test image with metadata
    const testImage = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const metadata = {
      title: 'Test Image',
      description: 'A test image for processing',
      timestamp: Date.now()
    };

    await act(async () => {
      // Optimize image
      const optimized = await optimizationResult.current.optimizeImage(testImage, {
        maxWidth: 800,
        quality: 85,
        preserveMetadata: true,
        metadata
      });

      // Cache with metadata
      await cacheResult.current.cacheImage('test-image', optimized, metadata);

      // Retrieve and verify metadata
      const cached = await cacheResult.current.getCachedImage('test-image');
      const cachedMetadata = await cacheResult.current.getImageMetadata('test-image');

      expect(cachedMetadata).toEqual(metadata);
    });
  });
}); 