import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'mksolution.dothome.co.kr',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
