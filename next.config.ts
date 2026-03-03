import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, "socket.io"];
    }
    return config;
  },
  serverExternalPackages: ["pdfkit"],
  images: {
    qualities: [25, 50, 75, 100],
  },
};

export default nextConfig;
