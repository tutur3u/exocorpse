"use client";

import CmsFieldEditor from "@/components/admin/cms-management/CmsFieldEditor";
import { isJsonRecord } from "@/components/admin/cms-management/editor-utils";
import type { CmsEntryDraft } from "@/components/admin/cms-management/editor-types";
import type {
  ExocorpseCmsFieldDefinition,
  ExocorpseJson,
} from "@/types/exocorpse-cms";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export default function CmsStructuredFields({
  definitions,
  draft,
  onChange,
  onImageUpload,
  title = "Details",
}: {
  definitions: ExocorpseCmsFieldDefinition[];
  draft: CmsEntryDraft;
  onChange: (draft: CmsEntryDraft) => void;
  onImageUpload?: (file: File) => Promise<string>;
  title?: string;
}) {
  if (!definitions.length) return null;
  const standardDefinitions = definitions.filter(
    (definition) => definition.field_type !== "json",
  );
  const advancedDefinitions = definitions.filter(
    (definition) => definition.field_type === "json",
  );
  const isWide = (definition: ExocorpseCmsFieldDefinition) =>
    ["json", "markdown", "string-array"].includes(definition.field_type) ||
    Boolean(definition.description);

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
    <section className="space-y-4 border-t border-gray-200 pt-5 dark:border-gray-700">
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
          <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          {title}
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Add the information visitors need for this item.
        </p>
      </div>
      <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {standardDefinitions.map((definition) => {
          const scopeValue = draft[definition.field_scope];
          const record = isJsonRecord(scopeValue) ? scopeValue : {};
          return (
            <div
              className={
                isWide(definition)
                  ? "@2xl:col-span-2 @5xl:col-span-3"
                  : "min-w-0"
              }
              key={`${draft.id || "new"}:${definition.id}`}
            >
              <CmsFieldEditor
                definition={definition}
                onChange={(value) => update(definition, value)}
                onImageUpload={onImageUpload}
                value={record[definition.key]}
              />
            </div>
          );
        })}
      </div>
      {advancedDefinitions.length ? (
        <details className="group overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 marker:content-none">
            <span className="min-w-0 flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              More options
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Optional
            </span>
            <ChevronDown className="h-4 w-4 text-zinc-400 transition group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 border-t border-zinc-200/80 p-3 dark:border-zinc-800">
            {advancedDefinitions.map((definition) => {
              const scopeValue = draft[definition.field_scope];
              const record = isJsonRecord(scopeValue) ? scopeValue : {};
              return (
                <CmsFieldEditor
                  definition={definition}
                  key={`${draft.id || "new"}:${definition.id}`}
                  onChange={(value) => update(definition, value)}
                  onImageUpload={onImageUpload}
                  value={record[definition.key]}
                />
              );
            })}
          </div>
        </details>
      ) : null}
    </section>
  );
}
