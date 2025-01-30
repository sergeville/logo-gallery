# Detailed Image Testing Guide

## Unit Testing Deep Dive

### Testing Image Format Conversion

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useImageOptimization } from '@/hooks/useImageOptimization';

describe('Image Format Conversion', () => {
  it('should convert images to WebP format', async () => {
    const { result } = renderHook(() => useImageOptimization());
    const pngFile = new File([''], 'test.png', { type: 'image/png' });
    
    const optimized = await result.current.optimizeImage(pngFile, {
      format: 'webp',
      quality: 90
    });

    expect(optimized.type).toBe('image/webp');
  });

  it('should handle AVIF conversion when supported', async () => {
    const { result } = renderHook(() => useImageOptimization());
    
    // Mock AVIF support detection
    global.createImageBitmap = jest.fn().mockResolvedValue({});
    
    const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const optimized = await result.current.optimizeImage(jpegFile, {
      format: 'avif',
      quality: 85
    });

    expect(optimized.type).toBe('image/avif');
  });

  it('should fallback to WebP when AVIF is not supported', async () => {
    const { result } = renderHook(() => useImageOptimization());
    
    // Mock AVIF support detection failure
    global.createImageBitmap = jest.fn().mockRejectedValue(new Error());
    
    const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const optimized = await result.current.optimizeImage(jpegFile, {
      format: 'avif',
      quality: 85
    });

    expect(optimized.type).toBe('image/webp');
  });
});
```

### Testing Error Handling

```typescript
describe('Image Optimization Error Handling', () => {
  it('should handle corrupt image files', async () => {
    const { result } = renderHook(() => useImageOptimization());
    const corruptFile = new File([new ArrayBuffer(10)], 'corrupt.jpg', { 
      type: 'image/jpeg' 
    });

    await expect(
      result.current.optimizeImage(corruptFile)
    ).rejects.toThrow('Invalid image data');
  });

  it('should handle network errors during optimization', async () => {
    const { result } = renderHook(() => useImageOptimization());
    
    // Mock network failure
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    await expect(
      result.current.optimizeImage(new File([''], 'test.jpg'))
    ).rejects.toThrow('Network error');
  });

  it('should handle browser memory limitations', async () => {
    const { result } = renderHook(() => useImageOptimization());
    
    // Create a very large file
    const largeFile = new File([new ArrayBuffer(100 * 1024 * 1024)], 'large.jpg');
    
    await expect(
      result.current.optimizeImage(largeFile)
    ).rejects.toThrow('Insufficient memory');
  });
});
```

## Integration Testing Extended Examples

### Testing Image Upload with Progress

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploader } from '@/components/ImageUploader';

describe('Image Upload with Progress', () => {
  beforeEach(() => {
    // Mock XMLHttpRequest for upload progress
    const xhrMock = {
      upload: {
        addEventListener: jest.fn()
      },
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn()
    };
    
    global.XMLHttpRequest = jest.fn(() => xhrMock);
  });

  it('should show upload progress correctly', async () => {
    const onProgress = jest.fn();
    render(<ImageUploader onProgress={onProgress} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/choose file/i);
    
    // Trigger upload
    fireEvent.change(input, { target: { files: [file] } });

    // Simulate progress events
    const progressEvent = new Event('progress');
    Object.defineProperty(progressEvent, 'loaded', { value: 50 });
    Object.defineProperty(progressEvent, 'total', { value: 100 });
    
    fireEvent(input, progressEvent);

    await waitFor(() => {
      expect(onProgress).toHaveBeenCalledWith(50);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });
});
```

### Testing Image Gallery with Infinite Scroll

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageGallery } from '@/components/ImageGallery';

describe('Image Gallery with Infinite Scroll', () => {
  const mockImages = Array.from({ length: 50 }, (_, i) => ({
    id: `${i}`,
    url: `image${i}.jpg`
  }));

  it('should load more images on scroll', async () => {
    const { container } = render(
      <ImageGallery 
        images={mockImages} 
        initialLoadCount={20}
        loadMoreCount={10}
      />
    );

    // Initially shows first batch
    expect(screen.getAllByRole('img')).toHaveLength(20);

    // Simulate scroll to bottom
    fireEvent.scroll(container, {
      target: {
        scrollTop: 1000,
        scrollHeight: 1000,
        clientHeight: 500
      }
    });

    // Wait for next batch
    await waitFor(() => {
      expect(screen.getAllByRole('img')).toHaveLength(30);
    });
  });
});
```

## Visual Regression Testing Advanced Scenarios

### Testing Image Loading States

```typescript
import { test } from '@playwright/test';

test.describe('Image Loading Visual States', () => {
  test('should show correct loading sequence', async ({ page }) => {
    // Throttle network to ensure loading states are visible
    await page.route('**/*.{png,jpg,webp}', route => 
      route.continue({ delay: 1000 })
    );

    await page.goto('/gallery');

    // Capture initial skeleton state
    await percySnapshot(page, 'Gallery - Loading Skeleton');

    // Capture low-quality placeholder state
    await page.waitForSelector('[data-testid="image-placeholder"]');
    await percySnapshot(page, 'Gallery - Low Quality Placeholder');

    // Capture final loaded state
    await page.waitForSelector('[data-testid="image-loaded"]');
    await percySnapshot(page, 'Gallery - Fully Loaded');
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock failed image loads
    await page.route('**/*.{png,jpg,webp}', route => route.abort());
    
    await page.goto('/gallery');
    await page.waitForSelector('[data-testid="image-error"]');
    
    await percySnapshot(page, 'Gallery - Error State');
  });
});
```

## Performance Testing Advanced Metrics

### Testing Image Optimization Performance

```typescript
import { test, expect } from '@playwright/test';

