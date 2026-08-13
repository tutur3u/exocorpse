import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { createPortal } from "react-dom";

export type LightboxContent = {
  imageUrl: string;
  title: string;
  description?: string | null;
  footer?: ReactNode;
  signedUrl?: string; // Optional pre-fetched signed URL
  download?: { filename: string };
};

type LightboxProps = {
  content: LightboxContent | null;
  onClose: () => void;
  imageAlt?: string;
  onNext?: () => void;
  onPrevious?: () => void;
};

export default function Lightbox({
  content,
  onClose,
  imageAlt = "Lightbox image",
  onNext,
  onPrevious,
}: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  async function downloadImage() {
    if (!content?.download) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const response = await fetch(content.signedUrl || content.imageUrl);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const extension = blob.type.split("/")[1]?.split("+")[0] || "png";
      link.download = `${content.download.filename.replace(/[^a-z0-9_-]+/gi, "-")}.${extension}`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      setDownloadError("The image could not be downloaded. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    prevFocus.current = document.activeElement as HTMLElement | null;
    // lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // focus dialog after mount
    setTimeout(() => dialogRef.current?.focus(), 0);
    // Esc to close
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrevious) onPrevious();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
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
      className="bg-opacity-95 animate-fadeIn fixed inset-0 z-10001 flex flex-col bg-black p-4"
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
          <StorageImage
            src={content.imageUrl}
            signedUrl={content.signedUrl}
            alt={imageAlt}
            className="h-full w-full object-contain"
            width={1280}
            height={720}
            sizes="100vw"
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
            <MarkdownRenderer
              content={content.description}
              className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            />
          )}
          {content.footer && <div>{content.footer}</div>}
          {content.download ? (
            <button
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60 dark:bg-white dark:text-gray-900"
              disabled={downloading}
              onClick={downloadImage}
              type="button"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Preparing download…" : "Download reference sheet"}
            </button>
          ) : null}
          {downloadError ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {downloadError}
            </p>
          ) : null}
        </div>
        {onPrevious && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="bg-opacity-60 hover:bg-opacity-80 absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black p-3 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-2xl"
            aria-label="Previous image"
          >
            <svg
              className="h-6 w-6"
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
        {onNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="bg-opacity-60 hover:bg-opacity-80 absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black p-3 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-2xl"
            aria-label="Next image"
          >
            <svg
              className="h-6 w-6"
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
