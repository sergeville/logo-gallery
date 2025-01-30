import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import dotenv from 'dotenv'
import { LOCALHOST_URL } from '@/config/constants'

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development'
dotenv.config({ path: path.join(__dirname, `.env.${env}`) })

const baseConfig = {
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
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
}

// Define projects based on whether Percy is enabled
const projects = [
  {
    name: 'chromium',
    use: { 
      ...devices['Desktop Chrome'],
      viewport: { width: 1280, height: 720 },
    },
  },
  {
    name: 'visual',
    testMatch: '**/*.visual.spec.ts',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1280, height: 720 },
    },
  },
]

// Add Percy project if token is present
if (process.env.PERCY_TOKEN) {
  projects.push({
    name: 'percy',
    testMatch: '**/*.visual.spec.ts',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1280, height: 720 },
    },
  })
}

export default defineConfig({
  ...baseConfig,
  projects,
}) 