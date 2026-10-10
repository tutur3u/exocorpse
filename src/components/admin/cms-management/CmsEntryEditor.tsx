"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { addonServiceIds } from "@/lib/admin-addon-links";
import CmsLegacyServiceExamples from "./CmsLegacyServiceExamples";
import CmsLegacyBlogEditor, {
  blogPublishDate,
  blogPublishState,
} from "./CmsLegacyBlogEditor";
import CmsLegacyMarkdownField from "./CmsLegacyMarkdownField";
import CmsRelatedEntriesPanel from "./CmsRelatedEntriesPanel";
import { isJsonRecord } from "./editor-utils";
import AdminMarkdownEditor from "@/components/admin/AdminMarkdownEditor";
import CmsBlockEditor from "@/components/admin/cms-management/CmsBlockEditor";
import CmsEditorTabs, {
  type CmsEditorTab,
} from "@/components/admin/cms-management/CmsEditorTabs";
import CmsEntryBasics from "@/components/admin/cms-management/CmsEntryBasics";
import CmsEntryMediaSection from "./CmsEntryMediaSection";
import CmsCharacterGalleryOverview from "./CmsCharacterGalleryOverview";
import CmsPublishingSettings from "@/components/admin/cms-management/CmsPublishingSettings";
import CmsRelationEditor from "@/components/admin/cms-management/CmsRelationEditor";
import CmsStructuredFields from "@/components/admin/cms-management/CmsStructuredFields";
import { isCharacterMediaField } from "@/components/admin/cms-management/CmsCharacterMediaSettings";
import CmsConnectionEntryEditor from "@/components/admin/cms-management/CmsConnectionEntryEditor";
import {
  CONNECTION_COLLECTION_SLUGS,
  hasDuplicateConnection,
  isConnectionDraftReady,
} from "@/components/admin/cms-management/connection-entry-utils";
import type { AdminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import { collectionItemLabel } from "@/components/admin/cms-management/collection-copy";
import type {
  CmsBlockDraft,
  CmsEntryDraft,
  CmsRelationSelections,
  CmsUploadStatus,
} from "@/components/admin/cms-management/editor-types";
import { galleryCharacterDefinition } from "@/components/admin/cms-management/gallery-character-tagging";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import {
  legacyEditorTabs,
  splitCharacterEditorFields,
  splitLegacyEditorFields,
} from "@/components/admin/cms-management/legacy-editor-tabs";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsFieldDefinition,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import { Trash2, UploadCloud } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

export type CmsEntryEditorProps = {
  error?: string;
  pendingUploadFileName?: string;
  onPendingUploadFileChange: (file: File | null) => void;
  linkedServiceIds: string[];
  onLinkedServicesChange: (ids: string[]) => void;
  allowedAssetTypes: string[];
  allowedBlockTypes: string[];
  assets: ExocorpseCmsAsset[];
  blocks: CmsBlockDraft[];
  collection: ExocorpseCmsCollection;
  definitions: ExocorpseCmsRelationDefinition[];
  draft: CmsEntryDraft;
  fields: ExocorpseCmsFieldDefinition[];
  onBlocksChange: (blocks: CmsBlockDraft[]) => void;
  onDelete: () => void;
  onDeleteAsset: (assetId: string) => void;
  onCancel: () => void;
  onDraftChange: (draft: CmsEntryDraft) => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onUploadAsset: (file: File) => void;
  onUploadGalleryAsset: (file: File, title: string) => Promise<void>;
  onUploadInlineAsset: (file: File) => Promise<string>;
  onEditGalleryEntry: (entryId: string) => void;
  onDeleteRelated: (entryId: string) => void;
  onEditRelated: (collectionSlug: string, entryId: string) => void;
  onCreateRelated: (
    collectionSlug: string,
    parentId: string,
    relationKey: string,
  ) => void;
  initialTab?: CmsEditorTab;
  onCreateRelationshipEntry: () => void;
  onEditRelationshipEntry: (entryId: string) => void;
  onPendingMediaChange: (pending: boolean) => void;
  onRelationsChange: (selections: CmsRelationSelections) => void;
  onReorderAssets: (assets: ExocorpseCmsAsset[]) => void;
  pending: boolean;
  relationSelections: CmsRelationSelections;
  isDirty: boolean;
  selectedEntryId: string;
  showPublishingControls?: boolean;
  studio: ExocorpseCmsStudio;
  theme: AdminCmsTheme;
  uploadStatus: CmsUploadStatus;
};

export default function CmsEntryEditor({
  error,
  pendingUploadFileName,
  onPendingUploadFileChange,
  linkedServiceIds,
  onLinkedServicesChange,
  allowedAssetTypes,
  allowedBlockTypes,
  assets,
  blocks,
  collection,
  definitions,
  draft,
  fields,
  onBlocksChange,
  onCancel,
  onDelete,
  onDeleteAsset,
  onDraftChange,
  onRelationsChange,
  onReorderAssets,
  onSave,
  onTitleChange,
  onUploadAsset,
  onUploadInlineAsset,
  onUploadGalleryAsset,
  onEditGalleryEntry,
  onDeleteRelated,
  onEditRelated,
  onCreateRelated,
  initialTab = "basic",
  onPendingMediaChange,
  pending,
  relationSelections,
  selectedEntryId,
  showPublishingControls = false,
  isDirty,
  studio,
  uploadStatus,
}: CmsEntryEditorProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pendingMediaSections, setPendingMediaSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [activeTab, setActiveTab] = useState<CmsEditorTab>(() =>
    ["character-gallery", "portfolio-art"].includes(collection.slug)
      ? "media"
      : initialTab,
  );
  const isConnectionEntry = CONNECTION_COLLECTION_SLUGS.has(collection.slug);
  const duplicateConnection = isConnectionEntry
    ? hasDuplicateConnection({
        collectionId: collection.id,
        collectionSlug: collection.slug,
        definitions,
        entryId: selectedEntryId,
        selections: relationSelections,
        studio,
      })
    : false;
  const canSave = isConnectionEntry
    ? isConnectionDraftReady(
        definitions,
        relationSelections,
        collection.slug,
      ) &&
      !duplicateConnection &&
      !pending
    : Boolean(draft.title.trim() && draft.slug.trim() && !pending);
  const updatePendingMedia = useCallback(
    (section: string, hasPendingFile: boolean) => {
      setPendingMediaSections((current) => {
        const next = new Set(current);
        if (hasPendingFile) next.add(section);
        else next.delete(section);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    onPendingMediaChange(pendingMediaSections.size > 0);
  }, [onPendingMediaChange, pendingMediaSections]);

  useEffect(() => () => onPendingMediaChange(false), [onPendingMediaChange]);
  const connectionCount = Object.values(relationSelections).reduce(
    (count, selections) => count + selections.length,
    0,
  );
  const groupedFields = splitLegacyEditorFields(
    fields.filter(
      (field) =>
        !isCharacterMediaField(field.key) &&
        !["displayOrder", "display_order", "sortOrder", "sort_order"].includes(
          field.key,
        ),
    ),
  );
  const characterFields = splitCharacterEditorFields([
    ...groupedFields.basic,
    ...groupedFields.details,
  ]);
  const isCharacter = collection.slug === "characters";
  const taggedCharactersDefinition =
    collection.slug === "character-gallery"
      ? galleryCharacterDefinition(studio, collection.id)
      : null;
  const tabs = legacyEditorTabs({
    assetCount: assets.length,
    blockCount: blocks.length,
    collection,
    connectionCount,
    fields: groupedFields,
    hasAssets: allowedAssetTypes.length > 0,
    hasBlocks: allowedBlockTypes.length > 0,
    hasConnections: definitions.length > 0,
  });
  const itemName = collectionItemLabel(collection).replace(/^./, (letter) =>
    letter.toUpperCase(),
  );
  const isBlog = collection.slug === "blog-posts";
  const visibleDefinitions = definitions.filter(
    (definition) =>
      !(
        definition.key === "tags" &&
        [
          "blog-posts",
          "characters",
          "portfolio-art",
          "portfolio-games",
          "portfolio-writing",
          "stories",
        ].includes(collection.slug)
      ),
  );
  const changeTab = (tab: CmsEditorTab) => setActiveTab(tab);
  const profile = isJsonRecord(draft.profile_data) ? draft.profile_data : {};
  const inlineUpload = selectedEntryId ? onUploadInlineAsset : undefined;
  const markdown = (title: string, placeholder?: string, label?: string) => (
    <CmsLegacyMarkdownField
      blocks={blocks}
      title={title}
      onChange={onBlocksChange}
      onImageUpload={inlineUpload}
      placeholder={placeholder}
      label={label}
    />
  );
  const structured = (keys: string[]) => (
    <CmsStructuredFields
      compact
      definitions={fields
        .filter((field) => keys.includes(field.key))
        .sort((a, b) => keys.indexOf(a.key) - keys.indexOf(b.key))}
      draft={draft}
      onChange={(next) => {
        if (
          collection.slug === "commission-addons" &&
          linkedServiceIds.length > 1 &&
          isJsonRecord(next.profile_data) &&
          next.profile_data.isExclusive === true
        )
          return;
        onDraftChange(next);
      }}
      onImageUpload={inlineUpload}
    />
  );
  const relations = (keys?: string[]) => (
    <CmsRelationEditor
      compact
      definitions={visibleDefinitions.filter(
        (definition) => !keys || keys.includes(definition.key),
      )}
      entryId={selectedEntryId}
      onChange={onRelationsChange}
      selections={relationSelections}
      studio={studio}
    />
  );
  const related = (slug: string, relationKey: string) => (
    <CmsRelatedEntriesPanel
      collectionSlug={slug}
      parentId={selectedEntryId}
      relationKey={relationKey}
      studio={studio}
      onCreate={onCreateRelated}
      onEdit={onEditRelated}
      onDelete={onDeleteRelated}
      pending={pending}
    />
  );
  const characterGallery = isCharacter ? (
    <CmsCharacterGalleryOverview
      characterId={selectedEntryId}
      onEdit={onEditGalleryEntry}
      onCreate={() =>
        onCreateRelated("character-gallery", selectedEntryId, "character")
      }
      onDelete={onDeleteRelated}
      onPendingFileChange={(pending) => updatePendingMedia("gallery", pending)}
      onUpload={onUploadGalleryAsset}
      pending={pending}
      studio={studio}
    />
  ) : null;
  const summary = (label = "Description") => (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </p>
      <AdminMarkdownEditor
        onChange={(value) =>
          onDraftChange({ ...draft, summary: value || null })
        }
        onImageUpload={inlineUpload}
        placeholder={`Describe this ${itemName.toLowerCase()}...`}
        value={draft.summary ?? ""}
      />
    </div>
  );
  const legacyBasicKeys: Record<string, string[]> = {
    worlds: ["worldType", "size", "population"],
    factions: ["factionType", "status", "foundingDate", "memberCount"],
    "commission-services": ["basePrice", "commLink", "isActive"],
    "commission-addons": ["priceImpact", "percentage", "isExclusive"],
    "commission-styles": [],
    "commission-pictures": ["caption", "isPrimaryExample"],
    "relationship-types": ["isMutual", "reverseName"],
  };
  const serviceAddons = () => {
    const definition = definitions.find((item) => item.key === "addons");
    const addonCollection = studio.collections.find(
      (item) => item.slug === "commission-addons",
    );
    if (!definition) return null;
    const chosen = relationSelections[definition.id] ?? [];
    const addons = studio.entries
      .filter((item) => item.collection_id === addonCollection?.id)
      .filter(
        (item) =>
          selectedEntryId ||
          !isJsonRecord(item.profile_data) ||
          item.profile_data.isExclusive !== true,
      );
    return (
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Available Add-ons</h3>
        {addons.length ? (
          <div className="space-y-2 rounded-md border border-gray-200 p-3 dark:border-gray-700">
            {addons.map((addon) => {
              const data = isJsonRecord(addon.profile_data)
                ? addon.profile_data
                : {};
              const exclusiveElsewhere =
                data.isExclusive === true &&
                addonServiceIds(studio, addon.id).some(
                  (id) => id !== selectedEntryId,
                );
              return (
                <label
                  className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  key={addon.id}
                >
                  <input
                    checked={chosen.includes(addon.id)}
                    disabled={exclusiveElsewhere}
                    onChange={(event) =>
                      onRelationsChange({
                        ...relationSelections,
                        [definition.id]: event.target.checked
                          ? [...chosen, addon.id]
                          : chosen.filter((id) => id !== addon.id),
                      })
                    }
                    type="checkbox"
                  />
                  <span className="flex-1">
                    <span className="block font-medium">{addon.title}</span>
                    <span className="block text-xs text-gray-600 dark:text-gray-400">
                      +{data.percentage === true ? "" : "€"}
                      {typeof data.priceImpact === "number"
                        ? data.priceImpact.toFixed(2)
                        : "0.00"}
                      {data.percentage === true ? "%" : ""}
                      {data.isExclusive === true ? " · Exclusive" : ""}
                    </span>
                    {addon.summary ? (
                      <MarkdownRenderer
                        className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                        content={addon.summary}
                      />
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No add-ons available</p>
        )}
      </section>
    );
  };
  const namedContentSlugs = [
    "stories",
    "worlds",
    "characters",
    "factions",
    "locations",
  ];
  const renderSection = (tab: CmsEditorTab): ReactNode => {
    if (tab === "basic") {
      const slug = collection.slug;
      return (
        <>
          {["worlds", "characters", "factions", "locations"].includes(slug)
            ? relations(isCharacter ? ["worlds"] : undefined)
            : null}
          <CmsEntryBasics
            collectionSlug={slug}
            draft={draft}
            onChange={onDraftChange}
            onTitleChange={onTitleChange}
          >
            {isCharacter ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nickname
                  </span>
                  <input
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                    onChange={(event) =>
                      onDraftChange({
                        ...draft,
                        subtitle: event.target.value || null,
                        profile_data: {
                          ...profile,
                          nickname: event.target.value,
                        },
                      })
                    }
                    placeholder="Johnny"
                    value={
                      draft.subtitle ??
                      (typeof profile.nickname === "string"
                        ? profile.nickname
                        : "")
                    }
                  />
                </label>
                {structured(["quote"])}
              </>
            ) : null}
          </CmsEntryBasics>
          {namedContentSlugs.includes(slug) && slug !== "locations"
            ? markdown(
                "Description",
                `A detailed description of your ${itemName.toLowerCase()}...`,
              )
            : null}
          {[
            "commission-addons",
            "relationship-types",
            "character-gallery",
            "character-outfits",
            "location-gallery",
          ].includes(slug)
            ? summary()
            : null}
          {[
            "commission-services",
            "commission-styles",
            "portfolio-art",
            "portfolio-games",
          ].includes(slug)
            ? markdown("Description")
            : null}
          {structured(
            legacyBasicKeys[slug] ??
              (isCharacter
                ? []
                : groupedFields.basic.map((field) => field.key)),
          )}
          {slug === "commission-services" ? renderSection("media") : null}
          {!selectedEntryId && slug === "commission-services"
            ? serviceAddons()
            : null}
          {slug === "commission-addons" ? (
            <section className="space-y-3">
              <h3 className="text-sm font-medium">Link to Services</h3>
              <div className="space-y-2 rounded-md border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50">
                {studio.entries
                  .filter(
                    (entry) =>
                      entry.collection_id ===
                      studio.collections.find(
                        (item) => item.slug === "commission-services",
                      )?.id,
                  )
                  .map((entry) => (
                    <label
                      className="flex items-center gap-2 rounded p-2 hover:bg-white dark:hover:bg-gray-600"
                      key={entry.id}
                    >
                      <input
                        checked={linkedServiceIds.includes(entry.id)}
                        disabled={
                          profile.isExclusive === true &&
                          !linkedServiceIds.includes(entry.id) &&
                          linkedServiceIds.length >= 1
                        }
                        onChange={(event) =>
                          onLinkedServicesChange(
                            event.target.checked
                              ? [...linkedServiceIds, entry.id]
                              : linkedServiceIds.filter(
                                  (id) => id !== entry.id,
                                ),
                          )
                        }
                        type="checkbox"
                      />
                      <span>{entry.title}</span>
                    </label>
                  ))}
              </div>
            </section>
          ) : null}
        </>
      );
    }
    if (tab === "details")
      return (
        <>
          {structured(
            collection.slug === "factions"
              ? ["primaryGoal", "reputation", "powerLevel"]
              : groupedFields.details
                  .filter(
                    (field) =>
                      !(legacyBasicKeys[collection.slug] ?? []).includes(
                        field.key,
                      ),
                  )
                  .map((field) => field.key),
          )}
          {collection.slug === "factions" ? markdown("Ideology") : null}
        </>
      );
    if (tab === "physical") {
      return (
        <CmsStructuredFields
          compact
          definitions={characterFields.physical}
          draft={draft}
          onChange={onDraftChange}
          onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
          title="Physical Details"
        />
      );
    }
    if (tab === "personality") {
      return (
        <CmsStructuredFields
          compact
          definitions={characterFields.personality}
          draft={draft}
          onChange={onDraftChange}
          onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
          title="Personality Summary"
        />
      );
    }
    if (tab === "abilities") {
      return (
        <CmsStructuredFields
          compact
          definitions={characterFields.abilities}
          draft={draft}
          onChange={onDraftChange}
          onImageUpload={selectedEntryId ? onUploadInlineAsset : undefined}
          title="Abilities & Skills"
        />
      );
    }
    if (tab === "fanwork") {
      return (
        <CmsStructuredFields
          compact
          definitions={characterFields.fanwork}
          draft={draft}
          onChange={onDraftChange}
          title="Fanwork Policy"
        />
      );
    }
    if (tab === "gallery" && isCharacter) return characterGallery;
    if (tab === "gallery" || tab === "outfits") {
      return collection.slug === "locations" ? (
        related("location-gallery", "location")
      ) : (
        <>
          {structured(["fanworkPolicy"])}
          {related("character-outfits", "character")}
        </>
      );
    }
    if (tab === "styles")
      return (
        <CmsLegacyServiceExamples
          studio={studio}
          serviceId={selectedEntryId}
          onCreate={onCreateRelated}
          onEdit={onEditRelated}
          onDelete={onDeleteRelated}
        />
      );
    if (tab === "content") {
      if (isCharacter)
        return (
          <>
            {markdown("Backstory")}
            {markdown("Lore")}
          </>
        );
      if (collection.slug === "locations")
        return (
          <>
            {markdown("Description")}
            {markdown("Geography")}
            {markdown("History")}
          </>
        );
      if (["stories", "worlds", "factions"].includes(collection.slug))
        return markdown(
          "Content",
          collection.slug === "stories"
            ? "# My Story\n\nWrite your story details here..."
            : collection.slug === "worlds"
              ? "# World Geography\n\nDescribe your world’s history, geography, cultures, and lore..."
              : "# History\n\nDescribe the faction’s history, structure, notable achievements, and current operations...",
          collection.slug === "stories"
            ? "Story Content"
            : collection.slug === "worlds"
              ? "World Lore"
              : "Content",
        );
      return (
        <CmsBlockEditor
          allowedBlockTypes={allowedBlockTypes}
          blocks={blocks}
          onChange={onBlocksChange}
          onImageUpload={inlineUpload}
          singleDocument={["blog-posts", "portfolio-writing"].includes(
            collection.slug,
          )}
        />
      );
    }
    if (tab === "connections") {
      if (collection.slug === "commission-services") return serviceAddons();
      const contextualKeys = [
        "commission-styles",
        "commission-pictures",
      ].includes(collection.slug)
        ? ["service", "style"]
        : ["character-gallery", "character-outfits"].includes(collection.slug)
          ? ["character"]
          : collection.slug === "location-gallery"
            ? ["location"]
            : [];
      return (
        <CmsRelationEditor
          compact
          definitions={visibleDefinitions.filter(
            (definition) =>
              !(
                contextualKeys.includes(definition.key) &&
                relationSelections[definition.id]?.length
              ),
          )}
          entryId={selectedEntryId}
          onChange={onRelationsChange}
          selections={relationSelections}
          studio={studio}
        />
      );
    }
    if (tab === "media")
      return (
        <>
          <CmsEntryMediaSection
            allowedAssetTypes={allowedAssetTypes}
            assets={assets}
            draft={draft}
            collection={collection}
            canSave={canSave}
            onDeleteAsset={onDeleteAsset}
            onSave={onSave}
            onUploadAsset={onUploadAsset}
            onReorderAssets={onReorderAssets}
            onPendingUploadFileChange={onPendingUploadFileChange}
            onTitleChange={onTitleChange}
            isBlog={isBlog}
            pending={pending}
            selectedEntryId={selectedEntryId}
            taggedCharactersDefinition={taggedCharactersDefinition}
            onRelationsChange={onRelationsChange}
            relationSelections={relationSelections}
            studio={studio}
            onDraftChange={onDraftChange}
            groupedFields={groupedFields}
            fields={fields}
            inlineUpload={inlineUpload}
            onPendingFileChange={(pending) =>
              updatePendingMedia("media", pending)
            }
          />
          {isCharacter ? (
            <button
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-600"
              onClick={() => changeTab("gallery")}
              type="button"
            >
              Manage Gallery
            </button>
          ) : null}
        </>
      );
    if (tab === "settings") {
      if (collection.slug === "stories")
        return (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                checked={draft.status === "published"}
                onChange={(event) =>
                  onDraftChange({
                    ...draft,
                    status: event.target.checked ? "published" : "draft",
                    profile_data: {
                      ...profile,
                      isPublished: event.target.checked,
                    },
                  })
                }
                type="checkbox"
              />
              Published
            </label>
            <label className="block text-sm font-medium">
              Visibility
              <select
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                onChange={(event) =>
                  onDraftChange({
                    ...draft,
                    profile_data: {
                      ...profile,
                      visibility: event.target.value,
                    },
                  })
                }
                value={
                  typeof profile.visibility === "string"
                    ? profile.visibility
                    : "private"
                }
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </label>
          </>
        );
      return (
        <>
          <CmsStructuredFields
            compact
            definitions={groupedFields.publishing}
            draft={draft}
            onChange={onDraftChange}
          />
          {isBlog || showPublishingControls ? (
            <CmsPublishingSettings draft={draft} onChange={onDraftChange} />
          ) : null}
        </>
      );
    }
    return null;
  };

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${isBlog ? "bg-transparent" : "bg-white dark:bg-gray-800"}`}
    >
      <div
        className={
          isBlog
            ? "shrink-0 border-b border-zinc-200/80 px-4 py-5 sm:px-6 dark:border-zinc-800/80"
            : "shrink-0 px-4 pt-6 pb-4 sm:px-6"
        }
      >
        {isBlog ? (
          <p className="text-xs font-semibold tracking-[0.32em] text-red-700 uppercase dark:text-red-300">
            {selectedEntryId ? "Edit Sequence" : "Draft Sequence"}
          </p>
        ) : null}
        <h2
          className={
            isBlog
              ? "mt-2 font-serif text-3xl text-zinc-950 dark:text-zinc-50"
              : "truncate text-2xl font-bold text-gray-900 dark:text-white"
          }
        >
          {isBlog
            ? selectedEntryId
              ? "Edit Blog Post"
              : "Create Blog Post"
            : selectedEntryId
              ? `Edit ${itemName}`
              : collection.slug === "commission-pictures"
                ? "Upload New Picture"
                : `Create New ${itemName}`}
        </h2>
        {isBlog ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Tighten the metadata, sharpen the excerpt, and control when the
            archive entry becomes visible.
          </p>
        ) : null}
        {isBlog ? (
          <div className="mt-4 rounded-[1.5rem] border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {blogPublishState(blogPublishDate(draft)).label}
            </p>
            <p className="mt-1 text-xs tracking-[0.22em] uppercase">
              {selectedEntryId ? "Editing existing entry" : "New archive entry"}
            </p>
          </div>
        ) : null}
      </div>

      {!isConnectionEntry && tabs.length ? (
        <CmsEditorTabs
          activeTab={activeTab}
          onChange={changeTab}
          tabs={
            collection.slug === "commission-services" && !selectedEntryId
              ? tabs.slice(0, 1)
              : tabs
          }
        />
      ) : null}

      {error ? (
        <div
          className="mx-4 mt-4 rounded-md bg-red-50 p-4 text-sm text-red-800 sm:mx-6 dark:bg-red-900/20 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      {pendingUploadFileName && !uploadStatus ? (
        <div className="mx-4 mt-3 flex items-center justify-between rounded-md bg-blue-50 p-3 text-sm text-blue-800 sm:mx-6 dark:bg-blue-900/20 dark:text-blue-200">
          <span>{pendingUploadFileName} — uploads when you save</span>
        </div>
      ) : null}
      {uploadStatus ? (
        <div
          aria-live="polite"
          className="mx-4 mt-3 rounded-xl border border-cyan-200 bg-cyan-50/95 px-4 py-3 shadow-sm sm:mx-6 dark:border-cyan-900/70 dark:bg-cyan-950/55"
        >
          <div className="flex items-center gap-3">
            <UploadCloud className="h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-300" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-cyan-950 dark:text-cyan-100">
                <span className="truncate">
                  {uploadStatus.stage === "preparing"
                    ? "Preparing"
                    : uploadStatus.stage === "saving"
                      ? "Finishing"
                      : "Uploading"}{" "}
                  {uploadStatus.fileName}
                </span>
                <span>{uploadStatus.percentage}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cyan-950/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500 transition-[width] duration-200"
                  style={{ width: `${uploadStatus.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="@container min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
        {isConnectionEntry ? (
          <CmsConnectionEntryEditor
            allowedBlockTypes={allowedBlockTypes}
            blocks={blocks}
            collectionSlug={collection.slug}
            definitions={definitions}
            duplicate={duplicateConnection}
            draft={draft}
            fields={fields.filter(
              (field) =>
                ![
                  "displayOrder",
                  "display_order",
                  "sortOrder",
                  "sort_order",
                ].includes(field.key),
            )}
            onBlocksChange={onBlocksChange}
            onDraftChange={onDraftChange}
            onRelationsChange={onRelationsChange}
            onImageUpload={inlineUpload}
            relationSelections={relationSelections}
            studio={studio}
          />
        ) : isBlog ? (
          <CmsLegacyBlogEditor
            draft={draft}
            blocks={blocks}
            onDraftChange={onDraftChange}
            onTitleChange={onTitleChange}
            onBlocksChange={onBlocksChange}
            onImageUpload={inlineUpload}
            media={renderSection("media")}
            isDirty={isDirty}
            pendingFileName={pendingUploadFileName}
            hasCover={assets.some((asset) => asset.asset_type === "image")}
          />
        ) : collection.slug === "portfolio-writing" ? (
          <div className="space-y-4">
            <CmsEntryBasics
              collectionSlug={collection.slug}
              draft={draft}
              onChange={onDraftChange}
              onTitleChange={onTitleChange}
            />
            {renderSection("media")}
            {markdown("Content", "Write your piece...", "Content *")}
            {structured(["year", "createdDate", "tags", "wordCount"])}
            {renderSection("settings")}
          </div>
        ) : collection.slug === "portfolio-games" ? (
          <div className="space-y-4">
            <CmsEntryBasics
              collectionSlug={collection.slug}
              draft={draft}
              onChange={onDraftChange}
              onTitleChange={onTitleChange}
            />
            {structured(["gameUrl"])}
            {renderSection("media")}
          </div>
        ) : tabs.length ? (
          tabs.map((tab) => (
            <section
              aria-labelledby={`cms-${tab.id}-tab`}
              className="space-y-4"
              hidden={activeTab !== tab.id}
              id={`cms-${tab.id}-panel`}
              key={tab.id}
              role="tabpanel"
            >
              {renderSection(tab.id)}
            </section>
          ))
        ) : (
          <div
            className={
              isBlog
                ? "grid gap-6 @2xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.8fr)]"
                : "space-y-4"
            }
          >
            <div className="space-y-4">
              {[
                "portfolio-art",
                "character-gallery",
                "location-gallery",
                "commission-pictures",
                "character-outfits",
              ].includes(collection.slug)
                ? renderSection("media")
                : null}
              {renderSection("basic")}
              {renderSection("details")}
              {allowedBlockTypes.length &&
              ![
                "portfolio-art",
                "character-gallery",
                "location-gallery",
                "commission-pictures",
                "character-outfits",
                "commission-addons",
                "commission-styles",
                "relationship-types",
              ].includes(collection.slug)
                ? renderSection("content")
                : null}
            </div>
            <div className="space-y-4">
              {![
                "portfolio-art",
                "character-gallery",
                "location-gallery",
                "commission-pictures",
                "character-outfits",
              ].includes(collection.slug) && allowedAssetTypes.length
                ? renderSection("media")
                : null}
              {visibleDefinitions.length ? renderSection("connections") : null}
              {renderSection("settings")}
            </div>
          </div>
        )}
      </div>

      <div
        className={`sticky bottom-0 flex shrink-0 flex-col-reverse items-stretch gap-2 border-t px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-4 ${isBlog ? "border-zinc-200 bg-[#fffaf6]/95 dark:border-zinc-800 dark:bg-zinc-950/95" : "border-gray-300 bg-white/95 dark:border-gray-600 dark:bg-gray-800/95"}`}
      >
        <div>
          {isBlog ? (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {draft.slug
                ? `Preview path: /blog/${draft.slug}`
                : "Add a title to generate the post slug."}
            </span>
          ) : selectedEntryId ? (
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 sm:w-auto dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              disabled={pending}
              onClick={() => setConfirmingDelete(true)}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            className="w-full rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 sm:w-auto dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${isBlog ? "rounded-full bg-zinc-950 hover:bg-red-700 dark:bg-red-600 dark:text-zinc-950 dark:hover:bg-red-500" : "rounded bg-blue-600 hover:bg-blue-700"}`}
            disabled={!canSave}
            onClick={onSave}
            type="button"
          >
            {pending
              ? "Saving..."
              : selectedEntryId
                ? isBlog
                  ? "Update post"
                  : isConnectionEntry
                    ? "Save changes"
                    : `Update ${itemName}`
                : isBlog
                  ? "Create post"
                  : isConnectionEntry
                    ? collection.slug === "character-relationships"
                      ? "Add relationship"
                      : "Add membership"
                    : `Create ${itemName}`}
          </button>
        </div>
      </div>

      <ConfirmDeleteDialog
        isOpen={confirmingDelete}
        loading={pending}
        message={
          isConnectionEntry
            ? "This connection will be permanently removed from the wiki."
            : `“${draft.title}” and everything attached to it will be permanently removed.`
        }
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false);
          onDelete();
        }}
        title={`Delete this ${itemName.toLowerCase()}?`}
      />
    </div>
  );
}
