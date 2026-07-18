import type {
  CmsBlockDraft,
  CmsBlockSource,
  CmsEntryDraft,
  CmsRelationSelections,
  CmsSavePayload,
} from "@/components/admin/cms-management/editor-types";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
  ExocorpseJson,
} from "@/types/exocorpse-cms";

export function shouldBypassImageOptimization(asset: ExocorpseCmsAsset) {
  if (asset.preview_url?.startsWith("/api/admin/cms/assets/")) return true;

  return [
    asset.alt_text,
    asset.asset_url,
    asset.preview_url,
    asset.source_url,
    asset.storage_path,
  ].some((value) => value && /\.svg(?:$|[?#])/i.test(value));
}

export function isJsonRecord(
  value: ExocorpseJson | undefined,
): value is Record<string, ExocorpseJson | undefined> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function jsonRecord(value: ExocorpseJson) {
  return isJsonRecord(value) ? value : {};
}

export function emptyEntry(collectionId: string): CmsEntryDraft {
  return {
    collection_id: collectionId,
    id: "",
    metadata: {},
    profile_data: {},
    scheduled_for: null,
    slug: "",
    sort_order: 0,
    status: "draft",
    subtitle: null,
    summary: null,
    title: "",
    updated_at: new Date().toISOString(),
  };
}

export function entryDraft(
  entry: ExocorpseCmsEntry | null,
  collectionId: string,
) {
  if (!entry) return emptyEntry(collectionId);
  return {
    collection_id: entry.collection_id,
    id: entry.id,
    metadata: entry.metadata,
    profile_data: entry.profile_data,
    scheduled_for: entry.scheduled_for,
    slug: entry.slug,
    sort_order: entry.sort_order,
    status: entry.status,
    subtitle: entry.subtitle,
    summary: entry.summary,
    title: entry.title,
    updated_at: entry.updated_at,
  } satisfies CmsEntryDraft;
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function humanizeField(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function collectionConfig(
  collection: ExocorpseCmsCollection | undefined,
) {
  const config = isJsonRecord(collection?.config) ? collection.config : {};
  return {
    assetTypes: Array.isArray(config.assetTypes)
      ? config.assetTypes.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    blockTypes: Array.isArray(config.blockTypes)
      ? config.blockTypes.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
  };
}

export function blocksToDrafts(blocks: CmsBlockSource[]): CmsBlockDraft[] {
  return [...blocks]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((block) => ({
      blockType: block.block_type,
      contentText:
        block.block_type === "markdown" &&
        isJsonRecord(block.content) &&
        typeof block.content.markdown === "string"
          ? block.content.markdown
          : JSON.stringify(block.content, null, 2),
      id: block.id,
      key: block.id,
      sortOrder: block.sort_order,
      stableSourceId: block.stable_source_id,
      title: block.title ?? "",
    }));
}

export function newBlock(blockType: string, index: number): CmsBlockDraft {
  return {
    blockType,
    contentText: blockType === "markdown" ? "" : "{}",
    key: crypto.randomUUID(),
    sortOrder: index,
    title: "",
  };
}

function blockContent(block: CmsBlockDraft): ExocorpseJson {
  if (block.blockType === "markdown") {
    return { markdown: block.contentText };
  }
  const parsed = JSON.parse(block.contentText) as ExocorpseJson;
  if (!isJsonRecord(parsed)) {
    throw new Error(
      `${humanizeField(block.blockType)} content must be a JSON object.`,
    );
  }
  return parsed;
}

export function initialRelationSelections(
  studio: ExocorpseCmsStudio,
  entryId: string,
  definitions: ExocorpseCmsRelationDefinition[],
): CmsRelationSelections {
  return Object.fromEntries(
    definitions.map((definition) => [
      definition.id,
      (studio.relations ?? [])
        .filter(
          (relation) =>
            relation.from_entry_id === entryId &&
            relation.relation_definition_id === definition.id,
        )
        .sort((left, right) => left.sort_order - right.sort_order)
        .map((relation) => relation.to_entry_id),
    ]),
  );
}

export function buildSavePayload({
  blocks,
  definitions,
  draft,
  relationSelections,
}: {
  blocks: CmsBlockDraft[];
  definitions: ExocorpseCmsRelationDefinition[];
  draft: CmsEntryDraft;
  relationSelections: CmsRelationSelections;
}): CmsSavePayload {
  return {
    blocks: blocks.map((block, sortOrder) => ({
      blockType: block.blockType,
      content: blockContent(block),
      id: block.id,
      sortOrder,
      stableSourceId: block.stableSourceId,
      title: block.title.trim() || null,
    })),
    entry: {
      collectionId: draft.collection_id,
      metadata: draft.metadata,
      profileData: draft.profile_data,
      scheduledFor: draft.status === "scheduled" ? draft.scheduled_for : null,
      slug: draft.slug.trim(),
      sortOrder: draft.sort_order,
      status: draft.status,
      subtitle: draft.subtitle?.trim() || null,
      summary: draft.summary?.trim() || null,
      title: draft.title.trim(),
    },
    relations: definitions.flatMap((definition) =>
      (relationSelections[definition.id] ?? []).map((toEntryId, sortOrder) => ({
        definitionId: definition.id,
        sortOrder,
        toEntryId,
      })),
    ),
  };
}
