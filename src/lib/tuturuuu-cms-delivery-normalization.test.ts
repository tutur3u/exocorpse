import { describe, expect, test } from "bun:test";
import { restoreLoadingEntryStableSourceIds } from "./tuturuuu-cms-delivery-normalization";

describe("Tuturuuu CMS delivery normalization", () => {
  test("restores legacy relationship identifiers from delivery collections", () => {
    const loadingData = {
      adapter: "exocorpse" as const,
      collections: {
        stories: {
          entries: [
            {
              entryId: "cms-story-id",
              slug: "exocorpse",
            },
          ],
        },
        worlds: {
          entries: [
            {
              entryId: "cms-world-id",
              metadata: { storyId: "legacy-story-id" },
              slug: "present-day",
            },
          ],
        },
      },
    };

    const normalized = restoreLoadingEntryStableSourceIds(loadingData, [
      {
        entries: [
          {
            id: "cms-story-id",
            stable_source_id: "exocorpse:story:legacy-story-id",
          },
          {
            id: "cms-world-id",
            stable_source_id: "exocorpse:world:legacy-world-id",
          },
        ],
      },
    ]);

    expect(normalized.collections.stories.entries[0]).toMatchObject({
      stableSourceId: "exocorpse:story:legacy-story-id",
    });
    expect(normalized.collections.worlds.entries[0]).toMatchObject({
      stableSourceId: "exocorpse:world:legacy-world-id",
    });
    expect(normalized.collections.worlds.entries[0]?.metadata.storyId).toBe(
      "legacy-story-id",
    );
  });

  test("preserves loading-data identifiers and nulls unknown entries", () => {
    const normalized = restoreLoadingEntryStableSourceIds(
      {
        collections: {
          stories: {
            entries: [
              {
                entryId: "existing",
                stableSourceId: "exocorpse:story:existing",
              },
              { entryId: "unknown" },
            ],
          },
        },
      },
      [
        {
          entries: [
            {
              id: "existing",
              stable_source_id: "exocorpse:story:replacement",
            },
          ],
        },
      ],
    );

    expect(normalized.collections.stories.entries).toEqual([
      {
        entryId: "existing",
        stableSourceId: "exocorpse:story:existing",
      },
      { entryId: "unknown", stableSourceId: null },
    ]);
  });
});
