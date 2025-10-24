import { REVALIDATE_TIME } from "@/constants";
import { unstable_cache } from "next/cache";
import { getCachedSignedUrl } from "./actions/storage";

/**
 * Fetch a signed URL with database-level caching and Next.js ISR caching
 * This provides two layers of caching:
 * 1. Database cache (via resource_urls table) - reduces SDK calls
 * 2. Next.js cache (unstable_cache) - reduces database calls
 *
 * @param path - Storage path
 * @returns Signed URL or null
 */
export const fetchStorageUrl = unstable_cache(
  async (path: string | null | undefined): Promise<string | null> => {
    if (!path) return null;

    try {
      // This function checks the DB cache first, then fetches from SDK if needed
      return await getCachedSignedUrl(path);
    } catch (error) {
      console.error("Error fetching storage URL:", error);
      return null;
    }
  },
  ["storage-url"], // Cache key prefix
  {
    revalidate: REVALIDATE_TIME, // Revalidate to check DB cache
    tags: ["storage-urls"], // Tag for on-demand revalidation
  },
);

/**
 * Batch fetch signed URLs with database-level and ISR caching
 * More efficient than fetching individually - uses batch operations at both levels
 */
export async function fetchStorageUrls(
  paths: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const validPaths = paths.filter((p): p is string => !!p);

  if (validPaths.length === 0) {
    return new Map<string, string>();
  }

  // Use the batch cached function for better performance
  // This will check DB cache for all paths, then batch-fetch missing ones from SDK
  const { batchGetCachedSignedUrls } = await import("./actions/storage");
  return await batchGetCachedSignedUrls(validPaths);
}

/**
 * Get a cache key for a specific storage path
 * Useful for manual cache invalidation
 */
export function getStorageCacheKey(path: string) {
  return ["storage-url", path];
}
