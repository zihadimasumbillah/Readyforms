/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Modern remotePatterns replaces the deprecated `domains` config
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.it' },
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
  // IMPORTANT: Both must be false (or omitted) in production.
  // TypeScript and ESLint errors must never be silently ignored in a production build.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    const cspHeader = `
      default-src 'self' https: data: blob:;
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: https://vercel.live https://*.vercel.live https://accounts.google.com https://apis.google.com;
      script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https: http: https://vercel.live https://*.vercel.live https://accounts.google.com https://apis.google.com;
      style-src 'self' 'unsafe-inline' https: http: https://fonts.googleapis.com;
      img-src 'self' data: blob: https: http:;
      font-src 'self' data: https: http: https://fonts.gstatic.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self' https://accounts.google.com;
      frame-src 'self' https: http: https://vercel.live https://*.vercel.live https://accounts.google.com;
      connect-src 'self' https: http: wss: ws: http://localhost:3001 http://localhost:8000 https://readyforms-api.vercel.app https://vercel.live https://*.vercel.live https://accounts.google.com;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const backendHost = backendUrl.replace(/\/api\/?$/, '');
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/:path*`,
        },
        {
          source: '/health',
          destination: `${backendHost}/health`,
        },
      ],
    };
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
