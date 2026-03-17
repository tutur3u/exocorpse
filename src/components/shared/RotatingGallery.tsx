"use client";

import Lightbox, { type LightboxContent } from "@/components/shared/Lightbox";
import StorageImage from "@/components/shared/StorageImage";
import { useEffect, useMemo, useState } from "react";

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
  showSidePreviews?: boolean;
  showCaptionPanel?: boolean;
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
  showSidePreviews = false,
  showCaptionPanel = false,
}: RotatingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [interactionVersion, setInteractionVersion] = useState(0);
  const imageKey = images.map((image) => image.id).join("|");

  const markInteraction = () => {
    setInteractionVersion((currentVersion) => currentVersion + 1);
  };

  const goToIndex = (index: number) => {
    setActiveIndex(index);
    markInteraction();
  };

  const goToNext = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
    markInteraction();
  };

  const goToPrevious = () => {
    setActiveIndex(
      (currentIndex) => (currentIndex - 1 + images.length) % images.length,
    );
    markInteraction();
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
  }, [images.length, intervalMs, lightboxIndex, interactionVersion]);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex];
  const previousIndex = (activeIndex - 1 + images.length) % images.length;
  const nextIndex = (activeIndex + 1) % images.length;
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
  const mobileIndicatorIndices = useMemo(() => {
    const maxVisibleIndicators = 4;

    if (images.length <= maxVisibleIndicators) {
      return images.map((_, index) => index);
    }

    const startIndex = Math.min(
      Math.max(activeIndex - 1, 0),
      images.length - maxVisibleIndicators,
    );

    return Array.from(
      { length: maxVisibleIndicators },
      (_, offset) => startIndex + offset,
    );
  }, [activeIndex, images]);

  const floatingChrome = !showCaptionPanel;
  const hasMultipleImages = images.length > 1;

  return (
    <>
      <div
        className={`rotating-gallery relative ${
          showCaptionPanel ? "flex h-full flex-col" : "overflow-hidden"
        } ${className}`.trim()}
      >
        <div
          className={`relative ${
            showCaptionPanel
              ? "min-h-0 flex-1 px-3 pt-3 sm:px-4 sm:pt-4"
              : "h-full"
          }`}
          onClick={() => {
            if (allowFullscreen && openOnClick) {
              setLightboxIndex(activeIndex);
            }
          }}
        >
          {showSidePreviews && hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToPrevious();
                }}
                className="group absolute top-1/2 left-1 z-[1] hidden h-[62%] w-[18%] -translate-y-1/2 overflow-hidden rounded-[1.15rem] border border-white/10 bg-black/30 shadow-2xl backdrop-blur-sm transition hover:border-white/20 hover:bg-black/40 lg:block xl:left-2 xl:h-[68%] xl:w-[17%]"
                aria-label="Show previous image"
              >
                <StorageImage
                  src={images[previousIndex].src}
                  alt={images[previousIndex].alt}
                  fill
                  className="object-cover opacity-70 transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/45 via-black/20 to-black/55" />
                <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 px-3 text-[10px] font-medium tracking-[0.2em] text-white uppercase xl:text-xs">
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Prev
                </div>
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToNext();
                }}
                className="group absolute top-1/2 right-1 z-[1] hidden h-[62%] w-[18%] -translate-y-1/2 overflow-hidden rounded-[1.15rem] border border-white/10 bg-black/30 shadow-2xl backdrop-blur-sm transition hover:border-white/20 hover:bg-black/40 lg:block xl:right-2 xl:h-[68%] xl:w-[17%]"
                aria-label="Show next image"
              >
                <StorageImage
                  src={images[nextIndex].src}
                  alt={images[nextIndex].alt}
                  fill
                  className="object-cover opacity-70 transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-linear-to-l from-black/45 via-black/20 to-black/55" />
                <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 px-3 text-[10px] font-medium tracking-[0.2em] text-white uppercase xl:text-xs">
                  Next
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </>
          )}

          <div
            className={`relative h-full overflow-hidden ${
              showCaptionPanel
                ? "rounded-[1.35rem] border border-white/10 bg-[#03060d] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_45px_rgba(0,0,0,0.34)]"
                : ""
            }`}
          >
            <div
              className={`absolute inset-y-0 ${
                showSidePreviews && images.length > 1
                  ? "inset-x-0 lg:left-1/2 lg:w-[56%] lg:-translate-x-1/2 xl:w-[58%]"
                  : "inset-x-0"
              }`}
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
            </div>

            {overlayContent}

            {floatingChrome && allowFullscreen && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightboxIndex(activeIndex);
                }}
                className="absolute top-3 right-3 z-10 min-h-0 min-w-0 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80"
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

            {floatingChrome && showArrows && hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute top-1/2 left-3 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80 xl:left-[18%]"
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
                  className="absolute top-1/2 right-3 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80 xl:right-[18%]"
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

            {floatingChrome && showDots && hasMultipleImages && (
              <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-2 px-3 md:bottom-4">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    aria-pressed={index === activeIndex}
                    onClick={(event) => {
                      event.stopPropagation();
                      goToIndex(index);
                    }}
                    className={`h-2 min-h-0 min-w-0 rounded-full transition-all md:h-2.5 ${
                      index === activeIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/55 hover:bg-white/80 md:w-2.5"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {showCaptionPanel && (
          <div className="relative z-[2] border-t border-white/10 bg-linear-to-r from-[#08111d] via-[#060a14] to-[#08111d]">
            <div className="space-y-3 px-3 py-3 sm:hidden">
              <div className="min-w-0">
                <p className="truncate text-[0.95rem] font-semibold tracking-[0.04em] text-white">
                  {activeImage.title || activeImage.alt}
                </p>
                {activeImage.subtitle && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-300/90">
                    {activeImage.subtitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <div className="flex items-center justify-start">
                  {showArrows && hasMultipleImages && (
                    <button
                      type="button"
                      onClick={goToPrevious}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:border-white/20 hover:bg-white/12"
                      aria-label="Show previous image"
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="flex min-w-0 flex-col items-center justify-center gap-1">
                  {showDots && hasMultipleImages && (
                    <div className="flex items-center justify-center gap-1.5">
                      {mobileIndicatorIndices.map((index) => (
                        <button
                          key={images[index].id}
                          type="button"
                          aria-label={`Show image ${index + 1}`}
                          aria-pressed={index === activeIndex}
                          onClick={() => goToIndex(index)}
                          className={`rounded-full transition-all ${
                            index === activeIndex
                              ? "h-1.5 w-7 bg-white"
                              : "h-1.5 w-4 bg-white/22 hover:bg-white/42"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {hasMultipleImages && (
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                      {activeIndex + 1} / {images.length}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  {showArrows && hasMultipleImages && (
                    <button
                      type="button"
                      onClick={goToNext}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:border-white/20 hover:bg-white/12"
                      aria-label="Show next image"
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}

                  {allowFullscreen && (
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(activeIndex)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:border-white/20 hover:bg-white/12"
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
                </div>
              </div>
            </div>

            <div className="hidden min-h-[6.2rem] items-center justify-between gap-4 px-4 py-3.5 sm:flex">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-white lg:text-lg">
                  {activeImage.title || activeImage.alt}
                </p>
                {activeImage.subtitle && (
                  <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-relaxed text-slate-300/90">
                    {activeImage.subtitle}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                {showDots && hasMultipleImages && (
                  <div className="flex items-center gap-2">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        aria-label={`Show image ${index + 1}`}
                        aria-pressed={index === activeIndex}
                        onClick={() => goToIndex(index)}
                        className={`rounded-full transition-all ${
                          index === activeIndex
                            ? "h-2 w-7 bg-white"
                            : "h-2 w-2 bg-white/32 hover:bg-white/55"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  {showArrows && hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={goToPrevious}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:border-white/20 hover:bg-white/12"
                        aria-label="Show previous image"
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={goToNext}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:border-white/20 hover:bg-white/12"
                        aria-label="Show next image"
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {allowFullscreen && (
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(activeIndex)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:border-white/20 hover:bg-white/12"
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
                </div>
              </div>
            </div>
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
                  const nextLightboxIndex =
                    currentIndex === null
                      ? 0
                      : (currentIndex + 1) % images.length;
                  setActiveIndex(nextLightboxIndex);
                  markInteraction();
                  return nextLightboxIndex;
                });
              }
            : undefined
        }
        onPrevious={
          images.length > 1
            ? () => {
                setLightboxIndex((currentIndex) => {
                  const previousLightboxIndex =
                    currentIndex === null
                      ? 0
                      : (currentIndex - 1 + images.length) % images.length;
                  setActiveIndex(previousLightboxIndex);
                  markInteraction();
                  return previousLightboxIndex;
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
