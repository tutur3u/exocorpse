import { expect, test } from "bun:test";
import { savedBlockKeys } from "./saved-block-keys";
import { blocksToDrafts, newBlock } from "./editor-utils";
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
