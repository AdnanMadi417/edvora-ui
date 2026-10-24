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
  // Pages renamed after the partner → advisor rename. Old addresses are still
  // in emails prod has already sent (sign-up verify links, the admin "new
  // advisor" CTA) and in bookmarks, so send them to the new page — the query
  // string (e.g. ?email=) is carried over. Redirects run before middleware,
  // so the old private paths no longer bounce to sign-in.
  async redirects() {
    const moved = [
      ['/register/verify', '/apply-as-adviser/verify'],
      ['/auth/register', '/apply-as-adviser'],
      ['/auth/partner-reset-password', '/auth/reset-password'],
      ['/partner/commission', '/partner/commission-tracker'],
      ['/admin/partners', '/admin/advisors'],
      ['/admin/partners/:path*', '/admin/advisors/:path*'],
      ['/account-manager/partners', '/account-manager/advisors'],
      ['/account-manager/partners/:path*', '/account-manager/advisors/:path*'],
      ['/reviewer/partners', '/reviewer/advisors'],
      ['/reviewer/partners/:path*', '/reviewer/advisors/:path*'],
    ];
    return moved.map(([source, destination]) => ({ source, destination, permanent: false }));
  },
  async headers() {
    return [
      {
        // All page routes — tell CDN never to cache HTML/RSC responses.
        // Static assets under /_next/static are fingerprinted and safe to cache.
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Vary', value: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch' },
        ],
      },
    ];
  },
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