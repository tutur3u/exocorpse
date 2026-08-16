"use client";

import { jsonToMarkdown, markdownToJSON } from "@tuturuuu/editor";
import { RichTextEditor } from "@tuturuuu/editor/react";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { Eye, ListTree, Maximize2, Minimize2, Pencil } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

export default function AdminMarkdownEditor({
  compact = false,
  maxLength,
  minHeight = compact ? "8rem" : "16rem",
  onChange,
  onImageUpload,
  placeholder,
  showWordCount = false,
  value,
}: {
  compact?: boolean;
  maxLength?: number;
  minHeight?: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder: string;
  showWordCount?: boolean;
  value: string;
}) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const content = useMemo(() => markdownToJSON(value), [value]);
  const style = {
    "--tuturuuu-editor-min-height": expanded ? "34rem" : minHeight,
  } as CSSProperties;

  return (
    <div
      className="admin-markdown-editor"
      data-show-word-count={showWordCount || undefined}
      style={style}
    >
      <div className="admin-markdown-editor-view-controls">
        <div
          className="flex items-center gap-1"
          role="tablist"
          aria-label="Editor view"
        >
          <button
            aria-selected={mode === "edit"}
            onClick={() => setMode("edit")}
            role="tab"
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            aria-selected={mode === "preview"}
            onClick={() => setMode("preview")}
            role="tab"
            type="button"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Add collapsible section"
            onClick={() =>
              onChange(
                `${value}${value.trim() ? "\n\n" : ""}<details>\n<summary>Section title</summary>\n\nWrite the collapsible content here.\n\n</details>`,
              )
            }
            title="Add collapsible section"
            type="button"
          >
            <ListTree className="h-4 w-4" />
            <span className="hidden sm:inline">Toggle</span>
          </button>
          <button
            aria-label={expanded ? "Use compact editor" : "Expand editor"}
            onClick={() => setExpanded((current) => !current)}
            title={expanded ? "Use compact editor" : "Expand editor"}
            type="button"
          >
            {expanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {expanded ? "Compact" : "Expand"}
            </span>
          </button>
        </div>
      </div>
      {mode === "edit" ? (
        <RichTextEditor
          content={content}
          featurePreset="full"
          onChange={(nextContent) => {
            const markdown = jsonToMarkdown(nextContent);
            if (maxLength && markdown.length > maxLength) return;
            onChange(markdown);
          }}
          onImageUpload={
            onImageUpload
              ? async (file) => {
                  setImageError(null);
                  const url = await onImageUpload(file);
                  setImageError(null);
                  return url;
                }
              : undefined
          }
          onImageUploadError={(error) =>
            setImageError(
              error instanceof Error
                ? error.message
                : "That image could not be added. Please try again.",
            )
          }
          placeholder={placeholder}
        />
      ) : (
        <div
          className="admin-markdown-editor-preview"
          style={{ minHeight: expanded ? "34rem" : minHeight }}
        >
          {value ? <MarkdownRenderer content={value} /> : <p>{placeholder}</p>}
        </div>
      )}
      {maxLength ? (
        <p className="mt-1 text-right text-[0.68rem] text-slate-500 dark:text-slate-400">
          {value.length}/{maxLength}
        </p>
      ) : null}
      {imageError ? (
        <p
          className="mt-2 text-sm text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {imageError}
        </p>
      ) : null}
    </div>
  );
}
