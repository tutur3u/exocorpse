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
import type { AdminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import type {
  CmsBlockDraft,
  CmsEntryDraft,
  CmsRelationSelections,
} from "@/components/admin/cms-management/editor-types";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
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
  const [activeTab, setActiveTab] = useState<CmsEditorTab>("content");
  const canSave = Boolean(draft.title.trim() && draft.slug.trim() && !pending);
  const connectionCount = Object.values(relationSelections).reduce(
    (count, selections) => count + selections.length,
    0,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800">
      <div className="px-4 pt-6 pb-4 sm:px-6">
        <h2 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
          {selectedEntryId
            ? `Edit ${draft.title}`
            : `Create New ${collection.title}`}
        </h2>
      </div>

      <CmsEditorTabs
        activeTab={activeTab}
        assetCount={assets.length}
        blockCount={blocks.length}
        connectionCount={connectionCount}
        hasConnections={definitions.length > 0}
        onChange={setActiveTab}
        theme={theme}
      />

      <div
        aria-labelledby={`cms-${activeTab}-tab`}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6"
        id={`cms-${activeTab}-panel`}
        role="tabpanel"
      >
        {activeTab === "content" ? (
          <>
            <CmsEntryBasics
              draft={draft}
              onChange={onDraftChange}
              onTitleChange={onTitleChange}
            />
            <CmsStructuredFields
              definitions={fields}
              draft={draft}
              onChange={onDraftChange}
            />
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
          <CmsMediaPanel
            allowedAssetTypes={allowedAssetTypes}
            assets={assets}
            canSave={canSave}
            onDelete={onDeleteAsset}
            onSave={onSave}
            onUpload={onUploadAsset}
            pending={pending}
            saved={Boolean(selectedEntryId)}
          />
        ) : null}

        {activeTab === "settings" ? (
          <CmsPublishingSettings draft={draft} onChange={onDraftChange} />
        ) : null}
      </div>

      <div className="sticky bottom-0 flex flex-col-reverse items-stretch gap-2 border-t border-gray-300 bg-white/95 px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-4 dark:border-gray-600 dark:bg-gray-800/95">
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
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            disabled={!canSave}
            onClick={onSave}
            type="button"
          >
            <Save className="h-4 w-4" />
            {pending ? "Saving..." : "Save changes"}
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
