import { config } from 'dotenv';
import path from 'path';
import { databaseConfig } from './database';
import { storageConfig } from './storage';
import { apiConfig } from './api';

// Load development environment variables
config({ path: path.join(process.cwd(), '.env.development') });

export const developmentConfig = {
  mongodb: databaseConfig,
  storage: storageConfig,
  api: apiConfig,
  logging: {
    level: 'debug',
    saveToFile: false
  }
}; 