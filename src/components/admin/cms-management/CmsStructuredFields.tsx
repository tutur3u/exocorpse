"use client";

import CmsFieldEditor from "@/components/admin/cms-management/CmsFieldEditor";
import { isJsonRecord } from "@/components/admin/cms-management/editor-utils";
import type { CmsEntryDraft } from "@/components/admin/cms-management/editor-types";
import type {
  ExocorpseCmsFieldDefinition,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import { SlidersHorizontal } from "lucide-react";

export default function CmsStructuredFields({
  definitions,
  draft,
  onChange,
}: {
  definitions: ExocorpseCmsFieldDefinition[];
  draft: CmsEntryDraft;
  onChange: (draft: CmsEntryDraft) => void;
}) {
  if (!definitions.length) return null;

  function update(
    definition: ExocorpseCmsFieldDefinition,
    value: ExocorpseJson | undefined,
  ) {
    const scope = definition.field_scope;
    const current = isJsonRecord(draft[scope]) ? draft[scope] : {};
    const next = { ...current };
    if (value === undefined || value === "") {
      delete next[definition.key];
    } else {
      next[definition.key] = value;
    }
    onChange({ ...draft, [scope]: next });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
          <SlidersHorizontal className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          Collection fields
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Typed by the Tuturuuu CMS schema for this collection.
        </p>
      </div>
      <div className="grid gap-4 @3xl:grid-cols-2">
        {definitions.map((definition) => {
          const scopeValue = draft[definition.field_scope];
          const record = isJsonRecord(scopeValue) ? scopeValue : {};
          return (
            <CmsFieldEditor
              definition={definition}
              key={`${draft.id || "new"}:${definition.id}`}
              onChange={(value) => update(definition, value)}
              value={record[definition.key]}
            />
          );
        })}
      </div>
    </section>
  );
}
