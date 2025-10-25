"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type PreviewModalProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function PreviewModal({
  isOpen,
  onCloseAction,
  title = "Preview",
  children,
}: PreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    setMounted(true);
    prevFocus.current = document.activeElement as HTMLElement | null;

    // Lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus dialog after mount
    setTimeout(() => dialogRef.current?.focus(), 0);

    // Esc to close
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseAction();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus.current?.focus?.();
    };
  }, [isOpen, onCloseAction]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="animate-fadeIn fixed inset-0 z-10001 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onCloseAction}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        className="animate-slideUp relative h-full w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onCloseAction();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {/* Header with title and close button */}
        <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
          <h2
            id={titleId}
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onCloseAction}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Close preview"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Close</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content area with top padding for header */}
        <div className="h-full overflow-y-auto pt-16">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
