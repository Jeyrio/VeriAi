import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Web3Auth and blockchain dependencies require special webpack configuration
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Fix for Web3Auth and Solana dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        url: require.resolve('url/'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
        assert: require.resolve('assert/'),
        process: require.resolve('process/browser'),
      };
    }

    // Handle external modules
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        '@react-native-async-storage/async-storage': '@react-native-async-storage/async-storage',
        'pino-pretty': 'pino-pretty',
      });
    }

    // Ignore specific modules that cause issues
    const webpack = require('webpack');
    config.plugins = [
      ...config.plugins,
      new webpack.IgnorePlugin({
        resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
      }),
    ];

    return config;
  },

  // Transpile Web3Auth packages
  transpilePackages: [
    '@web3auth/modal',
    '@web3auth/no-modal',
    '@web3auth/ethereum-provider',
    '@web3auth/solana-provider',
    '@solana/web3.js',
    '@solana/pay'
  ],
};

export default nextConfig;
