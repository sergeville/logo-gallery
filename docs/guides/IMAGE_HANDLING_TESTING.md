# Image Handling Testing Guide

## Table of Contents
1. [Unit Testing](#unit-testing)
2. [Integration Testing](#integration-testing)
3. [Visual Regression Testing](#visual-regression-testing)
4. [Performance Testing](#performance-testing)
5. [Load Testing](#load-testing)

## Unit Testing

### 1. Testing Image Optimization Service
```typescript
import { imageOptimizationService } from '@/app/lib/services';
import { readFileSync } from 'fs';
import path from 'path';

describe('ImageOptimizationService', () => {
  const testImagePath = path.join(__dirname, '../fixtures/test-logo.png');
  const imageBuffer = readFileSync(testImagePath);

  describe('analyzeImage', () => {
    it('should analyze image and return valid metadata', async () => {
      const analysis = await imageOptimizationService.analyzeImage(imageBuffer);

      expect(analysis).toEqual(expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
        format: expect.any(String),
        hasAlpha: expect.any(Boolean),
      }));
    });

    it('should throw error for invalid image data', async () => {
      const invalidBuffer = Buffer.from('invalid data');
      await expect(imageOptimizationService.analyzeImage(invalidBuffer))
        .rejects.toThrow();
    });
  });

  describe('optimizeBuffer', () => {
    it('should optimize image and reduce file size', async () => {
      const analysis = await imageOptimizationService.analyzeImage(imageBuffer);
      const result = await imageOptimizationService.optimizeBuffer(imageBuffer, analysis);

      expect(result.buffer.length).toBeLessThan(imageBuffer.length);
      expect(result.metadata).toEqual(expect.objectContaining({
        width: analysis.width,
        height: analysis.height,
        format: expect.any(String),
      }));
    });

    it('should maintain image dimensions after optimization', async () => {
      const analysis = await imageOptimizationService.analyzeImage(imageBuffer);
      const result = await imageOptimizationService.optimizeBuffer(imageBuffer, analysis);

      expect(result.metadata.width).toBe(analysis.width);
      expect(result.metadata.height).toBe(analysis.height);
    });
  });
});
```

### 2. Testing Custom Hooks
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useImageOptimization } from '@/app/hooks/useImageOptimization';

describe('useImageOptimization', () => {
  const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

  it('should handle image optimization', async () => {
    const { result } = renderHook(() => useImageOptimization());

    expect(result.current.isOptimizing).toBe(false);
    expect(result.current.optimizationStats).toBeNull();

    await act(async () => {
      const optimizationResult = await result.current.optimizeImage(mockFile);
      expect(optimizationResult.success).toBe(true);
      expect(optimizationResult.metadata).toBeDefined();
    });

    expect(result.current.isOptimizing).toBe(false);
    expect(result.current.optimizationStats).toBeDefined();
  });

  it('should handle optimization errors', async () => {
    const { result } = renderHook(() => useImageOptimization());

    const invalidFile = new File(['invalid'], 'invalid.txt', { type: 'text/plain' });

    await act(async () => {
      const optimizationResult = await result.current.optimizeImage(invalidFile);
      expect(optimizationResult.success).toBe(false);
      expect(optimizationResult.error).toBeDefined();
    });
  });
});
```

### 3. Testing Components
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoUploader } from '@/app/components/LogoUploader';

describe('LogoUploader', () => {
  const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

  it('should display preview after file selection', async () => {
    render(<LogoUploader />);

    const input = screen.getByLabelText(/upload logo/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByAltText('Logo preview')).toBeInTheDocument();
    });
  });

  it('should show optimization progress', async () => {
    render(<LogoUploader />);

    const input = screen.getByLabelText(/upload logo/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    expect(screen.getByText(/optimizing/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/optimization complete/i)).toBeInTheDocument();
    });
  });

  it('should handle upload errors', async () => {
    render(<LogoUploader />);

    const largeFile = new File(['test'.repeat(1000000)], 'large.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload logo/i);
    
    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/file size exceeds/i)).toBeInTheDocument();
    });
  });
});
```

## Integration Testing

### 1. Testing Upload Flow
```typescript
describe('Logo Upload Flow', () => {
  it('should upload and optimize logo', async () => {
    // Setup test database
    const db = await setupTestDatabase();
    
    // Create test user
    const user = await createTestUser(db);
    
    // Mock file
    const logoFile = await createTestFile('test-logo.png');
    
    // Submit upload form
    const response = await fetch('/api/logos/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,
      },
      body: createFormData({ file: logoFile }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    // Verify response
    expect(data).toEqual(expect.objectContaining({
      id: expect.any(String),
      imageUrl: expect.any(String),
      thumbnailUrl: expect.any(String),
      optimizationStats: expect.objectContaining({
        originalSize: expect.any(Number),
        optimizedSize: expect.any(Number),
        compressionRatio: expect.any(Number),
      }),
    }));

    // Verify files exist
    const originalExists = await fileExists(data.imageUrl);
    const thumbnailExists = await fileExists(data.thumbnailUrl);
    expect(originalExists).toBe(true);
    expect(thumbnailExists).toBe(true);

    // Verify database entry
    const logo = await db.collection('logos').findOne({ _id: data.id });
    expect(logo).toBeDefined();
    expect(logo.optimizationStats).toBeDefined();
  });
});
```

### 2. Testing Image Processing Pipeline
```typescript
describe('Image Processing Pipeline', () => {
  it('should process image through all stages', async () => {
    const stages = [
      'validation',
      'optimization',
      'thumbnail-generation',
      'responsive-variants',
      'storage',
      'cleanup',
    ];

    const pipeline = new ImageProcessingPipeline({
      input: testImageBuffer,
      stages,
    });

    const result = await pipeline.process();

    expect(result.stageResults).toEqual(
      expect.objectContaining({
        validation: expect.any(Object),
        optimization: expect.any(Object),
        'thumbnail-generation': expect.any(Object),
        'responsive-variants': expect.any(Object),
        storage: expect.any(Object),
        cleanup: expect.any(Object),
      })
    );

    // Verify each stage completed successfully
    Object.values(result.stageResults).forEach(stage => {
      expect(stage.success).toBe(true);
    });
  });
});
```

## Visual Regression Testing

### 1. Component Testing
```typescript
import { test, expect } from '@playwright/test';

test.describe('LogoImage Component', () => {
  test('should render logo with correct dimensions', async ({ page }) => {
    await page.goto('/test/logo-image');
    
    // Wait for image to load
    await page.waitForSelector('img[alt="Test Logo"]');
    
    // Take screenshot
    const screenshot = await page.screenshot();
    
    // Compare with baseline
    expect(screenshot).toMatchSnapshot('logo-image.png');
  });

  test('should show placeholder while loading', async ({ page }) => {
    await page.goto('/test/logo-image');
    
    // Capture initial render
    const placeholder = await page.screenshot();
    
    // Compare with baseline
    expect(placeholder).toMatchSnapshot('logo-placeholder.png');
  });

  test('should handle error state', async ({ page }) => {
    await page.goto('/test/logo-image?error=true');
    
    // Wait for error state
    await page.waitForSelector('.error-fallback');
    
    // Take screenshot
    const errorState = await page.screenshot();
    
    // Compare with baseline
    expect(errorState).toMatchSnapshot('logo-error.png');
  });
});
```

### 2. Responsive Testing
```typescript
import { test, expect } from '@playwright/test';

test.describe('Responsive Logo Display', () => {
  const viewports = [
    { width: 375, height: 667 },  // Mobile
    { width: 768, height: 1024 }, // Tablet
    { width: 1440, height: 900 }, // Desktop
  ];

  for (const viewport of viewports) {
    test(`should render correctly at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize(viewport);
      
      // Navigate to gallery
      await page.goto('/gallery');
      
      // Wait for images to load
      await page.waitForSelector('.logo-grid img');
      
      // Take screenshot
      const screenshot = await page.screenshot();
      
      // Compare with baseline
      expect(screenshot).toMatchSnapshot(`gallery-${viewport.width}.png`);
    });
  }
});
```

## Performance Testing

### 1. Image Processing Performance
```typescript
import { performance } from 'perf_hooks';

