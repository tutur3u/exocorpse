import type { CmsBlockDraft, CmsBlockSource } from "./editor-types";

/** Keep a new block mounted when its first save assigns its server id. */
export function savedBlockKeys(
  saved: CmsBlockSource[],
  submitted: CmsBlockDraft[],
) {
  return new Map(
    saved.map((block) => {
      const previous =
        submitted.find((draft) => draft.id === block.id) ??
        submitted.find(
          (draft) =>
            !draft.id &&
            draft.sortOrder === block.sort_order &&
            draft.blockType === block.block_type,
        );
      return [block.id, previous?.key ?? block.id];
    }),
  );
}
