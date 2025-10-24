/**
 * Cached data fetching functions for ISR support
 *
 * This module provides cached versions of data fetching functions
 * to enable Incremental Static Regeneration (ISR) for public pages.
 *
 * Revalidation: 50 minutes (3000 seconds)
 * - Aligns with storage URL cache duration
 * - Provides fresh content while minimizing API calls
 */

import { REVALIDATE_TIME } from "@/constants";
import { unstable_cache } from "next/cache";
import { getBlacklistedUsersPaginated } from "./actions/blacklist";
import {
  getBlogPostBySlug,
  getPublishedBlogPostsPaginated,
} from "./actions/blog";
import {
  getCharacterBySlug,
  getCharacterBySlugInStory,
  getCharacterFactions,
  getCharacterGallery,
  getCharacterOutfits,
  getCharactersByStorySlug,
  getCharactersByWorldSlug,
  getCharacterWorlds,
  getFactionBySlug,
  getFactionsByWorldSlug,
  getPublishedStories,
  getStoryBySlug,
  getWorldBySlug,
  getWorldsByStorySlug,
} from "./actions/wiki";

// ============================================================================
// Wiki Data Caching
// ============================================================================

/**
 * Cached: Fetch all published stories
 */
export const getCachedStories = unstable_cache(
  async () => getPublishedStories(),
  ["wiki-stories"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-stories"],
  },
);

/**
 * Cached: Fetch story by slug
 */
export const getCachedStoryBySlug = unstable_cache(
  async (slug: string) => getStoryBySlug(slug),
  ["wiki-story-by-slug"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-stories"],
  },
);

/**
 * Cached: Fetch worlds by story slug
 */
export const getCachedWorldsByStory = unstable_cache(
  async (storySlug: string) => getWorldsByStorySlug(storySlug),
  ["wiki-worlds-by-story"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-worlds"],
  },
);

/**
 * Cached: Fetch world by slug
 */
export const getCachedWorldBySlug = unstable_cache(
  async (storySlug: string, worldSlug: string) =>
    getWorldBySlug(storySlug, worldSlug),
  ["wiki-world-by-slug"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-worlds"],
  },
);

/**
 * Cached: Fetch characters by world slug
 */
export const getCachedCharactersByWorld = unstable_cache(
  async (storySlug: string, worldSlug: string) =>
    getCharactersByWorldSlug(storySlug, worldSlug),
  ["wiki-characters-by-world"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-characters"],
  },
);

/**
 * Cached: Fetch characters by story slug
 */
export const getCachedCharactersByStory = unstable_cache(
  async (storySlug: string) => getCharactersByStorySlug(storySlug),
  ["wiki-characters-by-story"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-characters"],
  },
);

/**
 * Cached: Fetch character by slug
 */
export const getCachedCharacterBySlug = unstable_cache(
  async (storySlug: string, worldSlug: string, characterSlug: string) =>
    getCharacterBySlug(storySlug, worldSlug, characterSlug),
  ["wiki-character-by-slug"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-characters"],
  },
);

/**
 * Cached: Fetch character by slug in story (without world)
 */
export const getCachedCharacterBySlugInStory = unstable_cache(
  async (storySlug: string, characterSlug: string) =>
    getCharacterBySlugInStory(storySlug, characterSlug),
  ["wiki-character-by-slug-in-story"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-characters"],
  },
);

/**
 * Cached: Fetch character gallery
 */
export const getCachedCharacterGallery = unstable_cache(
  async (characterId: string) => getCharacterGallery(characterId),
  ["wiki-character-gallery"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-character-gallery"],
  },
);

/**
 * Cached: Fetch character outfits
 */
export const getCachedCharacterOutfits = unstable_cache(
  async (characterId: string) => getCharacterOutfits(characterId),
  ["wiki-character-outfits"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-character-outfits"],
  },
);

/**
 * Cached: Fetch character factions
 */
export const getCachedCharacterFactions = unstable_cache(
  async (characterId: string) => getCharacterFactions(characterId),
  ["wiki-character-factions"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-character-factions"],
  },
);

/**
 * Cached: Fetch character worlds
 */
export const getCachedCharacterWorlds = unstable_cache(
  async (characterId: string) => getCharacterWorlds(characterId),
  ["wiki-character-worlds"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-character-worlds"],
  },
);

/**
 * Cached: Fetch factions by world slug
 */
export const getCachedFactionsByWorld = unstable_cache(
  async (storySlug: string, worldSlug: string) =>
    getFactionsByWorldSlug(storySlug, worldSlug),
  ["wiki-factions-by-world"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-factions"],
  },
);

/**
 * Cached: Fetch faction by slug
 */
export const getCachedFactionBySlug = unstable_cache(
  async (storySlug: string, worldSlug: string, factionSlug: string) =>
    getFactionBySlug(storySlug, worldSlug, factionSlug),
  ["wiki-faction-by-slug"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["wiki-factions"],
  },
);

// ============================================================================
// Blog Data Caching
// ============================================================================

/**
 * Cached: Fetch paginated blog posts
 */
export const getCachedBlogPostsPaginated = unstable_cache(
  async (page: number, pageSize: number) =>
    getPublishedBlogPostsPaginated(page, pageSize),
  ["blog-posts-paginated"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["blog-posts"],
  },
);

/**
 * Cached: Fetch blog post by slug
 */
export const getCachedBlogPostBySlug = unstable_cache(
  async (slug: string) => getBlogPostBySlug(slug),
  ["blog-post-by-slug"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["blog-posts"],
  },
);

// ============================================================================
// Commission/Blacklist Data Caching
// ============================================================================

/**
 * Cached: Fetch paginated blacklisted users
 */
export const getCachedBlacklistedUsers = unstable_cache(
  async (page: number, pageSize: number) =>
    getBlacklistedUsersPaginated(page, pageSize),
  ["blacklist-paginated"],
  {
    revalidate: REVALIDATE_TIME,
    tags: ["blacklist"],
  },
);

// ============================================================================
// Cache Tag Helpers
// ============================================================================

/**
 * Cache tags used throughout the application
 * Use these for manual revalidation via revalidateTag()
 */
export const CACHE_TAGS = {
  // Wiki
  WIKI_STORIES: "wiki-stories",
  WIKI_WORLDS: "wiki-worlds",
  WIKI_CHARACTERS: "wiki-characters",
  WIKI_CHARACTER_GALLERY: "wiki-character-gallery",
  WIKI_CHARACTER_OUTFITS: "wiki-character-outfits",
  WIKI_CHARACTER_FACTIONS: "wiki-character-factions",
  WIKI_CHARACTER_WORLDS: "wiki-character-worlds",
  WIKI_FACTIONS: "wiki-factions",

  // Blog
  BLOG_POSTS: "blog-posts",

  // Commission
  BLACKLIST: "blacklist",

  // Storage
  STORAGE_URLS: "storage-urls",
} as const;
