import { describe, expect, test } from "bun:test";

const origin = process.env.CSP_TEST_ORIGIN;

// Run against `bun run start` with CSP_TEST_ORIGIN=http://127.0.0.1:<port>.
describe.skipIf(!origin)("production HTTP CSP", () => {
  async function get(path: string) {
    return fetch(new URL(path, origin), { redirect: "manual" });
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
    ["/artfight-profile", 200],
    ["/verify-token", 200],
    ["/missing-csp-test-route", 404],
  ] as const)(
    "%s serves a matching nonce on every inline script",
    async (path, status) => {
      const response = await get(path);
      expect(response.status).toBe(status);
      const policy = checkHeaders(response);
      const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
      expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
      expect(response.headers.get("Cache-Control")).toContain("no-store");
      const html = await response.text();
      const scripts = [
        ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g),
      ];
      expect(scripts.length).toBeGreaterThan(0);
      for (const [, attributes] of scripts) {
        if (/\bsrc=/.test(attributes)) continue;
        expect(attributes).toContain(`nonce="${nonce}"`);
      }
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

  test("successive served documents have distinct nonces", async () => {
    const first = checkHeaders(await get("/"));
    const second = checkHeaders(await get("/"));
    expect(first).toContain("'nonce-");
    expect(first).not.toBe(second);
  });

  test("the compression worker retains its asset cache and can fetch data URLs", async () => {
    const response = await get("/workers/imageCompressor.worker.js");
    expect(response.status).toBe(200);
    const policy = checkHeaders(response);
    expect(policy).not.toContain("'nonce-");
    expect(policy).toContain("connect-src 'self' data: blob: https:");
    expect(response.headers.get("Cache-Control")).toContain("max-age=86400");
  });

  test("the existing collector accepts enforcing-policy reports", async () => {
    const response = await fetch(new URL("/api/csp-report", origin), {
      method: "POST",
      headers: { "Content-Type": "application/csp-report" },
      body: JSON.stringify({
        "csp-report": {
          "effective-directive": "script-src-elem",
          disposition: "enforce",
        },
      }),
    });
    expect(response.status).toBe(204);
    checkHeaders(response);
  });
});
