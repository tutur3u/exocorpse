"use client";

import { shouldBypassImageOptimization } from "@/components/admin/cms-management/editor-utils";
import { entryCardDescription } from "@/components/admin/cms-management/gallery-utils";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
} from "@/types/exocorpse-cms";
import { Pencil, Trash2 } from "lucide-react";
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
  avatarAsset,
  collection,
  eager = false,
  entry,
  onDelete,
  onEdit,
  previewAsset,
}: {
  avatarAsset?: ExocorpseCmsAsset;
  collection: ExocorpseCmsCollection;
  eager?: boolean;
  entry: ExocorpseCmsEntry;
  onDelete: () => void;
  onEdit: () => void;
  previewAsset?: ExocorpseCmsAsset;
}) {
  const imageUrl = previewAsset?.preview_url ?? previewAsset?.asset_url;
  const avatarUrl = avatarAsset?.preview_url ?? avatarAsset?.asset_url;
  const hasPreview = previewAsset?.asset_type === "image" && Boolean(imageUrl);
  const description = entryCardDescription(entry);
  const previewAspect =
    collection.slug === "portfolio-art" ? "aspect-square" : "aspect-[12/5]";

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition [contain-intrinsic-size:auto_230px] [content-visibility:auto] hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-cyan-700">
      {hasPreview && imageUrl && previewAsset ? (
        <div
          className={`relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 ${previewAspect}`}
        >
          <button
            aria-label={`Edit ${entry.title}`}
            className="absolute inset-0 z-10"
            onClick={onEdit}
            type="button"
          />
          <Image
            alt={previewAsset.alt_text ?? `${entry.title} preview`}
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 5'%3E%3Crect width='12' height='5' fill='%23181a20'/%3E%3C/svg%3E"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            fetchPriority={eager ? "high" : "auto"}
            fill
            loading={eager ? "eager" : "lazy"}
            placeholder="blur"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            src={imageUrl}
            unoptimized={shouldBypassImageOptimization(previewAsset)}
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/10" />
          <span
            className={`pointer-events-none absolute top-3 left-3 z-20 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm ${statusStyles[entry.status]}`}
          >
            {statusLabels[entry.status]}
          </span>
          {avatarAsset && avatarUrl ? (
            <div className="absolute bottom-3 left-4 z-20 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-zinc-100 shadow-md dark:border-zinc-950 dark:bg-zinc-900">
              <Image
                alt={`${entry.title} profile`}
                className="object-cover"
                fill
                sizes="64px"
                src={avatarUrl}
                unoptimized={shouldBypassImageOptimization(avatarAsset)}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-serif text-lg leading-6 font-semibold text-zinc-950 dark:text-zinc-50">
            {entry.title || "Untitled"}
          </h3>
          {!hasPreview ? (
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[entry.status]}`}
            >
              {statusLabels[entry.status]}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
        <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-900">
          <button
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-500"
            onClick={onEdit}
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            aria-label={`Delete ${entry.title}`}
            className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-3 py-2 text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
            onClick={onDelete}
            title="Delete"
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
