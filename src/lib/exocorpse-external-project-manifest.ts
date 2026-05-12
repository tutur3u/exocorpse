import "server-only";

import { getSupabaseAdminServer } from "@/lib/supabase/server";
import type { Tables } from "../../supabase/types";

export type ExocorpseSyncField = {
  description?: string | null;
  key: string;
  label: string;
  options?: string[];
  required?: boolean;
  type:
    | "boolean"
    | "date"
    | "datetime"
    | "json"
    | "markdown"
    | "number"
    | "string"
    | "string-array";
};

type ManifestAsset = {
  altText?: string | null;
  assetType: string;
  metadata?: Record<string, unknown>;
  sortOrder?: number;
  sourceUrl?: string | null;
  stableSourceId: string;
  storagePath?: string | null;
};

type ManifestBlock = {
  blockType: string;
  content: Record<string, unknown>;
  sortOrder?: number;
  stableSourceId: string;
  title?: string | null;
};

type ManifestEntry = {
  assets?: ManifestAsset[];
  blocks?: ManifestBlock[];
  collectionSlug: string;
  metadata?: Record<string, unknown>;
  profileData?: Record<string, unknown>;
  scheduledFor?: string | null;
  slug: string;
  stableSourceId: string;
  status?: "draft" | "scheduled" | "published" | "archived";
  subtitle?: string | null;
  summary?: string | null;
  title: string;
};

export type ExocorpseExternalProjectManifest = {
  adapter: "exocorpse";
  content: {
    entries: ManifestEntry[];
  };
  schema: {
    collections: Array<{
      assetTypes?: string[];
      blockTypes?: string[];
      collection_type: string;
      description?: string | null;
      metadataFields?: ExocorpseSyncField[];
      profileFields?: ExocorpseSyncField[];
      slug: string;
      title: string;
    }>;
    metadataFields?: ExocorpseSyncField[];
    profileFields?: ExocorpseSyncField[];
  };
  version: 1;
};

export type ExocorpseSourceTableCounts = Record<string, number>;

const PUBLISHED_STATUS = "published" as const;
const DRAFT_STATUS = "draft" as const;
const COFI_PAGE_SIZE = 1000;

function slugify(value: string, fallback: string) {
  const slug = value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function normalizePublicPath(value: string) {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("..")
  ) {
    return null;
  }

  return value;
}

function normalizeStoragePath(value: string) {
  const trimmed = value.trim();
  if (!trimmed || isRemoteUrl(trimmed)) {
    return null;
  }

  return trimmed.replace(/^\/+/, "");
}

function compactRecord(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  );
}

function sourceMetadata(
  sourceTable: string,
  sourceId: string | number,
  metadata: Record<string, unknown> = {},
) {
  return compactRecord({
    ...metadata,
    sourceId,
    sourceTable,
  });
}

function assetFromPath({
  altText,
  assetType = "image",
  path,
  sortOrder = 0,
  stableSourceId,
}: {
  altText?: string | null;
  assetType?: string;
  path: string | null | undefined;
  sortOrder?: number;
  stableSourceId: string;
}): ManifestAsset | null {
  const trimmed = path?.trim();

  if (!trimmed) {
    return null;
  }

  const publicPath = normalizePublicPath(trimmed);

  if (publicPath) {
    return {
      altText,
      assetType,
      metadata: {
        publicPath,
      },
      sortOrder,
      sourceUrl: publicPath,
      stableSourceId,
    };
  }

  if (isRemoteUrl(trimmed)) {
    return {
      altText,
      assetType,
      metadata: {
        sourceUrl: trimmed,
      },
      sortOrder,
      sourceUrl: trimmed,
      stableSourceId,
    };
  }

  const storagePath = normalizeStoragePath(trimmed);

  return storagePath
    ? {
        altText,
        assetType,
        metadata: {
          sourceStoragePath: trimmed,
        },
        sortOrder,
        sourceUrl: null,
        stableSourceId,
        storagePath,
      }
    : null;
}

function markdownBlock({
  content,
  stableSourceId,
  title,
}: {
  content: string | null | undefined;
  stableSourceId: string;
  title: string;
}): ManifestBlock | null {
  if (!content?.trim()) {
    return null;
  }

  return {
    blockType: "markdown",
    content: {
      markdown: content,
    },
    stableSourceId,
    title,
  };
}

function onlyBlocks(blocks: Array<ManifestBlock | null>) {
  return blocks.filter((block): block is ManifestBlock => Boolean(block));
}

function onlyAssets(assets: Array<ManifestAsset | null>) {
  return assets.filter((asset): asset is ManifestAsset => Boolean(asset));
}

