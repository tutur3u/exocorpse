"use client";

import { jsonToMarkdown, markdownToJSON } from "@tuturuuu/editor";
import { RichTextEditor } from "@tuturuuu/editor/react";
import { Maximize2, Minimize2 } from "lucide-react";
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
        toolbarEnd={
          <span className="tuturuuu-editor-tool">
            <button
              aria-label={expanded ? "Use compact editor" : "Expand editor"}
              aria-pressed={expanded}
              onClick={() => setExpanded((current) => !current)}
              type="button"
            >
              {expanded ? (
                <Minimize2 aria-hidden="true" />
              ) : (
                <Maximize2 aria-hidden="true" />
              )}
            </button>
            <span aria-hidden="true" className="tuturuuu-editor-tooltip">
              {expanded ? "Use compact editor" : "Expand editor"}
            </span>
          </span>
        }
      />
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
