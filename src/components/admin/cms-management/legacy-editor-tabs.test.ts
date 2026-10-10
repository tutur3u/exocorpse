import { describe, expect, test } from "bun:test";
import type { ExocorpseCmsCollection } from "@/types/exocorpse-cms";
import {
  legacyEditorTabs,
  splitCharacterEditorFields,
} from "./legacy-editor-tabs";

const collection = (slug: string): ExocorpseCmsCollection => ({
  collection_type: "content",
  id: `${slug}-id`,
  slug,
  title: slug,
});

const fields = { basic: [], details: [], publishing: [], visuals: [] };

describe("legacy CMS editor navigation", () => {
  test("restores the story editor's historical tab labels", () => {
    const tabs = legacyEditorTabs({
      assetCount: 1,
      blockCount: 2,
      collection: collection("stories"),
      connectionCount: 0,
      fields,
      hasAssets: true,
      hasBlocks: true,
      hasConnections: false,
    });

    expect(tabs.map((tab) => tab.label)).toEqual([
      "Basic Info",
      "Theme & Style",
      "Content",
      "Publishing",
    ]);
  });

  test("exposes character artwork separately from visual settings and outfits", () => {
    const tabs = legacyEditorTabs({
      assetCount: 2,
      blockCount: 1,
      collection: collection("characters"),
      connectionCount: 3,
      fields,
      hasAssets: true,
      hasBlocks: true,
      hasConnections: true,
    });

    expect(tabs.map((tab) => tab.label)).toEqual([
      "Basic Info",
      "Physical",
      "Personality",
      "History & Lore",
      "Abilities",
      "Visuals",
      "Gallery",
      "Outfits",
    ]);
  });

  test("keeps gallery and outfit panels distinct when creating a character", () => {
    const tabs = legacyEditorTabs({
      assetCount: 0,
      blockCount: 0,
      collection: collection("characters"),
      connectionCount: 0,
      fields,
      hasAssets: false,
      hasBlocks: false,
      hasConnections: false,
    });
    expect(tabs.find((tab) => tab.label === "Gallery")?.id).toBe("gallery");
    expect(tabs.find((tab) => tab.label === "Outfits")?.id).toBe("outfits");
    expect(new Set(tabs.map((tab) => tab.id)).size).toBe(tabs.length);
  });

  test("gives long character writing fields their historical sections", () => {
    const definitions = [
      "abilities",
      "distinguishingFeatures",
      "fanworkPolicy",
      "nickname",
      "personalitySummary",
      "quote",
    ].map((key, sort_order) => ({
      collection_id: "characters-id",
      default_value: null,
      description: null,
      field_scope: "profile_data" as const,
      field_type: "string" as const,
      id: `${key}-id`,
      is_enabled: true,
      is_required: false,
      key,
      label: key,
      options: [],
      sort_order,
      source: "test",
    }));

    const grouped = splitCharacterEditorFields(definitions);
    expect(grouped.abilities.map((field) => field.key)).toEqual(["abilities"]);
    expect(grouped.physical.map((field) => field.key)).toEqual([
      "distinguishingFeatures",
    ]);
    expect(grouped.personality.map((field) => field.key)).toEqual([
      "personalitySummary",
    ]);
    expect(grouped.fanwork.map((field) => field.key)).toEqual([
      "fanworkPolicy",
    ]);
    expect(grouped.basic.map((field) => field.key)).toEqual([
      "nickname",
      "quote",
    ]);
  });

  test("keeps each wiki editor's distinct legacy sections", () => {
    const expected = {
      worlds: ["Basic Info", "Visuals", "Content"],
      factions: ["Basic Info", "Characteristics", "Visuals", "Content"],
      locations: ["Basic Info", "Content", "Images", "Gallery"],
    };
    for (const [slug, labels] of Object.entries(expected)) {
      expect(
        legacyEditorTabs({
          assetCount: 1,
          blockCount: 0,
          collection: collection(slug),
          connectionCount: 0,
          fields,
          hasAssets: true,
          hasBlocks: true,
          hasConnections: false,
        }).map((tab) => tab.label),
      ).toEqual(labels);
    }
  });

  test("keeps the single-page artwork form without extra tabs", () => {
    const tabs = legacyEditorTabs({
      assetCount: 1,
      blockCount: 0,
      collection: collection("portfolio-art"),
      connectionCount: 0,
      fields,
      hasAssets: true,
      hasBlocks: false,
      hasConnections: false,
    });

    expect(tabs).toEqual([]);
  });

  test("keeps the gallery form on one page", () => {
    const tabs = legacyEditorTabs({
      assetCount: 1,
      blockCount: 0,
      collection: collection("character-gallery"),
      connectionCount: 2,
      fields,
      hasAssets: true,
      hasBlocks: true,
      hasConnections: true,
    });

    expect(tabs).toEqual([]);
  });
});
