"use client";

import { STORAGE_URL_GC_TIME, STORAGE_URL_STALE_TIME } from "@/constants";
import {
  batchGetCachedSignedUrls,
  getCachedSignedUrl,
} from "@/lib/actions/storage";
import { useQueries, useQuery } from "@tanstack/react-query";

/**
 * Extract the relative path from a full storage path
 * Full paths are in format: "{bucketId}/relative/path/to/file"
 * This extracts just "relative/path/to/file"
 */
function extractRelativePath(fullPath: string): string {
  // If it starts with a UUID (e.g., "e0ac1f6a-a275-432e-be3d-75d8ba92e6d5/"), extract after first slash
  const uuidPattern = /^[a-f0-9\-]{36}\//;
  if (uuidPattern.test(fullPath)) {
    return fullPath.substring(37); // 36 chars for UUID + 1 for slash
  }
  return fullPath;
}

/**
 * Hook to get a signed URL for a storage file with automatic caching via React Query
 * Uses database-level caching to reduce SDK API calls
 *
 * NOTE: For Server Components, use `fetchStorageUrl` from @/lib/storage-fetch instead
 * which leverages Next.js ISR caching with unstable_cache
 *
 * @param path - The storage path (e.g., "characters/123/profile/image.jpg")
 * @param enabled - Whether to fetch the URL (default: true)
 * @returns Object with signedUrl, loading state, and error from React Query
 */
export function useStorageUrl(path: string | null | undefined, enabled = true) {
  const query = useQuery({
    queryKey: ["storage-url", path],
    queryFn: async () => {
      if (!path) return null;
      try {
        // Extract relative path in case full path is provided
        const relativePath = extractRelativePath(path);
        // Use cached function which checks DB first, then fetches from SDK if needed
        return await getCachedSignedUrl(relativePath);
      } catch (error) {
        // Handle file not found and other errors gracefully
        console.warn(`Failed to get signed URL for ${path}:`, error);
        return null;
      }
    },
    enabled: !!path && enabled,
    // Cache for 23 hours (just before 1 day revalidation)
    staleTime: STORAGE_URL_STALE_TIME,
    // Keep in cache for 1 day (matches REVALIDATE_TIME)
    gcTime: STORAGE_URL_GC_TIME,
    // Don't retry on file not found errors
    retry: (failureCount, error) => {
      const errorMsg = String(error);
      if (
        errorMsg.includes("FILE_NOT_FOUND") ||
        errorMsg.includes("File not found")
      ) {
        return false; // Don't retry
      }
      return failureCount < 1; // Retry once for other errors
    },
  });

  return {
    signedUrl: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to get signed URLs for multiple storage files with batch fetching and caching
 * Uses database-level caching to reduce SDK API calls
 *
 * NOTE: For Server Components, use `fetchStorageUrls` from @/lib/storage-fetch instead
 *
 * @param paths - Array of storage paths
 * @param enabled - Whether to fetch the URLs (default: true)
 * @returns Object with signedUrls map, loading state, and error
 */
export function useBatchStorageUrls(
  paths: (string | null | undefined)[],
  enabled = true,
) {
  // Filter out null/undefined paths and get unique paths
  const validPaths = Array.from(new Set(paths.filter((p): p is string => !!p)));

  // Use a single query for batch fetching - more efficient than useQueries for this case
  const query = useQuery({
    queryKey: ["storage-urls-batch", validPaths.sort().join(",")],
    queryFn: async () => {
      if (validPaths.length === 0) return new Map<string, string>();

      // Extract relative paths in case full paths are provided
      const relativePaths = validPaths.map(extractRelativePath);
      // Use cached batch function which checks DB first, then batch-fetches from SDK if needed
      return await batchGetCachedSignedUrls(relativePaths);
    },
    enabled: validPaths.length > 0 && enabled,
    // Cache for 23 hours (just before 1 day revalidation)
    staleTime: STORAGE_URL_STALE_TIME,
    // Keep in cache for 1 day (matches REVALIDATE_TIME)
    gcTime: STORAGE_URL_GC_TIME,
    // Retry once on failure
    retry: 1,
  });

  return {
    signedUrls: query.data ?? new Map<string, string>(),
    loading: query.isLoading,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}

/**
 * Alternative: Hook using individual queries for each path (useful when paths change frequently)
 * React Query will dedupe and batch these automatically
 * Uses database-level caching to reduce SDK API calls
 */
export function useIndividualStorageUrls(
  paths: (string | null | undefined)[],
  enabled = true,
) {
  const validPaths = paths.filter((p): p is string => !!p);

  const queries = useQueries({
    queries: validPaths.map((path) => ({
      queryKey: ["storage-url", path],
      queryFn: async () => {
        try {
          const relativePath = extractRelativePath(path);
          // Use cached function which checks DB first, then fetches from SDK if needed
          return await getCachedSignedUrl(relativePath);
        } catch (error) {
          console.warn(`Failed to get signed URL for ${path}:`, error);
          return null;
        }
      },
      enabled,
      staleTime: STORAGE_URL_STALE_TIME,
      gcTime: STORAGE_URL_GC_TIME,
      retry: 1,
    })),
  });

  const signedUrls = new Map<string, string>();
  validPaths.forEach((path, index) => {
    const url = queries[index]?.data;
    if (url) {
      signedUrls.set(path, url);
    }
  });

  return {
    signedUrls,
    loading: queries.some((q) => q.isLoading),
    error: queries.find((q) => q.error)?.error
      ? String(queries.find((q) => q.error)?.error)
      : null,
  };
}
