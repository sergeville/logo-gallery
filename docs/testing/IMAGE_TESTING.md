# Image Handling Testing Guide

This guide covers comprehensive testing strategies for image handling features in the Logo Gallery application.

## Table of Contents
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Visual Regression Testing](#visual-regression-testing)
- [Performance Testing](#performance-testing)
- [Load Testing](#load-testing)

## Unit Testing

### 1. Image Optimization Hook Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useImageOptimization } from '@/hooks/useImageOptimization';

describe('useImageOptimization', () => {
  it('should optimize image dimensions correctly', async () => {
    const { result } = renderHook(() => useImageOptimization());
    const testFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    const optimized = await result.current.optimizeImage(testFile, {
      maxWidth: 800,
      maxHeight: 600,
      quality: 85
    });

    expect(optimized).toBeInstanceOf(Blob);
    // Test resulting dimensions using createImageBitmap
    const bitmap = await createImageBitmap(optimized);
    expect(bitmap.width).toBeLessThanOrEqual(800);
    expect(bitmap.height).toBeLessThanOrEqual(600);
  });

  it('should maintain aspect ratio during optimization', async () => {
    const { result } = renderHook(() => useImageOptimization());
    const testFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    const optimized = await result.current.optimizeImage(testFile, {
      maxWidth: 800,
      quality: 85
    });

    const bitmap = await createImageBitmap(optimized);
    const aspectRatio = bitmap.width / bitmap.height;
    expect(aspectRatio).toBeCloseTo(originalAspectRatio, 2);
  });
});
```

### 2. Image Validation Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useImageValidation } from '@/hooks/useImageValidation';

describe('useImageValidation', () => {
  it('should validate image dimensions correctly', async () => {
    const { result } = renderHook(() => useImageValidation());
    const oversizedImage = new File([''], 'large.jpg', { type: 'image/jpeg' });
    
    const validation = await result.current.validateImage(oversizedImage, {
      maxWidth: 1920,
      maxHeight: 1080
    });

    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('dimensions exceed maximum');
  });

  it('should validate file size correctly', async () => {
    const { result } = renderHook(() => useImageValidation());
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg');
    
    const validation = await result.current.validateImage(largeFile, {
      maxSize: 5 * 1024 * 1024 // 5MB
    });

    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('file size');
  });
});
```

### 3. Image Cache Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useImageCache } from '@/hooks/useImageCache';

describe('useImageCache', () => {
  it('should cache and retrieve images correctly', async () => {
    const { result } = renderHook(() => useImageCache());
    const testBlob = new Blob(['test'], { type: 'image/jpeg' });
    const cacheKey = 'test-image';

    await result.current.cacheImage(cacheKey, testBlob);
    const cached = await result.current.getCachedImage(cacheKey);

    expect(cached).toBeInstanceOf(Blob);
    expect(await cached.text()).toBe('test');
  });

  it('should handle cache eviction correctly', async () => {
    const { result } = renderHook(() => useImageCache());
    const largeBlob = new Blob([new ArrayBuffer(51 * 1024 * 1024)]); // 51MB
    
    await result.current.cacheImage('large-image', largeBlob, {
      maxSize: 50 * 1024 * 1024 // 50MB cache limit
    });

    const cached = await result.current.getCachedImage('large-image');
    expect(cached).toBeNull();
  });
});
```

## Integration Testing

### 1. Image Upload Flow

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploader } from '@/components/ImageUploader';

describe('ImageUploader Integration', () => {
  it('should handle complete upload flow', async () => {
    const onUploadComplete = jest.fn();
    render(<ImageUploader onComplete={onUploadComplete} />);

    // Simulate file selection
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/choose file/i);
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for optimization and upload
    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });

    // Verify upload completion
    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalledWith(expect.any(Blob));
      expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
    });
  });
});
```

### 2. Image Gallery Loading

```typescript
import { render, screen } from '@testing-library/react';
import { ImageGallery } from '@/components/ImageGallery';
import { useImagePreload } from '@/hooks/useImagePreload';

jest.mock('@/hooks/useImagePreload');

describe('ImageGallery Integration', () => {
  it('should preload and display images correctly', async () => {
    const mockImages = [
      { id: '1', url: 'image1.jpg' },
      { id: '2', url: 'image2.jpg' }
    ];

    (useImagePreload as jest.Mock).mockImplementation(() => ({
      preloadImages: jest.fn().mockResolvedValue(undefined)
    }));

    render(<ImageGallery images={mockImages} />);

    // Verify loading states
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    // Wait for images to load
    await waitFor(() => {
      mockImages.forEach(image => {
        expect(screen.getByAltText(`Image ${image.id}`)).toBeInTheDocument();
      });
    });
  });
});
```

## Visual Regression Testing

### 1. Setup with Percy

```typescript
import { percySnapshot } from '@percy/playwright';
import { test, expect } from '@playwright/test';

test.describe('Image Components Visual Tests', () => {
  test('should render image gallery correctly', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForSelector('[data-testid="image-grid"]');
    
    // Take snapshot with different viewport sizes
    await percySnapshot(page, 'Image Gallery - Desktop', {
      widths: [1280]
    });
    
    // Test responsive layout
    await page.setViewportSize({ width: 375, height: 667 });
    await percySnapshot(page, 'Image Gallery - Mobile');
  });

  test('should render image upload states correctly', async ({ page }) => {
    await page.goto('/upload');
    
    // Capture initial state
    await percySnapshot(page, 'Upload - Initial State');
    
    // Simulate upload and capture processing state
    await page.setInputFiles('input[type="file"]', 'test-assets/sample.jpg');
    await percySnapshot(page, 'Upload - Processing');
    
    // Wait for completion and capture final state
    await page.waitForSelector('[data-testid="upload-complete"]');
    await percySnapshot(page, 'Upload - Complete');
  });
});
```

### 2. Component-Specific Tests

```typescript
import { test } from '@playwright/test';

test.describe('Image Component Visual Tests', () => {
  test('should handle different image aspect ratios', async ({ page }) => {
    await page.goto('/visual-test-page');
    
    const testCases = [
      { width: 800, height: 600, label: 'Landscape' },
      { width: 600, height: 800, label: 'Portrait' },
      { width: 800, height: 800, label: 'Square' }
    ];

    for (const testCase of testCases) {
      await page.evaluate(({ width, height }) => {
        const img = document.querySelector('img');
        img.width = width;
        img.height = height;
      }, testCase);

      await percySnapshot(page, `Image Aspect Ratio - ${testCase.label}`);
    }
  });
});
```

## Performance Testing

### 1. Image Loading Performance

```typescript
import { test, expect } from '@playwright/test';

test.describe('Image Loading Performance', () => {
  test('should load images within performance budget', async ({ page }) => {
    const performanceEntries: PerformanceEntry[] = [];
    
    // Listen for performance entries
    page.on('console', msg => {
      if (msg.type() === 'debug' && msg.text().startsWith('Performance:')) {
        performanceEntries.push(JSON.parse(msg.text().slice(13)));
      }
    });

    await page.goto('/gallery');

    // Wait for all images to load
    await page.waitForSelector('[data-testid="gallery-loaded"]');

    // Analyze performance metrics
    const imageLoadTimes = performanceEntries
      .filter(entry => entry.entryType === 'resource')
      .filter(entry => entry.name.match(/\.(jpg|png|webp)$/));

    const averageLoadTime = imageLoadTimes.reduce((sum, entry) => 
      sum + entry.duration, 0) / imageLoadTimes.length;

    expect(averageLoadTime).toBeLessThan(1000); // 1 second budget
  });
});
```

### 2. Memory Usage Testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Memory Usage Tests', () => {
  test('should maintain stable memory usage during image operations', async ({ page }) => {
    const getMemoryUsage = () => page.evaluate(() => performance.memory.usedJSHeapSize);
    
    // Record baseline
    const baselineMemory = await getMemoryUsage();
    
    // Perform image operations
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="load-more-images"]');
      await page.waitForTimeout(1000);
      
      const currentMemory = await getMemoryUsage();
      const memoryIncrease = currentMemory - baselineMemory;
      
      // Check for memory leaks (allow for some increase)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
    }
  });
});
```

## Load Testing

### 1. Image Upload Stress Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Image Upload Load Testing', () => {
  test('should handle concurrent uploads', async ({ page }) => {
    const concurrentUploads = 10;
    const results = await Promise.all(
      Array(concurrentUploads).fill(0).map(async (_, i) => {
        const response = await page.request.post('/api/upload', {
          multipart: {
            file: {
              name: `test${i}.jpg`,
              mimeType: 'image/jpeg',
              buffer: Buffer.from('test-image-data')
            }
          }
        });
        return response.status();
      })
    );

    // Verify all uploads succeeded
    expect(results.every(status => status === 200)).toBe(true);
  });
});
```

