"use client";

import AdminMarkdownEditor from "@/components/admin/AdminMarkdownEditor";
import type { CmsBlockDraft } from "./editor-types";
import {
  legacyMarkdownBlock,
  updateLegacyMarkdownBlock,
} from "./legacy-blocks";

export default function CmsLegacyMarkdownField({
  blocks,
  title,
  onChange,
  onImageUpload,
  placeholder,
  label,
}: {
  blocks: CmsBlockDraft[];
  title: string;
  onChange: (blocks: CmsBlockDraft[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label ?? title}
      </p>
      <AdminMarkdownEditor
        rows={
          title === "Description"
            ? 5
            : title === "Content"
              ? 15
              : title === "Lore"
                ? 8
                : 12
        }
        minHeight={title === "Description" ? "170px" : "200px"}
        value={legacyMarkdownBlock(blocks, title)?.contentText ?? ""}
        onChange={(value) =>
          onChange(updateLegacyMarkdownBlock(blocks, title, value))
        }
        onImageUpload={onImageUpload}
        placeholder={placeholder ?? `Write ${title.toLowerCase()}...`}
      />
    </div>
  );
}
