import { useStorageUrl } from "@/hooks/useStorageUrl";
import toastWithSound from "@/lib/toast";
import { useRef, useState } from "react";
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
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-4 text-3xl font-bold">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-3 text-2xl font-bold">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-xl font-bold">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 mb-2 text-lg font-bold">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="mt-3 mb-2 text-base font-bold">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="mt-2 mb-2 text-sm font-bold">{children}</h6>
  ),
  p: ({ children }) => <p className="mb-3 leading-7">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
    <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 dark:bg-gray-950">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50 py-1 pr-4 pl-4 text-gray-700 italic dark:border-blue-400 dark:bg-blue-900/20 dark:text-gray-300">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  table: ({ children }) => (
    <table className="mb-4 w-full border-collapse">{children}</table>
  ),
  thead: ({ children }) => (
    <thead className="border-b-2 border-gray-300 bg-gray-100">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-gray-200">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 px-4 py-2 text-left font-bold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-4 py-2">{children}</td>
  ),
  hr: () => <hr className="my-6 border-t-2 border-gray-300" />,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="mb-4 max-w-full rounded-lg shadow-md" />
  ),
};

// Component to render storage images with signed URL resolution
export function StorageImage({ src, alt }: { src?: string; alt?: string }) {
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
  return (
    <img
      src={imageSrc}
      alt={alt || "Image"}
      className="mb-4 w-full rounded-lg shadow-md"
    />
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
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const textarea = document.getElementById(
        `markdown-textarea-${label}`,
      ) as HTMLTextAreaElement;
      const start = textarea?.selectionStart ?? value.length;
      const markdownImage = `![image](${storagePath})`;
      const newText =
        value.substring(0, start) + markdownImage + value.substring(start);
      onChange(newText);
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
    const textarea = document.getElementById(
      `markdown-textarea-${label}`,
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length,
      );
    }, 0);
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
          const textarea = document.getElementById(
            `markdown-textarea-${label}`,
          ) as HTMLTextAreaElement;
          if (textarea) {
            const start = textarea.selectionStart;
            const markdownImage = `![image](${storagePath})`;
            const newText =
              value.substring(0, start) +
              markdownImage +
              value.substring(start);
            onChange(newText);
            toastWithSound.success("Image uploaded successfully!");
          }
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

      {/* Tabs */}
      <div className="mb-2 flex gap-2 border-b border-gray-300 dark:border-gray-600">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "write"
              ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Write Tab */}
      {activeTab === "write" && (
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-800">
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
              onClick={() => insertMarkdown("- ", "")}
              className="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Bullet List"
            >
              • List
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
              {isUploading ? "⏳" : "🖼️"} Image
            </button>
          </div>

          {/* Textarea */}
          <textarea
            id={`markdown-textarea-${label}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            rows={rows}
            placeholder={isUploading ? "Uploading image..." : placeholder}
            disabled={isUploading}
            className={`w-full rounded-b-lg border border-gray-300 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 ${isUploading ? "cursor-wait opacity-50" : ""}`}
            style={{ minHeight }}
          />
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <div
          className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700"
          style={{ minHeight }}
        >
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
