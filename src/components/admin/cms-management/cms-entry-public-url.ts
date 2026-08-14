import type {
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";

export const EXOCORPSE_PRODUCTION_ORIGIN = "https://exocorpse.net";

function collectionId(studio: ExocorpseCmsStudio, slug: string) {
  return studio.collections.find((collection) => collection.slug === slug)?.id;
}

function relatedEntry(
  studio: ExocorpseCmsStudio,
  source: ExocorpseCmsEntry,
  relationKey: string,
) {
  const definition = studio.relationDefinitions?.find(
    (item) =>
      item.source_collection_id === source.collection_id &&
      item.key === relationKey,
  );
  if (!definition) return undefined;
  const relation = studio.relations?.find(
    (item) =>
      item.relation_definition_id === definition.id &&
      item.from_entry_id === source.id,
  );
  return studio.entries.find((entry) => entry.id === relation?.to_entry_id);
}

function wikiContext(
  studio: ExocorpseCmsStudio,
  collectionSlug: string,
  entry: ExocorpseCmsEntry,
) {
  const world =
    collectionSlug === "worlds"
      ? entry
      : collectionSlug === "characters"
        ? relatedEntry(studio, entry, "worlds")
        : collectionSlug === "factions" || collectionSlug === "locations"
          ? relatedEntry(studio, entry, "world")
          : undefined;
  const story = world ? relatedEntry(studio, world, "story") : undefined;
  return { story, world };
}

export function cmsEntryPublicPath(
  collectionSlug: string,
  entry: ExocorpseCmsEntry,
  studio?: ExocorpseCmsStudio,
): string | undefined {
  const slug = encodeURIComponent(entry.slug);
  if (collectionSlug === "blog-posts") return `/?blog-post=${slug}`;
  if (collectionSlug === "portfolio-art")
    return `/?portfolio-tab=art&portfolio-piece=${slug}`;
  if (collectionSlug === "portfolio-writing")
    return `/?portfolio-tab=writing&portfolio-piece=${slug}`;
  if (collectionSlug === "portfolio-games")
    return `/?portfolio-tab=games&portfolio-piece=${slug}`;
  if (collectionSlug === "commission-services")
    return `/?commission-tab=services&service=${slug}`;
  if (collectionSlug === "stories") return `/?story=${slug}`;
  if (!studio) return undefined;

  if (
    ["worlds", "characters", "factions", "locations"].includes(collectionSlug)
  ) {
    const { story, world } = wikiContext(studio, collectionSlug, entry);
    if (!story) return undefined;
    const search = new URLSearchParams({ story: story.slug });
    if (collectionSlug === "worlds") search.set("world", entry.slug);
    if (collectionSlug === "characters") search.set("character", entry.slug);
    if (collectionSlug === "factions") search.set("faction", entry.slug);
    if (collectionSlug === "locations") {
      if (!world) return undefined;
      search.set("world", world.slug);
      search.set("location", entry.slug);
    }
    return `/?${search.toString()}`;
  }

  if (collectionSlug === "character-gallery") {
    const character = relatedEntry(studio, entry, "character");
    return character
      ? cmsEntryPublicPath("characters", character, studio)
      : undefined;
  }

  // Guard against accidentally treating an entry from an unrelated collection
  // as a wiki entity when a studio snapshot is incomplete.
  if (!collectionId(studio, collectionSlug)) return undefined;
  return undefined;
}

export function productionUrl(path: string) {
  return new URL(path, EXOCORPSE_PRODUCTION_ORIGIN).toString();
}
