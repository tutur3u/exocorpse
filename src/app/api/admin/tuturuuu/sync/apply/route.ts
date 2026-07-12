import {
  getExocorpseApiBaseUrl,
  getExocorpseWorkspaceId,
} from "@/lib/exocorpse-config";
import {
  buildExocorpseMigrationSnapshot,
  EXOCORPSE_MIGRATION_CONFIRMATION,
} from "@/lib/exocorpse-migration-safety";
import { getExocorpseSessionFromCookies } from "@/lib/exocorpse-session";
import { getCurrentUser } from "@/lib/auth/utils";
import { syncPublicFolderAssets } from "@/lib/tuturuuu-public-folder-sync";
import { createCompressedSyncPayload } from "@/lib/tuturuuu-sync-payload";
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
      { error: "Tuturuuu admin connection required" },
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
    confirmation?: unknown;
    force?: unknown;
    manifestDigest?: unknown;
  } | null;
  const workspaceId = getExocorpseWorkspaceId();
  const apiBaseUrl = getExocorpseApiBaseUrl();
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

  if (body?.manifestDigest !== preflight.manifestDigest) {
    return NextResponse.json(
      {
        error:
          "Migration manifest changed since review. Run preflight again and review the new digest before applying.",
        preflight,
      },
      { status: 409 },
    );
  }

  if (body?.confirmation !== EXOCORPSE_MIGRATION_CONFIRMATION) {
    return NextResponse.json(
      {
        confirmationPhrase: EXOCORPSE_MIGRATION_CONFIRMATION,
        error:
          "Explicit migration confirmation is required before applying to Tuturuuu.",
        preflight,
      },
      { status: 400 },
    );
  }

  const setupResponse = await fetch(
    `${apiBaseUrl.replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/setup`,
    {
      body: JSON.stringify({
        adapter: manifest.adapter,
        schema: manifest.schema,
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

  if (!setupResponse.ok) {
    return NextResponse.json(
      { error: await readApiError(setupResponse) },
      { status: setupResponse.status },
    );
  }

  const publicAssetSync = await syncPublicFolderAssets({
    accessToken: session.accessToken,
    apiBaseUrl,
    manifest,
    tokenType: session.tokenType,
    workspaceId,
  });
  const compressedApply = createCompressedSyncPayload({
    force: body?.force === true,
    manifest: publicAssetSync.manifest,
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
        preflight,
      },
      { status: 400 },
    );
  }

  const response = await fetch(
    `${apiBaseUrl.replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/sync/apply`,
    {
      body: compressedApply.body,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `${session.tokenType} ${session.accessToken}`,
        ...compressedApply.headers,
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
    publicAssetSync: {
      skipped: publicAssetSync.skipped,
      uploaded: publicAssetSync.uploaded,
    },
  });
}
