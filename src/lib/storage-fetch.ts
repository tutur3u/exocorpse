import { REVALIDATE_TIME } from "@/constants";
import { unstable_cache } from "next/cache";
import { getSignedUrl } from "./actions/storage";

/**
 * Fetch a signed URL with Next.js ISR caching using unstable_cache
 * This provides automatic cache management and revalidation
 *
 * @param path - Storage path
 * @returns Signed URL or null
 */
export const fetchStorageUrl = unstable_cache(
  async (path: string | null | undefined): Promise<string | null> => {
    if (!path) return null;

    try {
      const signedUrlRevalidateTime = REVALIDATE_TIME - 100; // Revalidate 10 minutes before expiry
      // Call our server action to get the signed URL
      const result = await getSignedUrl(path, signedUrlRevalidateTime); // 6 hour expiration

      return result.success ? result.signedUrl : null;
    } catch (error) {
      console.error("Error fetching storage URL:", error);
      return null;
    }
  },
  ["storage-url"], // Cache key prefix
  {
    revalidate: REVALIDATE_TIME, // Revalidate before 6-hour expiry
    tags: ["storage-urls"], // Tag for on-demand revalidation
  },
);

/**
 * Batch fetch signed URLs with ISR caching
 * More efficient than fetching individually
 */
export async function fetchStorageUrls(
  paths: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const validPaths = paths.filter((p): p is string => !!p);
  const urlMap = new Map<string, string>();

  // Fetch all URLs in parallel - each will be cached individually
  const results = await Promise.all(
    validPaths.map(async (path) => {
      const url = await fetchStorageUrl(path);
      return { path, url };
    }),
  );

  for (const { path, url } of results) {
    if (url) {
      urlMap.set(path, url);
    }
  }

  return urlMap;
}

/**
 * Get a cache key for a specific storage path
 * Useful for manual cache invalidation
 */
export function getStorageCacheKey(path: string) {
  return ["storage-url", path];
}
