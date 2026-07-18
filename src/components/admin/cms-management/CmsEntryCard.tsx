"use client";

import { shouldBypassImageOptimization } from "@/components/admin/cms-management/editor-utils";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
} from "@/types/exocorpse-cms";
import { FileImage, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

const statusStyles: Record<ExocorpseCmsEntry["status"], string> = {
  archived: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  published:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  scheduled: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
};

const statusLabels: Record<ExocorpseCmsEntry["status"], string> = {
  archived: "Archived",
  draft: "Draft",
  published: "Live",
  scheduled: "Scheduled",
};

export default function CmsEntryCard({
  asset,
  collection,
  eager = false,
  entry,
  onDelete,
  onEdit,
}: {
  asset?: ExocorpseCmsAsset;
  collection: ExocorpseCmsCollection;
  eager?: boolean;
  entry: ExocorpseCmsEntry;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const imageUrl = asset?.preview_url ?? asset?.asset_url;
  const previewAspect =
    collection.slug === "portfolio-art" ? "aspect-square" : "aspect-[16/10]";

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition [contain-intrinsic-size:auto_390px] [content-visibility:auto] hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-cyan-700">
      <div
        className={`relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 ${previewAspect}`}
      >
        <button
          aria-label={`Edit ${entry.title}`}
          className="absolute inset-0 z-10"
          onClick={onEdit}
          type="button"
        />
        <div className="absolute inset-0">
          {asset?.asset_type === "image" && imageUrl ? (
            <Image
              alt={asset.alt_text ?? entry.title}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              fill
              fetchPriority={eager ? "high" : "auto"}
              loading={eager ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Crect width='12' height='8' fill='%23181a20'/%3E%3C/svg%3E"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              src={imageUrl}
              unoptimized={shouldBypassImageOptimization(asset)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.13),transparent_58%)] text-zinc-400 dark:text-zinc-600">
              <FileImage className="h-8 w-8" />
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">
                {collection.title}
              </span>
            </div>
          )}
        </div>
        <span
          className={`pointer-events-none absolute top-3 left-3 z-20 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm ${statusStyles[entry.status]}`}
        >
          {statusLabels[entry.status]}
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate font-serif text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          {entry.title || "Untitled"}
        </h3>
        {entry.subtitle || entry.summary ? (
          <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
            {entry.subtitle || entry.summary}
          </p>
        ) : (
          <p className="mt-1 min-h-10 text-sm text-zinc-400 italic dark:text-zinc-600">
            No description yet
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-900">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-500"
            onClick={onEdit}
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
            onClick={onDelete}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
