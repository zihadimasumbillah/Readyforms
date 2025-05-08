/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  images: {
    domains: ['localhost', 'picsum.photos', 'res.cloudinary.com'],
    unoptimized: true, // Required for static export
  },
  // Add trailing slash to allow for proper path-based routing
  trailingSlash: true,
};

module.exports = nextConfig;
