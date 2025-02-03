import { test, expect } from '@playwright/test';
import { preparePageForVisualTest } from './utils/visual-test-utils';

test.describe('Design Documentation Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('Homepage Layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Full page screenshot
    await page.screenshot({
      path: 'docs/design/screenshots/homepage-layout.png',
      fullPage: true,
    });

    // Hero section
    await page.locator('section.hero').screenshot({
      path: 'docs/design/screenshots/homepage-hero.png',
    });

    // Gallery grid
    await page.locator('.logo-grid').screenshot({
      path: 'docs/design/screenshots/gallery-grid.png',
    });
  });

  test('Navigation Components', async ({ page }) => {
    await page.goto('/');

    // Header/Navbar
    await page.locator('header').screenshot({
      path: 'docs/design/screenshots/navigation-header.png',
    });

    // Mobile menu (first trigger it)
    await page.locator('button[aria-label="Toggle menu"]').click();
    await page.locator('[role="dialog"]').screenshot({
      path: 'docs/design/screenshots/navigation-mobile.png',
    });
  });

  test('Logo Details Page', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');

    // Logo card grid
    await page.locator('.logo-grid').screenshot({
      path: 'docs/design/screenshots/logo-cards.png',
    });

    // Individual logo card
    await page.locator('.logo-card').first().screenshot({
      path: 'docs/design/screenshots/logo-card-detail.png',
    });
  });

  test('Upload Interface', async ({ page }) => {
    await page.goto('/upload');
    await page.waitForLoadState('networkidle');

    // Upload form
    await page.locator('form').screenshot({
      path: 'docs/design/screenshots/upload-form.png',
    });

    // Upload dropzone
    await page.locator('.dropzone').screenshot({
      path: 'docs/design/screenshots/upload-dropzone.png',
    });
  });

  test('Authentication UI', async ({ page }) => {
    // Sign in page
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'docs/design/screenshots/auth-signin.png',
    });
  });

  test('Dark Mode Variants', async ({ page }) => {
    await page.goto('/');

    // Light mode
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.screenshot({
      path: 'docs/design/screenshots/theme-light.png',
      fullPage: true,
    });

    // Dark mode
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.screenshot({
      path: 'docs/design/screenshots/theme-dark.png',
      fullPage: true,
    });
  });

  test('Responsive Layouts', async ({ page }) => {
    await page.goto('/');

    // Mobile layout (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: 'docs/design/screenshots/responsive-mobile.png',
      fullPage: true,
    });

    // Tablet layout (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: 'docs/design/screenshots/responsive-tablet.png',
      fullPage: true,
    });

    // Desktop layout
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({
      path: 'docs/design/screenshots/responsive-desktop.png',
      fullPage: true,
    });
  });

  test('Interactive Elements', async ({ page }) => {
    await page.goto('/');

    // Buttons in different states
    const button = page.locator('button.primary').first();
    await button.screenshot({
      path: 'docs/design/screenshots/button-default.png',
    });

    await button.hover();
    await button.screenshot({
      path: 'docs/design/screenshots/button-hover.png',
    });

    // Form inputs
    const input = page.locator('input[type="text"]').first();
    await input.screenshot({
      path: 'docs/design/screenshots/input-default.png',
    });

    await input.focus();
    await input.screenshot({
      path: 'docs/design/screenshots/input-focus.png',
    });
  });

  test('Loading States', async ({ page }) => {
    await page.goto('/gallery');

    // Skeleton loading state
    await page.evaluate(() => {
      window.localStorage.setItem('loading-state', 'true');
    });
    await page.reload();

    await page.locator('.skeleton-loader').screenshot({
      path: 'docs/design/screenshots/loading-skeleton.png',
    });
  });

  test('Error States', async ({ page }) => {
    await page.goto('/gallery');

    // Error state
    await page.evaluate(() => {
      window.localStorage.setItem('error-state', 'true');
    });
    await page.reload();

    await page.locator('.error-message').screenshot({
      path: 'docs/design/screenshots/error-state.png',
    });
  });
});

test.describe('Design Documentation Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/design');
  });

  test('should render design system documentation correctly', async ({ page }) => {
    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('design-system-docs.png');
  });

  test('should display color palette section correctly', async ({ page }) => {
    await page.click('[data-testid="color-palette-section"]');
    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('color-palette.png');
  });

  test('should display typography section correctly', async ({ page }) => {
    await page.click('[data-testid="typography-section"]');
    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('typography.png');
  });

  test('should display spacing guidelines correctly', async ({ page }) => {
    await page.click('[data-testid="spacing-section"]');
    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('spacing-guidelines.png');
  });

  test('should display component examples correctly', async ({ page }) => {
    await page.click('[data-testid="components-section"]');
    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('component-examples.png');
  });

  test('should display responsive design guidelines correctly', async ({ page }) => {
    await page.click('[data-testid="responsive-section"]');
    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('responsive-guidelines.png');
  });

  test('should display accessibility guidelines correctly', async ({ page }) => {
    await page.click('[data-testid="accessibility-section"]');
    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('accessibility-guidelines.png');
  });

  test('should display animation guidelines correctly', async ({ page }) => {
    await page.click('[data-testid="animation-section"]');
    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('animation-guidelines.png');
  });

  test('should display dark mode guidelines correctly', async ({ page }) => {
    await page.click('[data-testid="dark-mode-section"]');
    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('dark-mode-guidelines.png');
  });
});
