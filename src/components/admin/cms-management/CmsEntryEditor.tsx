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
  onDraftChange: (draft: CmsEntryDraft) => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onUploadAsset: (formData: FormData) => void;
  onRelationsChange: (selections: CmsRelationSelections) => void;
  pending: boolean;
  relationSelections: CmsRelationSelections;
  selectedEntryId: string;
  studio: ExocorpseCmsStudio;
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
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<CmsEditorTab>("content");
  const canSave = Boolean(draft.title.trim() && draft.slug.trim() && !pending);
  const connectionCount = Object.values(relationSelections).reduce(
    (count, selections) => count + selections.length,
    0,
  );

  return (
    <div className="min-w-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_34%)]">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 bg-white/92 py-3 pr-16 pl-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/92">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-cyan-700 uppercase dark:text-cyan-300">
            {selectedEntryId ? "Editing" : "Creating a new item"}
          </p>
          <h2 className="truncate text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            {draft.title || `Untitled ${collection.title}`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {selectedEntryId ? (
            <button
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
              disabled={pending}
              onClick={() => setConfirmingDelete(true)}
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          ) : null}
          <button
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!canSave}
            onClick={onSave}
            type="button"
          >
            <Save className="h-3.5 w-3.5" />
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <CmsEditorTabs
        activeTab={activeTab}
        assetCount={assets.length}
        blockCount={blocks.length}
        connectionCount={connectionCount}
        hasConnections={definitions.length > 0}
        onChange={setActiveTab}
      />

      <div
        aria-labelledby={`cms-${activeTab}-tab`}
        className="min-h-[34rem] space-y-4 p-4 @3xl:p-6"
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
