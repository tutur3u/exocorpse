export function enforcingContentSecurityPolicy(nonce?: string) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    [
      "script-src 'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      ...(process.env.NODE_ENV === "development"
        ? ["https://va.vercel-scripts.com"]
        : []),
    ].join(" "),
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' data: blob: https:",
    "frame-src 'self' https://open.spotify.com https://nzamlzqfdwaaxdefwraj.supabase.co",
    "worker-src 'self'",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report?policy=enforce",
  ].join("; ");
}
