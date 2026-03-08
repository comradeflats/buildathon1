/** @type {import('next').NextConfig} */
// Only apply the prefix if we're deploying to GitHub Actions
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  // Remove output: 'export' to support dynamic rendering/database on Vercel
  basePath: isGithubActions ? '/buildathon1' : '',
  assetPrefix: isGithubActions ? '/buildathon1' : '',
};

module.exports = nextConfig;
