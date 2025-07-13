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
    domains: ['ga.vplaza.com.ng'], 
    formats: ['image/webp'], 
  },
}

export default nextConfig
