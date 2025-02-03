import { describe, it, expect, beforeEach } from 'vitest';
import nextConfig from '../../next.config.js';

describe('Webpack Configuration', () => {
  let mockConfig: any;
  let mockContext: any;

  beforeEach(() => {
    // Mock basic webpack config
    mockConfig = {
      module: {
        rules: []
      },
      optimization: {}
    };

    // Mock development context
    mockContext = {
      dev: true,
      isServer: false
    };
  });

  it('should add SVG rule to webpack config', () => {
    const result = nextConfig.webpack(mockConfig, mockContext);

    expect(result.module.rules).toContainEqual({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
  });

  it('should configure filesystem cache in development', () => {
    const result = nextConfig.webpack(mockConfig, mockContext);

    expect(result.cache).toEqual({
      type: 'filesystem',
      version: expect.any(String),
      buildDependencies: {
        config: [expect.stringContaining('next.config.js')]
      },
      cacheDirectory: '.next/cache/webpack',
      name: 'development',
      compression: 'gzip'
    });
  });

  it('should not configure filesystem cache for server builds', () => {
    mockContext.isServer = true;
    const result = nextConfig.webpack(mockConfig, mockContext);

    expect(result.cache).toBeUndefined();
  });

  it('should set deterministic module IDs in development', () => {
    const result = nextConfig.webpack(mockConfig, mockContext);

    expect(result.optimization.moduleIds).toBe('deterministic');
  });

  it('should preserve existing optimization options', () => {
    mockConfig.optimization = {
      minimize: true,
      splitChunks: {
        chunks: 'all'
      }
    };

    const result = nextConfig.webpack(mockConfig, mockContext);

    expect(result.optimization).toEqual({
      minimize: true,
      splitChunks: {
        chunks: 'all'
      },
      moduleIds: 'deterministic'
    });
  });

  it('should enable experimental features', () => {
    expect(nextConfig.experimental).toEqual({
      optimizeCss: true,
      turbotrace: true
    });
  });
}); 