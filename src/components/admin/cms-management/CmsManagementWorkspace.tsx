"use client";

import CmsEntryEditor from "@/components/admin/cms-management/CmsEntryEditor";
import CmsEntryEditorDialog from "@/components/admin/cms-management/CmsEntryEditorDialog";
import CmsEntryGallery from "@/components/admin/cms-management/CmsEntryGallery";
import { collectionItemLabel } from "@/components/admin/cms-management/collection-copy";
import { buildCmsEntryGalleryFilter } from "@/components/admin/cms-management/gallery-utils";
import { useCmsManagementWorkspace } from "@/components/admin/cms-management/useCmsManagementWorkspace";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import type { AdminCmsSection } from "@/lib/admin-cms-sections";
import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";
import {
  ArrowUpRight,
  ChevronDown,
  FilePlus2,
  Library,
  RefreshCw,
  Settings2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CmsManagementWorkspace({
  cmsHref,
  initialStudio,
  section,
}: {
  cmsHref: string;
  initialStudio: ExocorpseCmsStudio;
  section: AdminCmsSection;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const workspace = useCmsManagementWorkspace({ initialStudio, section });
  const {
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
  } = workspace;

  if (!collection) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
        This content area is not ready yet. Please refresh the page or try again
        in a moment.
      </div>
    );
  }

  const primaryCollectionSlugs = new Set(
    section.primaryCollectionSlugs ??
      (section.collectionSlugs.length ? section.collectionSlugs : []),
  );
  const primaryCollections = primaryCollectionSlugs.size
    ? visibleCollections.filter((item) => primaryCollectionSlugs.has(item.slug))
    : visibleCollections;
  const supportingCollections = primaryCollectionSlugs.size
    ? visibleCollections.filter(
        (item) => !primaryCollectionSlugs.has(item.slug),
      )
    : [];
  const relationFilter = buildCmsEntryGalleryFilter(studio, collection.id);
  const itemLabel = collectionItemLabel(collection);

  const collectionButton = (item: (typeof visibleCollections)[number]) => {
    const count = studio.entries.filter(
      (entry) => entry.collection_id === item.id,
    ).length;
    return (
      <button
        className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
          item.id === collection.id
            ? "bg-cyan-600 text-white shadow-sm"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
        }`}
        key={item.id}
        onClick={() => selectCollection(item.id)}
        type="button"
      >
        {item.title}
        <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[10px] opacity-75">
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="@container space-y-6">
      <header className="flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
            {section.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {section.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => {
              createEntry();
              setEditorOpen(true);
            }}
            type="button"
          >
            <FilePlus2 className="h-4 w-4" />
            New {itemLabel}
          </button>
          <Link
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            href="/"
            target="_blank"
          >
            View public site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          {section.key === "cms" ? (
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
              href={cmsHref}
              rel="noreferrer"
              target="_blank"
            >
              <Library className="h-3.5 w-3.5" />
              Open Tuturuuu CMS
            </a>
          ) : null}
        </div>
      </header>

      {message ? (
        <div
          className={`fixed top-5 right-5 z-[70] flex max-w-md items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl ${
            message.kind === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
              : "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100"
          }`}
          role="status"
        >
          <span>{message.text}</span>
          <button
            aria-label="Dismiss message"
            className="rounded-lg p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setMessage(null)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {primaryCollections.length > 1 ? (
        <nav
          aria-label={`${section.title} content`}
          className="flex gap-1 overflow-x-auto border-b border-zinc-200 pb-2 dark:border-zinc-800"
        >
          {primaryCollections.map(collectionButton)}
        </nav>
      ) : null}

      {supportingCollections.length ? (
        <details className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 marker:content-none dark:text-zinc-300">
            <Settings2 className="h-4 w-4 text-zinc-400" />
            <span className="flex-1">Related content</span>
            <span className="text-xs font-normal text-zinc-500">
              {supportingCollections.length} types
            </span>
            <ChevronDown className="h-4 w-4 text-zinc-400 transition group-open:rotate-180" />
          </summary>
          <div className="flex flex-wrap gap-1 border-t border-zinc-200 p-2 dark:border-zinc-800">
            {supportingCollections.map(collectionButton)}
          </div>
        </details>
      ) : null}

      <CmsEntryGallery
        assets={studio.assets}
        collection={collection}
        entries={entries}
        key={collection.id}
        onCreate={() => {
          createEntry();
          setEditorOpen(true);
        }}
        onDelete={(entry) => setDeletingEntryId(entry.id)}
        onSelect={(nextEntryId) => {
          setEntryId(nextEntryId);
          setEditorOpen(true);
        }}
        relationFilter={relationFilter}
      />

      {editorOpen ? (
        <CmsEntryEditorDialog
          onClose={() => setEditorOpen(false)}
          title={entryId ? `Edit ${draft.title}` : `Add ${collection.title}`}
        >
          <CmsEntryEditor
            allowedAssetTypes={config.assetTypes}
            allowedBlockTypes={config.blockTypes}
            assets={assets}
            blocks={blocks}
            collection={collection}
            definitions={definitions}
            draft={draft}
            fields={fields}
            key={`${collection.id}:${entryId || "new"}`}
            onBlocksChange={setBlocks}
            onDelete={() => {
              deleteEntry();
              setEditorOpen(false);
            }}
            onDeleteAsset={deleteAsset}
            onDraftChange={setDraft}
            onRelationsChange={setRelationSelections}
            onSave={save}
            onTitleChange={changeTitle}
            onUploadAsset={uploadAsset}
            pending={pending}
            relationSelections={relationSelections}
            selectedEntryId={entryId}
            studio={studio}
          />
        </CmsEntryEditorDialog>
      ) : null}

      <ConfirmDeleteDialog
        isOpen={Boolean(deletingEntryId)}
        loading={pending}
        message="This item and everything attached to it will be permanently removed."
        onCancel={() => setDeletingEntryId(null)}
        onConfirm={() => {
          if (deletingEntryId) deleteEntry(deletingEntryId);
          setDeletingEntryId(null);
        }}
        title="Delete this item?"
      />

      {pending ? (
        <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-zinc-950">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Saving your changes…
        </div>
      ) : null}
    </div>
  );
}
