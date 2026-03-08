/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  // Only apply basePath and assetPrefix in production (GitHub Pages)
  basePath: isProd ? '/buildathon1' : '',
  assetPrefix: isProd ? '/buildathon1' : '',
};

module.exports = nextConfig;
