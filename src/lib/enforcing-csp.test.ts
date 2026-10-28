import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import nextConfig from "../../next.config";
import { config, proxy } from "../proxy";

const header = "Content-Security-Policy";

function directives(policy: string) {
  return Object.fromEntries(
    policy.split("; ").map((directive) => {
      const [name, ...sources] = directive.split(" ");
      return [name, sources];
    }),
  );
}

describe("enforcing CSP", () => {
  test.each([
    "/",
    "/?app=blog",
    "/artfight-profile",
    "/verify-token",
    "/login",
    "/missing",
  ])("%s receives a fresh nonce and the security baseline", (path) => {
    const response = proxy(new NextRequest(`https://exocorpse.net${path}`));
    const policy = response.headers.get(header);
    expect(policy).not.toBeNull();
    const values = directives(policy!);
    expect(values["default-src"]).toEqual(["'self'"]);
    expect(values["object-src"]).toEqual(["'none'"]);
    expect(values["base-uri"]).toEqual(["'self'"]);
    expect(values["frame-ancestors"]).toEqual(["'self'"]);
    expect(values["form-action"]).toEqual(["'self'"]);
    expect(values["upgrade-insecure-requests"]).toEqual([]);
    expect(values["report-uri"]).toEqual(["/api/csp-report?policy=enforce"]);
    expect(values["script-src-attr"]).toEqual(["'none'"]);
    expect(values["style-src"]).toEqual(["'self'", "'unsafe-inline'"]);
    expect(values["img-src"]).toEqual(["'self'", "data:", "blob:", "https:"]);
    expect(values["media-src"]).toEqual(["'self'", "data:", "https:"]);
    expect(values["font-src"]).toEqual(["'self'"]);
    expect(values["connect-src"]).toEqual([
      "'self'",
      "data:",
      "blob:",
      "https:",
    ]);
    expect(values["frame-src"]).toEqual([
      "'self'",
      "https://open.spotify.com",
      "https://nzamlzqfdwaaxdefwraj.supabase.co",
    ]);
    expect(values["worker-src"]).toEqual(["'self'"]);

    expect(values["script-src"]).toEqual([
      "'self'",
      expect.stringMatching(/^'nonce-[A-Za-z0-9+/]{22}=='$/),
      ...(process.env.NODE_ENV === "development"
        ? ["https://va.vercel-scripts.com"]
        : []),
    ]);
    expect(policy).not.toContain("'unsafe-eval'");
    expect(values["script-src"]).not.toContain("'unsafe-inline'");
    expect(
      response.headers.get("x-middleware-request-content-security-policy"),
    ).toBe(policy);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  test("overwrites client-supplied nonces and never reuses a response nonce", () => {
    const request = () =>
      new NextRequest("https://exocorpse.net/", {
        headers: {
          "x-nonce": "attacker",
          [header]: "script-src 'nonce-attacker'",
        },
      });
    const first = proxy(request());
    const second = proxy(request());
    expect(first.headers.get(header)).not.toContain("attacker");
    expect(first.headers.get("x-middleware-request-x-nonce")).not.toBe(
      "attacker",
    );
    expect(first.headers.get(header)).not.toBe(second.headers.get(header));
  });

  test.each(["/admin", "/admin/drive", "/admin/cms"])(
    "%s keeps the auth redirect and adds enforcement",
    (path) => {
      const response = proxy(new NextRequest(`https://exocorpse.net${path}`));
      expect(response.status).toBe(307);
      expect(new URL(response.headers.get("location")!).pathname).toBe(
        "/admin/tuturuuu/login",
      );
      expect(response.headers.get(header)).toContain(
        "report-uri /api/csp-report",
      );
    },
  );

  test("authenticated admin documents receive the same nonce policy", () => {
    const response = proxy(
      new NextRequest("https://exocorpse.net/admin/drive", {
        headers: { cookie: "exocorpse_tuturuuu_admin_session=present" },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get(header)).toContain("'nonce-");
  });

  test.each([
    "/",
    "/artfight-profile",
    "/admin",
    "/admin/tuturuuu/login",
    "/verify-token",
    "/missing",
  ])("the real Next matcher includes document %s", (url) =>
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url })).toBe(
      true,
    ),
  );

  test.each([
    "/api/csp-report",
    "/_next/static/chunks/app.js",
    "/_next/image",
    "/workers/imageCompressor.worker.js",
    "/audio/boot.mp3",
  ])("the real Next matcher excludes non-document %s", (url) =>
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url })).toBe(
      false,
    ),
  );

  test("Next headers retain report-only and protect API and static responses", async () => {
    const rules = await nextConfig.headers!();
    const headers = rules.find((rule) => rule.source === "/:path*")!.headers;
    const policy = headers.find((item) => item.key === header)?.value;
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("report-uri /api/csp-report");
    expect(policy).not.toContain("'nonce-");
    expect(
      headers.find((item) => item.key === "Content-Security-Policy-Report-Only")
        ?.value,
    ).toContain("report-uri /api/csp-report");
  });
});

test("only development allows the Vercel Analytics debug script host", () => {
  const modulePath = new URL("./enforcing-csp.ts", import.meta.url).pathname;
  for (const environment of ["production", "test", "development"]) {
    const result = Bun.spawnSync({
      cmd: [
        process.execPath,
        "--eval",
        `import { enforcingContentSecurityPolicy } from ${JSON.stringify(modulePath)}; process.stdout.write(enforcingContentSecurityPolicy());`,
      ],
      env: { ...process.env, NODE_ENV: environment },
    });
    expect(result.exitCode).toBe(0);
    expect(
      result.stdout.toString().includes("https://va.vercel-scripts.com"),
    ).toBe(environment === "development");
  }
});
