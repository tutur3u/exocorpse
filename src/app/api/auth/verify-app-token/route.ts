import {
  exchangeExocorpseSession,
  ExocorpseAuthError,
  setExocorpseSessionCookie,
} from "@/lib/exocorpse-session";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      token?: unknown;
    } | null;
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
