import { useStorageUrl } from "@/hooks/useStorageUrl";
import toastWithSound from "@/lib/toast";
import { Columns2, Eye, PenSquare } from "lucide-react";
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

type EditorTab = "write" | "preview" | "split";

export const markdownSurfaceClassName =
  "rounded-[1.75rem] border border-zinc-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,245,242,0.88))] px-5 py-5 text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-zinc-800/80 dark:bg-[linear-gradient(180deg,rgba(21,28,43,0.96),rgba(34,43,63,0.92))] dark:text-zinc-100";

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
      child.type === "img" ||
      child.type === "button" ||
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

export function renderMarkdownParagraph(children: React.ReactNode) {
  const className =
    "mb-4 text-[1rem] leading-8 whitespace-pre-wrap text-zinc-800 dark:text-zinc-100";

  if (paragraphNeedsBlockWrapper(children)) {
    return <div className={className}>{children}</div>;
  }

  return <p className={className}>{children}</p>;
}

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-5 font-serif text-4xl leading-tight font-semibold tracking-tight text-balance text-zinc-950 dark:text-zinc-50">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-4 font-serif text-3xl leading-tight font-semibold tracking-tight text-balance text-zinc-950 dark:text-zinc-50">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-7 mb-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 mb-3 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mt-5 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="mt-4 mb-2 text-sm font-semibold tracking-[0.18em] text-zinc-600 uppercase dark:text-zinc-400">
      {children}
    </h6>
  ),
  p: ({ children }) => renderMarkdownParagraph(children),
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
    <div
      role="separator"
      aria-orientation="horizontal"
      className="my-10 flex items-center gap-3 text-zinc-400 dark:text-zinc-500"
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-red-400/75 to-zinc-300/20 dark:via-red-300/70 dark:to-zinc-700/20" />
      <span className="h-1.5 w-1.5 rounded-full bg-red-400/70 dark:bg-red-300/70" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-red-400/75 to-zinc-300/20 dark:via-red-300/70 dark:to-zinc-700/20" />
    </div>
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      data-markdown-image="true"
      className="mx-auto my-8 block h-auto w-auto max-w-full rounded-[1.5rem] border border-zinc-200/80 shadow-[0_18px_48px_rgba(15,23,42,0.16)] @lg:max-w-2xl @2xl:max-w-3xl dark:border-zinc-800/80"
    />
  ),
};

