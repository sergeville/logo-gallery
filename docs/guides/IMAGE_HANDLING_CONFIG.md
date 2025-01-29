# Image Handling Configuration Guide

## Table of Contents
1. [Basic Configuration](#basic-configuration)
2. [Environment-Specific Setup](#environment-specific-setup)
3. [Custom Optimization Presets](#custom-optimization-presets)
4. [CDN Integration](#cdn-integration)
5. [Caching Strategies](#caching-strategies)

## Basic Configuration

### Environment Variables
```env
# Image Optimization
NEXT_PUBLIC_IMAGE_OPTIMIZATION_QUALITY=75
NEXT_PUBLIC_MAX_IMAGE_SIZE=10485760  # 10MB
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/svg+xml

# Upload Configuration
NEXT_PUBLIC_UPLOAD_DIR=public/uploads
NEXT_PUBLIC_UPLOAD_MAX_FILES=10
NEXT_PUBLIC_UPLOAD_CONCURRENT=3

# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
NEXT_PUBLIC_CDN_ENABLED=true

# Cache Configuration
NEXT_PUBLIC_CACHE_TTL=3600
NEXT_PUBLIC_CACHE_MAX_SIZE=100
```

### TypeScript Configuration
```typescript
// config/image.config.ts
export const imageConfig = {
  optimization: {
    quality: {
      jpeg: 80,
      webp: 75,
      png: 85,
    },
    resize: {
      thumbnail: { width: 200, height: 200 },
      preview: { width: 800, height: 800 },
      responsive: [
        { width: 640, height: 640 },
        { width: 1024, height: 1024 },
        { width: 1920, height: 1920 },
      ],
    },
    formats: ['jpeg', 'webp', 'png', 'avif'],
  },
  storage: {
    basePath: '/uploads',
    structure: '{userId}/{type}/{filename}',
    variants: {
      original: '',
      thumbnail: 'thumb',
      optimized: 'opt',
    },
  },
  cache: {
    ttl: 3600,
    maxSize: 100,
    cleanupInterval: 300,
  },
};
```

## Environment-Specific Setup

### Development Environment
```typescript
// config/environments/development.ts
export const developmentConfig = {
  optimization: {
    ...baseConfig.optimization,
    quality: {
      jpeg: 90,  // Higher quality for development
      webp: 85,
      png: 95,
    },
    skipOptimization: false,
  },
  storage: {
    ...baseConfig.storage,
    provider: 'local',
    basePath: '/uploads/dev',
  },
  cache: {
    ...baseConfig.cache,
    enabled: true,
    driver: 'memory',
  },
};
```

### Production Environment
```typescript
// config/environments/production.ts
export const productionConfig = {
  optimization: {
    ...baseConfig.optimization,
    quality: {
      jpeg: 75,  // Balance between quality and size
      webp: 70,
      png: 80,
    },
    skipOptimization: false,
  },
  storage: {
    ...baseConfig.storage,
    provider: 'cdn',
    basePath: '/uploads/prod',
    cdn: {
      baseUrl: process.env.CDN_URL,
      region: process.env.CDN_REGION,
      bucket: process.env.CDN_BUCKET,
    },
  },
  cache: {
    ...baseConfig.cache,
    enabled: true,
    driver: 'redis',
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    },
  },
};
```

### Testing Environment
```typescript
// config/environments/test.ts
export const testConfig = {
  optimization: {
    ...baseConfig.optimization,
    skipOptimization: true,  // Skip optimization in tests
    mockResponses: true,
  },
  storage: {
    ...baseConfig.storage,
    provider: 'memory',
    basePath: '/uploads/test',
  },
  cache: {
    ...baseConfig.cache,
    enabled: false,
  },
};
```

## Custom Optimization Presets

### Preset Configuration
```typescript
// config/optimization-presets.ts
export const optimizationPresets = {
  thumbnail: {
    quality: 60,
    width: 200,
    height: 200,
    fit: 'cover',
    format: 'webp',
  },
  preview: {
    quality: 75,
    width: 800,
    height: 800,
    fit: 'contain',
    format: 'webp',
  },
  highQuality: {
    quality: 90,
    format: 'png',
    preserveMetadata: true,
  },
  social: {
    quality: 80,
    width: 1200,
    height: 630,
    fit: 'cover',
    format: 'jpeg',
  },
  avatar: {
    quality: 70,
    width: 400,
    height: 400,
    fit: 'cover',
    format: 'webp',
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  },
};

// Usage
const optimizedImage = await imageOptimizationService.optimizeBuffer(buffer, {
  preset: 'thumbnail',
  overrides: {
    quality: 65,  // Override specific preset options
  },
});
```

## CDN Integration

### CDN Provider Configuration
```typescript
// config/cdn.config.ts
export const cdnConfig = {
  providers: {
    cloudflare: {
      enabled: true,
      baseUrl: process.env.CLOUDFLARE_CDN_URL,
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
      options: {
        development: {
          purgeCache: true,
          analytics: false,
        },
        production: {
          purgeCache: true,
          analytics: true,
          cacheRules: [
            {
              pattern: '*.jpg',
              ttl: 86400,  // 24 hours
            },
            {
              pattern: '*.webp',
              ttl: 604800,  // 1 week
            },
          ],
        },
      },
    },
    cloudinary: {
      enabled: false,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      options: {
        secure: true,
        cdn_subdomain: true,
        transformation: {
          quality: 'auto',
          fetchFormat: 'auto',
        },
      },
    },
  },
  defaultProvider: 'cloudflare',
};
```

### CDN URL Generation
```typescript
// utils/cdn-url.ts
export function generateCdnUrl(path: string, options: CdnOptions = {}): string {
  const { provider = cdnConfig.defaultProvider, transformation = {} } = options;
  const providerConfig = cdnConfig.providers[provider];

  if (!providerConfig?.enabled) {
    return path;  // Return original path if CDN is not configured
  }

  switch (provider) {
    case 'cloudflare':
      return generateCloudflareUrl(path, transformation);
    case 'cloudinary':
      return generateCloudinaryUrl(path, transformation);
    default:
      return path;
  }
}
```

## Caching Strategies

### Cache Configuration
```typescript
// config/cache.config.ts
export const cacheConfig = {
  drivers: {
    memory: {
      enabled: true,
      maxSize: 100,  // Maximum number of items
      ttl: 3600,     // Time to live in seconds
    },
    redis: {
      enabled: true,
      connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
      },
      options: {
        ttl: 3600,
        maxSize: 1000,
        prefix: 'img:',
      },
    },
    filesystem: {
      enabled: true,
      directory: './cache',
      maxSize: '1GB',
      ttl: 86400,  // 24 hours
    },
  },
  strategies: {
    optimized: {
      driver: 'redis',
      ttl: 604800,  // 1 week
      prefix: 'opt:',
    },
    thumbnails: {
      driver: 'filesystem',
      ttl: 86400,   // 24 hours
      prefix: 'thumb:',
    },
    temporary: {
      driver: 'memory',
      ttl: 3600,    // 1 hour
      prefix: 'temp:',
    },
  },
};

// Cache service configuration
export const cacheServiceConfig = {
  defaultStrategy: 'optimized',
  enabled: true,
  logLevel: 'error',
  events: {
    onCacheMiss: async (key: string) => {
      console.log(`Cache miss for key: ${key}`);
    },
    onCacheHit: async (key: string) => {
      console.log(`Cache hit for key: ${key}`);
    },
    onCacheError: async (error: Error) => {
      console.error('Cache error:', error);
    },
  },
}; 