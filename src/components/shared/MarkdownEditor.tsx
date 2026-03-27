import { useStorageUrl } from "@/hooks/useStorageUrl";
import toastWithSound from "@/lib/toast";
import { Children, isValidElement, useId, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type MarkdownEditorProps = {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  helpText?: string;
  rows?: number;
  minHeight?: string;
  /** Optional upload path prefix for pasted images (e.g., "characters/123/content") */
  uploadPath?: string;
};

// Reusable markdown components with consistent styling
function paragraphNeedsBlockWrapper(children: React.ReactNode) {
  const normalizedChildren = Children.toArray(children).filter((child) => {
    return !(typeof child === "string" && child.trim().length === 0);
  });

  if (normalizedChildren.length === 0) {
    return false;
  }

  return normalizedChildren.some((child) => {
    if (!isValidElement(child)) {
      return false;
    }

    return (
      child.type === StorageImage ||
      child.type === "div" ||
      child.type === "figure" ||
      child.type === "pre" ||
      child.type === "table" ||
      child.type === "blockquote" ||
      child.type === "hr" ||
      child.type === "ul" ||
      child.type === "ol"
    );
  });
}

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-5 font-serif text-4xl leading-tight font-semibold tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-4 font-serif text-3xl leading-tight font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-7 mb-3 text-2xl font-semibold tracking-tight">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 mb-3 text-xl font-semibold tracking-tight">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mt-5 mb-2 text-lg font-semibold">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="mt-4 mb-2 text-sm font-semibold tracking-[0.18em] uppercase">
      {children}
    </h6>
  ),
  p: ({ children }) =>
    paragraphNeedsBlockWrapper(children) ? (
      <div className="mb-4 text-[1rem] leading-8 whitespace-pre-wrap">
        {children}
      </div>
    ) : (
      <p className="mb-4 text-[1rem] leading-8 whitespace-pre-wrap">
        {children}
      </p>
    ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-red-600 underline decoration-red-400/60 underline-offset-4 transition hover:text-red-500 dark:text-red-300 dark:decoration-red-300/50 dark:hover:text-red-200"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ins: ({ children }) => <ins className="underline">{children}</ins>,
  code: ({ children, className: codeClassName }) => {
    const isBlock = codeClassName?.startsWith("language-");
    return isBlock ? (
      <code className="block overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100 dark:bg-gray-950">
        {children}
      </code>
    ) : (
      <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-[1.5rem] bg-zinc-950 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)] dark:bg-black">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-red-500/60 bg-zinc-100/80 px-5 py-4 text-[1rem] leading-8 text-zinc-700 italic dark:bg-zinc-900/70 dark:text-zinc-300">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="my-5 ml-6 list-disc space-y-2 marker:text-red-500 dark:marker:text-red-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 ml-6 list-decimal space-y-2 marker:font-semibold marker:text-red-500 dark:marker:text-red-300">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1 leading-8 whitespace-pre-wrap">{children}</li>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-[1.5rem] border border-zinc-200/80 dark:border-zinc-800/80">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-zinc-300 bg-zinc-100/90 dark:border-zinc-700 dark:bg-zinc-900/90">
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="border-zinc-200 px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase dark:border-zinc-800">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-zinc-200 px-4 py-3 align-top dark:border-zinc-800">
      {children}
    </td>
  ),
  hr: () => (
    <hr className="my-8 border-0 border-t border-zinc-300/80 dark:border-zinc-700/80" />
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="mx-auto my-8 block h-auto w-auto max-w-full rounded-[1.5rem] border border-zinc-200/80 shadow-[0_18px_48px_rgba(15,23,42,0.16)] @lg:max-w-2xl @2xl:max-w-3xl dark:border-zinc-800/80"
    />
  ),
};

