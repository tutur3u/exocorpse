import { describe, expect, test } from "bun:test";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";
import { cmsEntryPublicPath, productionUrl } from "./cms-entry-public-url";

const entry = (
  id: string,
  collectionId: string,
  slug: string,
): ExocorpseCmsEntry => ({
  collection_id: collectionId,
  created_at: "",
  id,
  metadata: {},
  profile_data: {},
  published_at: null,
  scheduled_for: null,
  slug,
  sort_order: 0,
  stable_source_id: null,
  status: "published",
  subtitle: null,
  summary: null,
  title: slug,
  updated_at: "",
});

const story = entry("story-1", "stories", "exocorpse");
const world = entry("world-1", "worlds", "earth");
const character = entry("character-1", "characters", "morris");
const studio = {
  assets: [],
  blocks: [],
  collections: ["stories", "worlds", "characters"].map((slug) => ({
    collection_type: "content",
    id: slug,
    slug,
    title: slug,
  })),
  entries: [story, world, character],
  relationDefinitions: [
    {
      cardinality: "one",
      id: "world-story",
      is_required: true,
      key: "story",
      label: "Story",
      source_collection_id: "worlds",
    },
    {
      cardinality: "many",
      id: "character-worlds",
      is_required: false,
      key: "worlds",
      label: "Worlds",
      source_collection_id: "characters",
    },
  ],
  relations: [
    {
      from_entry_id: world.id,
      id: "relation-1",
      metadata: {},
      relation_definition_id: "world-story",
      relation_type: "story",
      sort_order: 0,
      to_entry_id: story.id,
    },
    {
      from_entry_id: character.id,
      id: "relation-2",
      metadata: {},
      relation_definition_id: "character-worlds",
      relation_type: "worlds",
      sort_order: 0,
      to_entry_id: world.id,
    },
  ],
} satisfies ExocorpseCmsStudio;

describe("CMS card live links", () => {
  test("always builds production links", () => {
    expect(productionUrl("/?blog-post=hello")).toBe(
      "https://exocorpse.net/?blog-post=hello",
    );
  });

  test("builds direct content links", () => {
    expect(cmsEntryPublicPath("blog-posts", entry("p", "posts", "hello"))).toBe(
      "/?blog-post=hello",
    );
  });

  test("resolves wiki context from UUID relations", () => {
    expect(cmsEntryPublicPath("characters", character, studio)).toBe(
      "/?story=exocorpse&character=morris",
    );
  });
});
