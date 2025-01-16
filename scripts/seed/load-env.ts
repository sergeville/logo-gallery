import { config } from 'dotenv';
import { resolve } from 'path';

export function loadEnv() {
  // Load environment variables from .env.local
  config({
    path: resolve(process.cwd(), '.env.local')
  });
} 