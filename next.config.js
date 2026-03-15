const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
// Only apply the prefix if we're deploying to GitHub Actions
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  // Remove output: 'export' to support dynamic rendering/database on Vercel
  basePath: isGithubActions ? '/buildathon1' : '',
  assetPrefix: isGithubActions ? '/buildathon1' : '',

  async redirects() {
    return [
      {
        source: '/gallery',
        destination: '/events',
        permanent: true,
      },
      {
        source: '/gallery/:eventId',
        destination: '/events/:eventId',
        permanent: true,
      },
      {
        source: '/leaderboard',
        destination: '/events',
        permanent: true,
      }
    ];
  },

  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          }
        ]
      }
    ];
  }
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload source maps to Sentry
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically annotate React components to show in breadcrumbs
  reactComponentAnnotation: {
    enabled: true,
  },
};

// Export with Sentry config
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
