import { test } from '@playwright/test';
import {
  testComponentStates,
  testResponsiveLayouts,
  preparePageForVisualTest,
  compareScreenshots
} from '@/e2e/utils/visual-test-utils';

test.describe('Visual Components', () => {
  test('should test logo gallery component states', async ({ page }) => {
    await preparePageForVisualTest(page);
    
    await testComponentStates(page, 'logo-gallery', [
      {
        name: 'empty',
        setup: async () => {
          await page.route('**/api/images', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({ data: [] })
            });
          });
          await page.goto('/gallery');
        }
      },
      {
        name: 'with-logos',
        setup: async () => {
          await page.route('**/api/images', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({
                data: [
                  { id: '1', name: 'Logo 1', url: 'https://example.com/logo1.png' },
                  { id: '2', name: 'Logo 2', url: 'https://example.com/logo2.png' }
                ]
              })
            });
          });
          await page.goto('/gallery');
        }
      },
      {
        name: 'error',
        setup: async () => {
          await page.route('**/api/images', (route) => {
            route.fulfill({ status: 500 });
          });
          await page.goto('/gallery');
        }
      }
    ]);
  });

  test('should test navigation component states', async ({ page }) => {
    await preparePageForVisualTest(page);
    
    await testComponentStates(page, 'navigation', [
      {
        name: 'default',
        setup: async () => {
          await page.goto('/gallery');
        }
      },
      {
        name: 'active',
        setup: async () => {
          await page.goto('/gallery');
          await page.click('[data-testid="nav-menu-button"]');
        }
      }
    ]);
  });

  test('should test responsive layouts', async ({ page }) => {
    await preparePageForVisualTest(page);
    
    await testResponsiveLayouts(page, 'responsive-layout', async (viewport) => {
      await page.setViewportSize(viewport);
      await page.route('**/api/config', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              gallery: {
                columns: viewport.width >= 1024 ? 4 : viewport.width >= 768 ? 3 : 2,
                spacing: 16,
                maxWidth: 1200,
                imageHeight: 200
              }
            }
          })
        });
      });
      await page.goto('/gallery');
      await compareScreenshots(page, `responsive-${viewport.width}x${viewport.height}`);
    });
  });
}); 