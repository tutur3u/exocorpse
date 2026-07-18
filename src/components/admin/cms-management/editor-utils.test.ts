import { describe, expect, test } from "bun:test";
import { buildSavePayload, slugify } from "./editor-utils";
import type { CmsEntryDraft } from "./editor-types";

const draft: CmsEntryDraft = {
  collection_id: "collection-id",
  id: "entry-id",
  metadata: { sourceId: "legacy" },
  profile_data: { featured: true },
  scheduled_for: null,
  slug: "sample-entry",
  sort_order: 3,
  status: "published",
  subtitle: "Subtitle",
  summary: "Summary",
  title: "Sample entry",
  updated_at: "2026-07-18T00:00:00.000Z",
};

describe("CMS management editor helpers", () => {
  test("builds typed blocks and UUID relations without losing provenance", () => {
    const payload = buildSavePayload({
      blocks: [
        {
          blockType: "markdown",
          contentText: "# Body",
          id: "block-id",
          key: "block-id",
          sortOrder: 0,
          stableSourceId: "legacy:block",
          title: "Body",
        },
      ],
      definitions: [
        {
          cardinality: "many",
          id: "definition-id",
          is_required: false,
          key: "tags",
          label: "Tags",
          source_collection_id: "collection-id",
        },
      ],
      draft,
      relationSelections: { "definition-id": ["tag-a", "tag-b"] },
    });

    expect(payload.entry.metadata).toEqual({ sourceId: "legacy" });
    expect(payload.blocks[0]?.content).toEqual({ markdown: "# Body" });
    expect(payload.relations).toEqual([
      { definitionId: "definition-id", sortOrder: 0, toEntryId: "tag-a" },
      { definitionId: "definition-id", sortOrder: 1, toEntryId: "tag-b" },
    ]);
  });

  test("creates stable URL slugs from display titles", () => {
    expect(slugify("Áster's World — Volume II")).toBe(
      "aster-s-world-volume-ii",
    );
  });
});
