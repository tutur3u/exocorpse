"use client";

import { jsonToMarkdown, markdownToJSON } from "@tuturuuu/editor";
import { RichTextEditor } from "@tuturuuu/editor/react";
import { Eye, Maximize2, Minimize2, Pencil } from "lucide-react";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import type { CSSProperties } from "react";
import { useState, useRef } from "react";
import { useDraftEdits } from "@/components/shared/DraftEdits";
import { useDeferredEditorValue } from "@/hooks/useDeferredEditorValue";

import EditorOverflow from "./EditorOverflow";

function selectionOffsets(root: HTMLElement) {
  const selection = document.getSelection();
  if (
    !selection?.anchorNode ||
    !selection.focusNode ||
    !root.contains(selection.anchorNode) ||
    !root.contains(selection.focusNode)
  )
    return null;
  const offset = (node: Node, position: number) => {
    const range = document.createRange();
    range.selectNodeContents(root);
    range.setEnd(node, position);
    return range.toString().length;
  };
  return {
    anchor: offset(selection.anchorNode, selection.anchorOffset),
    focus: offset(selection.focusNode, selection.focusOffset),
  };
}

function restoreSelection(
  root: HTMLElement,
  offsets: { anchor: number; focus: number },
) {
  const position = (offset: number) => {
    const walker = document.createTreeWalker(root, 4);
    let node = walker.nextNode();
    while (node) {
      const length = node.textContent?.length ?? 0;
      if (offset <= length) return { node, offset };
      offset -= length;
      const next = walker.nextNode();
      if (!next) return { node, offset: length };
      node = next;
    }
    return { node: root, offset: 0 };
  };
  const anchor = position(offsets.anchor);
  const focus = position(offsets.focus);
  document
    .getSelection()
    ?.setBaseAndExtent(anchor.node, anchor.offset, focus.node, focus.offset);
  document.dispatchEvent(new Event("selectionchange"));
}

export default function AdminMarkdownEditor({
  compact = false,
  maxLength,
  rows,
  minHeight = compact ? "8rem" : rows ? `${rows * 1.5}rem` : "16rem",
  onChange,
  onImageUpload,
  placeholder,
  showWordCount = false,
  value,
}: {
  compact?: boolean;
  maxLength?: number;
  rows?: number;
  minHeight?: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder: string;
  showWordCount?: boolean;
  value: string;
}) {
  const draftEdits = useDraftEdits();
  const rootRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [content, setContent] = useState(() => markdownToJSON(value));
  const pendingSelection = useRef<ReturnType<typeof selectionOffsets>>(null);
  const sync = useDeferredEditorValue(
    value,
    (next) => {
      const editable = rootRef.current?.querySelector<HTMLElement>(
        "[contenteditable=true]",
      );
      pendingSelection.current = editable ? selectionOffsets(editable) : null;
      setContent(markdownToJSON(next));
    },
    onChange,
  );
  const style = {
    "--tuturuuu-editor-min-height": expanded ? "34rem" : minHeight,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      onFocus={(event) => {
        sync.focus();
        const offsets = pendingSelection.current;
        if (
          !offsets ||
          !(event.target instanceof HTMLElement) ||
          !event.target.matches("[contenteditable=true]")
        )
          return;
        pendingSelection.current = null;
        restoreSelection(event.target, offsets);
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget)
        )
          return;
        sync.blur();
      }}
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          event.target instanceof HTMLElement &&
          event.target.closest(
            ".tuturuuu-editor-link-form, .admin-editor-overflow-menu",
          )
        )
          event.stopPropagation();
      }}
      className="admin-markdown-editor"
      data-preview={preview || undefined}
      data-show-word-count={showWordCount || undefined}
      style={style}
    >
      <RichTextEditor
        content={content}
        featurePreset="full"
        onChange={(nextContent) => {
          const markdown = jsonToMarkdown(nextContent);
          if (maxLength && markdown.length > maxLength) return;
          draftEdits?.touch();
          sync.emit(markdown);
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
          <span className="admin-editor-toolbar-end" data-admin-toolbar-end>
            <span className="tuturuuu-editor-tool">
              <button
                aria-label={preview ? "Edit content" : "Preview content"}
                aria-pressed={preview}
                onClick={() => setPreview((current) => !current)}
                type="button"
              >
                {preview ? (
                  <Pencil aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </button>
              <span aria-hidden="true" className="tuturuuu-editor-tooltip">
                {preview ? "Edit content" : "Preview content"}
              </span>
            </span>
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
            <EditorOverflow root={rootRef} />
          </span>
        }
      />
      {preview ? (
        <section
          aria-label="Content preview"
          className="admin-markdown-preview focus-visible:outline-2 focus-visible:outline-cyan-500"
          tabIndex={0}
        >
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p>Nothing to preview yet.</p>
          )}
        </section>
      ) : null}
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