export function StorageImage({
  src,
  alt,
  onOpen,
}: {
  src?: string;
  alt?: string;
  onOpen?: (image: { src: string; alt?: string }) => void;
}) {
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
      data-markdown-image="true"
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
  const [activeTab, setActiveTab] = useState<EditorTab>("write");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmedValue = value.trim();
  const wordCount = trimmedValue ? trimmedValue.split(/\s+/).length : 0;
  const lineCount = value ? value.split("\n").length : 0;
  const readingTimeMinutes =
    wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 180)) : 0;

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
      const ext = file.name.split(".").pop() || "png";
      const filename = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const fullPath = `${uploadPath}/${filename}`;

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
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

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
    placeholderText: string,
  ) => {
    updateSelection((selectedText) => {
      const textarea = textareaRef.current;
      const start = textarea?.selectionStart ?? value.length;
      const end = textarea?.selectionEnd ?? value.length;
      const block = selectedText || placeholderText;
      const replacement = block
        .split("\n")
        .map((line, index) => {
          const prefix =
            typeof getPrefix === "function" ? getPrefix(index) : getPrefix;
          return `${prefix}${line || placeholderText}`;
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
      const needsLeadingBreak =
        start > 0 && !value.slice(0, start).endsWith("\n\n");
      const needsTrailingBreak =
        end < value.length && !value.slice(end).startsWith("\n\n");
      const replacement = `${needsLeadingBreak ? "\n\n" : ""}---${
        needsTrailingBreak ? "\n\n" : ""
      }`;

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

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        setIsUploading(true);
        try {
          const ext = file.type.split("/")[1] || "png";
          const filename = `paste-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
          const fullPath = `${uploadPath}/${filename}`;

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
          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image");
          }

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

  const renderPreview = () => (
    <div
      className={`${markdownSurfaceClassName} @container max-w-none`}
      style={{ minHeight }}
    >
      {value ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            ...markdownComponents,
            p: ({ children }) => renderMarkdownParagraph(children),
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
        <div className="flex min-h-32 items-center justify-center">
          <div className="max-w-sm text-center">
            <p className="text-sm font-semibold tracking-[0.18em] text-zinc-500 uppercase dark:text-zinc-400">
              Preview idle
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Start writing to see headings, dividers, lists, quotes, and
              embedded images render here.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderTextarea = () => (
    <textarea
      ref={textareaRef}
      id={`markdown-textarea-${editorId}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPaste={handlePaste}
      rows={rows}
      placeholder={isUploading ? "Uploading image..." : placeholder}
      disabled={isUploading}
      className={`w-full resize-y border-0 bg-transparent px-5 py-5 font-mono text-[0.95rem] leading-7 text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${isUploading ? "cursor-wait opacity-50" : ""}`}
      style={{ minHeight }}
    />
  );

  const tabButtonClassName = (tab: EditorTab) =>
    `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
      activeTab === tab
        ? "border-red-400/45 bg-red-500/12 text-red-700 shadow-[0_8px_24px_rgba(185,28,28,0.12)] dark:border-red-300/35 dark:bg-red-300/12 dark:text-red-200"
        : "border-transparent bg-transparent text-zinc-500 hover:border-zinc-200 hover:bg-white/65 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
    }`;

  const toolbarButtonClassName =
    "rounded-full border border-transparent px-3 py-1.5 text-sm text-zinc-600 transition hover:border-zinc-200 hover:bg-white hover:text-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

  return (
    <div className="@container">
      <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
        {label}
      </label>
      <div className="overflow-hidden rounded-[1.75rem] border border-zinc-200/80 bg-[linear-gradient(180deg,rgba(250,248,245,0.98),rgba(243,239,235,0.92))] shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-zinc-700/70 dark:bg-[linear-gradient(180deg,rgba(18,23,36,0.98),rgba(12,16,27,0.94))]">
        <div className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-700/80 dark:bg-zinc-950/78">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={tabButtonClassName("write")}
              >
                <PenSquare className="h-4 w-4" />
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("split")}
                className={tabButtonClassName("split")}
              >
                <Columns2 className="h-4 w-4" />
                Split
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={tabButtonClassName("preview")}
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-semibold tracking-[0.22em] uppercase">
              <span className="rounded-full border border-zinc-200 bg-white/75 px-3 py-1 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400">
                {lineCount} lines
              </span>
              <span className="rounded-full border border-zinc-200 bg-white/75 px-3 py-1 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400">
                {wordCount} words
              </span>
              <span className="rounded-full border border-zinc-200 bg-white/75 px-3 py-1 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400">
                {readingTimeMinutes > 0
                  ? `~${readingTimeMinutes} min read`
                  : "Draft"}
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-200/70 bg-zinc-50/75 px-4 py-2 text-[0.72rem] font-medium tracking-[0.16em] text-zinc-500 uppercase dark:border-zinc-700/70 dark:bg-zinc-900/55 dark:text-zinc-400">
            Use `---` for dividers, paste images directly, and switch to split
            view when you need live layout feedback.
          </div>

          {activeTab !== "preview" && (
            <div className="flex flex-wrap gap-1 border-t border-zinc-200/80 bg-white/55 px-3 py-3 dark:border-zinc-700/80 dark:bg-zinc-950/38">
              <button
                type="button"
                onClick={() => insertMarkdown("# ", "")}
                className={toolbarButtonClassName}
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("## ", "")}
                className={toolbarButtonClassName}
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("### ", "")}
                className={toolbarButtonClassName}
                title="Heading 3"
              >
                H3
              </button>
              <div className="mx-1 my-1 w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
              <button
                type="button"
                onClick={() => insertMarkdown("**", "**")}
                className={`${toolbarButtonClassName} font-bold`}
                title="Bold"
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("*", "*")}
                className={`${toolbarButtonClassName} italic`}
                title="Italic"
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("`", "`")}
                className={`${toolbarButtonClassName} font-mono`}
                title="Code"
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("<ins>", "</ins>")}
                className={`${toolbarButtonClassName} underline`}
                title="Underline"
              >
                Underline
              </button>
              <div className="mx-1 my-1 w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
              <button
                type="button"
                onClick={() => prefixSelectedLines("- ", "List item")}
                className={toolbarButtonClassName}
                title="Bullet List"
              >
                Bullet
              </button>
              <button
                type="button"
                onClick={() =>
                  prefixSelectedLines((index) => `${index + 1}. `, "List item")
                }
                className={toolbarButtonClassName}
                title="Numbered List"
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() => prefixSelectedLines("> ", "Quoted text")}
                className={toolbarButtonClassName}
                title="Quote"
              >
                Quote
              </button>
              <button
                type="button"
                onClick={insertDivider}
                className={toolbarButtonClassName}
                title="Divider"
              >
                Divider
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("[", "](url)")}
                className={toolbarButtonClassName}
                title="Link"
              >
                Link
              </button>
              <div className="mx-1 my-1 w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
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
                className={toolbarButtonClassName}
                title="Upload Image"
              >
                {isUploading ? "Uploading..." : "Image"}
              </button>
            </div>
          )}
        </div>

        {activeTab === "write" && (
          <div className="bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.08),transparent_35%)] dark:bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.09),transparent_38%)]">
            {renderTextarea()}
          </div>
        )}

        {activeTab === "preview" && (
          <div className="p-4">{renderPreview()}</div>
        )}

        {activeTab === "split" && (
          <div className="grid gap-0 @2xl:grid-cols-2">
            <div className="border-b border-zinc-200/80 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.08),transparent_35%)] @2xl:border-r @2xl:border-b-0 dark:border-zinc-700/80 dark:bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.09),transparent_38%)]">
              {renderTextarea()}
            </div>
            <div className="p-4">{renderPreview()}</div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        {helpText && (
          <p className="max-w-3xl text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            {helpText}
          </p>
        )}
        <p className="text-right text-xs text-zinc-500 dark:text-zinc-400">
          {value.length} characters
        </p>
      </div>
    </div>
  );
}
