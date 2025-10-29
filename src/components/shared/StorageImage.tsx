"use client";

import { useStorageUrl } from "@/hooks/useStorageUrl";
import Image, { type ImageProps } from "next/image";

type StorageImageProps = Omit<ImageProps, "src"> & {
  /**
   * Storage path or regular URL
   * If it's a storage path (starts with characters/, worlds/, etc.), it will fetch a signed URL
   * Otherwise, it will use the URL directly
   */
  src: string | null | undefined;
  /**
   * Fallback component to render while loading or on error
   */
  fallback?: React.ReactNode;
  /**
   * Pre-fetched signed URL to use instead of fetching it
   * This is useful when batch fetching URLs for better performance
   */
  signedUrl?: string | null;
  /**
   * Image width - defaults to 500 if not provided
   */
  width?: number;
  /**
   * Image height - defaults to 500 if not provided
   */
  height?: number;
};

/**
 * Image component that automatically handles tuturuuu storage paths
 * Fetches signed URLs with caching via React Query
 */
export default function StorageImage({
  src,
  fallback,
  alt,
  signedUrl: preFetchedSignedUrl,
  ...imageProps
}: StorageImageProps) {
  // Determine if this is a storage path (not a http/https URL or data URL)
  const isStoragePath =
    src &&
    !src.startsWith("http://") &&
    !src.startsWith("https://") &&
    !src.startsWith("data:");

  // Only fetch signed URL if it's a storage path AND no pre-fetched URL was provided
  const shouldFetchUrl = isStoragePath && !preFetchedSignedUrl;
  const {
    signedUrl: fetchedSignedUrl,
    loading,
    error,
  } = useStorageUrl(shouldFetchUrl ? src : null, !!src);

  // Use pre-fetched URL first, then fetched URL, then src directly
  const imageUrl =
    preFetchedSignedUrl || (isStoragePath ? fetchedSignedUrl : src);

  // Show fallback while loading (only if we're actually fetching) or if there's an error or no URL
  const isLoading = shouldFetchUrl && loading;
  if (isLoading || error || !imageUrl) {
    return (
      <>
        {fallback || (
          <div className="h-full w-full bg-gray-200 dark:bg-gray-700" />
        )}
      </>
    );
  }

  return <Image {...imageProps} src={imageUrl} alt={alt} unoptimized={true} />;
}
