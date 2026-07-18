"use client";

import CmsAssetManager from "@/components/admin/cms-management/CmsAssetManager";
import CmsBlockEditor from "@/components/admin/cms-management/CmsBlockEditor";
import CmsEntryBasics from "@/components/admin/cms-management/CmsEntryBasics";
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
  const canSave = Boolean(draft.title.trim() && draft.slug.trim() && !pending);

  return (
    <div className="min-w-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_34%)]">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 bg-white/92 px-4 py-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/92">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-cyan-700 uppercase dark:text-cyan-300">
            {selectedEntryId ? "Editing record" : "New record"}
          </p>
          <h2 className="truncate text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            {draft.title || `Untitled ${collection.title} record`}
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
            {pending ? "Saving…" : "Save record"}
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4 @3xl:p-6">
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
        <CmsRelationEditor
          definitions={definitions}
          entryId={selectedEntryId}
          onChange={onRelationsChange}
          selections={relationSelections}
          studio={studio}
        />
        {selectedEntryId ? (
          <CmsAssetManager
            allowedAssetTypes={allowedAssetTypes}
            assets={assets}
            disabled={pending}
            onDelete={onDeleteAsset}
            onUpload={onUploadAsset}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 px-5 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
            Save this record once to unlock managed media uploads.
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        isOpen={confirmingDelete}
        loading={pending}
        message={`Delete “${draft.title}” and its blocks, relations, and attached media? This cannot be undone.`}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false);
          onDelete();
        }}
        title={`Delete ${collection.title} record`}
      />
    </div>
  );
}
