"use client";

import type { CmsRelationSelections } from "@/components/admin/cms-management/editor-types";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import { Check, ChevronDown, Link2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type RelationControlProps = {
  definition: ExocorpseCmsRelationDefinition;
  onChange: (entryIds: string[]) => void;
  options: ExocorpseCmsEntry[];
  studio: ExocorpseCmsStudio;
  value: string[];
};

function RelationControl({
  definition,
  onChange,
  options,
  studio,
  value,
}: RelationControlProps) {
  const [query, setQuery] = useState("");
  const selected = new Set(value);
  const collectionById = new Map(
    studio.collections.map((collection) => [collection.id, collection.title]),
  );
  const filtered = options.filter((entry) => {
    const normalized = query.trim().toLowerCase();
    return (
      !normalized ||
      entry.title.toLowerCase().includes(normalized) ||
      entry.slug.toLowerCase().includes(normalized)
    );
  });

  return (
    <details className="group overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/50">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 marker:content-none">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {definition.label}
            {definition.is_required ? (
              <span className="text-rose-500"> *</span>
            ) : null}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {definition.cardinality === "many"
              ? "Choose any that belong together"
              : "Choose the best match"}
          </p>
        </div>
        {value.length ? (
          <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
            {value.length} selected
          </span>
        ) : null}
        <ChevronDown className="h-4 w-4 text-zinc-400 transition group-open:rotate-180" />
      </summary>

      <div className="space-y-2 border-t border-zinc-200/80 p-3 dark:border-zinc-800">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-3 pl-8 text-xs outline-none focus:border-cyan-500 dark:border-zinc-700 dark:bg-zinc-900"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${definition.label.toLowerCase()}…`}
            value={query}
          />
        </label>

        <div className="max-h-44 space-y-1 overflow-y-auto">
          {filtered.map((entry) => {
            const active = selected.has(entry.id);
            return (
              <button
                className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                  active
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-900 dark:text-cyan-100"
                    : "border-transparent hover:border-zinc-300 hover:bg-white dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                }`}
                key={entry.id}
                onClick={() => {
                  if (definition.cardinality === "one") {
                    onChange(active ? [] : [entry.id]);
                    return;
                  }
                  onChange(
                    active
                      ? value.filter((entryId) => entryId !== entry.id)
                      : [...value, entry.id],
                  );
                }}
                type="button"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    active
                      ? "border-cyan-600 bg-cyan-600 text-white"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {active ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {entry.title}
                  </span>
                  <span className="block truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                    {collectionById.get(entry.collection_id)}
                  </span>
                </span>
                {active ? <X className="h-3.5 w-3.5 opacity-60" /> : null}
              </button>
            );
          })}
          {filtered.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-zinc-500">
              No matching items.
            </p>
          ) : null}
        </div>
      </div>
    </details>
  );
}

export default function CmsRelationEditor({
  definitions,
  entryId,
  onChange,
  selections,
  studio,
}: {
  definitions: ExocorpseCmsRelationDefinition[];
  entryId: string;
  onChange: (selections: CmsRelationSelections) => void;
  selections: CmsRelationSelections;
  studio: ExocorpseCmsStudio;
}) {
  const options = useMemo(
    () =>
      Object.fromEntries(
        definitions.map((definition) => {
          const targetIds = new Set(
            (studio.relationDefinitionTargets ?? [])
              .filter(
                (target) => target.relation_definition_id === definition.id,
              )
              .map((target) => target.target_collection_id),
          );
          return [
            definition.id,
            studio.entries.filter(
              (entry) =>
                targetIds.has(entry.collection_id) && entry.id !== entryId,
            ),
          ];
        }),
      ),
    [definitions, entryId, studio],
  );

  if (!definitions.length) return null;

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
          <Link2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          Connections
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Help visitors discover related people, places, stories, and work.
        </p>
      </div>
      <div className="grid gap-3 @3xl:grid-cols-2">
        {definitions.map((definition) => (
          <RelationControl
            definition={definition}
            key={definition.id}
            onChange={(entryIds) =>
              onChange({ ...selections, [definition.id]: entryIds })
            }
            options={options[definition.id] ?? []}
            studio={studio}
            value={selections[definition.id] ?? []}
          />
        ))}
      </div>
    </section>
  );
}
