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
    unoptimized: true, // Required for static export
    domains: ['api.strapre.com'], 
    formats: ['image/webp'], 
  },
}

export default nextConfig
