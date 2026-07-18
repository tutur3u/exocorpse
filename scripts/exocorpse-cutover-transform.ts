type JsonObject = Record<string, unknown>;

type LegacyAsset = {
  altText?: string | null;
  assetType: string;
  metadata?: JsonObject;
  sortOrder?: number;
  sourceUrl?: string | null;
  stableSourceId?: string;
};

type LegacyEntry = {
  assets?: LegacyAsset[];
  blocks?: Array<{
    blockType: string;
    content: JsonObject;
    sortOrder?: number;
    stableSourceId?: string | null;
    title?: string | null;
  }>;
  collectionSlug: string;
  metadata?: JsonObject;
  profileData?: JsonObject;
  scheduledFor?: string | null;
  slug: string;
  sortOrder?: number;
  stableSourceId: string;
  status?: "archived" | "draft" | "published" | "scheduled";
  subtitle?: string | null;
  summary?: string | null;
  title: string;
};

type LegacySnapshot = {
  manifest?: {
    content?: { entries?: LegacyEntry[] };
  };
};

type CutoverRelation = {
  definitionKey: string;
  metadata?: JsonObject;
  sortOrder?: number;
  targetStableSourceId: string;
};

type CutoverEntry = {
  assets: Array<{
    altText?: string | null;
    assetType: string;
    managed: boolean;
    metadata: JsonObject;
    sortOrder: number;
    sourceUrl: string;
  }>;
  blocks: NonNullable<LegacyEntry["blocks"]>;
  entry: {
    collectionSlug: string;
    metadata: JsonObject;
    profileData: JsonObject;
    scheduledFor?: string | null;
    slug: string;
    sortOrder: number;
    stableSourceId: string;
    status: "archived" | "draft" | "published" | "scheduled";
    subtitle?: string | null;
    summary?: string | null;
    title: string;
  };
  relations: CutoverRelation[];
};

export type ExocorpseCutoverExport = {
  entries: CutoverEntry[];
  expected: {
    assets: number;
    blacklist: number;
    entries: number;
    orphanedPureRelations: number;
    relations: number;
    retiredEntries: number;
  };
};

const RETIRED_COLLECTIONS = new Set([
  "character-worlds",
  "cofi-samples",
  "commission-service-addons",
  "entity-tags",
]);

// The user approved these content exceptions after recovery attempts against
// production, rollback deployments, Git history, Internet Archive, legacy
// storage, and public search found no original bytes.
export const APPROVED_MISSING_ASSET_IDS = new Set([
  "exocorpse:faction:5f685a3e-224f-496f-b83e-3d8bbae47efa:logo",
  "exocorpse:faction:7dcee38e-5d0c-4c2d-ac8a-afb431957723:logo",
  "exocorpse:character-gallery:ee4c2cc2-149e-4f68-881e-a28c421d467b:image",
]);

const RELATION_METADATA_KEYS = new Set([
  "characterAId",
  "characterBId",
  "characterId",
  "entityId",
  "entityType",
  "eventId",
  "eventTypeId",
  "factionId",
  "imageAssetId",
  "locationId",
  "outfitTypeId",
  "parentFactionId",
  "parentLocationId",
  "relationshipTypeId",
  "sceneId",
  "serviceId",
  "storyId",
  "styleId",
  "tagId",
  "targetSceneId",
  "timelineId",
  "worldId",
]);

const SHORT_FIELD_GRAPHEME_LIMIT = 280;
const graphemeSegmenter = new Intl.Segmenter("en", {
  granularity: "grapheme",
});

