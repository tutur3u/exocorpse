"use client";

import { batchGetSignedUrls, getSignedUrl } from "@/lib/actions/storage";
import { useQueries, useQuery } from "@tanstack/react-query";

/**
 * Hook to get a signed URL for a storage file with automatic caching via React Query
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
      const result = await getSignedUrl(path, 21600); // 6 hour expiration
      return result.success ? result.signedUrl : null;
    },
    enabled: !!path && enabled,
    // Cache for 50 minutes (before the 6 hour signed URL expires)
    staleTime: 50 * 60 * 1000,
    // Keep in cache for 6 hours
    gcTime: 6 * 60 * 60 * 1000,
    // Retry once on failure
    retry: 1,
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
 * Uses React Query's batch capabilities for optimal performance
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

      const results = await batchGetSignedUrls(validPaths, 21600); // 6 hour expiration
      const urlMap = new Map<string, string>();

      for (const result of results) {
        if (result.success && result.signedUrl) {
          urlMap.set(result.path, result.signedUrl);
        }
      }

      return urlMap;
    },
    enabled: validPaths.length > 0 && enabled,
    // Cache for 50 minutes (before the 6 hour signed URL expires)
    staleTime: 50 * 60 * 1000,
    // Keep in cache for 6 hours
    gcTime: 6 * 60 * 60 * 1000,
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
        const result = await getSignedUrl(path, 3600);
        return result.success ? result.signedUrl : null;
      },
      enabled,
      staleTime: 50 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
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
