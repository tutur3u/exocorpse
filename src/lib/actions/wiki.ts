"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import type { Tables } from "../../../supabase/types";

export type Story = Tables<"stories">;
export type World = Tables<"worlds">;
export type Character = Tables<"characters">;
export type Faction = Tables<"factions">;
export type CharacterDetail = Tables<"character_details">;

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
}) {
  const supabase = await getSupabaseServer();

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
  updates: Partial<Omit<Story, "id" | "created_at">>
) {
  const supabase = await getSupabaseServer();

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
  const supabase = await getSupabaseServer();

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
    `
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
 * Fetch all characters for a world
 */
export async function getCharactersByWorldId(worldId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("world_id", worldId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching characters:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch character details with factions
 */
export async function getCharacterBySlug(characterSlug: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("character_details")
    .select("*")
    .eq("slug", characterSlug)
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
    `
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
export async function getFactionBySlug(factionSlug: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("factions")
    .select("*")
    .eq("slug", factionSlug)
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
}) {
  const supabase = await getSupabaseServer();

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
  updates: Partial<Omit<World, "id" | "created_at">>
) {
  const supabase = await getSupabaseServer();

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
  const supabase = await getSupabaseServer();

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
  world_id: string;
  name: string;
  slug: string;
  nickname?: string;
  personality_summary?: string;
}) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("characters")
    .insert(character)
    .select()
    .single();

  if (error) {
    console.error("Error creating character:", error);
    throw error;
  }

  return data;
}

/**
 * Update an existing character
 */
export async function updateCharacter(
  id: string,
  updates: Partial<Omit<Character, "id" | "created_at">>
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("characters")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating character:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a character (soft delete)
 */
export async function deleteCharacter(id: string) {
  const supabase = await getSupabaseServer();

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
}) {
  const supabase = await getSupabaseServer();

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
  updates: Partial<Omit<Faction, "id" | "created_at">>
) {
  const supabase = await getSupabaseServer();

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
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from("factions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting faction:", error);
    throw error;
  }
}