async function assertTableResult<T>(
  promise: PromiseLike<{ data: T | null; error: { message: string } | null }>,
) {
  const { data, error } = await promise;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function listCofiSamples() {
  const supabase = await getSupabaseAdminServer();
  const rows: Tables<"cofi_samples">[] = [];
  let from = 0;

  while (true) {
    const data = await assertTableResult(
      supabase
        .from("cofi_samples")
        .select("*")
        .order("snapshot_index", { ascending: true })
        .range(from, from + COFI_PAGE_SIZE - 1),
    );
    const chunk = (data ?? []) as Tables<"cofi_samples">[];
    rows.push(...chunk);

    if (chunk.length < COFI_PAGE_SIZE) {
      break;
    }

    from += COFI_PAGE_SIZE;
  }

  return rows;
}

async function loadExocorpseSourceData() {
  const supabase = await getSupabaseAdminServer();

  const [
    aboutSettings,
    aboutItems,
    aboutFaqs,
    artPieces,
    blogPosts,
    characters,
    characterFactions,
    characterGallery,
    characterLocations,
    characterOutfits,
    characterRelationships,
    characterWorlds,
    gamePieces,
    gameGallery,
    eventFactions,
    eventParticipants,
    eventTypes,
    events,
    entityTags,
    factions,
    heavenAssets,
    heavenPassages,
    heavenScenes,
    heavenSceneChoices,
    locations,
    locationsGallery,
    mediaAssets,
    moodboards,
    outfitTypes,
    pictures,
    relationshipTypes,
    services,
    serviceAddons,
    styles,
    addons,
    stories,
    tags,
    timelines,
    worlds,
    writingPieces,
    blacklistedUsers,
    cofiSamples,
  ] = await Promise.all([
    assertTableResult(
      supabase.from("about_page_settings").select("*").maybeSingle(),
    ),
    assertTableResult(
      supabase.from("about_content_items").select("*").order("display_order"),
    ),
    assertTableResult(
      supabase.from("about_faqs").select("*").order("display_order"),
    ),
    assertTableResult(
      supabase
        .from("art_pieces")
        .select("*")
        .is("deleted_at", null)
        .order("display_order", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false }),
    ),
    assertTableResult(
      supabase
        .from("characters")
        .select("*")
        .is("deleted_at", null)
        .order("name"),
    ),
    assertTableResult(
      supabase
        .from("character_factions")
        .select("*")
        .order("created_at", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("character_gallery")
        .select("*")
        .is("deleted_at", null)
        .order("display_order", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("character_locations")
        .select("*")
        .order("created_at", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("character_outfits")
        .select("*")
        .is("deleted_at", null)
        .order("display_order", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("character_relationships")
        .select("*")
        .order("created_at", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("character_worlds")
        .select("*")
        .order("created_at", { ascending: true }),
    ),
    assertTableResult(supabase.from("game_pieces").select("*").order("title")),
    assertTableResult(
      supabase
        .from("game_piece_gallery_images")
        .select("*")
        .order("display_order", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("event_factions")
        .select("*")
        .order("created_at", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("event_participants")
        .select("*")
        .order("created_at", { ascending: true }),
    ),
    assertTableResult(supabase.from("event_types").select("*").order("name")),
    assertTableResult(
      supabase
        .from("events")
        .select("*")
        .is("deleted_at", null)
        .order("date_year", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("entity_tags")
        .select("*")
        .order("created_at", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("factions")
        .select("*")
        .is("deleted_at", null)
        .order("name"),
    ),
    assertTableResult(
      supabase.from("heaven_space_assets").select("*").order("display_order"),
    ),
    assertTableResult(
      supabase.from("heaven_space_passages").select("*").order("display_order"),
    ),
    assertTableResult(
      supabase.from("heaven_space_scenes").select("*").order("display_order"),
    ),
    assertTableResult(
      supabase
        .from("heaven_space_scene_choices")
        .select("*")
        .order("display_order"),
    ),
    assertTableResult(
      supabase
        .from("locations")
        .select("*")
        .is("deleted_at", null)
        .order("name"),
    ),
    assertTableResult(
      supabase
        .from("locations_gallery_images")
        .select("*")
        .is("deleted_at", null)
        .order("display_order", { ascending: true }),
    ),
    assertTableResult(
      supabase
        .from("media_assets")
        .select("*")
        .is("deleted_at", null)
        .order("name"),
    ),
    assertTableResult(
      supabase
        .from("moodboards")
        .select("*")
        .is("deleted_at", null)
        .order("name"),
    ),
    assertTableResult(supabase.from("outfit_types").select("*").order("name")),
    assertTableResult(
      supabase.from("pictures").select("*").order("uploaded_at"),
    ),
    assertTableResult(
      supabase.from("relationship_types").select("*").order("name"),
    ),
    assertTableResult(supabase.from("services").select("*").order("name")),
    assertTableResult(
      supabase.from("service_addons").select("*").order("service_id"),
    ),
    assertTableResult(supabase.from("styles").select("*").order("name")),
    assertTableResult(supabase.from("addons").select("*").order("name")),
    assertTableResult(
      supabase
        .from("stories")
        .select("*")
        .is("deleted_at", null)
        .order("title"),
    ),
    assertTableResult(supabase.from("tags").select("*").order("name")),
    assertTableResult(
      supabase
        .from("timelines")
        .select("*")
        .is("deleted_at", null)
        .order("start_date", { ascending: true }),
    ),
    assertTableResult(
      supabase.from("worlds").select("*").is("deleted_at", null).order("name"),
    ),
    assertTableResult(
      supabase
        .from("writing_pieces")
        .select("*")
        .is("deleted_at", null)
        .order("display_order", { ascending: true }),
    ),
    assertTableResult(
      supabase.from("blacklisted_users").select("*").order("username"),
    ),
    listCofiSamples(),
  ]);

  return {
    aboutFaqs: (aboutFaqs ?? []) as Tables<"about_faqs">[],
    aboutItems: (aboutItems ?? []) as Tables<"about_content_items">[],
    aboutSettings: aboutSettings as Tables<"about_page_settings"> | null,
    addons: (addons ?? []) as Tables<"addons">[],
    artPieces: (artPieces ?? []) as Tables<"art_pieces">[],
    blacklistedUsers: (blacklistedUsers ?? []) as Tables<"blacklisted_users">[],
    blogPosts: (blogPosts ?? []) as Tables<"blog_posts">[],
    characters: (characters ?? []) as Tables<"characters">[],
    characterFactions: (characterFactions ??
      []) as Tables<"character_factions">[],
    characterGallery: (characterGallery ?? []) as Tables<"character_gallery">[],
    characterLocations: (characterLocations ??
      []) as Tables<"character_locations">[],
    characterOutfits: (characterOutfits ?? []) as Tables<"character_outfits">[],
    characterRelationships: (characterRelationships ??
      []) as Tables<"character_relationships">[],
    characterWorlds: (characterWorlds ?? []) as Tables<"character_worlds">[],
    cofiSamples,
    entityTags: (entityTags ?? []) as Tables<"entity_tags">[],
    eventFactions: (eventFactions ?? []) as Tables<"event_factions">[],
    eventParticipants: (eventParticipants ??
      []) as Tables<"event_participants">[],
    events: (events ?? []) as Tables<"events">[],
    eventTypes: (eventTypes ?? []) as Tables<"event_types">[],
    factions: (factions ?? []) as Tables<"factions">[],
    gameGallery: (gameGallery ?? []) as Tables<"game_piece_gallery_images">[],
    gamePieces: (gamePieces ?? []) as Tables<"game_pieces">[],
    heavenAssets: (heavenAssets ?? []) as Tables<"heaven_space_assets">[],
    heavenPassages: (heavenPassages ?? []) as Tables<"heaven_space_passages">[],
    heavenScenes: (heavenScenes ?? []) as Tables<"heaven_space_scenes">[],
    heavenSceneChoices: (heavenSceneChoices ??
      []) as Tables<"heaven_space_scene_choices">[],
    locations: (locations ?? []) as Tables<"locations">[],
    locationsGallery: (locationsGallery ??
      []) as Tables<"locations_gallery_images">[],
    mediaAssets: (mediaAssets ?? []) as Tables<"media_assets">[],
    moodboards: (moodboards ?? []) as Tables<"moodboards">[],
    outfitTypes: (outfitTypes ?? []) as Tables<"outfit_types">[],
    pictures: (pictures ?? []) as Tables<"pictures">[],
    relationshipTypes: (relationshipTypes ??
      []) as Tables<"relationship_types">[],
    services: (services ?? []) as Tables<"services">[],
    serviceAddons: (serviceAddons ?? []) as Tables<"service_addons">[],
    stories: (stories ?? []) as Tables<"stories">[],
    styles: (styles ?? []) as Tables<"styles">[],
    tags: (tags ?? []) as Tables<"tags">[],
    timelines: (timelines ?? []) as Tables<"timelines">[],
    worlds: (worlds ?? []) as Tables<"worlds">[],
    writingPieces: (writingPieces ?? []) as Tables<"writing_pieces">[],
  };
}

function aboutEntries({
  aboutFaqs,
  aboutItems,
  aboutSettings,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  const entries: ManifestEntry[] = [];

  if (aboutSettings) {
    entries.push({
      assets: onlyAssets([
        assetFromPath({
          altText: aboutSettings.hero_image_alt,
          path: aboutSettings.hero_image_url,
          stableSourceId: "exocorpse:about:settings:hero-image",
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: aboutSettings.hero_bio,
          stableSourceId: "exocorpse:about:settings:hero-bio",
          title: "Hero bio",
        }),
      ]),
      collectionSlug: "about",
      profileData: compactRecord({
        aboutUseHeading: aboutSettings.about_use_heading,
        dniIntro: aboutSettings.dni_intro,
        dniTitle: aboutSettings.dni_title,
        experiencesHeading: aboutSettings.experiences_heading,
        faqIntro: aboutSettings.faq_intro,
        faqTitle: aboutSettings.faq_title,
        favoritesHeading: aboutSettings.favorites_heading,
        heroImageAlt: aboutSettings.hero_image_alt,
        heroName: aboutSettings.hero_name,
        heroSubtitle: aboutSettings.hero_subtitle,
        moreInfoHeading: aboutSettings.more_info_heading,
        socialsIntro: aboutSettings.socials_intro,
        socialsPrimaryUsername: aboutSettings.socials_primary_username,
        socialsSecondaryUsername: aboutSettings.socials_secondary_username,
        socialsTitle: aboutSettings.socials_title,
      }),
      slug: "settings",
      stableSourceId: "exocorpse:about:settings",
      status: PUBLISHED_STATUS,
      summary: aboutSettings.hero_bio,
      title: "About page settings",
    });
  }

  entries.push(
    ...aboutItems.map((item) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: item.body,
          stableSourceId: `exocorpse:about:item:${item.id}:body`,
          title: "Body",
        }),
      ]),
      collectionSlug: "about-content",
      profileData: compactRecord({
        colorKey: item.color_key,
        displayOrder: item.display_order,
        iconKey: item.icon_key,
        isFullWidth: item.is_full_width,
        section: item.section,
        subtitle: item.subtitle,
        url: item.url,
        variant: item.variant,
      }),
      slug: item.seed_key ?? slugify(item.title ?? item.section, item.id),
      stableSourceId: `exocorpse:about:item:${item.id}`,
      status: PUBLISHED_STATUS,
      subtitle: item.subtitle,
      summary: item.body,
      title: item.title ?? item.section,
    })),
    ...aboutFaqs.map((faq) => ({
      blocks: [],
      collectionSlug: "about-faqs",
      profileData: faq,
      slug: slugify(faq.faq_type, faq.id),
      stableSourceId: `exocorpse:about:faq:${faq.id}`,
      status: PUBLISHED_STATUS,
      summary: faq.question,
      title: faq.question,
    })),
  );

  return entries;
}

function wikiEntries({
  characters,
  stories,
  worlds,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return [
    ...stories.map((story) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: story.title,
          path: story.theme_background_image,
          stableSourceId: `exocorpse:story:${story.id}:background`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: story.content,
          stableSourceId: `exocorpse:story:${story.id}:content`,
          title: "Story content",
        }),
      ]),
      collectionSlug: "stories",
      profileData: compactRecord({
        isPublished: story.is_published,
        themePrimaryColor: story.theme_primary_color,
        themeSecondaryColor: story.theme_secondary_color,
        themeTextColor: story.theme_text_color,
        visibility: story.visibility,
      }),
      slug: story.slug,
      stableSourceId: `exocorpse:story:${story.id}`,
      status: story.is_published ? PUBLISHED_STATUS : DRAFT_STATUS,
      summary: story.summary ?? story.description,
      title: story.title,
    })),
    ...worlds.map((world) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: world.name,
          path: world.theme_background_image,
          stableSourceId: `exocorpse:world:${world.id}:background`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: world.content,
          stableSourceId: `exocorpse:world:${world.id}:content`,
          title: "World content",
        }),
      ]),
      collectionSlug: "worlds",
      metadata: {
        storyId: world.story_id,
      },
      profileData: compactRecord({
        population: world.population,
        size: world.size,
        themePrimaryColor: world.theme_primary_color,
        themeSecondaryColor: world.theme_secondary_color,
        themeTextColor: world.theme_text_color,
        worldType: world.world_type,
      }),
      slug: world.slug,
      stableSourceId: `exocorpse:world:${world.id}`,
      status: PUBLISHED_STATUS,
      summary: world.summary ?? world.description,
      title: world.name,
    })),
    ...characters.map((character) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: character.name,
          path: character.profile_image,
          stableSourceId: `exocorpse:character:${character.id}:profile`,
        }),
        assetFromPath({
          altText: `${character.name} banner`,
          path: character.banner_image,
          sortOrder: 1,
          stableSourceId: `exocorpse:character:${character.id}:banner`,
        }),
        assetFromPath({
          altText: `${character.name} featured image`,
          path: character.featured_image,
          sortOrder: 2,
          stableSourceId: `exocorpse:character:${character.id}:featured`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: character.description,
          stableSourceId: `exocorpse:character:${character.id}:description`,
          title: "Description",
        }),
        markdownBlock({
          content: character.backstory,
          stableSourceId: `exocorpse:character:${character.id}:backstory`,
          title: "Backstory",
        }),
        markdownBlock({
          content: character.lore,
          stableSourceId: `exocorpse:character:${character.id}:lore`,
          title: "Lore",
        }),
      ]),
      collectionSlug: "characters",
      profileData: compactRecord({
        abilities: character.abilities,
        age: character.age,
        birthday: character.birthday,
        build: character.build,
        colorPalette: character.color_palette,
        distinguishingFeatures: character.distinguishing_features,
        eyeColor: character.eye_color,
        fanworkPolicy: character.fanwork_policy,
        gender: character.gender,
        hairColor: character.hair_color,
        height: character.height,
        nickname: character.nickname,
        occupation: character.occupation,
        personalitySummary: character.personality_summary,
        pronouns: character.pronouns,
        quote: character.quote,
        skinTone: character.skin_tone,
        species: character.species,
        spotifyLink: character.spotify_link,
        status: character.status,
        themePrimaryColor: character.theme_primary_color,
        themeSecondaryColor: character.theme_secondary_color,
        themeTextColor: character.theme_text_color,
        weight: character.weight,
      }),
      slug: character.slug,
      stableSourceId: `exocorpse:character:${character.id}`,
      status: PUBLISHED_STATUS,
      subtitle: character.nickname,
      summary: character.personality_summary ?? character.description,
      title: character.name,
    })),
  ] satisfies ManifestEntry[];
}

