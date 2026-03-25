"use client";

import { STORAGE_URL_GC_TIME, STORAGE_URL_STALE_TIME } from "@/constants";
import { useQueries, useQuery } from "@tanstack/react-query";

async function fetchSignedUrl(path: string): Promise<string | null> {
  const response = await fetch("/api/storage/share-batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paths: [path],
    }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error("Failed to generate signed URL");
  }

  const result = (await response.json()) as {
    data?: Array<{
      path: string;
      signedUrl?: string | null;
      error?: string | null;
    }>;
  };

  const item = result.data?.[0];
  if (!item || item.error) {
    return null;
  }

  return item.signedUrl ?? null;
}

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
        return await fetchSignedUrl(relativePath);
      } catch (error) {
        // Handle file not found and other errors gracefully
        console.warn(`Failed to get signed URL for ${path}:`, error);
        return null;
      }
    },
    enabled: !!path && enabled,
    // Cache for 6 days (1 day before storage URL expiration)
    staleTime: STORAGE_URL_STALE_TIME,
    // Keep in cache for 7 days
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
  const relativePaths = Array.from(
    new Set(validPaths.map((path) => extractRelativePath(path))),
  );

  // Use a single query for batch fetching - more efficient than useQueries for this case
  const query = useQuery({
    queryKey: ["storage-urls-batch", relativePaths.sort().join(",")],
    queryFn: async () => {
      if (validPaths.length === 0) return new Map<string, string>();

      const resolvedUrls = new Map<string, string>();
      let unresolvedPaths = [...relativePaths];

      try {
        const response = await fetch("/api/storage/share-batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paths: relativePaths,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate batch signed URLs");
        }

        const result = (await response.json()) as {
          data?: Array<{
            path: string;
            signedUrl?: string | null;
            error?: string | null;
          }>;
        };

        for (const item of result.data ?? []) {
          if (item.path && item.signedUrl && !item.error) {
            resolvedUrls.set(item.path, item.signedUrl);
          }
        }
      } catch (error) {
        console.warn(
          "Batch signed URL generation failed, falling back:",
          error,
        );
      }

      unresolvedPaths = unresolvedPaths.filter(
        (path) => !resolvedUrls.has(path),
      );

      if (unresolvedPaths.length > 0) {
        const fallbackResults = await Promise.all(
          unresolvedPaths.map(async (path) => ({
            path,
            signedUrl: await fetchSignedUrl(path),
          })),
        );

        for (const item of fallbackResults) {
          if (item.signedUrl) {
            resolvedUrls.set(item.path, item.signedUrl);
          }
        }
      }

      const aliasedUrls = new Map<string, string>();

      for (const originalPath of validPaths) {
        const relativePath = extractRelativePath(originalPath);
        const signedUrl = resolvedUrls.get(relativePath);

        if (!signedUrl) {
          continue;
        }

        aliasedUrls.set(relativePath, signedUrl);
        aliasedUrls.set(originalPath, signedUrl);
      }

      return aliasedUrls;
    },
    enabled: validPaths.length > 0 && enabled,
    // Cache for 6 days (1 day before storage URL expiration)
    staleTime: STORAGE_URL_STALE_TIME,
    // Keep in cache for 7 days
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
          return await fetchSignedUrl(relativePath);
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
