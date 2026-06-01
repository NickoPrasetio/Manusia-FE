import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',        // ← wajib untuk Docker deployment
  serverExternalPackages: ['tesseract.js'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '29000' },
      { protocol: 'http', hostname: 'minio' },
      // Oracle Cloud — semua IP diizinkan untuk foto dari MinIO
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;
