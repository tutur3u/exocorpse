import { describe, expect, test } from "bun:test";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsRelationDefinition,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import type { CmsRelationSelections } from "./editor-types";
import {
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
    expect(isConnectionDraftReady(definitions, selections)).toBe(true);
    expect(
      isConnectionDraftReady(definitions, {
        ...selections,
        "definition-2": [],
      }),
    ).toBe(false);
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