### 2. Image Processing Load Test

```typescript
import { test, expect } from '@playwright/test';
import { createTestImage } from '../test-utils';

test.describe('Image Processing Load Test', () => {
  test('should handle high-volume image processing', async ({ request }) => {
    const iterations = 100;
    const startTime = Date.now();
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      const testImage = await createTestImage(1920, 1080);
      const response = await request.post('/api/optimize', {
        multipart: {
          image: testImage,
          options: {
            maxWidth: 800,
            quality: 85,
            format: 'webp'
          }
        }
      });

      if (response.ok()) successCount++;
    }

    const duration = Date.now() - startTime;
    const throughput = iterations / (duration / 1000);

    expect(successCount).toBe(iterations);
    expect(throughput).toBeGreaterThan(5); // At least 5 operations per second
  });
});
```

## Best Practices

1. **Test Data Management**
   - Use consistent test images
   - Maintain a variety of test cases (sizes, formats)
   - Clean up test data after runs

2. **Performance Monitoring**
   - Set clear performance budgets
   - Monitor memory usage
   - Track response times
   - Measure resource utilization

3. **Visual Testing**
   - Test across different viewports
   - Include error states
   - Verify loading states
   - Check responsive behavior

4. **Load Testing**
   - Simulate realistic usage patterns
   - Test concurrent operations
   - Monitor system resources
   - Verify error handling

5. **Integration Testing**
   - Test complete user flows
   - Verify state management
   - Check error recovery
   - Test boundary conditions 