/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      bufferutil: false,
      "utf-8-validate": false,
      "supports-color": false,
    };
    return config;
  },
};

module.exports = nextConfig;
