"use server";

import { verifyAuth } from "@/lib/auth/utils";
import { getSupabaseServer } from "@/lib/supabase/server";
import sanitizeHtml from "sanitize-html";
import type { Tables } from "../../../supabase/types";

export type ArtPiece = Tables<"art_pieces">;
export type WritingPiece = Tables<"writing_pieces">;

// ============================================================================
// ART PIECES - READ OPERATIONS
// ============================================================================

/**
 * Fetch all art pieces (public - non-deleted only)
 */
export async function getArtPieces() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("art_pieces")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching art pieces:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all art pieces including soft-deleted (admin only)
 */
export async function getAllArtPiecesAdmin() {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("art_pieces")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all art pieces:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single art piece by slug
 */
export async function getArtPieceBySlug(slug: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("art_pieces")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error("Error fetching art piece:", error);
    return null;
  }

  return data;
}

/**
 * Fetch featured art pieces for rotating gallery
 */
export async function getFeaturedArtPieces() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("art_pieces")
    .select("*")
    .eq("is_featured", true)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching featured art pieces:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// ART PIECES - WRITE OPERATIONS
// ============================================================================

/**
 * Create a new art piece
 */
export async function createArtPiece(artPiece: {
  slug: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  year?: number;
  created_date?: string;
  tags?: string[];
  is_featured?: boolean;
  display_order?: number;
  artist_name?: string;
  artist_url?: string;
}) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("art_pieces")
    .insert(artPiece)
    .select()
    .single();

  if (error) {
    console.error("Error creating art piece:", error);
    throw error;
  }

  return data;
}

/**
 * Update an existing art piece
 */
export async function updateArtPiece(
  id: string,
  updates: Partial<Omit<ArtPiece, "id" | "created_at">>,
) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("art_pieces")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating art piece:", error);
    throw error;
  }

  return data;
}

/**
 * Delete an art piece (soft delete)
 */
export async function deleteArtPiece(id: string) {
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("art_pieces")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting art piece:", error);
    throw error;
  }
}

// ============================================================================
// WRITING PIECES - READ OPERATIONS
// ============================================================================

/**
 * Fetch all writing pieces (public - non-deleted only)
 */
export async function getWritingPieces() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("writing_pieces")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching writing pieces:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all writing pieces including soft-deleted (admin only)
 */
export async function getAllWritingPiecesAdmin() {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("writing_pieces")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all writing pieces:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single writing piece by slug
 */
export async function getWritingPieceBySlug(slug: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("writing_pieces")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error("Error fetching writing piece:", error);
    return null;
  }

  return data;
}

/**
 * Fetch featured writing pieces for rotating gallery
 */
export async function getFeaturedWritingPieces() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("writing_pieces")
    .select("*")
    .eq("is_featured", true)
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching featured writing pieces:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// WRITING PIECES - WRITE OPERATIONS
// ============================================================================

/**
 * Create a new writing piece
 */
export async function createWritingPiece(writingPiece: {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  thumbnail_url?: string;
  year?: number;
  created_date?: string;
  tags?: string[];
  is_featured?: boolean;
  display_order?: number;
  word_count?: number;
}) {
  const { supabase } = await verifyAuth();

  // Sanitize content before saving
  const sanitizedContent = sanitizeHtml(writingPiece.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "style"],
    },
  });

  const { data, error } = await supabase
    .from("writing_pieces")
    .insert({ ...writingPiece, content: sanitizedContent })
    .select()
    .single();

  if (error) {
    console.error("Error creating writing piece:", error);
    throw error;
  }

  return data;
}

/**
 * Update an existing writing piece
 */
export async function updateWritingPiece(
  id: string,
  updates: Partial<Omit<WritingPiece, "id" | "created_at">>,
) {
  const { supabase } = await verifyAuth();

  // Sanitize content if it's being updated
  const sanitizedUpdates = updates.content
    ? {
        ...updates,
        content: sanitizeHtml(updates.content, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            "*": ["class", "style"],
          },
        }),
      }
    : updates;

  const { data, error } = await supabase
    .from("writing_pieces")
    .update(sanitizedUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating writing piece:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a writing piece (soft delete)
 */
export async function deleteWritingPiece(id: string) {
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("writing_pieces")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting writing piece:", error);
    throw error;
  }
}
