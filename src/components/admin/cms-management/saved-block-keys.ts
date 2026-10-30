import type { CmsBlockDraft, CmsBlockSource } from "./editor-types";

/** Keep a new block mounted when its first save assigns its server id. */
export function savedBlockKeys(
  saved: CmsBlockSource[],
  submitted: CmsBlockDraft[],
) {
  return new Map(
    saved.map((block, index) => {
      const atIndex = submitted[index];
      const previous =
        submitted.find((draft) => draft.id === block.id) ??
        (atIndex && !atIndex.id && atIndex.blockType === block.block_type
          ? atIndex
          : undefined);
      return [block.id, previous?.key ?? block.id];
    }),
  );
}
