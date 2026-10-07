import { matchesCmsMarkdownTitle } from "@/lib/cms-markdown-titles";
import type { CmsBlockDraft } from "./editor-types";
import { newBlock } from "./editor-utils";

export function legacyMarkdownBlock(blocks: CmsBlockDraft[], title: string) {
  return (
    blocks.find(
      (block) =>
        block.blockType === "markdown" &&
        matchesCmsMarkdownTitle(block.title, title),
    ) ??
    (title === "Content"
      ? blocks.find(
          (block) => block.blockType === "markdown" && !block.title.trim(),
        )
      : undefined)
  );
}

export function updateLegacyMarkdownBlock(
  blocks: CmsBlockDraft[],
  title: string,
  contentText: string,
): CmsBlockDraft[] {
  const existing = legacyMarkdownBlock(blocks, title);
  if (existing)
    return blocks.map((block) =>
      block.key === existing.key
        ? {
            ...block,
            title: block.title.trim() ? block.title : title,
            contentText,
          }
        : block,
    );
  if (!contentText) return blocks;
  return [
    ...blocks,
    { ...newBlock("markdown", blocks.length), title, contentText },
  ];
}
