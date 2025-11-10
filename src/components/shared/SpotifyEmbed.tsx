"use client";

import { useQuery } from "@tanstack/react-query";
import { memo, useEffect, useRef } from "react";

/**
 * Spotify oEmbed response type
 */
type SpotifyOEmbedResponse = {
  html: string;
  width: number;
  height: number;
  version: string;
  type: string;
  provider_name: string;
  provider_url: string;
  title?: string;
  thumbnail_url?: string;
};

/**
 * Fetch Spotify oEmbed data
 * This uses Spotify's oEmbed API to get embed information
 */
async function fetchSpotifyOEmbed(
  url: string,
): Promise<SpotifyOEmbedResponse | null> {
  try {
    const response = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as SpotifyOEmbedResponse;
  } catch {
    return null;
  }
}

/**
 * Validates a Spotify URL
 */
function isValidSpotifyUrl(url: string): boolean {
  const spotifyPattern =
    /^https?:\/\/(open\.|play\.)?spotify\.com\/(track|album|playlist|artist|episode|show)\/[a-zA-Z0-9]+(\?.*)?$/;
  return spotifyPattern.test(url.split("?")[0].split("#")[0].trim());
}

type SpotifySize = "compact" | "normal";

type SpotifyEmbedProps = {
  url: string;
  size?: SpotifySize;
  className?: string;
};

const SIZES: Record<SpotifySize, number> = {
  compact: 152,
  normal: 352,
};

function SpotifyEmbed({
  url,
  size = "normal",
  className = "",
}: SpotifyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const height = SIZES[size];

  // Validate URL
  const isValid = isValidSpotifyUrl(url);

  // Fetch oEmbed data using react-query for better caching and state management
  const {
    data: oembedData,
    isLoading,
    isError,
  } = useQuery<SpotifyOEmbedResponse | null>({
    queryKey: ["spotify-oembed", url],
    queryFn: () => fetchSpotifyOEmbed(url),
    enabled: isValid,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 1,
  });

  // Inject oEmbed HTML if available
  useEffect(() => {
    if (!oembedData || !containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Create a temporary div to parse the HTML
    const temp = document.createElement("div");
    temp.innerHTML = oembedData.html;

    // Append the iframe to the container
    const iframe = temp.querySelector("iframe");
    if (iframe && containerRef.current) {
      // Apply custom styling
      iframe.style.width = "100%";
      iframe.style.height = `${height}px`;
      iframe.style.border = "0";
      iframe.style.borderRadius = "12px";

      containerRef.current.appendChild(iframe);
    }
  }, [oembedData, height]);

  if (!isValid) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800 ${className}`}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Invalid Spotify URL
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width: "100%", minHeight: `${height}px` }}
    >
      {/* Loading spinner overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"
          style={{ minHeight: `${height}px` }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
            <p className="text-sm font-medium text-white drop-shadow-lg">
              Loading...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50 dark:bg-gray-800"
          style={{ minHeight: `${height}px` }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Failed to load Spotify player
          </p>
        </div>
      )}

      {/* oEmbed container */}
      <div ref={containerRef} className="relative w-full" />
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders when props haven't changed
export default memo(SpotifyEmbed, (prevProps, nextProps) => {
  // Only re-render if the URL or size actually changes
  return (
    prevProps.url === nextProps.url &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className
  );
});
