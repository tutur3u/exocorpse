import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
    ],
  },
  cacheComponents: true,
  cacheLife: {
    page: {
      stale: 43200, // 12 hour
      revalidate: 86400, // 1 day
      expire: 259200, // 3 days
    },
  },
};

export default nextConfig;
