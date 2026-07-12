import "server-only";

import { createHash } from "node:crypto";
import { buildExocorpseExternalProjectManifestWithSource } from "@/lib/exocorpse-external-project-manifest";
import {
  analyzeExocorpseMigrationManifest,
  inspectPublicAssets,
} from "@/lib/exocorpse-migration-report";
import {
  linkPublicFolderAssets,
  linkPublicFolderAssetsToRemoteSource,
} from "@/lib/tuturuuu-public-folder-sync";

export const EXOCORPSE_MIGRATION_CONFIRMATION = "MIGRATE_EXOCORPSE_TO_TUTURUUU";

function stableSort(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableSort);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stableSort(nested)]),
    );
  }

  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(stableSort(value)))
    .digest("hex");
}

function shouldUseRemotePublicAssetSources() {
  const mode =
    process.env.EXOCORPSE_MIGRATION_PUBLIC_ASSET_MODE?.trim().toLowerCase();

  if (mode === "remote") return true;
  if (mode === "storage") return false;

  return process.env.VERCEL === "1";
}

export async function buildExocorpseMigrationSnapshot() {
  const { manifest: rawManifest, sourceCounts } =
    await buildExocorpseExternalProjectManifestWithSource();
  const remotePublicAssets = shouldUseRemotePublicAssetSources();
  const manifest = remotePublicAssets
    ? linkPublicFolderAssetsToRemoteSource(
        rawManifest,
        process.env.EXOCORPSE_PUBLIC_ASSET_BASE_URL ?? "https://exocorpse.net",
      )
    : linkPublicFolderAssets(rawManifest);
  for (const entry of manifest.content.entries) {
    if (entry.summary && entry.summary.length > 1000) {
      entry.summary = entry.summary.slice(0, 1000);
    }
  }
  const publicAssets = await inspectPublicAssets(manifest);
  const manifestDigest = digest({
    manifest,
    publicAssetFiles: publicAssets.present.map((asset) => ({
      mtimeMs: asset.mtimeMs,
      publicPath: asset.publicPath,
      size: asset.size,
    })),
  });

  return {
    manifest,
    preflight: analyzeExocorpseMigrationManifest({
      manifest,
      manifestDigest,
      publicAssets,
      sourceCounts,
    }),
  };
}
