import "server-only";

import { createHash } from "node:crypto";
import { stat } from "node:fs/promises";
import { basename, resolve, sep } from "node:path";
import { posix } from "node:path";
import {
  buildExocorpseExternalProjectManifestWithSource,
  type ExocorpseExternalProjectManifest,
  type ExocorpseSourceTableCounts,
} from "@/lib/exocorpse-external-project-manifest";
import { linkPublicFolderAssets } from "@/lib/tuturuuu-public-folder-sync";

export const EXOCORPSE_MIGRATION_CONFIRMATION = "MIGRATE_EXOCORPSE_TO_TUTURUUU";

type ManifestAsset = NonNullable<
  ExocorpseExternalProjectManifest["content"]["entries"][number]["assets"]
>[number];

type MigrationIssue = {
  code: string;
  detail?: string;
  message: string;
  severity: "error" | "warning";
};

type PublicAssetFile = {
  collectionSlug: string;
  entrySlug: string;
  filename: string;
  mtimeMs?: number;
  publicPath: string;
  size?: number;
  stableSourceId: string | null;
  storagePath: string | null;
};

const SOURCE_TABLE_COLLECTIONS: Record<string, string> = {
  about_content_items: "about-content",
  about_faqs: "about-faqs",
  about_page_settings: "about",
  addons: "commission-addons",
  art_pieces: "portfolio-art",
  blacklisted_users: "commission-blacklist",
  blog_posts: "blog-posts",
  characters: "characters",
  character_factions: "character-factions",
  character_gallery: "character-gallery",
  character_locations: "character-locations",
  character_outfits: "character-outfits",
  character_relationships: "character-relationships",
  character_worlds: "character-worlds",
  cofi_samples: "cofi-samples",
  entity_tags: "entity-tags",
  event_factions: "event-factions",
  event_participants: "event-participants",
  event_types: "event-types",
  events: "events",
  factions: "factions",
  game_piece_gallery_images: "portfolio-games",
  game_pieces: "portfolio-games",
  heaven_space_assets: "heaven-space-assets",
  heaven_space_passages: "heaven-space-passages",
  heaven_space_scene_choices: "heaven-space-scene-choices",
  heaven_space_scenes: "heaven-space-scenes",
  locations: "locations",
  locations_gallery_images: "location-gallery",
  media_assets: "media-assets",
  moodboards: "moodboards",
  outfit_types: "outfit-types",
  pictures: "commission-pictures",
  relationship_types: "relationship-types",
  service_addons: "commission-service-addons",
  services: "commission-services",
  stories: "stories",
  styles: "commission-styles",
  tags: "tags",
  timelines: "timelines",
  worlds: "worlds",
  writing_pieces: "portfolio-writing",
};

const CRITICAL_COLLECTIONS = [
  "about",
  "stories",
  "worlds",
  "characters",
  "portfolio-art",
  "commission-services",
  "cofi-samples",
];

function normalizePublicPath(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed) || !trimmed.startsWith("/")) {
    return null;
  }

  const normalized = posix.normalize(trimmed);
  if (normalized === "/" || normalized.startsWith("/../")) {
    return null;
  }

  return normalized;
}

function getAssetPublicPath(asset: ManifestAsset) {
  const metadata = (asset.metadata ?? {}) as Record<string, unknown>;

  return (
    normalizePublicPath(metadata.publicPath) ??
    normalizePublicPath(metadata.localAssetPath) ??
    normalizePublicPath(metadata.sourcePublicPath) ??
    normalizePublicPath(asset.sourceUrl)
  );
}

