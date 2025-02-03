/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  reactStrictMode: true,
  // Optimize webpack configuration
  webpack(config, { dev, isServer }) {
    // SVG optimization configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    if (dev && !isServer) {
      // Optimize development caching
      config.cache = {
        type: 'filesystem',
        // Increase cache version when dependencies change
        version: require('./package-lock.json').lockfileVersion.toString(),
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: '.next/cache/webpack',
        name: dev ? 'development' : 'production',
        compression: 'gzip',
      };

      // Add cache busting for development
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }

    return config;
  },
  // Add experimental features for better performance
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    turbotrace: true, // Enable better dependency tracing
  },
}

module.exports = nextConfig