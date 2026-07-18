"use client";

import { newBlock } from "@/components/admin/cms-management/editor-utils";
import type { CmsBlockDraft } from "@/components/admin/cms-management/editor-types";
import { ArrowDown, ArrowUp, FileText, Plus, Trash2 } from "lucide-react";

type Props = {
  allowedBlockTypes: string[];
  blocks: CmsBlockDraft[];
  onChange: (blocks: CmsBlockDraft[]) => void;
};

const inputClassName =
  "w-full rounded-xl border border-zinc-300/80 bg-white/90 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 dark:border-zinc-700 dark:bg-zinc-950/80";

export default function CmsBlockEditor({
  allowedBlockTypes,
  blocks,
  onChange,
}: Props) {
  const blockTypes = allowedBlockTypes.length
    ? allowedBlockTypes
    : ["markdown"];

  function update(index: number, patch: Partial<CmsBlockDraft>) {
    onChange(
      blocks.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block,
      ),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next.map((block, sortOrder) => ({ ...block, sortOrder })));
  }

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
            <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            Content blocks
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Ordered body content delivered by Tuturuuu CMS.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold transition hover:border-cyan-500 hover:text-cyan-700 dark:border-zinc-700 dark:hover:text-cyan-300"
          onClick={() =>
            onChange([
              ...blocks,
              newBlock(blockTypes[0] ?? "markdown", blocks.length),
            ])
          }
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          Add block
        </button>
      </div>

      {blocks.map((block, index) => (
        <article
          className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/60"
          key={block.key}
        >
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              onChange={(event) =>
                update(index, {
                  blockType: event.target.value,
                  contentText: event.target.value === "markdown" ? "" : "{}",
                })
              }
              value={block.blockType}
            >
              {Array.from(new Set([...blockTypes, block.blockType])).map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ),
              )}
            </select>
            <input
              className="min-w-40 flex-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              onChange={(event) => update(index, { title: event.target.value })}
              placeholder="Optional block label"
              value={block.title}
            />
            <div className="ml-auto flex items-center gap-1">
              <button
                aria-label="Move block up"
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-white"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                type="button"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                aria-label="Move block down"
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-white"
                disabled={index === blocks.length - 1}
                onClick={() => move(index, 1)}
                type="button"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                aria-label="Delete block"
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950 dark:hover:text-rose-300"
                onClick={() =>
                  onChange(blocks.filter((_, item) => item !== index))
                }
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <textarea
            className={`${inputClassName} min-h-44 ${
              block.blockType === "markdown" ? "leading-6" : "font-mono text-xs"
            }`}
            onChange={(event) =>
              update(index, { contentText: event.target.value })
            }
            placeholder={
              block.blockType === "markdown"
                ? "Write Markdown content…"
                : "Enter a JSON object…"
            }
            spellCheck={block.blockType === "markdown"}
            value={block.contentText}
          />
        </article>
      ))}

      {blocks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No blocks yet. Add a block when this record needs long-form content.
        </div>
      ) : null}
    </section>
  );
}
