import { stat } from "node:fs/promises";
import { basename, resolve, sep } from "node:path";
import { posix } from "node:path";

type MigrationAsset = {
  assetType?: string | null;
  metadata?: Record<string, unknown>;
  publicPath?: string | null;
  sourceUrl?: string | null;
  stableSourceId?: string | null;
  storagePath?: string | null;
};

type MigrationBlock = {
  stableSourceId: string;
};

type MigrationEntry = {
  assets?: MigrationAsset[];
  blocks?: MigrationBlock[];
  collectionSlug: string;
  metadata?: Record<string, unknown>;
  slug: string;
  stableSourceId: string;
  title: string;
};

export type MigrationManifest = {
  content: {
    entries: MigrationEntry[];
  };
  schema: {
    collections: Array<{
      slug: string;
    }>;
  };
};

export type MigrationIssue = {
  code: string;
  detail?: string;
  message: string;
  severity: "error" | "warning";
};

export type PublicAssetFile = {
  assetType: string | null;
  collectionSlug: string;
  entrySlug: string;
  entryStableSourceId: string | null;
  entryTitle: string | null;
  expectedFilePath: string;
  filename: string;
  mtimeMs?: number;
  publicPath: string;
  size?: number;
  sourceMetadata: {
    asset: Record<string, unknown>;
    entry: Record<string, unknown>;
    sourceId: string | number | null;
    sourceTable: string | null;
  };
  stableSourceId: string | null;
  storagePath: string | null;
};

export type PublicAssetInspection = {
  missing: PublicAssetFile[];
  present: PublicAssetFile[];
  totalBytes: number;
};

export type ExocorpseSourceTableCounts = Record<string, number>;

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

function getAssetPublicPath(asset: MigrationAsset) {
  const metadata = asset.metadata ?? {};

  return (
    normalizePublicPath(asset.publicPath) ??
    normalizePublicPath(metadata.publicPath) ??
    normalizePublicPath(metadata.localAssetPath) ??
    normalizePublicPath(metadata.sourcePublicPath) ??
    normalizePublicPath(asset.sourceUrl)
  );
}

export function resolvePublicFilePath(publicDir: string, publicPath: string) {
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

function getSourceId(metadata: Record<string, unknown>) {
  const value = metadata.sourceId;
  return typeof value === "string" || typeof value === "number" ? value : null;
}

function getSourceTable(metadata: Record<string, unknown>) {
  const value = metadata.sourceTable;
  return typeof value === "string" ? value : null;
}

function createAssetFile({
  asset,
  entry,
  publicDir,
  publicPath,
}: {
  asset: MigrationAsset;
  entry: MigrationEntry;
  publicDir: string;
  publicPath: string;
}): PublicAssetFile {
  const entryMetadata = entry.metadata ?? {};
  const assetMetadata = asset.metadata ?? {};

  return {
    assetType: asset.assetType ?? null,
    collectionSlug: entry.collectionSlug,
    entrySlug: entry.slug,
    entryStableSourceId: entry.stableSourceId ?? null,
    entryTitle: entry.title ?? null,
    expectedFilePath: resolvePublicFilePath(publicDir, publicPath),
    filename: basename(publicPath),
    publicPath,
    sourceMetadata: {
      asset: assetMetadata,
      entry: entryMetadata,
      sourceId: getSourceId(entryMetadata),
      sourceTable: getSourceTable(entryMetadata),
    },
    stableSourceId: asset.stableSourceId ?? null,
    storagePath: asset.storagePath ?? null,
  };
}

export async function inspectPublicAssets(
  manifest: MigrationManifest,
  publicDir = resolve(/* turbopackIgnore: true */ process.cwd(), "public"),
): Promise<PublicAssetInspection> {
  const present: PublicAssetFile[] = [];
  const missing: PublicAssetFile[] = [];

  for (const entry of manifest.content.entries) {
    for (const asset of entry.assets ?? []) {
      const publicPath = getAssetPublicPath(asset);

      if (!publicPath) {
        continue;
      }

      const assetFile = createAssetFile({
        asset,
        entry,
        publicDir,
        publicPath,
      });

      try {
        const fileStat = await stat(
          /* turbopackIgnore: true */ assetFile.expectedFilePath,
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

export function analyzeExocorpseMigrationManifest({
  manifest,
  manifestDigest,
  publicAssets,
  sourceCounts,
}: {
  manifest: MigrationManifest;
  manifestDigest: string;
  publicAssets: PublicAssetInspection;
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
      if (asset.stableSourceId) {
        assetStableIds.set(
          asset.stableSourceId,
          (assetStableIds.get(asset.stableSourceId) ?? 0) + 1,
        );
      }
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

function csvValue(value: unknown) {
  const stringValue =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

  return `"${stringValue.replace(/"/g, '""')}"`;
}

export function formatMissingPublicAssetsCsv(assets: PublicAssetFile[]) {
  const headers = [
    "collection_slug",
    "entry_slug",
    "entry_title",
    "entry_stable_source_id",
    "asset_stable_source_id",
    "asset_type",
    "public_path",
    "expected_file_path",
    "storage_path",
    "source_table",
    "source_id",
    "entry_metadata",
    "asset_metadata",
  ];
  const rows = assets.map((asset) =>
    [
      asset.collectionSlug,
      asset.entrySlug,
      asset.entryTitle,
      asset.entryStableSourceId,
      asset.stableSourceId,
      asset.assetType,
      asset.publicPath,
      asset.expectedFilePath,
      asset.storagePath,
      asset.sourceMetadata.sourceTable,
      asset.sourceMetadata.sourceId,
      asset.sourceMetadata.entry,
      asset.sourceMetadata.asset,
    ]
      .map(csvValue)
      .join(","),
  );

  return `${headers.map(csvValue).join(",")}\n${rows.join("\n")}${
    rows.length > 0 ? "\n" : ""
  }`;
}
