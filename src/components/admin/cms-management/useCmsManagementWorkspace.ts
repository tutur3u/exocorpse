"use client";

import {
  blocksToDrafts,
  buildSavePayload,
  collectionConfig,
  emptyEntry,
  entryDraft,
  initialRelationSelections,
  isJsonRecord,
  slugify,
} from "@/components/admin/cms-management/editor-utils";
import {
  CONNECTION_COLLECTION_SLUGS,
  normalizeConnectionDraft,
} from "@/components/admin/cms-management/connection-entry-utils";
import type {
  CmsBlockDraft,
  CmsEditorMessage,
  CmsEntryDraft,
  CmsRelationSelections,
} from "@/components/admin/cms-management/editor-types";
import {
  deleteAdminCmsAsset,
  deleteAdminCmsEntry,
  saveAdminCmsEntry,
  reorderAdminCmsEntries,
  reorderAdminCmsAssets,
  registerAdminCmsAsset,
  setAdminCmsEntryVisibility,
} from "@/lib/actions/cms";
import { uploadCmsAssetDirect } from "@/lib/cms-asset-upload";
import type { AdminCmsSection } from "@/lib/admin-cms-sections";
import type {
  ExocorpseCmsFieldDefinition,
  ExocorpseCmsStudio,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

function firstEntryId(studio: ExocorpseCmsStudio, collectionId: string) {
  return (
    studio.entries.find((entry) => entry.collection_id === collectionId)?.id ??
    ""
  );
}

function hasRequiredValue(value: ExocorpseJson | undefined) {
  if (value === null || value === undefined || value === "") return false;
  return !Array.isArray(value) || value.length > 0;
}

function applyFieldDefaults(
  draft: CmsEntryDraft,
  fields: ExocorpseCmsFieldDefinition[],
) {
  return fields.reduce((current, definition) => {
    if (definition.default_value === null) return current;
    const scope = definition.field_scope;
    const record = isJsonRecord(current[scope]) ? current[scope] : {};
    return {
      ...current,
      [scope]: { ...record, [definition.key]: definition.default_value },
    };
  }, draft);
}

export function useCmsManagementWorkspace({
  initialStudio,
  section,
}: {
  initialStudio: ExocorpseCmsStudio;
  section: AdminCmsSection;
}) {
  const galleryUploadSequenceRef = useRef(0);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [studio, setStudio] = useState(initialStudio);
  const visibleCollections = useMemo(() => {
    const selectedSlugs = new Set(section.collectionSlugs);
    const collectionOrder = new Map(
      section.collectionSlugs.map((slug, index) => [slug, index]),
    );
    return studio.collections
      .filter(
        (collection) =>
          collection.is_enabled !== false &&
          (!selectedSlugs.size || selectedSlugs.has(collection.slug)),
      )
      .sort(
        (left, right) =>
          (collectionOrder.get(left.slug) ?? Number.MAX_SAFE_INTEGER) -
          (collectionOrder.get(right.slug) ?? Number.MAX_SAFE_INTEGER),
      );
  }, [section.collectionSlugs, studio.collections]);
  const defaultCollection =
    visibleCollections.find(
      (collection) => collection.slug === section.defaultCollectionSlug,
    ) ?? visibleCollections[0];
  const [collectionId, setCollectionId] = useState(defaultCollection?.id ?? "");
  const [entryId, setEntryIdState] = useState(() =>
    firstEntryId(initialStudio, defaultCollection?.id ?? ""),
  );
  const [creatingEntry, setCreatingEntry] = useState(false);
  const [draft, setDraft] = useState<CmsEntryDraft>(() =>
    entryDraft(
      initialStudio.entries.find((entry) => entry.id === entryId) ?? null,
      defaultCollection?.id ?? "",
    ),
  );
  const [blocks, setBlocks] = useState<CmsBlockDraft[]>([]);
  const [relationSelections, setRelationSelections] =
    useState<CmsRelationSelections>({});
  const [message, setMessage] = useState<CmsEditorMessage>(null);

  useEffect(() => setStudio(initialStudio), [initialStudio]);

  const collection =
    visibleCollections.find((item) => item.id === collectionId) ??
    visibleCollections[0];
  const entries = useMemo(
    () =>
      studio.entries
        .filter((entry) => entry.collection_id === collection?.id)
        .sort(
          (left, right) =>
            left.sort_order - right.sort_order ||
            left.title.localeCompare(right.title),
        ),
    [collection?.id, studio.entries],
  );
  const selectedEntry =
    studio.entries.find((entry) => entry.id === entryId) ?? null;
  const definitions = useMemo(
    () =>
      (studio.relationDefinitions ?? [])
        .filter(
          (definition) => definition.source_collection_id === collection?.id,
        )
        .sort((left, right) => left.label.localeCompare(right.label)),
    [collection?.id, studio.relationDefinitions],
  );
  const fields = useMemo(
    () =>
      (studio.fieldDefinitions ?? [])
        .filter(
          (definition) =>
            definition.collection_id === collection?.id &&
            definition.is_enabled,
        )
        .sort((left, right) => left.sort_order - right.sort_order),
    [collection?.id, studio.fieldDefinitions],
  );
  const assets = studio.assets.filter((asset) => asset.entry_id === entryId);
  const config = collectionConfig(collection);

  useEffect(() => {
    if (!collection) return;
    const entry = studio.entries.find((item) => item.id === entryId) ?? null;
    // New drafts deliberately use an empty entry id. Their defaults and
    // contextual relations are initialized by createEntry(), so do not replace
    // them with another blank draft after that state transition.
    if (creatingEntry) return;
    setDraft(
      entry
        ? entryDraft(entry, collection.id)
        : applyFieldDefaults(emptyEntry(collection.id), fields),
    );
    setBlocks(
      blocksToDrafts(
        studio.blocks.filter((block) => block.entry_id === entry?.id),
        studio.assets.filter((asset) => asset.entry_id === entry?.id),
      ),
    );
    setRelationSelections(
      initialRelationSelections(studio, entry?.id ?? "", definitions),
    );
  }, [collection, creatingEntry, definitions, entryId, fields, studio]);

  function setEntryId(nextEntryId: string) {
    setCreatingEntry(false);
    setEntryIdState(nextEntryId);
  }

  function selectCollection(nextCollectionId: string) {
    setMessage(null);
    setCreatingEntry(false);
    setCollectionId(nextCollectionId);
    setEntryIdState(firstEntryId(studio, nextCollectionId));
  }

  function createEntry(
    initialProfileData: Record<string, ExocorpseJson> = {},
    initialRelations: CmsRelationSelections = {},
  ) {
    if (!collection) return;
    setCreatingEntry(true);
    setEntryIdState("");
    const nextDraft = applyFieldDefaults(emptyEntry(collection.id), fields);
    const profileData = isJsonRecord(nextDraft.profile_data)
      ? nextDraft.profile_data
      : {};
    setDraft({
      ...nextDraft,
      profile_data: { ...profileData, ...initialProfileData },
      status: CONNECTION_COLLECTION_SLUGS.has(collection.slug)
        ? "published"
        : nextDraft.status,
    });
    setBlocks([]);
    setRelationSelections(
      Object.fromEntries(
        definitions.map((definition) => [
          definition.id,
          initialRelations[definition.id] ?? [],
        ]),
      ),
    );
    setMessage(null);
  }

  function run<T>(
    operation: () => Promise<T>,
    success: string,
    onSuccess: (result: T) => void,
  ) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await operation();
        onSuccess(result);
        setMessage({ kind: "success", text: success });
      } catch (error) {
        setMessage({
          kind: "error",
          text:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        });
      }
    });
  }

  function validate() {
    const normalizedDraft = normalizeConnectionDraft({
      collectionSlug: collection?.slug ?? "",
      definitions,
      draft,
      selections: relationSelections,
      studio,
    });
    const fieldRecord = (definition: ExocorpseCmsFieldDefinition) => {
      const value = normalizedDraft[definition.field_scope];
      return isJsonRecord(value) ? value : {};
    };
    const missingField = fields.find(
      (definition) =>
        definition.is_required &&
        !hasRequiredValue(fieldRecord(definition)[definition.key]),
    );
    if (missingField) {
      throw new Error(`${missingField.label ?? missingField.key} is required.`);
    }
    const missingRelation = definitions.find(
      (definition) =>
        definition.is_required &&
        !(relationSelections[definition.id]?.length ?? 0),
    );
    if (missingRelation)
      throw new Error(`${missingRelation.label} is required.`);
    if (
      normalizedDraft.status === "scheduled" &&
      !normalizedDraft.scheduled_for
    ) {
      throw new Error("Choose a publication time for this scheduled item.");
    }
    return normalizedDraft;
  }

  function save() {
    let payload;
    try {
      const normalizedDraft = validate();
      payload = buildSavePayload({
        blocks,
        definitions,
        draft: normalizedDraft,
        relationSelections,
      });
    } catch (error) {
      setMessage({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "Review this item before saving.",
      });
      return;
    }

    run(
      () =>
        saveAdminCmsEntry({
          ...payload,
          entryId: selectedEntry?.id,
          expectedUpdatedAt: selectedEntry?.updated_at,
        }),
      selectedEntry ? "Changes saved." : "Your new item is ready.",
      (bundle) => {
        setStudio((current) => ({
          ...current,
          blocks: [
            ...current.blocks.filter(
              (block) => block.entry_id !== bundle.entry.id,
            ),
            ...bundle.blocks,
          ],
          entries: [
            ...current.entries.filter((entry) => entry.id !== bundle.entry.id),
            bundle.entry,
          ],
          relations: [
            ...(current.relations ?? []).filter(
              (relation) => relation.from_entry_id !== bundle.entry.id,
            ),
            ...bundle.relations,
          ],
        }));
        setEntryId(bundle.entry.id);
      },
    );
  }

  function deleteEntry(targetEntryId = selectedEntry?.id) {
    if (!targetEntryId || !collection) return;
    const deletedId = targetEntryId;
    run(
      () => deleteAdminCmsEntry(deletedId),
      "Item deleted.",
      () => {
        const remaining = studio.entries.filter(
          (entry) =>
            entry.collection_id === collection.id && entry.id !== deletedId,
        );
        setStudio((current) => ({
          ...current,
          assets: current.assets.filter(
            (asset) => asset.entry_id !== deletedId,
          ),
          blocks: current.blocks.filter(
            (block) => block.entry_id !== deletedId,
          ),
          entries: current.entries.filter((entry) => entry.id !== deletedId),
          relations: (current.relations ?? []).filter(
            (relation) =>
              relation.from_entry_id !== deletedId &&
              relation.to_entry_id !== deletedId,
          ),
        }));
        setEntryId(remaining[0]?.id ?? "");
      },
    );
  }

  function setEntryVisibility(
    targetEntryId: string,
    visibility: "draft" | "published" | "unlisted",
  ) {
    run(
      () => setAdminCmsEntryVisibility(targetEntryId, visibility),
      visibility === "draft"
        ? "Post moved to drafts."
        : visibility === "unlisted"
          ? "Post is available by direct link."
          : "Post published.",
      (bundle) =>
        setStudio((current) => ({
          ...current,
          blocks: [
            ...current.blocks.filter(
              (block) => block.entry_id !== bundle.entry.id,
            ),
            ...bundle.blocks,
          ],
          entries: current.entries.map((entry) =>
            entry.id === bundle.entry.id ? bundle.entry : entry,
          ),
          relations: [
            ...(current.relations ?? []).filter(
              (relation) => relation.from_entry_id !== bundle.entry.id,
            ),
            ...bundle.relations,
          ],
        })),
    );
  }

  function uploadAsset(file: File) {
    if (!selectedEntry || !collection) return;
    const replacedAssetIds =
      collection.slug === "portfolio-art"
        ? assets.map((asset) => asset.id)
        : [];
    run(
      async () => {
        const storagePath = await uploadCmsAssetDirect({
          collectionType: collection.collection_type,
          entrySlug: selectedEntry.slug,
          file,
        });
        const asset = await registerAdminCmsAsset({
          entryId: selectedEntry.id,
          fileName: file.name,
          fileType: file.type,
          storagePath,
        });
        await Promise.all(replacedAssetIds.map(deleteAdminCmsAsset));
        return asset;
      },
      "Media uploaded.",
      (asset) =>
        setStudio((current) => ({
          ...current,
          assets: [
            ...current.assets.filter(
              (item) =>
                item.id !== asset.id && !replacedAssetIds.includes(item.id),
            ),
            asset,
          ],
        })),
    );
  }

  async function uploadInlineAsset(file: File) {
    if (!selectedEntry || !collection) {
      throw new Error("Save this item before adding an image to its text.");
    }
    setUploading(true);
    setMessage(null);
    try {
      const storagePath = await uploadCmsAssetDirect({
        collectionType: collection.collection_type,
        entrySlug: selectedEntry.slug,
        file,
      });
      const asset = await registerAdminCmsAsset({
        assetType: "inline-image",
        entryId: selectedEntry.id,
        fileName: file.name,
        fileType: file.type,
        storagePath,
      });
      if (!asset.asset_url) {
        await deleteAdminCmsAsset(asset.id);
        throw new Error(
          "The image uploaded, but its public link was not ready.",
        );
      }
      setStudio((current) => ({
        ...current,
        assets: [
          ...current.assets.filter((item) => item.id !== asset.id),
          asset,
        ],
      }));
      setMessage({ kind: "success", text: "Image added to the text." });
      return asset.asset_url;
    } catch (error) {
      setMessage({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "That image could not be added. Please try again.",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  }

  async function uploadCharacterGalleryAsset(file: File, characterId: string) {
    const galleryCollection = studio.collections.find(
      (item) => item.slug === "character-gallery",
    );
    const relationDefinition = (studio.relationDefinitions ?? []).find(
      (definition) =>
        definition.source_collection_id === galleryCollection?.id &&
        definition.key === "character",
    );
    const character = studio.entries.find((entry) => entry.id === characterId);
    if (!galleryCollection || !relationDefinition || !character) {
      throw new Error("This character gallery is not ready yet.");
    }

    setUploading(true);
    setMessage(null);
    let createdEntryId: string | null = null;
    try {
      const fileTitle = file.name.replace(/\.[^.]+$/, "").trim() || "Artwork";
      const slug = slugify(
        `${character.slug}-${fileTitle}-${crypto.randomUUID().slice(0, 8)}`,
      );
      const relatedGalleryEntryIds = new Set(
        (studio.relations ?? [])
          .filter(
            (relation) =>
              relation.relation_definition_id === relationDefinition.id &&
              relation.to_entry_id === characterId,
          )
          .map((relation) => relation.from_entry_id),
      );
      const existingSortOrders = studio.entries
        .filter(
          (entry) =>
            entry.collection_id === galleryCollection.id &&
            relatedGalleryEntryIds.has(entry.id),
        )
        .map((entry) => entry.sort_order);
      const sortOrder =
        Math.max(-1, ...existingSortOrders) +
        1 +
        galleryUploadSequenceRef.current++;
      const bundle = await saveAdminCmsEntry({
        blocks: [],
        entry: {
          collectionId: galleryCollection.id,
          metadata: {},
          profileData: { sensitiveContent: false },
          scheduledFor: null,
          slug,
          sortOrder,
          status: "published",
          subtitle: null,
          summary: null,
          title: fileTitle,
        },
        relations: [
          {
            definitionId: relationDefinition.id,
            sortOrder: 0,
            toEntryId: characterId,
          },
        ],
      });
      createdEntryId = bundle.entry.id;
      const storagePath = await uploadCmsAssetDirect({
        collectionType: galleryCollection.collection_type,
        entrySlug: bundle.entry.slug,
        file,
      });
      const asset = await registerAdminCmsAsset({
        entryId: bundle.entry.id,
        fileName: file.name,
        fileType: file.type,
        storagePath,
      });
      setStudio((current) => ({
        ...current,
        assets: [
          ...current.assets.filter((item) => item.id !== asset.id),
          asset,
        ],
        blocks: [
          ...current.blocks.filter(
            (block) => block.entry_id !== bundle.entry.id,
          ),
          ...bundle.blocks,
        ],
        entries: [
          ...current.entries.filter((entry) => entry.id !== bundle.entry.id),
          bundle.entry,
        ],
        relations: [
          ...(current.relations ?? []).filter(
            (relation) => relation.from_entry_id !== bundle.entry.id,
          ),
          ...bundle.relations,
        ],
      }));
      setMessage({ kind: "success", text: "Gallery image added." });
    } catch (error) {
      if (createdEntryId) {
        await deleteAdminCmsEntry(createdEntryId).catch(() => undefined);
      }
      setMessage({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "That gallery image could not be added. Please try again.",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  }

  function deleteAsset(assetId: string) {
    run(
      () => deleteAdminCmsAsset(assetId),
      "Media removed.",
      () =>
        setStudio((current) => ({
          ...current,
          assets: current.assets.filter((asset) => asset.id !== assetId),
        })),
    );
  }

  function reorderAssets(nextAssets: typeof assets) {
    const ordered = nextAssets.map((asset, sortOrder) => ({
      ...asset,
      sort_order: sortOrder,
    }));
    setStudio((current) => ({
      ...current,
      assets: current.assets.map(
        (asset) => ordered.find((item) => item.id === asset.id) ?? asset,
      ),
    }));
    run(
      () =>
        reorderAdminCmsAssets(
          ordered.map((asset) => ({
            assetId: asset.id,
            sortOrder: asset.sort_order,
          })),
        ),
      "Media order updated.",
      (updated) =>
        setStudio((current) => ({
          ...current,
          assets: current.assets.map(
            (asset) => updated.find((item) => item.id === asset.id) ?? asset,
          ),
        })),
    );
  }

  function changeTitle(title: string) {
    setDraft((current) => ({
      ...current,
      slug:
        !current.id &&
        (!current.slug || current.slug === slugify(current.title))
          ? slugify(title)
          : current.slug,
      title,
    }));
  }

  function reorderEntries(nextEntries: typeof entries) {
    const ordered = nextEntries.map((entry, sortOrder) => ({
      ...entry,
      sort_order: sortOrder,
    }));
    const orderedIds = new Set(ordered.map((entry) => entry.id));
    setStudio((current) => ({
      ...current,
      entries: current.entries.map((entry) =>
        orderedIds.has(entry.id)
          ? (ordered.find((item) => item.id === entry.id) ?? entry)
          : entry,
      ),
    }));
    run(
      () =>
        reorderAdminCmsEntries(
          ordered.map((entry) => ({
            entryId: entry.id,
            sortOrder: entry.sort_order,
          })),
        ),
      "Display order updated.",
      (updated) =>
        setStudio((current) => ({
          ...current,
          entries: current.entries.map(
            (entry) => updated.find((item) => item.id === entry.id) ?? entry,
          ),
        })),
    );
  }

  return {
    assets,
    blocks,
    changeTitle,
    collection,
    config,
    createEntry,
    definitions,
    deleteAsset,
    deleteEntry,
    draft,
    entries,
    entryId,
    fields,
    message,
    pending: pending || uploading,
    relationSelections,
    reorderAssets,
    reorderEntries,
    save,
    selectCollection,
    setEntryVisibility,
    setBlocks,
    setDraft,
    setEntryId,
    setMessage,
    setRelationSelections,
    studio,
    uploadAsset,
    uploadCharacterGalleryAsset,
    uploadInlineAsset,
    visibleCollections,
  };
}
