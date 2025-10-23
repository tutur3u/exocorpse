"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import type { BlacklistedUser } from "@/lib/actions/blacklist";

interface BlacklistFormProps {
  user?: BlacklistedUser | null;
  onSubmit: (data: { username: string; reasoning?: string }) => Promise<void>;
  onCancel: () => void;
}

type BlacklistFormData = {
  username: string;
  reasoning?: string;
};

export default function BlacklistForm({
  user,
  onSubmit,
  onCancel,
}: BlacklistFormProps) {
  const form = useForm<BlacklistFormData>({
    defaultValues: {
      username: user?.username || "",
      reasoning: user?.reasoning || "",
    },
  });

  const { register, handleSubmit: formHandleSubmit } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    try {
      if (!data.username.trim()) {
        alert("Username is required");
        return;
      }

      await onSubmit({
        username: data.username.trim(),
        reasoning: data.reasoning?.trim() || undefined,
      });
    } finally {
      setLoading(false);
    }
  });

  const handleBackdropClick = () => {
    handleExit(onCancel);
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleExit(onCancel);
    }
  };

  const handleCancelClick = () => {
    handleExit(onCancel);
  };

  return (
    <>
      <div
        className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        role="button"
        tabIndex={0}
        aria-label="Close form"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
      >
        <div
          className="animate-slideUp w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blacklist-form-title"
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            id="blacklist-form-title"
            className="mb-4 text-2xl font-bold text-gray-900 dark:text-white"
          >
            {user ? "Edit Blacklist Entry" : "Add to Blacklist"}
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter username"
                autoFocus
                {...register("username", { required: true })}
              />
            </div>

            <div>
              <label
                htmlFor="reasoning"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Reason for Blacklisting
              </label>
              <textarea
                id="reasoning"
                disabled={loading}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter reason (optional)"
                rows={4}
                {...register("reasoning")}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : user ? "Update" : "Add to Blacklist"}
              </button>
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <ConfirmExitDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
}
