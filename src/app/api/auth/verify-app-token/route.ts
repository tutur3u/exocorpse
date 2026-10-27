import {
  exchangeExocorpseSession,
  ExocorpseAuthError,
  setExocorpseSessionCookie,
} from "@/lib/exocorpse-session";
import {
  clearExocorpseLoginStateCookie,
  EXOCORPSE_LOGIN_STATE_COOKIE,
  exocorpseLoginStateMatches,
} from "@/lib/exocorpse-login-state";
import { type NextRequest, NextResponse } from "next/server";

async function exchange(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      state?: unknown;
      token?: unknown;
    } | null;

    // Bind the exchange to the browser that started the login before any
    // token exchange or session write happens.
    if (
      !exocorpseLoginStateMatches(
        request.cookies.get(EXOCORPSE_LOGIN_STATE_COOKIE)?.value,
        body?.state,
      )
    ) {
      return NextResponse.json(
        { error: "Login state is missing or does not match. Sign in again." },
        { status: 400 },
      );
    }
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json(
        { error: "Missing required parameter: token" },
        { status: 400 },
      );
    }

    const session = await exchangeExocorpseSession({ token });
    const response = NextResponse.json({
      expiresAt: session.expiresAt,
      userId: session.user.id,
      valid: true,
    });

    setExocorpseSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("[exocorpse:auth] app token exchange failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: error instanceof ExocorpseAuthError ? error.status : 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const response = await exchange(request);
  // The state is single use: clear it whether the exchange succeeded or not.
  clearExocorpseLoginStateCookie(response);
  return response;
}
