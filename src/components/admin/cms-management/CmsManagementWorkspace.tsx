"use client";

import CmsEntryEditor from "@/components/admin/cms-management/CmsEntryEditor";
import CmsEntryList from "@/components/admin/cms-management/CmsEntryList";
import { useCmsManagementWorkspace } from "@/components/admin/cms-management/useCmsManagementWorkspace";
import type { AdminCmsSection } from "@/lib/admin-cms-sections";
import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";
import { ArrowUpRight, Library, RefreshCw, X } from "lucide-react";
import Link from "next/link";

export default function CmsManagementWorkspace({
  cmsHref,
  initialStudio,
  section,
}: {
  cmsHref: string;
  initialStudio: ExocorpseCmsStudio;
  section: AdminCmsSection;
}) {
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

  return (
    <div className="@container space-y-5">
      <header className="relative overflow-hidden rounded-[1.75rem] border border-zinc-200/80 bg-zinc-950 px-5 py-6 text-white shadow-[0_24px_80px_rgba(9,9,11,0.18)] @3xl:px-8 @3xl:py-8 dark:border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.18),transparent_28%),linear-gradient(135deg,transparent_45%,rgba(244,63,94,0.08))]" />
        <div className="relative flex flex-col gap-5 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-cyan-300 uppercase">
              {section.eyebrow}
            </p>
            <h1 className="mt-2 font-serif text-3xl leading-tight font-semibold tracking-tight @3xl:text-4xl">
              {section.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
              {section.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
              href="/"
              target="_blank"
            >
              View public site
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-cyan-300"
              href={cmsHref}
              rel="noreferrer"
              target="_blank"
            >
              <Library className="h-3.5 w-3.5" />
              Open content library
            </a>
          </div>
        </div>
      </header>

      {message ? (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
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

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white/80 p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
        {visibleCollections.map((item) => {
          const count = studio.entries.filter(
            (entry) => entry.collection_id === item.id,
          ).length;
          return (
            <button
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                item.id === collection.id
                  ? "bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
              }`}
              key={item.id}
              onClick={() => selectCollection(item.id)}
              type="button"
            >
              {item.title}
              <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[10px] opacity-70">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid min-h-[68vh] overflow-hidden rounded-[1.75rem] border border-zinc-200/80 bg-white shadow-[0_20px_70px_rgba(24,24,27,0.08)] @4xl:grid-cols-[19rem_minmax(0,1fr)] dark:border-zinc-800 dark:bg-zinc-950">
        <CmsEntryList
          collection={collection}
          entries={entries}
          onCreate={createEntry}
          onSelect={setEntryId}
          selectedEntryId={entryId}
        />
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
          onDelete={deleteEntry}
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
      </div>

      {pending ? (
        <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-zinc-950">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Saving your changes…
        </div>
      ) : null}
    </div>
  );
}
