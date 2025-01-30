import { config } from 'dotenv';
import path from 'path';
import {
  validateEnvironmentVariables,
  type EnvironmentVariables,
  validateMongoDBUri,
  validatePort,
  validateApiUrl,
  validateDatabaseName,
  ConfigurationError
} from '@/lib/validation';

interface Config {
  env: string;
  mongodb: {
    uri: string;
    dbName: string;
  };
  server: {
    port: number;
    apiUrl: string;
  };
}

export function getConfig(): Config {
  const env = process.env.NODE_ENV || 'development';
  validateEnvironmentVariables(env);

  // Load environment variables from the appropriate file
  const envFile = path.join(process.cwd(), `.env.${env}`);
  const result = config({ path: envFile });

  if (result.error) {
    throw new ConfigurationError(
      `Failed to load environment file ${envFile}: ${result.error.message}`
    );
  }

  // Extract and validate MongoDB configuration
  const mongoUri = validateMongoDBUri(process.env.MONGODB_URI);
  const expectedDbName = `LogoGallery${env.charAt(0).toUpperCase() + env.slice(1)}DB`;
  const dbName = expectedDbName;
  validateDatabaseName(dbName, env);

  // Extract and validate server configuration
  const port = validatePort(process.env.PORT);
  const apiUrl = validateApiUrl(process.env.NEXT_PUBLIC_API_URL);

  return {
    env,
    mongodb: {
      uri: mongoUri,
      dbName,
    },
    server: {
      port,
      apiUrl,
    },
  };
}

// Export a singleton instance for use across the application
export const appConfig = getConfig(); 