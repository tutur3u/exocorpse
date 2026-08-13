"use server";

import { verifyAuth } from "@/lib/auth/utils";
import {
  createExocorpseCmsEntryBundle,
  deleteExocorpseCmsAsset,
  deleteExocorpseCmsEntry,
  getExocorpseCmsStudio,
  reorderExocorpseCmsEntries,
  reorderExocorpseCmsAssets,
  updateExocorpseCmsEntryBundle,
  uploadExocorpseCmsAssetFile,
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
  const result = payload.entryId
    ? await updateExocorpseCmsEntryBundle(
        payload.entryId,
        payload.expectedUpdatedAt ?? "",
        payload,
      )
    : await createExocorpseCmsEntryBundle(payload);
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

export async function uploadAdminCmsAsset(input: {
  collectionType: string;
  entryId: string;
  entrySlug: string;
  formData: FormData;
}) {
  await verifyAuth();
  const file = input.formData.get("file");
  if (!(file instanceof File)) throw new Error("Select a media file.");
  const asset = await uploadExocorpseCmsAssetFile({ ...input, file });
  revalidatePath("/admin", "layout");
  return asset;
}

export async function deleteAdminCmsAsset(assetId: string) {
  await verifyAuth();
  await deleteExocorpseCmsAsset(assetId);
  revalidatePath("/admin", "layout");
}