const directRelationSpecs = [
  ["worlds", "story", "stories", "storyId"],
  ["outfit-types", "story", "stories", "storyId"],
  ["event-types", "story", "stories", "storyId"],
  ["factions", "world", "worlds", "worldId"],
  ["factions", "parent", "factions", "parentFactionId"],
  ["locations", "world", "worlds", "worldId"],
  ["locations", "parent", "locations", "parentLocationId"],
  ["location-gallery", "location", "locations", "locationId"],
  ["character-outfits", "character", "characters", "characterId"],
  ["character-outfits", "type", "outfit-types", "outfitTypeId"],
  ["character-gallery", "character", "characters", "characterId"],
  ["character-relationships", "character-a", "characters", "characterAId"],
  ["character-relationships", "character-b", "characters", "characterBId"],
  [
    "character-relationships",
    "type",
    "relationship-types",
    "relationshipTypeId",
  ],
  ["character-factions", "character", "characters", "characterId"],
  ["character-factions", "faction", "factions", "factionId"],
  ["character-locations", "character", "characters", "characterId"],
  ["character-locations", "location", "locations", "locationId"],
  ["commission-styles", "service", "commission-services", "serviceId"],
  ["commission-pictures", "service", "commission-services", "serviceId"],
  ["commission-pictures", "style", "commission-styles", "styleId"],
  ["heaven-space-scenes", "image", "heaven-space-assets", "imageAssetId"],
  ["heaven-space-scene-choices", "scene", "heaven-space-scenes", "sceneId"],
  [
    "heaven-space-scene-choices",
    "next-scene",
    "heaven-space-scenes",
    "targetSceneId",
  ],
  ["timelines", "world", "worlds", "worldId"],
  ["events", "timeline", "timelines", "timelineId"],
  ["events", "type", "event-types", "eventTypeId"],
  ["events", "world", "worlds", "worldId"],
  ["events", "location", "locations", "locationId"],
  ["event-participants", "event", "events", "eventId"],
  ["event-participants", "character", "characters", "characterId"],
  ["event-factions", "event", "events", "eventId"],
  ["event-factions", "faction", "factions", "factionId"],
] as const;

