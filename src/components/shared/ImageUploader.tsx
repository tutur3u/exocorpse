import { useStorageUrl } from "@/hooks/useStorageUrl";
import {
  compressImage,
  formatBytes,
  getDataUrlSize,
} from "@/lib/imageCompression";
import { sanitizeFilename } from "@/lib/fileUtils";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useRef, useState } from "react";

type ImageUploaderProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File | null) => void; // NEW: Callback for when a file is selected (not uploaded yet)
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
  onFileSelect,
  helpText = "Enter image URL or upload a file",
  accept = "image/*",
  maxSizeMB = 50,
  uploadPath,
  enableUpload = true,
  onBeforeChange,
  disableUrlInput = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [pendingFile, setPendingFile] = useState<File | null>(null); // NEW: Store File object, not base64
  const [objectUrl, setObjectUrl] = useState<string | null>(null); // NEW: Object URL for preview
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Cleanup object URL on unmount or when it changes
  React.useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  // Check if the value is a pending sentinel
  const isPending = typeof value === "string" && value.startsWith("pending:");

  // Check if the value is a relative storage path (not a full URL, data URL, or pending sentinel)
  const isStoragePath =
    value &&
    !value.startsWith("http://") &&
    !value.startsWith("https://") &&
    !value.startsWith("data:") &&
    !isPending;

  // Use the hook to get the signed URL if it's a storage path
  const { signedUrl: displayUrl, loading: urlLoading } = useStorageUrl(
    isStoragePath ? value : null,
  );

  // Determine which URL to display (prioritize object URL for pending files)
  // Ignore preview/displayUrl for pending sentinels
  const imagePreviewUrl =
    objectUrl ||
    (!isPending && displayUrl) ||
    (!isPending && preview) ||
    (isStoragePath ? null : isPending ? null : value) ||
    null;

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

    // Clean up previous object URL if exists
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    // Create object URL for instant preview (NO BASE64 LAG!)
    const newObjectUrl = URL.createObjectURL(file);
    setObjectUrl(newObjectUrl);
    setPreview(null); // Clear old preview
    setPendingFile(file);

    // If uploadPath exists, upload immediately (editing existing entity)
    if (enableUpload && uploadPath) {
      setUploading(true);
      setUploadProgress(`Optimizing (${formatBytes(file.size)})...`);

      try {
        // Compress the image before upload
        const compressedDataUrl = await compressImage(file, {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 0.92,
          outputFormat: file.type === "image/png" ? "image/png" : "image/jpeg",
          skipCompressionUnder: 500 * 1024,
        });

        const compressedSize = getDataUrlSize(compressedDataUrl);
        const savings = file.size - compressedSize;
        const savingsPercent = Math.round((savings / file.size) * 100);

        if (savingsPercent > 10) {
          setUploadProgress(`Uploading (${savingsPercent}% smaller)...`);
        } else {
          setUploadProgress("Uploading...");
        }

        // Convert data URL back to File with sanitized filename
        const response = await fetch(compressedDataUrl);
        const blob = await response.blob();
        const sanitizedName = sanitizeFilename(file.name);
        const compressedFile = new File([blob], sanitizedName, {
          type: blob.type,
        });

        // Build full storage path
        const fullPath = `${uploadPath}/${sanitizedName}`;

        // Get signed upload URL from server
        const signedUrlResponse = await fetch(
          "/api/storage/signed-upload-url",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ path: fullPath }),
          },
        );

        if (!signedUrlResponse.ok) {
          const error = await signedUrlResponse.json();
          throw new Error(error.error || "Failed to get signed upload URL");
        }

        const { signedUrl, path } = await signedUrlResponse.json();

        // Upload directly to storage using signed URL (bypasses Next.js completely)
        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": compressedFile.type,
          },
          body: compressedFile,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }
        // Call onBeforeChange to delete the old image if it exists
        if (onBeforeChange && value) {
          try {
            setUploadProgress("Cleaning up...");
            await onBeforeChange(value, path);
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }

        // Store the storage path
        onChange(path);

        // Invalidate cache
        await queryClient.invalidateQueries({
          queryKey: ["storage-url", path],
        });
        await queryClient.invalidateQueries({
          queryKey: ["storage-urls-batch"],
          exact: false,
        });

        setPendingFile(null);
        setUploadProgress("Complete!");

        // Clean up object URL to free memory
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          setObjectUrl(null);
        }

        setTimeout(() => {
          setUploading(false);
          setUploadProgress(null);
        }, 1000);
      } catch (uploadError) {
        setError(
          uploadError instanceof Error ? uploadError.message : "Upload failed",
        );
        setUploading(false);
        setUploadProgress(null);
      }
    } else {
      // No uploadPath = creating new entity
      // Just store the file and notify parent via callback
      if (onFileSelect) {
        onFileSelect(file);
      }
      // Store a placeholder URL so form knows there's a pending upload
      onChange(`pending:${file.name}`);
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

    // Clean up object URL if exists
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }

    // Call onBeforeChange to delete the old image from storage if it exists
    if (onBeforeChange && value && !value.startsWith("pending:")) {
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
    setPendingFile(null);
    onChange("");
    setError(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileSelect) {
      onFileSelect(null);
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
          {uploading ? "Processing..." : "Upload Image"}
        </button>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="mt-2 rounded bg-blue-100 p-2 text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
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
            <span>{uploadProgress}</span>
          </div>
        </div>
      )}

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
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
