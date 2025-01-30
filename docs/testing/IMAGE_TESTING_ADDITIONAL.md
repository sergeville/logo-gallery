# Additional Image Testing Scenarios

## Accessibility Testing

```typescript
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ImageGallery } from '@/components/ImageGallery';

expect.extend(toHaveNoViolations);

describe('Image Gallery Accessibility', () => {
  it('should meet accessibility standards', async () => {
    const { container } = render(
      <ImageGallery 
        images={[
          { id: '1', url: 'test1.jpg', alt: 'Test Image 1' },
          { id: '2', url: 'test2.jpg', alt: 'Test Image 2' }
        ]} 
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper alt text for all images', () => {
    render(
      <ImageGallery 
        images={[
          { id: '1', url: 'test1.jpg', alt: 'Test Image 1' },
          { id: '2', url: 'test2.jpg', alt: 'Test Image 2' }
        ]} 
      />
    );

    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
      expect(img.alt).not.toBe('');
    });
  });
});
```

## Security Testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Image Upload Security', () => {
  test('should prevent XSS in image metadata', async ({ page }) => {
    // Create an image with malicious metadata
    const maliciousImage = await createTestImage(800, 600, {
      metadata: {
        title: '<script>alert("xss")</script>',
        description: 'javascript:alert("xss")'
      }
    });

    // Attempt upload
    const response = await page.request.post('/api/upload', {
      multipart: {
        file: maliciousImage
      }
    });

    const data = await response.json();
    
    // Verify sanitization
    expect(data.metadata.title).not.toContain('<script>');
    expect(data.metadata.description).not.toContain('javascript:');
  });

  test('should validate file type at binary level', async ({ request }) => {
    // Create fake image (text file with .jpg extension)
    const fakeImage = new File(
      ['not an image'],
      'malicious.jpg',
      { type: 'image/jpeg' }
    );

    const response = await request.post('/api/upload', {
      multipart: {
        file: fakeImage
      }
    });

    expect(response.status()).toBe(400);
    expect(await response.text()).toContain('Invalid image file');
  });
});
```

## Cross-browser Testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Image Compatibility', () => {
  for (const browserType of ['chromium', 'firefox', 'webkit']) {
    test(`should render WebP with fallback in ${browserType}`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('/gallery');

      // Check if WebP is loaded in supported browsers
      const imageFormat = await page.evaluate(() => {
        const img = document.querySelector('img');
        return img.currentSrc.split('.').pop();
      });

      if (browserType === 'firefox' || browserType === 'chromium') {
        expect(imageFormat).toBe('webp');
      } else {
        expect(['jpg', 'png']).toContain(imageFormat);
      }
    });
  }
});
```

## Responsive Image Testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Responsive Image Behavior', () => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' }
  ];

  for (const viewport of viewports) {
    test(`should load appropriate image size for ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/gallery');

      // Check srcset selection
      const imageSrc = await page.evaluate(() => {
        const img = document.querySelector('img');
        return img.currentSrc;
      });

      // Verify correct image size is loaded
      if (viewport.width <= 375) {
        expect(imageSrc).toContain('size=small');
      } else if (viewport.width <= 768) {
        expect(imageSrc).toContain('size=medium');
      } else {
        expect(imageSrc).toContain('size=large');
      }

      // Take screenshot for visual verification
      await page.screenshot({
        path: `gallery-${viewport.name}.png`,
        fullPage: true
      });
    });
  }
});
```

## Offline Behavior Testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Offline Image Handling', () => {
  test('should show cached images when offline', async ({ page }) => {
    // Load gallery and wait for images
    await page.goto('/gallery');
    await page.waitForSelector('[data-testid="image-loaded"]');

    // Go offline
    await page.context().setOffline(true);

    // Reload page
    await page.reload();

    // Check if cached images are displayed
    const images = await page.$$('[data-testid="gallery-image"]');
    expect(images.length).toBeGreaterThan(0);
  });

  test('should show offline placeholder for uncached images', async ({ page }) => {
    await page.context().setOffline(true);
    await page.goto('/gallery');

    const placeholders = await page.$$('[data-testid="offline-placeholder"]');
    expect(placeholders.length).toBeGreaterThan(0);
  });
});
```

## Test Runner Configuration

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    }
  ]
};

export default config;
```

## Running the Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test image-gallery.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with UI mode
npx playwright test --ui

# Generate and serve HTML report
npx playwright show-report
```

## Test Results Analysis

```typescript
// test-utils/test-reporter.ts
export class TestReporter {
  private results: {
    passed: number;
    failed: number;
    duration: number;
    browserResults: {
      [key: string]: {
        passed: number;
        failed: number;
      }
    }
  } = {
    passed: 0,
    failed: 0,
    duration: 0,
    browserResults: {}
  };

  onTestEnd(test: any) {
    const browser = test.project.name;
    if (!this.results.browserResults[browser]) {
      this.results.browserResults[browser] = { passed: 0, failed: 0 };
    }

    if (test.status === 'passed') {
      this.results.passed++;
      this.results.browserResults[browser].passed++;
    } else {
      this.results.failed++;
      this.results.browserResults[browser].failed++;
    }
  }

  generateReport() {
    return {
      summary: {
        total: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: `${(this.results.passed / (this.results.passed + this.results.failed) * 100).toFixed(2)}%`
      },
      browserResults: this.results.browserResults,
      duration: this.results.duration
    };
  }
}
```

To run these tests, you'll need to:

1. Install dependencies:
```bash
npm install --save-dev @playwright/test jest-axe @testing-library/jest-dom
```

2. Configure environment:
```bash
# Setup test environment
npm run test:setup

# Run tests with coverage
npm run test:coverage

# Generate report
npm run test:report
```

The tests cover:
- Accessibility compliance
- Security vulnerabilities
- Cross-browser compatibility
- Responsive behavior
- Offline functionality
- Performance metrics

Would you like me to explain any specific test scenario in more detail or add more examples? 