/** @type {import('next').NextConfig} */

import type { Configuration as WebpackConfig } from 'webpack';

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'app.talentai.bid',
        pathname: '/**',
      },
    ],
  },
  distDir: '.next',
  webpack: (config: WebpackConfig) => {
    if (config.module?.rules) {
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        type: 'asset/resource',
      });
    }
    return config;
  },
};

export default nextConfig;
