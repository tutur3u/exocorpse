import {
  getExocorpseApiBaseUrl,
  getExocorpseAppId,
  getExocorpseAppSecret,
} from "@/lib/exocorpse-config";
import {
  setExocorpseSessionCookie,
  type ExocorpseAdminSession,
} from "@/lib/exocorpse-session";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AppTokenExchangeResponse = {
  accessToken?: string;
  app?: {
    name?: string;
  };
  error?: string;
  expiresAt?: string;
  tokenType?: string;
  user?: {
    email?: string | null;
    id?: string;
  };
};

class TokenExchangeError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function normalizeApiBaseUrl() {
  return getExocorpseApiBaseUrl().replace(/\/+$/, "");
}

async function readExchangeError(response: Response) {
  const fallback = `Tuturuuu app token exchange failed with status ${response.status}`;
  const payload = (await response
    .json()
    .catch(() => null)) as AppTokenExchangeResponse | null;

  return payload?.error || fallback;
}

async function exchangeCrossAppToken(token: string) {
  const response = await fetch(
    `${normalizeApiBaseUrl()}/auth/app-token/exchange`,
    {
      body: JSON.stringify({
        appId: getExocorpseAppId(),
        appSecret: getExocorpseAppSecret(),
        requestedScopes: ["external-projects:*"],
        token,
      }),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new TokenExchangeError(
      await readExchangeError(response),
      response.status,
    );
  }

  return (await response.json()) as AppTokenExchangeResponse;
}

function toExocorpseSession(
  payload: AppTokenExchangeResponse,
): ExocorpseAdminSession {
  if (!payload.accessToken || !payload.expiresAt || !payload.user?.id) {
    throw new Error("Invalid Tuturuuu app token exchange response.");
  }

  return {
    accessToken: payload.accessToken,
    app: {
      name: payload.app?.name ?? getExocorpseAppId(),
    },
    expiresAt: payload.expiresAt,
    tokenType: "Bearer",
    user: {
      email: payload.user.email ?? null,
      id: payload.user.id,
    },
  };
}

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

    const session = toExocorpseSession(await exchangeCrossAppToken(token));
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
      { status: error instanceof TokenExchangeError ? error.status : 500 },
    );
  }
}
