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

module.exports = nextConfig;
