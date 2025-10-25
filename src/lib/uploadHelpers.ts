/**
 * Helper utilities for handling deferred image uploads
 */

import { compressImage } from "./imageCompression";
import { sanitizeFilename } from "./fileUtils";

export interface PendingUpload {
  file: File;
  uploadPath: string;
  fieldName: string;
}

/**
 * Upload a pending file to storage using FormData API route
 * @param file - The File object to upload
 * @param uploadPath - Storage path (e.g., "portfolio/art/123")
 * @returns Storage path of uploaded file
 */
export async function uploadPendingFile(
  file: File,
  uploadPath: string,
): Promise<string> {
  // Compress the image and convert back to File
  const compressedDataUrl = await compressImage(file, {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.92,
    outputFormat: file.type === "image/png" ? "image/png" : "image/jpeg",
    skipCompressionUnder: 500 * 1024,
  });

  // Convert data URL back to File with sanitized filename
  const response = await fetch(compressedDataUrl);
  const blob = await response.blob();
  const sanitizedName = sanitizeFilename(file.name);
  const compressedFile = new File([blob], sanitizedName, { type: blob.type });

  // Upload via FormData API route
  const formData = new FormData();
  formData.append("file", compressedFile);
  formData.append("path", uploadPath);

  const uploadResponse = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.json();
    throw new Error(error.error || "Failed to upload file");
  }

  const result = await uploadResponse.json();

  if (!result.success) {
    throw new Error("Failed to upload file");
  }

  return result.path;
}

/**
 * Upload multiple pending files concurrently
 * @param uploads - Array of pending uploads
 * @returns Map of field names to storage paths
 */
export async function uploadPendingFiles(
  uploads: PendingUpload[],
): Promise<Map<string, string>> {
  const results = await Promise.all(
    uploads.map(async ({ file, uploadPath, fieldName }) => {
      try {
        const path = await uploadPendingFile(file, uploadPath);
        return { fieldName, path, success: true };
      } catch (error) {
        console.error(`Failed to upload ${fieldName}:`, error);
        return { fieldName, path: "", success: false };
      }
    }),
  );

  const pathMap = new Map<string, string>();
  for (const result of results) {
    if (result.success && result.path) {
      pathMap.set(result.fieldName, result.path);
    }
  }

  return pathMap;
}
