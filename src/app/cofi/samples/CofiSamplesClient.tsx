"use client";

import type { CofiDataset, CofiSample } from "@/data/cofi/types";
import { COFI_SEMANTIC_SEARCH_MIN_QUERY_LENGTH } from "@/lib/cofi";
import { sanitizeFilename } from "@/lib/fileUtils";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Props = {
  dataset: CofiDataset;
};

type ViewerProps = {
  sample: CofiSample;
  artistSampleCount: number;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  nextSample?: CofiSample | null;
  previousSample?: CofiSample | null;
};

const JOINING_DATE_LABELS: Record<string, string> = {
  BOTH_DAYS: "Both days",
  DAY_1: "Day 1",
  DAY_2: "Day 2",
};

const SORT_OPTIONS = [
  { label: "Snapshot order", value: "index" },
  { label: "Artist name", value: "artist" },
  { label: "Booth location", value: "booth" },
  { label: "Attendance day", value: "joiningDate" },
] as const;
const PAGE_SIZE = 24;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getSampleKey(sample: CofiSample) {
  return `${sample.id}-${sample.index}`;
}

function formatJoiningDate(value: string) {
  return JOINING_DATE_LABELS[value] ?? value;
}

function formatBoothType(value: string) {
  return value === "PREMIUM" ? "Premium booth" : "Standard booth";
}

