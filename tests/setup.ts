import { vi } from 'vitest';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.test' });

// Mock process.env
process.env.NODE_ENV = 'test';

// Mock console methods if needed
if (process.env.SUPPRESS_LOGS) {
  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
}

// Clean up function to run after all tests
export async function cleanup() {
  vi.clearAllMocks();
  vi.resetModules();
} 