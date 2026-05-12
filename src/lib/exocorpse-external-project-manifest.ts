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
    gamePieces,
    gameGallery,
    heavenAssets,
    heavenPassages,
    services,
    addons,
    stories,
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
    assertTableResult(supabase.from("game_pieces").select("*").order("title")),
    assertTableResult(
      supabase
        .from("game_piece_gallery_images")
        .select("*")
        .order("display_order", { ascending: true }),
    ),
    assertTableResult(
      supabase.from("heaven_space_assets").select("*").order("display_order"),
    ),
    assertTableResult(
      supabase.from("heaven_space_passages").select("*").order("display_order"),
    ),
    assertTableResult(supabase.from("services").select("*").order("name")),
    assertTableResult(supabase.from("addons").select("*").order("name")),
    assertTableResult(
      supabase
        .from("stories")
        .select("*")
        .is("deleted_at", null)
        .order("title"),
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
    cofiSamples,
    gameGallery: (gameGallery ?? []) as Tables<"game_piece_gallery_images">[],
    gamePieces: (gamePieces ?? []) as Tables<"game_pieces">[],
    heavenAssets: (heavenAssets ?? []) as Tables<"heaven_space_assets">[],
    heavenPassages: (heavenPassages ?? []) as Tables<"heaven_space_passages">[],
    services: (services ?? []) as Tables<"services">[],
    stories: (stories ?? []) as Tables<"stories">[],
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
        eyeColor: character.eye_color,
        gender: character.gender,
        hairColor: character.hair_color,
        height: character.height,
        nickname: character.nickname,
        occupation: character.occupation,
        personalitySummary: character.personality_summary,
        pronouns: character.pronouns,
        quote: character.quote,
        species: character.species,
        spotifyLink: character.spotify_link,
        status: character.status,
        themePrimaryColor: character.theme_primary_color,
        themeSecondaryColor: character.theme_secondary_color,
        themeTextColor: character.theme_text_color,
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

export async function buildExocorpseExternalProjectManifest(): Promise<ExocorpseExternalProjectManifest> {
  const sourceData = await loadExocorpseSourceData();

  return {
    adapter: "exocorpse",
    content: {
      entries: [
        ...aboutEntries(sourceData),
        ...wikiEntries(sourceData),
        ...portfolioEntries(sourceData),
        ...commerceEntries(sourceData),
        ...blogAndHeavenEntries(sourceData),
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
