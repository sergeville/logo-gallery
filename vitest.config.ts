import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['app/lib/__tests__/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './app')
    }
  }
}); 