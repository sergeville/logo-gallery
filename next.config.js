/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placehold.co'],
    unoptimized: true,
  },
  output: 'standalone',
  webpack: (config, { dev, isServer }) => {
    // Ensure CSS processing is enabled
    if (!isServer && dev) {
      config.devtool = 'cheap-module-source-map'
    }
    return config
  },
  // Add assetPrefix to serve files from /public directory
  assetPrefix: '',
  // Configure static file serving
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/public/uploads/:path*'
      }
    ]
  }
}

module.exports = nextConfig 