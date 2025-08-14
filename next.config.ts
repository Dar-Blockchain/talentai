/** @type {import('next').NextConfig} */

import type { Configuration as WebpackConfig } from 'webpack';

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
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
  assetPrefix: '',
  distDir: '.next',
  webpack: (config: WebpackConfig) => {
    if (config.module?.rules) {
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name][ext]',
        },
      });
    }
    return config;
  },
  trailingSlash: true,
};

export default nextConfig;
