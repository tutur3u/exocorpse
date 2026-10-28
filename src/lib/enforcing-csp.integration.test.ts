import { describe, expect, test } from "bun:test";

const origin = process.env.PREVIEW_URL ?? process.env.CSP_TEST_ORIGIN;

// PREVIEW_URL points the same release gate at an immutable Vercel deployment.
describe.skipIf(!origin)("production HTTP CSP", () => {
  async function get(path: string) {
    return fetch(new URL(path, origin), {
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
  }

  function checkHeaders(response: Response) {
    const policy = response.headers.get("Content-Security-Policy") ?? "";
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("frame-ancestors 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).toContain("report-uri /api/csp-report");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(
      response.headers.get("Content-Security-Policy-Report-Only"),
    ).toContain("report-uri /api/csp-report");
    return policy;
  }

  test.each([
    ["/", 200],
    ["/?app=blog", 200],
    ["/?app=portfolio", 200],
    ["/?app=wiki", 200],
    ["/?app=commission", 200],
    ["/?app=about", 200],
    ["/?app=game", 200],
    ["/artfight-profile", 200],
    ["/artfight-profile?x=1", 200],
    ["/verify-token", 200],
    ["/missing-csp-test-route", 404],
  ] as const)(
    "%s serves matching HTML/header nonces on two consecutive requests",
    async (path, status) => {
      const nonces: string[] = [];
      for (let attempt = 0; attempt < 2; attempt++) {
        // Keep the URL and default request cache semantics identical to warm the edge.
        const response = await get(path);
        expect(response.status).toBe(status);
        const policy = checkHeaders(response);
        const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
        expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
        if (!nonce) throw new Error(`Missing CSP nonce for ${path}`);
        nonces.push(nonce);
        expect(response.headers.get("Cache-Control")).toContain("no-store");
        const html = await response.text();
        const scripts = [
          ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g),
        ];
        const inlineScripts = scripts.filter(
          ([, attributes]) => !/\bsrc=/.test(attributes),
        );
        expect(inlineScripts.length).toBeGreaterThan(0);
        for (const [, attributes] of inlineScripts) {
          expect(attributes).toContain(`nonce="${nonce}"`);
        }
        for (const [, htmlNonce] of html.matchAll(
          /<(?:script|style|link)\b[^>]*\bnonce="([^"]+)"/g,
        )) {
          expect(htmlNonce).toBe(nonce);
        }
        const edgeCache = response.headers.get("x-vercel-cache");
        expect(edgeCache).not.toBe("HIT");
        expect(edgeCache).not.toBe("STALE");
        if (new URL(origin!).hostname.endsWith(".vercel.app"))
          expect(edgeCache).not.toBeNull();
      }
      expect(nonces[0]).not.toBe(nonces[1]);
    },
  );

  test.each(["/login", "/admin", "/admin/drive"])(
    "%s preserves login redirects with enforcement",
    async (path) => {
      const response = await get(path);
      expect(response.status).toBe(307);
      checkHeaders(response);
      expect(new URL(response.headers.get("location")!, origin).pathname).toBe(
        "/admin/tuturuuu/login",
      );
    },
  );

  test("the compression worker retains its asset cache and can fetch data URLs", async () => {
    const response = await get("/workers/imageCompressor.worker.js");
    expect(response.status).toBe(200);
    const policy = checkHeaders(response);
    expect(policy).not.toContain("'nonce-");
    expect(policy).toContain("connect-src 'self' data: blob: https:");
    expect(response.headers.get("Cache-Control")).toContain("max-age=86400");
  });

  test.each(["enforce", "report"])(
    "the collector accepts %s-policy reports",
    async (policy) => {
      const response = await fetch(
        new URL(`/api/csp-report?policy=${policy}`, origin),
        {
          method: "POST",
          headers: { "Content-Type": "application/csp-report" },
          body: JSON.stringify({
            "csp-report": {
              "effective-directive": "script-src-elem",
              disposition: policy,
            },
          }),
        },
      );
      expect(response.status).toBe(204);
      checkHeaders(response);
    },
  );
});
