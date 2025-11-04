"use server";

import { verifyAuth } from "@/lib/auth/utils";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Tables } from "../../../supabase/types";

export type Story = Tables<"stories">;
export type World = Tables<"worlds">;
export type Character = Tables<"characters">;
export type Faction = Tables<"factions">;
export type CharacterDetail = Tables<"character_details">;
export type CharacterFaction = Tables<"character_factions">;

/**
 * Fetch all stories (including unpublished, since RLS is disabled)
 */
export async function getPublishedStories() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new story
 */
export async function createStory(story: {
  title: string;
  slug: string;
  description?: string;
  summary?: string;
  theme_primary_color?: string;
  theme_secondary_color?: string;
  theme_background_color?: string;
  theme_text_color?: string;
  theme_custom_css?: string;
  theme_background_image?: string;
  content?: string;
  is_published?: boolean;
  visibility?: "public" | "unlisted" | "private";
}) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("stories")
    .insert(story)
    .select()
    .single();

  if (error) {
    console.error("Error creating story:", error);
    throw error;
  }

  return data;
}

/**
 * Update an existing story
 */
export async function updateStory(
  id: string,
  updates: Partial<Omit<Story, "id" | "created_at">>,
) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("stories")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error updating story:", error);
    throw error;
  }

  if (!data) {
    throw new Error("Story not found");
  }

  return data;
}

/**
 * Delete a story (hard delete)
 */
