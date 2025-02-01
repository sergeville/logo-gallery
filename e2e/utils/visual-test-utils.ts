import { Page, expect } from '@playwright/test';

export async function preparePageForVisualTest(page: Page) {
  // Set viewport size for consistent screenshots
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Disable animations for consistent snapshots
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  });
}

export interface ComponentState {
  name: string;
  setup: (page: Page) => Promise<void>;
}

export async function testComponentStates(page: Page, componentId: string, states: ComponentState[]) {
  for (const state of states) {
    await state.setup(page);
    await expect(page.locator(`#${componentId}`)).toBeVisible();
    await expect(page).toHaveScreenshot(`${componentId}-${state.name}.png`, {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')]
    });
  }
}

export async function testResponsiveLayouts(page: Page, url: string, breakpoints: number[]) {
  for (const width of breakpoints) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto(url);
    await expect(page).toHaveScreenshot(`responsive-${width}.png`, {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')]
    });
  }
} 