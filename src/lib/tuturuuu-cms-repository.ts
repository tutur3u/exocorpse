import "server-only";

import {
  getExocorpseApiBaseUrl,
  getExocorpseWorkspaceId,
} from "@/lib/exocorpse-config";
import { withAdminCmsAssetPreview } from "@/lib/admin-cms-assets";
import type { AdminCmsSection } from "@/lib/admin-cms-sections";
import {
  adminCmsStudioRequestSlugs,
  selectAdminCmsStudio,
} from "@/lib/admin-cms-studio";
import {
  getExocorpseSessionFromCookies,
  refreshExocorpseSession,
  sessionCanRefresh,
} from "@/lib/exocorpse-session";
import { EXOCORPSE_CMS_CACHE_TAG } from "@/lib/tuturuuu-cms-delivery";
import type {
  ExocorpseCmsBlock,
  ExocorpseCmsAsset,
  ExocorpseCmsEntry,
  ExocorpseCmsRelation,
  ExocorpseCmsStudio,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import { cacheLife, cacheTag, updateTag } from "next/cache";

const EXOCORPSE_CMS_STUDIO_CACHE_TAG = "exocorpse-cms-admin-studio";

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

export async function readExocorpseApiError(response: Response) {
  const payload = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  return typeof payload?.error === "string"
    ? payload.error
    : `Tuturuuu CMS request failed with status ${response.status}`;
}

export async function authenticatedExocorpseFetch(
  path: string,
  init?: RequestInit,
) {
  let session = await getExocorpseSessionFromCookies();
  if (!session) {
    return Response.json(
      { error: "Your Tuturuuu session has expired. Please sign in again." },
      { status: 401 },
    );
  }
  const tokenType = session.tokenType;

  const request = (accessToken: string) =>
    fetch(apiUrl(path), {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `${tokenType} ${accessToken}`,
        ...(init?.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...init?.headers,
      },
    });

  let response = await request(session.accessToken);
  if (response.status === 401 && sessionCanRefresh(session)) {
    await response.body?.cancel().catch(() => undefined);
    session = await refreshExocorpseSession(session);
    response = await request(session.accessToken);
  }
  return response;
}

async function cmsRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await authenticatedExocorpseFetch(path, init);

  if (!response.ok) throw new Error(await readExocorpseApiError(response));
  return (await response.json()) as T;
}

export function externalProjectPath(suffix = "") {
  return `/workspaces/${encodeURIComponent(
    getExocorpseWorkspaceId(),
  )}/external-projects${suffix}`;
}

async function invalidateDelivery() {
  updateTag(EXOCORPSE_CMS_CACHE_TAG);
  updateTag(EXOCORPSE_CMS_STUDIO_CACHE_TAG);
}

async function getPrivateExocorpseCmsStudio(collectionSlugs: string[]) {
  "use cache: private";
  cacheLife({ stale: 30 });
  cacheTag(EXOCORPSE_CMS_STUDIO_CACHE_TAG);
  const searchParams = new URLSearchParams();
  if (collectionSlugs.length) {
    searchParams.set("collectionSlugs", collectionSlugs.join(","));
  }
  const query = searchParams.toString();
  return cmsRequest<ExocorpseCmsStudio>(
    `${externalProjectPath()}${query ? `?${query}` : ""}`,
  );
}

export async function getExocorpseCmsStudio(section?: AdminCmsSection) {
  const studio = await getPrivateExocorpseCmsStudio(
    adminCmsStudioRequestSlugs(section),
  );
  const selectedStudio = section
    ? selectAdminCmsStudio(studio, section)
    : studio;
  return {
    ...selectedStudio,
    assets: selectedStudio.assets.map(withAdminCmsAssetPreview),
  };
}