export async function deleteStory(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  // First, get the story to find its images
  const { data: story } = await supabase
    .from("stories")
    .select("theme_background_image")
    .eq("id", id)
    .single();

  // Hard delete the story
  const { error } = await supabase.from("stories").delete().eq("id", id);

  if (error) {
    console.error("Error deleting story:", error);
    throw error;
  }

  // Clean up storage images asynchronously (fire and forget)
  if (story?.theme_background_image) {
    (async () => {
      try {
        const { deleteFile } = await import("./storage");
        const imagePath = story.theme_background_image;
        if (imagePath && !imagePath.startsWith("http")) {
          await deleteFile(imagePath);
        }
      } catch (imgError) {
        console.error("Error deleting story images:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
  }
}

/**
 * Fetch a story by slug with its worlds
 */
export async function getStoryBySlug(slug: string) {
  const supabase = await getSupabaseServer();

  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select(
      `
      *,
      worlds (
        *
      )
    `,
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("visibility", "public")
    .maybeSingle();

  if (storyError) {
    console.error("Error fetching story:", storyError);
    return null;
  }

  return story;
}

/**
 * Fetch all worlds for a story by story slug
 */
export async function getWorldsByStorySlug(storySlug: string) {
  const supabase = await getSupabaseServer();

  // First get the story
  const { data: story } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", storySlug)
    .single();

  if (!story) return [];

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("story_id", story.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching worlds:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all worlds for a story
 */
/**
 * Fetch all worlds (without story filter)
 */
export async function getAllWorlds() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching all worlds:", error);
    return [];
  }

  return data || [];
}

export async function getWorldsByStoryId(storyId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("story_id", storyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching worlds:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a world by slug
 */
export async function getWorldBySlug(storySlug: string, worldSlug: string) {
  const supabase = await getSupabaseServer();

  // First get the story
  const { data: story } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", storySlug)
    .maybeSingle();

  if (!story) return null;

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("story_id", story.id)
    .eq("slug", worldSlug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching world:", error);
    return null;
  }

  return data;
}

/**
 * Fetch all characters for a story by story slug (across all worlds)
 */
export async function getCharactersByStorySlug(storySlug: string) {
  const supabase = await getSupabaseServer();

  // First get the story
  const { data: story } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", storySlug)
    .single();

  if (!story) return [];

  // Get all worlds for this story
  const { data: worlds } = await supabase
    .from("worlds")
    .select("id")
    .eq("story_id", story.id)
    .is("deleted_at", null);

  if (!worlds || worlds.length === 0) return [];

  const worldIds = worlds.map((w) => w.id);

  // Get all characters across all worlds
  const { data, error } = await supabase
    .from("character_worlds")
    .select("characters(*)")
    .in("world_id", worldIds)
    .is("characters.deleted_at", null)
    .order("name", { ascending: true, referencedTable: "characters" });

  if (error) {
    console.error("Error fetching characters:", error);
    return [];
  }

  // Extract character data and remove duplicates (since a character can be in multiple worlds)
  const characterMap = new Map<string, Character>();
  (data || []).forEach((cw) => {
    const character = (cw as { characters: Character }).characters;
    if (character && !characterMap.has(character.id)) {
      characterMap.set(character.id, character);
    }
  });

  return Array.from(characterMap.values());
}

/**
 * Fetch all characters for a world by world slug
 */
export async function getCharactersByWorldSlug(
  storySlug: string,
  worldSlug: string,
) {
  const supabase = await getSupabaseServer();

  // First get the world
  const world = await getWorldBySlug(storySlug, worldSlug);
  if (!world) return [];

  const { data, error } = await supabase
    .from("character_worlds")
    .select("characters(*)")
    .eq("world_id", world.id)
    .is("characters.deleted_at", null)
    .order("name", { ascending: true, referencedTable: "characters" });

  if (error) {
    console.error("Error fetching characters:", error);
    return [];
  }

  // Extract character data from the join result
  return (data || [])
    .map((cw) => (cw as { characters: Character }).characters)
    .filter((c: Character | null) => c !== null) as Character[];
}

/**
 * Fetch all characters for a story (from all worlds in that story)
 */
/**
 * Fetch all characters (without story/world filter)
 */
export async function getAllCharacters() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching all characters:", error);
    return [];
  }

  return data || [];
}

export async function getCharactersByStoryId(storyId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("character_worlds")
    .select("characters(*), world_id, worlds!inner(story_id)")
    .eq("worlds.story_id", storyId)
    .is("characters.deleted_at", null)
    .order("name", { referencedTable: "characters", ascending: true });

  if (error) {
    console.error("Error fetching characters by story:", error);
    return [];
  }

  // Extract unique characters from the join result
  const characterMap = new Map<string, Character>();
  (data || []).forEach((cw) => {
    const character = (cw as { characters: Character }).characters;
    if (character && !characterMap.has(character.id)) {
      characterMap.set(character.id, character);
    }
  });

  return Array.from(characterMap.values());
}

/**
 * Fetch all characters for a world
 */
export async function getCharactersByWorldId(worldId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("character_worlds")
    .select("characters(*)")
    .eq("world_id", worldId)
    .is("characters.deleted_at", null)
    .order("name", { referencedTable: "characters", ascending: true });

  if (error) {
    console.error("Error fetching characters:", error);
    return [];
  }

  // Extract character data from the join result
  const characters = (data || [])
    .map((cw) => (cw as { characters: Character }).characters)
    .filter((c: Character | null) => c !== null) as Character[];

  return characters;
}

/**
 * Fetch character details with factions by character slug
 */
export async function getCharacterBySlug(
  storySlug: string,
  worldSlug: string,
  characterSlug: string,
) {
  const supabase = await getSupabaseServer();

  // First get the world to scope the character lookup
  const world = await getWorldBySlug(storySlug, worldSlug);
  if (!world) return null;

  // Get character through the character_worlds junction table
  const { data: characterWorldData, error: cwError } = await supabase
    .from("character_worlds")
    .select("character_id")
    .eq("world_id", world.id);

  if (cwError) {
    console.error("Error fetching character-world relationships:", cwError);
    return null;
  }

  const characterIds = (characterWorldData ?? []).map((cw) => cw.character_id);

  if (characterIds.length === 0) return null;

  const { data, error } = await supabase
    .from("character_details")
    .select("*")
    .eq("slug", characterSlug)
    .in("id", characterIds)
    .maybeSingle();

  if (error) {
    console.error("Error fetching character:", error);
    return null;
  }

  return data;
}

/**
 * Fetch character by slug within a story (across all worlds)
 */
export async function getCharacterBySlugInStory(
  storySlug: string,
  characterSlug: string,
) {
  const supabase = await getSupabaseServer();

  // First get the story
  const { data: story } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", storySlug)
    .maybeSingle();

  if (!story) return null;

  // Get all worlds for this story
  const { data: worlds } = await supabase
    .from("worlds")
    .select("id")
    .eq("story_id", story.id)
    .is("deleted_at", null);

  if (!worlds || worlds.length === 0) return null;

  const worldIds = worlds.map((w) => w.id);

  // Get character through the character_worlds junction table
  const { data: characterWorldData, error: cwError } = await supabase
    .from("character_worlds")
    .select("character_id")
    .in("world_id", worldIds);

  if (cwError) {
    console.error("Error fetching character-world relationships:", cwError);
    return null;
  }

  const characterIds = (characterWorldData ?? []).map((cw) => cw.character_id);

  if (characterIds.length === 0) return null;

  const { data, error } = await supabase
    .from("character_details")
    .select("*")
    .eq("slug", characterSlug)
    .in("id", characterIds)
    .maybeSingle();

  if (error) {
    console.error("Error fetching character:", error);
    return null;
  }

  return data;
}

/**
 * Fetch character gallery images
 */
export async function getCharacterGallery(characterId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("character_gallery")
    .select("*")
    .eq("character_id", characterId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching character gallery:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all character detail data in a single database query
 * This is optimized for initial page load to reduce database round trips
 */
export async function getCharacterDetailData(characterId: string): Promise<{
  gallery: Awaited<ReturnType<typeof getCharacterGallery>>;
  outfits: Awaited<ReturnType<typeof getCharacterOutfits>>;
  factions: Awaited<ReturnType<typeof getCharacterFactions>>;
  worlds: Awaited<ReturnType<typeof getCharacterWorlds>>;
  relationships: CharacterRelationshipEnhanced[];
}> {
  const supabase = await getSupabaseServer();

  // Fetch the character with all related data in a single query
  const { data: character, error: characterError } = await supabase
    .from("characters")
    .select(
      `
      id,
      character_gallery (
        *
      ),
      character_outfits (
        *,
        outfit_types (*)
      ),
      character_factions (
        *,
        factions (*)
      ),
      character_worlds (
        *,
        worlds!inner (*)
      )
    `,
    )
    .eq("id", characterId)
    .is("character_worlds.worlds.deleted_at", null)
    .single();

  if (characterError) {
    console.error("Error fetching character detail data:", characterError);
    return {
      gallery: [],
      outfits: [],
      factions: [],
      worlds: [],
      relationships: [],
    };
  }

  // Sort gallery by display_order
  const gallery = (character?.character_gallery || []).sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0),
  );

  // Sort outfits by display_order
  const outfits = (character?.character_outfits || []).sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0),
  );

  // Sort factions by created_at (newest first)
  const factions = (character?.character_factions || []).sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  // Sort worlds by created_at (newest first)
  const worlds = (character?.character_worlds || []).sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  // Fetch relationships separately using RPC (can't be joined easily)
  const { data: relationships, error: relError } = await supabase.rpc(
    "get_character_relationships",
    {
      character_uuid: characterId,
    },
  );

  if (relError) {
    console.error("Error fetching character relationships:", relError);
  }

  return {
    gallery,
    outfits,
    factions,
    worlds,
    relationships: (relationships || []) as CharacterRelationshipEnhanced[],
  };
}

/**
 * Create a new character gallery item
 */
export async function createCharacterGalleryItem(data: {
  character_id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  artist_name?: string;
  artist_url?: string;
  commission_date?: string;
  tags?: string[];
  is_featured?: boolean;
  display_order?: number;
}) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data: result, error } = await supabase
    .from("character_gallery")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating character gallery item:", error);
    throw error;
  }

  return result;
}

