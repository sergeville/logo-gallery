/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['localhost', 'example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['sharp', 'bcrypt', 'bcryptjs'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle Node.js built-in modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        events: false,
      };
    }

    // Add rule for handling Node.js native modules
    config.module.rules.push({
      test: /node_modules\/(sharp|bcrypt|bcryptjs)\/.*\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          cacheDirectory: true,
        },
      },
    });

    // Handle sharp WebAssembly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@img/sharp-wasm32': false,
      '@img/sharp-libvips-dev': false,
    };

    return config;
  },
}

module.exports = nextConfig