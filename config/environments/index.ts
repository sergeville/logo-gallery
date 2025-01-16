import { developmentConfig } from './development';
import { testConfig } from './test';
import { productionConfig } from './production';

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