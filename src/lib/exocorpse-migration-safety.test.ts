import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

describe("Exocorpse migration manifest normalization", () => {
  test("assigns deterministic unique slugs within each collection", async () => {
    const { normalizeExocorpseMigrationManifest } =
      await import("./exocorpse-migration-safety");
    const manifest = {
      adapter: "exocorpse" as const,
      content: {
        entries: [
          {
            collectionSlug: "characters",
            slug: "shared-name",
            stableSourceId: "exocorpse:character:first",
            title: "First",
          },
          {
            collectionSlug: "characters",
            slug: "shared-name",
            stableSourceId: "exocorpse:character:second",
            title: "Second",
          },
          {
            collectionSlug: "worlds",
            slug: "shared-name",
            stableSourceId: "exocorpse:world:first",
            title: "World",
          },
        ],
      },
      schema: {
        collections: [
          {
            collection_type: "characters",
            slug: "characters",
            title: "Characters",
          },
          {
            collection_type: "worlds",
            slug: "worlds",
            title: "Worlds",
          },
        ],
      },
      version: 1 as const,
    };

    normalizeExocorpseMigrationManifest(manifest);
    const firstPassSlugs = manifest.content.entries.map((entry) => entry.slug);

    expect(firstPassSlugs[0]).toBe("shared-name");
    expect(firstPassSlugs[1]).toMatch(/^shared-name-[a-f0-9]{16}$/);
    expect(firstPassSlugs[2]).toBe("shared-name");
    expect(new Set(firstPassSlugs.slice(0, 2))).toHaveLength(2);

    const secondManifest = structuredClone(manifest);
    secondManifest.content.entries[1]!.slug = "shared-name";
    normalizeExocorpseMigrationManifest(secondManifest);

    expect(secondManifest.content.entries.map((entry) => entry.slug)).toEqual(
      firstPassSlugs,
    );
  });
});
