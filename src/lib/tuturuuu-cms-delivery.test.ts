import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

describe("Tuturuuu CMS raw delivery", () => {
  test("normalizes blocks, UUID relations, and versioned asset URLs", async () => {
    const { normalizeDeliveryCollections } =
      await import("@/lib/tuturuuu-cms-delivery");
    const result = normalizeDeliveryCollections(
      [
        {
          collection_type: "characters",
          description: null,
          entries: [
            {
              assets: [
                {
                  alt_text: "Portrait",
                  asset_type: "image",
                  assetUrl:
                    "/api/v1/workspaces/workspace/external-projects/assets/asset?v=revision",
                  id: "asset",
                  metadata: {},
                  sort_order: 0,
                },
                {
                  alt_text: "Inline",
                  asset_type: "inline-image",
                  assetUrl:
                    "/api/v1/workspaces/workspace/external-projects/assets/inline?v=revision-2",
                  id: "inline",
                  metadata: {
                    legacyMarkdownSource: "blog/example.png",
                  },
                  sort_order: 1,
                },
              ],
              blocks: [
                {
                  block_type: "markdown",
                  content: {
                    markdown: "Loaded biography\n\n![Inline](blog/example.png)",
                  },
                  sort_order: 0,
                  title: null,
                },
              ],
              id: "entry",
              metadata: {},
              profile_data: {},
              published_at: "2026-07-17T00:00:00.000Z",
              relations: [
                {
                  definitionId: "definition",
                  id: "relation",
                  key: "character-world-world",
                  metadata: {},
                  to_entry_id: "target",
                },
              ],
              slug: "example",
              stable_source_id: "exocorpse:character:legacy",
              status: "published",
              subtitle: null,
              summary: null,
              title: "Example",
            },
          ],
          id: "collection",
          slug: "characters",
          title: "Characters",
        },
      ],
      "https://tuturuuu.com/api/v1",
    );

    const entry = result.collections.characters?.entries[0];
    expect(entry?.bodyMarkdown).toBe(
      "Loaded biography\n\n![Inline](https://tuturuuu.com/api/v1/workspaces/workspace/external-projects/assets/inline?v=revision-2)",
    );
    expect(entry?.assets[0]?.assetUrl).toBe(
      "https://tuturuuu.com/api/v1/workspaces/workspace/external-projects/assets/asset?v=revision",
    );
    expect(entry?.relations[0]).toEqual({
      definitionId: "definition",
      id: "relation",
      key: "character-world-world",
      metadata: {},
      targetEntryId: "target",
    });
  });
});
