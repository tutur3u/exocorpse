"use server";

import { verifyAuth } from "@/lib/auth/utils";
import {
  createExocorpseCmsAsset,
  createExocorpseCmsEntryBundle,
  deleteExocorpseCmsAsset,
  deleteExocorpseCmsEntry,
  ensureCharacterGalleryTaggingDefinition,
  getExocorpseCmsStudio,
  reorderExocorpseCmsEntries,
  reorderExocorpseCmsAssets,
  setExocorpseCmsEntryVisibility,
  updateExocorpseCmsEntryBundle,
} from "@/lib/tuturuuu-cms-repository";
import type { ExocorpseJson } from "@/types/exocorpse-cms";
import { revalidatePath } from "next/cache";

export async function getAdminCmsStudio() {
  await verifyAuth();
  return getExocorpseCmsStudio();
}

export async function saveAdminCmsEntry(payload: {
  blocks: Array<{
    blockType: string;
    content: ExocorpseJson;
    id?: string;
    sortOrder?: number;
    stableSourceId?: string | null;
    title?: string | null;
  }>;
  collectionSlug?: string;
  entry: Record<string, unknown>;
  entryId?: string;
  expectedUpdatedAt?: string;
  relations: Array<{
    definitionId: string;
    metadata?: ExocorpseJson;
    sortOrder?: number;
    toEntryId: string;
  }>;
}) {
  await verifyAuth();
  const collectionId = payload.entry.collectionId;
  if (
    payload.collectionSlug === "character-gallery" &&
    typeof collectionId === "string"
  ) {
    await ensureCharacterGalleryTaggingDefinition(collectionId);
  }
  const bundlePayload = {
    blocks: payload.blocks,
    entry: payload.entry,
    relations: payload.relations,
  };
  const result = payload.entryId
    ? await updateExocorpseCmsEntryBundle(
        payload.entryId,
        payload.expectedUpdatedAt ?? "",
        bundlePayload,
      )
    : await createExocorpseCmsEntryBundle(bundlePayload);
  revalidatePath("/admin", "layout");
  return result;
}

export async function deleteAdminCmsEntry(entryId: string) {
  await verifyAuth();
  await deleteExocorpseCmsEntry(entryId);
  revalidatePath("/admin", "layout");
}

export async function reorderAdminCmsEntries(
  order: Array<{ entryId: string; sortOrder: number }>,
) {
  await verifyAuth();
  const entries = await reorderExocorpseCmsEntries(order);
  revalidatePath("/admin", "layout");
  return entries;
}

export async function reorderAdminCmsAssets(
  order: Array<{ assetId: string; sortOrder: number }>,
) {
  await verifyAuth();
  const assets = await reorderExocorpseCmsAssets(order);
  revalidatePath("/admin", "layout");
  return assets;
}

export async function setAdminCmsEntryVisibility(
  entryId: string,
  visibility: "draft" | "published" | "unlisted",
) {
  await verifyAuth();
  const result = await setExocorpseCmsEntryVisibility(entryId, visibility);
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  return result;
}

export async function registerAdminCmsAsset(input: {
  assetType?: string;
  entryId: string;
  fileName: string;
  fileType: string;
  metadata?: ExocorpseJson;
  storagePath: string;
}) {
  await verifyAuth();
  const assetType =
    input.assetType ?? (input.fileType.split("/")[0] || "image");
  if (
    !input.entryId ||
    !input.fileName ||
    input.fileName.length > 255 ||
    !/^[a-z][a-z0-9-]{0,63}$/.test(assetType) ||
    !input.storagePath.startsWith("external-projects/") ||
    input.storagePath.length > 1024
  ) {
    throw new Error("The uploaded media record is invalid.");
  }
  const asset = await createExocorpseCmsAsset({
    alt_text: input.fileName,
    asset_type: assetType,
    entry_id: input.entryId,
    metadata: input.metadata,
    storage_path: input.storagePath,
  });
  revalidatePath("/admin", "layout");
  return asset;
}

export async function deleteAdminCmsAsset(assetId: string) {
  await verifyAuth();
  await deleteExocorpseCmsAsset(assetId);
  revalidatePath("/admin", "layout");
}
