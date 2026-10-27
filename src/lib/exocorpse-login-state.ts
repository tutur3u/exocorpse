import { randomBytes, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";

export const EXOCORPSE_LOGIN_STATE_COOKIE = "exocorpse_login_state";
export const EXOCORPSE_LOGIN_STATE_PATH = "/api/auth/verify-app-token";
const LOGIN_STATE_MAX_AGE_SECONDS = 600;

const cookieOptions = () => ({
  httpOnly: true,
  path: EXOCORPSE_LOGIN_STATE_PATH,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
});

export function createExocorpseLoginState() {
  return randomBytes(32).toString("base64url");
}

export function setExocorpseLoginStateCookie(
  response: NextResponse,
  state: string,
) {
  response.cookies.set(EXOCORPSE_LOGIN_STATE_COOKIE, state, {
    ...cookieOptions(),
    maxAge: LOGIN_STATE_MAX_AGE_SECONDS,
  });
}

export function clearExocorpseLoginStateCookie(response: NextResponse) {
  response.cookies.set(EXOCORPSE_LOGIN_STATE_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
}

export function exocorpseLoginStateMatches(
  expected: string | null | undefined,
  actual: unknown,
) {
  if (!expected || typeof actual !== "string" || !actual) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(actual);
  return a.length === b.length && timingSafeEqual(a, b);
}
