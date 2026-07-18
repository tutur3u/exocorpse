"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";

export default function CmsEntryEditorDialog({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !document.querySelector('[role="alertdialog"]')
      ) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 @2xl:p-5">
      <button
        aria-label="Close editor"
        className="absolute inset-0 cursor-default bg-zinc-950/75 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={title}
        aria-modal="true"
        className="relative max-h-[calc(100dvh-1rem)] w-full max-w-6xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl @2xl:max-h-[calc(100dvh-2.5rem)] @2xl:rounded-[1.75rem] dark:border-zinc-800 dark:bg-zinc-950"
        role="dialog"
      >
        <button
          aria-label="Close editor"
          className="absolute top-4 right-4 z-40 rounded-xl border border-zinc-200 bg-white/90 p-2 text-zinc-500 shadow-sm backdrop-blur transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </section>
    </div>
  );
}
