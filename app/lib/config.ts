export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB || 'logo-gallery',
  },
  auth: {
    secret: process.env.AUTH_SECRET || 'your-secret-key',
    tokenExpiry: process.env.TOKEN_EXPIRY || '1d',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  cache: {
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100', 10),
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
  },
  image: {
    maxSize: parseInt(process.env.MAX_IMAGE_SIZE || '5242880', 10), // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxDimensions: {
      width: parseInt(process.env.MAX_IMAGE_WIDTH || '2048', 10),
      height: parseInt(process.env.MAX_IMAGE_HEIGHT || '2048', 10),
    },
    optimizationDefaults: {
      quality: parseInt(process.env.IMAGE_QUALITY || '80', 10),
      format: process.env.IMAGE_FORMAT || 'webp',
    },
  },
  performance: {
    maxMemoryMB: parseInt(process.env.MAX_MEMORY_MB || '1024', 10),
    maxResponseTime: parseInt(process.env.MAX_RESPONSE_TIME || '5000', 10),
  },
  validation: {
    maxNameLength: parseInt(process.env.MAX_NAME_LENGTH || '100', 10),
    maxDescriptionLength: parseInt(process.env.MAX_DESCRIPTION_LENGTH || '1000', 10),
    maxTagsCount: parseInt(process.env.MAX_TAGS_COUNT || '10', 10),
  },
} as const;

export type Config = typeof config;

// Validation functions
export function validateConfig(config: Config): void {
  // MongoDB validation
  if (!config.mongodb.uri) {
    throw new Error('MongoDB URI is required');
  }
  if (!config.mongodb.dbName) {
    throw new Error('MongoDB database name is required');
  }

  // Auth validation
  if (!config.auth.secret) {
    throw new Error('Auth secret is required');
  }

  // Cache validation
  if (config.cache.maxSize <= 0) {
    throw new Error('Cache max size must be positive');
  }
  if (config.cache.ttl <= 0) {
    throw new Error('Cache TTL must be positive');
  }

  // Image validation
  if (config.image.maxSize <= 0) {
    throw new Error('Max image size must be positive');
  }
  if (config.image.maxDimensions.width <= 0 || config.image.maxDimensions.height <= 0) {
    throw new Error('Image dimensions must be positive');
  }
  if (config.image.optimizationDefaults.quality < 0 || config.image.optimizationDefaults.quality > 100) {
    throw new Error('Image quality must be between 0 and 100');
  }

  // Performance validation
  if (config.performance.maxMemoryMB <= 0) {
    throw new Error('Max memory must be positive');
  }
  if (config.performance.maxResponseTime <= 0) {
    throw new Error('Max response time must be positive');
  }

  // Validation rules
  if (config.validation.maxNameLength <= 0) {
    throw new Error('Max name length must be positive');
  }
  if (config.validation.maxDescriptionLength <= 0) {
    throw new Error('Max description length must be positive');
  }
  if (config.validation.maxTagsCount <= 0) {
    throw new Error('Max tags count must be positive');
  }
}

// Validate config on import
validateConfig(config); 