"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { Style } from "@/lib/actions/commissions";
import { cleanFormData } from "@/lib/forms";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

type StyleFormData = {
  service_id: string;
  name: string;
  slug: string;
  description?: string;
};

type StyleFormProps = {
  serviceId: string;
  style?: Style;
  onSubmit: (data: StyleFormData) => Promise<Style | void>;
  onComplete: () => void;
  onCancel: () => void;
};

export default function StyleForm({
  serviceId,
  style,
  onSubmit,
  onComplete,
  onCancel,
}: StyleFormProps) {
  const form = useForm<StyleFormData>({
    defaultValues: {
      service_id: serviceId,
      name: style?.name || "",
      slug: style?.slug || "",
      description: style?.description || "",
    },
  });

  const { register, handleSubmit: formHandleSubmit, setValue } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setValue("name", value, { shouldDirty: true });
    if (!style) {
      const slugValue = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", slugValue, { shouldDirty: true });
    }
  };

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Ensure slug exists; generate from name if not provided
      const computedSlug =
        data.slug && data.slug.trim().length > 0
          ? data.slug
          : data.name
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-");

      const withSlug: StyleFormData = { ...data, slug: computedSlug };

      // Clean up empty strings to undefined
      const cleanData: StyleFormData = cleanFormData(
        withSlug,
        ["description"],
        [],
      );

      // Submit the style data
      await onSubmit(cleanData);

      // All done - close the form and refresh
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  });

  const handleBackdropClick = () => {
    handleExit(onCancel);
  };

  const handleCancelClick = () => {
    handleExit(onCancel);
  };

  const handleBackdropKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleExit(onCancel);
    }
  };

  return (
    <>
      <div
        className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        role="button"
        tabIndex={0}
        aria-label="Close and discard changes"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
      >
        <div
          className="animate-slideUp flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="style-form-title"
        >
          <div className="px-6 pt-6 pb-4">
            <h2 id="style-form-title" className="text-2xl font-bold">
              {style ? "Edit Style" : "Create New Style"}
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="flex flex-1 flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Style Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name", { required: true })}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Anime Style, Realistic, Chibi"
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  {...register("slug", { required: true })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="chibi-style"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  URL-friendly identifier (auto-generated from name for new
                  styles)
                </p>
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
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe this style option..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Explain what makes this style unique and any specific
                  characteristics
                </p>
              </div>

              <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex">
                  <div className="shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      role="img"
                      aria-labelledby="info-icon-title"
                    >
                      <title id="info-icon-title">Info Icon</title>
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      After creating a style, you can upload example pictures to
                      showcase it.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-300 bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-gray-900">
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={loading}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? "Saving..." : style ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmExitDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
}
