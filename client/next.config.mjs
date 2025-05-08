/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['bcrypt']
  }
};

export default nextConfig;
