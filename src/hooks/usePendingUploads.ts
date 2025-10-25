/**
 * Hook for managing pending file uploads in forms
 */

import { useState } from "react";
import { uploadPendingFile } from "@/lib/uploadHelpers";

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
      const updates: Record<string, string> = {};
      const fileEntries = Array.from(pendingFiles.entries());

      for (let i = 0; i < fileEntries.length; i++) {
        const [fieldName, file] = fileEntries[i];
        setUploadProgress(
          `Uploading ${fieldName} (${i + 1}/${fileEntries.length})...`,
        );

        const uploadedPath = await uploadPendingFile(file, basePath);
        updates[fieldName] = uploadedPath;
      }

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
