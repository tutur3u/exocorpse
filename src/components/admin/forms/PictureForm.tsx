"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { usePendingUploads } from "@/hooks/usePendingUploads";
import type { Picture } from "@/lib/actions/commissions";
import { updatePicture } from "@/lib/actions/commissions";
import { deleteFile } from "@/lib/actions/storage";
import { cleanFormData } from "@/lib/forms";
import { useState } from "react";
import { useForm } from "react-hook-form";

type PictureFormData = {
  service_id: string;
  style_id?: string | null;
  image_url: string;
  caption?: string;
  is_primary_example: boolean;
};

type PictureFormProps = {
  serviceId: string;
  styleId?: string | null;
  picture?: Picture;
  onSubmit: (data: PictureFormData) => Promise<Picture | void>;
  onComplete: () => void;
  onCancel: () => void;
};

export default function PictureForm({
  serviceId,
  styleId,
  picture,
  onSubmit,
  onComplete,
  onCancel,
}: PictureFormProps) {
  const {
    setPendingFile,
    uploadPendingFiles,
    uploadProgress,
    hasPendingFiles,
  } = usePendingUploads();

  const form = useForm<PictureFormData>({
    defaultValues: {
      service_id: serviceId,
      style_id: styleId || null,
      image_url: picture?.image_url || "",
      caption: picture?.caption || "",
      is_primary_example: picture?.is_primary_example ?? false,
    },
  });

  const { register, handleSubmit: formHandleSubmit, setValue, watch } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageUrl = watch("image_url");
  const isPrimary = watch("is_primary_example");

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanData: PictureFormData = cleanFormData(data, ["caption"], []);

      // Submit the picture data
      const result = await onSubmit(cleanData);

      // If we got a result and have pending files, upload them
      if (result && hasPendingFiles) {
        const uploadPath = styleId
          ? `commissions/styles/${styleId}/pictures`
          : `commissions/services/${serviceId}/pictures`;

        const uploadSuccess = await uploadPendingFiles(
          result.picture_id,
          uploadPath,
          async (updates) => {
            await updatePicture(result.picture_id, updates);
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

  // Helper function to delete old image from storage
  const handleDeleteOldImage = async (oldValue: string, newValue: string) => {
    // Only delete if:
    // 1. The old value exists and is a storage path (not a URL or data URL)
    // 2. The new value is different from the old value
    // 3. The old value is not a full URL (starts with http/https) or data URL
    if (
      oldValue &&
      oldValue !== newValue &&
      !oldValue.startsWith("http://") &&
      !oldValue.startsWith("https://") &&
      !oldValue.startsWith("data:")
    ) {
      try {
        await deleteFile(oldValue);
      } catch (error) {
        console.error("Failed to delete old image:", error);
        // Don't throw - we still want to allow the new image to be set
      }
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
          aria-labelledby="picture-form-title"
        >
          <div className="px-6 pt-6 pb-4">
            <h2 id="picture-form-title" className="text-2xl font-bold">
              {picture ? "Edit Picture" : "Upload New Picture"}
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

              {/* Image Upload */}
              <ImageUploader
                label="Example Image"
                value={imageUrl}
                onChange={(value) =>
                  setValue("image_url", value, { shouldDirty: true })
                }
                onFileSelect={(file) => setPendingFile("image_url", file)}
                uploadPath={
                  picture
                    ? styleId
                      ? `commissions/styles/${styleId}/pictures`
                      : `commissions/services/${serviceId}/pictures`
                    : undefined
                }
                onBeforeChange={handleDeleteOldImage}
                helpText={
                  styleId
                    ? "Upload an example image for this style"
                    : "Upload an example image for this service"
                }
              />

              {/* Caption */}
              <div>
                <label
                  htmlFor="caption"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Caption
                </label>
                <textarea
                  id="caption"
                  {...register("caption")}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Add a description or context for this example..."
                />
              </div>

              {/* Is Primary Example */}
              <div className="rounded-md border border-gray-300 p-4 dark:border-gray-600">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      id="is_primary_example"
                      {...register("is_primary_example")}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="is_primary_example"
                      className="font-medium text-gray-700 dark:text-gray-300"
                    >
                      Primary Example
                    </label>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      {isPrimary
                        ? "This will be the featured example for this style"
                        : "Mark this as the main showcase image for this style"}
                    </p>
                  </div>
                </div>
                {isPrimary && (
                  <div className="mt-3 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                    <div className="flex">
                      <div className="shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>
                          Setting this as primary will unset the current primary
                          example for this style.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {hasPendingFiles && (
                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex">
                    <div className="shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1 text-sm text-blue-700 dark:text-blue-300">
                      <p>
                        {uploadProgress ||
                          "Images will be uploaded after saving..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                {loading ? "Saving..." : picture ? "Update" : "Upload"}
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
