import { describe, expect, test } from "bun:test";
import { EXOCORPSE_CMS_SCHEMA } from "./exocorpse-cms-schema";

describe("canonical Exocorpse CMS schema", () => {
  test("defines every retained collection once and retires pure joins", () => {
    const slugs = EXOCORPSE_CMS_SCHEMA.collections.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).not.toContain("character-worlds");
    expect(slugs).not.toContain("commission-service-addons");
    expect(slugs).not.toContain("entity-tags");
  });

  test("requires typed blacklist fields", () => {
    const fields = EXOCORPSE_CMS_SCHEMA.fieldDefinitions.filter(
      (field) => field.collectionSlug === "commission-blacklist",
    );
    expect(fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldType: "string",
          isRequired: true,
          key: "username",
        }),
        expect.objectContaining({
          fieldType: "markdown",
          isRequired: true,
          key: "reasoning",
        }),
        expect.objectContaining({
          fieldType: "datetime",
          isRequired: true,
          key: "timestamp",
        }),
      ]),
    );
  });

  test("replaces pure joins with direct UUID relation definitions", () => {
    expect(EXOCORPSE_CMS_SCHEMA.relationDefinitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "worlds",
          sourceCollectionSlug: "characters",
          targetCollectionSlugs: ["worlds"],
        }),
        expect.objectContaining({
          key: "addons",
          sourceCollectionSlug: "commission-services",
          targetCollectionSlugs: ["commission-addons"],
        }),
      ]),
    );
  });
});
