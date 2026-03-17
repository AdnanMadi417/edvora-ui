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
  // Keep OTel packages as external so the standalone build includes them.
  // Without this, dynamic `await import()` calls in instrumentation.ts are not
  // traced by @vercel/nft and the packages are missing from the container.
  serverExternalPackages: [
    '@opentelemetry/api',
    '@opentelemetry/api-logs',
    '@opentelemetry/exporter-logs-otlp-http',
    '@opentelemetry/exporter-metrics-otlp-http',
    '@opentelemetry/exporter-trace-otlp-http',
    '@opentelemetry/instrumentation-http',
    '@opentelemetry/instrumentation-undici',
    '@opentelemetry/resources',
    '@opentelemetry/sdk-logs',
    '@opentelemetry/sdk-metrics',
    '@opentelemetry/sdk-node',
    '@opentelemetry/semantic-conventions',
  ],
  // Reduce memory usage
  experimental: {
    workerThreads: false,
    cpus: 1,
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