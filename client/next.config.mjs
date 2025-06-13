/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com', 'placehold.it', 'randomuser.me', 'images.unsplash.com'],
  },
  experimental: {
    optimizeCss: true,
    esmExternals: true,
  },
  // Ensure that fonts are properly handled during the build process
  webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      type: 'asset/resource',
    });
    
    // Handle missing @vercel/analytics module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@vercel/analytics/react': false,
    };
    
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*` 
          : 'https://readyforms-api.vercel.app/api/:path*',
      }
    ];
  },
};

export default nextConfig;
