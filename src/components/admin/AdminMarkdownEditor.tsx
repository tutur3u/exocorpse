"use client";

import { jsonToMarkdown, markdownToJSON } from "@tuturuuu/editor";
import { RichTextEditor } from "@tuturuuu/editor/react";
import type { CSSProperties } from "react";
import { useMemo } from "react";

export default function AdminMarkdownEditor({
  compact = false,
  maxLength,
  minHeight = compact ? "8rem" : "16rem",
  onChange,
  placeholder,
  value,
}: {
  compact?: boolean;
  maxLength?: number;
  minHeight?: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const content = useMemo(() => markdownToJSON(value), [value]);
  const style = {
    "--tuturuuu-editor-min-height": minHeight,
  } as CSSProperties;

  return (
    <div className="admin-markdown-editor" style={style}>
      <RichTextEditor
        content={content}
        enablePreview
        featurePreset={compact ? "compact" : "full"}
        onChange={(nextContent) => {
          const markdown = jsonToMarkdown(nextContent);
          if (maxLength && markdown.length > maxLength) return;
          onChange(markdown);
        }}
        placeholder={placeholder}
      />
      {maxLength ? (
        <p className="mt-1 text-right text-[0.68rem] text-slate-500 dark:text-slate-400">
          {value.length}/{maxLength}
        </p>
      ) : null}
    </div>
  );
}