function wikiTypeEntries({
  eventTypes,
  outfitTypes,
  relationshipTypes,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return [
    ...relationshipTypes.map((type) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: type.description,
          stableSourceId: `exocorpse:relationship-type:${type.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "relationship-types",
      metadata: sourceMetadata("relationship_types", type.id),
      profileData: compactRecord({
        isMutual: type.is_mutual,
        reverseName: type.reverse_name,
      }),
      slug: slugify(type.name, type.id),
      stableSourceId: `exocorpse:relationship-type:${type.id}`,
      status: PUBLISHED_STATUS,
      summary: type.description,
      title: type.name,
    })),
    ...outfitTypes.map((type) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: type.description,
          stableSourceId: `exocorpse:outfit-type:${type.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "outfit-types",
      metadata: sourceMetadata("outfit_types", type.id, {
        storyId: type.story_id,
      }),
      profileData: compactRecord({
        color: type.color,
        icon: type.icon,
        isDefault: type.is_default,
      }),
      slug: type.slug,
      stableSourceId: `exocorpse:outfit-type:${type.id}`,
      status: PUBLISHED_STATUS,
      summary: type.description,
      title: type.name,
    })),
    ...eventTypes.map((type) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: type.description,
          stableSourceId: `exocorpse:event-type:${type.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "event-types",
      metadata: sourceMetadata("event_types", type.id, {
        storyId: type.story_id,
      }),
      profileData: compactRecord({
        color: type.color,
        icon: type.icon,
        isDefault: type.is_default,
      }),
      slug: type.slug,
      stableSourceId: `exocorpse:event-type:${type.id}`,
      status: PUBLISHED_STATUS,
      summary: type.description,
      title: type.name,
    })),
  ] satisfies ManifestEntry[];
}

function worldStructureEntries({
  factions,
  locations,
  locationsGallery,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return [
    ...factions.map((faction) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: `${faction.name} logo`,
          path: faction.logo_url,
          stableSourceId: `exocorpse:faction:${faction.id}:logo`,
        }),
        assetFromPath({
          altText: `${faction.name} banner`,
          path: faction.banner_image,
          sortOrder: 1,
          stableSourceId: `exocorpse:faction:${faction.id}:banner`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: faction.content,
          stableSourceId: `exocorpse:faction:${faction.id}:content`,
          title: "Faction content",
        }),
        markdownBlock({
          content: faction.ideology,
          stableSourceId: `exocorpse:faction:${faction.id}:ideology`,
          title: "Ideology",
        }),
      ]),
      collectionSlug: "factions",
      metadata: sourceMetadata("factions", faction.id, {
        parentFactionId: faction.parent_faction_id,
        worldId: faction.world_id,
      }),
      profileData: compactRecord({
        factionType: faction.faction_type,
        foundingDate: faction.founding_date,
        memberCount: faction.member_count,
        powerLevel: faction.power_level,
        primaryGoal: faction.primary_goal,
        reputation: faction.reputation,
        status: faction.status,
        themePrimaryColor: faction.theme_primary_color,
        themeSecondaryColor: faction.theme_secondary_color,
        themeTextColor: faction.theme_text_color,
      }),
      slug: faction.slug,
      stableSourceId: `exocorpse:faction:${faction.id}`,
      status: PUBLISHED_STATUS,
      summary: faction.summary ?? faction.description,
      title: faction.name,
    })),
    ...locations.map((location) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: location.name,
          path: location.image_url,
          stableSourceId: `exocorpse:location:${location.id}:image`,
        }),
        assetFromPath({
          altText: `${location.name} banner`,
          path: location.banner_image,
          sortOrder: 1,
          stableSourceId: `exocorpse:location:${location.id}:banner`,
        }),
        assetFromPath({
          altText: `${location.name} map`,
          path: location.map_image,
          sortOrder: 2,
          stableSourceId: `exocorpse:location:${location.id}:map`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: location.description,
          stableSourceId: `exocorpse:location:${location.id}:description`,
          title: "Description",
        }),
        markdownBlock({
          content: location.geography,
          stableSourceId: `exocorpse:location:${location.id}:geography`,
          title: "Geography",
        }),
        markdownBlock({
          content: location.history,
          stableSourceId: `exocorpse:location:${location.id}:history`,
          title: "History",
        }),
      ]),
      collectionSlug: "locations",
      metadata: sourceMetadata("locations", location.id, {
        parentLocationId: location.parent_location_id,
        worldId: location.world_id,
      }),
      profileData: {},
      slug: location.slug,
      stableSourceId: `exocorpse:location:${location.id}`,
      status: PUBLISHED_STATUS,
      summary: location.summary ?? location.description,
      title: location.name,
    })),
    ...locationsGallery.map((image) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: image.title,
          path: image.image_url,
          stableSourceId: `exocorpse:location-gallery:${image.id}:image`,
        }),
        assetFromPath({
          altText: `${image.title} thumbnail`,
          path: image.thumbnail_url,
          sortOrder: 1,
          stableSourceId: `exocorpse:location-gallery:${image.id}:thumbnail`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: image.description,
          stableSourceId: `exocorpse:location-gallery:${image.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "location-gallery",
      metadata: sourceMetadata("locations_gallery_images", image.id, {
        locationId: image.location,
      }),
      profileData: compactRecord({
        artistName: image.artist_name,
        artistUrl: image.artist_url,
        commissionDate: image.commission_date,
        displayOrder: image.display_order,
        isFeatured: image.is_featured,
        tags: image.tags,
      }),
      slug: slugify(image.title, image.id),
      stableSourceId: `exocorpse:location-gallery:${image.id}`,
      status: PUBLISHED_STATUS,
      summary: image.description,
      title: image.title,
    })),
  ] satisfies ManifestEntry[];
}

