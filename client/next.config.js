/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure images are properly handled
  images: {
    domains: ['localhost', 'readyforms.vercel.app'],
  },
  // Add this for proper handling of API requests in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/:path*` : 'http://localhost:3001/api/:path*',
      },
    ];
  },
  // Enable app router experimental features
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
