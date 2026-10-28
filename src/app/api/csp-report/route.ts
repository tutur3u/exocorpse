import { isIP } from "node:net";
import { BodyTooLargeError, readBoundedBody } from "@/lib/bounded-body";

const directives = new Set([
  "default-src",
  "base-uri",
  "object-src",
  "frame-ancestors",
  "form-action",
  "script-src",
  "script-src-elem",
  "script-src-attr",
  "style-src",
  "style-src-elem",
  "style-src-attr",
  "img-src",
  "media-src",
  "font-src",
  "connect-src",
  "frame-src",
  "worker-src",
]);

const windowMs = 60_000;
const perIpLimit = 10;
const globalLimit = 120;
function createBucket() {
  return {
    windowStartedAt: 0,
    accepted: 0,
    ipCounts: new Map<string, number>(),
  };
}

const buckets = { report: createBucket(), enforce: createBucket() };

function parseClientIp(value: string | null) {
  if (!value || value.length > 64 || value.includes("%")) return "";
  const ip = value.trim();
  return isIP(ip) ? ip : "";
}

function admitReport(request: Request, policy: keyof typeof buckets) {
  const bucket = buckets[policy];
  const now = Date.now();
  if (
    now - bucket.windowStartedAt >= windowMs ||
    now < bucket.windowStartedAt
  ) {
    bucket.windowStartedAt = now;
    bucket.accepted = 0;
    bucket.ipCounts.clear();
  }
  if (bucket.accepted >= globalLimit) return false;
  const ip =
    parseClientIp(request.headers.get("x-vercel-forwarded-for")) ||
    parseClientIp(request.headers.get("x-real-ip")) ||
    "unknown";
  const count = bucket.ipCounts.get(ip) || 0;
  if (count >= perIpLimit) return false;
  bucket.ipCounts.set(ip, count + 1);
  bucket.accepted++;
  return true;
}

export async function POST(request: Request) {
  const policy =
    new URL(request.url).searchParams.get("policy") === "enforce"
      ? "enforce"
      : "report";
  if (!admitReport(request, policy)) {
    return new Response(null, {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }
  try {
    const body: unknown = JSON.parse(
      new TextDecoder().decode(await readBoundedBody(request, 16 * 1024)),
    );
    if (typeof body !== "object" || body === null || !("csp-report" in body)) {
      return new Response(null, { status: 400 });
    }
    const report = body["csp-report"];
    if (
      typeof report !== "object" ||
      report === null ||
      !("effective-directive" in report) ||
      typeof report["effective-directive"] !== "string"
    ) {
      return new Response(null, { status: 400 });
    }
    const directive = report["effective-directive"];
    if (!directives.has(directive)) return new Response(null, { status: 400 });
    // URLs, referrers and script samples can contain private data.
    console.warn("[csp-report]", { directive, policy });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(null, {
      status: error instanceof BodyTooLargeError ? 413 : 400,
    });
  }
}
