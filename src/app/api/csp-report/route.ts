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

export async function POST(request: Request) {
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
