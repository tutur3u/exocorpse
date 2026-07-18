"use client";

import CmsEntryCard from "@/components/admin/cms-management/CmsEntryCard";
import { collectionItemLabel } from "@/components/admin/cms-management/collection-copy";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
} from "@/types/exocorpse-cms";
import { FilePlus2, Search } from "lucide-react";
import { useMemo, useState } from "react";

const statusLabels: Record<ExocorpseCmsEntry["status"], string> = {
  archived: "Archived",
  draft: "Draft",
  published: "Live",
  scheduled: "Scheduled",
};

export default function CmsEntryGallery({
  assets,
  collection,
  entries,
  onCreate,
  onDelete,
  onSelect,
}: {
  assets: ExocorpseCmsAsset[];
  collection: ExocorpseCmsCollection;
  entries: ExocorpseCmsEntry[];
  onCreate: () => void;
  onDelete: (entry: ExocorpseCmsEntry) => void;
  onSelect: (entryId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ExocorpseCmsEntry["status"]>(
    "all",
  );
  const itemLabel = collectionItemLabel(collection);
  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries
      .filter((entry) => status === "all" || entry.status === status)
      .filter(
        (entry) =>
          !normalized ||
          entry.title.toLowerCase().includes(normalized) ||
          entry.subtitle?.toLowerCase().includes(normalized) ||
          entry.summary?.toLowerCase().includes(normalized),
      )
      .sort((left, right) => {
        if (left.sort_order !== right.sort_order) {
          return left.sort_order - right.sort_order;
        }
        return left.title.localeCompare(right.title);
      });
  }, [entries, query, status]);

  const firstAssetByEntry = useMemo(() => {
    const previews = new Map<string, ExocorpseCmsAsset>();
    [...assets]
      .sort((left, right) => left.sort_order - right.sort_order)
      .forEach((asset) => {
        if (asset.entry_id && !previews.has(asset.entry_id)) {
          previews.set(asset.entry_id, asset);
        }
      });
    return previews;
  }, [assets]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm @2xl:flex-row @2xl:items-center dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            {collection.title}
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {entries.length} total
          </p>
        </div>
        <label className="relative block min-w-0 @2xl:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            aria-label={`Search ${collection.title}`}
            className="w-full rounded-xl border border-zinc-300/80 bg-white py-2.5 pr-3 pl-9 text-sm transition outline-none placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 dark:border-zinc-700 dark:bg-zinc-900"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${collection.title.toLowerCase()}`}
            value={query}
          />
        </label>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
          onClick={onCreate}
          type="button"
        >
          <FilePlus2 className="h-4 w-4" />
          Add {itemLabel}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "draft", "published", "scheduled", "archived"] as const).map(
          (option) => (
            <button
              className={`rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                status === option
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                  : "border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              key={option}
              onClick={() => setStatus(option)}
              type="button"
            >
              {option === "all" ? "All" : statusLabels[option]}
            </button>
          ),
        )}
      </div>

      {filteredEntries.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry, index) => (
            <CmsEntryCard
              asset={firstAssetByEntry.get(entry.id)}
              collection={collection}
              eager={index < 3}
              entry={entry}
              key={entry.id}
              onDelete={() => onDelete(entry)}
              onEdit={() => onSelect(entry.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            {entries.length ? "No matching items" : `No ${itemLabel} yet`}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {entries.length
              ? "Try a different search or status."
              : `Add your first ${itemLabel} when you are ready.`}
          </p>
        </div>
      )}
    </section>
  );
}
