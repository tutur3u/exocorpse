/**
 * Hook for managing pending file uploads in forms
 */

import { useState } from "react";
import {
  uploadPendingFiles as uploadPendingFilesBulk,
  type PendingUpload,
} from "@/lib/uploadHelpers";

interface PendingFile {
  file: File;
  fieldName: string;
}

export function usePendingUploads() {
  const [pendingFiles, setPendingFiles] = useState<Map<string, File>>(
    new Map(),
  );
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const setPendingFile = (fieldName: string, file: File | null) => {
    setPendingFiles((prev) => {
      const next = new Map(prev);
      if (file) {
        next.set(fieldName, file);
      } else {
        next.delete(fieldName);
      }
      return next;
    });
  };

  const uploadPendingFiles = async (
    entityId: string,
    basePath: string,
    updateFn: (updates: Record<string, string>) => Promise<void>,
  ): Promise<boolean> => {
    if (pendingFiles.size === 0) return true;

    try {
      setUploadProgress(
        `Uploading ${pendingFiles.size} file${pendingFiles.size > 1 ? "s" : ""}...`,
      );

      // Build array of uploads for bulk helper
      const uploads: PendingUpload[] = Array.from(pendingFiles.entries()).map(
        ([fieldName, file]) => ({
          fieldName,
          file,
          uploadPath: basePath,
        }),
      );

      // Use bulk helper to upload all files concurrently
      const pathMap = await uploadPendingFilesBulk(uploads);

      // Convert Map to Record for updateFn
      const updates: Record<string, string> = {};
      pathMap.forEach((path, fieldName) => {
        updates[fieldName] = path;
      });

      setUploadProgress("Updating entity...");
      await updateFn(updates);

      setPendingFiles(new Map());
      setUploadProgress(null);
      return true;
    } catch (error) {
      console.error("Failed to upload files:", error);
      setUploadProgress(null);
      return false;
    }
  };

  const clearPendingFiles = () => {
    setPendingFiles(new Map());
    setUploadProgress(null);
  };

  return {
    pendingFiles,
    setPendingFile,
    uploadPendingFiles,
    uploadProgress,
    clearPendingFiles,
    hasPendingFiles: pendingFiles.size > 0,
  };
}
