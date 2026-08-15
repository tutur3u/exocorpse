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
                {
                  block_type: "markdown",
                  content: {
                    markdown:
                      "A second section with ![Inline](blog/example.png)",
                  },
                  sort_order: 2,
                  title: "Further reading",
                },
                {
                  block_type: "markdown",
                  content: { markdown: "First by display order" },
                  sort_order: -1,
                  title: "Introduction",
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
      "## Introduction\n\nFirst by display order\n\nLoaded biography\n\n![Inline](https://tuturuuu.com/api/v1/workspaces/workspace/external-projects/assets/inline?v=revision-2)\n\n## Further reading\n\nA second section with ![Inline](https://tuturuuu.com/api/v1/workspaces/workspace/external-projects/assets/inline?v=revision-2)",
    );
    expect(entry?.blocks.map((block) => block.title)).toEqual([
      "Introduction",
      null,
      "Further reading",
    ]);
    expect(entry?.blocks[2]?.content.markdown).toContain(
      "/assets/inline?v=revision-2",
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

  test("maps every named character story section to the public character", async () => {
    const { mapCmsCharacter, normalizeDeliveryCollections } =
      await import("@/lib/tuturuuu-cms-delivery");
    const result = normalizeDeliveryCollections(
      [
        {
          collection_type: "characters",
          description: null,
          entries: [
            {
              assets: [],
              blocks: [
                {
                  block_type: "markdown",
                  content: { markdown: "Short public summary" },
                  sort_order: 0,
                  title: "Description",
                },
                {
                  block_type: "markdown",
                  content: { markdown: "Long character history" },
                  sort_order: 1,
                  title: "Backstory",
                },
                {
                  block_type: "markdown",
                  content: { markdown: "A customer-created section" },
                  sort_order: 2,
                  title: "Field Notes",
                },
              ],
              id: "character-entry",
              metadata: {},
              profile_data: {},
              published_at: "2026-08-15T00:00:00.000Z",
              relations: [],
              slug: "morris",
              stable_source_id: "exocorpse:character:morris",
              status: "published",
              subtitle: null,
              summary: "Fallback summary",
              title: "Morris",
            },
          ],
          id: "characters",
          slug: "characters",
          title: "Characters",
        },
      ],
      "https://tuturuuu.com/api/v1",
    );

    const entry = result.collections.characters?.entries[0];
    expect(entry).toBeDefined();
    const character = mapCmsCharacter(entry!);

    expect(character.description).toBe("Short public summary");
    expect(character.backstory).toBe("Long character history");
    expect(character.content_sections).toEqual([
      { content: "A customer-created section", title: "Field Notes" },
    ]);
  });
});
