import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    domains: ['picsum.photos', 'ipfs.io', 'gateway.pinata.cloud'],
  },
};

export default nextConfig;
