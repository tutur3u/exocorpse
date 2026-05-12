import {
  getExocorpseApiBaseUrl,
  getExocorpseWorkspaceId,
} from "@/lib/exocorpse-config";
import { buildExocorpseMigrationSnapshot } from "@/lib/exocorpse-migration-safety";
import { getExocorpseSessionFromCookies } from "@/lib/exocorpse-session";
import { getCurrentUser } from "@/lib/auth/utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function readApiError(response: Response) {
  const fallback = `Tuturuuu sync diff failed with status ${response.status}`;
  const data = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  return typeof data?.error === "string" && data.error.trim()
    ? data.error
    : fallback;
}

export async function POST() {
  const [localUser, session] = await Promise.all([
    getCurrentUser(),
    getExocorpseSessionFromCookies(),
  ]);

  if (!localUser) {
    return NextResponse.json(
      { error: "Local admin login required" },
      { status: 401 },
    );
  }

  if (!session) {
    return NextResponse.json(
      { error: "Tuturuuu admin connection required" },
      { status: 401 },
    );
  }

  const workspaceId = getExocorpseWorkspaceId();
  const { manifest, preflight } = await buildExocorpseMigrationSnapshot();

  if (!preflight.readyToApply) {
    return NextResponse.json(
      {
        error: "Exocorpse migration preflight failed.",
        preflight,
      },
      { status: 400 },
    );
  }

  const response = await fetch(
    `${getExocorpseApiBaseUrl().replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/sync/diff`,
    {
      body: JSON.stringify({ manifest }),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `${session.tokenType} ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: await readApiError(response) },
      { status: response.status },
    );
  }

  return NextResponse.json({
    ...(await response.json()),
    preflight,
  });
}
