/**
 * Helper utilities for handling deferred image uploads
 */

import { getWebpFilename } from "./fileUtils";
import { compressImage } from "./imageCompression";

export interface PendingUpload {
  file: File;
  uploadPath: string;
  fieldName: string;
}

/**
 * Upload a pending file to storage using signed upload URL (direct upload to storage)
 * This completely bypasses Next.js for the file upload, avoiding all payload size limits
 * @param file - The File object to upload
 * @param uploadPath - Storage path directory (e.g., "portfolio/art/123")
 * @returns Storage path of uploaded file
 */
export async function uploadPendingFile(
  file: File,
  uploadPath: string,
): Promise<string> {
  // Compress the image and convert back to File
  // Always compress to webp format
  const compressedDataUrl = await compressImage(file, {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.65,
    outputFormat: "image/webp",
    skipCompressionUnder: 100 * 1024,
  });

  // Convert data URL back to File with sanitized filename and webp extension
  const response = await fetch(compressedDataUrl);
  const blob = await response.blob();
  const webpFilename = getWebpFilename(file.name);
  const compressedFile = new File([blob], webpFilename, { type: blob.type });

  // Build full storage path
  const fullPath = `${uploadPath}/${webpFilename}`;

  // Get signed upload URL from server
  const signedUrlResponse = await fetch("/api/storage/signed-upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path: fullPath }),
  });

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

  return path;
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
