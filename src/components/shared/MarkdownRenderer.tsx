"use client";

import StorageImage from "@/components/shared/StorageImage";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { markdownComponents, renderMarkdownParagraph } from "./MarkdownEditor";

type MarkdownRendererProps = {
  content: string;
  className?: string;
  onImageClick?: (image: { src: string; alt?: string }) => void;
};

export default function MarkdownRenderer({
  content,
  className = "max-w-none",
  onImageClick,
}: MarkdownRendererProps) {
  if (!content) {
    return null;
  }

  return (
    <div className={`@container ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          ...markdownComponents,
          p: ({ children }) => renderMarkdownParagraph(children),
          img: ({ src, alt }) => {
            const imageSrc = typeof src === "string" ? src : undefined;

            if (!imageSrc) {
              return null;
            }

            return (
              <div
                className={`markdown-fullscreen-trigger group relative mx-auto my-8 block max-w-full ${
                  onImageClick ? "cursor-zoom-in" : ""
                }`}
                data-markdown-fullscreen-src={imageSrc}
                data-markdown-fullscreen-alt={alt || ""}
                onClick={
                  onImageClick
                    ? () =>
                        onImageClick({
                          src: imageSrc,
                          alt: alt || undefined,
                        })
                    : undefined
                }
                onPointerUp={
                  onImageClick
                    ? () =>
                        onImageClick({
                          src: imageSrc,
                          alt: alt || undefined,
                        })
                    : undefined
                }
              >
                <StorageImage
                  src={imageSrc}
                  alt={alt || "Image"}
                  width={1600}
                  height={900}
                  onClick={
                    onImageClick
                      ? () =>
                          onImageClick({
                            src: imageSrc,
                            alt: alt || undefined,
                          })
                      : undefined
                  }
                  className={`markdown-fullscreen-image mx-auto block h-auto w-auto max-w-full rounded-[1.5rem] border border-zinc-200/80 shadow-[0_18px_48px_rgba(15,23,42,0.16)] @lg:max-w-2xl @2xl:max-w-3xl dark:border-zinc-800/80 ${
                    onImageClick
                      ? "transition duration-200 hover:border-red-400/50 hover:shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
                      : ""
                  }`}
                />
                {onImageClick && (
                  <span className="pointer-events-none absolute right-3 bottom-3 rounded-full border border-white/15 bg-black/65 px-3 py-1 text-[0.68rem] font-medium tracking-[0.18em] text-white uppercase opacity-0 transition duration-200 group-hover:opacity-100">
                    Fullscreen
                  </span>
                )}
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
