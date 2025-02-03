import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Ensure the app is running and accessible
  try {
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');
    console.log('✓ Application is running and accessible');
  } catch (error) {
    console.error('✗ Failed to access application:', error.message);
    console.error('Please ensure the application is running at:', baseURL);
    process.exit(1);
  }

  // Clean up any test data from previous runs
  try {
    const response = await page.request.post(`${baseURL}/api/test/cleanup`);
    if (response.ok()) {
      console.log('✓ Test data cleanup completed');
    } else {
      console.warn('⚠ Test data cleanup failed:', await response.text());
    }
  } catch (error) {
    console.warn('⚠ Test data cleanup failed:', error.message);
  }

  await browser.close();
}

export default globalSetup; 