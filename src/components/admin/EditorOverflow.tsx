"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";

type Action = {
  button: HTMLButtonElement;
  label: string;
  disabled: boolean;
  pressed: string | null;
};

/** Adapts the installed editor toolbar without replacing its formatting actions. */
export default function EditorOverflow({
  root,
}: {
  root: RefObject<HTMLDivElement | null>;
}) {
  const endRef = useRef<HTMLSpanElement>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const widths = new WeakMap<HTMLElement, number>();
    let signature = "";
    const measure = () => {
      const toolbar = element.querySelector<HTMLElement>(
        ".tuturuuu-editor-toolbar",
      );
      if (!toolbar || !toolbar.clientWidth) return;
      const children = Array.from(toolbar.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && !child.contains(endRef.current),
      );
      const style = getComputedStyle(toolbar);
      const gap = Number.parseFloat(style.columnGap) || 0;
      const available =
        toolbar.clientWidth -
        (Number.parseFloat(style.paddingLeft) || 0) -
        (Number.parseFloat(style.paddingRight) || 0);
      const moreWidth = endRef.current?.getBoundingClientRect().width ?? 0;
      const endWidth =
        (endRef.current?.parentElement?.getBoundingClientRect().width ?? 0) -
        moreWidth;
      const sizes = children.map((child) => {
        const size = widths.get(child) ?? child.getBoundingClientRect().width;
        if (size > 0) widths.set(child, size);
        return size;
      });
      // Reserve the overflow button only when the complete toolbar does not fit.
      const total =
        sizes.reduce((sum, size) => sum + size, 0) +
        gap * children.length +
        endWidth;
      const overflow = total > available;
      const limit =
        available - endWidth - (overflow ? (moreWidth || 44) + gap : 0);
      let used = 0;
      const next: Action[] = [];
      children.forEach((child, index) => {
        const size = sizes[index] ?? 0;
        const hidden = overflow && used + size + gap > limit;
        if (!hidden) used += size + gap;
        child.toggleAttribute("data-admin-overflow", hidden);
        if (hidden) {
          const button =
            child.querySelector<HTMLButtonElement>("button[aria-label]");
          if (button)
            next.push({
              button,
              label: button.getAttribute("aria-label") ?? "Formatting",
              disabled: button.disabled,
              pressed: button.getAttribute("aria-pressed"),
            });
        }
      });
      const nextSignature = next
        .map((item) => `${item.label}:${item.disabled}:${item.pressed}`)
        .join("|");
      if (signature !== nextSignature) {
        signature = nextSignature;
        setActions(next);
      }
    };
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    const mutation = new MutationObserver(measure);
    mutation.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-pressed", "disabled"],
    });
    measure();
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [root, actions.length]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !endRef.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return (
    <span ref={endRef} className="admin-editor-overflow">
      {actions.length ? (
        <button
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="More formatting"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <MoreHorizontal aria-hidden="true" />
        </button>
      ) : null}
      {open && actions.length ? (
        <div
          className="admin-editor-overflow-menu"
          ref={menuRef}
          role="menu"
          aria-label="Additional formatting"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setOpen(false);
              endRef.current?.querySelector("button")?.focus();
            }
          }}
        >
          {actions.map((action) => (
            <button
              aria-pressed={action.pressed === "true" || undefined}
              disabled={action.disabled}
              key={action.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                action.button.click();
                setOpen(false);
              }}
              role="menuitem"
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </span>
  );
}
