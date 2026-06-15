/** @type {import('next').NextConfig} */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/company/posts/create-ai",
        destination: "/company/posts/create",
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
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

};

export default nextConfig;
