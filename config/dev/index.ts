import { config } from 'dotenv';
import path from 'path';
import { databaseConfig } from '@/config/dev/database';
import { storageConfig } from '@/config/dev/storage';
import { apiConfig } from '@/config/dev/api';

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