import type { NextConfig } from "next";
import { enforcingContentSecurityPolicy } from "./src/lib/enforcing-csp";

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

const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src 'self' https://open.spotify.com",
  "worker-src 'self' blob:",
  "report-uri /api/csp-report",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: enforcingContentSecurityPolicy() },
  {
    key: "Content-Security-Policy-Report-Only",
    value: contentSecurityPolicyReportOnly,
  },
];

const nextConfig: NextConfig = {
  transpilePackages: [
    "@tuturuuu/editor",
    "@tuturuuu/icons",
    "@tuturuuu/ui",
    "@tuturuuu/utils",
  ],
  // Request nonces cannot be embedded in a shared prerendered HTML shell.
  cacheComponents: false,
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
    // Keep the existing data/component cache scopes without prerendering HTML.
    useCache: true,
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
        source: "/:path*",
        headers: securityHeaders,
      },
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
