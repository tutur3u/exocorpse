"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { markdownComponents, StorageImage } from "./MarkdownEditor";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export default function MarkdownRenderer({
  content,
  className = "prose prose-sm dark:prose-invert max-w-none",
}: MarkdownRendererProps) {
  if (!content) {
    return null;
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          ...markdownComponents,
          img: ({ src, alt }) => (
            <StorageImage
              src={typeof src === "string" ? src : undefined}
              alt={alt}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
