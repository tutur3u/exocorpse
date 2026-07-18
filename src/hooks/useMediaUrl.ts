"use client";

/**
 * Tuturuuu delivery already exposes versioned, CDN-cacheable asset URLs.
 * These compatibility hooks keep existing media components synchronous while
 * the branded editors move away from legacy storage paths.
 */
export function useMediaUrl(value: string | null | undefined) {
  return {
    error: null,
    loading: false,
    refetch: async () => ({ data: value ?? null }),
    signedUrl: value ?? null,
  };
}

export function useBatchMediaUrls(values: (string | null | undefined)[]) {
  const signedUrls = new Map<string, string>();
  for (const value of values) {
    if (value) signedUrls.set(value, value);
  }
  return {
    error: null,
    loading: false,
    refetch: async () => ({ data: signedUrls }),
    signedUrls,
  };
}

export function useIndividualMediaUrls(values: (string | null | undefined)[]) {
  return useBatchMediaUrls(values);
}
