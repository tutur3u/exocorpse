import { useState } from "react";
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
};

// Reusable markdown components with consistent styling
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mt-3 mb-2 text-base font-bold text-gray-900 dark:text-gray-100">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="mt-2 mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-7 text-gray-700 dark:text-gray-300">
      {children}
    </p>
  ),
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
  strong: ({ children }) => (
    <strong className="font-bold text-gray-900 dark:text-gray-100">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="text-gray-800 italic dark:text-gray-200">{children}</em>
  ),
  ins: ({ children }) => (
    <ins className="text-gray-900 underline dark:text-gray-100">{children}</ins>
  ),
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
    <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  table: ({ children }) => (
    <table className="mb-4 w-full border-collapse">{children}</table>
  ),
  thead: ({ children }) => (
    <thead className="border-b-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 px-4 py-2 text-left font-bold text-gray-900 dark:border-gray-600 dark:text-gray-100">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-4 py-2 text-gray-700 dark:border-gray-600 dark:text-gray-300">
      {children}
    </td>
  ),
  hr: () => (
    <hr className="my-6 border-t-2 border-gray-300 dark:border-gray-600" />
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="mb-4 max-w-full rounded-lg shadow-md" />
  ),
};

export default function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder = "Enter markdown content...",
  helpText = "Supports markdown formatting",
  rows = 10,
  minHeight = "200px",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

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
          </div>

          {/* Textarea */}
          <textarea
            id={`markdown-textarea-${label}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="w-full rounded-b-lg border border-gray-300 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
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
              components={markdownComponents}
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
