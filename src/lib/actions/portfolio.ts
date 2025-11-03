"use server";

import { verifyAuth } from "@/lib/auth/utils";
import { getSupabaseServer } from "@/lib/supabase/server";
import sanitizeHtml from "sanitize-html";
import type { Tables } from "../../../supabase/types";

export type ArtPiece = Tables<"art_pieces">;
export type WritingPiece = Tables<"writing_pieces">;
export type GamePiece = Tables<"game_pieces">;
export type GamePieceGalleryImage = Tables<"game_piece_gallery_images">;

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
 * Delete an art piece (hard delete)
 */
export async function deleteArtPiece(id: string) {
  const { supabase } = await verifyAuth();

  // First, get the art piece to find its images
  const { data: artPiece } = await supabase
    .from("art_pieces")
    .select("image_url, thumbnail_url")
    .eq("id", id)
    .single();

  // Delete the database row
  const { error } = await supabase.from("art_pieces").delete().eq("id", id);

  if (error) {
    console.error("Error deleting art piece:", error);
    throw error;
  }

  // Clean up storage images asynchronously (fire and forget)
  // Don't await this to avoid blocking the response
  if (artPiece) {
    (async () => {
      try {
        const { deleteArtworkImage } = await import("./storage");

        if (artPiece.image_url && !artPiece.image_url.startsWith("http")) {
          await deleteArtworkImage(artPiece.image_url);
        }

        if (
          artPiece.thumbnail_url &&
          !artPiece.thumbnail_url.startsWith("http")
        ) {
          await deleteArtworkImage(artPiece.thumbnail_url);
        }
      } catch (imgError) {
        console.error("Error deleting art piece images:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
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
 * Delete a writing piece (hard delete)
 */
export async function deleteWritingPiece(id: string) {
  const { supabase } = await verifyAuth();

  // First, get the writing piece to find its images
  const { data: writingPiece } = await supabase
    .from("writing_pieces")
    .select("cover_image, thumbnail_url")
    .eq("id", id)
    .single();

  // Delete the database row
  const { error } = await supabase.from("writing_pieces").delete().eq("id", id);

  if (error) {
    console.error("Error deleting writing piece:", error);
    throw error;
  }

  // Clean up storage images asynchronously (fire and forget)
  // Don't await this to avoid blocking the response
  if (writingPiece) {
    (async () => {
      try {
        const { deleteWritingImage } = await import("./storage");

        if (
          writingPiece.cover_image &&
          !writingPiece.cover_image.startsWith("http")
        ) {
          await deleteWritingImage(writingPiece.cover_image);
        }

        if (
          writingPiece.thumbnail_url &&
          !writingPiece.thumbnail_url.startsWith("http")
        ) {
          await deleteWritingImage(writingPiece.thumbnail_url);
        }
      } catch (imgError) {
        console.error("Error deleting writing piece images:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
  }
}

// ============================================================================
// GAME PIECES - READ OPERATIONS
// ============================================================================

/**
 * Fetch all game pieces (public)
 */
export async function getGamePieces() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("game_pieces")
    .select("*, game_piece_gallery_images(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching game pieces:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all game pieces (admin only)
 */
export async function getAllGamePiecesAdmin() {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("game_pieces")
    .select("*, game_piece_gallery_images(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all game pieces:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single game piece by ID with gallery images
 */
export async function getGamePieceById(id: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("game_pieces")
    .select(
      `
      *,
      game_piece_gallery_images (
        *
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching game piece:", error);
    return null;
  }

  return data;
}

/**
 * Fetch a single game piece by slug with gallery images
 */
export async function getGamePieceBySlug(slug: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("game_pieces")
    .select(
      `
      *,
      game_piece_gallery_images (
        *
      )
    `,
    )
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching game piece:", error);
    return null;
  }

  return data;
}

// ============================================================================
// GAME PIECES - WRITE OPERATIONS
// ============================================================================

/**
 * Create a new game piece
 */
export async function createGamePiece(gamePiece: {
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  game_url?: string;
}) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("game_pieces")
    .insert(gamePiece)
    .select()
    .single();

  if (error) {
    console.error("Error creating game piece:", error);
    throw error;
  }

  return data;
}

/**
 * Update an existing game piece
 */
export async function updateGamePiece(
  id: string,
  updates: Partial<Omit<GamePiece, "id" | "created_at">>,
) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("game_pieces")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating game piece:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a game piece (hard delete)
 */
export async function deleteGamePiece(id: string) {
  const { supabase } = await verifyAuth();

  // First, get the game piece to find its cover image
  const { data: gamePiece } = await supabase
    .from("game_pieces")
    .select("cover_image_url")
    .eq("id", id)
    .single();

  // Get all gallery images before deleting
  const { data: galleryImages } = await supabase
    .from("game_piece_gallery_images")
    .select("image_url")
    .eq("game_piece_id", id);

  // Delete the database row (cascade will delete gallery images)
  const { error } = await supabase.from("game_pieces").delete().eq("id", id);

  if (error) {
    console.error("Error deleting game piece:", error);
    throw error;
  }

  // Clean up storage images asynchronously (fire and forget)
  // Don't await this to avoid blocking the response
  if (gamePiece || galleryImages) {
    (async () => {
      try {
        const { deleteGameImage } = await import("./storage");

        // Delete cover image
        if (
          gamePiece?.cover_image_url &&
          !gamePiece.cover_image_url.startsWith("http")
        ) {
          await deleteGameImage(gamePiece.cover_image_url);
        }

        // Delete all gallery images
        if (galleryImages && galleryImages.length > 0) {
          for (const img of galleryImages) {
            if (img.image_url && !img.image_url.startsWith("http")) {
              await deleteGameImage(img.image_url);
            }
          }
        }
      } catch (imgError) {
        console.error("Error deleting game piece images:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
  }
}

// ============================================================================
// GAME PIECE GALLERY IMAGES - OPERATIONS
// ============================================================================

/**
 * Get all gallery images for a game piece
 */
export async function getGamePieceGalleryImages(gamePieceId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("game_piece_gallery_images")
    .select("*")
    .eq("game_piece_id", gamePieceId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching gallery images:", error);
    return [];
  }

  return data || [];
}

/**
 * Add a gallery image to a game piece
 */
export async function addGamePieceGalleryImage(galleryImage: {
  game_piece_id: string;
  image_url: string;
  description?: string;
  display_order?: number;
}) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("game_piece_gallery_images")
    .insert(galleryImage)
    .select()
    .single();

  if (error) {
    console.error("Error adding gallery image:", error);
    throw error;
  }

  return data;
}

/**
 * Update a gallery image
 */
export async function updateGamePieceGalleryImage(
  id: string,
  updates: Partial<Omit<GamePieceGalleryImage, "id" | "game_piece_id">>,
) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("game_piece_gallery_images")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating gallery image:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a gallery image
 */
export async function deleteGamePieceGalleryImage(id: string) {
  const { supabase } = await verifyAuth();

  // First, get the image URL to delete from storage
  const { data: galleryImage } = await supabase
    .from("game_piece_gallery_images")
    .select("image_url")
    .eq("id", id)
    .single();

  // Delete the database row
  const { error } = await supabase
    .from("game_piece_gallery_images")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting gallery image:", error);
    throw error;
  }

  // Clean up storage image asynchronously (fire and forget)
  if (galleryImage?.image_url) {
    (async () => {
      try {
        const { deleteGameImage } = await import("./storage");
        if (!galleryImage.image_url.startsWith("http")) {
          await deleteGameImage(galleryImage.image_url);
        }
      } catch (imgError) {
        console.error("Error deleting gallery image from storage:", imgError);
      }
    })();
  }
}