// Component to render storage images with signed URL resolution
export function StorageImage({
  src,
  alt,
  onOpen,
}: {
  src?: string;
  alt?: string;
  onOpen?: (image: { src: string; alt?: string }) => void;
}) {
  // Check if this is a storage path (not a full URL)
  const isStoragePath = Boolean(
    src && !src.startsWith("http") && !src.startsWith("/"),
  );
  const { signedUrl, loading } = useStorageUrl(
    isStoragePath ? src : null,
    isStoragePath,
  );

  const imageSrc = isStoragePath ? (signedUrl ?? undefined) : src;

  if (loading && isStoragePath) {
    return (
      <div className="mb-4 flex h-48 w-full animate-pulse items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Loading image...
        </span>
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div className="mb-4 flex h-48 w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <span className="text-sm text-gray-400 dark:text-gray-500">
          {alt || "Image not found"}
        </span>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  const imageElement = (
    <img
      src={imageSrc}
      alt={alt || "Image"}
      onClick={
        onOpen
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              onOpen({ src: imageSrc, alt });
            }
          : undefined
      }
      className={`mx-auto my-8 block h-auto w-auto max-w-full rounded-[1.5rem] border border-zinc-200/80 shadow-[0_18px_48px_rgba(15,23,42,0.16)] @lg:max-w-2xl @2xl:max-w-3xl dark:border-zinc-800/80 ${
        onOpen
          ? "cursor-zoom-in transition duration-200 hover:border-red-400/50 hover:shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
          : ""
      }`}
    />
  );

  if (!onOpen) {
    return imageElement;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onOpen({ src: imageSrc, alt });
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen({ src: imageSrc, alt });
        }
      }}
      className="group relative mx-auto my-8 block max-w-full bg-transparent text-left"
      aria-label={`Open fullscreen preview${alt ? ` for ${alt}` : ""}`}
    >
      {imageElement}
      <span className="pointer-events-none absolute right-3 bottom-3 rounded-full border border-white/15 bg-black/65 px-3 py-1 text-[0.68rem] font-medium tracking-[0.18em] text-white uppercase opacity-0 transition duration-200 group-hover:opacity-100">
        Fullscreen
      </span>
    </div>
  );
}

