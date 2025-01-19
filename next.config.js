/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placehold.co'],
    unoptimized: true
  },
  output: 'standalone',
  webpack: (config, { dev, isServer }) => {
    // Ensure CSS processing is enabled
    if (!isServer && dev) {
      config.devtool = 'cheap-module-source-map'
    }
    return config
  }
}

module.exports = nextConfig 