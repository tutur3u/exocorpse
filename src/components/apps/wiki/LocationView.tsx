"use client";

import Lightbox, { type LightboxContent } from "@/components/shared/Lightbox";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type { Location } from "@/lib/actions/wiki";
import { getLocationById, getLocationGallery } from "@/lib/actions/wiki";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";

type LocationViewProps = {
  location: Location;
  onNavigateToLocation?: (slug: string) => void;
};

export default function LocationView({
  location,
  onNavigateToLocation,
}: LocationViewProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "location-tab",
    parseAsStringLiteral([
      "information",
      "history",
      "geography",
      "gallery",
    ] as const)
      .withDefault("information")
      .withOptions({ history: "push", shallow: true }),
  );
  const [lightboxContent, setLightboxContent] =
    useState<LightboxContent | null>(null);

  // Fetch gallery items
  const { data: gallery = [], isLoading: galleryLoading } = useQuery({
    queryKey: ["location-gallery", location.id],
    queryFn: () => getLocationGallery(location.id),
  });

  // Fetch parent location if it exists
  const { data: parentLocation } = useQuery({
    queryKey: ["parent-location", location.parent_location_id],
    queryFn: () =>
      location.parent_location_id
        ? getLocationById(location.parent_location_id)
        : null,
    enabled: !!location.parent_location_id,
  });

  // Batch fetch all image URLs
  const imagePaths = [
    location.image_url,
    location.banner_image,
    location.map_image,
    ...gallery.map((item) => item.image_url),
    ...gallery.map((item) => item.thumbnail_url),
  ].filter((p): p is string => !!p && !p.startsWith("http"));

  const { signedUrls: imageUrls } = useBatchStorageUrls(imagePaths);

  const tabs = [
    { id: "information", label: "Information" },
    { id: "history", label: "History" },
    { id: "geography", label: "Geography" },
    { id: "gallery", label: `Gallery (${gallery.length})` },
  ];

  return (
    <div className="text-theme-text bg-theme-primary flex min-h-full flex-col">
      {/* Banner Image */}
      <div className="relative h-64 overflow-hidden">
        {location.banner_image ? (
          <>
            <StorageImage
              src={location.banner_image}
              signedUrl={imageUrls.get(location.banner_image)}
              alt={`${location.name} banner`}
              className="h-full w-full object-cover"
              fill
            />
            <div className="text-theme-text absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60" />
          </>
        ) : (
          <>
            <div className="text-theme-text bg-theme-secondary h-full w-full" />
            <div className="text-theme-text absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60" />
          </>
        )}
      </div>

      {/* Header */}
      <div className="text-theme-text bg-theme-secondary px-6 py-4">
        <div className="flex items-start gap-6">
          {/* Location Info */}
          <div className="flex flex-col gap-2">
            {parentLocation && (
              <button
                type="button"
                onClick={() => {
                  onNavigateToLocation?.(parentLocation.slug);
                }}
                className="text-theme-text hover:text-theme-primary inline-flex w-fit items-center gap-1 text-sm font-medium transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Parent location</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {parentLocation.name}
              </button>
            )}
            <div>
              <h1 className="text-theme-text bg-theme-primary text-2xl font-bold">
                {location.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="text-theme-text bg-theme-secondary px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.id as "information" | "history" | "geography" | "gallery",
                )
              }
              className={`relative shrink-0 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-theme-text bg-theme-primary shadow-sm"
                  : "text-theme-text hover:bg-theme-primary hover:text-theme-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="text-theme-text bg-theme-primary p-6">
        {/* Information Tab */}
        {activeTab === "information" && (
          <div className="grid grid-cols-1 gap-6 @md:grid-cols-2">
            {/* Description */}
            {location.summary && (
              <div className="text-theme-text bg-theme-secondary rounded-xl p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  <span className="text-theme-text bg-theme-primary h-6 w-1 rounded-full"></span>
                  Summary
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={location.summary} />
                </div>
              </div>
            )}
            {/* Map Image */}
            {location.map_image && (
              <div className="flex items-center justify-center overflow-hidden rounded-xl">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxContent({
                      imageUrl: location.map_image as string,
                      title: `Map of ${location.name}`,
                      signedUrl: imageUrls.get(location.map_image as string),
                    })
                  }
                  className="relative w-full cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <StorageImage
                    src={location.map_image}
                    signedUrl={imageUrls.get(location.map_image)}
                    alt={`Map of ${location.name}`}
                    width={1200}
                    height={800}
                    className="w-full rounded-xl object-cover"
                  />
                </button>
              </div>
            )}

            {location.description && (
              <div className="text-theme-text bg-theme-secondary rounded-xl p-6 shadow-sm md:col-span-2">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  <span className="text-theme-text bg-theme-primary h-6 w-1 rounded-full"></span>
                  Description
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={location.description} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="animate-fadeIn mx-auto max-w-4xl">
            {location.history ? (
              <div className="text-theme-text bg-theme-secondary rounded-xl p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  <span className="text-theme-text bg-theme-primary h-6 w-1 rounded-full"></span>
                  Historical Background
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={location.history} />
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="text-theme-text bg-theme-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-theme-text h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>No history icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-theme-text mb-2 text-lg font-semibold">
                  No history available
                </h3>
                <p className="text-theme-text">
                  This location doesn&apos;t have historical information yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Geography Tab */}
        {activeTab === "geography" && (
          <div className="animate-fadeIn mx-auto max-w-4xl">
            {location.geography ? (
              <div className="text-theme-text bg-theme-secondary rounded-xl p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  <span className="text-theme-text bg-theme-primary h-6 w-1 rounded-full"></span>
                  Geographic Features
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={location.geography} />
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="text-theme-text bg-theme-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-theme-text h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>No geography icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-theme-text mb-2 text-lg font-semibold">
                  No geography available
                </h3>
                <p className="text-theme-text">
                  This location doesn&apos;t have geographic information yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="animate-fadeIn">
            {galleryLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                  <div className="text-theme-text font-medium">
                    Loading gallery...
                  </div>
                </div>
              </div>
            ) : gallery.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-theme-text bg-theme-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <svg
                    className="text-theme-text h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>No gallery icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-theme-text mb-2 text-lg font-semibold">
                  No gallery images yet
                </h3>
                <p className="text-theme-text">
                  This location doesn&apos;t have any gallery images yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 @md:grid-cols-2 @lg:grid-cols-3">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="text-theme-text bg-theme-secondary overflow-hidden rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxContent({
                          imageUrl: item.image_url,
                          title: item.title,
                          description: item.description,
                          signedUrl: imageUrls.get(item.image_url),
                        })
                      }
                      className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900"
                    >
                      <StorageImage
                        src={item.thumbnail_url || item.image_url}
                        signedUrl={imageUrls.get(
                          item.thumbnail_url || item.image_url,
                        )}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </button>

                    <div className="p-4">
                      <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      )}
                      {item.artist_name && (
                        <div className="mt-3 border-t pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                          <span className="font-medium">Artist:</span>{" "}
                          {item.artist_url ? (
                            <a
                              href={item.artist_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline dark:text-emerald-400"
                            >
                              {item.artist_name}
                            </a>
                          ) : (
                            item.artist_name
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        content={lightboxContent}
        onClose={() => setLightboxContent(null)}
      />
    </div>
  );
}
