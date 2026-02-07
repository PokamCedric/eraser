import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Output standalone for easy deployment
  output: 'standalone',

  // Turbopack configuration
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },

  // Webpack configuration (fallback if --webpack is used)
  webpack: (config) => {
    // Handle ES modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts'],
      '.jsx': ['.jsx', '.tsx'],
    };

    // Add TypeScript extensions to resolve
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', ...(config.resolve.extensions || [])];

    return config;
  },
};

export default nextConfig;
