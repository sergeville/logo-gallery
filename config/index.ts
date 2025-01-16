import { developmentConfig } from './dev';
import { testConfig } from './test';
import { productionConfig } from './prod';

type Environment = 'development' | 'test' | 'production';

const configs = {
  development: developmentConfig,
  test: testConfig,
  production: productionConfig
} as const;

export function getConfig() {
  const env = (process.env.NODE_ENV || 'development') as Environment;
  return configs[env];
}

// Export type based on the development config structure
export type Config = typeof developmentConfig;

// Export individual configs for direct access if needed
export { developmentConfig, testConfig, productionConfig }; 