function characterSupportingEntries({
  characterFactions,
  characterGallery,
  characterLocations,
  characterOutfits,
  characterRelationships,
  characterWorlds,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return [
    ...characterOutfits.map((outfit) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: outfit.name,
          path: outfit.image_url,
          stableSourceId: `exocorpse:character-outfit:${outfit.id}:image`,
        }),
        ...(outfit.reference_images ?? []).map((imagePath, index) =>
          assetFromPath({
            altText: `${outfit.name} reference ${index + 1}`,
            path: imagePath,
            sortOrder: index + 1,
            stableSourceId: `exocorpse:character-outfit:${outfit.id}:reference:${index}`,
          }),
        ),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: outfit.description,
          stableSourceId: `exocorpse:character-outfit:${outfit.id}:description`,
          title: "Description",
        }),
        markdownBlock({
          content: outfit.notes,
          stableSourceId: `exocorpse:character-outfit:${outfit.id}:notes`,
          title: "Notes",
        }),
      ]),
      collectionSlug: "character-outfits",
      metadata: sourceMetadata("character_outfits", outfit.id, {
        characterId: outfit.character_id,
        outfitTypeId: outfit.outfit_type_id,
      }),
      profileData: compactRecord({
        colorPalette: outfit.color_palette,
        displayOrder: outfit.display_order,
        isDefault: outfit.is_default,
      }),
      slug: `${slugify(outfit.name, outfit.id)}-${outfit.id}`,
      stableSourceId: `exocorpse:character-outfit:${outfit.id}`,
      status: PUBLISHED_STATUS,
      summary: outfit.description ?? outfit.notes,
      title: outfit.name,
    })),
    ...characterGallery.map((image) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: image.title,
          path: image.image_url,
          stableSourceId: `exocorpse:character-gallery:${image.id}:image`,
        }),
        assetFromPath({
          altText: `${image.title} thumbnail`,
          path: image.thumbnail_url,
          sortOrder: 1,
          stableSourceId: `exocorpse:character-gallery:${image.id}:thumbnail`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: image.description,
          stableSourceId: `exocorpse:character-gallery:${image.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "character-gallery",
      metadata: sourceMetadata("character_gallery", image.id, {
        characterId: image.character_id,
      }),
      profileData: compactRecord({
        artistName: image.artist_name,
        artistUrl: image.artist_url,
        commissionDate: image.commission_date,
        displayOrder: image.display_order,
        isFeatured: image.is_featured,
        tags: image.tags,
      }),
      slug: `${slugify(image.title, image.id)}-${image.id}`,
      stableSourceId: `exocorpse:character-gallery:${image.id}`,
      status: PUBLISHED_STATUS,
      summary: image.description,
      title: image.title,
    })),
    ...characterRelationships.map((relationship) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: relationship.description,
          stableSourceId: `exocorpse:character-relationship:${relationship.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "character-relationships",
      metadata: sourceMetadata("character_relationships", relationship.id, {
        characterAId: relationship.character_a_id,
        characterBId: relationship.character_b_id,
        relationshipTypeId: relationship.relationship_type_id,
      }),
      profileData: {},
      slug: relationship.id,
      stableSourceId: `exocorpse:character-relationship:${relationship.id}`,
      status: PUBLISHED_STATUS,
      summary: relationship.description,
      title: `Relationship ${relationship.id}`,
    })),
    ...characterFactions.map((membership) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: membership.notes,
          stableSourceId: `exocorpse:character-faction:${membership.id}:notes`,
          title: "Notes",
        }),
      ]),
      collectionSlug: "character-factions",
      metadata: sourceMetadata("character_factions", membership.id, {
        characterId: membership.character_id,
        factionId: membership.faction_id,
      }),
      profileData: compactRecord({
        isCurrent: membership.is_current,
        joinDate: membership.join_date,
        leaveDate: membership.leave_date,
        rank: membership.rank,
        role: membership.role,
      }),
      slug: membership.id,
      stableSourceId: `exocorpse:character-faction:${membership.id}`,
      status: PUBLISHED_STATUS,
      summary: membership.notes,
      title: `Character faction ${membership.id}`,
    })),
    ...characterLocations.map((association) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: association.notes,
          stableSourceId: `exocorpse:character-location:${association.id}:notes`,
          title: "Notes",
        }),
      ]),
      collectionSlug: "character-locations",
      metadata: sourceMetadata("character_locations", association.id, {
        characterId: association.character_id,
        locationId: association.location_id,
      }),
      profileData: compactRecord({
        associationType: association.association_type,
        isCurrent: association.is_current,
        timePeriod: association.time_period,
      }),
      slug: association.id,
      stableSourceId: `exocorpse:character-location:${association.id}`,
      status: PUBLISHED_STATUS,
      summary: association.notes,
      title: `Character location ${association.id}`,
    })),
    ...characterWorlds.map((link) => ({
      blocks: [],
      collectionSlug: "character-worlds",
      metadata: sourceMetadata("character_worlds", link.id, {
        characterId: link.character_id,
        worldId: link.world_id,
      }),
      profileData: {},
      slug: link.id,
      stableSourceId: `exocorpse:character-world:${link.id}`,
      status: PUBLISHED_STATUS,
      title: `Character world ${link.id}`,
    })),
  ] satisfies ManifestEntry[];
}

