import { describe, expect, test } from "bun:test";
import { transformExocorpseCutoverExport } from "./exocorpse-cutover-transform";

const entry = (
  collectionSlug: string,
  id: string,
  metadata: Record<string, unknown> = {},
) => ({
  collectionSlug,
  metadata: { sourceId: id, ...metadata },
  profileData: {},
  slug: id,
  stableSourceId: `exocorpse:${collectionSlug}:${id}`,
  status: "published" as const,
  title: id,
});

describe("Exocorpse cutover export transformation", () => {
  test("retires COFI and collapses joins into native relations", () => {
    const transformed = transformExocorpseCutoverExport({
      manifest: {
        content: {
          entries: [
            entry("stories", "story-1"),
            entry("worlds", "world-1", { storyId: "story-1" }),
            entry("characters", "character-1"),
            entry("character-worlds", "link-1", {
              characterId: "character-1",
              worldId: "world-1",
            }),
            entry("commission-blacklist", "blocked-1"),
            {
              ...entry("cofi-samples", "cofi-1"),
              assets: [
                {
                  assetType: "image",
                  sourceUrl: "https://exocorpse.net/cofi.png",
                },
              ],
            },
          ],
        },
      },
    });

    expect(transformed.entries).toHaveLength(4);
    expect(
      transformed.entries.find((item) => item.entry.collectionSlug === "worlds")
        ?.relations,
    ).toEqual([
      {
        definitionKey: "story",
        metadata: undefined,
        targetStableSourceId: "exocorpse:stories:story-1",
      },
    ]);
    expect(
      transformed.entries.find(
        (item) => item.entry.collectionSlug === "characters",
      )?.relations,
    ).toEqual([
      {
        definitionKey: "worlds",
        metadata: undefined,
        targetStableSourceId: "exocorpse:worlds:world-1",
      },
    ]);
    expect(transformed.expected).toMatchObject({
      assets: 0,
      blacklist: 1,
      entries: 4,
      orphanedPureRelations: 0,
      relations: 2,
      retiredEntries: 2,
    });
  });

  test("reports orphaned pure joins without weakening retained relations", () => {
    const transformed = transformExocorpseCutoverExport({
      manifest: {
        content: {
          entries: [
            entry("tags", "tag-1"),
            entry("entity-tags", "orphan-1", {
              entityId: "deleted-character",
              entityType: "character",
              tagId: "tag-1",
            }),
          ],
        },
      },
    });

    expect(transformed.entries).toHaveLength(1);
    expect(transformed.expected.orphanedPureRelations).toBe(1);
    expect(transformed.expected.relations).toBe(0);
  });

  test("fills blacklist reasoning and classifies managed media", () => {
    const transformed = transformExocorpseCutoverExport({
      manifest: {
        content: {
          entries: [
            {
              ...entry("commission-blacklist", "blocked-1"),
              assets: [
                {
                  assetType: "image",
                  sourceUrl: "https://exocorpse.net/image.png",
                },
                {
                  assetType: "image",
                  sourceUrl: "https://img.itch.zone/external.png",
                },
              ],
              profileData: {
                timestamp: "2026-01-01T00:00:00Z",
                username: "blocked",
              },
              summary: "Reason",
            },
          ],
        },
      },
    });
    const [blacklist] = transformed.entries;

    expect(blacklist?.entry.profileData.reasoning).toBe("Reason");
    expect(blacklist?.assets.map((asset) => asset.managed)).toEqual([
      true,
      false,
    ]);
  });

  test("assigns deterministic unique block ordering", () => {
    const transformed = transformExocorpseCutoverExport({
      manifest: {
        content: {
          entries: [
            {
              ...entry("characters", "character-1"),
              blocks: [
                {
                  blockType: "markdown",
                  content: { markdown: "Backstory" },
                },
                {
                  blockType: "markdown",
                  content: { markdown: "Lore" },
                  sortOrder: 0,
                },
              ],
            },
          ],
        },
      },
    });

    expect(
      transformed.entries[0]?.blocks.map((block) => block.sortOrder),
    ).toEqual([0, 1]);
  });

  test("registers retained Markdown images as managed CMS assets", () => {
    const transformed = transformExocorpseCutoverExport({
      manifest: {
        content: {
          entries: [
            {
              ...entry("blog-posts", "post-1"),
              blocks: [
                {
                  blockType: "markdown",
                  content: {
                    markdown:
                      "Before\n\n![Evidence](blog/post-1/content/image.png)\n\nAfter",
                  },
                },
              ],
            },
          ],
        },
      },
    });

    expect(transformed.expected.assets).toBe(1);
    expect(transformed.entries[0]?.assets).toEqual([
      {
        altText: "Evidence",
        assetType: "inline-image",
        managed: true,
        metadata: {
          legacyMarkdownSource: "blog/post-1/content/image.png",
          legacyStableSourceId: "exocorpse:blog-posts:post-1:inline-image:0",
          legacyStoragePath: "blog/post-1/content/image.png",
          sourceStoragePath: "blog/post-1/content/image.png",
        },
        sortOrder: 0,
        sourceUrl:
          "https://exocorpse.net/api/storage/legacy-asset?path=blog%2Fpost-1%2Fcontent%2Fimage.png",
      },
    ]);
  });

  test("omits the three approved unrecoverable legacy assets", () => {
    const transformed = transformExocorpseCutoverExport({
      manifest: {
        content: {
          entries: [
            {
              ...entry("factions", "5f685a3e-224f-496f-b83e-3d8bbae47efa"),
              assets: [
                {
                  assetType: "image",
                  sourceUrl: "https://exocorpse.net/assets/neuro-logo.png",
                  stableSourceId:
                    "exocorpse:faction:5f685a3e-224f-496f-b83e-3d8bbae47efa:logo",
                },
              ],
            },
            {
              ...entry("factions", "7dcee38e-5d0c-4c2d-ac8a-afb431957723"),
              assets: [
                {
                  assetType: "image",
                  sourceUrl: "https://exocorpse.net/assets/pulse-logo.png",
                  stableSourceId:
                    "exocorpse:faction:7dcee38e-5d0c-4c2d-ac8a-afb431957723:logo",
                },
              ],
            },
            {
              ...entry(
                "character-gallery",
                "ee4c2cc2-149e-4f68-881e-a28c421d467b",
              ),
              assets: [
                {
                  assetType: "image",
                  sourceUrl:
                    "https://exocorpse.net/api/storage/legacy-asset?path=smol.webp",
                  stableSourceId:
                    "exocorpse:character-gallery:ee4c2cc2-149e-4f68-881e-a28c421d467b:image",
                },
              ],
            },
          ],
        },
      },
    });

    expect(transformed.entries).toHaveLength(3);
    expect(transformed.entries.every((item) => item.assets.length === 0)).toBe(
      true,
    );
    expect(transformed.expected.assets).toBe(0);
  });

  test("fits long summaries without losing their original content", () => {
    const longSummary = `Opening ${"👨‍👩‍👧‍👦".repeat(280)}`;
    const transformed = transformExocorpseCutoverExport({
      manifest: {
        content: {
          entries: [
            {
              ...entry("stories", "story-1"),
              blocks: [
                {
                  blockType: "markdown",
                  content: { markdown: "Different long-form story content" },
                  sortOrder: 0,
                },
              ],
              summary: longSummary,
            },
          ],
        },
      },
    });
    const [story] = transformed.entries;
    const summaryGraphemes = Array.from(
      new Intl.Segmenter("en", { granularity: "grapheme" }).segment(
        story?.entry.summary ?? "",
      ),
    );

    expect(summaryGraphemes).toHaveLength(280);
    expect(story?.entry.summary?.endsWith("…")).toBe(true);
    expect(story?.blocks).toContainEqual({
      blockType: "markdown",
      content: { markdown: longSummary },
      sortOrder: 1,
      stableSourceId: "exocorpse:stories:story-1:legacy-summary",
      title: "Legacy summary",
    });
  });
});
