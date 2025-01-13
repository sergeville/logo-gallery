export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function validateEnvironment(env: string): void {
  const validEnvironments = ['development', 'test', 'production'];
  if (!validEnvironments.includes(env)) {
    throw new ConfigurationError(
      `Invalid environment: ${env}. Must be one of: ${validEnvironments.join(', ')}`
    );
  }
}

export function validateDatabaseName(dbName: string, env: string): void {
  const expectedPrefix = 'LogoGallery';
  const expectedSuffix = 'DB';
  const envCapitalized = env.charAt(0).toUpperCase() + env.slice(1).toLowerCase();
  const expectedName = `${expectedPrefix}${envCapitalized}${expectedSuffix}`;

  if (dbName !== expectedName) {
    throw new ConfigurationError(
      `Invalid database name: ${dbName}. Expected format: ${expectedName}`
    );
  }
}

export function validateMongoDBUri(uri: string | undefined): string {
  if (!uri) {
    throw new ConfigurationError(
      'MONGODB_URI is required but not defined in environment configuration'
    );
  }

  const MONGODB_URI_REGEX = /^mongodb(\+srv)?:\/\/[^/]+\/([^/?]+)/;
  const match = uri.match(MONGODB_URI_REGEX);

  if (!match) {
    throw new ConfigurationError(
      'Invalid MONGODB_URI format. Expected format: mongodb://host[:port]/database or mongodb+srv://host/database'
    );
  }

  return uri;
}

export function validatePort(port: number | string | undefined): number {
  if (!port) {
    return 3000; // Default port
  }

  const portNumber = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
    throw new ConfigurationError(
      'Invalid port number. Port must be between 1 and 65535'
    );
  }

  return portNumber;
}

export function validateApiUrl(url: string | undefined): string {
  if (!url) {
    return 'http://localhost:3000'; // Default URL
  }

  try {
    new URL(url);
    return url;
  } catch (error) {
    throw new ConfigurationError(
      `Invalid API URL: ${url}. Must be a valid URL format`
    );
  }
} 