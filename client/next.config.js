/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  images: {
    domains: ['localhost', 'picsum.photos', 'res.cloudinary.com'],
    unoptimized: true, 
  },
  trailingSlash: true,
  // Enable static export for better Vercel compatibility
  // Remove this if your app requires server-side functions
  // output: 'export',
  // Fix for potential hydration issues
  experimental: {
    optimizeCss: true,
    esmExternals: 'loose',
  },
  // Handle any redirects or rewrites
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
