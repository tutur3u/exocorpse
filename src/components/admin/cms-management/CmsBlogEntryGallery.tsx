"use client";

import {
  isJsonRecord,
  shouldBypassImageOptimization,
} from "@/components/admin/cms-management/editor-utils";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsEntry,
} from "@/types/exocorpse-cms";
import {
  ChevronDown,
  Check,
  Copy,
  ExternalLink,
  FilePenLine,
  FileText,
  Globe2,
  Search,
  Trash2,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type BlogVisibility = ExocorpseCmsEntry["status"] | "unlisted";

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
  unlisted: {
    chip: "border-cyan-700 bg-cyan-500/15 text-cyan-200",
    label: "Unlisted",
    summary: "Available to anyone with the direct link.",
  },
} satisfies Record<BlogVisibility, object>;

function visibilityFor(entry: ExocorpseCmsEntry): BlogVisibility {
  const profile = isJsonRecord(entry.profile_data) ? entry.profile_data : {};
  return entry.status === "published" && profile.visibility === "unlisted"
    ? "unlisted"
    : entry.status;
}

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
  onDelete,
  onSelect,
  onSetVisibility,
}: {
  assets: ExocorpseCmsAsset[];
  entries: ExocorpseCmsEntry[];
  onDelete: (entry: ExocorpseCmsEntry) => void;
  onSelect: (entryId: string) => void;
  onSetVisibility: (
    entryId: string,
    visibility: "draft" | "published" | "unlisted",
  ) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | BlogVisibility>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
        (status === "all" || visibilityFor(entry) === status) &&
        (!normalized ||
          [entry.title, entry.slug, entry.subtitle, entry.summary]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalized)),
    );
  }, [entries, query, status]);
  const statusTabs: Array<{
    id: "all" | BlogVisibility;
    label: string;
  }> = [
    { id: "all", label: "All" },
    { id: "draft", label: "Drafts" },
    { id: "scheduled", label: "Scheduled" },
    { id: "published", label: "Published" },
    { id: "unlisted", label: "Unlisted" },
    { id: "archived", label: "Archived" },
  ];

  return (
    <div className="@container space-y-5">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-5 shadow-sm dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.09),transparent_32%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.07),transparent_26%),linear-gradient(180deg,rgba(8,12,22,0.98),rgba(5,8,15,0.98))]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-cyan-300/15 via-cyan-300/70 to-fuchsia-300/45" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-slate-950 dark:text-[#fff6e8]">
              Find posts
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Search by title or choose who can see them.
            </p>
          </div>
          <span className="rounded-full border border-slate-200/80 bg-white/60 px-3 py-1.5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400">
            {filteredEntries.length} of {entries.length}
          </span>
        </div>
        <label className="relative mt-4 block">
          <span className="sr-only">Search posts</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="h-11 w-full rounded-md border border-slate-300 bg-white/80 pr-3 pl-9 text-sm text-slate-900 shadow-inner outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles or excerpts…"
            type="search"
            value={query}
          />
        </label>
        <nav
          aria-label="Filter blog posts"
          className="mt-3 flex gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-white/45 p-1 dark:border-white/8 dark:bg-white/[0.025]"
        >
          {statusTabs.map((tab) => {
            const count =
              tab.id === "all"
                ? entries.length
                : entries.filter((entry) => visibilityFor(entry) === tab.id)
                    .length;
            return (
              <button
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  status === tab.id
                    ? "bg-cyan-600 text-white shadow-sm dark:bg-cyan-400/15 dark:text-cyan-100"
                    : "text-zinc-500 hover:bg-white hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.055] dark:hover:text-zinc-100"
                }`}
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                type="button"
              >
                {tab.label}
                <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {filteredEntries.length ? (
        <section className="space-y-4">
          {filteredEntries.map((entry) => {
            const visibility = visibilityFor(entry);
            const statusData = statusCopy[visibility];
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
                      <h2 className="text-2xl font-semibold text-zinc-50">
                        {entry.title}
                      </h2>
                    </div>
                    <p className="text-sm leading-7 text-zinc-400">
                      {entry.summary ??
                        entry.subtitle ??
                        "No excerpt yet. Open the editor to add a sharper listing summary."}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {statusData.summary} Updated{" "}
                      {formatShortDate(entry.updated_at)}.
                    </p>
                  </div>
                  <div className="border-t border-zinc-800 bg-zinc-950/60 p-5 @lg:border-t-0 @lg:border-l @lg:p-6">
                    <div className="flex flex-wrap gap-3 @lg:flex-col">
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-cyan-500"
                        onClick={() => onSelect(entry.id)}
                        type="button"
                      >
                        <FilePenLine className="h-4 w-4" /> Edit
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-cyan-500/60 hover:bg-cyan-500/10 hover:text-cyan-100"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/?blog-post=${encodeURIComponent(entry.slug)}`,
                          );
                          setCopiedId(entry.id);
                          window.setTimeout(() => setCopiedId(null), 1800);
                        }}
                        type="button"
                      >
                        {copiedId === entry.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copiedId === entry.id ? "Copied" : "Copy link"}
                      </button>
                      {visibility === "published" ||
                      visibility === "unlisted" ? (
                        <a
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900"
                          href={`/?blog-post=${encodeURIComponent(entry.slug)}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ExternalLink className="h-4 w-4" /> Open post
                        </a>
                      ) : null}
                      <details className="group relative">
                        <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 marker:content-none hover:bg-zinc-900">
                          {visibility === "unlisted" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Globe2 className="h-4 w-4" />
                          )}
                          Visibility
                          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                        </summary>
                        <div className="mt-2 grid gap-1 rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-xl">
                          {(
                            [
                              ["published", "Published", "Shown in the blog"],
                              ["unlisted", "Unlisted", "Only via direct link"],
                              ["draft", "Draft", "Hidden from visitors"],
                            ] as const
                          ).map(([value, label, help]) => (
                            <button
                              className="rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800"
                              key={value}
                              onClick={() => onSetVisibility(entry.id, value)}
                              type="button"
                            >
                              <span className="block font-medium">{label}</span>
                              <span className="block text-xs text-zinc-500">
                                {help}
                              </span>
                            </button>
                          ))}
                        </div>
                      </details>
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
