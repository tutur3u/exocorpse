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
  uploadAdminCmsAsset,
} from "@/lib/actions/cms";
import type { AdminCmsSection } from "@/lib/admin-cms-sections";
import type {
  ExocorpseCmsFieldDefinition,
  ExocorpseCmsStudio,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

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
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [studio, setStudio] = useState(initialStudio);
  const visibleCollections = useMemo(() => {
    const selectedSlugs = new Set(section.collectionSlugs);
    return studio.collections.filter(
      (collection) =>
        collection.is_enabled !== false &&
        (!selectedSlugs.size || selectedSlugs.has(collection.slug)),
    );
  }, [section.collectionSlugs, studio.collections]);
  const defaultCollection =
    visibleCollections.find(
      (collection) => collection.slug === section.defaultCollectionSlug,
    ) ?? visibleCollections[0];
  const [collectionId, setCollectionId] = useState(defaultCollection?.id ?? "");
  const [entryId, setEntryId] = useState(() =>
    firstEntryId(initialStudio, defaultCollection?.id ?? ""),
  );
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
      studio.entries.filter((entry) => entry.collection_id === collection?.id),
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
    setDraft(
      entry
        ? entryDraft(entry, collection.id)
        : applyFieldDefaults(emptyEntry(collection.id), fields),
    );
    setBlocks(
      blocksToDrafts(
        studio.blocks.filter((block) => block.entry_id === entry?.id),
      ),
    );
    setRelationSelections(
      initialRelationSelections(studio, entry?.id ?? "", definitions),
    );
  }, [collection, definitions, entryId, fields, studio]);

  function selectCollection(nextCollectionId: string) {
    setMessage(null);
    setCollectionId(nextCollectionId);
    setEntryId(firstEntryId(studio, nextCollectionId));
  }

  function createEntry() {
    if (!collection) return;
    setEntryId("");
    setDraft(applyFieldDefaults(emptyEntry(collection.id), fields));
    setBlocks([]);
    setRelationSelections(
      Object.fromEntries(definitions.map((definition) => [definition.id, []])),
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
        router.refresh();
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
    const fieldRecord = (definition: ExocorpseCmsFieldDefinition) => {
      const value = draft[definition.field_scope];
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
    if (draft.status === "scheduled" && !draft.scheduled_for) {
      throw new Error("Choose a publication time for this scheduled item.");
    }
  }

  function save() {
    let payload;
    try {
      validate();
      payload = buildSavePayload({
        blocks,
        definitions,
        draft,
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

  function uploadAsset(formData: FormData) {
    if (!selectedEntry || !collection) return;
    run(
      () =>
        uploadAdminCmsAsset({
          collectionType: collection.collection_type,
          entryId: selectedEntry.id,
          entrySlug: selectedEntry.slug,
          formData,
        }),
      "Media uploaded.",
      (asset) =>
        setStudio((current) => ({
          ...current,
          assets: [
            ...current.assets.filter((item) => item.id !== asset.id),
            asset,
          ],
        })),
    );
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
    pending,
    relationSelections,
    save,
    selectCollection,
    setBlocks,
    setDraft,
    setEntryId,
    setMessage,
    setRelationSelections,
    studio,
    uploadAsset,
    visibleCollections,
  };
}
