"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { RelationshipType } from "@/lib/actions/wiki";
import { cleanFormData } from "@/lib/forms";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

type RelationshipTypeFormData = {
  name: string;
  description?: string;
  is_mutual?: boolean;
  reverse_name?: string;
};

type RelationshipTypeFormProps = {
  relationshipType?: RelationshipType;
  isOpen: boolean;
  onSubmit: (data: RelationshipTypeFormData) => Promise<void>;
  onComplete: () => void;
  onCancel: () => void;
};

export default function RelationshipTypeForm({
  relationshipType,
  isOpen,
  onSubmit,
  onComplete,
  onCancel,
}: RelationshipTypeFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RelationshipTypeFormData>({
    defaultValues: {
      name: relationshipType?.name || "",
      description: relationshipType?.description || "",
      is_mutual: relationshipType?.is_mutual ?? false,
      reverse_name: relationshipType?.reverse_name || "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = form;

  const { showConfirmDialog, handleExit, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const isMutual = watch("is_mutual");

  // Reset form when relationshipType changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: relationshipType?.name || "",
        description: relationshipType?.description || "",
        is_mutual: relationshipType?.is_mutual ?? false,
        reverse_name: relationshipType?.reverse_name || "",
      });
    }
  }, [relationshipType, isOpen, reset]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const onSubmitForm = async (data: RelationshipTypeFormData) => {
    setIsSubmitting(true);
    try {
      const cleanedData = cleanFormData(data);
      await onSubmit(cleanedData);
      dialogRef.current?.close();
      onComplete();
    } catch (error) {
      console.error("Error submitting relationship type:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    handleExit(() => {
      dialogRef.current?.close();
      onCancel();
    });
  };

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
      handleCancel();
    }
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        onKeyDown={handleBackdropKeyDown}
        onCancel={(e) => {
          e.preventDefault();
          handleCancel();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-0 m-auto h-fit max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/50 dark:bg-gray-800"
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <h2
              id={titleId}
              className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            >
              {relationshipType
                ? "Edit Relationship Type"
                : "Add Relationship Type"}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {relationshipType
                ? "Update the relationship type details"
                : "Create a new relationship type for character interactions"}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6 px-6 py-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name *
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
                placeholder="e.g., Parent, Friend, Rival"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                placeholder="Brief description of this relationship type..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Is Mutual Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="is_mutual"
                {...register("is_mutual")}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <div className="flex-1">
                <label
                  htmlFor="is_mutual"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mutual relationship
                </label>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  If checked, this relationship applies equally in both
                  directions (e.g., "friends" with each other)
                </p>
              </div>
            </div>

            {/* Reverse Name - only show if mutual */}
            {!isMutual && (
              <div>
                <label
                  htmlFor="reverse_name"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Reverse Name
                </label>
                <input
                  id="reverse_name"
                  type="text"
                  {...register("reverse_name")}
                  placeholder='e.g., "child" for "parent"'
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optional: name for the reverse relationship direction
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving..."
                  : relationshipType
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </div>
        </form>
      </dialog>

      <ConfirmExitDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
}
