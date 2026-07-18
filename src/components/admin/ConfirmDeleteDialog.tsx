"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  loading?: boolean;
}

export default function ConfirmDeleteDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  loading = false,
}: ConfirmDeleteDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] dark:bg-zinc-950"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3
              id="delete-dialog-title"
              className="font-serif text-xl font-semibold text-zinc-950 dark:text-white"
            >
              {title}
            </h3>
            <p
              id="delete-dialog-description"
              className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
            >
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Deleting…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
