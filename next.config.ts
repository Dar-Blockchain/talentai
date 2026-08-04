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
    position: "bottom-left",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'app.talentai.bid',
        pathname: '/**',
      },
      {
        // Blog cover/content images are uploaded to the API and resolved via
        // resolveUploadUrl() against NEXT_PUBLIC_API_BASE_URL — localhost in dev.
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
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

    // @vladmandic/face-api's own bundled ESM file uses a dynamic `require()`
    // internally — harmless (it's inside the library, not our code), but
    // webpack can't statically analyze it and warns on every build.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/@vladmandic\/face-api/,
        message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      },
    ];

    return config;
  },
  trailingSlash: true,

};

export default nextConfig;
