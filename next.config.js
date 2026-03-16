/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Reduce memory usage
  experimental: {
    workerThreads: false,
    cpus: 1,
    // Enable the instrumentation hook (instrumentation.ts) for OpenTelemetry.
    instrumentationHook: true,
  },
  // Disable source maps in production to save memory
  productionBrowserSourceMaps: false,
  images: {
    domains: [
      'images.unsplash.com',
      'i.ibb.co',
      'scontent.fotp8-1.fna.fbcdn.net',
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;