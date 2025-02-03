# Test Dependencies and Configuration

## Required Dependencies

1. **Core Testing Frameworks**
```json
{
  "vitest": "^3.0.4",
  "@playwright/test": "^1.50.0"
}
```

2. **React Testing Utilities**
```json
{
  "@testing-library/react": "^16.2.0",
  "@testing-library/jest-dom": "^6.6.3"
}
```

3. **Type Definitions**
```json
{
  "@types/testing-library__jest-dom": "^5.14.9",
  "@types/testing-library__react": "^10.0.1"
}
```

4. **Development Tools**
```json
{
  "ts-node": "^10.9.2",
  "@babel/core": "^7.26.7",
  "dotenv": "^16.4.7"
}
```

## Configuration Files

### 1. Vitest Configuration
File: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['./tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 2. Test Setup
File: `tests/setup.ts`
```typescript
import { vi } from 'vitest';
import { config } from 'dotenv';

config({ path: '.env.test' });
process.env.NODE_ENV = 'test';

if (process.env.SUPPRESS_LOGS) {
  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
}
```

### 3. Environment Variables
File: `.env.test`
```env
NODE_ENV=test
SUPPRESS_LOGS=true
```

## Installation Steps

1. Install all dependencies:
```bash
npm install
```

2. Create test environment file:
```bash
cp .env.example .env.test
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Verification Steps

1. Run unit tests:
```bash
npm run test
```

2. Run E2E tests:
```bash
npm run test:e2e
```

3. Check test coverage:
```bash
npm run test:coverage
```

## Common Issues

1. **Missing Dependencies**
   - Solution: `npm install`

2. **Playwright Browser Issues**
   - Solution: `npx playwright install --with-deps`

3. **Environment Variables**
   - Solution: Verify `.env.test` exists and is configured

4. **TypeScript Errors**
   - Solution: Check `tsconfig.json` includes test files 