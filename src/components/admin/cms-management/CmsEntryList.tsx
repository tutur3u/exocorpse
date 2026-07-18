"use client";

import type {
  ExocorpseCmsCollection,
  ExocorpseCmsEntry,
} from "@/types/exocorpse-cms";
import { FilePlus2, Search } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  collection: ExocorpseCmsCollection;
  entries: ExocorpseCmsEntry[];
  onCreate: () => void;
  onSelect: (entryId: string) => void;
  selectedEntryId: string;
};

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

export default function CmsEntryList({
  collection,
  entries,
  onCreate,
  onSelect,
  selectedEntryId,
}: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ExocorpseCmsEntry["status"]>(
    "all",
  );
  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries
      .filter((entry) => status === "all" || entry.status === status)
      .filter(
        (entry) =>
          !normalized ||
          entry.title.toLowerCase().includes(normalized) ||
          entry.slug.toLowerCase().includes(normalized),
      )
      .sort((left, right) => {
        if (left.sort_order !== right.sort_order) {
          return left.sort_order - right.sort_order;
        }
        return left.title.localeCompare(right.title);
      });
  }, [entries, query, status]);

  return (
    <aside className="flex min-h-0 flex-col border-b border-zinc-200/80 bg-zinc-50/70 @4xl:border-r @4xl:border-b-0 dark:border-zinc-800 dark:bg-zinc-950/55">
      <div className="space-y-3 border-b border-zinc-200/80 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {collection.title}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {entries.length} {entries.length === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
            onClick={onCreate}
            type="button"
          >
            <FilePlus2 className="h-4 w-4" />
            Add
          </button>
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="w-full rounded-xl border border-zinc-300/80 bg-white py-2 pr-3 pl-9 text-sm transition outline-none placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 dark:border-zinc-700 dark:bg-zinc-900"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title"
            value={query}
          />
        </label>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {(
            ["all", "draft", "published", "scheduled", "archived"] as const
          ).map((option) => (
            <button
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition ${
                status === option
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                  : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              key={option}
              onClick={() => setStatus(option)}
              type="button"
            >
              {option === "all" ? "All" : statusLabels[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid max-h-80 gap-1 overflow-y-auto p-2 @2xl:grid-cols-2 @4xl:max-h-none @4xl:flex-1 @4xl:grid-cols-1">
        {filteredEntries.map((entry) => (
          <button
            className={`rounded-xl border px-3 py-3 text-left transition ${
              selectedEntryId === entry.id
                ? "border-cyan-500 bg-cyan-500/10 shadow-sm"
                : "border-transparent hover:border-zinc-300 hover:bg-white dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            }`}
            key={entry.id}
            onClick={() => onSelect(entry.id)}
            type="button"
          >
            <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {entry.title}
            </span>
            <span className="mt-1.5 flex items-center justify-end gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusStyles[entry.status]}`}
              >
                {statusLabels[entry.status]}
              </span>
            </span>
          </button>
        ))}
        {filteredEntries.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No matching items.
          </div>
        ) : null}
      </div>
    </aside>
  );
}
