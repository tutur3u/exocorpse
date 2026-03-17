"use client";

import Lightbox, { type LightboxContent } from "@/components/shared/Lightbox";
import StorageImage from "@/components/shared/StorageImage";
import { useEffect, useState } from "react";

export type RotatingGalleryImage = {
  id: string;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
};

type RotatingGalleryProps = {
  images: RotatingGalleryImage[];
  intervalMs?: number;
  className?: string;
  imageClassName?: string;
  overlay?:
    | React.ReactNode
    | ((image: RotatingGalleryImage) => React.ReactNode);
  showDots?: boolean;
  openOnClick?: boolean;
  allowFullscreen?: boolean;
  showArrows?: boolean;
};

export default function RotatingGallery({
  images,
  intervalMs = 4500,
  className = "",
  imageClassName = "object-cover",
  overlay,
  showDots = true,
  openOnClick = false,
  allowFullscreen = true,
  showArrows = true,
}: RotatingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const imageKey = images.map((image) => image.id).join("|");

  const goToNext = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setActiveIndex(
      (currentIndex) => (currentIndex - 1 + images.length) % images.length,
    );
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [imageKey]);

  useEffect(() => {
    if (images.length <= 1 || lightboxIndex !== null) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [images.length, intervalMs, lightboxIndex]);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex];
  const overlayContent =
    typeof overlay === "function" ? overlay(activeImage) : overlay;
  const lightboxContent: LightboxContent | null =
    lightboxIndex === null
      ? null
      : {
          imageUrl: images[lightboxIndex].src,
          title: images[lightboxIndex].title || images[lightboxIndex].alt,
          description: images[lightboxIndex].subtitle,
        };

  return (
    <>
      <div
        className={`relative overflow-hidden ${className}`.trim()}
        onClick={() => {
          if (allowFullscreen && openOnClick) {
            setLightboxIndex(activeIndex);
          }
        }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeIndex
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            aria-hidden={index !== activeIndex}
          >
            <StorageImage
              src={image.src}
              alt={image.alt}
              fill
              className={imageClassName}
            />
          </div>
        ))}

        {overlayContent}

        {allowFullscreen && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setLightboxIndex(activeIndex);
            }}
            className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80"
            aria-label="Open fullscreen gallery view"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 3H5a2 2 0 00-2 2v3m16 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M8 21H5a2 2 0 01-2-2v-3"
              />
            </svg>
          </button>
        )}

        {showArrows && images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToPrevious();
              }}
              className="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80"
              aria-label="Show previous image"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goToNext();
              }}
              className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80"
              aria-label="Show next image"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {showDots && images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2 px-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Show image ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Lightbox
        content={lightboxContent}
        onClose={() => setLightboxIndex(null)}
        onNext={
          images.length > 1
            ? () => {
                setLightboxIndex((currentIndex) => {
                  const nextIndex =
                    currentIndex === null
                      ? 0
                      : (currentIndex + 1) % images.length;
                  setActiveIndex(nextIndex);
                  return nextIndex;
                });
              }
            : undefined
        }
        onPrevious={
          images.length > 1
            ? () => {
                setLightboxIndex((currentIndex) => {
                  const previousIndex =
                    currentIndex === null
                      ? 0
                      : (currentIndex - 1 + images.length) % images.length;
                  setActiveIndex(previousIndex);
                  return previousIndex;
                });
              }
            : undefined
        }
        imageAlt={
          lightboxIndex === null ? activeImage.alt : images[lightboxIndex].alt
        }
      />
    </>
  );
}
