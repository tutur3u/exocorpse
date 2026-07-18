"use server";

import { verifyAuth } from "@/lib/auth/utils";
import {
  createExocorpseCmsEntryBundle,
  deleteExocorpseCmsAsset,
  deleteExocorpseCmsEntry,
  getExocorpseCmsStudio,
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
  revalidatePath("/admin/cms");
  return result;
}

export async function deleteAdminCmsEntry(entryId: string) {
  await verifyAuth();
  await deleteExocorpseCmsEntry(entryId);
  revalidatePath("/admin/cms");
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
  await uploadExocorpseCmsAssetFile({ ...input, file });
  revalidatePath("/admin/cms");
}

export async function deleteAdminCmsAsset(assetId: string) {
  await verifyAuth();
  await deleteExocorpseCmsAsset(assetId);
  revalidatePath("/admin/cms");
}
