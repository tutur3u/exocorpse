import assert from "node:assert/strict";
import { createServer } from "node:net";
import { once } from "node:events";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

process.env.EXOCORPSE_SESSION_SECRET = "drive-http-fixture-secret";
process.env.TUTURUUU_EXOCORPSE_WORKSPACE_ID = "ws-fixture";
const { setExocorpseSessionCookie } =
  await import("../../src/lib/exocorpse-session");
const cookieResponse = NextResponse.json({});
setExocorpseSessionCookie(cookieResponse, {
  accessToken: "drive-http-fixture-token",
  app: { name: "exocorpse" },
  expiresAt: new Date(Date.now() + 600_000).toISOString(),
  tokenType: "Bearer",
  workspaceId: "ws-fixture",
  user: { id: "fixture-user", email: "fixture@example.test" },
});
const cookie = cookieResponse.headers.get("set-cookie")?.split(";")[0];
assert.ok(cookie);
const reservation = createServer();
reservation.listen(0, "127.0.0.1");
await once(reservation, "listening");
const address = reservation.address();
assert.ok(address && typeof address !== "string");
const port = address.port;
await new Promise<void>((resolve, reject) =>
  reservation.close((error) => (error ? reject(error) : resolve())),
);
const node = Bun.which("node");
assert.ok(node, "Node is required to exercise the production Next server");
const server = Bun.spawn(
  [
    node,
    "--import",
    resolve("scripts/security/drive-http-fixture.mjs"),
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    env: {
      PATH: process.env.PATH,
      NODE_ENV: "production",
      NEXT_TELEMETRY_DISABLED: "1",
      TUTURUUU_API_BASE_URL: "https://drive-http-fixture.test/api/v1",
      TUTURUUU_EXOCORPSE_CMS_DELIVERY: "false",
      TUTURUUU_EXOCORPSE_WORKSPACE_ID: "ws-fixture",
      EXOCORPSE_SESSION_SECRET: "drive-http-fixture-secret",
    },
    stdout: "ignore",
    stderr: "pipe",
  },
);
const errors = new Response(server.stderr).text();
try {
  const origin = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 20_000;
  let ready = false;
  while (Date.now() < deadline && server.exitCode === null) {
    try {
      const response: Response = await fetch(
        `${origin}/api/admin/drive?filePath=drive%2Froot%2Ftest.html&content=1`,
        { signal: AbortSignal.timeout(1000) },
      );
      await response.body?.cancel();
      if (response.status === 401) {
        ready = true;
        break;
      }
    } catch {}
    await Bun.sleep(50);
  }
  assert.ok(ready, "The built Next server must become ready");
  for (const [name, type, disposition, bytes] of [
    ["test.html", "application/octet-stream", "attachment", 18],
    ["test.pdf", "application/octet-stream", "attachment", 18],
    ["test.png", "image/png", "inline", 18],
    ["large.mp4", "video/mp4", "inline", 6 * 1024 * 1024],
  ] as const) {
    const params = new URLSearchParams({
      filePath: `drive/root/${name}`,
      content: "1",
    });
    const response: Response = await fetch(
      `${origin}/api/admin/drive?${params}`,
      {
        headers: { Cookie: cookie },
        redirect: "manual",
      },
    );
    assert.equal(response.status, 200, name);
    assert.equal(response.headers.get("content-type"), type);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.match(
      response.headers.get("content-disposition") ?? "",
      new RegExp(`^${disposition};`),
    );
    const body = await response.arrayBuffer();
    assert.equal(body.byteLength, bytes);
    assert.equal(
      response.headers.get("content-security-policy"),
      "sandbox; default-src 'none'",
      `The built ${name} response must retain the Drive sandbox CSP`,
    );
  }
  const home = await fetch(origin);
  assert.match(
    home.headers.get("content-security-policy") ?? "",
    /script-src 'self' 'nonce-/,
  );
  assert.doesNotMatch(
    home.headers.get("content-security-policy") ?? "",
    /sandbox/,
  );
  await home.body?.cancel();
} finally {
  if (server.exitCode === null) server.kill("SIGTERM");
  const timeout = setTimeout(() => {
    if (server.exitCode === null) server.kill("SIGKILL");
  }, 2000);
  await server.exited;
  clearTimeout(timeout);
  const stderr = await errors;
  if (stderr.includes("Error:")) process.stderr.write(stderr);
  console.log(`Stopped owned Next server PID ${server.pid}.`);
}
console.log("Built Drive HTTP headers and 6 MiB streaming pass.");
