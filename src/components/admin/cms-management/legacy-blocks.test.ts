import { expect, test } from "bun:test";
import {
  legacyMarkdownBlock,
  updateLegacyMarkdownBlock,
} from "./legacy-blocks";
import type { CmsBlockDraft } from "./editor-types";
import { blocksToDrafts, buildSavePayload } from "./editor-utils";

const blocks: CmsBlockDraft[] = [
  {
    blockType: "markdown",
    contentText: "Original description",
    id: "description-id",
    key: "description-key",
    sortOrder: 0,
    stableSourceId: "original-description",
    title: "Description",
  },
  {
    blockType: "markdown",
    contentText: "Original lore",
    id: "lore-id",
    key: "lore-key",
    sortOrder: 1,
    title: "Lore",
  },
  {
    blockType: "image",
    contentText: '{"src":"/image.png"}',
    id: "image-id",
    key: "image-key",
    sortOrder: 2,
    title: "Reference",
  },
];

test("game bio edits survive bundle serialization and reopening without changing other data", () => {
  const draft = {
    collection_id: "games",
    id: "game",
    title: "Owned fixture",
    slug: "owned-fixture",
    status: "published" as const,
    subtitle: null,
    summary: "Retained summary",
    metadata: { provenance: "legacy" },
    profile_data: { gameUrl: "https://example.org/game" },
    sort_order: 4,
    scheduled_for: null,
    updated_at: "2026-10-15",
  };
  const updated = updateLegacyMarkdownBlock(
    blocks,
    "Description",
    "Edited **game bio**",
  );
  const payload = buildSavePayload({
    blocks: updated,
    draft,
    definitions: [],
    relationSelections: {},
  });
  expect(payload.entry.profileData).toEqual(draft.profile_data);
  expect(payload.entry.metadata).toEqual(draft.metadata);
  expect(payload.entry.summary).toBe(draft.summary);
  expect(payload.blocks[0]).toMatchObject({
    id: "description-id",
    stableSourceId: "original-description",
    content: { markdown: "Edited **game bio**" },
  });
  const reopened = blocksToDrafts(
    payload.blocks.map((block, index) => ({
      block_type: block.blockType,
      content: block.content,
      id: block.id ?? `new-${index}`,
      sort_order: block.sortOrder,
      stable_source_id: block.stableSourceId ?? null,
      title: block.title,
    })),
  );
  expect(legacyMarkdownBlock(reopened, "Description")?.contentText).toBe(
    "Edited **game bio**",
  );
  const original = buildSavePayload({
    blocks,
    draft,
    definitions: [],
    relationSelections: {},
  });
  expect(payload.blocks.slice(1)).toEqual(original.blocks.slice(1));
  expect(updated.slice(1)).toEqual(blocks.slice(1));
});
test("editing one legacy field preserves sibling blocks and CMS identities", () => {
  const result = updateLegacyMarkdownBlock(
    blocks,
    "Description",
    "Updated description",
  );
  expect(result[0]).toEqual({
    ...blocks[0],
    contentText: "Updated description",
  });
  expect(result.slice(1)).toEqual(blocks.slice(1));
  expect(blocks[0]?.contentText).toBe("Original description");
});
test("new legacy fields append without flattening the existing document", () => {
  const result = updateLegacyMarkdownBlock(
    blocks,
    "Backstory",
    "A new backstory",
  );
  expect(result.slice(0, 3)).toEqual(blocks);
  expect(legacyMarkdownBlock(result, "backstory")?.contentText).toBe(
    "A new backstory",
  );
  expect(result[3]?.sortOrder).toBe(3);
});
test("empty untouched fields do not create blank CMS blocks", () => {
  expect(updateLegacyMarkdownBlock(blocks, "Backstory", "")).toBe(blocks);
  expect(updateLegacyMarkdownBlock(blocks, "Lore", "")[1]?.id).toBe("lore-id");
});

test("an untitled existing body remains editable without losing its identity", () => {
  const body = { ...blocks[0]!, title: "", contentText: "Existing body" };
  expect(legacyMarkdownBlock([body], "Content")).toBe(body);
  expect(updateLegacyMarkdownBlock([body], "Content", "Edited body")).toEqual([
    { ...body, title: "Content", contentText: "Edited body" },
  ]);
});

test("imported Story content is edited in place rather than duplicated", () => {
  const body = {
    ...blocks[0]!,
    title: "Story content",
    contentText: "Imported story",
  };
  expect(legacyMarkdownBlock([body], "Content")).toBe(body);
  expect(updateLegacyMarkdownBlock([body], "Content", "Edited story")).toEqual([
    { ...body, contentText: "Edited story" },
  ]);
});
