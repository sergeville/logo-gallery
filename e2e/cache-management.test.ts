import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

test.describe('Cache Management', () => {
  const cacheDirectories = [
    '.next/cache',
    'node_modules/.cache'
  ];

  test.beforeEach(async ({ page }) => {
    // Create some cache directories and files
    cacheDirectories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      fs.mkdirSync(fullPath, { recursive: true });
      fs.writeFileSync(path.join(fullPath, 'test-cache-file'), 'test data');
    });
  });

  test('should clean cache directories when running clean-cache script', async () => {
    // Run the clean-cache script
    execSync('npm run clean-cache', { stdio: 'inherit' });

    // Verify cache directories are cleaned
    cacheDirectories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      const testFile = path.join(fullPath, 'test-cache-file');
      
      // Directory should still exist but be empty
      expect(fs.existsSync(fullPath)).toBeTruthy();
      expect(fs.existsSync(testFile)).toBeFalsy();
    });
  });

  test('should rebuild cache after cleaning', async ({ page }) => {
    // Clean cache first
    execSync('npm run clean-cache', { stdio: 'inherit' });

    // Start dev server and wait for compilation
    const devServer = execSync('npm run dev', { 
      stdio: 'pipe',
      encoding: 'utf-8'
    });

    // Wait for webpack to create new cache
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify new cache is created
    cacheDirectories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      expect(fs.existsSync(fullPath)).toBeTruthy();
      expect(fs.readdirSync(fullPath).length).toBeGreaterThan(0);
    });

    // Verify dev server is running
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/Logo Gallery/);
  });

  test('should handle concurrent cache operations', async ({ page, browser }) => {
    // Start multiple clean operations concurrently
    await Promise.all([
      execSync('npm run clean-cache', { stdio: 'inherit' }),
      execSync('npm run clean-cache', { stdio: 'inherit' }),
      execSync('npm run clean-cache', { stdio: 'inherit' })
    ]);

    // Verify cache directories are in a consistent state
    cacheDirectories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      expect(fs.existsSync(fullPath)).toBeTruthy();
      expect(() => fs.readdirSync(fullPath)).not.toThrow();
    });
  });

  test('should preserve non-cache files', async () => {
    // Create a non-cache file
    const testFile = path.join(process.cwd(), 'test-file.txt');
    fs.writeFileSync(testFile, 'important data');

    // Run cache cleaning
    execSync('npm run clean-cache', { stdio: 'inherit' });

    // Verify non-cache file is preserved
    expect(fs.existsSync(testFile)).toBeTruthy();
    expect(fs.readFileSync(testFile, 'utf-8')).toBe('important data');

    // Clean up
    fs.unlinkSync(testFile);
  });
}); 