function portfolioEntries({
  artPieces,
  gameGallery,
  gamePieces,
  writingPieces,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  const galleryByGame = new Map<
    string,
    Tables<"game_piece_gallery_images">[]
  >();

  for (const image of gameGallery) {
    galleryByGame.set(image.game_piece_id, [
      ...(galleryByGame.get(image.game_piece_id) ?? []),
      image,
    ]);
  }

  return [
    ...artPieces.map((art) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: art.title,
          path: art.image_url,
          stableSourceId: `exocorpse:art:${art.id}:image`,
        }),
        assetFromPath({
          altText: `${art.title} thumbnail`,
          path: art.thumbnail_url,
          sortOrder: 1,
          stableSourceId: `exocorpse:art:${art.id}:thumbnail`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: art.description,
          stableSourceId: `exocorpse:art:${art.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "portfolio-art",
      profileData: compactRecord({
        artistName: art.artist_name,
        artistUrl: art.artist_url,
        createdDate: art.created_date,
        displayOrder: art.display_order,
        isFeatured: art.is_featured,
        tags: art.tags,
        year: art.year,
      }),
      slug: art.slug,
      stableSourceId: `exocorpse:art:${art.id}`,
      status: PUBLISHED_STATUS,
      summary: art.description,
      title: art.title,
    })),
    ...writingPieces.map((writing) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: writing.title,
          path: writing.cover_image,
          stableSourceId: `exocorpse:writing:${writing.id}:cover`,
        }),
        assetFromPath({
          altText: `${writing.title} thumbnail`,
          path: writing.thumbnail_url,
          sortOrder: 1,
          stableSourceId: `exocorpse:writing:${writing.id}:thumbnail`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: writing.content,
          stableSourceId: `exocorpse:writing:${writing.id}:content`,
          title: "Writing content",
        }),
      ]),
      collectionSlug: "portfolio-writing",
      profileData: compactRecord({
        createdDate: writing.created_date,
        displayOrder: writing.display_order,
        isFeatured: writing.is_featured,
        tags: writing.tags,
        wordCount: writing.word_count,
        year: writing.year,
      }),
      slug: writing.slug,
      stableSourceId: `exocorpse:writing:${writing.id}`,
      status: PUBLISHED_STATUS,
      summary: writing.excerpt,
      title: writing.title,
    })),
    ...gamePieces.map((game) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: game.title,
          path: game.cover_image_url,
          stableSourceId: `exocorpse:game:${game.id}:cover`,
        }),
        ...(galleryByGame.get(game.id) ?? []).map((image, index) =>
          assetFromPath({
            altText: image.description ?? `${game.title} gallery ${index + 1}`,
            path: image.image_url,
            sortOrder: index + 1,
            stableSourceId: `exocorpse:game:${game.id}:gallery:${image.id}`,
          }),
        ),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: game.description,
          stableSourceId: `exocorpse:game:${game.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "portfolio-games",
      profileData: compactRecord({
        gameUrl: game.game_url,
      }),
      slug: game.slug,
      stableSourceId: `exocorpse:game:${game.id}`,
      status: PUBLISHED_STATUS,
      summary: game.description,
      title: game.title,
    })),
  ] satisfies ManifestEntry[];
}

function commerceEntries({
  addons,
  blacklistedUsers,
  services,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return [
    ...services.map((service) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: service.name,
          path: service.cover_image_url,
          stableSourceId: `exocorpse:service:${service.service_id}:cover`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: service.description,
          stableSourceId: `exocorpse:service:${service.service_id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "commission-services",
      profileData: compactRecord({
        basePrice: service.base_price,
        commLink: service.comm_link,
        isActive: service.is_active,
      }),
      slug: service.slug,
      stableSourceId: `exocorpse:service:${service.service_id}`,
      status: service.is_active ? PUBLISHED_STATUS : DRAFT_STATUS,
      summary: service.description,
      title: service.name,
    })),
    ...addons.map((addon) => ({
      blocks: [],
      collectionSlug: "commission-addons",
      profileData: compactRecord({
        isExclusive: addon.is_exclusive,
        percentage: addon.percentage,
        priceImpact: addon.price_impact,
      }),
      slug: slugify(addon.name, addon.addon_id),
      stableSourceId: `exocorpse:addon:${addon.addon_id}`,
      status: PUBLISHED_STATUS,
      summary: addon.description,
      title: addon.name,
    })),
    ...blacklistedUsers.map((user) => ({
      blocks: [],
      collectionSlug: "commission-blacklist",
      profileData: compactRecord({
        timestamp: user.timestamp,
        username: user.username,
      }),
      slug: slugify(user.username, user.id),
      stableSourceId: `exocorpse:blacklist:${user.id}`,
      status: PUBLISHED_STATUS,
      summary: user.reasoning,
      title: user.username,
    })),
  ] satisfies ManifestEntry[];
}

function commerceSupportingEntries({
  pictures,
  serviceAddons,
  styles,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return [
    ...styles.map((style) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: style.description,
          stableSourceId: `exocorpse:commission-style:${style.style_id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "commission-styles",
      metadata: sourceMetadata("styles", style.style_id, {
        serviceId: style.service_id,
      }),
      profileData: {},
      slug: style.slug,
      stableSourceId: `exocorpse:commission-style:${style.style_id}`,
      status: PUBLISHED_STATUS,
      summary: style.description,
      title: style.name,
    })),
    ...pictures.map((picture) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: picture.caption ?? picture.picture_id,
          path: picture.image_url,
          stableSourceId: `exocorpse:commission-picture:${picture.picture_id}:image`,
        }),
      ]),
      blocks: [],
      collectionSlug: "commission-pictures",
      metadata: sourceMetadata("pictures", picture.picture_id, {
        serviceId: picture.service_id,
        styleId: picture.style_id,
      }),
      profileData: compactRecord({
        caption: picture.caption,
        isPrimaryExample: picture.is_primary_example,
        uploadedAt: picture.uploaded_at,
      }),
      slug: picture.picture_id,
      stableSourceId: `exocorpse:commission-picture:${picture.picture_id}`,
      status: PUBLISHED_STATUS,
      summary: picture.caption,
      title: picture.caption ?? `Commission picture ${picture.picture_id}`,
    })),
    ...serviceAddons.map((link) => ({
      blocks: [],
      collectionSlug: "commission-service-addons",
      metadata: sourceMetadata(
        "service_addons",
        `${link.service_id}:${link.addon_id}`,
        {
          addonId: link.addon_id,
          serviceId: link.service_id,
        },
      ),
      profileData: compactRecord({
        addonIsExclusive: link.addon_is_exclusive,
      }),
      slug: `${link.service_id}-${link.addon_id}`,
      stableSourceId: `exocorpse:service-addon:${link.service_id}:${link.addon_id}`,
      status: PUBLISHED_STATUS,
      title: `Service addon ${link.service_id} / ${link.addon_id}`,
    })),
  ] satisfies ManifestEntry[];
}

