/**
 * Image compression utilities for optimizing uploads
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, where 1 is highest quality
  outputFormat?: "image/jpeg" | "image/png" | "image/webp";
  skipCompressionUnder?: number; // Skip compression for files smaller than this (bytes)
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.65, // Higher quality - still compresses well
  outputFormat: "image/webp",
  skipCompressionUnder: 100 * 1024, // Skip files under 100KB
};

/**
 * Compress an image using Web Worker (non-blocking) or fallback to main thread
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise resolving to compressed image as data URL
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {},
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Skip compression for small files to save time, but still convert format if needed
  if (file.size < opts.skipCompressionUnder) {
    // If outputFormat is not the file's original format, still convert it
    if (opts.outputFormat !== file.type && file.type.startsWith("image/")) {
      return convertImageFormat(file, opts.outputFormat);
    }
    // Otherwise return as-is
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  // Try Web Worker first for non-blocking compression
  if (typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined") {
    try {
      return await compressImageWithWorker(file, opts);
    } catch (error) {
      console.warn(
        "Web Worker compression failed, falling back to main thread:",
        error,
      );
      // Fall through to main thread compression
    }
  }

  // Fallback to main thread compression
  return compressImageMainThread(file, opts);
}

/**
 * Convert an image to a different format without compression
 */
async function convertImageFormat(
  file: File,
  targetFormat: "image/webp" | "image/jpeg" | "image/png",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Create canvas with image's natural dimensions
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d", {
          alpha: targetFormat === "image/webp",
        });
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw the image without resizing
        ctx.drawImage(img, 0, 0);

        // Convert to target format
        try {
          const dataUrl = canvas.toDataURL(targetFormat, 1);
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress image using Web Worker (recommended - non-blocking)
 */
async function compressImageWithWorker(
  file: File,
  opts: Required<CompressionOptions>,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Read file first
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      // Create worker
      const worker = new Worker("/workers/imageCompressor.worker.js");

      worker.onmessage = (e) => {
        worker.terminate();
        if (e.data.success) {
          // Worker now returns a blob instead of dataUrl
          // Convert blob to data URL for compatibility
          const blobReader = new FileReader();
          blobReader.onloadend = () => {
            resolve(blobReader.result as string);
          };
          blobReader.onerror = () => {
            reject(new Error("Failed to convert blob to data URL"));
          };
          blobReader.readAsDataURL(e.data.blob);
        } else {
          reject(new Error(e.data.error));
        }
      };

      worker.onerror = (error) => {
        worker.terminate();
        reject(error);
      };

      // Send compression task to worker
      worker.postMessage({ dataUrl, options: opts });
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image on main thread (fallback)
 */
async function compressImageMainThread(
  file: File,
  opts: Required<CompressionOptions>,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const aspectRatio = width / height;

        // Only resize if actually needed
        const needsResize = width > opts.maxWidth || height > opts.maxHeight;

        if (needsResize) {
          if (width > opts.maxWidth) {
            width = opts.maxWidth;
            height = width / aspectRatio;
          }

          if (height > opts.maxHeight) {
            height = opts.maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", {
          alpha: opts.outputFormat === "image/png",
        });
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed data URL
        try {
          const compressedDataUrl = canvas.toDataURL(
            opts.outputFormat,
            opts.quality,
          );
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get the size of a data URL in bytes
 * @param dataUrl - The data URL to measure
 * @returns Size in bytes
 */
export function getDataUrlSize(dataUrl: string): number {
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64 = dataUrl.split(",")[1];
  if (!base64) return 0;

  // Calculate size: base64 is ~1.37x the binary size
  return Math.floor((base64.length * 3) / 4);
}

/**
 * Format bytes to human-readable string
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}
