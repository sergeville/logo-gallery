import { renderHook, act } from '@testing-library/react';
import { useImageOptimization } from '@/hooks/useImageOptimization';

describe('useImageOptimization', () => {
  const mockFile = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should optimize image dimensions', async () => {
    const { result } = renderHook(() => useImageOptimization());
    
    const testImage = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(testImage, 'size', { value: 1024 * 1024 }); // 1MB

    await act(async () => {
      const optimized = await result.current.optimizeImage(testImage, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 80
      });

      expect(optimized.type).toBe('image/jpeg');
      expect(optimized.size).toBeLessThan(testImage.size);
    });
  });

  it('should handle WebP conversion', async () => {
    const { result } = renderHook(() => useImageOptimization());
    
    const testImage = new File([''], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      const optimized = await result.current.optimizeImage(testImage, {
        format: 'webp',
        quality: 85
      });

      expect(optimized.type).toBe('image/webp');
    });
  });

  it('should handle invalid input', async () => {
    const { result } = renderHook(() => useImageOptimization());
    
    const invalidFile = new File(['not an image'], 'test.txt', { type: 'text/plain' });

    await expect(
      result.current.optimizeImage(invalidFile)
    ).rejects.toThrow('Invalid image file');
  });

  it('should respect minimum quality threshold', async () => {
    const { result } = renderHook(() => useImageOptimization());
    
    const testImage = new File([''], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      const optimized = await result.current.optimizeImage(testImage, {
        quality: 10 // Very low quality
      });

      // Should use minimum quality threshold
      expect(optimized.size).toBeGreaterThan(0);
    });
  });

  it('should maintain aspect ratio when resizing', async () => {
    const { result } = renderHook(() => useImageOptimization());
    
    const testImage = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    // Mock image dimensions
    const img = new Image();
    Object.defineProperty(img, 'naturalWidth', { value: 1920 });
    Object.defineProperty(img, 'naturalHeight', { value: 1080 });

    await act(async () => {
      const optimized = await result.current.optimizeImage(testImage, {
        maxWidth: 800
      });

      const optimizedImg = new Image();
      const objectUrl = URL.createObjectURL(optimized);
      optimizedImg.src = objectUrl;

      // Check aspect ratio is maintained
      const originalRatio = 1920 / 1080;
      const optimizedRatio = optimizedImg.width / optimizedImg.height;
      
      expect(Math.abs(originalRatio - optimizedRatio)).toBeLessThan(0.01);
      
      URL.revokeObjectURL(objectUrl);
    });
  });

  it('optimizes image successfully', async () => {
    const { result } = renderHook(() => useImageOptimization());

    await act(async () => {
      const optimizedImage = await result.current.optimizeImage(mockFile);
      expect(optimizedImage).toBeDefined();
      expect(optimizedImage.size).toBeLessThan(mockFile.size);
    });

    expect(result.current.isOptimizing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles optimization errors', async () => {
    const invalidFile = new File(['invalid'], 'test.txt', { type: 'text/plain' });
    const { result } = renderHook(() => useImageOptimization());

    await act(async () => {
      try {
        await result.current.optimizeImage(invalidFile);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    expect(result.current.isOptimizing).toBe(false);
    expect(result.current.error).toBe('Invalid file type. Please upload an image.');
  });

  it('tracks optimization progress', async () => {
    const { result } = renderHook(() => useImageOptimization());

    await act(async () => {
      const promise = result.current.optimizeImage(mockFile);
      expect(result.current.isOptimizing).toBe(true);
      await promise;
    });

    expect(result.current.isOptimizing).toBe(false);
  });

  it('calculates compression ratio', async () => {
    const { result } = renderHook(() => useImageOptimization());

    await act(async () => {
      const optimizedImage = await result.current.optimizeImage(mockFile);
      const ratio = result.current.getCompressionRatio(mockFile.size, optimizedImage.size);
      expect(ratio).toBeDefined();
      expect(typeof ratio).toBe('string');
      expect(ratio).toMatch(/^\d+%$/);
    });
  });

  it('respects maximum dimensions', async () => {
    const { result } = renderHook(() => useImageOptimization({ maxWidth: 800, maxHeight: 600 }));

    await act(async () => {
      const optimizedImage = await result.current.optimizeImage(mockFile);
      const img = new Image();
      img.src = URL.createObjectURL(optimizedImage);
      await new Promise(resolve => img.onload = resolve);
      
      expect(img.width).toBeLessThanOrEqual(800);
      expect(img.height).toBeLessThanOrEqual(600);
    });
  });
}); 