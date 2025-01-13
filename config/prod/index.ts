import { config } from 'dotenv';
import path from 'path';
import { databaseConfig } from './database';
import { storageConfig } from './storage';
import { securityConfig } from './security';

// Load production environment variables
config({ path: path.join(process.cwd(), '.env.production') });

export const productionConfig = {
  mongodb: databaseConfig,
  storage: storageConfig,
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    timeout: 60000 // 60 seconds
  },
  logging: {
    level: 'info',
    saveToFile: true,
    logDir: path.join(process.cwd(), 'logs')
  },
  security: securityConfig
}; 