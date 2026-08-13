import { describe, expect, test } from "bun:test";
import { EXOCORPSE_CMS_SCHEMA } from "../../scripts/exocorpse-cms-schema";
import {
  ADMIN_CMS_SECTIONS,
  LEGACY_ADMIN_SECTION_KEYS,
} from "./admin-cms-sections";

describe("branded CMS admin sections", () => {
  test("restores every retained legacy management destination", () => {
    expect(LEGACY_ADMIN_SECTION_KEYS).toEqual([
      "stories",
      "worlds",
      "characters",
      "factions",
      "locations",
      "about",
      "portfolio",
      "blog-posts",
      "services",
      "addons",
    ]);
    expect(LEGACY_ADMIN_SECTION_KEYS).not.toContain("cofi");
  });

  test("only exposes canonical Tuturuuu CMS collections", () => {
    const collectionSlugs = new Set(
      EXOCORPSE_CMS_SCHEMA.collections.map((collection) => collection.slug),
    );
    for (const section of Object.values(ADMIN_CMS_SECTIONS)) {
      for (const slug of section.collectionSlugs) {
        expect(collectionSlugs.has(slug)).toBe(true);
      }
      if (section.defaultCollectionSlug) {
        expect(section.collectionSlugs).toContain(
          section.defaultCollectionSlug,
        );
      }
      for (const slug of section.primaryCollectionSlugs ?? []) {
        expect(section.collectionSlugs).toContain(slug);
      }
      if (section.defaultCollectionSlug && section.primaryCollectionSlugs) {
        expect(section.primaryCollectionSlugs).toContain(
          section.defaultCollectionSlug,
        );
      }
    }
  });

  test("keeps wiki pages focused on their familiar primary records", () => {
    expect(ADMIN_CMS_SECTIONS.stories.primaryCollectionSlugs).toEqual([
      "stories",
    ]);
    expect(ADMIN_CMS_SECTIONS.worlds.primaryCollectionSlugs).toEqual([
      "worlds",
    ]);
    expect(ADMIN_CMS_SECTIONS.characters.primaryCollectionSlugs).toEqual([
      "characters",
    ]);
    expect(ADMIN_CMS_SECTIONS.factions.primaryCollectionSlugs).toEqual([
      "factions",
    ]);
    expect(ADMIN_CMS_SECTIONS.locations.primaryCollectionSlugs).toEqual([
      "locations",
    ]);
  });
});
