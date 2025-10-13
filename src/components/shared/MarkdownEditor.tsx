import { useState } from "react";

type MarkdownEditorProps = {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  helpText?: string;
  rows?: number;
  minHeight?: string;
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

  // Simple markdown to HTML converter (basic implementation)
  const renderMarkdown = (text: string): string => {
    if (!text)
      return "<p class='text-gray-500 dark:text-gray-400'>No content to preview</p>";

    let html = text;

    // Headers
    html = html.replace(
      /^### (.*$)/gim,
      "<h3 class='text-xl font-bold mt-4 mb-2'>$1</h3>",
    );
    html = html.replace(
      /^## (.*$)/gim,
      "<h2 class='text-2xl font-bold mt-6 mb-3'>$1</h2>",
    );
    html = html.replace(
      /^# (.*$)/gim,
      "<h1 class='text-3xl font-bold mt-8 mb-4'>$1</h1>",
    );

    // Bold
    html = html.replace(
      /\*\*(.*?)\*\*/gim,
      "<strong class='font-bold'>$1</strong>",
    );

    // Italic
    html = html.replace(/\*(.*?)\*/gim, "<em class='italic'>$1</em>");

    // Code blocks
    html = html.replace(
      /```([\s\S]*?)```/gim,
      "<pre class='bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2 mb-2 overflow-x-auto'><code>$1</code></pre>",
    );

    // Inline code
    html = html.replace(
      /`(.*?)`/gim,
      "<code class='bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm'>$1</code>",
    );

    // Lists
    html = html.replace(/^\* (.*$)/gim, "<li class='ml-4'>$1</li>");
    html = html.replace(/^\- (.*$)/gim, "<li class='ml-4'>$1</li>");
    html = html.replace(/^(\d+)\. (.*$)/gim, "<li class='ml-4'>$2</li>");

    // Links
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/gim,
      "<a href='$2' class='text-blue-600 dark:text-blue-400 underline' target='_blank' rel='noopener noreferrer'>$1</a>",
    );

    // Line breaks
    html = html.replace(/\n\n/gim, "</p><p class='mb-2'>");
    html = html.replace(/\n/gim, "<br/>");

    // Wrap in paragraph
    if (!html.startsWith("<")) {
      html = "<p class='mb-2'>" + html + "</p>";
    }

    return html;
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
          <div className="mb-2 flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-800">
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
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      )}

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
  );
}
