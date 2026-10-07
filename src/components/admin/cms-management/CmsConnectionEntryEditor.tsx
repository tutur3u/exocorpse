"use client";

import AdminMarkdownEditor from "@/components/admin/AdminMarkdownEditor";
import CmsStructuredFields from "./CmsStructuredFields";
import { isJsonRecord } from "./editor-utils";
import { charactersInSameStory } from "./connection-entry-utils";
import type {
  CmsBlockDraft,
  CmsEntryDraft,
  CmsRelationSelections,
} from "./editor-types";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsFieldDefinition,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";

export default function CmsConnectionEntryEditor({
  collectionSlug,
  definitions,
  duplicate,
  draft,
  fields,
  onDraftChange,
  onRelationsChange,
  onImageUpload,
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
  onImageUpload?: (file: File) => Promise<string>;
  relationSelections: CmsRelationSelections;
  studio: ExocorpseCmsStudio;
}) {
  const relationship = collectionSlug === "character-relationships";
  const anchor = definitions.find((item) => item.key === "character-a");
  const anchorId = anchor ? relationSelections[anchor.id]?.[0] : undefined;
  const options = (definition: ExocorpseCmsRelationDefinition) => {
    const ids = new Set(
      studio.relationDefinitionTargets
        ?.filter((item) => item.relation_definition_id === definition.id)
        .map((item) => item.target_collection_id),
    );
    return studio.entries
      .filter((entry) => ids.has(entry.collection_id))
      .sort((a, b) => a.title.localeCompare(b.title));
  };
  const select = (
    key: string,
    label: string,
    candidates?: ExocorpseCmsEntry[],
  ) => {
    const definition = definitions.find((item) => item.key === key);
    if (!definition) return null;
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} *
        </span>
        <select
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
          onChange={(event) => {
            onRelationsChange({
              ...relationSelections,
              [definition.id]: event.target.value ? [event.target.value] : [],
            });
            if (key === "type") {
              const profile = isJsonRecord(draft.profile_data)
                ? draft.profile_data
                : {};
              onDraftChange({
                ...draft,
                profile_data: {
                  ...profile,
                  forwardLabel: null,
                  reverseLabel: null,
                  createReverse: false,
                },
              });
            }
          }}
          value={relationSelections[definition.id]?.[0] ?? ""}
        >
          <option value="">Select a {label.toLowerCase()}...</option>
          {(candidates ?? options(definition)).map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.title}
              {key === "type" &&
              isJsonRecord(entry.profile_data) &&
              entry.profile_data.isMutual === true
                ? " (mutual)"
                : ""}
            </option>
          ))}
        </select>
      </label>
    );
  };
  return (
    <div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/30 dark:bg-purple-900/10">
      {relationship ? (
        <>
          {anchorId ? null : select("character-a", "Character")}
          {select(
            "character-b",
            "Related character",
            charactersInSameStory(anchorId, studio).filter(
              (entry) => entry.id !== anchorId,
            ),
          )}
          {select("type", "Relationship Type")}
        </>
      ) : (
        <>
          {select("character", "Character")}
          {select("faction", "Faction")}
          <CmsStructuredFields
            compact
            definitions={fields}
            draft={draft}
            onChange={onDraftChange}
          />
        </>
      )}
      {relationship ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </p>
          <AdminMarkdownEditor
            minHeight="150px"
            rows={4}
            onChange={(value) =>
              onDraftChange({ ...draft, summary: value || null })
            }
            onImageUpload={onImageUpload}
            placeholder="Optional notes about this relationship..."
            value={draft.summary ?? ""}
          />
        </div>
      ) : null}
      {duplicate ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <h4 className="font-medium">Duplicate Relationship</h4>
          <p>
            This connection already exists. Choose a different character or
            relationship type.
          </p>
        </div>
      ) : null}
    </div>
  );
}
