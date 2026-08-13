import { describe, expect, test } from "bun:test";
import type { ExocorpseCmsCollection } from "@/types/exocorpse-cms";
import { legacyEditorTabs } from "./legacy-editor-tabs";

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

  test("keeps character relationships separate from media and content", () => {
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
      "Media",
      "Content",
      "Relationships",
      "Publishing",
    ]);
  });

  test("uses the old visual label for world, faction, and location editors", () => {
    for (const slug of ["worlds", "factions", "locations"]) {
      const tabs = legacyEditorTabs({
        assetCount: 1,
        blockCount: 0,
        collection: collection(slug),
        connectionCount: 0,
        fields,
        hasAssets: true,
        hasBlocks: false,
        hasConnections: false,
      });
      expect(tabs.map((tab) => tab.label)).toEqual([
        "Basic Info",
        "Visuals",
        "Publishing",
      ]);
    }
  });
});
