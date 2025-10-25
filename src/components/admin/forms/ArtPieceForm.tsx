"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { ArtPiece } from "@/lib/actions/portfolio";
import { deleteArtworkImage } from "@/lib/actions/storage";
import { cleanFormData } from "@/lib/forms";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type ArtPieceFormData = {
  title: string;
  slug: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  year?: number;
  created_date?: string;
  tags?: string;
  is_featured?: boolean;
  artist_name?: string;
  artist_url?: string;
};

type ArtPieceFormProps = {
  artPiece?: ArtPiece;
  onSubmit: (data: ArtPieceFormData) => Promise<void>;
  onCancel: () => void;
};

export default function ArtPieceForm({
  artPiece,
  onSubmit,
  onCancel,
}: ArtPieceFormProps) {
  // Format date from database to YYYY-MM-DD
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Get form values from art piece data
  const getFormValues = (): ArtPieceFormData => ({
    title: artPiece?.title ?? "",
    slug: artPiece?.slug ?? "",
    description: artPiece?.description ?? "",
    image_url: artPiece?.image_url ?? "",
    thumbnail_url: artPiece?.thumbnail_url ?? "",
    year: artPiece?.year ?? undefined,
    created_date: formatDate(artPiece?.created_date) ?? "",
    tags: artPiece?.tags?.join(", ") ?? "",
    is_featured: artPiece?.is_featured ?? false,
    artist_name: artPiece?.artist_name ?? "",
    artist_url: artPiece?.artist_url ?? "",
  });

  const form = useForm<ArtPieceFormData>({
    defaultValues: getFormValues(),
  });

  const { register, handleSubmit: formHandleSubmit, setValue, watch, reset } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageUrl = watch("image_url");

  // Reset form when art piece changes to clear dirty state
  useEffect(() => {
    reset(getFormValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artPiece?.id, reset]);

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanData: ArtPieceFormData = cleanFormData(
        data,
        [
          "description",
          "thumbnail_url",
          "created_date",
          "tags",
          "artist_name",
          "artist_url",
        ],
        ["year"],
      );

      // Convert tags from comma-separated string to array
      const tagsArray = cleanData.tags
        ? cleanData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : undefined;

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
    if (!artPiece) {
      const slugValue = value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const finalSlug = slugValue || `art-${Date.now()}`;
      setValue("slug", finalSlug, { shouldDirty: true });
    }
  };

  // Handle image deletion
  const handleDeleteOldImage = async (oldPath: string | undefined) => {
    if (!oldPath) return;

    // Only delete if it's a storage path (not a full URL or data URL)
    if (
      !oldPath.startsWith("http") &&
      !oldPath.startsWith("data:") &&
      oldPath.includes("portfolio/art/")
    ) {
      try {
        await deleteArtworkImage(oldPath);
      } catch (err) {
        console.error("Error deleting old image:", err);
        // Don't throw - allow the upload to continue even if deletion fails
      }
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
          className="relative z-50 flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {artPiece ? "Edit Artwork" : "Add Artwork"}
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
          <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <ImageUploader
                  label="Artwork Image *"
                  value={imageUrl}
                  onChange={(value) => setValue("image_url", value, { shouldDirty: true })}
                  onBeforeChange={async (oldValue, newValue) => {
                    if (oldValue) await handleDeleteOldImage(oldValue);
                  }}
                  enableUpload={!!artPiece}
                  uploadPath={artPiece ? `portfolio/art/${artPiece.id}` : undefined}
                  disableUrlInput={true}
                  helpText={
                    artPiece
                      ? "Upload a new image to replace the current one"
                      : "Image upload will be available after creation. Please save the artwork first."
                  }
                />
              </div>

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
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className={`w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                    artPiece ? "cursor-not-allowed opacity-60" : ""
                  }`}
                  placeholder="url-friendly-slug"
                  readOnly={!!artPiece}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {artPiece
                    ? "Slug cannot be changed after creation"
                    : "Auto-generated from title"}
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Optional description (supports markdown)"
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
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Artist Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="artist_name"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Artist Name
                  </label>
                  <input
                    type="text"
                    id="artist_name"
                    {...register("artist_name")}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Artist name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="artist_url"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Artist URL
                  </label>
                  <input
                    type="url"
                    id="artist_url"
                    {...register("artist_url")}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
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
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="original, fanwork, commissioned (comma separated)"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Separate tags with commas (e.g., &quot;original&quot;,
                  &quot;fanwork&quot;, &quot;commissioned&quot;)
                </p>
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
                {loading ? "Saving..." : artPiece ? "Update" : "Create"}
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
