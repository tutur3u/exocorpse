import { describe, expect, test } from "bun:test";
import type {
  ExocorpseCmsAsset,
  ExocorpseCmsCollection,
} from "@/types/exocorpse-cms";
import {
  buildCmsEntryGalleryFilter,
  entryCardDescription,
  selectCmsEntryCardMedia,
} from "./gallery-utils";
import { collectionTabLabel } from "./collection-copy";

const collection = (slug: string): ExocorpseCmsCollection => ({
  collection_type: "content",
  id: `${slug}-id`,
  slug,
  title: slug,
});

const asset = (
  id: string,
  sortOrder: number,
  overrides: Partial<ExocorpseCmsAsset> = {},
): ExocorpseCmsAsset => ({
  alt_text: id,
  asset_type: "image",
  asset_url: `/assets/${id}.png`,
  entry_id: "entry-id",
  id,
  metadata: {},
  preview_url: null,
  sort_order: sortOrder,
  source_url: null,
  storage_path: null,
  updated_at: "2026-08-13T00:00:00.000Z",
  ...overrides,
});

const entry = (
  overrides: Partial<Parameters<typeof entryCardDescription>[0]> = {},
): Parameters<typeof entryCardDescription>[0] => ({
  collection_id: "collection-id",
  created_at: "",
  id: "entry-id",
  metadata: {},
  profile_data: {},
  published_at: null,
  scheduled_for: null,
  slug: "question",
  sort_order: 0,
  stable_source_id: null,
  status: "published",
  subtitle: null,
  summary: null,
  title: "Question?",
  updated_at: "",
  ...overrides,
});

describe("CMS entry gallery media", () => {
  test("does not invent a media preview for text-only entries", () => {
    expect(selectCmsEntryCardMedia(collection("about-faqs"), [])).toEqual({
      preview: undefined,
    });
  });

  test("uses a character banner while retaining the profile image", () => {
    const profile = asset("profile", 0);
    const banner = asset("banner", 1);

    expect(
      selectCmsEntryCardMedia(collection("characters"), [banner, profile]),
    ).toEqual({ avatar: profile, preview: banner });
  });

  test("keeps a lone character image in the profile position", () => {
    const profile = asset("profile", 0);

    expect(
      selectCmsEntryCardMedia(collection("characters"), [profile]),
    ).toEqual({ avatar: profile, preview: undefined });
  });

  test("uses the first usable image and skips files or missing sources", () => {
    const cover = asset("cover", 2);

    expect(
      selectCmsEntryCardMedia(collection("worlds"), [
        asset("document", 0, { asset_type: "file" }),
        asset("missing", 1, { asset_url: null }),
        cover,
      ]),
    ).toEqual({ preview: cover });
  });
});

describe("CMS entry card copy", () => {
  test("does not repeat a title stored as its own subtitle", () => {
    expect(
      entryCardDescription(
        entry({ subtitle: "Question?", summary: "A useful answer." }),
      ),
    ).toBe("A useful answer.");
    expect(entryCardDescription(entry({ subtitle: "question?" }))).toBe(
      undefined,
    );
  });
});

describe("legacy dashboard tab copy", () => {
  test("uses the familiar About and Portfolio labels", () => {
    expect(collectionTabLabel(collection("about"))).toBe("Profile");
    expect(collectionTabLabel(collection("about-content"))).toBe("About");
    expect(collectionTabLabel(collection("about-faqs"))).toBe("FAQ");
    expect(collectionTabLabel(collection("portfolio-art"))).toBe("Art");
    expect(collectionTabLabel(collection("portfolio-writing"))).toBe("Writing");
    expect(collectionTabLabel(collection("portfolio-games"))).toBe("Games");
  });
});

describe("CMS entry gallery relation filters", () => {
  test("recreates the familiar story filter for worlds", () => {
    const story = {
      collection_id: "stories-id",
      created_at: "",
      id: "story-id",
      metadata: {},
      profile_data: {},
      published_at: null,
      scheduled_for: null,
      slug: "story",
      sort_order: 0,
      stable_source_id: null,
      status: "published" as const,
      subtitle: null,
      summary: null,
      title: "A Story",
      updated_at: "",
    };
    const studio = {
      assets: [],
      blocks: [],
      collections: [collection("stories"), collection("worlds")],
      entries: [story],
      relationDefinitions: [
        {
          cardinality: "one" as const,
          id: "world-story",
          is_required: true,
          key: "story",
          label: "Story",
          source_collection_id: "worlds-id",
        },
      ],
      relationDefinitionTargets: [
        {
          relation_definition_id: "world-story",
          target_collection_id: "stories-id",
        },
      ],
      relations: [
        {
          from_entry_id: "world-id",
          id: "relation-id",
          metadata: {},
          relation_definition_id: "world-story",
          relation_type: "story",
          sort_order: 0,
          to_entry_id: "story-id",
        },
      ],
    };

    expect(buildCmsEntryGalleryFilter(studio, "worlds-id")).toEqual({
      entryTargetIds: { "world-id": ["story-id"] },
      label: "Story",
      options: [{ id: "story-id", title: "A Story" }],
    });
  });
});
