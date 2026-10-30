import type {
  CmsBlockDraft,
  CmsBlockSource,
  CmsEntryDraft,
} from "./editor-types";

export function retainEditsAfterSave(
  current: { draft: CmsEntryDraft; blocks: CmsBlockDraft[] },
  saved: { entry: CmsEntryDraft; blocks: CmsBlockSource[] },
  keys: ReadonlyMap<string, string>,
) {
  const persisted = new Map(
    saved.blocks.map((block) => [keys.get(block.id) ?? block.id, block]),
  );
  return {
    draft: {
      ...current.draft,
      id: saved.entry.id,
      updated_at: saved.entry.updated_at,
    },
    blocks: current.blocks.map((block) => {
      const server = persisted.get(block.key);
      return server
        ? { ...block, id: server.id, stableSourceId: server.stable_source_id }
        : block;
    }),
  };
}
