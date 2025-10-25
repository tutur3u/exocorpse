"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { WritingPiece } from "@/lib/actions/portfolio";
import { cleanFormData } from "@/lib/forms";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type WritingPieceFormData = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  year?: number;
  created_date?: string;
  tags?: string;
  is_featured?: boolean;
  word_count?: number;
};

type WritingPieceFormProps = {
  writingPiece?: WritingPiece;
  onSubmit: (data: WritingPieceFormData) => Promise<void>;
  onCancel: () => void;
};

export default function WritingPieceForm({
  writingPiece,
  onSubmit,
  onCancel,
}: WritingPieceFormProps) {
  // Format date from database to YYYY-MM-DD
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Get form values from writing piece data
  const getFormValues = (): WritingPieceFormData => ({
    title: writingPiece?.title ?? "",
    slug: writingPiece?.slug ?? "",
    excerpt: writingPiece?.excerpt ?? "",
    content: writingPiece?.content ?? "",
    year: writingPiece?.year ?? undefined,
    created_date: formatDate(writingPiece?.created_date) ?? "",
    tags: writingPiece?.tags?.join(", ") ?? "",
    is_featured: writingPiece?.is_featured ?? false,
    word_count: writingPiece?.word_count ?? undefined,
  });

  const form = useForm<WritingPieceFormData>({
    defaultValues: getFormValues(),
  });

  const {
    register,
    handleSubmit: formHandleSubmit,
    setValue,
    watch,
    reset,
  } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = watch("content");

  // Reset form when writing piece changes to clear dirty state
  useEffect(() => {
    reset(getFormValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writingPiece?.id, reset]);

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanData: WritingPieceFormData = cleanFormData(
        data,
        ["excerpt", "created_date", "tags"],
        ["year", "word_count"],
      );

      // Convert tags from comma-separated string to array
      const tagsArray = cleanData.tags
        ? cleanData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : undefined;

      // Auto-calculate word count if not provided
      if (!cleanData.word_count && cleanData.content) {
        const wordCount = cleanData.content
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;
        cleanData.word_count = wordCount;
      }

      await onSubmit({
        ...cleanData,
        tags: tagsArray?.join(", "),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  });

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setValue("title", value, { shouldDirty: true });
    if (!writingPiece) {
      const slugValue = value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const finalSlug = slugValue || `writing-${Date.now()}`;
      setValue("slug", finalSlug, { shouldDirty: true });
    }
  };

  const handleBackdropClick = () => {
    handleExit(onCancel);
  };

  const handleCancelClick = () => {
    handleExit(onCancel);
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleExit(onCancel);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
      >
        <div
          className="relative z-50 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {writingPiece ? "Edit Writing" : "Add Writing"}
            </h2>
            <button
              type="button"
              onClick={handleCancelClick}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleFormSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("title", {
                    required: true,
                    onChange: (e) => handleTitleChange(e.target.value),
                  })}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter title"
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  {...register("slug", { required: true })}
                  className={`w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                    writingPiece ? "cursor-not-allowed opacity-60" : ""
                  }`}
                  placeholder="url-friendly-slug"
                  readOnly={!!writingPiece}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {writingPiece
                    ? "Slug cannot be changed after creation"
                    : "Auto-generated from title"}
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label
                  htmlFor="excerpt"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  {...register("excerpt")}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Short excerpt or summary"
                />
              </div>

              {/* Content */}
              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Content * (Markdown)
                </label>
                <MarkdownEditor
                  value={content}
                  onChange={(value) => setValue("content", value)}
                  placeholder="Write your content here... (supports markdown)"
                />
              </div>

              {/* Year and Date */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="year"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Year
                  </label>
                  <input
                    type="number"
                    id="year"
                    {...register("year", {
                      valueAsNumber: true,
                      min: 1900,
                      max: 2100,
                    })}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="2024"
                  />
                </div>

                <div>
                  <label
                    htmlFor="created_date"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Created Date
                  </label>
                  <input
                    type="date"
                    id="created_date"
                    {...register("created_date")}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Tags and Word Count */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label
                    htmlFor="tags"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    {...register("tags")}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="original, fanwork, commissioned (comma separated)"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Separate tags with commas
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="word_count"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Word Count
                  </label>
                  <input
                    type="number"
                    id="word_count"
                    {...register("word_count", {
                      valueAsNumber: true,
                      min: 0,
                    })}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Auto"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Leave empty to auto-calculate
                  </p>
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  {...register("is_featured")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label
                  htmlFor="is_featured"
                  className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Featured (show in rotating gallery)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancelClick}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? "Saving..." : writingPiece ? "Update" : "Create"}
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
