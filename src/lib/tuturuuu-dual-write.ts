import "server-only";

import {
  getExocorpseApiBaseUrl,
  getExocorpseWorkspaceId,
} from "@/lib/exocorpse-config";
import { buildExocorpseMigrationSnapshot } from "@/lib/exocorpse-migration-safety";
import { getExocorpseSessionFromCookies } from "@/lib/exocorpse-session";
import { syncPublicFolderAssets } from "@/lib/tuturuuu-public-folder-sync";

type DualWriteResult =
  | {
      applied: true;
      manifestDigest: string;
      reason: string;
    }
  | {
      applied: false;
      reason: string;
      skipped: string;
    };

let pendingDualWrite: Promise<DualWriteResult> | null = null;

function isDualWriteDisabled() {
  const value = process.env.TUTURUUU_EXOCORPSE_DUAL_WRITE;

  return value
    ? ["0", "false", "no", "off"].includes(value.trim().toLowerCase())
    : false;
}

async function readApiError(response: Response) {
  const fallback = `Tuturuuu dual-write failed with status ${response.status}`;
  const data = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;

  return typeof data?.error === "string" && data.error.trim()
    ? data.error
    : fallback;
}

async function applyDualWrite(reason: string): Promise<DualWriteResult> {
  if (isDualWriteDisabled()) {
    return {
      applied: false,
      reason,
      skipped: "TUTURUUU_EXOCORPSE_DUAL_WRITE is disabled.",
    };
  }

  const session = await getExocorpseSessionFromCookies();
  if (!session) {
    throw new Error(
      "Tuturuuu admin session is required before saving Exocorpse CMS changes.",
    );
  }

  const workspaceId = getExocorpseWorkspaceId();
  const apiBaseUrl = getExocorpseApiBaseUrl().replace(/\/+$/, "");
  const { manifest, preflight } = await buildExocorpseMigrationSnapshot();

  if (!preflight.readyToApply) {
    throw new Error("Exocorpse CMS dual-write preflight failed.");
  }

  const authHeaders = {
    Accept: "application/json",
    Authorization: `${session.tokenType} ${session.accessToken}`,
    "Content-Type": "application/json",
  };
  const setupResponse = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/setup`,
    {
      body: JSON.stringify({ manifest }),
      cache: "no-store",
      headers: authHeaders,
      method: "POST",
    },
  );

  if (!setupResponse.ok) {
    throw new Error(await readApiError(setupResponse));
  }

  const publicAssetSync = await syncPublicFolderAssets({
    accessToken: session.accessToken,
    apiBaseUrl,
    manifest,
    tokenType: session.tokenType,
    workspaceId,
  });

  if (publicAssetSync.skipped.length > 0) {
    throw new Error(
      "Exocorpse CMS dual-write skipped because local public assets are missing.",
    );
  }

  const applyResponse = await fetch(
    `${apiBaseUrl}/workspaces/${encodeURIComponent(
      workspaceId,
    )}/external-projects/sync/apply`,
    {
      body: JSON.stringify({
        force: true,
        manifest: publicAssetSync.manifest,
      }),
      cache: "no-store",
      headers: authHeaders,
      method: "POST",
    },
  );

  if (!applyResponse.ok) {
    throw new Error(await readApiError(applyResponse));
  }

  return {
    applied: true,
    manifestDigest: preflight.manifestDigest,
    reason,
  };
}

export async function syncTuturuuuCmsAfterMutation(reason: string) {
  pendingDualWrite = (pendingDualWrite ?? Promise.resolve(null)).then(() =>
    applyDualWrite(reason),
  );

  try {
    return await pendingDualWrite;
  } finally {
    pendingDualWrite = null;
  }
}
