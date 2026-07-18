"use client";

import type { CmsEntryDraft } from "@/components/admin/cms-management/editor-types";
import { PenLine } from "lucide-react";

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
          <PenLine className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          Page details
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Give visitors a clear title and a helpful introduction.
        </p>
      </div>

      <div className="grid gap-4 @2xl:grid-cols-2">
        <label className="space-y-1.5 text-sm @2xl:col-span-2">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            Title <span className="text-rose-500">*</span>
          </span>
          <input
            className={inputClassName}
            maxLength={160}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Add a clear, memorable title"
            value={draft.title}
          />
        </label>
        <label className="space-y-1.5 text-sm @2xl:col-span-2">
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
      </div>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-zinc-800 dark:text-zinc-200">
          Short description
        </span>
        <textarea
          className={`${inputClassName} min-h-24 leading-6`}
          maxLength={1000}
          onChange={(event) =>
            onChange({ ...draft, summary: event.target.value || null })
          }
          placeholder="Help visitors understand what this is at a glance"
          value={draft.summary ?? ""}
        />
        <span className="block text-right text-[10px] text-zinc-400">
          {(draft.summary ?? "").length}/1000
        </span>
      </label>
    </section>
  );
}
