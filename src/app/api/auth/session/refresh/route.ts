import {
  ExocorpseAuthError,
  readExocorpseSessionCookie,
  refreshExocorpseSession,
  sessionNeedsRefresh,
  setExocorpseSessionCookie,
} from "@/lib/exocorpse-session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const current = await readExocorpseSessionCookie();
    if (!current) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }
    const session = sessionNeedsRefresh(current)
      ? await refreshExocorpseSession(current)
      : current;
    const response = NextResponse.json({
      expiresAt: session.expiresAt,
      refreshEarlySeconds: session.refreshEarlySeconds ?? 90,
      refreshExpiresAt: session.refreshExpiresAt ?? session.expiresAt,
      user: session.user,
    });
    response.headers.set("Cache-Control", "no-store");
    setExocorpseSessionCookie(response, session);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Session refresh failed.",
      },
      {
        headers: { "Cache-Control": "no-store" },
        status: error instanceof ExocorpseAuthError ? error.status : 500,
      },
    );
  }
}
