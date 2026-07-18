"use server";

import {
  getCmsArtPieceBySlug,
  getCmsArtPieces,
  getCmsFeaturedArtPieces,
  getCmsFeaturedWritingPieces,
  getCmsGamePieceById,
  getCmsGamePieceBySlug,
  getCmsGamePieces,
  getCmsWritingPieceBySlug,
  getCmsWritingPieces,
} from "@/lib/tuturuuu-cms-delivery";
import type {
  ArtPiece,
  GamePiece,
  GamePieceGalleryImage,
  WritingPiece,
} from "@/types/exocorpse-content";

export type { ArtPiece, GamePiece, GamePieceGalleryImage, WritingPiece };

export async function getArtPieces(): Promise<ArtPiece[]> {
  return (await getCmsArtPieces()) ?? [];
}
export async function getArtPieceBySlug(slug: string) {
  return getCmsArtPieceBySlug(slug);
}
export async function getFeaturedArtPieces(): Promise<ArtPiece[]> {
  return (await getCmsFeaturedArtPieces()) ?? [];
}
export async function getWritingPieces(): Promise<WritingPiece[]> {
  return (await getCmsWritingPieces()) ?? [];
}
export async function getWritingPieceBySlug(slug: string) {
  return getCmsWritingPieceBySlug(slug);
}
export async function getFeaturedWritingPieces(): Promise<WritingPiece[]> {
  return (await getCmsFeaturedWritingPieces()) ?? [];
}
export async function getGamePieces(): Promise<GamePiece[]> {
  return (await getCmsGamePieces()) ?? [];
}
export async function getGamePieceBySlug(slug: string) {
  return getCmsGamePieceBySlug(slug);
}
export async function getGamePieceById(id: string) {
  return getCmsGamePieceById(id);
}
export async function getGamePieceGalleryImages(
  gamePieceId: string,
): Promise<GamePieceGalleryImage[]> {
  const piece = await getCmsGamePieceById(gamePieceId);
  return piece?.game_piece_gallery_images ?? [];
}
