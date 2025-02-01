import { config } from 'dotenv';
import path from 'path';

interface EnvConfig {
  required: string[];
  optional?: string[];
  format?: { [key: string]: (value: string) => boolean };
}

const envConfig: EnvConfig = {
  required: ['NODE_ENV', 'MONGODB_URI', 'NEXT_PUBLIC_API_URL'],
  optional: [
    'MONGODB_TEST_URI',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'S3_BUCKET_NAME',
  ],
  format: {
    NODE_ENV: value => ['development', 'test', 'production'].includes(value),
    MONGODB_URI: value => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
    NEXT_PUBLIC_API_URL: value => value.startsWith('http://') || value.startsWith('https://'),
  },
};

export function validateEnvironmentVars(envPath?: string): void {
  if (envPath) {
    const result = config({ path: path.resolve(process.cwd(), envPath) });
    if (result.error) {
      throw new Error(`Error loading environment file: ${result.error.message}`);
    }
  }

  const missingVars = envConfig.required.filter(key => !process.env[key]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  const formatErrors = Object.entries(envConfig.format || {})
    .filter(([key]) => process.env[key])
    .filter(([key, validator]) => !validator(process.env[key]!));

  if (formatErrors.length > 0) {
    throw new Error(
      `Invalid format for environment variables: ${formatErrors.map(([key]) => key).join(', ')}`
    );
  }
}

export function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || '';
}

export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}