function record(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function identifier(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : null;
}

function isManagedSource(sourceUrl: string) {
  const hostname = new URL(sourceUrl).hostname.toLowerCase();
  return hostname === "exocorpse.net" || hostname.endsWith(".exocorpse.net");
}

function stripRelationMetadata(value: unknown) {
  return Object.fromEntries(
    Object.entries(record(value)).filter(
      ([key]) => !RELATION_METADATA_KEYS.has(key),
    ),
  );
}

function fitShortField(value: string | null | undefined) {
  if (!value) return value ?? null;
  const graphemes = Array.from(
    graphemeSegmenter.segment(value),
    (segment) => segment.segment,
  );
  if (graphemes.length <= SHORT_FIELD_GRAPHEME_LIMIT) return value;
  return `${graphemes.slice(0, SHORT_FIELD_GRAPHEME_LIMIT - 1).join("")}…`;
}

function normalizeEntrySummary(entry: LegacyEntry) {
  const summary = entry.summary ?? null;
  const fittedSummary = fitShortField(summary);
  const blocks = [...(entry.blocks ?? [])];

  if (summary && fittedSummary !== summary) {
    const isAlreadyPreserved = blocks.some(
      (block) =>
        block.blockType === "markdown" &&
        typeof block.content.markdown === "string" &&
        block.content.markdown.includes(summary),
    );

    if (!isAlreadyPreserved) {
      const nextSortOrder =
        Math.max(-1, ...blocks.map((block) => block.sortOrder ?? 0)) + 1;
      blocks.push({
        blockType: "markdown",
        content: { markdown: summary },
        sortOrder: nextSortOrder,
        stableSourceId: `${entry.stableSourceId}:legacy-summary`,
        title: "Legacy summary",
      });
    }
  }

  return {
    blocks: blocks.map((block, sortOrder) => ({ ...block, sortOrder })),
    summary: fittedSummary,
  };
}

const MARKDOWN_IMAGE_PATTERN =
  /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;

function markdownImageAssets(
  entry: LegacyEntry,
  blocks: NonNullable<LegacyEntry["blocks"]>,
): CutoverEntry["assets"] {
  const assets: CutoverEntry["assets"] = [];
  const seenSources = new Set<string>();

  for (const block of blocks) {
    const markdown = block.content.markdown;
    if (block.blockType !== "markdown" || typeof markdown !== "string") {
      continue;
    }

    for (const match of markdown.matchAll(MARKDOWN_IMAGE_PATTERN)) {
      const rawSource = match[2];
      if (!rawSource || rawSource.startsWith("data:")) continue;

      const legacyStoragePath = /^https?:\/\//i.test(rawSource)
        ? null
        : rawSource.replace(/^\/+/, "");
      const sourceUrl = legacyStoragePath
        ? `https://exocorpse.net/api/storage/legacy-asset?path=${encodeURIComponent(legacyStoragePath)}`
        : rawSource;
      if (seenSources.has(sourceUrl)) continue;
      seenSources.add(sourceUrl);

      assets.push({
        altText: match[1] || entry.title,
        assetType: "inline-image",
        managed: isManagedSource(sourceUrl),
        metadata: {
          legacyMarkdownSource: rawSource,
          legacyStableSourceId: `${entry.stableSourceId}:inline-image:${assets.length}`,
          ...(legacyStoragePath
            ? {
                legacyStoragePath,
                sourceStoragePath: legacyStoragePath,
              }
            : {}),
        },
        sortOrder: assets.length,
        sourceUrl,
      });
    }
  }

  return assets;
}

export function transformExocorpseCutoverExport(
  value: unknown,
): ExocorpseCutoverExport {
  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as ExocorpseCutoverExport).entries)
  ) {
    return value as ExocorpseCutoverExport;
  }

  const legacyEntries = (value as LegacySnapshot)?.manifest?.content?.entries;
  if (!Array.isArray(legacyEntries)) {
    throw new Error("Cutover input must contain a legacy manifest or entries.");
  }

  const retained = legacyEntries.filter(
    (entry) => !RETIRED_COLLECTIONS.has(entry.collectionSlug),
  );
  const targetByIdentity = new Map<string, string>();
  for (const entry of retained) {
    const identities = new Set([
      entry.stableSourceId,
      entry.stableSourceId.split(":").at(-1) ?? "",
      identifier(entry.metadata?.sourceId) ?? "",
    ]);
    for (const identity of identities) {
      if (identity) {
        targetByIdentity.set(
          `${entry.collectionSlug}:${identity}`,
          entry.stableSourceId,
        );
      }
    }
  }

  const relationsBySource = new Map<string, CutoverRelation[]>();
  let orphanedPureRelations = 0;
  const addRelation = ({
    allowMissingTarget = false,
    definitionKey,
    metadata,
    rawTargetId,
    sourceStableSourceId,
    targetCollectionSlug,
  }: {
    allowMissingTarget?: boolean;
    definitionKey: string;
    metadata?: JsonObject;
    rawTargetId: unknown;
    sourceStableSourceId: string;
    targetCollectionSlug: string;
  }) => {
    const targetId = identifier(rawTargetId);
    if (!targetId) return false;
    const targetStableSourceId = targetByIdentity.get(
      `${targetCollectionSlug}:${targetId}`,
    );
    if (!targetStableSourceId) {
      if (allowMissingTarget) return false;
      throw new Error(
        `Unresolved ${definitionKey} target ${targetCollectionSlug}:${targetId}`,
      );
    }
    const relations = relationsBySource.get(sourceStableSourceId) ?? [];
    const duplicate = relations.some(
      (relation) =>
        relation.definitionKey === definitionKey &&
        relation.targetStableSourceId === targetStableSourceId,
    );
    if (!duplicate) {
      relations.push({ definitionKey, metadata, targetStableSourceId });
      relationsBySource.set(sourceStableSourceId, relations);
    }
    return true;
  };

  for (const [
    sourceCollection,
    key,
    targetCollection,
    metadataKey,
  ] of directRelationSpecs) {
    for (const entry of retained.filter(
      (candidate) => candidate.collectionSlug === sourceCollection,
    )) {
      addRelation({
        definitionKey: key,
        rawTargetId: entry.metadata?.[metadataKey],
        sourceStableSourceId: entry.stableSourceId,
        targetCollectionSlug: targetCollection,
      });
    }
  }

  for (const link of legacyEntries.filter(
    (entry) => entry.collectionSlug === "character-worlds",
  )) {
    const source = targetByIdentity.get(
      `characters:${identifier(link.metadata?.characterId) ?? ""}`,
    );
    if (!source) {
      orphanedPureRelations += 1;
      continue;
    }
    const added = addRelation({
      allowMissingTarget: true,
      definitionKey: "worlds",
      rawTargetId: link.metadata?.worldId,
      sourceStableSourceId: source,
      targetCollectionSlug: "worlds",
    });
    if (!added) orphanedPureRelations += 1;
  }

  for (const link of legacyEntries.filter(
    (entry) => entry.collectionSlug === "commission-service-addons",
  )) {
    const source = targetByIdentity.get(
      `commission-services:${identifier(link.metadata?.serviceId) ?? ""}`,
    );
    if (!source) {
      orphanedPureRelations += 1;
      continue;
    }
    const added = addRelation({
      allowMissingTarget: true,
      definitionKey: "addons",
      metadata: {
        addonIsExclusive: link.profileData?.addonIsExclusive ?? false,
      },
      rawTargetId: link.metadata?.addonId,
      sourceStableSourceId: source,
      targetCollectionSlug: "commission-addons",
    });
    if (!added) orphanedPureRelations += 1;
  }

  const entityTypeCollections: Record<string, string> = {
    character: "characters",
    story: "stories",
  };
  for (const link of legacyEntries.filter(
    (entry) => entry.collectionSlug === "entity-tags",
  )) {
    const entityType = identifier(link.metadata?.entityType) ?? "";
    const sourceCollection = entityTypeCollections[entityType];
    if (!sourceCollection)
      throw new Error(`Unsupported tagged entity: ${entityType}`);
    const source = targetByIdentity.get(
      `${sourceCollection}:${identifier(link.metadata?.entityId) ?? ""}`,
    );
    if (!source) {
      orphanedPureRelations += 1;
      continue;
    }
    const added = addRelation({
      allowMissingTarget: true,
      definitionKey: "tags",
      rawTargetId: link.metadata?.tagId,
      sourceStableSourceId: source,
      targetCollectionSlug: "tags",
    });
    if (!added) orphanedPureRelations += 1;
  }

  const entries = retained.map((entry): CutoverEntry => {
    const profileData = { ...record(entry.profileData) };
    const normalizedSummary = normalizeEntrySummary(entry);
    if (entry.collectionSlug === "commission-blacklist") {
      profileData.reasoning = entry.summary ?? "No reasoning supplied";
    }
    if (entry.collectionSlug === "heaven-space-passages") {
      profileData.name = profileData.name ?? entry.title;
    }

    const assets: CutoverEntry["assets"] = (entry.assets ?? []).flatMap(
      (asset) => {
        if (
          asset.stableSourceId &&
          APPROVED_MISSING_ASSET_IDS.has(asset.stableSourceId)
        ) {
          return [];
        }
        if (!asset.sourceUrl || !/^https?:\/\//i.test(asset.sourceUrl)) {
          throw new Error(
            `Asset has no HTTP(S) source: ${entry.stableSourceId}`,
          );
        }
        return [
          {
            altText: asset.altText ?? null,
            assetType: asset.assetType,
            managed: isManagedSource(asset.sourceUrl),
            metadata: {
              ...record(asset.metadata),
              legacyStableSourceId: asset.stableSourceId ?? null,
            },
            sortOrder: asset.sortOrder ?? 0,
            sourceUrl: asset.sourceUrl,
          },
        ];
      },
    );
    const knownAssetSources = new Set(assets.map((asset) => asset.sourceUrl));
    for (const inlineAsset of markdownImageAssets(
      entry,
      normalizedSummary.blocks,
    )) {
      if (knownAssetSources.has(inlineAsset.sourceUrl)) continue;
      knownAssetSources.add(inlineAsset.sourceUrl);
      assets.push({ ...inlineAsset, sortOrder: assets.length });
    }

    return {
      assets,
      blocks: normalizedSummary.blocks,
      entry: {
        collectionSlug: entry.collectionSlug,
        metadata: stripRelationMetadata(entry.metadata),
        profileData,
        scheduledFor: entry.scheduledFor ?? null,
        slug: entry.slug,
        sortOrder: entry.sortOrder ?? 0,
        stableSourceId: entry.stableSourceId,
        status: entry.status ?? "published",
        subtitle: entry.subtitle ?? null,
        summary: normalizedSummary.summary,
        title: entry.title,
      },
      relations: relationsBySource.get(entry.stableSourceId) ?? [],
    };
  });
  const assets = entries.flatMap((entry) => entry.assets);
  const relations = entries.flatMap((entry) => entry.relations);

  return {
    entries,
    expected: {
      assets: assets.length,
      blacklist: entries.filter(
        (entry) => entry.entry.collectionSlug === "commission-blacklist",
      ).length,
      entries: entries.length,
      orphanedPureRelations,
      relations: relations.length,
      retiredEntries: legacyEntries.length - entries.length,
    },
  };
}

if (import.meta.main) {
  const [inputPath, outputPath] = Bun.argv.slice(2);
  if (!inputPath || !outputPath) {
    throw new Error(
      "Usage: bun scripts/exocorpse-cutover-transform.ts <legacy-export.json> <cutover-export.json>",
    );
  }

  const transformed = transformExocorpseCutoverExport(
    await Bun.file(inputPath).json(),
  );
  await Bun.write(outputPath, `${JSON.stringify(transformed, null, 2)}\n`);
}
