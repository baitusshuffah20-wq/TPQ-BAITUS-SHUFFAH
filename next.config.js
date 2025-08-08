/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  compiler: {
    // Disable SWC minification to avoid potential issues
    removeConsole: false,
  },
  images: {
    domains: ['localhost', 'example.com'],
    unoptimized: true, // For static export if needed
  },
  experimental: {
    // Enable experimental features if needed
  },
  // Disable source maps in production for smaller bundle size
  productionBrowserSourceMaps: false,
  // Configure redirects if needed
  async redirects() {
    return [
      // Add redirects here if needed
    ];
  },
  // Configure rewrites if needed
  async rewrites() {
    return [
      // Add rewrites here if needed
    ];
  },
  // Configure headers for static files
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
