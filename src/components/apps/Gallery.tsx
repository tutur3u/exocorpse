"use client";

import { useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Lightbox, { type LightboxContent } from "../shared/Lightbox";

/* eslint-disable @next/next/no-img-element */

const isDevelopment = process.env.NODE_ENV === "development";

export interface GalleryImage {
  id: string;
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  description?: string;
  metadata?: {
    author?: string;
    authorUrl?: string;
    [key: string]: unknown;
  };
}

interface MasonryGalleryProps {
  images: GalleryImage[];
  isLoading?: boolean;
  columnsBreakpoints?: Record<number, number>;
  gutter?: number;
  maxWidth?: string;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  showOverlay?: boolean;
  onImageClick?: (image: GalleryImage, index: number) => void;
}

export function MasonryGallery({
  images,
  isLoading = false,
  columnsBreakpoints = { 350: 1, 750: 2, 1024: 3, 1280: 4 },
  gutter = 5,
  maxWidth = "max-w-6xl",
  emptyState,
  loadingState,
  showOverlay = true,
  onImageClick,
}: MasonryGalleryProps) {
  const [selectedContent, setSelectedContent] =
    useState<LightboxContent | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleImageClick = (image: GalleryImage, index: number) => {
    if (onImageClick) {
      onImageClick(image, index);
      return;
    }

    setSelectedContent({
      imageUrl: image.url,
      title: image.title || image.alt || `Image ${index + 1}`,
      description: image.description || image.metadata?.author || undefined,
    });
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedContent(null);
  };

  const handleNext = () => {
    const nextIndex = (selectedIndex + 1) % images.length;
    setSelectedIndex(nextIndex);
    const nextImage = images[nextIndex];
    setSelectedContent({
      imageUrl: nextImage.url,
      title: nextImage.title || nextImage.alt || `Image ${nextIndex + 1}`,
      description:
        nextImage.description || nextImage.metadata?.author || undefined,
    });
  };

  const handlePrevious = () => {
    const prevIndex = (selectedIndex - 1 + images.length) % images.length;
    setSelectedIndex(prevIndex);
    const prevImage = images[prevIndex];
    setSelectedContent({
      imageUrl: prevImage.url,
      title: prevImage.title || prevImage.alt || `Image ${prevIndex + 1}`,
      description:
        prevImage.description || prevImage.metadata?.author || undefined,
    });
  };

  if (isLoading) {
    if (loadingState) {
      return <>{loadingState}</>;
    }

    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 dark:border-gray-700 dark:border-t-blue-400"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>;
    }

    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">No images to display</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className={`mx-auto ${maxWidth}`}>
        <ResponsiveMasonry columnsCountBreakPoints={columnsBreakpoints}>
          <Masonry
            style={{ gap: `${gutter}px` }}
            itemStyle={{ gap: `${gutter}px` }}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative cursor-pointer overflow-hidden transition-transform hover:scale-[1.02]"
                onClick={() => handleImageClick(image, index)}
              >
                <img
                  src={image.url}
                  alt={image.alt || image.title || `Gallery image ${index + 1}`}
                  className="block w-full"
                  loading="lazy"
                />
                {showOverlay && (image.metadata?.author || image.title) && (
                  <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="p-3 text-white">
                      {image.title && (
                        <p className="text-sm font-medium">{image.title}</p>
                      )}
                      {image.metadata?.author && (
                        <p className="text-xs opacity-80">
                          {image.metadata.author}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>

        <Lightbox
          content={selectedContent}
          onClose={handleClose}
          onNext={handleNext}
          onPrevious={handlePrevious}
          imageAlt={selectedContent?.title || "Gallery image"}
        />
      </div>
    </div>
  );
}

// Generate placeholder images with varied aspect ratios for better masonry effect
const generatePlaceholderImages = (): GalleryImage[] => {
  const aspectRatios = [
    { w: 400, h: 600 }, // Portrait
    { w: 600, h: 400 }, // Landscape
    { w: 500, h: 500 }, // Square
    { w: 400, h: 700 }, // Tall portrait
    { w: 700, h: 400 }, // Wide landscape
    { w: 450, h: 550 }, // Slightly tall
    { w: 550, h: 450 }, // Slightly wide
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const ratio = aspectRatios[i % aspectRatios.length];
    return {
      id: `placeholder-${i}`,
      url: `https://picsum.photos/${ratio.w}/${ratio.h}?random=${i}`,
      width: ratio.w,
      height: ratio.h,
      alt: `Placeholder image ${i + 1}`,
      metadata: {
        author: "Demo User",
        authorUrl: "demouser",
      },
    };
  });
};

// Demo/default Gallery component that uses the reusable MasonryGallery
export default function Gallery() {
  if (!isDevelopment) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex h-full items-center justify-center text-gray-400">
              Artwork {i + 1}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // In development, directly pass the picsum images
  const images = generatePlaceholderImages();
  return <MasonryGallery images={images} />;
}
