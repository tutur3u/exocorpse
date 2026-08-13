"use client";

import type { CmsEntryDraft } from "@/components/admin/cms-management/editor-types";
import { Input } from "@tuturuuu/ui/input";
import { Textarea } from "@tuturuuu/ui/textarea";
import { PenLine } from "lucide-react";

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
    <section className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
          <PenLine className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Basic Info
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
          <Input
            className="bg-white dark:bg-gray-800"
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
          <Input
            className="bg-white dark:bg-gray-800"
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
        <Textarea
          className="min-h-24 bg-white leading-6 dark:bg-gray-800"
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
