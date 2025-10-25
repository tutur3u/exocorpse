import { useStorageUrl } from "@/hooks/useStorageUrl";
import { uploadFile } from "@/lib/actions/storage";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRef, useState } from "react";

type ImageUploaderProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helpText?: string;
  accept?: string;
  maxSizeMB?: number;
  uploadPath?: string; // Optional: storage path for uploads (e.g., "characters/123/profile")
  enableUpload?: boolean; // Whether to enable file uploads to storage (default: true)
  onBeforeChange?: (oldValue: string, newValue: string) => Promise<void>; // Optional: callback before changing value (e.g., to delete old image)
  disableUrlInput?: boolean; // Whether to disable the URL input field (default: false)
};

export default function ImageUploader({
  label,
  value,
  onChange,
  helpText = "Enter image URL or upload a file",
  accept = "image/*",
  maxSizeMB = 50,
  uploadPath,
  enableUpload = true,
  onBeforeChange,
  disableUrlInput = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Check if the value is a relative storage path (not a full URL or data URL)
  const isStoragePath =
    value &&
    !value.startsWith("http://") &&
    !value.startsWith("https://") &&
    !value.startsWith("data:");

  // Use the hook to get the signed URL if it's a storage path
  const { signedUrl: displayUrl, loading: urlLoading } = useStorageUrl(
    isStoragePath ? value : null,
  );

  // Determine which URL to display
  const imagePreviewUrl =
    displayUrl || preview || (isStoragePath ? null : value) || null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Read file as data URL for preview and upload
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);

        // If upload is enabled and uploadPath is provided, upload to storage
        if (enableUpload && uploadPath) {
          try {
            const result = await uploadFile(dataUrl, uploadPath, file.name);
            if (result.success) {
              // Call onBeforeChange to delete the old image if it exists
              if (onBeforeChange && value) {
                try {
                  await onBeforeChange(value, result.path);
                } catch (deleteError) {
                  console.error("Error deleting old image:", deleteError);
                  // Continue with the upload even if deletion fails
                }
              }

              // Store the storage path (not the signed URL)
              // We'll generate signed URLs when displaying
              onChange(result.path);

              // Invalidate the query cache for this path to fetch the new signed URL
              await queryClient.invalidateQueries({
                queryKey: ["storage-url", result.path],
              });

              // Also invalidate any batch queries that might include this path
              await queryClient.invalidateQueries({
                queryKey: ["storage-urls-batch"],
                exact: false,
              });

              setUploading(false);
            } else {
              throw new Error("Upload failed");
            }
          } catch (uploadError) {
            setError(
              uploadError instanceof Error
                ? uploadError.message
                : "Upload failed",
            );
            setUploading(false);
          }
        } else {
          // If upload is disabled, just use the data URL (for backwards compatibility)
          onChange(dataUrl);
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setPreview(url);
    onChange(url);
    setError(null);
  };

  const handleClear = async () => {
    // Show loading state while deleting
    setUploading(true);
    setError(null);

    // Call onBeforeChange to delete the old image from storage if it exists
    if (onBeforeChange && value) {
      try {
        await onBeforeChange(value, "");
      } catch (deleteError) {
        console.error("Error deleting image from storage:", deleteError);
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete image from storage. Please try again.",
        );
        setUploading(false);
        return; // Don't clear the field if deletion failed
      }
    }

    // Only clear the field after successful deletion
    setPreview(null);
    onChange("");
    setError(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>

      {/* URL Input */}
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={disableUrlInput}
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            disabled={uploading}
            className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
            title="Clear image and delete from storage"
          >
            {uploading ? "Deleting..." : "Clear"}
          </button>
        )}
      </div>

      {/* File Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${label}`}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 rounded bg-red-100 p-2 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Image Preview */}
      {imagePreviewUrl && (
        <div className="animate-fadeIn mt-3">
          <p className="mb-2 text-sm font-medium">Preview:</p>
          <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
            {urlLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-500">Loading image...</p>
              </div>
            ) : (
              <Image
                src={imagePreviewUrl}
                alt="Preview"
                fill
                className="object-contain"
                onError={() => {
                  setError("Failed to load image");
                  setPreview(null);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
}
