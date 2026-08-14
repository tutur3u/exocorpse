"use client";

import { jsonToMarkdown, markdownToJSON } from "@tuturuuu/editor";
import { RichTextEditor } from "@tuturuuu/editor/react";
import { MoreHorizontal, X } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function AdminMarkdownEditor({
  compact = false,
  maxLength,
  minHeight = compact ? "8rem" : "16rem",
  onChange,
  onImageUpload,
  placeholder,
  value,
}: {
  compact?: boolean;
  maxLength?: number;
  minHeight?: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder: string;
  value: string;
}) {
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const content = useMemo(() => markdownToJSON(value), [value]);
  const style = {
    "--tuturuuu-editor-min-height": minHeight,
  } as CSSProperties;

  useEffect(() => {
    if (!showMoreTools) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof MouseEvent &&
        editorRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setShowMoreTools(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [showMoreTools]);

  return (
    <div
      className="admin-markdown-editor"
      data-tools-expanded={showMoreTools || undefined}
      ref={editorRef}
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
      />
      <button
        aria-expanded={showMoreTools}
        aria-label={
          showMoreTools
            ? "Close more formatting tools"
            : "More formatting tools"
        }
        className="admin-markdown-editor-tools-toggle"
        onClick={() => setShowMoreTools((current) => !current)}
        title={
          showMoreTools ? "Close formatting tools" : "More formatting tools"
        }
        type="button"
      >
        {showMoreTools ? (
          <X aria-hidden className="h-4 w-4" />
        ) : (
          <MoreHorizontal aria-hidden className="h-4 w-4" />
        )}
      </button>
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
