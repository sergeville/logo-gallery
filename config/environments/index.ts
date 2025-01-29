import { developmentConfig } from '@/config/environments/development';
import { testConfig } from '@/config/environments/test';
import { productionConfig } from '@/config/environments/production';

type Environment = 'development' | 'test' | 'production';

const configs = {
  development: developmentConfig,
  test: testConfig,
  production: productionConfig
};

export function getConfig() {
  const env = (process.env.NODE_ENV || 'development') as Environment;
  return configs[env];
}

export type Config = typeof developmentConfig;
export { developmentConfig, testConfig, productionConfig }; 