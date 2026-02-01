/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },

  webpack(config) {
    // Ignore legacy or broken folders
    config.module.rules.push({
      test: /app\/game\/.*\.(js|ts|tsx)$/,
      use: "null-loader",
    });

    return config;
  },
};

module.exports = nextConfig;
