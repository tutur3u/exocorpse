"use client";

import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
};

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    dialogRef.current?.close();
    onConfirm();
  };

  const handleCancel = () => {
    dialogRef.current?.close();
    onCancel();
  };

  // Prevent closing on backdrop click - force user to make a choice
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!isInDialog) {
      e.preventDefault();
    }
  };

  const confirmButtonClass = isDangerous
    ? "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
    : "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700";

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className="fixed inset-0 m-auto w-full max-w-md rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/50 dark:bg-gray-800"
    >
      <div className="w-full p-6">
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mb-6 text-gray-700 dark:text-gray-300">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={confirmButtonClass}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * @deprecated Use ConfirmDialog instead. It now handles both deletion and exit scenarios.
 * For exit dialogs, use isDangerous={true} and customize the title/message/buttons.
 */
export function ConfirmExitDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Unsaved Changes",
  message = "You have unsaved changes. Are you sure you want to exit? All changes will be lost.",
}: Omit<ConfirmDialogProps, "isDangerous" | "confirmText" | "cancelText">) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
      title={title}
      message={message}
      confirmText="Exit & Discard"
      cancelText="Stay"
      isDangerous={true}
    />
  );
}