/**
 * Update a character gallery item
 */
export async function updateCharacterGalleryItem(
  id: string,
  updates: {
    title?: string;
    description?: string;
    image_url?: string;
    thumbnail_url?: string;
    artist_name?: string;
    artist_url?: string;
    commission_date?: string;
    tags?: string[];
    is_featured?: boolean;
    display_order?: number;
  },
) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("character_gallery")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error updating character gallery item:", error);
    throw error;
  }

  if (!data) {
    throw new Error("Gallery item not found");
  }

  return data;
}

/**
 * Delete a character gallery item (hard delete)
 */
export async function deleteCharacterGalleryItem(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  // First, get the gallery item to find its images
  const { data: galleryItem } = await supabase
    .from("character_gallery")
    .select("image_url, thumbnail_url")
    .eq("id", id)
    .single();

  // Hard delete the gallery item
  const { error } = await supabase
    .from("character_gallery")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting character gallery item:", error);
    throw error;
  }

  // Clean up storage images asynchronously (fire and forget)
  if (galleryItem) {
    (async () => {
      try {
        const { deleteFile } = await import("./storage");

        const imageUrl = galleryItem.image_url;
        if (imageUrl && !imageUrl.startsWith("http")) {
          await deleteFile(imageUrl);
        }

        const thumbnailUrl = galleryItem.thumbnail_url;
        if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
          await deleteFile(thumbnailUrl);
        }
      } catch (imgError) {
        console.error("Error deleting gallery item images:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
  }
}

/**
 * Reorder character gallery items
 */
export async function reorderCharacterGallery(
  items: { id: string; display_order: number }[],
) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  // Update each item's display_order
  const updates = items.map((item) =>
    supabase
      .from("character_gallery")
      .update({ display_order: item.display_order })
      .eq("id", item.id),
  );

  const results = await Promise.all(updates);

  // Check for errors
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    console.error("Error reordering character gallery:", errors);
    throw new Error("Failed to reorder gallery items");
  }
}

