/** @type {import('next').NextConfig} */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // Temporarily disabled to debug duplicate API calls
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  devIndicators: {
    position: "bottom-right",
  },
  images: {
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
    if (config.module?.rules) {
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name][ext]',
        },
      });
    }

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
