import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import {
  getExocorpseApiBaseUrl,
  getExocorpseAppId,
  getExocorpseAppSecret,
  getExocorpseWorkspaceId,
} from "@/lib/exocorpse-config";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const EXOCORPSE_SESSION_COOKIE = "exocorpse_tuturuuu_admin_session";
const SESSION_VERSION = "v1";
const DEFAULT_REFRESH_SKEW_SECONDS = 90;

export const EXOCORPSE_REQUESTED_SCOPES = [
  "external-projects:*",
  "users:profile:read",
  "users:profile:write",
] as const;

export type ExocorpseAdminSession = {
  accessToken: string;
  app: { name: string };
  expiresAt: string;
  refreshEarlySeconds?: number;
  refreshExpiresAt?: string;
  refreshToken?: string;
  scopes?: string[];
  tokenType: "Bearer";
  workspaceId: string;
  user: {
    avatarUrl?: string | null;
    displayName?: string | null;
    email: string | null;
    id: string;
  };
};

type ExchangePayload = {
  accessToken?: string;
  app?: { name?: string };
  error?: string;
  expiresAt?: string;
  refreshEarlySeconds?: number;
  refreshExpiresAt?: string;
  refreshToken?: string;
  scopes?: string[];
  tokenType?: string;
  workspaceId?: string | null;
  user?: {
    avatar_url?: string | null;
    avatarUrl?: string | null;
    display_name?: string | null;
    displayName?: string | null;
    email?: string | null;
    full_name?: string | null;
    fullName?: string | null;
    id?: string;
    name?: string | null;
  };
};

export class ExocorpseAuthError extends Error {
  constructor(
    message: string,
    readonly status = 401,
  ) {
    super(message);
    this.name = "ExocorpseAuthError";
  }
}

function getSessionSecret() {
  const secret =
    process.env.EXOCORPSE_SESSION_SECRET ?? process.env.EXOCORPSE_APP_SECRET;
  if (!secret?.trim()) {
    throw new Error(
      "[exocorpse] Missing EXOCORPSE_SESSION_SECRET or EXOCORPSE_APP_SECRET.",
    );
  }
  return createHash("sha256").update(secret.trim()).digest();
}

function encode(value: Buffer) {
  return value.toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url");
}

function sealSession(session: ExocorpseAdminSession) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getSessionSecret(), iv);
  const plaintext = Buffer.from(JSON.stringify(session), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [SESSION_VERSION, encode(iv), encode(tag), encode(ciphertext)].join(
    ".",
  );
}

function unsealSession(value: string): ExocorpseAdminSession | null {
  const [version, encodedIv, encodedTag, encodedCiphertext] = value.split(".");
  if (
    version !== SESSION_VERSION ||
    !encodedIv ||
    !encodedTag ||
    !encodedCiphertext
  ) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getSessionSecret(),
      decode(encodedIv),
    );
    decipher.setAuthTag(decode(encodedTag));
    const plaintext = Buffer.concat([
      decipher.update(decode(encodedCiphertext)),
      decipher.final(),
    ]).toString("utf8");
    const session = JSON.parse(plaintext) as ExocorpseAdminSession;
    if (
      !session.accessToken ||
      !session.user?.id ||
      !session.expiresAt ||
      !session.workspaceId ||
      session.workspaceId !== getExocorpseWorkspaceId()
    ) {
      return null;
    }

    const accessValid = Date.parse(session.expiresAt) > Date.now();
    return accessValid || sessionCanRefresh(session) ? session : null;
  } catch {
    return null;
  }
}

function firstCleanString(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const cleaned = value?.trim();
    if (cleaned) return cleaned;
  }
  return null;
}

function normalizeSession(payload: ExchangePayload): ExocorpseAdminSession {
  if (
    !payload.accessToken ||
    !payload.expiresAt ||
    !payload.user?.id ||
    !payload.workspaceId
  ) {
    throw new Error("Invalid Tuturuuu app token exchange response.");
  }
  return {
    accessToken: payload.accessToken,
    app: { name: payload.app?.name ?? getExocorpseAppId() },
    expiresAt: payload.expiresAt,
    refreshEarlySeconds: payload.refreshEarlySeconds,
    refreshExpiresAt: payload.refreshExpiresAt,
    refreshToken: payload.refreshToken,
    scopes: payload.scopes,
    tokenType: "Bearer",
    workspaceId: payload.workspaceId,
    user: {
      avatarUrl: firstCleanString(
        payload.user.avatarUrl,
        payload.user.avatar_url,
      ),
      displayName: firstCleanString(
        payload.user.displayName,
        payload.user.display_name,
        payload.user.name,
        payload.user.fullName,
        payload.user.full_name,
      ),
      email: payload.user.email ?? null,
      id: payload.user.id,
    },
  };
}

