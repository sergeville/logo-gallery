import { PlaywrightTestConfig } from '@playwright/test';

const baseConfig: PlaywrightTestConfig = {
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
      },
    },
    {
      name: 'webkit',
      use: {
        browserName: 'webkit',
      },
    },
  ],
};

const percyConfig: PlaywrightTestConfig = {
  ...baseConfig,
  testMatch: /.*\.percy\.ts/,
  use: {
    ...baseConfig.use,
    screenshot: 'off',
    video: 'off',
  },
};

export { baseConfig, percyConfig }; 