/**
 * Fetch character outfits
 */
export async function getCharacterOutfits(characterId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("character_outfits")
    .select(
      `
      *,
      outfit_types (*)
    `,
    )
    .eq("character_id", characterId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching character outfits:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all factions for a story by story slug (across all worlds)
 */
export async function getFactionsByStorySlug(storySlug: string) {
  const supabase = await getSupabaseServer();

  // First get the story
  const { data: story } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", storySlug)
    .single();

  if (!story) return [];

  // Get all worlds for this story
  const { data: worlds } = await supabase
    .from("worlds")
    .select("id")
    .eq("story_id", story.id)
    .is("deleted_at", null);

  if (!worlds || worlds.length === 0) return [];

  const worldIds = worlds.map((w) => w.id);

  // Get all factions across all worlds
  const { data, error } = await supabase
    .from("factions")
    .select("*")
    .in("world_id", worldIds)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching factions:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all factions for a world by world slug
 */
export async function getFactionsByWorldSlug(
  storySlug: string,
  worldSlug: string,
) {
  const supabase = await getSupabaseServer();

  // First get the world
  const world = await getWorldBySlug(storySlug, worldSlug);
  if (!world) return [];

  const { data, error } = await supabase
    .from("factions")
    .select("*")
    .eq("world_id", world.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching factions:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all factions for a world
 */
export async function getFactionsByWorldId(worldId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("factions")
    .select("*")
    .eq("world_id", worldId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching factions:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all unique factions for a story (from all worlds in that story) in a single query
 * This replaces the N+1 pattern of fetching factions for each world individually
 */
export async function getFactionsByStoryId(storyId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("factions")
    .select("*")
    .eq("worlds!inner(story_id)", storyId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching factions by story:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all factions from only the worlds that a character belongs to
 * This ensures characters can only be assigned to factions in compatible worlds
 */
export async function getFactionsByCharacterWorldIds(characterId: string) {
  const supabase = await getSupabaseServer();

  // First, get the world IDs that this character belongs to
  const { data: characterWorldsData, error: cwError } = await supabase
    .from("character_worlds")
    .select("world_id")
    .eq("character_id", characterId);

  if (cwError) {
    console.error("Error fetching character worlds:", cwError);
    return [];
  }

  const worldIds = (characterWorldsData || []).map((cw) => cw.world_id);

  if (worldIds.length === 0) {
    return [];
  }

  // Then fetch factions only from those worlds
  const { data, error } = await supabase
    .from("factions")
    .select("*")
    .in("world_id", worldIds)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching factions by character worlds:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a faction by slug
 */
/**
 * Fetch faction by story and faction slug (without requiring world slug)
 * Returns faction with its world information
 */
export async function getFactionBySlugInStory(
  storySlug: string,
  factionSlug: string,
) {
  const supabase = await getSupabaseServer();

  // First get the story
  const { data: story } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", storySlug)
    .maybeSingle();

  if (!story) return null;

  // Get all worlds for this story
  const { data: worlds } = await supabase
    .from("worlds")
    .select("id, slug")
    .eq("story_id", story.id)
    .is("deleted_at", null);

  if (!worlds || worlds.length === 0) return null;

  const worldIds = worlds.map((w) => w.id);

  // Find the faction in any of these worlds
  const { data, error } = await supabase
    .from("factions")
    .select("*, worlds(*)")
    .eq("slug", factionSlug)
    .in("world_id", worldIds)
    .maybeSingle();

  if (error) {
    console.error("Error fetching faction:", error);
    return null;
  }

  return data;
}

export async function getFactionBySlug(
  storySlug: string,
  worldSlug: string,
  factionSlug: string,
) {
  const supabase = await getSupabaseServer();

  // First get the world to scope the faction lookup
  const world = await getWorldBySlug(storySlug, worldSlug);
  if (!world) return null;

  const { data, error } = await supabase
    .from("factions")
    .select("*")
    .eq("slug", factionSlug)
    .eq("world_id", world.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching faction:", error);
    return null;
  }

  return data;
}

// ============================================================================
// WORLD CRUD OPERATIONS
// ============================================================================

/**
 * Create a new world
 */
export async function createWorld(world: {
  story_id: string;
  name: string;
  slug: string;
  description?: string;
  summary?: string;
  world_type?: string;
  size?: string;
  population?: number;
  theme_primary_color?: string;
  theme_secondary_color?: string;
  theme_background_image?: string;
  theme_map_image?: string;
  content?: string;
}) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("worlds")
    .insert(world)
    .select()
    .single();

  if (error) {
    console.error("Error creating world:", error);
    throw error;
  }

  return data;
}

/**
 * Update an existing world
 */
export async function updateWorld(
  id: string,
  updates: Partial<Omit<World, "id" | "created_at">>,
) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("worlds")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error updating world:", error);
    throw error;
  }

  if (!data) {
    throw new Error("World not found");
  }

  return data;
}

/**
 * Delete a world (hard delete)
 */
export async function deleteWorld(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  // First, get the world to find its images
  const { data: world } = await supabase
    .from("worlds")
    .select("theme_background_image, theme_map_image")
    .eq("id", id)
    .single();

  // Hard delete the world
  const { error } = await supabase.from("worlds").delete().eq("id", id);

  if (error) {
    console.error("Error deleting world:", error);
    throw error;
  }

  // Clean up storage images asynchronously (fire and forget)
  if (world) {
    (async () => {
      try {
        const { deleteFile } = await import("./storage");

        const bgImage = world.theme_background_image;
        if (bgImage && !bgImage.startsWith("http")) {
          await deleteFile(bgImage);
        }

        const mapImage = world.theme_map_image;
        if (mapImage && !mapImage.startsWith("http")) {
          await deleteFile(mapImage);
        }
      } catch (imgError) {
        console.error("Error deleting world images:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
  }
}

// ============================================================================
// CHARACTER CRUD OPERATIONS
// ============================================================================

/**
 * Create a new character
 */
export async function createCharacter(character: {
  world_ids: string[]; // Changed from world_id to world_ids array
  name: string;
  slug: string;
  nickname?: string;
  title?: string;
  age?: number;
  age_description?: string;
  species?: string;
  gender?: string;
  pronouns?: string;
  height?: string;
  weight?: string;
  build?: string;
  hair_color?: string;
  eye_color?: string;
  skin_tone?: string;
  distinguishing_features?: string;
  status?: "alive" | "deceased" | "unknown" | "missing" | "imprisoned";
  occupation?: string;
  personality_summary?: string;
  likes?: string;
  dislikes?: string;
  fears?: string;
  goals?: string;
  backstory?: string;
  lore?: string;
  skills?: string;
  abilities?: string;
  strengths?: string;
  weaknesses?: string;
  profile_image?: string;
  banner_image?: string;
  color_scheme?: string;
}) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  // Extract world_ids from the character data
  const { world_ids, ...characterData } = character;

  // Insert the character without world_ids
  const { data, error } = await supabase
    .from("characters")
    .insert(characterData)
    .select()
    .single();

  if (error) {
    console.error("Error creating character:", error);
    throw error;
  }

  // Create entries in character_worlds junction table
  if (world_ids && world_ids.length > 0) {
    // Deduplicate world_ids using a Set
    const uniqueWorldIds = Array.from(new Set(world_ids));

    const characterWorldsData = uniqueWorldIds.map((worldId) => ({
      character_id: data.id,
      world_id: worldId,
    }));

    // Skip DB call if the resulting array is empty
    if (characterWorldsData.length === 0) {
      return data;
    }

    const { error: cwError } = await supabase
      .from("character_worlds")
      .upsert(characterWorldsData, {
        onConflict: "character_id,world_id",
      });

    if (cwError) {
      console.error("Error creating character-world relationships:", cwError);
      // Optionally rollback by deleting the character
      const { error: rollbackError } = await supabase
        .from("characters")
        .delete()
        .eq("id", data.id);
      if (rollbackError) {
        console.error(
          "Rollback failed: could not delete character after character-world relationship creation failed:",
          rollbackError,
        );
      }
      throw cwError;
    }
  }

  return data;
}

/**
 * Update an existing character
 */
export async function updateCharacter(
  id: string,
  updates: Partial<
    Omit<Character, "id" | "created_at"> & { world_ids?: string[] }
  >,
) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  // Extract world_ids if present
  const { world_ids, ...characterUpdates } = updates as {
    world_ids?: string[];
    [key: string]: unknown;
  };

  // Update the character
  let data: Character | null;
  let error: unknown;

  if (Object.keys(characterUpdates).length === 0) {
    // If no character updates, fetch and return the current row
    const result = await supabase
      .from("characters")
      .select()
      .eq("id", id)
      .maybeSingle();
    data = result.data;
    error = result.error;
  } else {
    // Perform the update
    const result = await supabase
      .from("characters")
      .update(characterUpdates)
      .eq("id", id)
      .select()
      .maybeSingle();
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error("Error updating character:", error);
    throw error;
  }

  if (!data) {
    throw new Error("Character not found");
  }

  // If world_ids is provided, update the character_worlds relationships using the database function
  if (world_ids !== undefined) {
    const { data: result, error: cwError } = await supabase.rpc(
      "update_character_worlds",
      {
        p_character_id: id,
        p_world_ids: world_ids,
      },
    );

    if (cwError) {
      console.error("Error updating character-world relationships:", cwError);
      throw cwError;
    }

    if (!result || !result[0]?.success) {
      const errorMessage =
        result?.[0]?.message || "Failed to update character worlds";
      console.error("Character world update failed:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  return data;
}

/**
 * Delete a character (hard delete)
 */
export async function deleteCharacter(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  // First, get the character and gallery items to find images
  const { data: character } = await supabase
    .from("characters")
    .select("profile_image")
    .eq("id", id)
    .single();

  const { data: galleryItems } = await supabase
    .from("character_gallery")
    .select("image_url, thumbnail_url")
    .eq("character_id", id);

  // Hard delete the character (cascades to gallery items via foreign key)
  const { error } = await supabase.from("characters").delete().eq("id", id);

  if (error) {
    console.error("Error deleting character:", error);
    throw error;
  }

  // Clean up storage images asynchronously (fire and forget)
  (async () => {
    try {
      const { deleteFile } = await import("./storage");

      // Delete character profile image
      const profileImage = character?.profile_image;
      if (profileImage && !profileImage.startsWith("http")) {
        await deleteFile(profileImage);
      }

      // Delete all gallery item images
      if (galleryItems && galleryItems.length > 0) {
        for (const item of galleryItems) {
          const imageUrl = item.image_url;
          if (imageUrl && !imageUrl.startsWith("http")) {
            await deleteFile(imageUrl);
          }
          const thumbnailUrl = item.thumbnail_url;
          if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
            await deleteFile(thumbnailUrl);
          }
        }
      }
    } catch (imgError) {
      console.error("Error deleting character images:", imgError);
      // Fire and forget - errors are logged but don't affect the response
    }
  })();
}

// ============================================================================
// FACTION CRUD OPERATIONS
// ============================================================================

/**
 * Create a new faction
 */
export async function createFaction(faction: {
  world_id: string;
  name: string;
  slug: string;
  description?: string;
  summary?: string;
  faction_type?: string;
  founding_date?: string;
  status?: string;
  primary_goal?: string;
  ideology?: string;
  reputation?: string;
  power_level?: string;
  member_count?: number;
  logo_url?: string;
  color_scheme?: string;
  banner_image?: string;
  content?: string;
}) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("factions")
    .insert(faction)
    .select()
    .single();

  if (error) {
    console.error("Error creating faction:", error);
    throw error;
  }

  return data;
}

/**
 * Update an existing faction
 */
export async function updateFaction(
  id: string,
  updates: Partial<Omit<Faction, "id" | "created_at">>,
) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("factions")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error updating faction:", error);
    throw error;
  }

  if (!data) {
    throw new Error("Faction not found");
  }

  return data;
}

/**
 * Delete a faction (hard delete)
 */
export async function deleteFaction(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  // First, get the faction to find its images
  const { data: faction } = await supabase
    .from("factions")
    .select("logo_url, banner_image")
    .eq("id", id)
    .single();

  // Hard delete the faction
  const { error } = await supabase.from("factions").delete().eq("id", id);

  if (error) {
    console.error("Error deleting faction:", error);
    throw error;
  }

  // Clean up storage images asynchronously (fire and forget)
  if (faction) {
    (async () => {
      try {
        const { deleteFile } = await import("./storage");

        const logoUrl = faction.logo_url;
        if (logoUrl && !logoUrl.startsWith("http")) {
          await deleteFile(logoUrl);
        }

        const bannerImage = faction.banner_image;
        if (bannerImage && !bannerImage.startsWith("http")) {
          await deleteFile(bannerImage);
        }
      } catch (imgError) {
        console.error("Error deleting faction images:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
  }
}

// ============================================================================
// CHARACTER-FACTION RELATIONSHIP OPERATIONS
// ============================================================================

/**
 * Get all faction memberships for a character
 */
export async function getCharacterFactions(characterId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("character_factions")
    .select(
      `
      *,
      factions (*)
    `,
    )
    .eq("character_id", characterId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching character factions:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all characters in a faction
 */
export async function getFactionMembers(factionId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("character_factions")
    .select(
      `
      *,
      characters (*)
    `,
    )
    .eq("faction_id", factionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching faction members:", error);
    return [];
  }

  return data || [];
}

/**
 * Add a character to a faction
 */
export async function addCharacterToFaction(data: {
  character_id: string;
  faction_id: string;
  role?: string;
  rank?: string;
  is_current?: boolean;
}) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data: result, error } = await supabase
    .from("character_factions")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error adding character to faction:", error);
    throw error;
  }

  return result;
}

/**
 * Update character-faction membership
 */
export async function updateCharacterFaction(
  id: string,
  updates: Partial<
    Omit<CharacterFaction, "id" | "created_at" | "character_id" | "faction_id">
  >,
) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("character_factions")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error updating character faction:", error);
    throw error;
  }

  if (!data) {
    throw new Error("Character faction not found");
  }

  return data;
}

/**
 * Remove a character from a faction
 */
export async function removeCharacterFromFaction(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("character_factions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error removing character from faction:", error);
    throw error;
  }
}

// ============================================================================
// CHARACTER-WORLD RELATIONSHIP OPERATIONS
// ============================================================================

/**
 * Get all worlds a character belongs to
 */
export async function getCharacterWorlds(characterId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("character_worlds")
    .select(
      `
      *,
      worlds (*)
    `,
    )
    .eq("character_id", characterId)
    .is("worlds.deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching character worlds:", error);
    return [];
  }

  return data || [];
}

/**
 * Add a character to a world
 */
export async function addCharacterToWorld(data: {
  character_id: string;
  world_id: string;
}) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data: result, error } = await supabase
    .from("character_worlds")
    .upsert(data, { onConflict: "character_id,world_id" })
    .select()
    .single();

  if (error) {
    console.error("Error adding character to world:", error);
    throw error;
  }

  return result;
}

/**
 * Remove a character from a world
 */
export async function removeCharacterFromWorld(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("character_worlds")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error removing character from world:", error);
    throw error;
  }
}

// ============================================================================
// CHARACTER-RELATIONSHIP OPERATIONS
// ============================================================================

export type CharacterRelationship = Tables<"character_relationships">;
export type RelationshipType = Tables<"relationship_types">;

// Enhanced relationship return type from RPC function
export type CharacterRelationshipEnhanced = {
  id: string;
  relationship_id: string;
  description: string | null;
  is_mutual: boolean | null;
  related_character: {
    id: string;
    name: string;
    slug: string;
    nickname: string | null;
    title: string | null;
    age: number | null;
    species: string | null;
    gender: string | null;
    pronouns: string | null;
    status: string | null;
    occupation: string | null;
    profile_image: string | null;
    personality_summary: string | null;
  };
  relationship_type: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    color: string | null;
    icon: string | null;
    is_mutual: boolean | null;
    reverse_name: string | null;
  };
};

/**
 * Get all relationship types (global and story-specific)
 */
export async function getRelationshipTypes(storyId?: string) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from("relationship_types")
    .select("*")
    .order("name", { ascending: true });

  // Get global types (story_id is null) and story-specific types
  if (storyId) {
    query = query.or(`story_id.is.null,story_id.eq.${storyId}`);
  } else {
    query = query.is("story_id", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching relationship types:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all relationships for a character using the enhanced database function
 * Returns comprehensive character and relationship type details
 */
export async function getCharacterRelationships(
  characterId: string,
): Promise<CharacterRelationshipEnhanced[]> {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase.rpc("get_character_relationships", {
    character_uuid: characterId,
  });

  if (error) {
    console.error("Error fetching character relationships:", error);
    return [];
  }

  return (data || []) as CharacterRelationshipEnhanced[];
}

/**
 * Get raw relationship records for a character (for editing)
 */
export async function getCharacterRelationshipRecords(characterId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("character_relationships")
    .select(
      `
      *,
      character_a:characters!character_relationships_character_a_id_fkey(id, name, profile_image),
      character_b:characters!character_relationships_character_b_id_fkey(id, name, profile_image),
      relationship_type:relationship_types(*)
    `,
    )
    .or(`character_a_id.eq.${characterId},character_b_id.eq.${characterId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching character relationship records:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new character relationship
 */
export async function createCharacterRelationship(data: {
  character_a_id: string;
  character_b_id: string;
  relationship_type_id: string;
  description?: string;
  is_mutual?: boolean;
}) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data: result, error } = await supabase
    .from("character_relationships")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating character relationship:", error);
    throw error;
  }

  return result;
}

/**
 * Update an existing character relationship
 */
export async function updateCharacterRelationship(
  id: string,
  updates: Partial<
    Omit<CharacterRelationship, "id" | "created_at" | "updated_at">
  >,
) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("character_relationships")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error updating character relationship:", error);
    throw error;
  }

  if (!data) {
    throw new Error("Character relationship not found");
  }

  return data;
}

/**
 * Delete a character relationship
 */
export async function deleteCharacterRelationship(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("character_relationships")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting character relationship:", error);
    throw error;
  }
}

/**
 * Get characters available for relationships (excludes the given character)
 */
export async function getAvailableCharactersForRelationship(
  characterId: string,
  worldIds?: string[],
) {
  const supabase = await getSupabaseServer();

  let query = supabase
    .from("characters")
    .select("*")
    .neq("id", characterId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  // If world IDs provided, filter by characters in those worlds
  if (worldIds && worldIds.length > 0) {
    const { data: characterWorlds } = await supabase
      .from("character_worlds")
      .select("character_id")
      .in("world_id", worldIds);

    if (characterWorlds && characterWorlds.length > 0) {
      const characterIds = characterWorlds.map((cw) => cw.character_id);
      query = query.in("id", characterIds);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching available characters:", error);
    return [];
  }

  return data || [];
}