export default function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder = "Enter markdown content...",
  helpText = "Supports markdown formatting",
  rows = 10,
  minHeight = "200px",
  uploadPath = "markdown-images",
}: MarkdownEditorProps) {
  const editorId = useId();
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateSelection = (
    formatter: (selectedText: string) => {
      nextValue: string;
      selectionStart: number;
      selectionEnd: number;
    },
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      const fallback = formatter("");
      onChange(fallback.nextValue);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const formatted = formatter(selectedText);

    onChange(formatted.nextValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        formatted.selectionStart,
        formatted.selectionEnd,
      );
    }, 0);
  };

  const uploadImageFromFile = async (file: File) => {
    setIsUploading(true);
    try {
      // Generate unique filename
      const ext = file.name.split(".").pop() || "png";
      const filename = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const fullPath = `${uploadPath}/${filename}`;

      // Get signed upload URL
      const urlResponse = await fetch("/api/storage/signed-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: fullPath }),
      });

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { signedUrl, path: storagePath } = await urlResponse.json();

      // Upload to signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      // Insert markdown image at cursor
      updateSelection((selectedText) => {
        const textarea = textareaRef.current;
        const start = textarea?.selectionStart ?? value.length;
        const end = textarea?.selectionEnd ?? value.length;
        const markdownImage = `![image](${storagePath})`;
        const replacement = selectedText
          ? `${selectedText}\n${markdownImage}`
          : markdownImage;

        return {
          nextValue:
            value.substring(0, start) + replacement + value.substring(end),
          selectionStart: start + replacement.length,
          selectionEnd: start + replacement.length,
        };
      });
      toastWithSound.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toastWithSound.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      uploadImageFromFile(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const insertMarkdown = (before: string, after: string = "") => {
    updateSelection((selectedText) => {
      const textarea = textareaRef.current;
      const start = textarea?.selectionStart ?? value.length;
      const end = textarea?.selectionEnd ?? value.length;
      const replacement = `${before}${selectedText}${after}`;
      return {
        nextValue:
          value.substring(0, start) + replacement + value.substring(end),
        selectionStart: start + before.length,
        selectionEnd: start + before.length + selectedText.length,
      };
    });
  };

  const prefixSelectedLines = (
    getPrefix: string | ((index: number) => string),
    placeholder: string,
  ) => {
    updateSelection((selectedText) => {
      const textarea = textareaRef.current;
      const start = textarea?.selectionStart ?? value.length;
      const end = textarea?.selectionEnd ?? value.length;
      const block = selectedText || placeholder;
      const replacement = block
        .split("\n")
        .map((line, index) => {
          const prefix =
            typeof getPrefix === "function" ? getPrefix(index) : getPrefix;
          return `${prefix}${line || placeholder}`;
        })
        .join("\n");

      return {
        nextValue:
          value.substring(0, start) + replacement + value.substring(end),
        selectionStart: start,
        selectionEnd: start + replacement.length,
      };
    });
  };

  const insertDivider = () => {
    updateSelection(() => {
      const textarea = textareaRef.current;
      const start = textarea?.selectionStart ?? value.length;
      const end = textarea?.selectionEnd ?? value.length;
      const prefix =
        start > 0 && !value.slice(0, start).endsWith("\n") ? "\n" : "";
      const suffix =
        end < value.length && !value.slice(end).startsWith("\n") ? "\n" : "";
      const replacement = `${prefix}\n---\n${suffix}`;

      return {
        nextValue:
          value.substring(0, start) + replacement + value.substring(end),
        selectionStart: start + replacement.length,
        selectionEnd: start + replacement.length,
      };
    });
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // Check for image in clipboard
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        setIsUploading(true);
        try {
          // Generate unique filename
          const ext = file.type.split("/")[1] || "png";
          const filename = `paste-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
          const fullPath = `${uploadPath}/${filename}`;

          // Get signed upload URL
          const urlResponse = await fetch("/api/storage/signed-upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: fullPath }),
          });

          if (!urlResponse.ok) {
            const errorData = await urlResponse.json();
            throw new Error(errorData.error || "Failed to get upload URL");
          }

          const { signedUrl, path: storagePath } = await urlResponse.json();

          // Upload to signed URL
          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image");
          }

          // Insert markdown image at cursor
          updateSelection((selectedText) => {
            const textarea = textareaRef.current;
            const start = textarea?.selectionStart ?? value.length;
            const end = textarea?.selectionEnd ?? value.length;
            const markdownImage = `![image](${storagePath})`;
            const replacement = selectedText
              ? `${selectedText}\n${markdownImage}`
              : markdownImage;

            return {
              nextValue:
                value.substring(0, start) + replacement + value.substring(end),
              selectionStart: start + replacement.length,
              selectionEnd: start + replacement.length,
            };
          });
          toastWithSound.success("Image uploaded successfully!");
        } catch (error) {
          console.error("Failed to paste image:", error);
          toastWithSound.error(
            error instanceof Error ? error.message : "Failed to paste image",
          );
        } finally {
          setIsUploading(false);
        }
        return;
      }
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
        <div className="sticky top-0 z-10 border-b border-gray-300 bg-white/95 backdrop-blur-sm dark:border-gray-600 dark:bg-gray-700/95">
          <div className="flex gap-2 px-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "write"
                  ? "border border-gray-300 border-b-transparent bg-white text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "border border-gray-300 border-b-transparent bg-white text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Preview
            </button>
          </div>

          {activeTab === "write" && (
            <div className="flex flex-wrap gap-1 border-t border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => insertMarkdown("# ", "")}
                className="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("## ", "")}
                className="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("### ", "")}
                className="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Heading 3"
              >
                H3
              </button>
              <div className="mx-1 border-l border-gray-300 dark:border-gray-600" />
              <button
                type="button"
                onClick={() => insertMarkdown("**", "**")}
                className="rounded px-2 py-1 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("*", "*")}
                className="rounded px-2 py-1 text-sm italic hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("`", "`")}
                className="rounded px-2 py-1 font-mono text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Code"
              >
                {"<>"}
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("<ins>", "</ins>")}
                className="rounded px-2 py-1 text-sm underline hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Underline"
              >
                U
              </button>
              <div className="mx-1 border-l border-gray-300 dark:border-gray-600" />
              <button
                type="button"
                onClick={() => prefixSelectedLines("- ", "List item")}
                className="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Bullet List"
              >
                Bullet
              </button>
              <button
                type="button"
                onClick={() =>
                  prefixSelectedLines((index) => `${index + 1}. `, "List item")
                }
                className="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Numbered List"
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() => prefixSelectedLines("> ", "Quoted text")}
                className="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Quote"
              >
                Quote
              </button>
              <button
                type="button"
                onClick={insertDivider}
                className="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Divider"
              >
                Divider
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("[", "](url)")}
                className="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Link"
              >
                Link
              </button>
              <div className="mx-1 border-l border-gray-300 dark:border-gray-600" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload image"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded px-2 py-1 text-sm hover:bg-gray-200 disabled:cursor-wait disabled:opacity-50 dark:hover:bg-gray-700"
                title="Upload Image"
              >
                {isUploading ? "Uploading..." : "Image"}
              </button>
            </div>
          )}
        </div>

        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            id={`markdown-textarea-${editorId}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            rows={rows}
            placeholder={isUploading ? "Uploading image..." : placeholder}
            disabled={isUploading}
            className={`w-full border-0 px-3 py-2 font-mono text-sm focus:ring-0 dark:bg-gray-700 ${isUploading ? "cursor-wait opacity-50" : ""}`}
            style={{ minHeight }}
          />
        ) : (
          <div className="@container max-w-none p-4" style={{ minHeight }}>
            {value ? (
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
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No content to preview
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-between">
        {/* Help Text */}
        {helpText && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}

        {/* Character count */}
        <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
          {value.length} characters
        </p>
      </div>
    </div>
  );
}