function formatFetchedAt(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getSampleDownloadFilename(sample: CofiSample) {
  const originalExtension =
    sample.image.original.extension.replace(/^\./, "") ||
    sample.image.original.filename.match(/\.([^.]+)$/)?.[1] ||
    "jpg";

  return sanitizeFilename(
    `${sample.artistName}-${sample.boothLocation}-${sample.joiningDate}-sample-${sample.index}.${originalExtension}`,
  );
}

function ZoomableSampleViewer({
  sample,
  artistSampleCount,
  onClose,
  onNext,
  onPrevious,
  nextSample,
  previousSample,
}: ViewerProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const mouseDragRef = useRef<{ startX: number; startY: number } | null>(null);
  const pendingViewRef = useRef<{
    scale: number;
    offset: { x: number; y: number };
  } | null>(null);
  const frameRef = useRef<number | null>(null);
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStateRef = useRef<{
    distance: number;
    scale: number;
    offset: { x: number; y: number };
  } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isMouseDragging, setIsMouseDragging] = useState(false);

  const canPan = scale > 1;
  const canGoPrevious = Boolean(onPrevious);
  const canGoNext = Boolean(onNext);
  const isDragging = isInteracting || isMouseDragging;
  const downloadFilename = getSampleDownloadFilename(sample);

  const clampOffset = (x: number, y: number, currentScale: number) => {
    if (currentScale <= 1) {
      return { x: 0, y: 0 };
    }

    const bounds = viewportRef.current?.getBoundingClientRect();

    if (!bounds) {
      return { x, y };
    }

    const maxX = (bounds.width * (currentScale - 1)) / 2;
    const maxY = (bounds.height * (currentScale - 1)) / 2;

    return {
      x: clamp(x, -maxX, maxX),
      y: clamp(y, -maxY, maxY),
    };
  };

  const commitView = (
    nextScale: number,
    nextOffset: { x: number; y: number },
  ) => {
    scaleRef.current = nextScale;
    offsetRef.current = nextOffset;
    pendingViewRef.current = {
      scale: nextScale,
      offset: nextOffset,
    };

    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;

      if (!pendingViewRef.current) {
        return;
      }

      setScale(pendingViewRef.current.scale);
      setOffset(pendingViewRef.current.offset);
      pendingViewRef.current = null;
    });
  };

  const getAnchorPoint = (clientX: number, clientY: number) => {
    const bounds = viewportRef.current?.getBoundingClientRect();

    if (!bounds) {
      return { x: 0, y: 0 };
    }

    return {
      x: clientX - bounds.left - bounds.width / 2,
      y: clientY - bounds.top - bounds.height / 2,
    };
  };

  const applyScale = (
    nextScale: number,
    anchor: { x: number; y: number } = { x: 0, y: 0 },
    baseScale = scaleRef.current,
    baseOffset = offsetRef.current,
  ) => {
    const clampedScale = clamp(nextScale, 1, 5);

    if (clampedScale === 1) {
      commitView(1, { x: 0, y: 0 });
      return;
    }

    const zoomRatio = clampedScale / baseScale;
    const nextOffset = clampOffset(
      anchor.x - (anchor.x - baseOffset.x) * zoomRatio,
      anchor.y - (anchor.y - baseOffset.y) * zoomRatio,
      clampedScale,
    );

    commitView(clampedScale, nextOffset);
  };

  const getPointerDistance = (
    left: { x: number; y: number },
    right: { x: number; y: number },
  ) => Math.hypot(right.x - left.x, right.y - left.y);

  const getPointerMidpoint = (
    left: { x: number; y: number },
    right: { x: number; y: number },
  ) => ({
    x: (left.x + right.x) / 2,
    y: (left.y + right.y) / 2,
  });

  const canUseDesktopWheelZoom = () =>
    typeof window !== "undefined" &&
    (window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(min-width: 768px)").matches);

  useEffect(() => {
    setIsImageLoading(true);
    commitView(1, { x: 0, y: 0 });
    setDragState(null);
    setIsInteracting(false);
    setIsMouseDragging(false);
    mouseDragRef.current = null;
    activePointersRef.current.clear();
    pinchStateRef.current = null;
  }, [sample.id, sample.index]);

  useEffect(() => {
    const preloadTargets = [
      sample.image.original.localPath,
      nextSample?.image.original.localPath,
      previousSample?.image.original.localPath,
    ].filter((value): value is string => Boolean(value));

    for (const src of preloadTargets) {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
    }
  }, [
    nextSample?.image.original.localPath,
    previousSample?.image.original.localPath,
    sample.image.original.localPath,
  ]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        onNext?.();
      }

      if (event.key === "ArrowLeft") {
        onPrevious?.();
      }

      if (event.key === "+" || event.key === "=") {
        applyScale(scaleRef.current + 0.3);
      }

      if (event.key === "-") {
        applyScale(scaleRef.current - 0.3);
      }

      if (event.key === "0") {
        applyScale(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onNext, onPrevious]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!mouseDragRef.current) {
        return;
      }

      event.preventDefault();

      const nextOffset = clampOffset(
        event.clientX - mouseDragRef.current.startX,
        event.clientY - mouseDragRef.current.startY,
        scaleRef.current,
      );
      commitView(scaleRef.current, nextOffset);
    };

    const stopMouseDrag = () => {
      mouseDragRef.current = null;
      setIsMouseDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopMouseDrag);
    window.addEventListener("mouseleave", stopMouseDrag);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopMouseDrag);
      window.removeEventListener("mouseleave", stopMouseDrag);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_top,rgba(206,32,34,0.15),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(45,66,224,0.18),transparent_30%),linear-gradient(180deg,rgba(2,4,9,0.98),rgba(4,5,11,0.98))] backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="flex min-h-dvh flex-col"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cofi-fullscreen-title"
      >
        <div className="border-b border-[#c9a56c]/20 bg-[linear-gradient(90deg,rgba(103,13,33,0.2),rgba(8,13,24,0.82),rgba(23,42,121,0.18))] px-3 py-1.5 sm:px-6 sm:py-3">
          <div className="hidden items-center justify-between gap-3 sm:flex lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[0.68rem] tracking-[0.32em] text-[#d0a56b] uppercase">
                Sample Viewer
              </p>
              <h2
                id="cofi-fullscreen-title"
                className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-1 text-xl font-semibold text-[#f8efdd] sm:text-2xl"
              >
                {sample.artistName}
              </h2>
              <p className="mt-1 text-sm text-[#d1c6b5]">
                {sample.boothLocation} • {formatBoothType(sample.boothType)} •{" "}
                {formatJoiningDate(sample.joiningDate)}
                {artistSampleCount > 1 ? ` • ${artistSampleCount} samples` : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="rounded-full border border-[#ceb17e]/20 bg-[#101523]/90 px-4 py-2 text-sm font-medium text-[#ece4d0] transition hover:border-[#d23642] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#ceb17e]/20 disabled:hover:text-[#ece4d0]"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => applyScale(scale - 0.3)}
                disabled={scale <= 1}
                className="rounded-full border border-[#ceb17e]/20 bg-[#101523]/90 px-3 py-2 text-sm text-[#ece4d0] transition hover:border-[#d23642] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#ceb17e]/20 disabled:hover:text-[#ece4d0]"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => applyScale(1)}
                className="rounded-full border border-[#ceb17e]/20 bg-[#101523]/90 px-3 py-2 text-sm text-[#ece4d0] transition hover:border-[#3350e4] hover:text-white"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => applyScale(scale + 0.3)}
                disabled={scale >= 5}
                className="rounded-full border border-[#ceb17e]/20 bg-[#101523]/90 px-3 py-2 text-sm text-[#ece4d0] transition hover:border-[#d23642] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#ceb17e]/20 disabled:hover:text-[#ece4d0]"
              >
                +
              </button>
              <a
                href={sample.image.original.localPath}
                download={downloadFilename}
                className="rounded-full border border-[#2d49d8]/28 bg-[linear-gradient(135deg,#13203c,#101523)] px-4 py-2 text-sm font-medium text-[#eef3ff] transition hover:border-[#7ab8ff] hover:text-white"
                aria-label={`Download ${sample.artistName} sample image`}
              >
                Download
              </a>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#d23642]/35 bg-[linear-gradient(135deg,#34111a,#12182b)] px-4 py-2 text-sm font-medium text-[#fff0c6] transition hover:border-[#f17d6b]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                className="rounded-full border border-[#ceb17e]/20 bg-[#101523]/90 px-4 py-2 text-sm font-medium text-[#ece4d0] transition hover:border-[#3350e4] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#ceb17e]/20 disabled:hover:text-[#ece4d0]"
              >
                Next
              </button>
            </div>
          </div>

          <div className="sm:hidden">
            <div className="min-w-0">
              <h2
                id="cofi-fullscreen-title-mobile"
                className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] truncate text-lg font-semibold text-[#f8efdd]"
              >
                {sample.artistName}
              </h2>
              <p className="mt-0.5 truncate text-[0.78rem] text-[#d1c6b5]">
                {sample.boothLocation} • {formatBoothType(sample.boothType)} •{" "}
                {formatJoiningDate(sample.joiningDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="@container relative flex flex-1 flex-col lg:flex-row">
          <div className="relative h-[calc(100dvh-7.9rem)] flex-none overflow-hidden sm:h-[calc(100dvh-8.5rem)] lg:h-auto lg:min-h-0 lg:flex-1">
            <div
              ref={viewportRef}
              className={`relative h-full w-full overflow-hidden select-none ${
                canPan
                  ? isDragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : "cursor-zoom-in"
              }`}
              style={{ touchAction: "none" }}
              onDoubleClick={(event) => {
                if (!canUseDesktopWheelZoom()) {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();
                applyScale(
                  scaleRef.current > 1 ? 1 : 2.25,
                  getAnchorPoint(event.clientX, event.clientY),
                );
              }}
              onWheel={(event) => {
                if (!canUseDesktopWheelZoom()) {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();
                applyScale(
                  scaleRef.current + (event.deltaY < 0 ? 0.25 : -0.25),
                  getAnchorPoint(event.clientX, event.clientY),
                );
              }}
              onMouseDown={(event) => {
                if (!canUseDesktopWheelZoom() || scaleRef.current <= 1) {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();
                mouseDragRef.current = {
                  startX: event.clientX - offsetRef.current.x,
                  startY: event.clientY - offsetRef.current.y,
                };
                setIsMouseDragging(true);
              }}
              onPointerDown={(event) => {
                if (event.pointerType === "mouse") {
                  return;
                }

                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                activePointersRef.current.set(event.pointerId, {
                  x: event.clientX,
                  y: event.clientY,
                });
                setIsInteracting(true);

                const pointers = [...activePointersRef.current.values()];

                if (pointers.length === 2) {
                  setDragState(null);
                  pinchStateRef.current = {
                    distance: getPointerDistance(pointers[0], pointers[1]),
                    scale: scaleRef.current,
                    offset: offsetRef.current,
                  };
                  return;
                }

                if (pointers.length === 1 && scaleRef.current > 1) {
                  setDragState({
                    pointerId: event.pointerId,
                    startX: event.clientX - offsetRef.current.x,
                    startY: event.clientY - offsetRef.current.y,
                  });
                }
              }}
              onPointerMove={(event) => {
                if (event.pointerType === "mouse") {
                  return;
                }

                if (!activePointersRef.current.has(event.pointerId)) {
                  return;
                }

                activePointersRef.current.set(event.pointerId, {
                  x: event.clientX,
                  y: event.clientY,
                });

                const pointers = [...activePointersRef.current.values()];

                if (pointers.length === 2) {
                  const [left, right] = pointers;
                  const pinchState =
                    pinchStateRef.current ??
                    ({
                      distance: getPointerDistance(left, right),
                      scale: scaleRef.current,
                      offset: offsetRef.current,
                    } as const);

                  pinchStateRef.current = pinchState;

                  const midpoint = getPointerMidpoint(left, right);
                  applyScale(
                    pinchState.scale *
                      (getPointerDistance(left, right) / pinchState.distance),
                    getAnchorPoint(midpoint.x, midpoint.y),
                    pinchState.scale,
                    pinchState.offset,
                  );
                  return;
                }

                pinchStateRef.current = null;

                if (!dragState || dragState.pointerId !== event.pointerId) {
                  return;
                }

                const nextOffset = clampOffset(
                  event.clientX - dragState.startX,
                  event.clientY - dragState.startY,
                  scaleRef.current,
                );
                commitView(scaleRef.current, nextOffset);
              }}
              onPointerUp={(event) => {
                if (event.pointerType === "mouse") {
                  return;
                }

                activePointersRef.current.delete(event.pointerId);
                pinchStateRef.current =
                  activePointersRef.current.size < 2
                    ? null
                    : pinchStateRef.current;

                if (
                  dragState?.pointerId === event.pointerId ||
                  activePointersRef.current.size === 0
                ) {
                  setDragState(null);
                }

                const remainingPointer = [
                  ...activePointersRef.current.entries(),
                ][0];

                if (
                  activePointersRef.current.size === 1 &&
                  remainingPointer &&
                  scaleRef.current > 1
                ) {
                  setDragState({
                    pointerId: remainingPointer[0],
                    startX: remainingPointer[1].x - offsetRef.current.x,
                    startY: remainingPointer[1].y - offsetRef.current.y,
                  });
                }

                if (activePointersRef.current.size === 0) {
                  setIsInteracting(false);
                }
              }}
              onPointerCancel={(event) => {
                if (event.pointerType === "mouse") {
                  return;
                }

                activePointersRef.current.delete(event.pointerId);
                pinchStateRef.current = null;
                setDragState(null);
                if (activePointersRef.current.size === 0) {
                  setIsInteracting(false);
                }
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
                  transformOrigin: "center center",
                  willChange: isDragging ? "transform" : "auto",
                }}
              >
                <Image
                  key={`${sample.image.thumbnail.localPath}-thumbnail`}
                  src={sample.image.thumbnail.localPath}
                  alt={sample.artistName}
                  fill
                  sizes="100vw"
                  priority
                  draggable={false}
                  className={`pointer-events-none object-contain transition-opacity duration-150 select-none ${
                    isImageLoading ? "opacity-100" : "opacity-0"
                  }`}
                />
                <Image
                  key={sample.image.original.localPath}
                  src={sample.image.original.localPath}
                  alt={sample.artistName}
                  fill
                  sizes="100vw"
                  priority
                  draggable={false}
                  className={`pointer-events-none object-contain transition-opacity duration-150 select-none ${
                    isImageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={() => setIsImageLoading(false)}
                />
              </div>

              {isImageLoading && (
                <div className="pointer-events-none absolute inset-x-0 bottom-18 flex justify-center sm:bottom-4">
                  <div className="rounded-full border border-[#d5bb8d]/25 bg-[#07101dcc] px-4 py-2 text-xs tracking-[0.24em] text-[#f3e1bf] uppercase">
                    Loading sample
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute right-4 bottom-4 hidden rounded-full border border-[#c9a56c]/20 bg-[#07101dcc] px-4 py-2 text-xs tracking-[0.24em] text-[#d7ccb6] uppercase sm:block">
                Wheel to zoom • double-click to toggle • drag to pan
              </div>
            </div>
          </div>

          <aside className="hidden w-full border-t border-[#c9a56c]/20 bg-[linear-gradient(180deg,rgba(11,16,29,0.98),rgba(5,8,15,0.96))] p-4 sm:p-5 lg:block lg:w-[24rem] lg:border-t-0 lg:border-l">
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-[#c9a56c]/16 bg-[linear-gradient(180deg,rgba(125,13,41,0.18),rgba(14,20,34,0.9))] p-4">
                <p className="text-[0.72rem] tracking-[0.24em] text-[#b29063] uppercase">
                  Artist
                </p>
                <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-2 text-2xl font-semibold text-[#fff6de]">
                  {sample.artistName}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#d7ccbc]">
                  Booth {sample.boothLocation} •{" "}
                  {formatBoothType(sample.boothType)}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#2c4ce5]/20 bg-[linear-gradient(180deg,rgba(18,32,88,0.24),rgba(10,18,31,0.94))] p-4">
                <p className="text-[0.72rem] tracking-[0.24em] text-[#90a4ef] uppercase">
                  Attendance
                </p>
                <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-2 text-xl font-semibold text-[#fff6de]">
                  {formatJoiningDate(sample.joiningDate)}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#d7ccbc]">
                  {artistSampleCount > 1
                    ? `This artist has ${artistSampleCount} sample images in the archive.`
                    : "This artist currently has one sample image in the archive."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#2d49d8]/20 bg-[linear-gradient(180deg,rgba(18,32,88,0.2),rgba(10,18,31,0.94))] p-4">
                <p className="text-[0.72rem] tracking-[0.24em] text-[#90a4ef] uppercase">
                  Download
                </p>
                <p className="mt-2 text-sm leading-6 text-[#d7ccbc]">
                  Save the original sample image for offline viewing.
                </p>
                <a
                  href={sample.image.original.localPath}
                  download={downloadFilename}
                  className="mt-4 inline-flex rounded-full border border-[#2d49d8]/28 bg-[linear-gradient(135deg,#13203c,#101523)] px-4 py-2 text-sm font-medium text-[#eef3ff] transition hover:border-[#7ab8ff] hover:text-white"
                >
                  Download original
                </a>
              </div>

              <div className="rounded-[1.5rem] border border-[#d23642]/18 bg-[linear-gradient(180deg,rgba(64,10,23,0.24),rgba(9,14,24,0.94))] p-4">
                <p className="text-[0.72rem] tracking-[0.24em] text-[#ef8e8f] uppercase">
                  Tips
                </p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#d7ccbc]">
                  <li>
                    Use your mouse wheel or trackpad scroll to zoom in and out.
                  </li>
                  <li>
                    Double-click the image to jump between fitted view and
                    zoomed view.
                  </li>
                  <li>When zoomed in, drag the artwork to inspect details.</li>
                  <li>
                    Use your left and right arrow keys to browse nearby samples.
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>

        <div className="border-t border-[#c9a56c]/18 bg-[linear-gradient(180deg,rgba(8,13,24,0.94),rgba(6,10,18,0.98))] px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="rounded-full border border-[#ceb17e]/18 bg-[#101523]/90 px-3 py-2 text-sm font-medium text-[#ece4d0] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              className="rounded-full border border-[#ceb17e]/18 bg-[#101523]/90 px-3 py-2 text-sm font-medium text-[#ece4d0] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Next
            </button>
            <a
              href={sample.image.original.localPath}
              download={downloadFilename}
              className="rounded-full border border-[#2d49d8]/28 bg-[linear-gradient(135deg,#13203c,#101523)] px-3 py-2 text-center text-sm font-medium text-[#eef3ff]"
            >
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#d23642]/35 bg-[linear-gradient(135deg,#34111a,#12182b)] px-3 py-2 text-sm font-medium text-[#fff0c6]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CofiSamplesClient({ dataset }: Props) {
  const [selectedKey, setSelectedKey] = useQueryState(
    "sample",
    parseAsString.withOptions({
      shallow: true,
      history: "push",
    }),
  );
  const [query, setQuery] = useState("");
  const [boothType, setBoothType] = useState("ALL");
  const [joiningDate, setJoiningDate] = useState("ALL");
  const [sortBy, setSortBy] =
    useState<(typeof SORT_OPTIONS)[number]["value"]>("index");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchResults, setSearchResults] = useState<CofiSample[] | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<
    "hybrid" | "fts" | "fallback" | "local"
  >("local");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchFallbackReason, setSearchFallbackReason] = useState<
    "none" | "empty_ranked"
  >("none");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();
  const hasQuery = normalizedQuery.length > 0;
  const canUseRankedSearch =
    normalizedQuery.length >= COFI_SEMANTIC_SEARCH_MIN_QUERY_LENGTH;
  const isQueryDeferred = query.trim() !== normalizedQuery;
  const isDefaultView =
    !hasQuery &&
    boothType === "ALL" &&
    joiningDate === "ALL" &&
    sortBy === "index" &&
    sortDirection === "asc";

  const artistSampleCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const sample of dataset.samples) {
      counts.set(sample.artistName, (counts.get(sample.artistName) ?? 0) + 1);
    }

    return counts;
  }, [dataset.samples]);

  const boothTypes = useMemo(
    () => ["ALL", ...Object.keys(dataset.stats.boothTypeCounts).sort()],
    [dataset.stats.boothTypeCounts],
  );

  const joiningDates = useMemo(
    () => [
      "ALL",
      ...Object.keys(dataset.stats.joiningDateCounts).sort((left, right) =>
        formatJoiningDate(left).localeCompare(formatJoiningDate(right)),
      ),
    ],
    [dataset.stats.joiningDateCounts],
  );

  const localFilteredSamples = useMemo(() => {
    if (isDefaultView) {
      return dataset.samples;
    }

    return dataset.samples
      .filter((sample) => {
        const normalizedTextQuery = normalizedQuery.toLowerCase();

        if (
          normalizedTextQuery &&
          ![
            sample.artistName,
            sample.boothLocation,
            sample.boothType,
            formatJoiningDate(sample.joiningDate),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedTextQuery)
        ) {
          return false;
        }

        if (boothType !== "ALL" && sample.boothType !== boothType) {
          return false;
        }

        if (joiningDate !== "ALL" && sample.joiningDate !== joiningDate) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        let result = 0;

        if (sortBy === "artist") {
          result = left.artistName.localeCompare(right.artistName);
        } else if (sortBy === "booth") {
          result = left.boothLocation.localeCompare(right.boothLocation);
        } else if (sortBy === "joiningDate") {
          result = formatJoiningDate(left.joiningDate).localeCompare(
            formatJoiningDate(right.joiningDate),
          );
        } else {
          result = left.index - right.index;
        }

        return sortDirection === "asc" ? result : result * -1;
      });
  }, [
    dataset.samples,
    isDefaultView,
    normalizedQuery,
    boothType,
    joiningDate,
    sortBy,
    sortDirection,
  ]);

  useEffect(() => {
    if (!canUseRankedSearch) {
      setSearchResults(null);
      setSearchMode("local");
      setSearchError(null);
      setSearchFallbackReason("none");
      setIsSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setSearchError(null);
        setSearchFallbackReason("none");
        setIsSearchLoading(true);

        const params = new URLSearchParams({
          q: normalizedQuery,
          limit: String(dataset.stats.totalSamples),
        });

        if (boothType !== "ALL") {
          params.set("boothType", boothType);
        }

        if (joiningDate !== "ALL") {
          params.set("joiningDate", joiningDate);
        }

        const response = await fetch(`/api/cofi/samples/search?${params}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          success: boolean;
          mode?: "hybrid" | "fts" | "fallback" | "none";
          samples?: CofiSample[];
        };

        if (!response.ok || !payload.success) {
          throw new Error("Search request failed");
        }

        const rankedSamples = payload.samples ?? [];

        if (rankedSamples.length === 0 && localFilteredSamples.length > 0) {
          setSearchResults(null);
          setSearchMode("local");
          setSearchFallbackReason("empty_ranked");
          return;
        }

        setSearchResults(rankedSamples);
        setSearchMode(
          payload.mode === "hybrid" ||
            payload.mode === "fts" ||
            payload.mode === "fallback"
            ? payload.mode
            : "local",
        );
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(
          "COFI search failed, falling back to local search.",
          error,
        );
        setSearchResults(null);
        setSearchMode("local");
        setSearchFallbackReason("none");
        setSearchError(
          "Ranked search is unavailable right now, so local filtering is active.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    canUseRankedSearch,
    localFilteredSamples.length,
    normalizedQuery,
    boothType,
    joiningDate,
    dataset.stats.totalSamples,
  ]);

  const filteredSamples =
    hasQuery && canUseRankedSearch && searchResults !== null
      ? searchResults
      : localFilteredSamples;

  const visibleSamples = filteredSamples.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(Math.min(PAGE_SIZE, filteredSamples.length));
  }, [
    normalizedQuery,
    boothType,
    joiningDate,
    sortBy,
    sortDirection,
    filteredSamples.length,
  ]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || visibleCount >= filteredSamples.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (!entry?.isIntersecting) {
          return;
        }

        startTransition(() => {
          setVisibleCount((current) =>
            Math.min(filteredSamples.length, current + PAGE_SIZE),
          );
        });
      },
      {
        rootMargin: "600px 0px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [filteredSamples.length, visibleCount]);

  const selectedSample = useMemo(
    () =>
      filteredSamples.find((sample) => getSampleKey(sample) === selectedKey) ??
      dataset.samples.find((sample) => getSampleKey(sample) === selectedKey) ??
      null,
    [dataset.samples, filteredSamples, selectedKey],
  );

  useEffect(() => {
    if (selectedKey && !selectedSample) {
      void setSelectedKey(null);
    }
  }, [selectedKey, selectedSample, setSelectedKey]);

  const selectedFilteredIndex =
    selectedSample === null
      ? -1
      : filteredSamples.findIndex(
          (sample) => getSampleKey(sample) === getSampleKey(selectedSample),
        );

  const artistsShown = new Set(
    filteredSamples.map((sample) => sample.artistName),
  ).size;
  const filtersActive = boothType !== "ALL" || joiningDate !== "ALL";
  const isCustomizedView =
    hasQuery || filtersActive || sortBy !== "index" || sortDirection !== "asc";
  const isBusy = isSearchLoading || isQueryDeferred;
  const showEmptyState = !isBusy && filteredSamples.length === 0;
  const searchStatusLabel = isBusy
    ? "Searching"
    : searchMode === "hybrid"
      ? "Semantic + keyword"
      : searchMode === "fts"
        ? "Keyword ranked"
        : searchMode === "fallback"
          ? "Archive ranked"
          : "Instant filter";
  const searchStatusTone = isBusy
    ? "border-[#efb06f]/40 bg-[#261912]/80 text-[#ffd8ae]"
    : searchMode === "hybrid"
      ? "border-[#7ab8ff]/35 bg-[#102136]/80 text-[#d6e8ff]"
      : searchMode === "fts"
        ? "border-[#8ec6a1]/35 bg-[#102218]/80 text-[#d8f3dd]"
        : searchMode === "fallback"
          ? "border-[#d5bb8d]/35 bg-[#251b14]/80 text-[#f3e1bf]"
          : "border-white/10 bg-[#111a2b]/85 text-[#ddd5c4]";
  let searchSupportCopy =
    "Browse the full archive and open any sample fullscreen.";
  let archiveSupportCopy =
    "Scroll through the archive vessel and open any sample fullscreen.";

  if (!hasQuery) {
    searchSupportCopy =
      "Browse the full archive and open any sample fullscreen.";
  } else if (!canUseRankedSearch) {
    searchSupportCopy = `Type ${COFI_SEMANTIC_SEARCH_MIN_QUERY_LENGTH} or more characters to enable ranked search.`;
  } else if (isBusy) {
    searchSupportCopy = `Refreshing results for “${normalizedQuery || query.trim()}”.`;
  } else if (searchError) {
    searchSupportCopy = searchError;
  } else if (searchFallbackReason === "empty_ranked") {
    searchSupportCopy = `Ranked search found no exact database hits for “${normalizedQuery}”, so archive filtering is active instead.`;
  } else if (searchMode === "hybrid") {
    searchSupportCopy = `Showing ranked matches for “${normalizedQuery}” using semantic and keyword search.`;
  } else if (searchMode === "fts") {
    searchSupportCopy = `Showing keyword-ranked matches for “${normalizedQuery}”.`;
  } else if (searchMode === "fallback") {
    searchSupportCopy = `Showing direct archive matches for “${normalizedQuery}” because the ranked database path was unavailable or too strict.`;
  } else {
    searchSupportCopy = `Showing local matches for “${normalizedQuery}”.`;
  }

  return (
    <main className="h-screen overflow-x-hidden overflow-y-auto bg-[#04050a] text-[#f4efdd]">
      <div
        className="relative min-h-full overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 18%, rgba(186,15,35,0.28), transparent 24%), radial-gradient(circle at 83% 12%, rgba(24,47,215,0.22), transparent 28%), radial-gradient(circle at 50% 72%, rgba(101,12,35,0.18), transparent 30%), repeating-radial-gradient(circle at 50% -16%, rgba(203,178,113,0.11) 0 1.2%, transparent 1.6% 9.5%), linear-gradient(180deg, rgba(2,4,9,0.98), rgba(3,4,9,1))",
          backgroundSize: "auto, auto, auto, 100% 100%, auto",
          backgroundPosition: "0 0, 0 0, 0 0, center top, 0 0",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <div className="absolute top-[-12rem] left-[-8rem] h-[26rem] w-[26rem] rounded-full bg-[#b10f2b]/18 blur-3xl" />
          <div className="absolute top-[15%] right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[#1637d9]/18 blur-3xl" />
          <div className="absolute bottom-[-10rem] left-[16%] h-[20rem] w-[20rem] rounded-full bg-[#7e0e27]/16 blur-3xl" />
          <div className="absolute inset-y-0 left-[8%] w-px bg-gradient-to-b from-transparent via-[#d7bd8b]/18 to-transparent" />
          <div className="absolute inset-y-0 right-[8%] w-px bg-gradient-to-b from-transparent via-[#2948d8]/18 to-transparent" />
        </div>

        <section className="@container relative mx-auto flex w-full max-w-[1800px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="overflow-hidden rounded-[1.6rem] border border-[#ccb07d]/22 bg-[linear-gradient(180deg,rgba(8,12,24,0.92),rgba(7,10,18,0.94))] shadow-[0_0_0_1px_rgba(210,47,66,0.08),0_32px_90px_rgba(0,0,0,0.55),0_0_90px_rgba(24,47,215,0.08)] backdrop-blur sm:rounded-[2rem]">
            <div className="border-b border-[#ccb07d]/12 bg-[linear-gradient(90deg,rgba(118,12,36,0.22),rgba(11,16,31,0.88),rgba(21,36,113,0.18))] px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-5 @xl:flex-row @xl:items-end @xl:justify-between">
                <div className="max-w-4xl">
                  <p className="text-[0.72rem] tracking-[0.38em] text-[#d2ac71] uppercase">
                    COFI Samples
                  </p>
                  <h1 className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-3 text-3xl leading-none font-semibold text-[#fbf0de] sm:text-5xl">
                    A better way to view COFI April 2026 samples.
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d4c8b7] sm:text-base">
                    Powered by EXOCORPSE, this gallery makes it easier to browse
                    artists, booths, and attendance days in one place. Tap any
                    card to open it fullscreen and inspect the artwork closely.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[#ccb07d]/16 bg-[linear-gradient(135deg,rgba(45,7,20,0.66),rgba(8,12,26,0.94),rgba(16,26,72,0.74))] px-5 py-4 text-sm text-[#d8d0bf] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
                  <p className="text-[0.68rem] tracking-[0.28em] text-[#aa8c64] uppercase">
                    Exocorpse View
                  </p>
                  <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-2 text-lg font-semibold text-[#fff6de]">
                    COFI April 2026 sample browser
                  </p>
                  <p className="mt-1 text-sm text-[#d0c2b0]">
                    Powered by EXOCORPSE for faster browsing across{" "}
                    {dataset.stats.uniqueArtists} artists and{" "}
                    {dataset.stats.totalSamples} sample images.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-b border-[#ccb07d]/12 px-5 py-5 sm:px-8 @lg:grid-cols-4">
              <div className="rounded-[1.5rem] border border-[#ccb07d]/14 bg-[linear-gradient(180deg,rgba(55,11,22,0.34),rgba(9,12,22,0.92))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
                <p className="text-[0.7rem] tracking-[0.26em] text-[#b08f64] uppercase">
                  Sample Sheets
                </p>
                <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-3 text-3xl font-semibold text-[#fff6de]">
                  {dataset.stats.totalSamples}
                </p>
                <p className="mt-2 text-sm text-[#d3c7b7]">
                  Sample sheets available in this viewer.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#2948d8]/16 bg-[linear-gradient(180deg,rgba(15,27,84,0.32),rgba(9,12,22,0.92))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
                <p className="text-[0.7rem] tracking-[0.26em] text-[#90a4ef] uppercase">
                  Artists
                </p>
                <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-3 text-3xl font-semibold text-[#fff6de]">
                  {dataset.stats.uniqueArtists}
                </p>
                <p className="mt-2 text-sm text-[#d3c7b7]">
                  Spread across {dataset.stats.uniqueBooths} booth locations.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#ccb07d]/14 bg-[linear-gradient(180deg,rgba(52,18,13,0.34),rgba(9,12,22,0.92))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
                <p className="text-[0.7rem] tracking-[0.26em] text-[#d5bb8d] uppercase">
                  Booth Mix
                </p>
                <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-3 text-3xl font-semibold text-[#fff6de]">
                  {dataset.stats.boothTypeCounts.STANDARD ?? 0}
                </p>
                <p className="mt-2 text-sm text-[#d3c7b7]">
                  Standard booths, with{" "}
                  {dataset.stats.boothTypeCounts.PREMIUM ?? 0} premium booths in
                  the archive.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#d23642]/16 bg-[linear-gradient(180deg,rgba(77,9,26,0.34),rgba(9,12,22,0.92))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
                <p className="text-[0.7rem] tracking-[0.26em] text-[#ef9491] uppercase">
                  Attendance Split
                </p>
                <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-3 text-3xl font-semibold text-[#fff6de]">
                  {dataset.stats.joiningDateCounts.BOTH_DAYS ?? 0}
                </p>
                <p className="mt-2 text-sm text-[#d3c7b7]">
                  Both days, plus {dataset.stats.joiningDateCounts.DAY_1 ?? 0}{" "}
                  day 1 only and {dataset.stats.joiningDateCounts.DAY_2 ?? 0}{" "}
                  day 2 only.
                </p>
              </div>
            </div>

            <div className="grid gap-4 border-b border-[#ccb07d]/12 bg-[linear-gradient(180deg,rgba(7,10,19,0.82),rgba(6,8,14,0.92))] px-5 py-5 sm:px-8 @xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
              <label className="grid gap-2">
                <span className="text-[0.72rem] tracking-[0.26em] text-[#b39165] uppercase">
                  Search
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#a48d74]">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search artist, booth, or attendance day"
                    className="w-full rounded-2xl border border-[#c8aa75]/16 bg-[linear-gradient(180deg,rgba(17,22,39,0.96),rgba(13,18,31,0.98))] py-3 pr-24 pl-12 text-base text-[#fff6de] transition outline-none placeholder:text-[#776e67] focus:border-[#d23642] focus:shadow-[0_0_0_1px_rgba(210,54,66,0.16)] sm:text-sm"
                  />
                  <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
                    {isBusy && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#efb06f]/25 bg-[#251811]/90 px-3 py-1 text-[0.68rem] font-medium tracking-[0.2em] text-[#ffd5a0] uppercase">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#efb06f]" />
                        Loading
                      </span>
                    )}
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="rounded-full border border-[#c8aa75]/16 bg-[#0d1424] px-3 py-1 text-xs font-medium text-[#dcd4c3] transition hover:border-[#d23642]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-[0.72rem] tracking-[0.26em] text-[#90a4ef] uppercase">
                  Booth Type
                </span>
                <select
                  value={boothType}
                  onChange={(event) => setBoothType(event.target.value)}
                  className="rounded-2xl border border-[#2948d8]/16 bg-[linear-gradient(180deg,rgba(16,22,41,0.96),rgba(11,17,31,0.98))] px-4 py-3 text-base text-[#fff6de] transition outline-none focus:border-[#2948d8] focus:shadow-[0_0_0_1px_rgba(41,72,216,0.16)] sm:text-sm"
                >
                  {boothTypes.map((option) => (
                    <option key={option} value={option}>
                      {option === "ALL"
                        ? "All booth types"
                        : formatBoothType(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-[0.72rem] tracking-[0.26em] text-[#ef9491] uppercase">
                  Attendance
                </span>
                <select
                  value={joiningDate}
                  onChange={(event) => setJoiningDate(event.target.value)}
                  className="rounded-2xl border border-[#d23642]/16 bg-[linear-gradient(180deg,rgba(16,22,41,0.96),rgba(11,17,31,0.98))] px-4 py-3 text-base text-[#fff6de] transition outline-none focus:border-[#d23642] focus:shadow-[0_0_0_1px_rgba(210,54,66,0.16)] sm:text-sm"
                >
                  {joiningDates.map((option) => (
                    <option key={option} value={option}>
                      {option === "ALL"
                        ? "All attendance days"
                        : formatJoiningDate(option)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <label className="grid gap-2">
                  <span className="text-[0.72rem] tracking-[0.26em] text-[#d5bb8d] uppercase">
                    Sort
                  </span>
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target
                          .value as (typeof SORT_OPTIONS)[number]["value"],
                      )
                    }
                    className="rounded-2xl border border-[#c8aa75]/16 bg-[linear-gradient(180deg,rgba(16,22,41,0.96),rgba(11,17,31,0.98))] px-4 py-3 text-base text-[#fff6de] transition outline-none focus:border-[#c8aa75] focus:shadow-[0_0_0_1px_rgba(200,170,117,0.14)] sm:text-sm"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setSortDirection((current) =>
                      current === "asc" ? "desc" : "asc",
                    )
                  }
                  className="mt-[1.45rem] rounded-2xl border border-[#c8aa75]/16 bg-[linear-gradient(180deg,rgba(16,22,41,0.96),rgba(11,17,31,0.98))] px-4 py-3 text-base text-[#fff6de] transition hover:border-[#d23642] sm:text-sm"
                >
                  {sortDirection === "asc" ? "Asc" : "Desc"}
                </button>
              </div>
            </div>

            <div className="px-5 py-4 sm:px-8">
              <div className="flex flex-col gap-4 rounded-[1.6rem] border border-[#ccb07d]/16 bg-[linear-gradient(180deg,rgba(10,13,24,0.92),rgba(7,9,16,0.96))] px-4 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(255,255,255,0.02)] sm:px-5">
                <div className="flex flex-col gap-3 @lg:flex-row @lg:items-center @lg:justify-between">
                  {isCustomizedView ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[0.68rem] font-semibold tracking-[0.22em] uppercase ${searchStatusTone}`}
                      >
                        {searchStatusLabel}
                      </span>
                      {normalizedQuery && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.72rem] text-[#e8dec6]">
                          Query: {normalizedQuery}
                        </span>
                      )}
                      {filtersActive && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.72rem] text-[#cfc7b5]">
                          Filters active
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-[0.72rem] tracking-[0.24em] text-[#b39165] uppercase">
                        Archive Overview
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {(query ||
                      filtersActive ||
                      sortBy !== "index" ||
                      sortDirection !== "asc") && (
                      <button
                        type="button"
                        onClick={() => {
                          startTransition(() => {
                            setQuery("");
                            setBoothType("ALL");
                            setJoiningDate("ALL");
                            setSortBy("index");
                            setSortDirection("asc");
                          });
                        }}
                        className="rounded-full border border-[#d23642]/25 bg-[linear-gradient(135deg,#2b0d16,#12182b)] px-4 py-2 text-sm font-medium text-[#fff0c6] transition hover:border-[#f17d6b]"
                      >
                        Reset view
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 @lg:grid-cols-[minmax(0,1.2fr)_auto] @lg:items-center">
                  <div>
                    <p className="text-sm text-[#f0e6d3]">
                      {isCustomizedView
                        ? searchSupportCopy
                        : archiveSupportCopy}
                    </p>
                    <p className="mt-1 text-sm text-[#c2b4a0]">
                      Showing{" "}
                      <span className="text-[#fff6de]">
                        {visibleSamples.length}
                      </span>{" "}
                      of{" "}
                      <span className="text-[#fff6de]">
                        {filteredSamples.length}
                      </span>{" "}
                      matches across{" "}
                      <span className="text-[#fff6de]">{artistsShown}</span>{" "}
                      artists.
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-[#ccb07d]/14 bg-[linear-gradient(180deg,rgba(18,24,40,0.96),rgba(10,14,25,0.98))] px-4 py-3 text-sm text-[#d8d0bf]">
                    <p className="text-[0.68rem] tracking-[0.22em] text-[#a98a60] uppercase">
                      {isCustomizedView ? "Results" : "Archive"}
                    </p>
                    <p className="mt-1 font-medium text-[#fff6de]">
                      {isBusy
                        ? "Updating visible results"
                        : visibleCount < filteredSamples.length
                          ? `${filteredSamples.length - visibleSamples.length} more samples remain`
                          : "All current results are on screen"}
                    </p>
                  </div>
                </div>

                <div className="relative h-2 overflow-hidden rounded-full bg-white/6">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isBusy
                        ? "animate-pulse bg-[linear-gradient(90deg,#d23642,#f1b26e)]"
                        : "bg-[linear-gradient(90deg,#2d49d8,#d23642,#d7c18b)]"
                    }`}
                    style={{
                      width: `${
                        isBusy
                          ? 100
                          : filteredSamples.length === 0
                            ? 0
                            : Math.max(
                                (visibleSamples.length /
                                  filteredSamples.length) *
                                  100,
                                6,
                              )
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {showEmptyState ? (
            <section className="rounded-[2rem] border border-[#ccb07d]/18 bg-[linear-gradient(180deg,rgba(12,18,32,0.94),rgba(8,11,19,0.98))] px-6 py-10 text-center shadow-[0_18px_45px_rgba(0,0,0,0.26)]">
              <p className="text-[0.72rem] tracking-[0.28em] text-[#b39165] uppercase">
                No Results
              </p>
              <h2 className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-3 text-3xl font-semibold text-[#fff6de]">
                Nothing matches this view.
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#d0c3b0]">
                Try a different artist name, booth code, or attendance day. You
                can also clear the search and filters to return to the full COFI
                April 2026 gallery.
              </p>
            </section>
          ) : (
            <section
              className={`grid gap-4 sm:gap-5 @md:grid-cols-2 @xl:grid-cols-3 @2xl:grid-cols-4 ${
                isBusy ? "opacity-80" : ""
              }`}
            >
              {visibleSamples.map((sample, visibleIndex) => {
                const artistSampleCount =
                  artistSampleCounts.get(sample.artistName) ?? 1;

                return (
                  <article
                    key={getSampleKey(sample)}
                    className="group overflow-hidden rounded-[1.4rem] border border-[#ccb07d]/16 bg-[linear-gradient(180deg,rgba(10,15,28,0.96),rgba(7,10,18,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.34),0_0_30px_rgba(27,44,132,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#d23642]/45 hover:shadow-[0_22px_60px_rgba(0,0,0,0.42),0_0_48px_rgba(210,54,66,0.12)] sm:rounded-[1.75rem]"
                    style={{
                      contentVisibility: "auto",
                      containIntrinsicSize: "520px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => void setSelectedKey(getSampleKey(sample))}
                      className="block w-full text-left"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#17120f]">
                        <Image
                          src={sample.image.thumbnail.localPath}
                          alt={`${sample.artistName} sample`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1600px) 50vw, 25vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          priority={visibleIndex < 8}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,8,14,0.06),rgba(7,8,14,0.18),rgba(6,9,16,0.88))]" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(174,16,44,0.18),transparent)] mix-blend-screen" />

                        <div className="absolute top-3 left-3 flex max-w-[calc(100%-5.5rem)] flex-wrap gap-2">
                          <span className="rounded-full border border-[#d7bf90]/30 bg-[rgba(34,18,20,0.82)] px-3 py-1 text-[0.68rem] font-semibold tracking-[0.22em] text-[#ffe3ab] uppercase">
                            {sample.boothLocation}
                          </span>
                          <span className="rounded-full border border-[#2948d8]/24 bg-[rgba(13,18,39,0.88)] px-3 py-1 text-[0.68rem] tracking-[0.2em] text-[#d4cdbb] uppercase">
                            {formatJoiningDate(sample.joiningDate)}
                          </span>
                        </div>

                        <span className="absolute top-3 right-3 rounded-full bg-[linear-gradient(135deg,#f2ad7a,#c83342)] px-3 py-2 text-xs font-semibold text-[#2f130b] shadow-[0_8px_18px_rgba(0,0,0,0.22)]">
                          Open
                        </span>
                      </div>

                      <div className="grid gap-4 p-4 sm:p-5">
                        <div>
                          <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] text-xl leading-tight font-semibold text-[#fff6de] sm:text-2xl">
                            {sample.artistName}
                          </p>
                          <p className="mt-2 text-sm text-[#d0c4b4] sm:text-base">
                            {formatBoothType(sample.boothType)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="rounded-full border border-[#ccb07d]/16 bg-[rgba(255,255,255,0.04)] px-3 py-1 text-[#d7d0bf]">
                            {artistSampleCount > 1
                              ? `${artistSampleCount} samples`
                              : "Single sample"}
                          </span>
                          <span className="text-[#f1b26e]">
                            View fullscreen
                          </span>
                        </div>
                      </div>
                    </button>
                  </article>
                );
              })}
            </section>
          )}

          <div className="flex flex-col items-center gap-3 pb-4">
            {isBusy ? (
              <p className="rounded-full border border-[#d23642]/30 bg-[rgba(35,13,18,0.9)] px-5 py-3 text-sm text-[#ffd7aa]">
                Searching and refreshing results...
              </p>
            ) : visibleCount < filteredSamples.length ? (
              <>
                <div
                  ref={loadMoreRef}
                  className="h-6 w-full"
                  aria-hidden="true"
                />
                <div className="rounded-full border border-[#ccb07d]/16 bg-[rgba(13,19,32,0.9)] px-5 py-3 text-sm text-[#d7d0bf]">
                  Scroll to keep loading more samples.
                </div>
                <button
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setVisibleCount((current) =>
                        Math.min(filteredSamples.length, current + PAGE_SIZE),
                      );
                    })
                  }
                  className="rounded-full border border-[#d23642]/25 bg-[linear-gradient(135deg,#2b0d16,#12182b)] px-5 py-3 text-sm font-medium text-[#fff0c6] transition hover:border-[#f17d6b]"
                >
                  Load 24 more
                </button>
              </>
            ) : (
              <p className="rounded-full border border-[#ccb07d]/16 bg-[rgba(13,19,32,0.9)] px-5 py-3 text-sm text-[#d7d0bf]">
                You have reached the end of this result set.
              </p>
            )}
          </div>
        </section>
      </div>

      {selectedSample && (
        <ZoomableSampleViewer
          sample={selectedSample}
          artistSampleCount={
            artistSampleCounts.get(selectedSample.artistName) ?? 1
          }
          onClose={() => void setSelectedKey(null)}
          onPrevious={
            selectedFilteredIndex > 0
              ? () =>
                  void setSelectedKey(
                    getSampleKey(filteredSamples[selectedFilteredIndex - 1]),
                  )
              : undefined
          }
          previousSample={
            selectedFilteredIndex > 0
              ? filteredSamples[selectedFilteredIndex - 1]
              : null
          }
          onNext={
            selectedFilteredIndex >= 0 &&
            selectedFilteredIndex < filteredSamples.length - 1
              ? () =>
                  void setSelectedKey(
                    getSampleKey(filteredSamples[selectedFilteredIndex + 1]),
                  )
              : undefined
          }
          nextSample={
            selectedFilteredIndex >= 0 &&
            selectedFilteredIndex < filteredSamples.length - 1
              ? filteredSamples[selectedFilteredIndex + 1]
              : null
          }
        />
      )}
    </main>
  );
}
