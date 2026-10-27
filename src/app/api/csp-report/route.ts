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
let windowStartedAt = 0;
let accepted = 0;
const ipCounts = new Map<string, number>();

function admitReport(request: Request) {
  const now = Date.now();
  if (now - windowStartedAt >= windowMs || now < windowStartedAt) {
    windowStartedAt = now;
    accepted = 0;
    ipCounts.clear();
  }
  if (accepted >= globalLimit) return false;
  const forwardedIp =
    request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim() || "";
  const ip = isIP(forwardedIp) ? forwardedIp : "unknown";
  const count = ipCounts.get(ip) || 0;
  if (count >= perIpLimit) return false;
  ipCounts.set(ip, count + 1);
  accepted++;
  return true;
}

export async function POST(request: Request) {
  if (!admitReport(request)) {
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
    console.warn("[csp-report]", { directive });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(null, {
      status: error instanceof BodyTooLargeError ? 413 : 400,
    });
  }
}
