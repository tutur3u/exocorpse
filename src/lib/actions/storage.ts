"use server";

import { verifyAuth } from "@/lib/auth/utils";

/**
 * Managed CMS assets are deleted through their owning entry/asset mutation.
 * These compatibility callbacks reject retired Exocorpse storage paths so a
 * branded form cannot silently recreate the legacy backend.
 */
export async function deleteFile(path: string) {
  await verifyAuth();
  if (path && !/^https?:\/\//i.test(path)) {
    throw new Error(
      "Legacy Exocorpse storage paths are no longer supported. Delete the CMS asset instead.",
    );
  }
  return { success: true };
}

export const deleteCharacterGalleryImage = deleteFile;
export const deleteCharacterOutfitImage = deleteFile;
export const deleteLocationGalleryImage = deleteFile;
export const deleteArtworkImage = deleteFile;
export const deleteWritingImage = deleteFile;
export const deleteBlogImage = deleteFile;
export const deleteGameImage = deleteFile;

export async function deleteCharacterImages(_characterId: string) {
  await verifyAuth();
  return { success: true };
}

export async function getStorageAnalytics() {
  await verifyAuth();
  return {
    cacheStats: { active: 0, expired: 0, total: 0 },
    storage: { fileCount: 0, totalSize: 0 },
  };
}
