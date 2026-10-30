import { expect, test } from "bun:test";
import { retainEditsAfterSave } from "./retain-edits-after-save";
import { emptyEntry, newBlock } from "./editor-utils";
import { savedBlockKeys } from "./saved-block-keys";

test("an older save acknowledgment keeps newer draft text and block additions/deletions", () => {
  const submitted = newBlock("markdown", 0);
  const removed = { ...newBlock("markdown", 1), id: "removed-locally" };
  const added = newBlock("markdown", 2);
  const entry = {
    ...emptyEntry("collection"),
    id: "assigned",
    updated_at: "new-version",
    title: "Submitted title",
  };
  const saved = [
    {
      id: "saved-block",
      block_type: "markdown",
      sort_order: 0,
      content: { markdown: "Submitted" },
      title: null,
      stable_source_id: null,
    },
    {
      id: "removed-locally",
      block_type: "markdown",
      sort_order: 1,
      content: { markdown: "Removed" },
      title: null,
      stable_source_id: null,
    },
  ];
  const current = {
    draft: { ...emptyEntry("collection"), title: "Newer typing" },
    blocks: [{ ...submitted, contentText: "Newer block typing" }, added],
  };
  const result = retainEditsAfterSave(
    current,
    { entry, blocks: saved },
    savedBlockKeys(saved, [submitted, removed]),
  );
  expect(result.draft.title).toBe("Newer typing");
  expect(result.draft.id).toBe("assigned");
  expect(result.draft.updated_at).toBe("new-version");
  expect(result.blocks.map((block) => block.key)).toEqual([
    submitted.key,
    added.key,
  ]);
  expect(result.blocks[0]?.id).toBe("saved-block");
  expect(result.blocks[0]?.contentText).toBe("Newer block typing");
  expect(result.blocks[1]?.id).toBeUndefined();
});
