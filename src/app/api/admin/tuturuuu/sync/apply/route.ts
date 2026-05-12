import {
  getExocorpseApiBaseUrl,
  getExocorpseWorkspaceId,
} from "@/lib/exocorpse-config";
import { buildExocorpseExternalProjectManifest } from "@/lib/exocorpse-external-project-manifest";
import { getExocorpseSessionFromCookies } from "@/lib/exocorpse-session";
import { getCurrentUser } from "@/lib/auth/utils";
import { syncPublicFolderAssets } from "@/lib/tuturuuu-public-folder-sync";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function readApiError(response: Response) {
  const fallback = `Tuturuuu sync apply failed with status ${response.status}`;
  const data = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  return typeof data?.error === "string" && data.error.trim()
    ? data.error
    : fallback;
}

export async function POST(request: Request) {
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

  const body = (await request.json().catch(() => null)) as {
    force?: unknown;
  } | null;
  const workspaceId = getExocorpseWorkspaceId();
  const apiBaseUrl = getExocorpseApiBaseUrl();
  const publicAssetSync = await syncPublicFolderAssets({
    accessToken: session.accessToken,
    apiBaseUrl,
    manifest: await buildExocorpseExternalProjectManifest(),
    tokenType: session.tokenType,
    workspaceId,
  });

  if (publicAssetSync.skipped.length > 0) {
    return NextResponse.json(
      {
        error:
          "Missing local public assets. Upload aborted before applying the manifest.",
        publicAssetSync: {
          skipped: publicAssetSync.skipped,
          uploaded: publicAssetSync.uploaded,
        },
      },
      { status: 400 },
    );
  }

  const response = await fetch(
    `${apiBaseUrl.replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/sync/apply`,
    {
      body: JSON.stringify({
        force: body?.force === true,
        manifest: publicAssetSync.manifest,
      }),
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
    publicAssetSync: {
      skipped: publicAssetSync.skipped,
      uploaded: publicAssetSync.uploaded,
    },
  });
}
