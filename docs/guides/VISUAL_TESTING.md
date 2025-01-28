# Visual Regression Testing Guide

This guide explains how to use and maintain the visual regression testing system in the Logo Gallery project.

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Configuration](#test-configuration)
- [Writing Tests](#writing-tests)
- [Utilities](#utilities)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Visual regression testing helps ensure that UI changes don't introduce unexpected visual regressions. Our setup uses Playwright for:
- Component-level visual testing
- Page-level layout testing
- Responsive design testing
- Dark mode testing
- Interactive state testing (hover, focus, etc.)

## Getting Started

Follow these steps to start using visual regression testing:

1. **First Time Setup**
```bash
# Install dependencies if you haven't already
npm install

# Generate initial baseline screenshots
npm run test:visual:update
```
This will create baseline screenshots for all components and pages in various states and viewports.

2. **Regular Testing**
```bash
# Run visual regression tests
npm run test:visual
```
This will:
- Take new screenshots of all components and pages
- Compare them with baseline screenshots
- Report any visual differences
- Generate HTML and JSON reports in `visual-test-results/`

3. **Interactive Debugging**
```bash
# Run tests with Playwright UI
npm run test:visual:ui
```
This provides:
- Real-time test execution visualization
- Step-by-step debugging
- Visual comparison tools
- Screenshot history

### What Gets Tested

The visual regression tests automatically check:

1. **Components**
   - Logo cards
   - Navigation bar
   - Forms
   - Buttons
   - Modal dialogs

2. **Pages**
   - Homepage
   - Gallery view
   - Upload form
   - Error pages

3. **Responsive Layouts**
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1280x720)

4. **Theme Variations**
   - Light mode
   - Dark mode

5. **Component States**
   - Default
   - Hover
   - Focus
   - Active
   - Disabled
   - Loading
   - Error

6. **Generated Reports**
   - HTML report with visual diffs
   - JSON report with test details
   - Screenshot comparisons
   - Test execution logs

## Setup

### Prerequisites

1. **Node.js and npm**
   - Node.js version 14 or higher
   - npm version 6 or higher

2. **Project Dependencies**
   ```bash
   # These are included in package.json
   "@playwright/test": "^1.49.1"
   ```

3. **Directory Structure**
   ```
   logo-gallery/
   ├── e2e/
   │   └── visual/
   │       ├── tests/           # Test files
   │       ├── snapshots/       # Baseline screenshots
   │       └── utils/           # Test utilities
   ├── playwright.visual.config.ts
   └── visual-test-results/     # Generated reports
   ```

### Environment Setup

1. **Test Environment Variables**
   ```bash
   # .env.test
   NODE_ENV=test
   BASE_URL=http://localhost:3000
   ```

2. **Browser Configuration**
   ```typescript
   // playwright.visual.config.ts
   use: {
     baseURL: process.env.BASE_URL,
     trace: 'retain-on-failure',
     screenshot: 'only-on-failure',
     video: 'retain-on-failure',
   }
   ```

3. **Test Data**
   - Mock API responses are in `e2e/visual/mocks/`
   - Test images are in `e2e/visual/fixtures/`

### CI/CD Integration

1. **GitHub Actions**
   ```yaml
   - name: Install Playwright browsers
     run: npx playwright install --with-deps
   
   - name: Run visual tests
     run: npm run test:visual
   ```

2. **Visual Test Artifacts**
   ```yaml
   - uses: actions/upload-artifact@v2
     if: failure()
     with:
       name: visual-test-results
       path: visual-test-results/
   ```

## Running Tests

We have three main test commands:

```bash
# Run visual regression tests
npm run test:visual

# Update baseline screenshots
npm run test:visual:update

# Run tests with UI for debugging
npm run test:visual:ui
```

## Test Configuration

Configuration is in `playwright.visual.config.ts`:

```typescript
{
  // Test different devices and viewports
  projects: [
    {
      name: 'Desktop Chrome',
      viewport: { width: 1280, height: 720 }
    },
    {
      name: 'Mobile Chrome',
      viewport: { width: 375, height: 667 }
    },
    // ... more configurations
  ],
  
  // Screenshot comparison settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2
    }
  }
}
```

## Writing Tests

### Basic Test Structure

```typescript
import { test } from '@playwright/test';
import { preparePageForVisualTest } from './utils/visual-test-utils';

test('component matches snapshot', async ({ page }) => {
  const visualTest = await preparePageForVisualTest(page, {
    waitForSelectors: ['[data-testid="component"]'],
    removeSelectors: ['[data-testid="dynamic-content"]'],
    maskSelectors: ['[data-testid="timestamp"]']
  });

  await visualTest.takeScreenshot('component.png');
});
```

### Testing Component States

```typescript
import { testComponentStates } from './utils/visual-test-utils';

test('button states', async ({ page }) => {
  await testComponentStates(
    page,
    '[data-testid="button"]',
    [
      { name: 'default', action: async () => {} },
      { name: 'hover', action: async (el) => await el.hover() },
      { name: 'focus', action: async (el) => await el.focus() }
    ]
  );
});
```

### Testing Responsive Layouts

```typescript
import { testResponsiveLayouts } from './utils/visual-test-utils';

test('responsive design', async ({ page }) => {
  await testResponsiveLayouts(page, 'homepage', {
    waitForSelectors: ['[data-testid="main-content"]']
  });
});
```

### Before/After Comparisons

```typescript
import { compareScreenshots } from './utils/visual-test-utils';

test('theme toggle', async ({ page }) => {
  await compareScreenshots(
    page,
    'theme-toggle',
    async () => {/* before state */},
    async () => {/* after state */}
  );
});
```

## Utilities

### preparePageForVisualTest

Prepares the page for consistent screenshots:

```typescript
interface VisualTestOptions {
  maskSelectors?: string[];      // Elements to mask in screenshots
  removeSelectors?: string[];    // Elements to remove
  waitForSelectors?: string[];   // Elements to wait for
  waitForTimeout?: number;       // Additional wait time
  customStyles?: string;         // Custom CSS to inject
}
```

### testComponentStates

Tests different states of a component:

```typescript
await testComponentStates(page, selector, [
  { name: 'state-name', action: async (element) => {
    // Perform actions to achieve the state
  }}
]);
```

### testResponsiveLayouts

Tests component/page across different viewport sizes:
- Mobile (375x667)
- Tablet (768x1024)
- Desktop (1280x720)

### compareScreenshots

Compares before/after states:

```typescript
await compareScreenshots(
  page,
  'test-name',
  async () => {/* setup initial state */},
  async () => {/* perform change */}
);
```

## Best Practices

1. **Stable Selectors**
   - Use `data-testid` attributes for test selectors
   - Avoid using text content or classes that might change

2. **Handle Dynamic Content**
   - Mask or remove timestamps, random IDs, etc.
   - Mock API responses for consistent data

3. **Test Organization**
   - Group related tests in describe blocks
   - Use clear, descriptive test names

4. **Viewport Testing**
   - Test critical layouts across different devices
   - Include both light and dark mode tests

5. **Maintenance**
   - Regularly update baseline screenshots
   - Review visual differences carefully
   - Document intentional visual changes

## Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Increase wait times
   - Add additional waitForSelector calls
   - Mask dynamic elements

2. **Unexpected Differences**
   - Check for animations/transitions
   - Verify mock data consistency
   - Review viewport sizes

3. **Performance Issues**
   - Reduce screenshot size/quality
   - Run fewer viewport tests
   - Use worker isolation

### Debug Tips

1. Use `test:visual:ui` for interactive debugging
2. Check generated screenshots in `visual-test-results`
3. Review test logs for timing issues
4. Use `page.pause()` for step-by-step debugging

### When to Update Baselines

Update baseline screenshots when:
- Implementing intentional UI changes
- Changing theme or styling
- Updating component layouts
- Fixing visual bugs

Use `npm run test:visual:update` to update baselines. 