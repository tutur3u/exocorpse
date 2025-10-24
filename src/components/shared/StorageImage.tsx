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
};

/**
 * Image component that automatically handles tuturuuu storage paths
 * Fetches signed URLs with caching via React Query
 */
export default function StorageImage({
  src,
  fallback,
  alt,
  ...imageProps
}: StorageImageProps) {
  // Determine if this is a storage path (not a http/https URL or data URL)
  const isStoragePath =
    src &&
    !src.startsWith("http://") &&
    !src.startsWith("https://") &&
    !src.startsWith("data:");

  // Only fetch signed URL if it's a storage path
  const { signedUrl, loading, error } = useStorageUrl(
    isStoragePath ? src : null,
    !!src,
  );

  // Use signed URL for storage paths, otherwise use src directly
  const imageUrl = isStoragePath ? signedUrl : src;

  // Show fallback while loading or if there's an error
  if (loading || error || !imageUrl) {
    return (
      <>
        {fallback || (
          <div className="h-full w-full bg-gray-200 dark:bg-gray-700" />
        )}
      </>
    );
  }

  return <Image {...imageProps} src={imageUrl} alt={alt} />;
}
