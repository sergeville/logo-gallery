import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  // Clean up auth state
  try {
    const authFile = path.join(process.cwd(), 'e2e/.auth/user.json');
    if (fs.existsSync(authFile)) {
      fs.unlinkSync(authFile);
    }
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
}

export default globalTeardown; 