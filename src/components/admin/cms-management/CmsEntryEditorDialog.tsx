"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";

export default function CmsEntryEditorDialog({
  children,
  onClose,
  title,
  variant = "default",
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
  variant?: "blog" | "default";
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center overflow-hidden bg-slate-950/72 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        aria-label="Close editor"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={title}
        aria-modal="true"
        className={`animate-slideUp relative flex h-[100dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-white/10 shadow-[0_32px_100px_rgba(2,6,23,0.62)] sm:h-[min(94dvh,62rem)] sm:w-[min(96vw,88rem)] sm:rounded-[1.75rem] ${
          variant === "blog"
            ? "bg-[#fffaf6] dark:bg-zinc-950"
            : "bg-white dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.055),transparent_28%),linear-gradient(180deg,#111827,#0b1220)]"
        }`}
        role="dialog"
      >
        <button
          aria-label="Close editor"
          className="absolute top-3 right-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-950/85 dark:text-slate-300 dark:hover:border-cyan-300/45 dark:hover:bg-cyan-300/10 dark:hover:text-cyan-100"
          onClick={onClose}
          title="Close"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </section>
    </div>
  );
}
