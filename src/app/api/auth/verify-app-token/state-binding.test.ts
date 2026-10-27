import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";

const STATE_COOKIE = "exocorpse_login_state";
const SESSION_COOKIE = "exocorpse_tuturuuu_admin_session";
const originalFetch = globalThis.fetch;

let exchangeCalls = 0;

function installExchangeStub() {
  exchangeCalls = 0;
  globalThis.fetch = (async () => {
    exchangeCalls += 1;
    return new Response(
      JSON.stringify({
        accessToken: "access",
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        user: { id: "user-1" },
        workspaceId: "ws-linked",
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );
  }) as unknown as typeof fetch;
}

function exchangeRequest({
  cookieState,
  existingSession,
  state,
}: {
  cookieState?: string;
  existingSession?: string;
  state?: string;
}) {
  const cookies = [
    cookieState ? `${STATE_COOKIE}=${cookieState}` : null,
    existingSession ? `${SESSION_COOKIE}=${existingSession}` : null,
  ].filter(Boolean);
  return new NextRequest("http://localhost:3000/api/auth/verify-app-token", {
    body: JSON.stringify({ state, token: "tok" }),
    headers: {
      "Content-Type": "application/json",
      ...(cookies.length ? { cookie: cookies.join("; ") } : {}),
    },
    method: "POST",
  });
}

function setCookieFor(response: Response, name: string) {
  return response.headers
    .getSetCookie()
    .find((value) => value.startsWith(`${name}=`));
}

function expectStateCleared(response: Response) {
  const cleared = setCookieFor(response, STATE_COOKIE);
  expect(cleared).toBeDefined();
  expect(cleared).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
}

describe("verify-app-token login state binding", () => {
  beforeEach(() => {
    process.env.TUTURUUU_API_BASE_URL = "https://platform.example.com/api/v1";
    process.env.TUTURUUU_EXOCORPSE_WORKSPACE_ID = "ws-linked";
    process.env.EXOCORPSE_APP_SECRET = "app-secret";
    process.env.EXOCORPSE_SESSION_SECRET = "session-secret";
    installExchangeStub();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.TUTURUUU_API_BASE_URL;
    delete process.env.TUTURUUU_EXOCORPSE_WORKSPACE_ID;
    delete process.env.EXOCORPSE_APP_SECRET;
    delete process.env.EXOCORPSE_SESSION_SECRET;
  });

  test("login start issues a hardened state cookie and forwards the same state", async () => {
    const { GET } = await import("../../../admin/tuturuuu/login/route");
    const response = GET(
      new NextRequest(
        "http://localhost:3000/admin/tuturuuu/login?next=library",
      ),
    );
    const cookie = setCookieFor(response, STATE_COOKIE);
    expect(cookie).toBeDefined();
    const value = cookie!.split(";")[0]!.slice(STATE_COOKIE.length + 1);
    expect(Buffer.from(value, "base64url").length).toBeGreaterThanOrEqual(16);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
    expect(cookie).toMatch(/Path=\/api\/auth\/verify-app-token/);
    expect(cookie).not.toMatch(/Domain=/i);
    const maxAge = Number(/Max-Age=(\d+)/i.exec(cookie!)?.[1]);
    expect(maxAge).toBeGreaterThan(0);
    expect(maxAge).toBeLessThanOrEqual(600);

    const location = new URL(response.headers.get("location")!);
    const returnUrl = new URL(location.searchParams.get("returnUrl")!);
    expect(returnUrl.searchParams.get("state")).toBe(value);
  });

  test("rejects a missing state and leaves the existing session intact", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      exchangeRequest({ cookieState: "abc", existingSession: "existing" }),
    );
    expect(response.status).toBe(400);
    expect(exchangeCalls).toBe(0);
    expect(setCookieFor(response, SESSION_COOKIE)).toBeUndefined();
    expectStateCleared(response);
  });

  test("rejects a state whose length differs from the cookie", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      exchangeRequest({ cookieState: "short", state: "short-but-longer" }),
    );
    expect(response.status).toBe(400);
    expect(exchangeCalls).toBe(0);
    expectStateCleared(response);
  });

  test("cookie Path equals the URL the client fetches", async () => {
    const { readFileSync } = await import("node:fs");
    const { EXOCORPSE_LOGIN_STATE_PATH } =
      await import("@/lib/exocorpse-login-state");
    const client = readFileSync(
      new URL("../../../../components/VerifyTokenClient.tsx", import.meta.url),
      "utf8",
    );
    expect(/fetch\(\s*"([^"]+)"/.exec(client)?.[1]).toBe(
      EXOCORPSE_LOGIN_STATE_PATH,
    );
  });

  test("rejects a missing state cookie", async () => {
    const { POST } = await import("./route");
    const response = await POST(exchangeRequest({ state: "abc" }));
    expect(response.status).toBe(400);
    expect(exchangeCalls).toBe(0);
    expect(setCookieFor(response, SESSION_COOKIE)).toBeUndefined();
  });

  test("rejects a wrong state and leaves the existing session intact", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      exchangeRequest({
        cookieState: "right-state",
        existingSession: "existing",
        state: "wrong-state",
      }),
    );
    expect(response.status).toBe(400);
    expect(exchangeCalls).toBe(0);
    expect(setCookieFor(response, SESSION_COOKIE)).toBeUndefined();
    expectStateCleared(response);
  });

  test("accepts a matching state, sets the session and clears the state cookie", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      exchangeRequest({ cookieState: "good-state", state: "good-state" }),
    );
    expect(response.status).toBe(200);
    expect(exchangeCalls).toBe(1);
    expect(setCookieFor(response, SESSION_COOKIE)).toBeDefined();
    expectStateCleared(response);
  });

  test("rejects a replay once the success cleared the state cookie", async () => {
    const { POST } = await import("./route");
    const first = await POST(
      exchangeRequest({ cookieState: "once", state: "once" }),
    );
    expect(first.status).toBe(200);
    expectStateCleared(first);
    // The browser drops the cleared cookie, so the replay carries none.
    const replay = await POST(exchangeRequest({ state: "once" }));
    expect(replay.status).toBe(400);
    expect(exchangeCalls).toBe(1);
  });
});
