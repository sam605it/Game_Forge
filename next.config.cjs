const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      legacy: false,
      "@shared": path.resolve(__dirname, "app/shared"),
    };
    return config;
  },
};

module.exports = nextConfig;