describe('Image Processing Performance', () => {
  const imageSizes = [
    { width: 800, height: 600 },
    { width: 1600, height: 1200 },
    { width: 3200, height: 2400 },
  ];

  for (const size of imageSizes) {
    it(`should optimize ${size.width}x${size.height} image within threshold`, async () => {
      const testImage = await generateTestImage(size);
      
      const startTime = performance.now();
      const result = await imageOptimizationService.optimizeBuffer(testImage);
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      
      // Processing should take less than 1 second for any size
      expect(processingTime).toBeLessThan(1000);
      
      // Should achieve at least 30% size reduction
      const compressionRatio = 1 - (result.buffer.length / testImage.length);
      expect(compressionRatio).toBeGreaterThan(0.3);
    });
  }
});
```

### 2. Memory Usage Testing
```typescript
describe('Memory Usage', () => {
  it('should handle batch processing without memory leaks', async () => {
    const initialMemory = process.memoryUsage();
    
    // Process 100 images
    for (let i = 0; i < 100; i++) {
      const testImage = await generateTestImage({ width: 800, height: 600 });
      await imageOptimizationService.optimizeBuffer(testImage);
    }
    
    const finalMemory = process.memoryUsage();
    
    // Memory usage should not increase by more than 50MB
    expect(finalMemory.heapUsed - initialMemory.heapUsed)
      .toBeLessThan(50 * 1024 * 1024);
  });
});
```

## Load Testing

### 1. Concurrent Upload Testing
```typescript
import autocannon from 'autocannon';

describe('Upload Endpoint Load Testing', () => {
  it('should handle concurrent uploads', async () => {
    const result = await autocannon({
      url: 'http://localhost:3000/api/upload',
      connections: 100,
      duration: 30,
      requests: [
        {
          method: 'POST',
          body: createTestFormData(),
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      ],
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.non2xx).toBe(0);
    expect(result.latency.p99).toBeLessThan(2000); // 99th percentile under 2s
  });
});
```

### 2. Image Processing Queue Testing
```typescript
describe('Image Processing Queue', () => {
  it('should handle high load without errors', async () => {
    const queue = new ImageProcessingQueue({
      concurrency: 5,
      timeout: 30000,
    });

    const results = await Promise.all(
      Array.from({ length: 100 }, (_, i) => 
        queue.add({
          file: createTestFile(`test-${i}.png`),
          priority: i % 2 === 0 ? 'high' : 'normal',
        })
      )
    );

    const errors = results.filter(r => !r.success);
    expect(errors.length).toBe(0);

    const stats = queue.getStats();
    expect(stats.averageProcessingTime).toBeLessThan(1000);
    expect(stats.maxConcurrent).toBeLessThanOrEqual(5);
  });
}); 