"use client";

import {
  humanizeField,
  newBlock,
} from "@/components/admin/cms-management/editor-utils";
import type { CmsBlockDraft } from "@/components/admin/cms-management/editor-types";
import AdminMarkdownEditor from "@/components/admin/AdminMarkdownEditor";
import SortableList from "@/components/admin/SortableList";
import { Button } from "@tuturuuu/ui/button";
import { Input } from "@tuturuuu/ui/input";
import { Textarea } from "@tuturuuu/ui/textarea";
import { ChevronDown, FileText, Plus, Trash2 } from "lucide-react";

type Props = {
  allowedBlockTypes: string[];
  blocks: CmsBlockDraft[];
  onChange: (blocks: CmsBlockDraft[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
};

const inputClassName =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700";

export default function CmsBlockEditor({
  allowedBlockTypes,
  blocks,
  onChange,
  onImageUpload,
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

  return (
    <section className="space-y-4 border-t border-gray-200 pt-5 dark:border-gray-700">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-zinc-50">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Page sections
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Build longer pages from focused, reorderable sections.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onChange([
              ...blocks,
              newBlock(blockTypes[0] ?? "markdown", blocks.length),
            ])
          }
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          Add section
        </Button>
      </div>

      <SortableList
        className="space-y-3"
        getId={(block) => block.key}
        items={blocks}
        onReorder={(next) =>
          onChange(next.map((block, sortOrder) => ({ ...block, sortOrder })))
        }
      >
        {(block) => {
          const index = blocks.findIndex((item) => item.key === block.key);
          return (
            <details
              className="group overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/60"
              key={block.key}
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 marker:content-none">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {block.title || `Section ${index + 1}`}
                  </span>
                  <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                    {block.blockType === "markdown"
                      ? "Text"
                      : humanizeField(block.blockType)}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-zinc-400 transition group-open:rotate-180" />
              </summary>
              <div className="space-y-3 border-t border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    onChange={(event) =>
                      update(index, {
                        blockType: event.target.value,
                        contentText:
                          event.target.value === "markdown" ? "" : "{}",
                      })
                    }
                    value={block.blockType}
                  >
                    {Array.from(new Set([...blockTypes, block.blockType])).map(
                      (type) => (
                        <option key={type} value={type}>
                          {type === "markdown" ? "Text" : humanizeField(type)}
                        </option>
                      ),
                    )}
                  </select>
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      aria-label="Delete block"
                      className="text-zinc-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950 dark:hover:text-rose-300"
                      onClick={() =>
                        onChange(blocks.filter((_, item) => item !== index))
                      }
                      type="button"
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <Input
                  className="w-full bg-white text-sm dark:bg-zinc-900"
                  onChange={(event) =>
                    update(index, { title: event.target.value })
                  }
                  placeholder="Optional section title"
                  value={block.title}
                />
                {block.blockType === "markdown" ? (
                  <AdminMarkdownEditor
                    minHeight="18rem"
                    onChange={(value) => update(index, { contentText: value })}
                    onImageUpload={onImageUpload}
                    placeholder="Write this section’s content…"
                    value={block.contentText}
                  />
                ) : (
                  <Textarea
                    className={`${inputClassName} min-h-44 font-mono text-xs`}
                    onChange={(event) =>
                      update(index, { contentText: event.target.value })
                    }
                    placeholder="Add the section details…"
                    spellCheck={false}
                    value={block.contentText}
                  />
                )}
              </div>
            </details>
          );
        }}
      </SortableList>

      {blocks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
          No page sections yet. Add one when this item needs a longer story.
        </div>
      ) : null}
    </section>
  );
}
