const DEFAULT_SITE_URL = "https://exocorpse.net";

function normalizeUrl(value: string) {
  if (!value) return DEFAULT_SITE_URL;
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export function getSiteUrl() {
  return normalizeUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL ||
      DEFAULT_SITE_URL,
  );
}

export function toAbsoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}
