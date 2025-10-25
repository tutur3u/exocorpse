/**
 * Utility functions for file handling
 */

/**
 * Sanitize a filename by removing/replacing special characters
 * @param filename - Original filename
 * @returns Sanitized filename safe for storage
 */
export function sanitizeFilename(filename: string): string {
  // Extract extension
  const lastDotIndex = filename.lastIndexOf(".");
  const name = lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename;
  const ext = lastDotIndex > 0 ? filename.slice(lastDotIndex) : "";

  // Sanitize the name part:
  // - Replace spaces with underscores
  // - Remove special characters that cause issues: +, /, \, ?, %, *, :, |, ", <, >, #, &, etc.
  // - Keep alphanumeric, hyphens, underscores
  // - Collapse multiple underscores/hyphens into one
  // - Trim leading/trailing hyphens and underscores
  const sanitized = name
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[+/\\?%*:|"<>#&]/g, "") // Remove problematic characters
    .replace(/[^\w.-]/g, "_") // Replace any remaining non-word chars with underscore
    .replace(/[_-]+/g, "_") // Collapse multiple underscores/hyphens
    .replace(/^[_-]+|[_-]+$/g, "") // Trim leading/trailing separators
    .toLowerCase(); // Lowercase for consistency

  // Ensure we have a valid name (fallback if everything was removed)
  const finalName = sanitized || `file_${Date.now()}`;

  // Sanitize extension too (just in case)
  const sanitizedExt = ext.replace(/[^\w.]/g, "").toLowerCase();

  return finalName + sanitizedExt;
}