function blogAndHeavenEntries({
  blogPosts,
  heavenAssets,
  heavenPassages,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return [
    ...blogPosts.map((post) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: post.title,
          path: post.cover_url,
          stableSourceId: `exocorpse:blog:${post.id}:cover`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: post.content,
          stableSourceId: `exocorpse:blog:${post.id}:content`,
          title: "Post content",
        }),
      ]),
      collectionSlug: "blog-posts",
      profileData: compactRecord({
        publishedAt: post.published_at,
      }),
      slug: post.slug,
      stableSourceId: `exocorpse:blog:${post.id}`,
      status: post.published_at ? PUBLISHED_STATUS : DRAFT_STATUS,
      summary: post.excerpt,
      title: post.title,
    })),
    ...heavenPassages.map((passage) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: passage.content,
          stableSourceId: `exocorpse:heaven-passage:${passage.id}:body`,
          title: "Passage body",
        }),
      ]),
      collectionSlug: "heaven-space-passages",
      profileData: compactRecord({
        displayOrder: passage.display_order,
        passageKey: passage.name,
      }),
      slug: slugify(passage.name, passage.id),
      stableSourceId: `exocorpse:heaven-passage:${passage.id}`,
      status: PUBLISHED_STATUS,
      summary: passage.content,
      title: passage.name,
    })),
    ...heavenAssets.map((asset) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: asset.alt_text ?? asset.filename,
          path: asset.image_url,
          stableSourceId: `exocorpse:heaven-asset:${asset.id}:image`,
        }),
      ]),
      blocks: [],
      collectionSlug: "heaven-space-assets",
      profileData: compactRecord({
        displayOrder: asset.display_order,
        filename: asset.filename,
      }),
      slug: slugify(asset.filename, asset.id),
      stableSourceId: `exocorpse:heaven-asset:${asset.id}`,
      status: PUBLISHED_STATUS,
      summary: asset.alt_text,
      title: asset.filename,
    })),
  ] satisfies ManifestEntry[];
}

