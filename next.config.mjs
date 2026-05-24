/** @type {import('next').NextConfig} */ 
const nextConfig = {
  // output: 'export', // Enable static export
  trailingSlash: true, // Ensures proper routing for static sites
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
    unoptimized: true,
    domains: ['api.strapre.com', 'www.api.strapre.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.strapre.com',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'www.api.strapre.com',
        pathname: '/storage/**',
      },
    ],
    formats: ['image/webp'],
  },
}

export default nextConfig
