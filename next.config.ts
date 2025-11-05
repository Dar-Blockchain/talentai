/** @type {import('next').NextConfig} */

import type { Configuration as WebpackConfig } from 'webpack';

const nextConfig = {
  reactStrictMode: false, // Temporarily disabled to debug duplicate API calls
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.cwd(),
    isrMemoryCacheSize: 0, // disable ISR memory cache to fix HMR issues
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
