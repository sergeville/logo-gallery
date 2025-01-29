import { config } from 'dotenv';
import path from 'path';
import { databaseConfig } from '@/config/prod/database';
import { storageConfig } from '@/config/prod/storage';
import { securityConfig } from '@/config/prod/security';

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