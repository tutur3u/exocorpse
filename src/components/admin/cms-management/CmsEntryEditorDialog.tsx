"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function CmsEntryEditorDialog({
  children,
  collectionSlug,
  onClose,
  title,
  variant = "default",
}: {
  children: ReactNode;
  collectionSlug: string;
  onClose: () => void;
  title: string;
  variant?: "blog" | "default";
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const [viewport, setViewport] = useState<{
    height: number;
    top: number;
  } | null>(null);
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;
    const updateViewport = () => {
      setViewport((current) =>
        current?.height === visualViewport.height &&
        current.top === visualViewport.offsetTop
          ? current
          : { height: visualViewport.height, top: visualViewport.offsetTop },
      );
    };
    updateViewport();
    visualViewport.addEventListener("resize", updateViewport);
    visualViewport.addEventListener("scroll", updateViewport);
    return () => {
      visualViewport.removeEventListener("resize", updateViewport);
      visualViewport.removeEventListener("scroll", updateViewport);
    };
  }, []);
  useLayoutEffect(() => {
    const focused = document.activeElement;
    if (
      focused instanceof HTMLElement &&
      dialogRef.current?.contains(focused) &&
      focused.matches('input, textarea, [contenteditable="true"]')
    ) {
      focused.scrollIntoView({ block: "nearest" });
    }
  }, [viewport]);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      const dialogs = document.querySelectorAll("[data-cms-dialog]");
      if (
        dialogs[dialogs.length - 1] !== dialogRef.current ||
        document.querySelector('[role="alertdialog"]')
      )
        return;
      if (event.key === "Tab") {
        const controls = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
          ) ?? [],
        ).filter((control) => control.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !dialogRef.current?.contains(document.activeElement))
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !dialogRef.current?.contains(document.activeElement))
        ) {
          event.preventDefault();
          first?.focus();
        }
      }
      if (
        event.key === "Escape" &&
        !document.querySelector('[role="alertdialog"]')
      ) {
        closeRef.current();
      }
    };
    dialogRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const maxWidth =
    collectionSlug === "character-relationships"
      ? "max-w-3xl"
      : collectionSlug === "character-factions"
        ? "max-w-2xl"
        : collectionSlug === "locations"
          ? "max-w-5xl"
          : ["portfolio-writing", "blog-posts"].includes(collectionSlug)
            ? "max-w-6xl"
            : collectionSlug === "portfolio-games"
              ? "max-w-3xl"
              : [
                    "commission-addons",
                    "commission-styles",
                    "commission-pictures",
                    "relationship-types",
                  ].includes(collectionSlug)
                ? "max-w-2xl"
                : "max-w-4xl";
  return (
    <div
      className="animate-fadeIn fixed inset-x-0 top-0 z-[60] flex h-[100dvh] items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      style={
        viewport ? { height: viewport.height, top: viewport.top } : undefined
      }
    >
      <button
        aria-label="Close and discard changes"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        ref={dialogRef}
        data-cms-dialog
        tabIndex={-1}
        aria-label={title}
        aria-modal="true"
        className={`animate-slideUp relative flex h-full w-full flex-col overflow-hidden ${maxWidth} ${variant === "blog" ? "rounded-t-[2rem] border border-zinc-200/80 bg-[linear-gradient(180deg,_rgba(255,252,249,0.98),_rgba(247,242,236,0.96))] shadow-xl sm:h-auto sm:max-h-[92%] sm:rounded-[2rem] dark:border-zinc-800/80 dark:bg-[linear-gradient(180deg,_rgba(22,22,24,0.98),_rgba(10,10,12,0.98))]" : "rounded-t-2xl bg-white sm:h-auto sm:max-h-[90%] sm:rounded-lg dark:bg-gray-800"}`}
        role="dialog"
      >
        {children}
      </section>
    </div>
  );
}
