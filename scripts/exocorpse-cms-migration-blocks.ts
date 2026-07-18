type BundleBlock = {
  blockType: string;
  content: Record<string, unknown>;
  id?: string;
  sortOrder?: number;
  stableSourceId?: string | null;
  title?: string | null;
};

type StudioBlock = {
  entry_id: string;
  id: string;
  stable_source_id: string | null;
};

function blockIdentity(entryId: string, stableSourceId: string) {
  return `${entryId}:${stableSourceId}`;
}

export function createStudioBlockIndex(blocks: StudioBlock[]) {
  return new Map(
    blocks.flatMap((block) =>
      block.stable_source_id
        ? [
            [
              blockIdentity(block.entry_id, block.stable_source_id),
              block,
            ] as const,
          ]
        : [],
    ),
  );
}

export function registerStudioBlocks(
  index: Map<string, StudioBlock>,
  blocks: StudioBlock[],
) {
  for (const block of blocks) {
    if (!block.stable_source_id) continue;
    index.set(blockIdentity(block.entry_id, block.stable_source_id), block);
  }
}

export function resolveBundleBlockIds(
  entryId: string | undefined,
  blocks: BundleBlock[],
  index: ReadonlyMap<string, StudioBlock>,
): BundleBlock[] {
  if (!entryId) return blocks;

  return blocks.map((block) => {
    if (block.id || !block.stableSourceId) return block;
    const existing = index.get(blockIdentity(entryId, block.stableSourceId));
    return existing ? { ...block, id: existing.id } : block;
  });
}

export type { BundleBlock, StudioBlock };
