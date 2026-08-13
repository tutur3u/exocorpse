import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";

export type CmsEntryCardMedia = {
  avatar?: ExocorpseCmsAsset;
  preview?: ExocorpseCmsAsset;
};

export type CmsEntryGalleryFilter = {
  entryTargetIds: Record<string, string[]>;
  label: string;
  options: Array<{ id: string; title: string }>;
};

const FILTER_RELATION_PRIORITY = [
  "story",
  "world",
  "worlds",
  "character",
  "location",
];

function hasImageSource(asset: ExocorpseCmsAsset) {
  return (
    asset.asset_type === "image" &&
    Boolean(asset.preview_url ?? asset.asset_url)
  );
}

/**
 * Pick the same visual hierarchy editors recognize from the public site.
 * Character assets are ordered profile, banner, featured; other collections
 * use their first usable image as their representative preview.
 */
export function selectCmsEntryCardMedia(
  collection: ExocorpseCmsCollection,
  assets: ExocorpseCmsAsset[],
): CmsEntryCardMedia {
  const images = assets.filter(hasImageSource).sort((left, right) => {
    return left.sort_order - right.sort_order;
  });

  if (collection.slug === "characters" && images[1]) {
    return { avatar: images[0], preview: images[1] };
  }

  return { preview: images[0] };
}

export function entryCardDescription(entry: ExocorpseCmsEntry) {
  const title = entry.title.trim().toLocaleLowerCase();
  return [entry.subtitle, entry.summary].find(
    (candidate) =>
      candidate?.trim() && candidate.trim().toLocaleLowerCase() !== title,
  );
}

export function buildCmsEntryGalleryFilter(
  studio: ExocorpseCmsStudio,
  collectionId: string,
): CmsEntryGalleryFilter | undefined {
  const definitions = (studio.relationDefinitions ?? []).filter(
    (definition) => definition.source_collection_id === collectionId,
  );
  const definition = FILTER_RELATION_PRIORITY.flatMap((key) =>
    definitions.filter((candidate) => candidate.key === key),
  )[0];
  if (!definition) return undefined;

  const targetCollectionIds = new Set(
    (studio.relationDefinitionTargets ?? [])
      .filter((target) => target.relation_definition_id === definition.id)
      .map((target) => target.target_collection_id),
  );
  const options = studio.entries
    .filter((entry) => targetCollectionIds.has(entry.collection_id))
    .sort((left, right) => left.title.localeCompare(right.title))
    .map((entry) => ({ id: entry.id, title: entry.title }));
  if (!options.length) return undefined;

  const entryTargetIds: Record<string, string[]> = {};
  for (const relation of studio.relations ?? []) {
    if (relation.relation_definition_id !== definition.id) continue;
    entryTargetIds[relation.from_entry_id] = [
      ...(entryTargetIds[relation.from_entry_id] ?? []),
      relation.to_entry_id,
    ];
  }

  return { entryTargetIds, label: definition.label, options };
}
