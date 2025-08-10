/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  experimental: {
    ppr: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Use modern remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.strapre.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.strapre.com', // Wildcard for any strapre subdomain
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp'],
    quality: 60, // Lower quality to reduce optimization load
    // Limit the sizes to commonly used ones
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
}

export default nextConfig
