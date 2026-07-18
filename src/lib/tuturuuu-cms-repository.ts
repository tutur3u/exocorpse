import "server-only";

import {
  getExocorpseApiBaseUrl,
  getExocorpseWorkspaceId,
} from "@/lib/exocorpse-config";
import { getExocorpseSessionFromCookies } from "@/lib/exocorpse-session";
import { EXOCORPSE_CMS_CACHE_TAG } from "@/lib/tuturuuu-cms-delivery";
import type {
  ExocorpseCmsBlock,
  ExocorpseCmsAsset,
  ExocorpseCmsEntry,
  ExocorpseCmsRelation,
  ExocorpseCmsStudio,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import { revalidateTag } from "next/cache";

type EntryBundleInput = {
  blocks: Array<{
    blockType: string;
    content: ExocorpseJson;
    id?: string;
    sortOrder?: number;
    stableSourceId?: string | null;
    title?: string | null;
  }>;
  entry: Record<string, unknown>;
  relations: Array<{
    definitionId: string;
    metadata?: ExocorpseJson;
    sortOrder?: number;
    toEntryId: string;
  }>;
};

export type EntryBundle = {
  blocks: ExocorpseCmsBlock[];
  entry: ExocorpseCmsEntry;
  relations: ExocorpseCmsRelation[];
};

function apiUrl(path: string) {
  return `${getExocorpseApiBaseUrl().replace(/\/+$/, "")}${path}`;
}

async function readApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  return typeof payload?.error === "string"
    ? payload.error
    : `Tuturuuu CMS request failed with status ${response.status}`;
}

async function cmsRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const session = await getExocorpseSessionFromCookies();
  if (!session) {
    throw new Error("A valid Tuturuuu CMS session is required.");
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `${session.tokenType} ${session.accessToken}`,
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) throw new Error(await readApiError(response));
  return (await response.json()) as T;
}

function workspacePath(suffix = "") {
  return `/workspaces/${encodeURIComponent(
    getExocorpseWorkspaceId(),
  )}/external-projects${suffix}`;
}

async function invalidateDelivery() {
  revalidateTag(EXOCORPSE_CMS_CACHE_TAG, { expire: 0 });
}

export async function getExocorpseCmsStudio() {
  return cmsRequest<ExocorpseCmsStudio>(workspacePath());
}

export async function getExocorpseCmsCollectionEntries(collectionSlug: string) {
  const studio = await getExocorpseCmsStudio();
  const collection = studio.collections.find(
    (item) => item.slug === collectionSlug,
  );
  return {
    collection,
    entries: collection
      ? studio.entries.filter((entry) => entry.collection_id === collection.id)
      : [],
    studio,
  };
}

export async function createExocorpseCmsEntryBundle(input: EntryBundleInput) {
  const result = await cmsRequest<EntryBundle>(
    workspacePath("/entries/bundle"),
    {
      body: JSON.stringify(input),
      method: "POST",
    },
  );
  await invalidateDelivery();
  return result;
}

export async function updateExocorpseCmsEntryBundle(
  entryId: string,
  expectedUpdatedAt: string,
  input: EntryBundleInput,
) {
  const result = await cmsRequest<EntryBundle>(
    workspacePath(`/entries/${encodeURIComponent(entryId)}/bundle`),
    {
      body: JSON.stringify({ ...input, expectedUpdatedAt }),
      method: "PUT",
    },
  );
  await invalidateDelivery();
  return result;
}

export async function deleteExocorpseCmsEntry(entryId: string) {
  await cmsRequest<{ id: string }>(
    workspacePath(`/entries/${encodeURIComponent(entryId)}`),
    { method: "DELETE" },
  );
  await invalidateDelivery();
}

export async function createExocorpseCmsAsset(payload: {
  alt_text?: string | null;
  asset_type: string;
  entry_id: string;
  metadata?: ExocorpseJson;
  sort_order?: number;
  source_url?: string | null;
  storage_path?: string | null;
}) {
  const result = await cmsRequest<ExocorpseCmsAsset>(workspacePath("/assets"), {
    body: JSON.stringify(payload),
    method: "POST",
  });
  await invalidateDelivery();
  return result;
}

export async function deleteExocorpseCmsAsset(assetId: string) {
  await cmsRequest<{ id: string }>(
    workspacePath(`/assets/${encodeURIComponent(assetId)}`),
    { method: "DELETE" },
  );
  await invalidateDelivery();
}

export async function uploadExocorpseCmsAssetFile(input: {
  collectionType: string;
  entryId: string;
  entrySlug: string;
  file: File;
}) {
  const formData = new FormData();
  formData.set("collectionType", input.collectionType);
  formData.set("entrySlug", input.entrySlug);
  formData.set("file", input.file);
  const upload = await cmsRequest<{ path: string }>(
    workspacePath("/assets/upload-url"),
    { body: formData, method: "POST" },
  );
  return createExocorpseCmsAsset({
    alt_text: input.file.name,
    asset_type: input.file.type.split("/")[0] || "image",
    entry_id: input.entryId,
    storage_path: upload.path,
  });
}

export function entryBlocksForBundle(
  studio: ExocorpseCmsStudio,
  entryId: string,
) {
  return studio.blocks
    .filter((block) => block.entry_id === entryId)
    .map((block) => ({
      blockType: block.block_type,
      content: block.content,
      id: block.id,
      sortOrder: block.sort_order,
      stableSourceId: block.stable_source_id,
      title: block.title,
    }));
}

export function entryRelationsForBundle(
  studio: ExocorpseCmsStudio,
  entryId: string,
) {
  return (studio.relations ?? [])
    .filter(
      (relation) =>
        relation.from_entry_id === entryId && relation.relation_definition_id,
    )
    .map((relation) => ({
      definitionId: relation.relation_definition_id!,
      metadata: relation.metadata,
      sortOrder: relation.sort_order,
      toEntryId: relation.to_entry_id,
    }));
}
