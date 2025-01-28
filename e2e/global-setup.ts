import { chromium, FullConfig } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set up authentication state
  await page.goto(`${LOCALHOST_URL}/auth/signin`);
  await page.waitForSelector('form', { state: 'visible' });
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]')
  ]);

  // Save authentication state
  await page.context().storageState({
    path: 'e2e/.auth/user.json'
  });

  await browser.close();
}

export default globalSetup; 