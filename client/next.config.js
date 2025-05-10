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
    unoptimized: process.env.NODE_ENV === 'development',
  },
  trailingSlash: true,
  // Enable static export for better Vercel compatibility
  // Remove this if your app requires server-side functions
  // output: 'export',
  // Fix for potential hydration issues
  experimental: {
    optimizeCss: process.env.NODE_ENV === 'production',
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
        destination: process.env.NEXT_PUBLIC_API_URL || 'https://readyforms-api.vercel.app/api/:path*',
      },
      {
        source: '/health',
        destination: 'https://readyforms-api.vercel.app/health',
      },
    ];
  },
};

module.exports = nextConfig;
