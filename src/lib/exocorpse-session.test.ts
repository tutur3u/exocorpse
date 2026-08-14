import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { NextResponse } from "next/server";
import type { ExocorpseAdminSession } from "./exocorpse-session";

let sessionCookieValue: string | null = null;

mock.module("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      sessionCookieValue ? { name, value: sessionCookieValue } : undefined,
  }),
}));

const originalFetch = globalThis.fetch;

function createSession(): ExocorpseAdminSession {
  return {
    accessToken: "app-token",
    app: { name: "exocorpse" },
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    tokenType: "Bearer",
    user: { email: "admin@example.com", id: "user-1" },
    workspaceId: "ws-linked",
  };
}

function readSessionCookieValue(response: NextResponse) {
  const setCookie = response.headers.get("set-cookie");
  expect(setCookie).toContain("exocorpse_tuturuuu_admin_session=");
  return (
    setCookie
      ?.split(";")[0]
      ?.slice("exocorpse_tuturuuu_admin_session=".length) ?? ""
  );
}

describe("exocorpse session validation", () => {
  beforeEach(() => {
    process.env.TUTURUUU_API_BASE_URL = "https://platform.example.com/api/v1";
    process.env.TUTURUUU_EXOCORPSE_WORKSPACE_ID = "ws-linked";
    process.env.EXOCORPSE_APP_SECRET = "app-secret";
    process.env.EXOCORPSE_SESSION_SECRET = "session-secret";
    sessionCookieValue = null;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.TUTURUUU_API_BASE_URL;
    delete process.env.TUTURUUU_EXOCORPSE_WORKSPACE_ID;
    delete process.env.EXOCORPSE_APP_SECRET;
    delete process.env.EXOCORPSE_SESSION_SECRET;
    sessionCookieValue = null;
  });

  for (const status of [401, 403, 404] as const) {
    test(`rejects stored sessions when platform revalidation returns ${status}`, async () => {
      const { getExocorpseSessionFromCookies, setExocorpseSessionCookie } =
        await import("./exocorpse-session");
      const response = NextResponse.json({});
      setExocorpseSessionCookie(response, createSession());
      sessionCookieValue = readSessionCookieValue(response);

      const calls: Array<{ init?: RequestInit; input: RequestInfo | URL }> = [];
      globalThis.fetch = (async (input, init) => {
        calls.push({ init, input });
        return Response.json({ error: "Invalid session" }, { status });
      }) as typeof fetch;

      await expect(getExocorpseSessionFromCookies()).resolves.toBeNull();
      expect(calls).toHaveLength(1);
      expect(String(calls[0]?.input)).toBe(
        "https://platform.example.com/api/v1/workspaces/ws-linked/external-projects/summary",
      );
      expect(calls[0]?.init?.headers).toMatchObject({
        Accept: "application/json",
        Authorization: "Bearer app-token",
      });
    });
  }

  test("keeps a valid local session during a temporary platform failure", async () => {
    const { getExocorpseSessionFromCookies, setExocorpseSessionCookie } =
      await import("./exocorpse-session");
    const response = NextResponse.json({});
    setExocorpseSessionCookie(response, createSession());
    sessionCookieValue = readSessionCookieValue(response);
    globalThis.fetch = (async () =>
      Response.json(
        { error: "Unavailable" },
        { status: 503 },
      )) as unknown as typeof fetch;

    await expect(getExocorpseSessionFromCookies()).resolves.toMatchObject({
      accessToken: "app-token",
      user: { id: "user-1" },
    });
  });

  test("refreshes an expired access token before validating the admin session", async () => {
    const { getExocorpseSessionFromCookies, setExocorpseSessionCookie } =
      await import("./exocorpse-session");
    const response = NextResponse.json({});
    setExocorpseSessionCookie(response, {
      ...createSession(),
      expiresAt: new Date(Date.now() - 1_000).toISOString(),
      refreshExpiresAt: new Date(Date.now() + 60_000).toISOString(),
      refreshToken: "refresh-token",
    });
    sessionCookieValue = readSessionCookieValue(response);
    const calls: Array<{ init?: RequestInit; input: RequestInfo | URL }> = [];
    globalThis.fetch = (async (input, init) => {
      calls.push({ input, init });
      if (String(input).endsWith("/auth/app-token/exchange")) {
        return Response.json({
          accessToken: "refreshed-token",
          app: { name: "exocorpse" },
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          refreshExpiresAt: new Date(Date.now() + 120_000).toISOString(),
          refreshToken: "rotated-refresh-token",
          user: { email: "admin@example.com", id: "user-1" },
          workspaceId: "ws-linked",
        });
      }
      return Response.json({ ok: true });
    }) as typeof fetch;

    await expect(getExocorpseSessionFromCookies()).resolves.toMatchObject({
      accessToken: "refreshed-token",
      refreshToken: "rotated-refresh-token",
    });
    expect(calls).toHaveLength(2);
    expect(JSON.parse(calls[0]?.init?.body as string)).toMatchObject({
      refreshToken: "refresh-token",
    });
    expect(calls[1]?.init?.headers).toMatchObject({
      Authorization: "Bearer refreshed-token",
    });
  });
});
