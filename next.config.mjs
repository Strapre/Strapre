/** @type {import('next').NextConfig} */ 
const nextConfig = {
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
    domains: ['api.strapre.com'], 
    formats: ['image/webp'], 
  },
}

export default nextConfig
