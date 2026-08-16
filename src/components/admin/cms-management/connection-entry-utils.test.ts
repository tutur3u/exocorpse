import { describe, expect, test } from "bun:test";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import type { CmsRelationSelections } from "./editor-types";
import {
  charactersInSameStory,
  connectionPresentation,
  hasDuplicateConnection,
  isConnectionDraftReady,
  normalizeConnectionDraft,
} from "./connection-entry-utils";
import { entryDraft } from "./editor-utils";

function entry(
  id: string,
  title: string,
  collectionId: string,
  profileData: ExocorpseCmsEntry["profile_data"] = {},
): ExocorpseCmsEntry {
  return {
    collection_id: collectionId,
    created_at: "",
    id,
    metadata: {},
    profile_data: profileData,
    published_at: null,
    scheduled_for: null,
    slug: title.toLowerCase().replaceAll(" ", "-"),
    sort_order: 0,
    stable_source_id: null,
    status: "published",
    subtitle: null,
    summary: null,
    title,
    updated_at: "",
  };
}

const definitions: ExocorpseCmsRelationDefinition[] = [
  ["character-a", "Character A", "characters"],
  ["character-b", "Character B", "characters"],
  ["type", "Relationship type", "relationship-types"],
].map(([key, label], index) => ({
  cardinality: "one" as const,
  id: `definition-${index}`,
  is_required: true,
  key: key!,
  label: label!,
  source_collection_id: "relationships",
}));

const relationship = entry(
  "relationship",
  "Relationship 05fe72fd-6d92",
  "relationships",
);
const aphaeleon = entry("aphaeleon", "Aphaeleon", "characters");
const aurelius = entry("aurelius", "Aurelius", "characters");
const rivals = entry("rivals", "Rivals", "relationship-types");
const selections: CmsRelationSelections = {
  "definition-0": [aphaeleon.id],
  "definition-1": [aurelius.id],
  "definition-2": [rivals.id],
};
const studio: ExocorpseCmsStudio = {
  assets: [],
  blocks: [],
  collections: [],
  entries: [relationship, aphaeleon, aurelius, rivals],
  relationDefinitions: definitions,
  relations: definitions.map((definition, index) => ({
    from_entry_id: relationship.id,
    id: `relation-${index}`,
    metadata: {},
    relation_definition_id: definition.id,
    relation_type: definition.key,
    sort_order: 0,
    to_entry_id: selections[definition.id]![0]!,
  })),
};

describe("connection entry UX", () => {
  test("replaces technical relationship titles with recognizable identities", () => {
    expect(
      connectionPresentation("character-relationships", relationship, studio),
    ).toMatchObject({
      primary: "Aphaeleon & Aurelius",
      secondary: "Rivals",
      targetIds: ["aphaeleon", "aurelius"],
    });
  });

  test("generates hidden CMS identity fields from the selected people and type", () => {
    expect(
      normalizeConnectionDraft({
        collectionSlug: "character-relationships",
        definitions,
        draft: entryDraft(relationship, "relationships"),
        selections,
        studio,
      }),
    ).toMatchObject({
      slug: "aphaeleon-aurelius-rivals",
      status: "published",
      subtitle: "Rivals",
      title: "Aphaeleon & Aurelius — Rivals",
    });
  });

  test("only enables saving after all required choices are made", () => {
    expect(
      isConnectionDraftReady(
        definitions,
        {
          ...selections,
          "definition-2": [],
        },
        "character-relationships",
      ),
    ).toBe(true);
    expect(
      isConnectionDraftReady(definitions, {
        ...selections,
        "definition-1": [],
      }),
    ).toBe(false);
  });

  test("uses free relationship labels without requiring a type", () => {
    expect(
      normalizeConnectionDraft({
        collectionSlug: "character-relationships",
        definitions,
        draft: {
          ...entryDraft(relationship, "relationships"),
          profile_data: { forwardLabel: "Found family" },
        },
        selections: { ...selections, "definition-2": [] },
        studio,
      }),
    ).toMatchObject({
      slug: "aphaeleon-aurelius-found-family",
      subtitle: "Found family",
      title: "Aphaeleon & Aurelius — Found family",
    });
  });

  test("limits the second character to people in the same story", () => {
    const other = entry("other", "Other", "characters");
    const worldA = entry("world-a", "World A", "worlds");
    const worldB = entry("world-b", "World B", "worlds");
    const expandedStudio: ExocorpseCmsStudio = {
      ...studio,
      collections: [
        { id: "characters", slug: "characters" },
        { id: "worlds", slug: "worlds" },
      ] as ExocorpseCmsStudio["collections"],
      entries: [...studio.entries, other, worldA, worldB],
      relationDefinitions: [
        ...definitions,
        {
          cardinality: "many",
          id: "character-worlds",
          is_required: false,
          key: "worlds",
          label: "Worlds",
          source_collection_id: "characters",
        },
        {
          cardinality: "one",
          id: "world-story",
          is_required: true,
          key: "story",
          label: "Story",
          source_collection_id: "worlds",
        },
      ],
      relations: [
        ...(studio.relations ?? []),
        ...[
          ["aphaeleon", "world-a", "character-worlds"],
          ["aurelius", "world-a", "character-worlds"],
          ["other", "world-b", "character-worlds"],
          ["world-a", "story-a", "world-story"],
          ["world-b", "story-b", "world-story"],
        ].map(([from, to, definitionId], index) => ({
          from_entry_id: from!,
          id: `scope-${index}`,
          metadata: {},
          relation_definition_id: definitionId!,
          relation_type: "",
          sort_order: 0,
          to_entry_id: to!,
        })),
      ],
    };
    expect(
      charactersInSameStory(aphaeleon.id, expandedStudio).map(
        (item) => item.id,
      ),
    ).toEqual([aphaeleon.id, aurelius.id]);
  });

  test("prevents the same relationship from being created twice", () => {
    expect(
      hasDuplicateConnection({
        collectionId: "relationships",
        collectionSlug: "character-relationships",
        definitions,
        entryId: "new-entry",
        selections: {
          "definition-0": [aurelius.id],
          "definition-1": [aphaeleon.id],
          "definition-2": [rivals.id],
        },
        studio,
      }),
    ).toBe(true);
  });
});
