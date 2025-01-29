import { test } from '@playwright/test';
import {
  takeComponentSnapshot,
  takeStateSnapshot,
  takeAllStateSnapshots,
} from '../helpers/percy';

test.describe('Logo Components', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('/test/visual/logos');
  });

  test('LogoUploader component', async ({ page }) => {
    // Test empty state
    await takeComponentSnapshot(page, '#logo-uploader', 'LogoUploader - Empty');

    // Test with preview
    await page.setInputFiles('#logo-upload', 'fixtures/test-logo.png');
    await takeComponentSnapshot(page, '#logo-uploader', 'LogoUploader - With Preview');

    // Test loading state
    await page.evaluate(() => {
      const uploader = document.querySelector('#logo-uploader');
      uploader?.setAttribute('data-state', 'loading');
    });
    await takeComponentSnapshot(page, '#logo-uploader', 'LogoUploader - Loading');

    // Test error state
    await page.evaluate(() => {
      const uploader = document.querySelector('#logo-uploader');
      uploader?.setAttribute('data-state', 'error');
    });
    await takeComponentSnapshot(page, '#logo-uploader', 'LogoUploader - Error');
  });

  test('LogoGrid component', async ({ page }) => {
    // Test empty grid
    await takeComponentSnapshot(page, '#logo-grid', 'LogoGrid - Empty');

    // Test with logos
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('test:load-logos'));
    });
    await takeComponentSnapshot(page, '#logo-grid', 'LogoGrid - With Logos');

    // Test loading state
    await page.evaluate(() => {
      const grid = document.querySelector('#logo-grid');
      grid?.setAttribute('data-state', 'loading');
    });
    await takeComponentSnapshot(page, '#logo-grid', 'LogoGrid - Loading More');
  });

  test('LogoCard component', async ({ page }) => {
    // Basic states
    await takeAllStateSnapshots(
      page,
      '.logo-card',
      'LogoCard',
      ['default', 'hover', 'focus', 'selected']
    );

    // Test with different image states
    const imageStates = ['loading', 'error', 'optimized'];
    for (const state of imageStates) {
      await page.evaluate((s) => {
        const card = document.querySelector('.logo-card img');
        card?.setAttribute('data-state', s);
      }, state);
      await takeComponentSnapshot(page, '.logo-card', `LogoCard - Image ${state}`);
    }
  });

  test('LogoDetails component', async ({ page }) => {
    // Navigate to details page
    await page.goto('/test/visual/logo-details');

    // Test loading state
    await takeComponentSnapshot(page, '#logo-details', 'LogoDetails - Loading');

    // Test with data
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('test:load-logo-details'));
    });
    await takeComponentSnapshot(page, '#logo-details', 'LogoDetails - With Data');

    // Test error state
    await page.evaluate(() => {
      const details = document.querySelector('#logo-details');
      details?.setAttribute('data-state', 'error');
    });
    await takeComponentSnapshot(page, '#logo-details', 'LogoDetails - Error');
  });

  test('LogoStats component', async ({ page }) => {
    // Test with different optimization levels
    const optimizationLevels = ['none', 'low', 'medium', 'high'];
    for (const level of optimizationLevels) {
      await page.evaluate((l) => {
        const stats = document.querySelector('#logo-stats');
        stats?.setAttribute('data-optimization', l);
      }, level);
      await takeComponentSnapshot(
        page,
        '#logo-stats',
        `LogoStats - ${level} optimization`
      );
    }
  });

  test('LogoEditor component', async ({ page }) => {
    // Navigate to editor page
    await page.goto('/test/visual/logo-editor');

    // Test empty state
    await takeComponentSnapshot(page, '#logo-editor', 'LogoEditor - Empty');

    // Test with image
    await page.setInputFiles('#logo-editor-upload', 'fixtures/test-logo.png');
    await takeComponentSnapshot(page, '#logo-editor', 'LogoEditor - With Image');

    // Test different tool states
    const tools = ['crop', 'resize', 'optimize'];
    for (const tool of tools) {
      await page.click(`[data-tool="${tool}"]`);
      await takeComponentSnapshot(page, '#logo-editor', `LogoEditor - ${tool} tool`);
    }
  });
}); 