"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { deleteCharacterGalleryImage } from "@/lib/actions/storage";
import { cleanFormData } from "@/lib/forms";
import type { Tables } from "../../../../supabase/types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type CharacterGalleryItem = Tables<"character_gallery">;

type GalleryItemFormData = {
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  artist_name?: string;
  artist_url?: string;
  commission_date?: string;
  tags?: string;
  is_featured?: boolean;
};

type GalleryItemFormProps = {
  characterId: string;
  galleryItem?: CharacterGalleryItem;
  onSubmit: (data: GalleryItemFormData) => Promise<void>;
  onCancel: () => void;
};

export default function GalleryItemForm({
  characterId,
  galleryItem,
  onSubmit,
  onCancel,
}: GalleryItemFormProps) {
  // Format date from database to YYYY-MM-DD
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString.length < 10) return "";

    // If already in YYYY-MM-DD or ISO format, extract the date portion
    if (dateString[4] === "-" && dateString[7] === "-") {
      return dateString.slice(0, 10);
    }

    // Otherwise, parse and format using local date to avoid timezone skew
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get form values from gallery item data
  const getFormValues = (): GalleryItemFormData => ({
    title: galleryItem?.title ?? "",
    description: galleryItem?.description ?? "",
    image_url: galleryItem?.image_url ?? "",
    thumbnail_url: galleryItem?.thumbnail_url ?? "",
    artist_name: galleryItem?.artist_name ?? "",
    artist_url: galleryItem?.artist_url ?? "",
    commission_date: formatDate(galleryItem?.commission_date) ?? "",
    tags: galleryItem?.tags?.join(", ") ?? "",
    is_featured: galleryItem?.is_featured ?? false,
  });

  const form = useForm<GalleryItemFormData>({
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

  const imageUrl = watch("image_url");

  // Reset form when gallery item changes to clear dirty state
  useEffect(() => {
    reset(getFormValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryItem?.id, reset]);

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanData: GalleryItemFormData = cleanFormData(data, [
        "description",
        "thumbnail_url",
        "artist_name",
        "artist_url",
        "commission_date",
        "tags",
      ]);

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

  // Handle image deletion
  const handleDeleteOldImage = async (oldPath: string | undefined) => {
    if (!oldPath) return;

    // Only delete if it's a storage path (not a full URL or data URL)
    if (
      !oldPath.startsWith("http") &&
      !oldPath.startsWith("data:") &&
      oldPath.includes("characters/")
    ) {
      try {
        await deleteCharacterGalleryImage(oldPath);
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
        className="fixed inset-0 z-[60] flex h-screen w-screen items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
      >
        <div
          className="relative z-[70] flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {galleryItem ? "Edit Gallery Item" : "Add Gallery Item"}
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

              {/* Image Upload */}
              <div>
                <ImageUploader
                  label="Gallery Image *"
                  value={imageUrl}
                  onChange={(value) =>
                    setValue("image_url", value, { shouldDirty: true })
                  }
                  onBeforeChange={async (oldValue, newValue) => {
                    if (oldValue) await handleDeleteOldImage(oldValue);
                  }}
                  enableUpload={!!galleryItem}
                  uploadPath={
                    galleryItem && characterId
                      ? `characters/${characterId}/gallery`
                      : undefined
                  }
                  disableUrlInput={!!galleryItem}
                  helpText={
                    galleryItem
                      ? "Upload a new image to replace the current one"
                      : "Enter an image URL. Upload will be available after creation."
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
                  {...register("title", { required: true })}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter title"
                />
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
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Optional description of the artwork"
                />
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
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Commission Date */}
              <div>
                <label
                  htmlFor="commission_date"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Commission Date
                </label>
                <input
                  type="date"
                  id="commission_date"
                  {...register("commission_date")}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
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
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="full body, portrait, action (comma separated)"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Separate tags with commas
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
                  Featured
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
                {loading ? "Saving..." : galleryItem ? "Update" : "Create"}
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
