# Visual Regression Testing Guide

This guide explains how to use and maintain visual regression tests in the Logo Gallery project.

## Overview

Visual regression testing helps us catch unintended visual changes in our UI components and layouts. We use Playwright for automated visual comparison testing.

## Setup

The visual testing environment is already configured in:
- `playwright.visual.config.ts` - Main configuration file
- `e2e/utils/visual-test-utils.ts` - Helper functions
- `e2e/visual-tests/` - Test files

## Running Tests

```bash
# Run visual tests
npm run test:visual

# Update snapshots (when changes are intentional)
npm run test:visual:update

# Run tests with UI for debugging
npm run test:visual:ui
```

## Test Coverage

Our visual tests cover:

1. Component States
   - Default state
   - Hover state
   - Focus state
   - Active state
   - Disabled state
   - Error state
   - Loading state

2. Responsive Layouts
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1280x720)
   - Widescreen (1920x1080)

3. Theme Variations
   - Light mode
   - Dark mode

## Writing Visual Tests

### Basic Component Test

```typescript
import { test, expect } from '@playwright/test';
import { preparePageForVisualTest } from '../e2e/visual-tests/utils/visual-test-utils';

test('Component appearance', async ({ page }) => {
  await preparePageForVisualTest(page);
  await page.goto('/path');
  await expect(page.locator('.component')).toHaveScreenshot('component.png');
});
```

### Testing Component States

```typescript
import { testComponentStates, COMPONENT_STATES } from '../e2e/visual-tests/utils/visual-test-utils';

test('Button states', async ({ page }) => {
  await testComponentStates(page, 'button.primary', {
    default: async () => {},
    hover: async () => COMPONENT_STATES.hover(page, 'button.primary'),
    focus: async () => COMPONENT_STATES.focus(page, 'button.primary'),
  });
});
```

### Testing Responsive Layouts

```typescript
import { testResponsiveLayouts, VIEWPORT_SIZES } from '../e2e/visual-tests/utils/visual-test-utils';

test('Responsive layout', async ({ page }) => {
  await testResponsiveLayouts(page, [
    VIEWPORT_SIZES.mobile,
    VIEWPORT_SIZES.tablet,
    VIEWPORT_SIZES.desktop,
  ]);
});
```

## Best Practices

1. **Prepare the Page**
   - Always use `preparePageForVisualTest()` to disable animations
   - Wait for the page to be fully loaded
   - Clear any dynamic content that might cause flakiness

2. **Snapshot Naming**
   - Use descriptive names: `component-state-viewport.png`
   - Include relevant dimensions for responsive tests
   - Include theme for theme-specific tests

3. **Handling Dynamic Content**
   - Mock API responses for consistent data
   - Use fixed dates/times
   - Replace dynamic IDs with constants

4. **Reducing Flakiness**
   - Set appropriate timeout values
   - Wait for animations to complete
   - Use stable selectors
   - Handle loading states

## Maintenance

### When to Update Snapshots

Update snapshots when:
- Making intentional UI changes
- Updating component styles
- Changing layout behavior
- Modifying theme variables

### When Not to Update

Don't update when:
- Tests are failing unexpectedly
- Dynamic content is causing inconsistencies
- Browser/platform differences appear

### Reviewing Changes

When reviewing visual changes:
1. Check the diff images
2. Verify changes are intentional
3. Test across all viewports
4. Test both theme modes

## Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Increase timeout values
   - Add explicit waits
   - Check for animations
   - Verify selectors

2. **Different Results Locally vs CI**
   - Check browser versions
   - Verify viewport sizes
   - Compare system fonts
   - Check OS differences

3. **Missing Elements**
   - Verify selectors
   - Check loading states
   - Ensure proper waits
   - Verify page navigation

### Debug Tools

1. Use `test:visual:ui` for interactive debugging
2. Check screenshot artifacts in test results
3. Use `page.pause()` for step-by-step debugging
4. Enable trace recordings for detailed analysis

## CI/CD Integration

Visual tests run in CI:
- On pull requests
- Against main branch
- In multiple browsers
- Across different viewport sizes

### CI Configuration

```yaml
- name: Visual Tests
  run: |
    npm run test:visual
    # Archive test results and screenshots
    tar -czf visual-test-results.tar.gz test-results
```

## Future Improvements

1. Add Percy.io integration for better diff visualization
2. Implement component-specific snapshot directories
3. Add visual testing for animations
4. Create custom diff viewer
5. Add performance budget testing 