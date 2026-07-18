import { describe, expect, it } from "bun:test";
import {
  createStudioBlockIndex,
  registerStudioBlocks,
  resolveBundleBlockIds,
  type BundleBlock,
} from "./exocorpse-cms-migration-blocks";

const block: BundleBlock = {
  blockType: "markdown",
  content: { markdown: "Biography" },
  sortOrder: 0,
  stableSourceId: "exocorpse:about:settings:hero-bio",
};

describe("Exocorpse CMS migration block identity", () => {
  it("reuses studio block IDs during idempotent bundle updates", () => {
    const index = createStudioBlockIndex([
      {
        entry_id: "entry-1",
        id: "block-1",
        stable_source_id: block.stableSourceId ?? null,
      },
    ]);

    expect(resolveBundleBlockIds("entry-1", [block], index)).toEqual([
      { ...block, id: "block-1" },
    ]);
  });

  it("indexes IDs returned by bundle creation before the relation pass", () => {
    const index = createStudioBlockIndex([]);
    expect(resolveBundleBlockIds(undefined, [block], index)).toEqual([block]);

    registerStudioBlocks(index, [
      {
        entry_id: "entry-2",
        id: "block-2",
        stable_source_id: block.stableSourceId ?? null,
      },
    ]);

    expect(resolveBundleBlockIds("entry-2", [block], index)).toEqual([
      { ...block, id: "block-2" },
    ]);
  });

  it("does not replace caller-provided IDs or invent IDs without a match", () => {
    const index = createStudioBlockIndex([]);

    expect(
      resolveBundleBlockIds(
        "entry-3",
        [
          { ...block, id: "caller-block" },
          { ...block, stableSourceId: null },
        ],
        index,
      ),
    ).toEqual([
      { ...block, id: "caller-block" },
      { ...block, stableSourceId: null },
    ]);
  });
});
