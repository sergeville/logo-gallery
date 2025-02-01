import { Page } from '@playwright/test';

// Viewport sizes for responsive testing
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 }
};

// Common breakpoints for responsive testing
export const BREAKPOINTS = [375, 768, 1280];

// Test responsive layouts
export async function testResponsiveLayout(
  page: Page,
  url: string,
  breakpoints: number[] = BREAKPOINTS
): Promise<void> {
  for (const width of breakpoints) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `test-results/responsive/${url.replace(/\//g, '-')}-${width}.png`
    });
  }
}

// Test dark mode
export async function testDarkMode(page: Page): Promise<void> {
  // Test light mode first
  await page.screenshot({ path: 'test-results/theme/light-mode.png' });
  
  // Switch to dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  
  // Wait for dark mode transition
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/theme/dark-mode.png' });
}

// Test loading states
export async function testLoadingStates(page: Page): Promise<void> {
  // Initial loading state
  await page.screenshot({ path: 'test-results/loading/initial.png' });
  
  // Simulate slow network
  await page.route('**/*', async route => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.continue();
  });
  
  // Loading state with network delay
  await page.screenshot({ path: 'test-results/loading/network-delay.png' });
}

// Test error states
export async function testErrorStates(page: Page): Promise<void> {
  // Network error
  await page.route('**/*', route => route.abort('failed'));
  await page.screenshot({ path: 'test-results/error/network-error.png' });
  
  // Not found error
  await page.route('**/*', route => route.fulfill({ status: 404 }));
  await page.screenshot({ path: 'test-results/error/not-found.png' });
  
  // Server error
  await page.route('**/*', route => route.fulfill({ status: 500 }));
  await page.screenshot({ path: 'test-results/error/server-error.png' });
}

// Test accessibility
export async function testAccessibility(page: Page): Promise<void> {
  const violations = await page.evaluate(async () => {
    const { default: axe } = await import('axe-core');
    return axe.run();
  });
  
  if (violations.violations.length > 0) {
    throw new Error(`Accessibility violations found: ${JSON.stringify(violations.violations, null, 2)}`);
  }
} 