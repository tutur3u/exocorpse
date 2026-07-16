import "server-only";

import {
  getExocorpseApiBaseUrl,
  getExocorpseWorkspaceId,
} from "@/lib/exocorpse-config";
import { DEFAULT_ABOUT_SETTINGS, type AboutPageData } from "@/lib/about";
import {
  type DeliverySourceCollection,
  restoreLoadingEntryStableSourceIds,
} from "@/lib/tuturuuu-cms-delivery-normalization";
import { cacheLife, cacheTag } from "next/cache";
import type { Json, Tables } from "../../supabase/types";

type CmsAsset = {
  assetId: string;
  assetType: string;
  assetUrl: string | null;
  altText: string | null;
  metadata: Record<string, unknown>;
  sortOrder: number;
};

type CmsEntry = {
  entryId: string;
  collectionSlug: string;
  stableSourceId: string | null;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  publishedAt: string | null;
  bodyMarkdown: string | null;
  blocks: Array<{
    blockType: string;
    content: Record<string, unknown>;
    sortOrder: number;
    title: string | null;
  }>;
  assets: CmsAsset[];
  profileData: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

type CmsCollection = {
  collectionId: string;
  collectionType: string;
  description: string | null;
  entries: CmsEntry[];
  slug: string;
  title: string;
};

type ExocorpseLoadingData = {
  adapter: "exocorpse";
  collections: Record<string, CmsCollection>;
};

type CmsServiceWithDetails = Tables<"services"> & {
  addons?: Tables<"addons">[];
  styles?: Array<Tables<"styles"> & { pictures?: Tables<"pictures">[] }>;
  pictures?: Tables<"pictures">[];
  service_addons?: Array<
    Tables<"service_addons"> & { addons?: Tables<"addons"> }
  >;
};

type DeliveryPayload = {
  adapter: string;
  collections?: DeliverySourceCollection[];
  loadingData?: ExocorpseLoadingData | null;
};

const EPOCH = "1970-01-01T00:00:00.000Z";
export const EXOCORPSE_CMS_CACHE_TAG = "exocorpse-cms-delivery";

function isCmsDeliveryDisabled() {
  const value = process.env.TUTURUUU_EXOCORPSE_CMS_DELIVERY;

  return value
    ? ["0", "false", "no", "off"].includes(value.trim().toLowerCase())
    : false;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function stringValue(record: Record<string, unknown>, key: string) {
  return asString(record[key]);
}

function numberValue(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function booleanValue(record: Record<string, unknown>, key: string) {
  return typeof record[key] === "boolean" ? record[key] : null;
}

function stringArrayValue(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : null;
}

function legacyId(entry: CmsEntry) {
  const sourceId = stringValue(entry.metadata, "sourceId");
  if (sourceId) {
    return sourceId;
  }

  const parts = entry.stableSourceId?.split(":") ?? [];
  return parts.length > 2 ? parts.slice(2).join(":") : entry.entryId;
}

function firstAssetUrl(entry: CmsEntry, assetType = "image") {
  return (
    entry.assets.find((asset) => asset.assetType === assetType)?.assetUrl ??
    null
  );
}

function markdownBlock(entry: CmsEntry, title: string) {
  const normalizedTitle = title.toLowerCase();
  const block = entry.blocks.find(
    (candidate) =>
      candidate.blockType === "markdown" &&
      candidate.title?.toLowerCase() === normalizedTitle,
  );

  return asString(block?.content.markdown);
}

function secondAssetUrl(entry: CmsEntry, assetType = "image") {
  return (
    entry.assets.filter((asset) => asset.assetType === assetType)[1]
      ?.assetUrl ?? null
  );
}

function dateValue(value: string | null | undefined) {
  return value ?? EPOCH;
}

function isVisiblePublishedDate(value: string | null) {
  if (!value) {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= Date.now();
}

function sortByDisplayOrder<T extends { display_order?: number | null }>(
  entries: T[],
) {
  return [...entries].sort(
    (left, right) => (left.display_order ?? 0) - (right.display_order ?? 0),
  );
}

function isPublished(entry: CmsEntry) {
  return entry.status === "published";
}

function filenameFromPath(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  const filename = value.split("?")[0]?.split("/").filter(Boolean).pop();
  return filename || fallback;
}

function extensionFromFilename(filename: string) {
  return filename.includes(".") ? (filename.split(".").pop() ?? "") : "";
}

export async function getExocorpseCmsDelivery() {
  "use cache";

  cacheLife({
    stale: 300,
    revalidate: 60,
    expire: 86400,
  });
  cacheTag(EXOCORPSE_CMS_CACHE_TAG);

  if (isCmsDeliveryDisabled()) {
    return null;
  }

  try {
    const workspaceId = getExocorpseWorkspaceId();
    const apiBaseUrl = getExocorpseApiBaseUrl().replace(/\/+$/, "");
    const response = await fetch(
      `${apiBaseUrl}/workspaces/${encodeURIComponent(
        workspaceId,
      )}/external-projects/delivery`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as DeliveryPayload;
    if (
      payload.adapter !== "exocorpse" ||
      payload.loadingData?.adapter !== "exocorpse"
    ) {
      return null;
    }

    return restoreLoadingEntryStableSourceIds(
      payload.loadingData,
      payload.collections ?? [],
    );
  } catch {
    return null;
  }
}

export async function getExocorpseCmsCollection(slug: string) {
  const delivery = await getExocorpseCmsDelivery();
  return delivery?.collections[slug] ?? null;
}

export async function getExocorpseCmsEntries(slug: string) {
  const collection = await getExocorpseCmsCollection(slug);
  return collection?.entries.filter(isPublished) ?? null;
}

export async function getCmsAboutPageData(): Promise<AboutPageData | null> {
  const [settingsEntries, contentEntries, faqEntries] = await Promise.all([
    getExocorpseCmsEntries("about"),
    getExocorpseCmsEntries("about-content"),
    getExocorpseCmsEntries("about-faqs"),
  ]);

  if (!settingsEntries && !contentEntries && !faqEntries) {
    return null;
  }

  const settingsEntry = settingsEntries?.find(
    (entry) => entry.slug === "settings",
  );
  const settingsProfile = asRecord(settingsEntry?.profileData);
  const settings = settingsEntry
    ? ({
        ...DEFAULT_ABOUT_SETTINGS,
        about_use_heading:
          stringValue(settingsProfile, "aboutUseHeading") ??
          DEFAULT_ABOUT_SETTINGS.about_use_heading,
        created_at: EPOCH,
        dni_intro:
          stringValue(settingsProfile, "dniIntro") ??
          DEFAULT_ABOUT_SETTINGS.dni_intro,
        dni_title:
          stringValue(settingsProfile, "dniTitle") ??
          DEFAULT_ABOUT_SETTINGS.dni_title,
        experiences_heading:
          stringValue(settingsProfile, "experiencesHeading") ??
          DEFAULT_ABOUT_SETTINGS.experiences_heading,
        faq_intro:
          stringValue(settingsProfile, "faqIntro") ??
          DEFAULT_ABOUT_SETTINGS.faq_intro,
        faq_title:
          stringValue(settingsProfile, "faqTitle") ??
          DEFAULT_ABOUT_SETTINGS.faq_title,
        favorites_heading:
          stringValue(settingsProfile, "favoritesHeading") ??
          DEFAULT_ABOUT_SETTINGS.favorites_heading,
        hero_bio: settingsEntry.bodyMarkdown ?? settingsEntry.summary ?? "",
        hero_image_alt:
          stringValue(settingsProfile, "heroImageAlt") ??
          settingsEntry.assets[0]?.altText ??
          DEFAULT_ABOUT_SETTINGS.hero_image_alt,
        hero_image_url: firstAssetUrl(settingsEntry),
        hero_name:
          stringValue(settingsProfile, "heroName") ??
          DEFAULT_ABOUT_SETTINGS.hero_name,
        hero_subtitle:
          stringValue(settingsProfile, "heroSubtitle") ??
          DEFAULT_ABOUT_SETTINGS.hero_subtitle,
        id: 1,
        more_info_heading:
          stringValue(settingsProfile, "moreInfoHeading") ??
          DEFAULT_ABOUT_SETTINGS.more_info_heading,
        socials_intro:
          stringValue(settingsProfile, "socialsIntro") ??
          DEFAULT_ABOUT_SETTINGS.socials_intro,
        socials_primary_username:
          stringValue(settingsProfile, "socialsPrimaryUsername") ??
          DEFAULT_ABOUT_SETTINGS.socials_primary_username,
        socials_secondary_username:
          stringValue(settingsProfile, "socialsSecondaryUsername") ??
          DEFAULT_ABOUT_SETTINGS.socials_secondary_username,
        socials_title:
          stringValue(settingsProfile, "socialsTitle") ??
          DEFAULT_ABOUT_SETTINGS.socials_title,
        updated_at: EPOCH,
      } satisfies Tables<"about_page_settings">)
    : DEFAULT_ABOUT_SETTINGS;

  const items = sortByDisplayOrder(
    (contentEntries ?? []).map((entry) => {
      const profile = entry.profileData;

      return {
        body: entry.bodyMarkdown ?? entry.summary ?? "",
        color_key: stringValue(profile, "colorKey"),
        created_at: EPOCH,
        display_order: numberValue(profile, "displayOrder") ?? 0,
        icon_key: stringValue(profile, "iconKey"),
        id: legacyId(entry),
        is_full_width: booleanValue(profile, "isFullWidth") ?? false,
        section: stringValue(profile, "section") ?? "more_info",
        seed_key: entry.slug,
        subtitle: entry.subtitle,
        title: entry.title,
        updated_at: EPOCH,
        url: stringValue(profile, "url"),
        variant: stringValue(profile, "variant"),
      } satisfies Tables<"about_content_items">;
    }),
  );

  const faqs = sortByDisplayOrder(
    (faqEntries ?? []).map((entry) => {
      const profile = entry.profileData;

      return {
        ...profile,
        created_at: stringValue(profile, "created_at") ?? EPOCH,
        display_order: numberValue(profile, "display_order") ?? 0,
        faq_type:
          stringValue(profile, "faq_type") ??
          stringValue(profile, "faqType") ??
          entry.slug,
        id: stringValue(profile, "id") ?? legacyId(entry),
        question:
          stringValue(profile, "question") ?? entry.summary ?? entry.title,
        updated_at: stringValue(profile, "updated_at") ?? EPOCH,
      } as Tables<"about_faqs">;
    }),
  );

  return { faqs, items, settings };
}

function mapCmsStory(entry: CmsEntry): Tables<"stories"> {
  const profile = entry.profileData;

  return {
    content: entry.bodyMarkdown,
    created_at: EPOCH,
    created_by: null,
    deleted_at: null,
    description: entry.bodyMarkdown,
    id: legacyId(entry),
    is_published: booleanValue(profile, "isPublished") ?? true,
    slug: entry.slug,
    summary: entry.summary,
    theme_background_image: firstAssetUrl(entry),
    theme_primary_color: stringValue(profile, "themePrimaryColor"),
    theme_secondary_color: stringValue(profile, "themeSecondaryColor"),
    theme_text_color: stringValue(profile, "themeTextColor"),
    title: entry.title,
    updated_at: EPOCH,
    updated_by: null,
    visibility: (stringValue(profile, "visibility") ??
      "public") as Tables<"stories">["visibility"],
  };
}

function mapCmsWorld(entry: CmsEntry): Tables<"worlds"> {
  const profile = entry.profileData;

  return {
    content: entry.bodyMarkdown,
    created_at: EPOCH,
    created_by: null,
    deleted_at: null,
    description: entry.bodyMarkdown,
    id: legacyId(entry),
    name: entry.title,
    population: numberValue(profile, "population"),
    size: stringValue(profile, "size"),
    slug: entry.slug,
    story_id: stringValue(entry.metadata, "storyId") ?? "",
    summary: entry.summary,
    theme_background_image: firstAssetUrl(entry),
    theme_primary_color: stringValue(profile, "themePrimaryColor"),
    theme_secondary_color: stringValue(profile, "themeSecondaryColor"),
    theme_text_color: stringValue(profile, "themeTextColor"),
    updated_at: EPOCH,
    world_type: stringValue(profile, "worldType"),
  };
}

function mapCmsCharacter(entry: CmsEntry): Tables<"characters"> {
  const profile = entry.profileData;

  return {
    abilities: stringValue(profile, "abilities"),
    age: numberValue(profile, "age"),
    backstory: markdownBlock(entry, "Backstory"),
    banner_image: secondAssetUrl(entry),
    birthday: stringValue(profile, "birthday"),
    build: stringValue(profile, "build"),
    color_palette: stringArrayValue(profile, "colorPalette"),
    created_at: EPOCH,
    created_by: null,
    deleted_at: null,
    description: markdownBlock(entry, "Description") ?? entry.bodyMarkdown,
    distinguishing_features: stringValue(profile, "distinguishingFeatures"),
    eye_color: stringValue(profile, "eyeColor"),
    fanwork_policy: stringValue(profile, "fanworkPolicy"),
    featured_image:
      entry.assets.filter((asset) => asset.assetType === "image")[2]
        ?.assetUrl ?? null,
    gender: stringValue(profile, "gender"),
    hair_color: stringValue(profile, "hairColor"),
    height: stringValue(profile, "height"),
    id: legacyId(entry),
    lore: markdownBlock(entry, "Lore"),
    name: entry.title,
    nickname: entry.subtitle ?? stringValue(profile, "nickname"),
    occupation: stringValue(profile, "occupation"),
    personality_summary:
      stringValue(profile, "personalitySummary") ?? entry.summary,
    profile_image: firstAssetUrl(entry),
    pronouns: stringValue(profile, "pronouns"),
    quote: stringValue(profile, "quote"),
    skin_tone: stringValue(profile, "skinTone"),
    slug: entry.slug,
    species: stringValue(profile, "species"),
    spotify_link: stringValue(profile, "spotifyLink"),
    status: stringValue(profile, "status") as Tables<"characters">["status"],
    theme_primary_color: stringValue(profile, "themePrimaryColor"),
    theme_secondary_color: stringValue(profile, "themeSecondaryColor"),
    theme_text_color: stringValue(profile, "themeTextColor"),
    updated_at: EPOCH,
    weight: stringValue(profile, "weight"),
  };
}

function mapCmsCharacterDetail(
  character: Tables<"characters">,
  worldIds: string[],
): Tables<"character_details"> {
  return {
    ...character,
    factions: null,
    id: character.id,
    name: character.name,
    slug: character.slug,
    world_ids: worldIds as Json,
  };
}

function mapCmsFaction(entry: CmsEntry): Tables<"factions"> {
  const profile = entry.profileData;

  return {
    banner_image: secondAssetUrl(entry),
    content: entry.bodyMarkdown,
    created_at: EPOCH,
    created_by: null,
    deleted_at: null,
    description: entry.summary,
    faction_type: stringValue(profile, "factionType"),
    founding_date: stringValue(profile, "foundingDate"),
    id: legacyId(entry),
    ideology: markdownBlock(entry, "Ideology"),
    logo_url: firstAssetUrl(entry),
    member_count: numberValue(profile, "memberCount"),
    name: entry.title,
    parent_faction_id: stringValue(entry.metadata, "parentFactionId"),
    power_level: stringValue(profile, "powerLevel"),
    primary_goal: stringValue(profile, "primaryGoal"),
    reputation: stringValue(profile, "reputation"),
    slug: entry.slug,
    status: stringValue(profile, "status"),
    summary: entry.summary,
    theme_primary_color: stringValue(profile, "themePrimaryColor"),
    theme_secondary_color: stringValue(profile, "themeSecondaryColor"),
    theme_text_color: stringValue(profile, "themeTextColor"),
    updated_at: EPOCH,
    world_id: stringValue(entry.metadata, "worldId"),
  };
}

function mapCmsLocation(entry: CmsEntry): Tables<"locations"> {
  return {
    banner_image: secondAssetUrl(entry),
    created_at: EPOCH,
    created_by: null,
    deleted_at: null,
    description: markdownBlock(entry, "Description") ?? entry.bodyMarkdown,
    geography: markdownBlock(entry, "Geography"),
    history: markdownBlock(entry, "History"),
    id: legacyId(entry),
    image_url: firstAssetUrl(entry),
    map_image:
      entry.assets.filter((asset) => asset.assetType === "image")[2]
        ?.assetUrl ?? null,
    name: entry.title,
    parent_location_id: stringValue(entry.metadata, "parentLocationId"),
    slug: entry.slug,
    summary: entry.summary,
    updated_at: EPOCH,
    world_id: stringValue(entry.metadata, "worldId") ?? "",
  };
}

async function cmsEntriesAs<T>(
  collectionSlug: string,
  mapper: (entry: CmsEntry) => T,
) {
  const entries = await getExocorpseCmsEntries(collectionSlug);
  return entries ? entries.map(mapper) : null;
}

export async function getCmsPublishedStories() {
  const stories = await cmsEntriesAs("stories", mapCmsStory);
  return stories?.filter((story) => story.is_published) ?? null;
}

export async function getCmsPublicStories() {
  const stories = await getCmsPublishedStories();
  return stories?.filter((story) => story.visibility === "public") ?? null;
}

export async function getCmsStoryBySlug(slug: string) {
  const stories = await getCmsPublishedStories();
  return stories?.find((story) => story.slug === slug) ?? null;
}

async function getCmsWorlds() {
  return cmsEntriesAs("worlds", mapCmsWorld);
}

export async function getCmsWorldsByStorySlug(storySlug: string) {
  const story = await getCmsStoryBySlug(storySlug);
  const worlds = await getCmsWorlds();
  return story && worlds
    ? worlds.filter((world) => world.story_id === story.id)
    : null;
}

export async function getCmsWorldBySlug(storySlug: string, worldSlug: string) {
  const worlds = await getCmsWorldsByStorySlug(storySlug);
  return worlds?.find((world) => world.slug === worldSlug) ?? null;
}

async function getCmsCharacters() {
  return cmsEntriesAs("characters", mapCmsCharacter);
}

async function getCmsCharacterWorldLinks() {
  const entries = await getExocorpseCmsEntries("character-worlds");
  return (
    entries?.map((entry) => ({
      characterId: stringValue(entry.metadata, "characterId"),
      worldId: stringValue(entry.metadata, "worldId"),
    })) ?? null
  );
}

export async function getCmsCharactersByWorldSlug(
  storySlug: string,
  worldSlug: string,
) {
  const [world, characters, links] = await Promise.all([
    getCmsWorldBySlug(storySlug, worldSlug),
    getCmsCharacters(),
    getCmsCharacterWorldLinks(),
  ]);

  if (!world || !characters || !links) {
    return null;
  }

  const characterIds = new Set(
    links
      .filter((link) => link.worldId === world.id)
      .map((link) => link.characterId)
      .filter(Boolean),
  );

  return characters.filter((character) => characterIds.has(character.id));
}

async function getCmsWorldIdsForCharacter(characterId: string) {
  const links = await getCmsCharacterWorldLinks();
  return links
    ? links
        .filter((link) => link.characterId === characterId && link.worldId)
        .map((link) => link.worldId as string)
    : null;
}

export async function getCmsCharacterBySlug(
  storySlug: string,
  worldSlug: string,
  characterSlug: string,
) {
  const characters = await getCmsCharactersByWorldSlug(storySlug, worldSlug);
  const character =
    characters?.find((candidate) => candidate.slug === characterSlug) ?? null;

  if (!character) {
    return null;
  }

  return mapCmsCharacterDetail(
    character,
    (await getCmsWorldIdsForCharacter(character.id)) ?? [],
  );
}

export async function getCmsCharacterBySlugInStory(
  storySlug: string,
  characterSlug: string,
) {
  const [worlds, characters, links] = await Promise.all([
    getCmsWorldsByStorySlug(storySlug),
    getCmsCharacters(),
    getCmsCharacterWorldLinks(),
  ]);

  if (!worlds || !characters || !links) {
    return null;
  }

  const worldIds = new Set(worlds.map((world) => world.id));
  const characterIds = new Set(
    links
      .filter((link) => link.worldId && worldIds.has(link.worldId))
      .map((link) => link.characterId)
      .filter(Boolean),
  );
  const character =
    characters.find(
      (candidate) =>
        candidate.slug === characterSlug && characterIds.has(candidate.id),
    ) ?? null;

  return character
    ? mapCmsCharacterDetail(
        character,
        (await getCmsWorldIdsForCharacter(character.id)) ?? [],
      )
    : null;
}

async function getCmsFactions() {
  return cmsEntriesAs("factions", mapCmsFaction);
}

export async function getCmsFactionsByWorldSlug(
  storySlug: string,
  worldSlug: string,
) {
  const [world, factions] = await Promise.all([
    getCmsWorldBySlug(storySlug, worldSlug),
    getCmsFactions(),
  ]);

  return world && factions
    ? factions.filter((faction) => faction.world_id === world.id)
    : null;
}

export async function getCmsFactionBySlug(
  storySlug: string,
  worldSlug: string,
  factionSlug: string,
) {
  const factions = await getCmsFactionsByWorldSlug(storySlug, worldSlug);
  return factions?.find((faction) => faction.slug === factionSlug) ?? null;
}

export async function getCmsFactionBySlugInStory(
  storySlug: string,
  factionSlug: string,
) {
  const [worlds, factions] = await Promise.all([
    getCmsWorldsByStorySlug(storySlug),
    getCmsFactions(),
  ]);

  if (!worlds || !factions) {
    return null;
  }

  const worldById = new Map(worlds.map((world) => [world.id, world]));
  const faction =
    factions.find(
      (candidate) =>
        candidate.slug === factionSlug &&
        candidate.world_id &&
        worldById.has(candidate.world_id),
    ) ?? null;

  return faction
    ? {
        ...faction,
        worlds: faction.world_id ? worldById.get(faction.world_id) : undefined,
      }
    : null;
}

async function getCmsLocations() {
  return cmsEntriesAs("locations", mapCmsLocation);
}

export async function getCmsLocationsByWorldSlug(
  storySlug: string,
  worldSlug: string,
) {
  const [world, locations] = await Promise.all([
    getCmsWorldBySlug(storySlug, worldSlug),
    getCmsLocations(),
  ]);

  return world && locations
    ? locations.filter((location) => location.world_id === world.id)
    : null;
}

export async function getCmsLocationBySlug(
  storySlug: string,
  worldSlug: string,
  locationSlug: string,
) {
  const locations = await getCmsLocationsByWorldSlug(storySlug, worldSlug);
  return locations?.find((location) => location.slug === locationSlug) ?? null;
}

function mapCmsArtPiece(entry: CmsEntry): Tables<"art_pieces"> {
  const profile = entry.profileData;

  return {
    artist_name: stringValue(profile, "artistName"),
    artist_url: stringValue(profile, "artistUrl"),
    created_at: EPOCH,
    created_date: stringValue(profile, "createdDate"),
    deleted_at: null,
    description: entry.bodyMarkdown ?? entry.summary,
    display_order: numberValue(profile, "displayOrder"),
    id: legacyId(entry),
    image_url: firstAssetUrl(entry) ?? "",
    is_featured: booleanValue(profile, "isFeatured"),
    slug: entry.slug,
    tags: stringArrayValue(profile, "tags"),
    thumbnail_url: secondAssetUrl(entry),
    title: entry.title,
    updated_at: EPOCH,
    year: numberValue(profile, "year"),
  };
}

function mapCmsWritingPiece(entry: CmsEntry): Tables<"writing_pieces"> {
  const profile = entry.profileData;

  return {
    content: entry.bodyMarkdown ?? "",
    cover_image: firstAssetUrl(entry),
    created_at: EPOCH,
    created_date: stringValue(profile, "createdDate"),
    deleted_at: null,
    display_order: numberValue(profile, "displayOrder"),
    excerpt: entry.summary,
    id: legacyId(entry),
    is_featured: booleanValue(profile, "isFeatured"),
    slug: entry.slug,
    tags: stringArrayValue(profile, "tags"),
    thumbnail_url: secondAssetUrl(entry),
    title: entry.title,
    updated_at: EPOCH,
    word_count: numberValue(profile, "wordCount"),
    year: numberValue(profile, "year"),
  };
}

function mapCmsGamePiece(entry: CmsEntry): Tables<"game_pieces"> & {
  game_piece_gallery_images: Tables<"game_piece_gallery_images">[];
} {
  const profile = entry.profileData;
  const galleryImages = entry.assets.slice(1).map((asset, index) => ({
    created_at: EPOCH,
    description: asset.altText,
    display_order: asset.sortOrder ?? index + 1,
    game_piece_id: legacyId(entry),
    id: asset.assetId,
    image_url: asset.assetUrl ?? "",
    updated_at: EPOCH,
  })) satisfies Tables<"game_piece_gallery_images">[];

  return {
    cover_image_url: firstAssetUrl(entry),
    created_at: EPOCH,
    description: entry.bodyMarkdown ?? entry.summary,
    game_piece_gallery_images: galleryImages,
    game_url: stringValue(profile, "gameUrl"),
    id: legacyId(entry),
    slug: entry.slug,
    title: entry.title,
    updated_at: EPOCH,
  };
}

function mapCmsBlogPost(entry: CmsEntry): Tables<"blog_posts"> {
  const profile = entry.profileData;

  return {
    content: entry.bodyMarkdown ?? "",
    cover_url: firstAssetUrl(entry),
    created_at: dateValue(entry.publishedAt),
    excerpt: entry.summary,
    id: legacyId(entry),
    published_at: stringValue(profile, "publishedAt") ?? entry.publishedAt,
    slug: entry.slug,
    title: entry.title,
    updated_at: dateValue(entry.publishedAt),
  };
}

function mapCmsAddon(entry: CmsEntry): Tables<"addons"> {
  const profile = entry.profileData;

  return {
    addon_id: legacyId(entry),
    description: entry.summary,
    is_exclusive: booleanValue(profile, "isExclusive") ?? false,
    name: entry.title,
    percentage: booleanValue(profile, "percentage") ?? false,
    price_impact: numberValue(profile, "priceImpact") ?? 0,
  };
}

function mapCmsPicture(entry: CmsEntry): Tables<"pictures"> {
  const profile = entry.profileData;

  return {
    caption: stringValue(profile, "caption") ?? entry.summary,
    image_url: firstAssetUrl(entry) ?? "",
    is_primary_example: booleanValue(profile, "isPrimaryExample") ?? false,
    picture_id: legacyId(entry),
    service_id: stringValue(entry.metadata, "serviceId") ?? "",
    style_id: stringValue(entry.metadata, "styleId"),
    uploaded_at: stringValue(profile, "uploadedAt"),
  };
}

function mapCmsStyle(entry: CmsEntry): Tables<"styles"> & {
  pictures?: Tables<"pictures">[];
} {
  return {
    description: entry.bodyMarkdown ?? entry.summary,
    name: entry.title,
    pictures: [],
    service_id: stringValue(entry.metadata, "serviceId") ?? "",
    slug: entry.slug,
    style_id: legacyId(entry),
  };
}

function mapCmsServiceAddon(
  entry: CmsEntry,
  addonById: Map<string, Tables<"addons">>,
): Tables<"service_addons"> & { addons?: Tables<"addons"> } {
  const addonId =
    stringValue(entry.metadata, "addonId") ??
    legacyId(entry).split(":")[1] ??
    "";

  return {
    addon_id: addonId,
    addon_is_exclusive:
      booleanValue(entry.profileData, "addonIsExclusive") ?? false,
    addons: addonById.get(addonId),
    service_id:
      stringValue(entry.metadata, "serviceId") ??
      legacyId(entry).split(":")[0] ??
      "",
  };
}

function mapCmsService(entry: CmsEntry): CmsServiceWithDetails {
  const profile = entry.profileData;

  return {
    addons: [],
    base_price: numberValue(profile, "basePrice") ?? 0,
    comm_link: stringValue(profile, "commLink"),
    cover_image_url: firstAssetUrl(entry),
    created_at: EPOCH,
    description: entry.bodyMarkdown ?? entry.summary,
    is_active: booleanValue(profile, "isActive") ?? false,
    name: entry.title,
    pictures: [],
    service_addons: [],
    service_id: legacyId(entry),
    slug: entry.slug,
    styles: [],
  };
}

export async function getCmsArtPieces() {
  const entries = await getExocorpseCmsEntries("portfolio-art");
  return entries ? sortByDisplayOrder(entries.map(mapCmsArtPiece)) : null;
}

export async function getCmsArtPieceBySlug(slug: string) {
  const pieces = await getCmsArtPieces();
  return pieces?.find((piece) => piece.slug === slug) ?? null;
}

export async function getCmsFeaturedArtPieces() {
  const pieces = await getCmsArtPieces();
  return pieces?.filter((piece) => piece.is_featured) ?? null;
}

export async function getCmsWritingPieces() {
  const entries = await getExocorpseCmsEntries("portfolio-writing");
  return entries ? sortByDisplayOrder(entries.map(mapCmsWritingPiece)) : null;
}

export async function getCmsWritingPieceBySlug(slug: string) {
  const pieces = await getCmsWritingPieces();
  return pieces?.find((piece) => piece.slug === slug) ?? null;
}

export async function getCmsFeaturedWritingPieces() {
  const pieces = await getCmsWritingPieces();
  return pieces?.filter((piece) => piece.is_featured) ?? null;
}

export async function getCmsGamePieces() {
  const entries = await getExocorpseCmsEntries("portfolio-games");
  return entries ? entries.map(mapCmsGamePiece) : null;
}

export async function getCmsGamePieceBySlug(slug: string) {
  const pieces = await getCmsGamePieces();
  return pieces?.find((piece) => piece.slug === slug) ?? null;
}

export async function getCmsGamePieceById(id: string) {
  const pieces = await getCmsGamePieces();
  return pieces?.find((piece) => piece.id === id) ?? null;
}

export async function getCmsPublishedBlogPosts() {
  const entries = await getExocorpseCmsEntries("blog-posts");
  return entries
    ? entries
        .map(mapCmsBlogPost)
        .filter((post) => isVisiblePublishedDate(post.published_at))
        .sort((left, right) =>
          (right.published_at ?? "").localeCompare(left.published_at ?? ""),
        )
    : null;
}

export async function getCmsPublishedBlogPostsPaginated(
  page: number,
  pageSize: number,
) {
  const posts = await getCmsPublishedBlogPosts();
  if (!posts) {
    return null;
  }

  const start = (page - 1) * pageSize;
  return {
    data: posts.slice(start, start + pageSize),
    page,
    pageSize,
    total: posts.length,
  };
}

export async function getCmsBlogPostBySlug(slug: string) {
  const posts = await getCmsPublishedBlogPosts();
  return posts?.find((post) => post.slug === slug) ?? null;
}

export async function getCmsActiveServices(): Promise<
  CmsServiceWithDetails[] | null
> {
  const [
    serviceEntries,
    addonEntries,
    styleEntries,
    pictureEntries,
    serviceAddonEntries,
  ] = await Promise.all([
    getExocorpseCmsEntries("commission-services"),
    getExocorpseCmsEntries("commission-addons"),
    getExocorpseCmsEntries("commission-styles"),
    getExocorpseCmsEntries("commission-pictures"),
    getExocorpseCmsEntries("commission-service-addons"),
  ]);

  if (!serviceEntries) {
    return null;
  }

  const addons = (addonEntries ?? []).map(mapCmsAddon);
  const addonById = new Map(addons.map((addon) => [addon.addon_id, addon]));
  const pictures = (pictureEntries ?? []).map(mapCmsPicture);
  const picturesByService = new Map<string, Tables<"pictures">[]>();
  const picturesByStyle = new Map<string, Tables<"pictures">[]>();

  for (const picture of pictures) {
    const servicePictures = picturesByService.get(picture.service_id) ?? [];
    servicePictures.push(picture);
    picturesByService.set(picture.service_id, servicePictures);

    if (picture.style_id) {
      const stylePictures = picturesByStyle.get(picture.style_id) ?? [];
      stylePictures.push(picture);
      picturesByStyle.set(picture.style_id, stylePictures);
    }
  }

  const stylesByService = new Map<
    string,
    Array<Tables<"styles"> & { pictures?: Tables<"pictures">[] }>
  >();
  for (const styleEntry of styleEntries ?? []) {
    const style = mapCmsStyle(styleEntry);
    style.pictures = picturesByStyle.get(style.style_id) ?? [];
    const styles = stylesByService.get(style.service_id) ?? [];
    styles.push(style);
    stylesByService.set(style.service_id, styles);
  }

  const serviceAddonsByService = new Map<
    string,
    Array<Tables<"service_addons"> & { addons?: Tables<"addons"> }>
  >();
  for (const linkEntry of serviceAddonEntries ?? []) {
    const link = mapCmsServiceAddon(linkEntry, addonById);
    const links = serviceAddonsByService.get(link.service_id) ?? [];
    links.push(link);
    serviceAddonsByService.set(link.service_id, links);
  }

  return serviceEntries
    .map(mapCmsService)
    .filter((service) => service.is_active)
    .map((service) => ({
      ...service,
      addons,
      pictures: picturesByService.get(service.service_id) ?? [],
      service_addons: serviceAddonsByService.get(service.service_id) ?? [],
      styles: stylesByService.get(service.service_id) ?? [],
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getCmsServiceBySlug(slug: string) {
  const services = await getCmsActiveServices();
  return services?.find((service) => service.slug === slug) ?? null;
}

function mapCmsCofiSample(entry: CmsEntry): Tables<"cofi_samples"> {
  const profile = entry.profileData;
  const originalPath =
    firstAssetUrl(entry) ??
    stringValue(entry.metadata, "originalRemoteUrl") ??
    "";
  const thumbnailPath =
    secondAssetUrl(entry) ??
    stringValue(entry.metadata, "thumbnailRemoteUrl") ??
    originalPath;
  const originalFilename = filenameFromPath(originalPath, `${entry.slug}.jpg`);
  const thumbnailFilename = filenameFromPath(
    thumbnailPath,
    `${entry.slug}-thumb.jpg`,
  );

  return {
    artist_name: stringValue(profile, "artistName") ?? entry.title,
    artist_slug: stringValue(profile, "artistSlug") ?? entry.slug,
    booth_location: stringValue(profile, "boothLocation") ?? "",
    booth_type: stringValue(profile, "boothType") ?? "",
    created_at: EPOCH,
    id: legacyId(entry),
    joining_date: stringValue(profile, "joiningDate") ?? "",
    original_bytes: numberValue(entry.metadata, "originalBytes") ?? 0,
    original_content_type: stringValue(entry.metadata, "originalContentType"),
    original_extension: extensionFromFilename(originalFilename),
    original_filename: originalFilename,
    original_image_url:
      stringValue(entry.metadata, "originalRemoteUrl") ?? originalPath,
    original_local_path: originalPath,
    search_text: [
      entry.title,
      stringValue(profile, "artistName"),
      stringValue(profile, "boothLocation"),
      stringValue(profile, "boothType"),
      stringValue(profile, "joiningDate"),
    ]
      .filter(Boolean)
      .join("\n"),
    search_tsv: null,
    snapshot_index: numberValue(profile, "snapshotIndex") ?? 0,
    source_sample_id: stringValue(profile, "sourceSampleId") ?? entry.slug,
    thumbnail_bytes: numberValue(entry.metadata, "thumbnailBytes") ?? 0,
    thumbnail_content_type: stringValue(entry.metadata, "thumbnailContentType"),
    thumbnail_extension: extensionFromFilename(thumbnailFilename),
    thumbnail_filename: thumbnailFilename,
    thumbnail_local_path: thumbnailPath,
    thumbnail_url:
      stringValue(entry.metadata, "thumbnailRemoteUrl") ?? thumbnailPath,
    updated_at: EPOCH,
  };
}

export async function getCmsCofiSampleRows() {
  const entries = await getExocorpseCmsEntries("cofi-samples");
  return entries
    ? entries
        .map(mapCmsCofiSample)
        .sort((left, right) => left.snapshot_index - right.snapshot_index)
    : null;
}
