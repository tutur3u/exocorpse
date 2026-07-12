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

function fitIdentifier(value: string | null | undefined, maxLength: number) {
  if (!value || value.length <= maxLength) return value;
  const suffix = digest(value).slice(0, 16);
  return `${value.slice(0, maxLength - suffix.length - 1)}-${suffix}`;
}

function fitText(value: string | null | undefined, maxLength: number) {
  return value && value.length > maxLength ? value.slice(0, maxLength) : value;
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
  for (const collection of manifest.schema.collections) {
    collection.slug = fitIdentifier(collection.slug, 80) ?? collection.slug;
    collection.collection_type =
      fitIdentifier(collection.collection_type, 64) ??
      collection.collection_type;
    collection.title = fitText(collection.title, 128) ?? collection.title;
  }
  for (const entry of manifest.content.entries) {
    entry.collectionSlug =
      fitIdentifier(entry.collectionSlug, 80) ?? entry.collectionSlug;
    entry.slug = fitIdentifier(entry.slug, 80) ?? entry.slug;
    entry.stableSourceId = fitIdentifier(entry.stableSourceId, 128);
    entry.title = fitText(entry.title, 128) ?? entry.title;
    entry.summary = fitText(entry.summary, 512);
    entry.subtitle = fitText(entry.subtitle, 512);
    for (const block of entry.blocks ?? []) {
      block.blockType = fitIdentifier(block.blockType, 64) ?? block.blockType;
      block.stableSourceId = fitIdentifier(block.stableSourceId, 128);
      block.title = fitText(block.title, 128);
    }
    for (const asset of entry.assets ?? []) {
      asset.assetType = fitIdentifier(asset.assetType, 64) ?? asset.assetType;
      asset.blockStableSourceId = fitIdentifier(asset.blockStableSourceId, 128);
      asset.stableSourceId = fitIdentifier(asset.stableSourceId, 128);
      asset.altText = fitText(asset.altText, 512);
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