export async function getExocorpseCmsAssetPreviewResponse(
  assetId: string,
  searchParams: URLSearchParams,
) {
  const query = searchParams.toString();
  return authenticatedExocorpseFetch(
    `${externalProjectPath(`/assets/${encodeURIComponent(assetId)}`)}${query ? `?${query}` : ""}`,
    { method: "GET", redirect: "manual" },
  );
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

export async function ensureCharacterGalleryTaggingDefinition(
  collectionId: string,
) {
  const studio = await cmsRequest<ExocorpseCmsStudio>(externalProjectPath());
  const collection = studio.collections.find(
    (item) => item.id === collectionId,
  );
  if (collection?.slug !== "character-gallery") return;

  const definition = (studio.relationDefinitions ?? []).find(
    (item) =>
      item.source_collection_id === collection.id && item.key === "character",
  );
  if (!definition) {
    throw new Error("Character tagging is not ready for this gallery yet.");
  }
  if (
    definition.cardinality === "many" &&
    definition.label === "Tagged characters"
  ) {
    return;
  }

  const targetCollectionIds = (studio.relationDefinitionTargets ?? [])
    .filter((target) => target.relation_definition_id === definition.id)
    .map((target) => target.target_collection_id);
  await cmsRequest(
    externalProjectPath(
      `/relation-definitions/${encodeURIComponent(definition.id)}`,
    ),
    {
      body: JSON.stringify({
        cardinality: "many",
        isRequired: definition.is_required,
        key: definition.key,
        label: "Tagged characters",
        sourceCollectionId: definition.source_collection_id,
        targetCollectionIds,
      }),
      method: "PATCH",
    },
  );
  await invalidateDelivery();
}

export async function createExocorpseCmsEntryBundle(input: EntryBundleInput) {
  const result = await cmsRequest<EntryBundle>(
    externalProjectPath("/entries/bundle"),
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
    externalProjectPath(`/entries/${encodeURIComponent(entryId)}/bundle`),
    {
      body: JSON.stringify({ ...input, expectedUpdatedAt }),
      method: "PUT",
    },
  );
  await invalidateDelivery();
  return result;
}

export async function reorderExocorpseCmsEntries(
  order: Array<{ entryId: string; sortOrder: number }>,
) {
  const studio = await getExocorpseCmsStudio();
  const updated: ExocorpseCmsEntry[] = [];
  for (const item of order) {
    const entry = studio.entries.find(
      (candidate) => candidate.id === item.entryId,
    );
    if (!entry || entry.sort_order === item.sortOrder) continue;
    const bundle = await updateExocorpseCmsEntryBundle(
      entry.id,
      entry.updated_at,
      {
        entry: {
          collectionId: entry.collection_id,
          metadata: entry.metadata,
          profileData: entry.profile_data,
          scheduledFor:
            entry.status === "scheduled" ? entry.scheduled_for : null,
          slug: entry.slug,
          sortOrder: item.sortOrder,
          status: entry.status,
          subtitle: entry.subtitle,
          summary: entry.summary,
          title: entry.title,
        },
        blocks: studio.blocks
          .filter((block) => block.entry_id === entry.id)
          .map((block) => ({
            blockType: block.block_type,
            content: block.content,
            id: block.id,
            sortOrder: block.sort_order,
            stableSourceId: block.stable_source_id,
            title: block.title,
          })),
        relations: (studio.relations ?? [])
          .filter(
            (relation) =>
              relation.from_entry_id === entry.id &&
              relation.relation_definition_id,
          )
          .map((relation) => ({
            definitionId: relation.relation_definition_id as string,
            metadata: relation.metadata,
            sortOrder: relation.sort_order,
            toEntryId: relation.to_entry_id,
          })),
      },
    );
    updated.push(bundle.entry);
  }
  return updated;
}

export async function setExocorpseCmsEntryVisibility(
  entryId: string,
  visibility: "draft" | "published" | "unlisted",
) {
  const studio = await getExocorpseCmsStudio();
  const entry = studio.entries.find((candidate) => candidate.id === entryId);
  if (!entry) throw new Error("This post is no longer available.");
  const profileData =
    entry.profile_data &&
    typeof entry.profile_data === "object" &&
    !Array.isArray(entry.profile_data)
      ? entry.profile_data
      : {};

  return updateExocorpseCmsEntryBundle(entry.id, entry.updated_at, {
    entry: {
      collectionId: entry.collection_id,
      metadata: entry.metadata,
      profileData: {
        ...profileData,
        visibility: visibility === "unlisted" ? "unlisted" : "public",
      },
      scheduledFor: null,
      slug: entry.slug,
      sortOrder: entry.sort_order,
      status: visibility === "draft" ? "draft" : "published",
      subtitle: entry.subtitle,
      summary: entry.summary,
      title: entry.title,
    },
    blocks: studio.blocks
      .filter((block) => block.entry_id === entry.id)
      .map((block) => ({
        blockType: block.block_type,
        content: block.content,
        id: block.id,
        sortOrder: block.sort_order,
        stableSourceId: block.stable_source_id,
        title: block.title,
      })),
    relations: (studio.relations ?? [])
      .filter(
        (relation) =>
          relation.from_entry_id === entry.id &&
          relation.relation_definition_id,
      )
      .map((relation) => ({
        definitionId: relation.relation_definition_id as string,
        metadata: relation.metadata,
        sortOrder: relation.sort_order,
        toEntryId: relation.to_entry_id,
      })),
  });
}

export async function deleteExocorpseCmsEntry(entryId: string) {
  await cmsRequest<{ id: string }>(
    externalProjectPath(`/entries/${encodeURIComponent(entryId)}`),
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
  const result = await cmsRequest<ExocorpseCmsAsset>(
    externalProjectPath("/assets"),
    {
      body: JSON.stringify(payload),
      method: "POST",
    },
  );
  await invalidateDelivery();
  return withAdminCmsAssetPreview(result);
}

export async function deleteExocorpseCmsAsset(assetId: string) {
  await cmsRequest<{ id: string }>(
    externalProjectPath(`/assets/${encodeURIComponent(assetId)}`),
    { method: "DELETE" },
  );
  await invalidateDelivery();
}

export async function reorderExocorpseCmsAssets(
  order: Array<{ assetId: string; sortOrder: number }>,
) {
  const assets = await Promise.all(
    order.map(({ assetId, sortOrder }) =>
      cmsRequest<ExocorpseCmsAsset>(
        externalProjectPath(`/assets/${encodeURIComponent(assetId)}`),
        {
          body: JSON.stringify({ sort_order: sortOrder }),
          method: "PATCH",
        },
      ),
    ),
  );
  await invalidateDelivery();
  return assets.map(withAdminCmsAssetPreview);
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
