import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import dotenv from 'dotenv'
import { LOCALHOST_URL } from '@/config/constants'

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development'
dotenv.config({ path: path.join(__dirname, `.env.${env}`) })

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || LOCALHOST_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'visual',
      testMatch: /.*\.visual\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: LOCALHOST_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: env,
      MONGODB_URI: process.env.MONGODB_URI || `mongodb://localhost:27017/LogoGallery${env.charAt(0).toUpperCase() + env.slice(1)}DB`,
    },
  },
  globalSetup: require.resolve('./e2e/global-setup'),
  globalTeardown: require.resolve('./e2e/global-teardown'),
  typescript: {
    config: path.join(__dirname, 'tsconfig.e2e.json'),
  },
})

if (process.env.PERCY_TOKEN) {
  export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['html', { open: 'never' }]],
    use: {
      baseURL: process.env.NEXT_PUBLIC_API_URL || LOCALHOST_URL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      actionTimeout: 15000,
      navigationTimeout: 15000,
    },
    projects: [
      {
        name: 'percy',
        testMatch: /.*\.visual\.ts/,
        use: {
          ...devices['Desktop Chrome'],
          viewport: null,
        },
      },
    ],
    webServer: {
      command: 'npm run dev',
}) 