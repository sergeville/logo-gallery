import { config } from 'dotenv';
import path from 'path';
import { databaseConfig } from './database';
import { storageConfig } from './storage';
import { testingConfig } from './testing';

// Load test environment variables
config({ path: path.join(process.cwd(), '.env.test') });

export const testConfig = {
  mongodb: databaseConfig,
  storage: storageConfig,
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 5000 // 5 seconds for faster tests
  },
  logging: {
    level: 'error',
    saveToFile: false
  },
  testing: testingConfig
}; 