function resolvePublicFilePath(publicDir: string, publicPath: string) {
  const publicRoot = resolve(/* turbopackIgnore: true */ publicDir);
  const filePath = resolve(
    /* turbopackIgnore: true */ publicRoot,
    publicPath.slice(1),
  );

  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${sep}`)) {
    throw new Error(
      `Refusing to inspect public asset outside publicDir: ${publicPath}`,
    );
  }

  return filePath;
}

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

function pushDuplicateIssues(
  issues: MigrationIssue[],
  values: Map<string, number>,
  code: string,
  label: string,
) {
  for (const [value, count] of values) {
    if (count > 1) {
      issues.push({
        code,
        detail: value,
        message: `${label} must be unique, but "${value}" appears ${count} times.`,
        severity: "error",
      });
    }
  }
}

async function inspectPublicAssets(
  manifest: ExocorpseExternalProjectManifest,
  publicDir = resolve(/* turbopackIgnore: true */ process.cwd(), "public"),
) {
  const present: PublicAssetFile[] = [];
  const missing: PublicAssetFile[] = [];

  for (const entry of manifest.content.entries) {
    for (const asset of entry.assets ?? []) {
      const publicPath = getAssetPublicPath(asset);

      if (!publicPath) {
        continue;
      }

      const assetFile: PublicAssetFile = {
        collectionSlug: entry.collectionSlug,
        entrySlug: entry.slug,
        filename: basename(publicPath),
        publicPath,
        stableSourceId: asset.stableSourceId ?? null,
        storagePath: asset.storagePath ?? null,
      };

      try {
        const fileStat = await stat(
          /* turbopackIgnore: true */ resolvePublicFilePath(
            publicDir,
            publicPath,
          ),
        );
        present.push({
          ...assetFile,
          mtimeMs: Math.trunc(fileStat.mtimeMs),
          size: fileStat.size,
        });
      } catch {
        missing.push(assetFile);
      }
    }
  }

  return {
    missing,
    present,
    totalBytes: present.reduce((total, asset) => total + (asset.size ?? 0), 0),
  };
}

function analyzeManifest({
  manifest,
  manifestDigest,
  publicAssets,
  sourceCounts,
}: {
  manifest: ExocorpseExternalProjectManifest;
  manifestDigest: string;
  publicAssets: Awaited<ReturnType<typeof inspectPublicAssets>>;
  sourceCounts: ExocorpseSourceTableCounts;
}) {
  const issues: MigrationIssue[] = [];
  const collectionSlugs = new Set(
    manifest.schema.collections.map((collection) => collection.slug),
  );
  const collectionCounts: Record<string, number> = {};
  const entryStableIds = new Map<string, number>();
  const assetStableIds = new Map<string, number>();
  const blockStableIds = new Map<string, number>();
  const collectionSlugsByEntry = new Map<string, number>();
  let totalAssets = 0;
  let totalBlocks = 0;

  for (const entry of manifest.content.entries) {
    collectionCounts[entry.collectionSlug] =
      (collectionCounts[entry.collectionSlug] ?? 0) + 1;

    if (!collectionSlugs.has(entry.collectionSlug)) {
      issues.push({
        code: "unknown_collection",
        detail: entry.collectionSlug,
        message: `Entry "${entry.stableSourceId}" references collection "${entry.collectionSlug}", but that collection is not declared in the schema.`,
        severity: "error",
      });
    }

    if (!entry.slug?.trim() || !entry.stableSourceId?.trim()) {
      issues.push({
        code: "missing_identity",
        detail: entry.title,
        message:
          "Every migrated entry must include a slug and stable source ID.",
        severity: "error",
      });
    }

    if (!entry.title?.trim()) {
      issues.push({
        code: "missing_title",
        detail: entry.stableSourceId,
        message: `Entry "${entry.stableSourceId}" is missing a title.`,
        severity: "error",
      });
    }

    entryStableIds.set(
      entry.stableSourceId,
      (entryStableIds.get(entry.stableSourceId) ?? 0) + 1,
    );
    const collectionSlugKey = `${entry.collectionSlug}:${entry.slug}`;
    collectionSlugsByEntry.set(
      collectionSlugKey,
      (collectionSlugsByEntry.get(collectionSlugKey) ?? 0) + 1,
    );

    for (const asset of entry.assets ?? []) {
      totalAssets += 1;
      assetStableIds.set(
        asset.stableSourceId,
        (assetStableIds.get(asset.stableSourceId) ?? 0) + 1,
      );
    }

    for (const block of entry.blocks ?? []) {
      totalBlocks += 1;
      blockStableIds.set(
        block.stableSourceId,
        (blockStableIds.get(block.stableSourceId) ?? 0) + 1,
      );
    }
  }

  pushDuplicateIssues(
    issues,
    entryStableIds,
    "duplicate_entry_stable_source_id",
    "Entry stable source ID",
  );
  pushDuplicateIssues(
    issues,
    collectionSlugsByEntry,
    "duplicate_collection_slug",
    "Entry collection/slug pair",
  );
  pushDuplicateIssues(
    issues,
    assetStableIds,
    "duplicate_asset_stable_source_id",
    "Asset stable source ID",
  );
  pushDuplicateIssues(
    issues,
    blockStableIds,
    "duplicate_block_stable_source_id",
    "Block stable source ID",
  );

  for (const [sourceTable, sourceCount] of Object.entries(sourceCounts)) {
    const collectionSlug = SOURCE_TABLE_COLLECTIONS[sourceTable];
    if (!collectionSlug || sourceCount === 0) {
      continue;
    }

    if ((collectionCounts[collectionSlug] ?? 0) === 0) {
      issues.push({
        code: "source_table_uncovered",
        detail: `${sourceTable} -> ${collectionSlug}`,
        message: `${sourceTable} has ${sourceCount} row(s), but the manifest has no entries in ${collectionSlug}.`,
        severity: "error",
      });
    }
  }

  for (const collectionSlug of CRITICAL_COLLECTIONS) {
    if ((collectionCounts[collectionSlug] ?? 0) === 0) {
      issues.push({
        code: "critical_collection_empty",
        detail: collectionSlug,
        message: `Critical migration collection "${collectionSlug}" has no entries.`,
        severity: "warning",
      });
    }
  }

  if (publicAssets.missing.length > 0) {
    issues.push({
      code: "missing_public_assets",
      detail: publicAssets.missing
        .slice(0, 10)
        .map((asset) => asset.publicPath)
        .join(", "),
      message: `${publicAssets.missing.length} local public asset(s) are missing. Apply is blocked until every linked file exists.`,
      severity: "error",
    });
  }

  if (publicAssets.present.length > 500) {
    issues.push({
      code: "large_public_asset_upload",
      detail: String(publicAssets.present.length),
      message: `${publicAssets.present.length} public assets will be checked and uploaded before apply. Run this from a stable network and avoid changing files during migration.`,
      severity: "warning",
    });
  }

  const errorCount = issues.filter(
    (issue) => issue.severity === "error",
  ).length;
  const warningCount = issues.filter(
    (issue) => issue.severity === "warning",
  ).length;

  return {
    collectionCounts,
    issueCounts: {
      errors: errorCount,
      total: issues.length,
      warnings: warningCount,
    },
    issues,
    manifestDigest,
    publicAssets: {
      missing: publicAssets.missing,
      present: publicAssets.present,
      totalBytes: publicAssets.totalBytes,
    },
    readyToApply: errorCount === 0,
    sourceCounts,
    totals: {
      assets: totalAssets,
      blocks: totalBlocks,
      entries: manifest.content.entries.length,
      publicAssets: publicAssets.present.length + publicAssets.missing.length,
      schemaCollections: manifest.schema.collections.length,
    },
  };
}

export async function buildExocorpseMigrationSnapshot() {
  const { manifest: rawManifest, sourceCounts } =
    await buildExocorpseExternalProjectManifestWithSource();
  const manifest = linkPublicFolderAssets(rawManifest);
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
    preflight: analyzeManifest({
      manifest,
      manifestDigest,
      publicAssets,
      sourceCounts,
    }),
  };
}
