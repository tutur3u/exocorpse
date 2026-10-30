import { retainEditsAfterSave } from "./retain-edits-after-save";
import { expect, test } from "bun:test";
import { savedBlockKeys } from "./saved-block-keys";
import {
  blocksToDrafts,
  newBlock,
  emptyEntry,
  buildSavePayload,
} from "./editor-utils";
test("first-save hydration retains the new block's local React key", () => {
  const local = newBlock("markdown", 0);
  const saved = {
    id: "server-id",
    block_type: "markdown",
    sort_order: 0,
    content: { markdown: "Saved" },
    title: "Content",
    stable_source_id: null,
  };
  const keys = savedBlockKeys([saved], [local]);
  const hydrated = blocksToDrafts([saved]).map((block) => ({
    ...block,
    key: keys.get(block.id ?? "") ?? block.key,
  }));
  expect(hydrated[0]?.id).toBe("server-id");
  expect(hydrated[0]?.key).toBe(local.key);
  expect(hydrated[0]?.contentText).toBe("Saved");
});

test("two new same-type blocks with duplicate sort orders retain distinct ids for re-save", () => {
  const first = newBlock("markdown", 0);
  const second = newBlock("markdown", 0);
  const block = {
    block_type: "markdown",
    sort_order: 0,
    content: { markdown: "Saved" },
    title: null,
    stable_source_id: null,
  };
  const saved = [
    { ...block, id: "first-server" },
    { ...block, id: "second-server" },
  ];
  const keys = savedBlockKeys(saved, [first, second]);
  expect(keys.get("first-server")).toBe(first.key);
  expect(keys.get("second-server")).toBe(second.key);
  expect(new Set(keys.values()).size).toBe(2);
  const retained = retainEditsAfterSave(
    { draft: emptyEntry("collection"), blocks: [first, second] },
    { entry: emptyEntry("collection"), blocks: saved },
    keys,
  );
  const payload = buildSavePayload({
    ...retained,
    definitions: [],
    relationSelections: {},
  });
  expect(payload.blocks.map((block) => block.id)).toEqual([
    "first-server",
    "second-server",
  ]);
});

test("saved block ids take precedence over array position", () => {
  const first = { ...newBlock("markdown", 0), id: "first" };
  const second = { ...newBlock("markdown", 1), id: "second" };
  const block = {
    block_type: "markdown",
    sort_order: 0,
    content: { markdown: "Saved" },
    title: null,
    stable_source_id: null,
  };
  const keys = savedBlockKeys(
    [
      { ...block, id: "second" },
      { ...block, id: "first" },
    ],
    [first, second],
  );
  expect(keys.get("second")).toBe(second.key);
  expect(keys.get("first")).toBe(first.key);
});

test("positional fallback refuses persisted drafts or a different block type", () => {
  const existing = { ...newBlock("markdown", 0), id: "unrelated" };
  const different = newBlock("image", 0);
  const block = {
    id: "new-server",
    block_type: "markdown",
    sort_order: 0,
    content: { markdown: "Saved" },
    title: null,
    stable_source_id: null,
  };
  expect(savedBlockKeys([block], [existing]).get(block.id)).toBe(block.id);
  expect(savedBlockKeys([block], [different]).get(block.id)).toBe(block.id);
});