function heavenSceneEntries({
  heavenSceneChoices,
  heavenScenes,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return [
    ...heavenScenes.map((scene) => ({
      blocks: [
        {
          blockType: "scene-body",
          content: {
            bodyBlocks: scene.body_blocks,
          },
          stableSourceId: `exocorpse:heaven-scene:${scene.id}:body`,
          title: "Scene body",
        },
      ],
      collectionSlug: "heaven-space-scenes",
      metadata: sourceMetadata("heaven_space_scenes", scene.id, {
        imageAssetId: scene.image_asset_id,
      }),
      profileData: compactRecord({
        displayOrder: scene.display_order,
        ending: scene.ending,
        entryEffects: scene.entry_effects,
        imageFilename: scene.image_filename,
        isStart: scene.is_start,
        legacyName: scene.legacy_name,
        legacySource: scene.legacy_source,
        mapPositionX: scene.map_position_x,
        mapPositionY: scene.map_position_y,
      }),
      slug: scene.slug,
      stableSourceId: `exocorpse:heaven-scene:${scene.id}`,
      status: PUBLISHED_STATUS,
      subtitle: scene.ending,
      title: scene.title,
    })),
    ...heavenSceneChoices.map((choice) => ({
      blocks: [],
      collectionSlug: "heaven-space-scene-choices",
      metadata: sourceMetadata("heaven_space_scene_choices", choice.id, {
        sceneId: choice.scene_id,
        targetSceneId: choice.target_scene_id,
      }),
      profileData: compactRecord({
        conditions: choice.conditions,
        displayOrder: choice.display_order,
        effects: choice.effects,
        label: choice.label,
        targetSceneSlug: choice.target_scene_slug,
      }),
      slug: choice.id,
      stableSourceId: `exocorpse:heaven-scene-choice:${choice.id}`,
      status: PUBLISHED_STATUS,
      title: choice.label,
    })),
  ] satisfies ManifestEntry[];
}

function timelineEntries({
  eventFactions,
  eventParticipants,
  events,
  timelines,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return [
    ...timelines.map((timeline) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: timeline.description,
          stableSourceId: `exocorpse:timeline:${timeline.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "timelines",
      metadata: sourceMetadata("timelines", timeline.id, {
        worldId: timeline.world_id,
      }),
      profileData: compactRecord({
        color: timeline.color,
        endDate: timeline.end_date,
        eraName: timeline.era_name,
        icon: timeline.icon,
        startDate: timeline.start_date,
      }),
      slug: timeline.id,
      stableSourceId: `exocorpse:timeline:${timeline.id}`,
      status: PUBLISHED_STATUS,
      summary: timeline.description,
      title: timeline.name,
    })),
    ...events.map((event) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: event.name,
          path: event.image_url,
          stableSourceId: `exocorpse:event:${event.id}:image`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: event.content,
          stableSourceId: `exocorpse:event:${event.id}:content`,
          title: "Event content",
        }),
        markdownBlock({
          content: event.outcome,
          stableSourceId: `exocorpse:event:${event.id}:outcome`,
          title: "Outcome",
        }),
        markdownBlock({
          content: event.significance,
          stableSourceId: `exocorpse:event:${event.id}:significance`,
          title: "Significance",
        }),
      ]),
      collectionSlug: "events",
      metadata: sourceMetadata("events", event.id, {
        eventTypeId: event.event_type_id,
        locationId: event.location_id,
        timelineId: event.timeline_id,
        worldId: event.world_id,
      }),
      profileData: compactRecord({
        casualties: event.casualties,
        color: event.color,
        date: event.date,
        dateYear: event.date_year,
        duration: event.duration,
      }),
      slug: event.slug,
      stableSourceId: `exocorpse:event:${event.id}`,
      status: PUBLISHED_STATUS,
      summary: event.summary ?? event.description,
      title: event.name,
    })),
    ...eventParticipants.map((participant) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: participant.description,
          stableSourceId: `exocorpse:event-participant:${participant.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "event-participants",
      metadata: sourceMetadata("event_participants", participant.id, {
        characterId: participant.character_id,
        eventId: participant.event_id,
      }),
      profileData: compactRecord({
        role: participant.role,
      }),
      slug: participant.id,
      stableSourceId: `exocorpse:event-participant:${participant.id}`,
      status: PUBLISHED_STATUS,
      summary: participant.description,
      title: `Event participant ${participant.id}`,
    })),
    ...eventFactions.map((faction) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: faction.description,
          stableSourceId: `exocorpse:event-faction:${faction.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "event-factions",
      metadata: sourceMetadata("event_factions", faction.id, {
        eventId: faction.event_id,
        factionId: faction.faction_id,
      }),
      profileData: compactRecord({
        role: faction.role,
      }),
      slug: faction.id,
      stableSourceId: `exocorpse:event-faction:${faction.id}`,
      status: PUBLISHED_STATUS,
      summary: faction.description,
      title: `Event faction ${faction.id}`,
    })),
  ] satisfies ManifestEntry[];
}

function taxonomyAndMediaEntries({
  entityTags,
  mediaAssets,
  moodboards,
  tags,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return [
    ...tags.map((tag) => ({
      blocks: onlyBlocks([
        markdownBlock({
          content: tag.description,
          stableSourceId: `exocorpse:tag:${tag.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "tags",
      metadata: sourceMetadata("tags", tag.id),
      profileData: compactRecord({
        category: tag.category,
        color: tag.color,
        icon: tag.icon,
        useCount: tag.use_count,
      }),
      slug: tag.slug,
      stableSourceId: `exocorpse:tag:${tag.id}`,
      status: PUBLISHED_STATUS,
      summary: tag.description,
      title: tag.name,
    })),
    ...entityTags.map((tagLink) => ({
      blocks: [],
      collectionSlug: "entity-tags",
      metadata: sourceMetadata("entity_tags", tagLink.id, {
        entityId: tagLink.entity_id,
        entityType: tagLink.entity_type,
        tagId: tagLink.tag_id,
      }),
      profileData: {},
      slug: tagLink.id,
      stableSourceId: `exocorpse:entity-tag:${tagLink.id}`,
      status: PUBLISHED_STATUS,
      title: `Entity tag ${tagLink.id}`,
    })),
    ...moodboards.map((moodboard) => ({
      assets: onlyAssets(
        (moodboard.images ?? []).map((imagePath, index) =>
          assetFromPath({
            altText: `${moodboard.name} image ${index + 1}`,
            path: imagePath,
            sortOrder: index,
            stableSourceId: `exocorpse:moodboard:${moodboard.id}:image:${index}`,
          }),
        ),
      ),
      blocks: onlyBlocks([
        markdownBlock({
          content: moodboard.description,
          stableSourceId: `exocorpse:moodboard:${moodboard.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "moodboards",
      metadata: sourceMetadata("moodboards", moodboard.id, {
        entityId: moodboard.entity_id,
        entityType: moodboard.entity_type,
      }),
      profileData: compactRecord({
        colorPalette: moodboard.color_palette,
      }),
      slug: `${slugify(moodboard.name, moodboard.id)}-${moodboard.id}`,
      stableSourceId: `exocorpse:moodboard:${moodboard.id}`,
      status: PUBLISHED_STATUS,
      summary: moodboard.description,
      title: moodboard.name,
    })),
    ...mediaAssets.map((media) => ({
      assets: onlyAssets([
        assetFromPath({
          altText: media.name,
          assetType: media.media_type,
          path: media.file_url,
          stableSourceId: `exocorpse:media:${media.id}:file`,
        }),
        assetFromPath({
          altText: `${media.name} thumbnail`,
          path: media.thumbnail_url,
          sortOrder: 1,
          stableSourceId: `exocorpse:media:${media.id}:thumbnail`,
        }),
      ]),
      blocks: onlyBlocks([
        markdownBlock({
          content: media.description,
          stableSourceId: `exocorpse:media:${media.id}:description`,
          title: "Description",
        }),
      ]),
      collectionSlug: "media-assets",
      metadata: sourceMetadata("media_assets", media.id),
      profileData: compactRecord({
        artist: media.artist,
        duration: media.duration,
        fileSize: media.file_size,
        folder: media.folder,
        height: media.height,
        license: media.license,
        mediaType: media.media_type,
        mimeType: media.mime_type,
        source: media.source,
        tags: media.tags,
        width: media.width,
      }),
      slug: `${slugify(media.name, media.id)}-${media.id}`,
      stableSourceId: `exocorpse:media:${media.id}`,
      status: PUBLISHED_STATUS,
      summary: media.description,
      title: media.name,
    })),
  ] satisfies ManifestEntry[];
}

function cofiEntries({
  cofiSamples,
}: Awaited<ReturnType<typeof loadExocorpseSourceData>>) {
  return cofiSamples.map((sample) => ({
    assets: onlyAssets([
      assetFromPath({
        altText: `${sample.artist_name} original`,
        path: sample.original_local_path,
        stableSourceId: `exocorpse:cofi:${sample.id}:original`,
      }),
      assetFromPath({
        altText: `${sample.artist_name} thumbnail`,
        path: sample.thumbnail_local_path,
        sortOrder: 1,
        stableSourceId: `exocorpse:cofi:${sample.id}:thumbnail`,
      }),
    ]),
    blocks: [],
    collectionSlug: "cofi-samples",
    metadata: compactRecord({
      originalBytes: sample.original_bytes,
      originalContentType: sample.original_content_type,
      originalRemoteUrl: sample.original_image_url,
      thumbnailBytes: sample.thumbnail_bytes,
      thumbnailContentType: sample.thumbnail_content_type,
      thumbnailRemoteUrl: sample.thumbnail_url,
    }),
    profileData: compactRecord({
      artistName: sample.artist_name,
      artistSlug: sample.artist_slug,
      boothLocation: sample.booth_location,
      boothType: sample.booth_type,
      joiningDate: sample.joining_date,
      snapshotIndex: sample.snapshot_index,
      sourceSampleId: sample.source_sample_id,
    }),
    slug: `${sample.artist_slug}-${sample.snapshot_index}`,
    stableSourceId: `exocorpse:cofi:${sample.id}`,
    status: PUBLISHED_STATUS,
    summary: `${sample.artist_name} at ${sample.booth_location}`,
    title: sample.artist_name,
  })) satisfies ManifestEntry[];
}

function getExocorpseSourceTableCounts(
  sourceData: Awaited<ReturnType<typeof loadExocorpseSourceData>>,
): ExocorpseSourceTableCounts {
  return {
    about_content_items: sourceData.aboutItems.length,
    about_faqs: sourceData.aboutFaqs.length,
    about_page_settings: sourceData.aboutSettings ? 1 : 0,
    addons: sourceData.addons.length,
    art_pieces: sourceData.artPieces.length,
    blacklisted_users: sourceData.blacklistedUsers.length,
    blog_posts: sourceData.blogPosts.length,
    characters: sourceData.characters.length,
    character_factions: sourceData.characterFactions.length,
    character_gallery: sourceData.characterGallery.length,
    character_locations: sourceData.characterLocations.length,
    character_outfits: sourceData.characterOutfits.length,
    character_relationships: sourceData.characterRelationships.length,
    character_worlds: sourceData.characterWorlds.length,
    cofi_samples: sourceData.cofiSamples.length,
    entity_tags: sourceData.entityTags.length,
    event_factions: sourceData.eventFactions.length,
    event_participants: sourceData.eventParticipants.length,
    event_types: sourceData.eventTypes.length,
    events: sourceData.events.length,
    factions: sourceData.factions.length,
    game_piece_gallery_images: sourceData.gameGallery.length,
    game_pieces: sourceData.gamePieces.length,
    heaven_space_assets: sourceData.heavenAssets.length,
    heaven_space_passages: sourceData.heavenPassages.length,
    heaven_space_scene_choices: sourceData.heavenSceneChoices.length,
    heaven_space_scenes: sourceData.heavenScenes.length,
    locations: sourceData.locations.length,
    locations_gallery_images: sourceData.locationsGallery.length,
    media_assets: sourceData.mediaAssets.length,
    moodboards: sourceData.moodboards.length,
    outfit_types: sourceData.outfitTypes.length,
    pictures: sourceData.pictures.length,
    relationship_types: sourceData.relationshipTypes.length,
    service_addons: sourceData.serviceAddons.length,
    services: sourceData.services.length,
    stories: sourceData.stories.length,
    styles: sourceData.styles.length,
    tags: sourceData.tags.length,
    timelines: sourceData.timelines.length,
    worlds: sourceData.worlds.length,
    writing_pieces: sourceData.writingPieces.length,
  };
}

function buildManifestFromSourceData(
  sourceData: Awaited<ReturnType<typeof loadExocorpseSourceData>>,
): ExocorpseExternalProjectManifest {
  return {
    adapter: "exocorpse",
    content: {
      entries: [
        ...aboutEntries(sourceData),
        ...wikiEntries(sourceData),
        ...wikiTypeEntries(sourceData),
        ...worldStructureEntries(sourceData),
        ...characterSupportingEntries(sourceData),
        ...portfolioEntries(sourceData),
        ...commerceEntries(sourceData),
        ...commerceSupportingEntries(sourceData),
        ...blogAndHeavenEntries(sourceData),
        ...heavenSceneEntries(sourceData),
        ...timelineEntries(sourceData),
        ...taxonomyAndMediaEntries(sourceData),
        ...cofiEntries(sourceData),
      ],
    },
    schema: {
      collections: [
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "about",
          description:
            "About page settings migrated from the Exocorpse database.",
          slug: "about",
          title: "About Settings",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "about-content",
          description:
            "About page cards, social links, DNI content, and favorites.",
          slug: "about-content",
          title: "About Content",
        },
        {
          collection_type: "about-faqs",
          description: "About page FAQ answers and username templates.",
          slug: "about-faqs",
          title: "About FAQs",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "stories",
          description: "Story universe records.",
          slug: "stories",
          title: "Stories",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "worlds",
          description: "World records linked back to source story IDs.",
          slug: "worlds",
          title: "Worlds",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "characters",
          description: "Character profiles, lore, and visual assets.",
          slug: "characters",
          title: "Characters",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "relationship-types",
          description: "Character relationship type definitions.",
          slug: "relationship-types",
          title: "Relationship Types",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "outfit-types",
          description: "Character outfit type definitions.",
          slug: "outfit-types",
          title: "Outfit Types",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "event-types",
          description: "Timeline event type definitions.",
          slug: "event-types",
          title: "Event Types",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "factions",
          description: "Organizations, groups, and faction lore.",
          slug: "factions",
          title: "Factions",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "locations",
          description: "World locations, maps, geography, and history.",
          slug: "locations",
          title: "Locations",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "location-gallery",
          description: "Location gallery images and attribution.",
          slug: "location-gallery",
          title: "Location Gallery",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "character-outfits",
          description: "Character outfits and reference images.",
          slug: "character-outfits",
          title: "Character Outfits",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "character-gallery",
          description: "Character gallery images and attribution.",
          slug: "character-gallery",
          title: "Character Gallery",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "character-relationships",
          description: "Source character relationship edges.",
          slug: "character-relationships",
          title: "Character Relationships",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "character-factions",
          description: "Character faction memberships.",
          slug: "character-factions",
          title: "Character Factions",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "character-locations",
          description: "Character location associations.",
          slug: "character-locations",
          title: "Character Locations",
        },
        {
          collection_type: "character-worlds",
          description: "Character world membership links.",
          slug: "character-worlds",
          title: "Character Worlds",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "portfolio-art",
          description: "Art portfolio entries.",
          slug: "portfolio-art",
          title: "Portfolio Art",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "portfolio-writing",
          description: "Writing portfolio entries.",
          slug: "portfolio-writing",
          title: "Portfolio Writing",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "portfolio-games",
          description: "Game portfolio entries and galleries.",
          slug: "portfolio-games",
          title: "Portfolio Games",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "commission-services",
          description: "Commission service offerings.",
          slug: "commission-services",
          title: "Commission Services",
        },
        {
          collection_type: "commission-addons",
          description: "Commission addons and price modifiers.",
          slug: "commission-addons",
          title: "Commission Addons",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "commission-styles",
          description: "Commission styles linked to services.",
          slug: "commission-styles",
          title: "Commission Styles",
        },
        {
          assetTypes: ["image"],
          collection_type: "commission-pictures",
          description: "Commission service and style example pictures.",
          slug: "commission-pictures",
          title: "Commission Pictures",
        },
        {
          collection_type: "commission-service-addons",
          description: "Service-to-addon relationship records.",
          slug: "commission-service-addons",
          title: "Commission Service Addons",
        },
        {
          collection_type: "commission-blacklist",
          description: "Commission blacklist records.",
          slug: "commission-blacklist",
          title: "Commission Blacklist",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "blog-posts",
          description: "Blog posts.",
          slug: "blog-posts",
          title: "Blog Posts",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "heaven-space-passages",
          description: "Heaven Space visual-novel passages.",
          slug: "heaven-space-passages",
          title: "Heaven Space Passages",
        },
        {
          assetTypes: ["image"],
          collection_type: "heaven-space-assets",
          description: "Heaven Space public assets.",
          slug: "heaven-space-assets",
          title: "Heaven Space Assets",
        },
        {
          blockTypes: ["scene-body"],
          collection_type: "heaven-space-scenes",
          description: "Heaven Space scene graph records.",
          slug: "heaven-space-scenes",
          title: "Heaven Space Scenes",
        },
        {
          collection_type: "heaven-space-scene-choices",
          description: "Heaven Space scene graph choice records.",
          slug: "heaven-space-scene-choices",
          title: "Heaven Space Scene Choices",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "timelines",
          description: "World timeline records.",
          slug: "timelines",
          title: "Timelines",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "events",
          description: "Timeline events and event content.",
          slug: "events",
          title: "Events",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "event-participants",
          description: "Event participant character links.",
          slug: "event-participants",
          title: "Event Participants",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "event-factions",
          description: "Event faction links.",
          slug: "event-factions",
          title: "Event Factions",
        },
        {
          blockTypes: ["markdown"],
          collection_type: "tags",
          description: "Reusable wiki and portfolio tags.",
          slug: "tags",
          title: "Tags",
        },
        {
          collection_type: "entity-tags",
          description: "Tag-to-entity relationship records.",
          slug: "entity-tags",
          title: "Entity Tags",
        },
        {
          assetTypes: ["image"],
          blockTypes: ["markdown"],
          collection_type: "moodboards",
          description: "Moodboards and visual reference sets.",
          slug: "moodboards",
          title: "Moodboards",
        },
        {
          assetTypes: ["image", "audio", "video", "document"],
          blockTypes: ["markdown"],
          collection_type: "media-assets",
          description: "Generic media asset library records.",
          slug: "media-assets",
          title: "Media Assets",
        },
        {
          assetTypes: ["image"],
          collection_type: "cofi-samples",
          description: "COFI artist samples, thumbnails, and booth metadata.",
          slug: "cofi-samples",
          title: "COFI Samples",
        },
      ],
      profileFields: [
        { key: "brand", label: "Brand", type: "string" },
        { key: "sourceDatabase", label: "Source database", type: "string" },
        { key: "deliveryPreset", label: "Delivery preset", type: "string" },
      ],
    },
    version: 1,
  };
}

export async function buildExocorpseExternalProjectManifestWithSource(): Promise<{
  manifest: ExocorpseExternalProjectManifest;
  sourceCounts: ExocorpseSourceTableCounts;
}> {
  const sourceData = await loadExocorpseSourceData();

  return {
    manifest: buildManifestFromSourceData(
      sourceData,
    ) satisfies ExocorpseExternalProjectManifest,
    sourceCounts: getExocorpseSourceTableCounts(sourceData),
  };
}

export async function buildExocorpseExternalProjectManifest(): Promise<ExocorpseExternalProjectManifest> {
  return (await buildExocorpseExternalProjectManifestWithSource()).manifest;
}
