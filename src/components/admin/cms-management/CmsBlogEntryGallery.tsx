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
      <nav
        aria-label="Filter blog posts"
        className="flex gap-1 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-1"
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
                  ? "bg-red-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
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

      <details className="group rounded-xl border border-zinc-800 bg-zinc-950/95">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 marker:content-none">
          <Search className="h-4 w-4 text-zinc-500" />
          <span className="flex-1">Search and filters</span>
          <ChevronDown className="h-4 w-4 text-zinc-500 transition group-open:rotate-180" />
        </summary>
        <div className="border-t border-zinc-800 p-4">
          <label>
            <span className="sr-only">Search posts</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-11 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-red-500"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Title or excerpt"
                type="search"
                value={query}
              />
            </span>
          </label>
        </div>
      </details>

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
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500"
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
