"use client";

import ColorPicker from "@/components/shared/ColorPicker";
import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { usePendingUploads } from "@/hooks/usePendingUploads";
import { deleteCharacterOutfitImage } from "@/lib/actions/storage";
import { updateCharacterOutfit } from "@/lib/actions/wiki";
import { cleanFormData } from "@/lib/forms";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Tables } from "../../../../supabase/types";

type CharacterOutfitItem = Tables<"character_outfits">;

type OutfitItemFormData = {
  name: string;
  description?: string;
  image_url?: string;
  reference_images?: string;
  color_palette?: string;
  notes?: string;
  is_default?: boolean;
  outfit_type_id?: string;
};

type OutfitItemSubmitData = {
  name: string;
  description?: string;
  image_url?: string;
  reference_images?: string[];
  color_palette?: string;
  notes?: string;
  is_default?: boolean;
  outfit_type_id?: string;
};

type OutfitItemFormProps = {
  characterId: string;
  outfitItem?: CharacterOutfitItem;
  onSubmit: (
    data: OutfitItemSubmitData,
  ) => Promise<CharacterOutfitItem | void>;
  onComplete: () => void;
  onCancel: () => void;
};

export default function OutfitItemForm({
  characterId,
  outfitItem,
  onSubmit,
  onComplete,
  onCancel,
}: OutfitItemFormProps) {
  const {
    setPendingFile,
    uploadPendingFiles,
    uploadProgress,
    hasPendingFiles,
  } = usePendingUploads();

  // Get form values from outfit item data
  const getFormValues = (): OutfitItemFormData => ({
    name: outfitItem?.name ?? "",
    description: outfitItem?.description ?? "",
    image_url: outfitItem?.image_url ?? "",
    reference_images: outfitItem?.reference_images?.join(", ") ?? "",
    color_palette: outfitItem?.color_palette ?? "",
    notes: outfitItem?.notes ?? "",
    is_default: outfitItem?.is_default ?? false,
    outfit_type_id: outfitItem?.outfit_type_id ?? "",
  });

  const form = useForm<OutfitItemFormData>({
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
  const colorPalette = watch("color_palette");

  // Reset form when outfit item changes to clear dirty state
  useEffect(() => {
    reset(getFormValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outfitItem?.id, reset]);

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanData: OutfitItemFormData = cleanFormData(data, [
        "description",
        "image_url",
        "reference_images",
        "color_palette",
        "notes",
        "outfit_type_id",
      ]);

      // Convert reference_images from comma-separated string to array
      const referenceImagesArray = cleanData.reference_images
        ? cleanData.reference_images
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url.length > 0)
        : undefined;

      const submitData: OutfitItemSubmitData = {
        ...cleanData,
        reference_images: referenceImagesArray,
      };

      // Submit the outfit item data
      const result = await onSubmit(submitData);

      // If we got a result and have pending files, upload them
      if (result && hasPendingFiles) {
        const uploadSuccess = await uploadPendingFiles(
          result.id,
          `characters/${characterId}/outfits`,
          async (updates) => {
            await updateCharacterOutfit(result.id, updates);
          },
        );

        if (!uploadSuccess) {
          setError("Failed to upload images. Please try again.");
          setLoading(false);
          return;
        }
      }

      // All done - close the form and refresh
      onComplete();
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
        await deleteCharacterOutfitImage(oldPath);
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
        className="fixed inset-0 z-60 flex h-screen w-screen items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
      >
        <div
          className="relative z-70 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {outfitItem ? "Edit Outfit" : "Add Outfit"}
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

              {/* Upload Progress */}
              {uploadProgress && (
                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {uploadProgress}
                    </p>
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <ImageUploader
                  label="Outfit Image"
                  value={imageUrl || ""}
                  onChange={(value) =>
                    setValue("image_url", value, { shouldDirty: true })
                  }
                  onFileSelect={(file) => setPendingFile("image_url", file)}
                  onBeforeChange={async (oldValue, newValue) => {
                    if (oldValue && oldValue !== newValue)
                      await handleDeleteOldImage(oldValue);
                  }}
                  enableUpload={!!outfitItem}
                  uploadPath={
                    outfitItem && characterId
                      ? `characters/${characterId}/outfits`
                      : undefined
                  }
                  disableUrlInput={!!outfitItem}
                  helpText={
                    outfitItem
                      ? "Upload a new image to replace the current one"
                      : "Enter an image URL. Upload will be available after creation."
                  }
                />
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name", { required: true })}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter outfit name"
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
                  placeholder="Optional description of the outfit"
                />
              </div>

              {/* Color Palette */}
              <div>
                <ColorPicker
                  label="Color Palette"
                  value={colorPalette || ""}
                  onChange={(value) =>
                    setValue("color_palette", value, { shouldDirty: true })
                  }
                  helpText="Primary color for this outfit"
                />
              </div>

              {/* Reference Images */}
              <div>
                <label
                  htmlFor="reference_images"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Reference Images
                </label>
                <input
                  type="text"
                  id="reference_images"
                  {...register("reference_images")}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/ref1.jpg, https://example.com/ref2.jpg"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Separate multiple URLs with commas
                </p>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  {...register("notes")}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Additional notes about the outfit"
                />
              </div>

              {/* Default Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  {...register("is_default")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label
                  htmlFor="is_default"
                  className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Set as default outfit
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
                {loading ? "Saving..." : outfitItem ? "Update" : "Create"}
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

