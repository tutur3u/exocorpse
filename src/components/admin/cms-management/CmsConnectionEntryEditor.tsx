"use client";

import CmsBlockEditor from "@/components/admin/cms-management/CmsBlockEditor";
import CmsStructuredFields from "@/components/admin/cms-management/CmsStructuredFields";
import AdminMarkdownEditor from "@/components/admin/AdminMarkdownEditor";
import type {
  CmsBlockDraft,
  CmsEntryDraft,
  CmsRelationSelections,
} from "@/components/admin/cms-management/editor-types";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsFieldDefinition,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  HeartHandshake,
  Info,
  UserRound,
} from "lucide-react";

function optionsForDefinition(
  definition: ExocorpseCmsRelationDefinition | undefined,
  studio: ExocorpseCmsStudio,
) {
  if (!definition) return [];
  const collectionIds = new Set(
    (studio.relationDefinitionTargets ?? [])
      .filter((target) => target.relation_definition_id === definition.id)
      .map((target) => target.target_collection_id),
  );
  return studio.entries
    .filter((entry) => collectionIds.has(entry.collection_id))
    .sort((left, right) => left.title.localeCompare(right.title));
}

function SelectionCard({
  definition,
  description,
  icon,
  onChange,
  options,
  value,
}: {
  definition?: ExocorpseCmsRelationDefinition;
  description: string;
  icon: React.ReactNode;
  onChange: (entryIds: string[]) => void;
  options: ExocorpseCmsEntry[];
  value: string[];
}) {
  if (!definition) return null;
  return (
    <label className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-900">
      <span className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {icon}
        </span>
        {definition.label}
        {definition.is_required ? (
          <span className="text-rose-500">*</span>
        ) : null}
      </span>
      <span className="mt-2 block text-xs leading-5 text-zinc-500">
        {description}
      </span>
      <select
        className="mt-3 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        onChange={(event) =>
          onChange(event.target.value ? [event.target.value] : [])
        }
        value={value[0] ?? ""}
      >
        <option value="">Select {definition.label.toLowerCase()}…</option>
        {options.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.title}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function CmsConnectionEntryEditor({
  allowedBlockTypes,
  blocks,
  collectionSlug,
  definitions,
  duplicate,
  draft,
  fields,
  onBlocksChange,
  onDraftChange,
  onRelationsChange,
  relationSelections,
  studio,
}: {
  allowedBlockTypes: string[];
  blocks: CmsBlockDraft[];
  collectionSlug: string;
  definitions: ExocorpseCmsRelationDefinition[];
  duplicate: boolean;
  draft: CmsEntryDraft;
  fields: ExocorpseCmsFieldDefinition[];
  onBlocksChange: (blocks: CmsBlockDraft[]) => void;
  onDraftChange: (draft: CmsEntryDraft) => void;
  onRelationsChange: (selections: CmsRelationSelections) => void;
  relationSelections: CmsRelationSelections;
  studio: ExocorpseCmsStudio;
}) {
  const isRelationship = collectionSlug === "character-relationships";
  const definition = (key: string) =>
    definitions.find((item) => item.key === key);
  const setSelection = (
    target: ExocorpseCmsRelationDefinition | undefined,
    entryIds: string[],
  ) => {
    if (!target) return;
    onRelationsChange({ ...relationSelections, [target.id]: entryIds });
  };

  const selection = (
    key: string,
    description: string,
    icon: React.ReactNode,
  ) => {
    const target = definition(key);
    return (
      <SelectionCard
        definition={target}
        description={description}
        icon={icon}
        onChange={(entryIds) => setSelection(target, entryIds)}
        options={optionsForDefinition(target, studio)}
        value={target ? (relationSelections[target.id] ?? []) : []}
      />
    );
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/70 dark:border-zinc-700 dark:bg-zinc-950/40">
        <div className="border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
            {isRelationship ? (
              <HeartHandshake className="h-5 w-5 text-pink-500" />
            ) : (
              <Building2 className="h-5 w-5 text-purple-500" />
            )}
            {isRelationship ? "Who is connected?" : "Who belongs where?"}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {isRelationship
              ? "Pick both characters and describe the relationship between them."
              : "Choose a character and the faction they belong to, then add their role details."}
          </p>
        </div>
        <div
          className={`grid items-stretch gap-4 p-4 ${isRelationship ? "@3xl:grid-cols-[1fr_auto_1fr]" : "@3xl:grid-cols-[1fr_auto_1fr]"}`}
        >
          {isRelationship
            ? selection(
                "character-a",
                "The first person shown in this connection.",
                <UserRound className="h-4 w-4" />,
              )
            : selection(
                "character",
                "The character whose membership you are recording.",
                <UserRound className="h-4 w-4" />,
              )}
          <div className="flex items-center justify-center text-zinc-400">
            <ArrowRight className="h-5 w-5 rotate-90 @3xl:rotate-0" />
          </div>
          {isRelationship
            ? selection(
                "character-b",
                "The other person in this connection.",
                <UserRound className="h-4 w-4" />,
              )
            : selection(
                "faction",
                "The group, organization, or faction they joined.",
                <Building2 className="h-4 w-4" />,
              )}
        </div>
      </section>

      {isRelationship ? (
        <section className="space-y-4">
          {selection(
            "type",
            "Choose the label visitors will see for this relationship.",
            <HeartHandshake className="h-4 w-4" />,
          )}
          <div className="block space-y-2 text-sm">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Relationship summary
            </span>
            <AdminMarkdownEditor
              compact
              maxLength={1000}
              minHeight="10rem"
              onChange={(value) =>
                onDraftChange({
                  ...draft,
                  summary: value || null,
                })
              }
              placeholder="What is their dynamic? Add the useful context visitors should see…"
              value={draft.summary ?? ""}
            />
          </div>
        </section>
      ) : (
        <CmsStructuredFields
          definitions={fields}
          draft={draft}
          onChange={onDraftChange}
          title="Membership details"
        />
      )}

      {duplicate ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">This connection already exists</p>
            <p className="mt-1 text-sm leading-6 opacity-80">
              Choose a different combination instead of creating a duplicate.
            </p>
          </div>
        </div>
      ) : null}

      {allowedBlockTypes.length ? (
        <details className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 marker:content-none">
            <Info className="h-4 w-4 text-zinc-400" />
            <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Longer notes or lore
            </span>
            <span className="text-xs text-zinc-500">Optional</span>
          </summary>
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <CmsBlockEditor
              allowedBlockTypes={allowedBlockTypes}
              blocks={blocks}
              onChange={onBlocksChange}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}
