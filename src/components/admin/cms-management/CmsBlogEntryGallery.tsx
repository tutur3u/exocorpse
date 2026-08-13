"use client";

import { shouldBypassImageOptimization } from "@/components/admin/cms-management/editor-utils";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsEntry,
} from "@/types/exocorpse-cms";
import {
  CalendarClock,
  FilePenLine,
  FileText,
  Plus,
  Search,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

const statusCopy = {
  archived: {
    chip: "border-zinc-700 bg-zinc-800 text-zinc-300",
    label: "Archived",
    summary: "Hidden from the public archive.",
  },
  draft: {
    chip: "border-zinc-700 bg-zinc-800 text-zinc-300",
    label: "Draft",
    summary: "Private and ready for another editing pass.",
  },
  published: {
    chip: "border-emerald-700 bg-emerald-500/15 text-emerald-300",
    label: "Published",
    summary: "Visible in the public blog archive.",
  },
  scheduled: {
    chip: "border-amber-700 bg-amber-500/15 text-amber-300",
    label: "Scheduled",
    summary: "Queued for its selected publication time.",
  },
} satisfies Record<ExocorpseCmsEntry["status"], object>;

function formatShortDate(value: string | null) {
  if (!value) return "Not scheduled yet";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function CmsBlogEntryGallery({
  assets,
  entries,
  onCreate,
  onDelete,
  onSelect,
}: {
  assets: ExocorpseCmsAsset[];
  entries: ExocorpseCmsEntry[];
  onCreate: () => void;
  onDelete: (entry: ExocorpseCmsEntry) => void;
  onSelect: (entryId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ExocorpseCmsEntry["status"]>(
    "all",
  );
  const mediaByEntry = useMemo(
    () =>
      new Map(
        entries.map((entry) => [
          entry.id,
          assets
            .filter(
              (asset) =>
                asset.entry_id === entry.id && asset.asset_type === "image",
            )
            .sort((left, right) => left.sort_order - right.sort_order)[0],
        ]),
      ),
    [assets, entries],
  );
  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter(
      (entry) =>
        (status === "all" || entry.status === status) &&
        (!normalized ||
          [entry.title, entry.slug, entry.subtitle, entry.summary]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalized)),
    );
  }, [entries, query, status]);
  const stats: Array<{
    color: string;
    count: number;
    icon: LucideIcon;
    label: string;
  }> = [
    {
      color: "border-zinc-800 bg-zinc-950/80 text-zinc-100",
      count: entries.filter((entry) => entry.status === "draft").length,
      icon: FileText,
      label: "Drafts",
    },
    {
      color: "border-amber-900/60 bg-amber-500/8 text-amber-300",
      count: entries.filter((entry) => entry.status === "scheduled").length,
      icon: CalendarClock,
      label: "Scheduled",
    },
    {
      color: "border-emerald-900/60 bg-emerald-500/8 text-emerald-300",
      count: entries.filter((entry) => entry.status === "published").length,
      icon: Sparkles,
      label: "Published",
    },
  ];

  return (
    <div className="@container space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-[linear-gradient(180deg,rgba(9,12,20,0.98),rgba(13,14,18,0.98))] shadow-[0_30px_90px_-45px_rgba(0,0,0,0.55)]">
        <div className="border-b border-zinc-800/90 bg-[radial-gradient(circle_at_top_left,rgba(145,49,44,0.28),transparent_38%),linear-gradient(180deg,rgba(24,16,18,0.88),rgba(15,15,18,0.25))] px-5 py-5 @lg:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold tracking-[0.34em] text-red-300 uppercase">
                Editorial Desk
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-50">
                Blog post management
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Manage drafts, scheduled drops, and published entries without
                the layout overwhelming the content.
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500"
              onClick={onCreate}
              type="button"
            >
              <Plus className="h-4 w-4" />
              New Post
            </button>
          </div>
        </div>

        <div className="grid gap-3 px-5 py-4 @md:grid-cols-3 @lg:px-6">
          {stats.map(({ color, count, icon: Icon, label }) => (
            <div className={`rounded-2xl border p-4 ${color}`} key={label}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-current/10">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.24em] uppercase opacity-80">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-50">
                    {count}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/95 p-4 @lg:p-5">
        <div className="grid gap-3 @xl:grid-cols-[minmax(0,1.3fr)_minmax(12rem,0.55fr)]">
          <label>
            <span className="mb-2 block text-[11px] font-semibold tracking-[0.24em] text-zinc-500 uppercase">
              Search
            </span>
            <span className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-11 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-red-500"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Title, slug, excerpt, or content snippet"
                type="search"
                value={query}
              />
            </span>
          </label>
          <label>
            <span className="mb-2 block text-[11px] font-semibold tracking-[0.24em] text-zinc-500 uppercase">
              Status
            </span>
            <select
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-red-500"
              onChange={(event) =>
                setStatus(
                  event.target.value as "all" | ExocorpseCmsEntry["status"],
                )
              }
              value={status}
            >
              <option value="all">All statuses</option>
              <option value="draft">Drafts</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        <p className="mt-4 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
          {entries.length.toLocaleString()} total posts.{" "}
          {filteredEntries.length} visible with current filters.
        </p>
      </section>

      {filteredEntries.length ? (
        <section className="space-y-4">
          {filteredEntries.map((entry) => {
            const statusData = statusCopy[entry.status];
            const asset = mediaByEntry.get(entry.id);
            const imageUrl = asset?.preview_url ?? asset?.asset_url;
            return (
              <article
                className="overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.7)]"
                key={entry.id}
              >
                <div className="grid @lg:grid-cols-[15rem_minmax(0,1fr)_15rem]">
                  <div className="relative min-h-48 overflow-hidden border-b border-zinc-800 @lg:border-r @lg:border-b-0">
                    {asset && imageUrl ? (
                      <Image
                        alt={asset.alt_text ?? entry.title}
                        className="object-cover"
                        fill
                        sizes="(max-width: 1024px) 100vw, 240px"
                        src={imageUrl}
                        unoptimized={shouldBypassImageOptimization(asset)}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(173,63,48,0.45),transparent_30%),linear-gradient(135deg,rgba(48,32,34,0.96),rgba(19,19,23,1))]" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-zinc-950 p-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusData.chip}`}
                      >
                        {statusData.label}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4 p-5 @lg:p-6">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.3em] text-zinc-500 uppercase">
                        /{entry.slug}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
                        {entry.title}
                      </h2>
                    </div>
                    <p className="text-sm leading-7 text-zinc-400">
                      {entry.summary ??
                        entry.subtitle ??
                        "No excerpt yet. Open the editor to add a sharper listing summary."}
                    </p>
                    <div className="grid gap-3 @md:grid-cols-3">
                      {[
                        ["Created", formatShortDate(entry.created_at)],
                        ["Updated", formatShortDate(entry.updated_at)],
                        [
                          "Publish Window",
                          formatShortDate(
                            entry.scheduled_for ?? entry.published_at,
                          ),
                        ],
                      ].map(([label, value]) => (
                        <div
                          className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3"
                          key={label}
                        >
                          <p className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500 uppercase">
                            {label}
                          </p>
                          <p className="mt-1 text-sm text-zinc-200">{value}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-zinc-400">
                      {statusData.summary}
                    </p>
                  </div>
                  <div className="border-t border-zinc-800 bg-zinc-950/60 p-5 @lg:border-t-0 @lg:border-l @lg:p-6">
                    <p className="text-[11px] font-semibold tracking-[0.26em] text-zinc-500 uppercase">
                      Actions
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 @lg:flex-col">
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500"
                        onClick={() => onSelect(entry.id)}
                        type="button"
                      >
                        <FilePenLine className="h-4 w-4" /> Edit
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-900/70 bg-red-500/8 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/15"
                        onClick={() => onDelete(entry)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-zinc-300" />
          <h2 className="mt-4 text-2xl font-semibold text-zinc-50">
            No blog posts match
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Create a first draft or adjust the current filters.
          </p>
        </div>
      )}
    </div>
  );
}
