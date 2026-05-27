import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['tesseract.js'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '29000' },
      { protocol: 'http', hostname: 'minio' },
    ],
  },
};

export default nextConfig;
