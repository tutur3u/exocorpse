import type { NextConfig } from "next";

const browserAssetCache =
  "public, max-age=86400, stale-while-revalidate=604800";
const vercelAssetCache = "public, max-age=31536000, immutable";

const cachedAssetHeaders = [
  { key: "Cache-Control", value: browserAssetCache },
  { key: "Vercel-CDN-Cache-Control", value: vercelAssetCache },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      { protocol: "https", hostname: "help.vgen.co" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    turbopackFileSystemCacheForBuild: true,
  },
  async headers() {
    return [
      ...[
        "/LykoTwins.webp",
        "/background-image.webp",
        "/desktop-logo.webp",
        "/exocorpse.webp",
        "/artfight-profile/:path*",
        "/audio/:path*",
        "/boot/:path*",
        "/cofi/:path*",
        "/cursor/:path*",
        "/icons/:path*",
        "/media/:path*",
        "/workers/:path*",
      ].map((source) => ({
        source,
        headers: cachedAssetHeaders,
      })),
    ];
  },
};

export default nextConfig;