export async function exchangeExocorpseSession(input: {
  refreshToken?: string;
  token?: string;
}) {
  if (Boolean(input.token) === Boolean(input.refreshToken)) {
    throw new ExocorpseAuthError(
      "Provide exactly one token or refresh token.",
      400,
    );
  }
  const response = await fetch(
    `${getExocorpseApiBaseUrl().replace(/\/+$/, "")}/auth/app-token/exchange`,
    {
      body: JSON.stringify({
        appId: getExocorpseAppId(),
        appSecret: getExocorpseAppSecret(),
        refreshToken: input.refreshToken,
        requestedScopes: [...EXOCORPSE_REQUESTED_SCOPES],
        token: input.token,
        workspaceId: getExocorpseWorkspaceId(),
      }),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
  const payload = (await response
    .json()
    .catch(() => null)) as ExchangePayload | null;
  if (!response.ok) {
    throw new ExocorpseAuthError(
      payload?.error ||
        `Tuturuuu token exchange failed with status ${response.status}.`,
      response.status,
    );
  }
  return normalizeSession(payload ?? {});
}

export function sessionCanRefresh(session: ExocorpseAdminSession) {
  return Boolean(
    session.refreshToken &&
    session.refreshExpiresAt &&
    Date.parse(session.refreshExpiresAt) > Date.now(),
  );
}

export function sessionNeedsRefresh(session: ExocorpseAdminSession) {
  const skew = session.refreshEarlySeconds ?? DEFAULT_REFRESH_SKEW_SECONDS;
  return Date.parse(session.expiresAt) <= Date.now() + skew * 1000;
}

const inFlightRefreshes = new Map<string, Promise<ExocorpseAdminSession>>();

export async function refreshExocorpseSession(session: ExocorpseAdminSession) {
  if (!sessionCanRefresh(session) || !session.refreshToken) {
    throw new ExocorpseAuthError("Your Tuturuuu session has expired.", 401);
  }
  const key = createHash("sha256")
    .update(session.refreshToken)
    .digest("base64url");
  const existing = inFlightRefreshes.get(key);
  if (existing) return existing;
  const refresh = exchangeExocorpseSession({
    refreshToken: session.refreshToken,
  });
  inFlightRefreshes.set(key, refresh);
  try {
    return await refresh;
  } finally {
    if (inFlightRefreshes.get(key) === refresh) inFlightRefreshes.delete(key);
  }
}

export async function readExocorpseSessionCookie() {
  const cookieStore = await cookies();
  const value = cookieStore.get(EXOCORPSE_SESSION_COOKIE)?.value;
  return value ? unsealSession(value) : null;
}

function getValidationUrl(workspaceId: string) {
  return `${getExocorpseApiBaseUrl().replace(/\/+$/, "")}/workspaces/${encodeURIComponent(workspaceId)}/external-projects/summary`;
}

async function validateSession(session: ExocorpseAdminSession) {
  try {
    const response = await fetch(getValidationUrl(session.workspaceId), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `${session.tokenType} ${session.accessToken}`,
      },
    });
    if (response.ok) return "valid" as const;
    if (response.status === 401) return "expired" as const;
    if (
      response.status >= 400 &&
      response.status < 500 &&
      response.status !== 429
    ) {
      return "invalid" as const;
    }
    return "temporary-failure" as const;
  } catch {
    return "temporary-failure" as const;
  }
}

export async function getExocorpseSessionFromCookies() {
  let session = await readExocorpseSessionCookie();
  if (!session) return null;

  if (sessionNeedsRefresh(session) && sessionCanRefresh(session)) {
    try {
      session = await refreshExocorpseSession(session);
    } catch {
      if (Date.parse(session.expiresAt) <= Date.now()) return null;
    }
  }

  let validation = await validateSession(session);
  if (validation === "expired" && sessionCanRefresh(session)) {
    try {
      session = await refreshExocorpseSession(session);
      validation = await validateSession(session);
    } catch {
      return null;
    }
  }
  return validation === "expired" || validation === "invalid" ? null : session;
}

export function updateExocorpseSessionIdentity(
  session: ExocorpseAdminSession,
  identity: { avatarUrl?: string | null; displayName?: string | null },
) {
  return {
    ...session,
    user: {
      ...session.user,
      avatarUrl:
        identity.avatarUrl === undefined
          ? (session.user.avatarUrl ?? null)
          : identity.avatarUrl,
      displayName:
        identity.displayName === undefined
          ? (session.user.displayName ?? null)
          : identity.displayName,
    },
  } satisfies ExocorpseAdminSession;
}

export function setExocorpseSessionCookie(
  response: NextResponse,
  session: ExocorpseAdminSession,
) {
  response.cookies.set(EXOCORPSE_SESSION_COOKIE, sealSession(session), {
    expires: new Date(session.refreshExpiresAt ?? session.expiresAt),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearExocorpseSessionCookie(response: NextResponse) {
  response.cookies.set(EXOCORPSE_SESSION_COOKIE, "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
