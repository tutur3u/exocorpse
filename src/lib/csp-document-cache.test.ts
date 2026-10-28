import { expect, test } from "bun:test";
import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import nextConfig from "../../next.config";

test.each([
  "/",
  "/artfight-profile",
  "/artfight-profile?x=1",
  "/verify-token",
  "/missing-csp-test-route",
])("%s never inherits public asset cache headers", async (path) => {
  const response = await unstable_getResponseFromNextConfig({
    url: `https://exocorpse.net${path}`,
    nextConfig,
  });
  expect(response.headers.get("Cache-Control") ?? "").not.toContain("public");
  expect(response.headers.get("Vercel-CDN-Cache-Control") ?? "").not.toContain(
    "public",
  );
});

test("ArtFight image assets keep their long-lived cache headers", async () => {
  const response = await unstable_getResponseFromNextConfig({
    url: "https://exocorpse.net/artfight-profile/characters-preview/lucille-yang.webp",
    nextConfig,
  });
  expect(response.headers.get("Cache-Control") ?? "").toContain(
    "max-age=86400",
  );
  expect(response.headers.get("Vercel-CDN-Cache-Control") ?? "").toContain(
    "max-age=31536000",
  );
});
