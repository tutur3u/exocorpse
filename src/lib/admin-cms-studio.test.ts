import { describe, expect, test } from "bun:test";
import type { AdminCmsSection } from "./admin-cms-sections";
import { selectAdminCmsStudio } from "./admin-cms-studio";
import type { ExocorpseCmsStudio } from "@/types/exocorpse-cms";

const section: AdminCmsSection = {
  collectionSlugs: ["stories", "tags"],
  defaultCollectionSlug: "stories",
  description: "Stories",
  eyebrow: "Stories",
  key: "stories",
  title: "Stories",
};

const studio = {
  assets: [
    { entry_id: "story", id: "story-asset" },
    { entry_id: "world", id: "world-asset" },
  ],
  blocks: [
    { entry_id: "story", id: "story-block" },
    { entry_id: "world", id: "world-block" },
  ],
  collections: [
    { id: "stories", slug: "stories" },
    { id: "tags", slug: "tags" },
    { id: "worlds", slug: "worlds" },
    { id: "characters", slug: "characters" },
  ],
  entries: [
    { collection_id: "stories", id: "story" },
    { collection_id: "tags", id: "tag" },
    { collection_id: "worlds", id: "world" },
    { collection_id: "characters", id: "character" },
  ],
  fieldDefinitions: [
    { collection_id: "stories", id: "story-field" },
    { collection_id: "worlds", id: "world-field" },
  ],
  relationDefinitions: [
    {
      id: "story-world",
      source_collection_id: "stories",
    },
    {
      id: "world-character",
      source_collection_id: "worlds",
    },
  ],
  relationDefinitionTargets: [
    {
      relation_definition_id: "story-world",
      target_collection_id: "worlds",
    },
    {
      relation_definition_id: "world-character",
      target_collection_id: "characters",
    },
  ],
  relations: [
    { from_entry_id: "story", id: "story-world-row" },
    { from_entry_id: "world", id: "world-character-row" },
  ],
} as unknown as ExocorpseCmsStudio;

describe("admin CMS studio selection", () => {
  test("keeps source content and relation targets without unrelated studio data", () => {
    const selected = selectAdminCmsStudio(studio, section);

    expect(selected.collections.map((item) => item.id)).toEqual([
      "stories",
      "tags",
      "worlds",
    ]);
    expect(selected.entries.map((item) => item.id)).toEqual([
      "story",
      "tag",
      "world",
    ]);
    expect(selected.assets.map((item) => item.id)).toEqual(["story-asset"]);
    expect(selected.blocks.map((item) => item.id)).toEqual(["story-block"]);
    expect(selected.relationDefinitions?.map((item) => item.id)).toEqual([
      "story-world",
    ]);
    expect(selected.relations?.map((item) => item.id)).toEqual([
      "story-world-row",
    ]);
  });

  test("keeps the complete studio for the all-collections CMS workspace", () => {
    expect(
      selectAdminCmsStudio(studio, { ...section, collectionSlugs: [] }),
    ).toBe(studio);
  });
});
