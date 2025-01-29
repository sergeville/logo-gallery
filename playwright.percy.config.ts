import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { LOCALHOST_URL } from '@/config/constants';

// Load environment variables
const env = process.env.NODE_ENV || 'test';
dotenv.config({ path: path.join(__dirname, `.env.${env}`) });

export default defineConfig({
  testDir: './e2e/visual-tests',
  testMatch: ['**/*.percy.spec.ts'],
  timeout: 120000,
  expect: {
    timeout: 60000,
  },
  use: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || LOCALHOST_URL,
    trace: 'retain-on-failure',
    screenshot: 'off', // Percy will handle screenshots
    actionTimeout: 30000,
    navigationTimeout: 30000,
    waitForSelector: {
      timeout: 30000,
      state: 'visible',
    },
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        colorScheme: 'light',
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'Tablet Safari',
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 768, height: 1024 },
      },
    },
  ],
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'percy-test-results' }],
  ],
  webServer: {
    command: 'npm run dev',
    url: LOCALHOST_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    env: {
      NODE_ENV: env,
      MONGODB_URI: process.env.MONGODB_URI || `mongodb://localhost:27017/LogoGalleryTestDB`,
    },
  },
  workers: 1,
  globalSetup: require.resolve('./e2e/global-setup'),
  globalTeardown: require.resolve('./e2e/global-teardown'),
  retries: process.env.CI ? 2 : 1,
}); 