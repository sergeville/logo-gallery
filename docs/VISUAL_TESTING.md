# Visual Regression Testing Guide

This guide explains how to use and maintain visual regression tests in the Logo Gallery project.

## Overview

Visual regression testing helps us catch unintended visual changes in our UI components and layouts. We use Playwright for automated visual comparison testing across multiple browsers and devices.

## Setup

The visual testing environment is configured in:
- `playwright.visual.config.ts` - Main configuration file
- `e2e/visual-tests/utils/` - Helper functions and utilities
- `e2e/visual-tests/` - Test files and snapshots
- `docs/VISUAL_ERRORS.md` - Known issues and solutions

## Running Tests

```bash
# Run visual tests
npm run test:visual

# Update snapshots (when changes are intentional)
npm run test:visual:update

# Run tests with UI for debugging
npm run test:visual -- --ui

# Run tests for specific components
npm run test:visual components/
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
   - Dark mode state

2. Responsive Layouts
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1280x720)
   - Large Desktop (1920x1080)

3. Theme Variations
   - Light mode
   - Dark mode
   - System preference

4. User Interactions
   - Form submissions
   - Logo uploads
   - Gallery interactions
   - Authentication flows

## Writing Visual Tests

### Basic Component Test

```typescript
import { test, expect } from '@playwright/test';
import { preparePageForVisualTest } from '../utils/visual-test-utils';

test('Component appearance', async ({ page }) => {
  await preparePageForVisualTest(page);
  await page.goto('/path');
  
  // Wait for any loading states
  await page.waitForSelector('.component', { state: 'visible' });
  
  // Take screenshot
  await expect(page.locator('.component')).toHaveScreenshot('component.png');
});
```

### Testing Component States

```typescript
import { testComponentStates } from '../utils/visual-test-utils';

test('Button states', async ({ page }) => {
  await testComponentStates(page, 'button.primary', {
    default: async () => {},
    hover: async (el) => await el.hover(),
    focus: async (el) => await el.focus(),
    active: async (el) => await el.click({ noWaitAfter: true }),
    disabled: async (el) => await el.evaluate(e => e.setAttribute('disabled', '')),
  });
});
```

### Testing Responsive Layouts

```typescript
import { testResponsiveLayouts } from '../utils/visual-test-utils';

test('Responsive layout', async ({ page }) => {
  await testResponsiveLayouts(page, '/gallery', {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    large: { width: 1920, height: 1080 },
  });
});
```

### Testing Dark Mode

```typescript
import { testThemeVariants } from '../utils/visual-test-utils';

test('Dark mode appearance', async ({ page }) => {
  await testThemeVariants(page, '/gallery', {
    light: () => page.evaluate(() => document.documentElement.classList.remove('dark')),
    dark: () => page.evaluate(() => document.documentElement.classList.add('dark')),
  });
});
```

## Best Practices

1. **Test Preparation**
   - Use `preparePageForVisualTest()` to disable animations
   - Wait for the page to be fully loaded
   - Clear dynamic content
   - Set consistent test data
   - Handle authentication states

2. **Snapshot Organization**
   - Use descriptive names: `component-state-viewport-theme.png`
   - Group snapshots by feature
   - Include browser information
   - Document snapshot updates

3. **Handling Dynamic Content**
   - Mock API responses
   - Use fixed dates/times
   - Replace dynamic IDs
   - Consistent test data
   - Handle image uploads

4. **Reducing Flakiness**
   - Set appropriate timeouts
   - Wait for animations
   - Use stable selectors
   - Handle loading states
   - Check network status

## Maintenance

### When to Update Snapshots

Update snapshots when:
- Making intentional UI changes
- Updating component styles
- Changing layout behavior
- Modifying theme variables
- Adding new features
- Fixing visual bugs

### When Not to Update

Don't update when:
- Tests fail unexpectedly
- Dynamic content issues
- Browser inconsistencies
- Network problems
- Loading state issues

### Review Process

1. Run tests locally first
2. Check diff images carefully
3. Verify changes across viewports
4. Test both theme modes
5. Document changes in PR
6. Update visual error tracking

## Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Check loading states
   - Verify animations
   - Test network conditions
   - Check selector stability
   - Validate test data

2. **Cross-browser Issues**
   - Compare browser versions
   - Check font rendering
   - Verify CSS support
   - Test OS differences
   - Monitor performance

3. **Authentication Problems**
   - Verify session state
   - Check token expiry
   - Test redirect flows
   - Handle error states

### Debug Tools

1. Use `--ui` flag for debugging
2. Check test artifacts
3. Use trace viewer
4. Monitor network requests
5. Check console logs

## CI/CD Integration

Tests run automatically:
- On pull requests
- Against main branch
- Scheduled nightly
- Cross-browser matrix
- Multiple viewports

### CI Configuration

```yaml
visual-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    - name: Run visual tests
      run: npm run test:visual
    - name: Upload artifacts
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: visual-test-results
        path: test-results/
```

## Error Tracking

All visual test failures are documented in `docs/VISUAL_ERRORS.md`:
- Error description
- Affected components
- Browser/viewport info
- Steps to reproduce
- Proposed solutions

## Future Improvements

1. Implement Percy.io integration
2. Add visual performance testing
3. Improve error reporting
4. Add accessibility testing
5. Automate error tracking
6. Enhance test coverage
7. Optimize test speed 