test.describe('Image Optimization Performance', () => {
  test('should meet optimization targets', async ({ request }) => {
    const testCases = [
      { size: '4k', width: 3840, height: 2160 },
      { size: '1080p', width: 1920, height: 1080 },
      { size: 'mobile', width: 390, height: 844 }
    ];

    for (const testCase of testCases) {
      const testImage = await createTestImage(testCase.width, testCase.height);
      const originalSize = testImage.size;

      const response = await request.post('/api/optimize', {
        multipart: {
          image: testImage,
          options: {
            maxWidth: testCase.width,
            quality: 85,
            format: 'webp'
          }
        }
      });

      const optimizedImage = await response.blob();
      const compressionRatio = optimizedImage.size / originalSize;

      // Verify compression targets
      expect(compressionRatio).toBeLessThan(0.5); // At least 50% reduction
      
      // Verify processing time
      expect(response.headers()['server-timing']).toBeDefined();
      const processingTime = parseFloat(
        response.headers()['server-timing'].match(/dur=([0-9.]+)/)[1]
      );
      expect(processingTime).toBeLessThan(2000); // Max 2 seconds
    }
  });
});
```

## Load Testing Advanced Scenarios

### Testing Concurrent Image Processing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Image Processing Load Test', () => {
  test('should handle burst uploads', async ({ request }) => {
    const burstSize = 20;
    const burstCount = 5;
    const cooldownMs = 1000;
    
    const results = {
      success: 0,
      failed: 0,
      avgResponseTime: 0
    };

    for (let burst = 0; burst < burstCount; burst++) {
      const startTime = Date.now();
      
      // Send burst of requests
      const promises = Array(burstSize).fill(0).map(async () => {
        const testImage = await createTestImage(1920, 1080);
        const response = await request.post('/api/optimize', {
          multipart: {
            image: testImage,
            options: { maxWidth: 800, quality: 85 }
          }
        });
        return {
          success: response.ok(),
          time: Date.now() - startTime
        };
      });

      const burstResults = await Promise.all(promises);
      
      // Update statistics
      results.success += burstResults.filter(r => r.success).length;
      results.failed += burstResults.filter(r => !r.success).length;
      results.avgResponseTime += burstResults.reduce(
        (sum, r) => sum + r.time, 0
      ) / burstResults.length;

      // Cool down between bursts
      await new Promise(resolve => setTimeout(resolve, cooldownMs));
    }

    // Calculate final averages
    results.avgResponseTime /= burstCount;

    // Verify performance targets
    expect(results.success).toBeGreaterThan(burstSize * burstCount * 0.95); // 95% success rate
    expect(results.avgResponseTime).toBeLessThan(5000); // Average response under 5s
  });
});
```

## Best Practices Deep Dive

### 1. Test Data Management

```typescript
// test-utils/image-fixtures.ts
export const createTestImage = async (
  width: number,
  height: number,
  options: {
    format?: 'jpeg' | 'png' | 'webp';
    quality?: number;
    hasAlpha?: boolean;
  } = {}
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Create test pattern
  if (options.hasAlpha) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  } else {
    ctx.fillStyle = 'red';
  }
  ctx.fillRect(0, 0, width, height);

  // Add some text for OCR testing
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Test Image', 10, 30);

  return new Promise(resolve => {
    canvas.toBlob(
      blob => resolve(blob!),
      `image/${options.format || 'jpeg'}`,
      options.quality || 0.9
    );
  });
};
```

### 2. Performance Monitoring

```typescript
// test-utils/performance-monitoring.ts
export class PerformanceMonitor {
  private metrics: {
    timestamp: number;
    memory: number;
    fps: number;
    networkRequests: number;
  }[] = [];

  start() {
    const recordMetrics = () => {
      this.metrics.push({
        timestamp: Date.now(),
        memory: performance.memory.usedJSHeapSize,
        fps: this.calculateFPS(),
        networkRequests: performance.getEntriesByType('resource').length
      });
    };

    setInterval(recordMetrics, 1000);
  }

  stop() {
    return this.generateReport();
  }

  private calculateFPS() {
    // FPS calculation logic
    return 60; // Simplified
  }

  private generateReport() {
    const avgMemory = this.metrics.reduce(
      (sum, m) => sum + m.memory, 0
    ) / this.metrics.length;

    return {
      averageMemoryUsage: avgMemory,
      peakMemoryUsage: Math.max(...this.metrics.map(m => m.memory)),
      averageFPS: this.metrics.reduce((sum, m) => sum + m.fps, 0) / this.metrics.length,
      totalNetworkRequests: this.metrics[this.metrics.length - 1].networkRequests
    };
  }
}
```

These examples provide more detailed implementations and cover additional edge cases for each testing category. Would you like me to explain any specific aspect in more detail? 