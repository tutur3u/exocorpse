"use client";

import StorageImage from "@/components/shared/StorageImage";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

type ZoomableImageDialogProps = {
  isOpen: boolean;
  imageSrc: string | null | undefined;
  imageAlt: string;
  title?: string;
  signedUrl?: string | null;
  onClose: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ZoomableImageDialog({
  isOpen,
  imageSrc,
  imageAlt,
  title,
  signedUrl,
  onClose,
}: ZoomableImageDialogProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const pendingViewRef = useRef<{
    scale: number;
    offset: { x: number; y: number };
  } | null>(null);
  const mouseDragRef = useRef<{ startX: number; startY: number } | null>(null);
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStateRef = useRef<{
    distance: number;
    scale: number;
    offset: { x: number; y: number };
  } | null>(null);

  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isMouseDragging, setIsMouseDragging] = useState(false);

  const canPan = scale > 1;
  const isDragging = isInteracting || isMouseDragging;

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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    commitView(1, { x: 0, y: 0 });
    setDragState(null);
    setIsInteracting(false);
    setIsMouseDragging(false);
    mouseDragRef.current = null;
    activePointersRef.current.clear();
    pinchStateRef.current = null;
  }, [imageSrc, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
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
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (!mounted || !isOpen || !imageSrc) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] bg-[radial-gradient(circle_at_top,rgba(169,27,46,0.18),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(38,69,172,0.22),transparent_30%),linear-gradient(180deg,rgba(3,5,10,0.98),rgba(4,5,11,0.99))] backdrop-blur-md"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="flex h-dvh min-h-dvh flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zoomable-image-title"
      >
        <div className="shrink-0 border-b border-[#d5bb8d]/16 bg-[linear-gradient(90deg,rgba(114,17,39,0.24),rgba(8,13,24,0.84),rgba(20,42,116,0.2))] px-4 py-3 @md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.68rem] tracking-[0.28em] text-[#c9a56c] uppercase">
                Image Preview
              </p>
              <h2
                id="zoomable-image-title"
                className="mt-1 truncate font-serif text-xl font-semibold text-[#f8efdd] @md:text-2xl"
              >
                {title || imageAlt}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyScale(scale - 0.3)}
                disabled={scale <= 1}
                className="rounded-full border border-[#ceb17e]/20 bg-[#101523]/90 px-3 py-1.5 text-[0.82rem] text-[#ece4d0] transition hover:border-[#d23642] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => applyScale(1)}
                className="rounded-full border border-[#ceb17e]/20 bg-[#101523]/90 px-3 py-1.5 text-[0.82rem] text-[#ece4d0] transition hover:border-[#d23642] hover:text-white"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => applyScale(scale + 0.3)}
                disabled={scale >= 5}
                className="rounded-full border border-[#ceb17e]/20 bg-[#101523]/90 px-3 py-1.5 text-[0.82rem] text-[#ece4d0] transition hover:border-[#d23642] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                +
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#d23642]/30 bg-[linear-gradient(135deg,#34111a,#12182b)] px-3.5 py-1.5 text-[0.82rem] font-medium text-[#fff0c6] transition hover:border-[#f17d6b]"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
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
              <StorageImage
                src={imageSrc}
                signedUrl={signedUrl}
                alt={imageAlt}
                fill
                sizes="100vw"
                className="pointer-events-none object-contain select-none"
              />
            </div>

            <div className="pointer-events-none absolute right-4 bottom-4 hidden rounded-full border border-[#c9a56c]/20 bg-[#07101dcc] px-4 py-2 text-xs tracking-[0.24em] text-[#d7ccb6] uppercase @md:block">
              Wheel to zoom • double-click to toggle • drag to pan
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
