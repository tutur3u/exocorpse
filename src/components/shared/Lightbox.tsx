import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type LightboxContent = {
  imageUrl: string;
  title: string;
  description?: string | null;
  footer?: ReactNode;
};

type LightboxProps = {
  content: LightboxContent | null;
  onClose: () => void;
  imageAlt?: string;
};

export default function Lightbox({
  content,
  onClose,
  imageAlt = "Lightbox image",
}: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    prevFocus.current = document.activeElement as HTMLElement | null;
    // lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // focus dialog after mount
    setTimeout(() => dialogRef.current?.focus(), 0);
    // Esc to close
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!content || !mounted) return null;

  const lightboxContent = (
    <div
      className="bg-opacity-95 animate-fadeIn fixed inset-0 z-[10001] flex flex-col bg-black p-4"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        className="animate-slideUp flex flex-1 flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        tabIndex={-1}
      >
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
          <Image
            src={content.imageUrl}
            alt={imageAlt}
            className="h-full w-full object-contain"
            width={1280}
            height={720}
          />
        </div>
        <div className="mt-6 max-h-[25vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          <h3
            id="lightbox-title"
            className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100"
          >
            {content.title}
          </h3>
          {content.description && (
            <p className="leading-relaxed text-gray-600 dark:text-gray-400">
              {content.description}
            </p>
          )}
          {content.footer && <div>{content.footer}</div>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="bg-opacity-60 hover:bg-opacity-80 absolute top-4 right-4 rounded-full bg-black p-3 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-2xl"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Close lightbox</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body);
}
