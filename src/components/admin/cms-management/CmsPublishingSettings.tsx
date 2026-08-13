"use client";

import type { CmsEntryDraft } from "@/components/admin/cms-management/editor-types";
import {
  CalendarClock,
  ChevronDown,
  Eye,
  Link,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@tuturuuu/ui/input";

const inputClassName =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

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
      <section className="space-y-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
              <Input
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

      <details className="group rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 marker:content-none">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Page options
            </span>
            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
              Address and publishing details
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
            <div className="flex items-center rounded border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-700">
              <span className="pl-3 font-mono text-xs text-zinc-400">/</span>
              <Input
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
        </div>
      </details>
    </div>
  );
}
