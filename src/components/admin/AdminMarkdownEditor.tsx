"use client";

import { jsonToMarkdown, markdownToJSON } from "@tuturuuu/editor";
import { RichTextEditor } from "@tuturuuu/editor/react";
import { toolbarOverflowStartIndex } from "@/components/admin/admin-markdown-toolbar";
import { MoreHorizontal, X } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type OverflowTool = {
  label: string;
  pressed: boolean;
};

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
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [overflowTools, setOverflowTools] = useState<OverflowTool[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const content = useMemo(() => markdownToJSON(value), [value]);
  const style = {
    "--tuturuuu-editor-min-height": minHeight,
  } as CSSProperties;

  useEffect(() => {
    const wrapper = editorRef.current;
    if (!wrapper) return;

    let toolbar: HTMLElement | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let animationFrame = 0;
    const measure = () => {
      if (!toolbar) return;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        if (!toolbar) return;
        const items = Array.from(toolbar.children).filter(
          (item): item is HTMLElement => item instanceof HTMLElement,
        );
        for (const item of items) delete item.dataset.adminOverflow;

        const styles = getComputedStyle(toolbar);
        const horizontalPadding =
          Number.parseFloat(styles.paddingLeft) +
          Number.parseFloat(styles.paddingRight);
        const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
        const availableWidth = Math.max(
          0,
          toolbar.clientWidth - horizontalPadding,
        );
        const overflowStartIndex = toolbarOverflowStartIndex({
          availableWidth,
          gap,
          itemWidths: items.map((item) => item.offsetWidth),
        });

        if (overflowStartIndex === null) {
          setOverflowTools((current) => (current.length === 0 ? current : []));
          setShowMoreTools(false);
          return;
        }

        const nextOverflowTools: OverflowTool[] = [];

        items.forEach((item, index) => {
          if (index < overflowStartIndex) return;

          item.dataset.adminOverflow = "true";
          const button =
            item.querySelector<HTMLButtonElement>("button[aria-label]");
          const label = button?.getAttribute("aria-label");
          if (button && label) {
            nextOverflowTools.push({
              label,
              pressed: button.getAttribute("aria-pressed") === "true",
            });
          }
        });

        setOverflowTools((current) => {
          const unchanged =
            current.length === nextOverflowTools.length &&
            current.every(
              (tool, index) =>
                tool.label === nextOverflowTools[index]?.label &&
                tool.pressed === nextOverflowTools[index]?.pressed,
            );
          return unchanged ? current : nextOverflowTools;
        });
      });
    };

    const attachToolbar = () => {
      const nextToolbar = wrapper.querySelector<HTMLElement>(
        ".tuturuuu-editor-toolbar",
      );
      if (!nextToolbar) return;
      if (nextToolbar === toolbar) {
        measure();
        return;
      }
      resizeObserver?.disconnect();
      toolbar = nextToolbar;
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(toolbar);
      measure();
    };

    const mountObserver = new MutationObserver(attachToolbar);
    mountObserver.observe(wrapper, { childList: true, subtree: true });
    window.addEventListener("resize", measure);
    attachToolbar();
    return () => {
      cancelAnimationFrame(animationFrame);
      mountObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
      for (const item of Array.from(toolbar?.children ?? [])) {
        if (item instanceof HTMLElement) delete item.dataset.adminOverflow;
      }
    };
  }, []);

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
      data-has-tool-overflow={overflowTools.length > 0 || undefined}
      data-show-word-count={showWordCount || undefined}
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
      {overflowTools.length > 0 ? (
        <>
          <button
            aria-expanded={showMoreTools}
            aria-label={
              showMoreTools
                ? "Close more formatting tools"
                : "More formatting tools"
            }
            className="admin-markdown-editor-tools-toggle"
            data-tooltip="More formatting tools"
            onClick={() => setShowMoreTools((current) => !current)}
            title="More formatting tools"
            type="button"
          >
            {showMoreTools ? (
              <X aria-hidden className="h-4 w-4" />
            ) : (
              <MoreHorizontal aria-hidden className="h-4 w-4" />
            )}
          </button>
          {showMoreTools ? (
            <div
              aria-label="More formatting tools"
              className="admin-markdown-editor-tools-menu"
              role="menu"
            >
              {overflowTools.map((tool) => (
                <button
                  className="admin-markdown-editor-tools-menu-item"
                  data-active={tool.pressed || undefined}
                  key={tool.label}
                  onClick={() => {
                    const buttons = Array.from(
                      editorRef.current?.querySelectorAll<HTMLButtonElement>(
                        ".tuturuuu-editor-toolbar button[aria-label]",
                      ) ?? [],
                    );
                    buttons
                      .find(
                        (button) =>
                          button.getAttribute("aria-label") === tool.label,
                      )
                      ?.click();
                    setShowMoreTools(false);
                  }}
                  role="menuitem"
                  type="button"
                >
                  {tool.label}
                </button>
              ))}
            </div>
          ) : null}
        </>
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
