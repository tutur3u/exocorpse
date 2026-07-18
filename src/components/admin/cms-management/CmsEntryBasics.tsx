"use client";

import type { CmsEntryDraft } from "@/components/admin/cms-management/editor-types";
import { CalendarClock, FileKey2 } from "lucide-react";

const inputClassName =
  "w-full rounded-xl border border-zinc-300/80 bg-white/90 px-3 py-2.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100";

export default function CmsEntryBasics({
  draft,
  onChange,
  onTitleChange,
}: {
  draft: CmsEntryDraft;
  onChange: (draft: CmsEntryDraft) => void;
  onTitleChange: (title: string) => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
          <FileKey2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          Record identity
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Stable title, URL key, ordering, and delivery state.
        </p>
      </div>

      <div className="grid gap-4 @2xl:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            Title <span className="text-rose-500">*</span>
          </span>
          <input
            className={inputClassName}
            maxLength={160}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Record title"
            value={draft.title}
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            Slug <span className="text-rose-500">*</span>
          </span>
          <div className="flex items-center rounded-xl border border-zinc-300/80 bg-white/90 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/15 dark:border-zinc-700 dark:bg-zinc-950/80">
            <span className="pl-3 font-mono text-xs text-zinc-400">/</span>
            <input
              className="min-w-0 flex-1 bg-transparent px-1 py-2.5 font-mono text-sm outline-none"
              maxLength={120}
              onChange={(event) =>
                onChange({ ...draft, slug: event.target.value })
              }
              placeholder="record-slug"
              value={draft.slug}
            />
          </div>
        </label>
      </div>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">
          Subtitle
        </span>
        <input
          className={inputClassName}
          maxLength={200}
          onChange={(event) =>
            onChange({ ...draft, subtitle: event.target.value || null })
          }
          placeholder="Optional supporting line"
          value={draft.subtitle ?? ""}
        />
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">
          Summary
        </span>
        <textarea
          className={`${inputClassName} min-h-24 leading-6`}
          maxLength={1000}
          onChange={(event) =>
            onChange({ ...draft, summary: event.target.value || null })
          }
          placeholder="Short public description"
          value={draft.summary ?? ""}
        />
        <span className="block text-right text-[10px] text-zinc-400">
          {(draft.summary ?? "").length}/1000
        </span>
      </label>

      <div className="grid gap-4 @2xl:grid-cols-3">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            Delivery state
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
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            Sort order
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
        </label>
        {draft.status === "scheduled" ? (
          <label className="space-y-1.5 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
              <CalendarClock className="h-3.5 w-3.5" />
              Publish at
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
  );
}
