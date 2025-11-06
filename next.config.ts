/** @type {import('next').NextConfig} */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // Temporarily disabled to debug duplicate API calls
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  transpilePackages: ['@hashgraph/hedera-wallet-connect'],
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
  webpack: (config) => {
<<<<<<< HEAD
=======
    // Handle @hashgraph/hedera-wallet-connect ESM issues
    config.resolve = config.resolve || {};
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
      ...(config.resolve.extensionAlias || {})
    };

    // Image asset handling
>>>>>>> transcription-v2
    if (config.module?.rules) {
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name][ext]',
        },
      });
    }

    // Fallback for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
  trailingSlash: true,

  async redirects() {
    return [
      {
        source: '/',
        destination: '/home/company',
        permanent: true, // use false if it's temporary
      },
    ];
  },
};

export default nextConfig;
