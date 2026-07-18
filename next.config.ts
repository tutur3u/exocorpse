import type { NextConfig } from "next";

const browserAssetCache =
  "public, max-age=86400, stale-while-revalidate=604800";
const vercelAssetCache = "public, max-age=31536000, immutable";

const cachedAssetHeaders = [
  { key: "Cache-Control", value: browserAssetCache },
  { key: "Vercel-CDN-Cache-Control", value: vercelAssetCache },
];
const privateNoStoreHeaders = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "CDN-Cache-Control", value: "private, no-store" },
  { key: "Vercel-CDN-Cache-Control", value: "private, no-store" },
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
        hostname: "tuturuuu.com",
        port: "",
        pathname: "/api/v1/workspaces/*/external-projects/assets/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      { protocol: "https", hostname: "help.vgen.co" },
    ],
  },
  experimental: {
    instantInsights: {
      validationLevel: "warning",
    },
    serverActions: {
      bodySizeLimit: "50mb",
    },
    turbopackFileSystemCacheForBuild: true,
  },
  async headers() {
    return [
      {
        source: "/admin",
        headers: privateNoStoreHeaders,
      },
      {
        source: "/admin/:path*",
        headers: privateNoStoreHeaders,
      },
      ...[
        "/LykoTwins.webp",
        "/background-image.webp",
        "/desktop-logo.webp",
        "/exocorpse.webp",
        "/artfight-profile/:path*",
        "/audio/:path*",
        "/boot/:path*",
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
