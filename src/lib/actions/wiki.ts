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
    .is("deleted_at", null)
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
    .single();

  if (error) {
    console.error("Error updating story:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a story (soft delete)
 */
export async function deleteStory(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("stories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting story:", error);
    throw error;
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
    .is("deleted_at", null)
    .single();

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
    .is("deleted_at", null)
    .single();

  if (!story) return [];

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("story_id", story.id)
    .is("deleted_at", null)
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
export async function getWorldsByStoryId(storyId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("story_id", storyId)
    .is("deleted_at", null)
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
    .single();

  if (!story) return null;

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .eq("story_id", story.id)
    .eq("slug", worldSlug)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error("Error fetching world:", error);
    return null;
  }

  return data;
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
    .order("characters(name)", { ascending: true });

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
 * Fetch all characters for a world
 */
export async function getCharactersByWorldId(worldId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("character_worlds")
    .select("characters(*)")
    .eq("world_id", worldId)
    .is("characters.deleted_at", null);

  if (error) {
    console.error("Error fetching characters:", error);
    return [];
  }

  // Extract character data from the join result and sort
  const characters = (data || [])
    .map((cw) => (cw as { characters: Character }).characters)
    .filter((c: Character | null) => c !== null) as Character[];

  return characters.sort((a, b) => a.name.localeCompare(b.name));
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

  const characterIds = characterWorldData.map((cw) => cw.character_id);

  if (characterIds.length === 0) return null;

  const { data, error } = await supabase
    .from("character_details")
    .select("*")
    .eq("slug", characterSlug)
    .in("id", characterIds)
    .is("deleted_at", null)
    .single();

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
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching character gallery:", error);
    return [];
  }

  return data || [];
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
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching character outfits:", error);
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
    .is("deleted_at", null)
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
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching factions:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a faction by slug
 */
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
    .is("deleted_at", null)
    .single();

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
    .single();

  if (error) {
    console.error("Error updating world:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a world (soft delete)
 */
export async function deleteWorld(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("worlds")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting world:", error);
    throw error;
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
    const characterWorldsData = world_ids.map((worldId) => ({
      character_id: data.id,
      world_id: worldId,
    }));

    const { error: cwError } = await supabase
      .from("character_worlds")
      .insert(characterWorldsData);

    if (cwError) {
      console.error("Error creating character-world relationships:", cwError);
      // Optionally rollback by deleting the character
      await supabase.from("characters").delete().eq("id", data.id);
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
  const { data, error } = await supabase
    .from("characters")
    .update(characterUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating character:", error);
    throw error;
  }

  // If world_ids is provided, update the character_worlds relationships
  if (world_ids !== undefined) {
    // Delete existing relationships
    await supabase.from("character_worlds").delete().eq("character_id", id);

    // Create new relationships
    if (world_ids.length > 0) {
      const characterWorldsData = world_ids.map((worldId) => ({
        character_id: id,
        world_id: worldId,
      }));

      const { error: cwError } = await supabase
        .from("character_worlds")
        .insert(characterWorldsData);

      if (cwError) {
        console.error("Error updating character-world relationships:", cwError);
        throw cwError;
      }
    }
  }

  return data;
}

/**
 * Delete a character (soft delete)
 */
export async function deleteCharacter(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("characters")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting character:", error);
    throw error;
  }
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
    .single();

  if (error) {
    console.error("Error updating faction:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a faction (soft delete)
 */
export async function deleteFaction(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("factions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting faction:", error);
    throw error;
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
    .single();

  if (error) {
    console.error("Error updating character faction:", error);
    throw error;
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
    .insert(data)
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
