"use client";

import type { CmsEntryDraft } from "@/components/admin/cms-management/editor-types";
import {
  CalendarClock,
  ChevronDown,
  Eye,
  Link,
  SlidersHorizontal,
} from "lucide-react";

const inputClassName =
  "w-full rounded-xl border border-zinc-300/80 bg-white/90 px-3 py-2.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100";

const visibilityHelp: Record<CmsEntryDraft["status"], string> = {
  archived: "Hidden from visitors and kept in your library.",
  draft: "Only visible while you are editing.",
  published: "Visible to everyone on the public site.",
  scheduled: "Will become visible at the date and time you choose.",
};

export default function CmsPublishingSettings({
  draft,
  onChange,
}: {
  draft: CmsEntryDraft;
  onChange: (draft: CmsEntryDraft) => void;
}) {
  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
            <Eye className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            Visibility
          </h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            Choose when this item appears on the public site.
          </p>
        </div>
        <div className="grid gap-4 @2xl:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              Who can see it?
            </span>
            <select
              className={inputClassName}
              onChange={(event) =>
                onChange({
                  ...draft,
                  status: event.target.value as CmsEntryDraft["status"],
                })
              }
              value={draft.status}
            >
              <option value="draft">Keep as draft</option>
              <option value="published">Publish now</option>
              <option value="scheduled">Schedule for later</option>
              <option value="archived">Archive</option>
            </select>
            <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {visibilityHelp[draft.status]}
            </span>
          </label>
          {draft.status === "scheduled" ? (
            <label className="space-y-1.5 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                <CalendarClock className="h-3.5 w-3.5" />
                Publish date and time
              </span>
              <input
                className={inputClassName}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    scheduled_for: event.target.value
                      ? new Date(event.target.value).toISOString()
                      : null,
                  })
                }
                type="datetime-local"
                value={draft.scheduled_for?.slice(0, 16) ?? ""}
              />
            </label>
          ) : null}
        </div>
      </section>

      <details className="group rounded-2xl border border-zinc-200/80 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/40">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 marker:content-none">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Page options
            </span>
            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
              Address and display order
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-zinc-400 transition group-open:rotate-180" />
        </summary>
        <div className="grid gap-4 border-t border-zinc-200/80 p-4 @2xl:grid-cols-2 dark:border-zinc-800">
          <label className="space-y-1.5 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
              <Link className="h-3.5 w-3.5" />
              Page address <span className="text-rose-500">*</span>
            </span>
            <div className="flex items-center rounded-xl border border-zinc-300/80 bg-white/90 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/15 dark:border-zinc-700 dark:bg-zinc-950/80">
              <span className="pl-3 font-mono text-xs text-zinc-400">/</span>
              <input
                className="min-w-0 flex-1 bg-transparent px-1 py-2.5 font-mono text-sm outline-none"
                maxLength={120}
                onChange={(event) =>
                  onChange({ ...draft, slug: event.target.value })
                }
                placeholder="page-address"
                value={draft.slug}
              />
            </div>
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              Display order
            </span>
            <input
              className={inputClassName}
              onChange={(event) =>
                onChange({
                  ...draft,
                  sort_order: Number(event.target.value) || 0,
                })
              }
              type="number"
              value={draft.sort_order}
            />
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              Lower numbers appear first.
            </span>
          </label>
        </div>
      </details>
    </div>
  );
}
