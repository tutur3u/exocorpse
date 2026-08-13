"use client";

import CmsBlockEditor from "@/components/admin/cms-management/CmsBlockEditor";
import CmsEditorTabs, {
  type CmsEditorTab,
} from "@/components/admin/cms-management/CmsEditorTabs";
import CmsEntryBasics from "@/components/admin/cms-management/CmsEntryBasics";
import CmsMediaPanel from "@/components/admin/cms-management/CmsMediaPanel";
import CmsPublishingSettings from "@/components/admin/cms-management/CmsPublishingSettings";
import CmsRelationEditor from "@/components/admin/cms-management/CmsRelationEditor";
import CmsStructuredFields from "@/components/admin/cms-management/CmsStructuredFields";
import CmsCharacterMediaSettings, {
  isCharacterMediaField,
} from "@/components/admin/cms-management/CmsCharacterMediaSettings";
import type { AdminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import { collectionItemLabel } from "@/components/admin/cms-management/collection-copy";
import type {
  CmsBlockDraft,
  CmsEntryDraft,
  CmsRelationSelections,
} from "@/components/admin/cms-management/editor-types";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import {
  legacyEditorTabs,
  splitLegacyEditorFields,
} from "@/components/admin/cms-management/legacy-editor-tabs";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsFieldDefinition,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import { Save, Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
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
  onUploadAsset: (formData: FormData) => void;
  onRelationsChange: (selections: CmsRelationSelections) => void;
  onReorderAssets: (assets: ExocorpseCmsAsset[]) => void;
  pending: boolean;
  relationSelections: CmsRelationSelections;
  selectedEntryId: string;
  studio: ExocorpseCmsStudio;
  theme: AdminCmsTheme;
};

export default function CmsEntryEditor({
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
  pending,
  relationSelections,
  selectedEntryId,
  studio,
  theme,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<CmsEditorTab>("basic");
  const canSave = Boolean(draft.title.trim() && draft.slug.trim() && !pending);
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
  const relationInBasics =
    definitions.length > 0 &&
    ["stories", "worlds", "factions", "locations"].includes(collection.slug);
  const singlePageLayout =
    collection.slug === "blog-posts" ||
    collection.slug.startsWith("portfolio-") ||
    collection.slug === "commission-services" ||
    collection.slug === "commission-addons";
  const isBlog = collection.slug === "blog-posts";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800">
      <div
        className={`px-4 pt-6 pb-4 sm:px-6 ${isBlog ? "border-b border-zinc-200 bg-linear-to-br from-red-50 via-white to-orange-50 dark:border-zinc-800 dark:from-red-950/30 dark:via-zinc-950 dark:to-zinc-950" : ""}`}
      >
        {isBlog ? (
          <p className="text-xs font-semibold tracking-[0.32em] text-red-700 uppercase dark:text-red-300">
            {selectedEntryId ? "Edit Sequence" : "Draft Sequence"}
          </p>
        ) : null}
        <h2 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
          {selectedEntryId ? `Edit ${itemName}` : `Create New ${itemName}`}
        </h2>
        {isBlog ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Tighten the metadata, sharpen the excerpt, and control when the
            archive entry becomes visible.
          </p>
        ) : null}
      </div>

      {!singlePageLayout ? (
        <CmsEditorTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={tabs}
          theme={theme}
        />
      ) : null}

      <div
        aria-labelledby={`cms-${activeTab}-tab`}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6"
        id={`cms-${activeTab}-panel`}
        role="tabpanel"
      >
        {singlePageLayout ? (
          <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.8fr)]">
            <div className="space-y-5">
              <CmsEntryBasics
                draft={draft}
                onChange={onDraftChange}
                onTitleChange={onTitleChange}
              />
              <CmsBlockEditor
                allowedBlockTypes={allowedBlockTypes}
                blocks={blocks}
                onChange={onBlocksChange}
              />
            </div>
            <div className="space-y-5">
              <CmsStructuredFields
                definitions={fields}
                draft={draft}
                onChange={onDraftChange}
              />
              {definitions.length ? (
                <CmsRelationEditor
                  definitions={definitions}
                  entryId={selectedEntryId}
                  onChange={onRelationsChange}
                  selections={relationSelections}
                  studio={studio}
                />
              ) : null}
              {allowedAssetTypes.length ? (
                <CmsMediaPanel
                  allowedAssetTypes={allowedAssetTypes}
                  assets={assets}
                  canSave={canSave}
                  onDelete={onDeleteAsset}
                  onSave={onSave}
                  onUpload={onUploadAsset}
                  onReorder={onReorderAssets}
                  pending={pending}
                  saved={Boolean(selectedEntryId)}
                />
              ) : null}
              <CmsPublishingSettings draft={draft} onChange={onDraftChange} />
            </div>
          </div>
        ) : activeTab === "basic" ? (
          <>
            <CmsEntryBasics
              draft={draft}
              onChange={onDraftChange}
              onTitleChange={onTitleChange}
            />
            <CmsStructuredFields
              definitions={groupedFields.basic}
              draft={draft}
              onChange={onDraftChange}
              title="Basic Details"
            />
            {relationInBasics ? (
              <CmsRelationEditor
                definitions={definitions}
                entryId={selectedEntryId}
                onChange={onRelationsChange}
                selections={relationSelections}
                studio={studio}
              />
            ) : null}
          </>
        ) : null}

        {activeTab === "details" ? (
          <CmsStructuredFields
            definitions={groupedFields.details}
            draft={draft}
            onChange={onDraftChange}
          />
        ) : null}

        {activeTab === "content" ? (
          <>
            <CmsBlockEditor
              allowedBlockTypes={allowedBlockTypes}
              blocks={blocks}
              onChange={onBlocksChange}
            />
          </>
        ) : null}

        {activeTab === "connections" ? (
          <CmsRelationEditor
            definitions={definitions}
            entryId={selectedEntryId}
            onChange={onRelationsChange}
            selections={relationSelections}
            studio={studio}
          />
        ) : null}

        {activeTab === "media" ? (
          <>
            <CmsCharacterMediaSettings
              assets={assets}
              collectionSlug={collection.slug}
              draft={draft}
              onChange={onDraftChange}
            />
            <CmsStructuredFields
              definitions={groupedFields.visuals}
              draft={draft}
              onChange={onDraftChange}
              title="Visual Style"
            />
            <CmsMediaPanel
              allowedAssetTypes={allowedAssetTypes}
              assets={assets}
              canSave={canSave}
              onDelete={onDeleteAsset}
              onSave={onSave}
              onUpload={onUploadAsset}
              onReorder={onReorderAssets}
              pending={pending}
              saved={Boolean(selectedEntryId)}
            />
          </>
        ) : null}

        {activeTab === "settings" ? (
          <>
            <CmsStructuredFields
              definitions={groupedFields.publishing}
              draft={draft}
              onChange={onDraftChange}
              title="Publishing Options"
            />
            <CmsPublishingSettings draft={draft} onChange={onDraftChange} />
          </>
        ) : null}
      </div>

      <div
        className={`sticky bottom-0 flex flex-col-reverse items-stretch gap-2 border-t px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-4 ${isBlog ? "border-zinc-200 bg-[#fffaf6]/95 dark:border-zinc-800 dark:bg-zinc-950/95" : "border-gray-300 bg-white/95 dark:border-gray-600 dark:bg-gray-800/95"}`}
      >
        <div>
          {selectedEntryId ? (
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
            <Save className="h-4 w-4" />
            {pending
              ? "Saving..."
              : selectedEntryId
                ? `Update ${itemName}`
                : `Create ${itemName}`}
          </button>
        </div>
      </div>

      <ConfirmDeleteDialog
        isOpen={confirmingDelete}
        loading={pending}
        message={`“${draft.title}” and everything attached to it will be permanently removed.`}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false);
          onDelete();
        }}
        title={`Delete this ${collection.title.toLowerCase()}?`}
      />
    </div>
  );
}
