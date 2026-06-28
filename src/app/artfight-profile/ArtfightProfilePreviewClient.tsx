"use client";

import {
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileCode2,
  ImageIcon,
  Monitor,
  NotebookText,
  Palette,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StreamdownProps } from "streamdown";

type ProfileSource = {
  inlineHtml: string;
  supporterHtml: string;
  supporterCss: string;
  readme: string;
};

type ArtfightProfilePreviewClientProps = {
  source: ProfileSource;
};

type PreviewMode = "supporter" | "inline";
type CodeMode = "inlineHtml" | "supporterHtml" | "supporterCss";
type DialogMode = "preview" | "placeholders" | "code" | "notes";

const codeTabs: Array<{
  id: CodeMode;
  label: string;
  fileName: string;
  description: string;
  language: "css" | "html";
}> = [
  {
    id: "inlineHtml",
    label: "Inline HTML",
    fileName: "inline-html.html",
    description: "Single paste field for non-Supporter ArtFight profiles.",
    language: "html",
  },
  {
    id: "supporterHtml",
    label: "Supporter HTML",
    fileName: "supporter-css.html",
    description: "Profile HTML to pair with the Supporter CSS payload.",
    language: "html",
  },
  {
    id: "supporterCss",
    label: "Supporter CSS",
    fileName: "supporter-profile.css",
    description: "Custom CSS for ArtFight Supporter profile styling.",
    language: "css",
  },
];

const placeholders = [
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_HEADER",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MAIN_PORTRAIT",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_FENRYS",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MORRIS",
  "REPLACE_WITH_ARTFIGHT_USERNAME",
];

const Streamdown = dynamic<StreamdownProps>(
  async () => {
    const [{ Streamdown }, { code }] = await Promise.all([
      import("streamdown"),
      import("@streamdown/code"),
    ]);

    return function HighlightedStreamdown(props: StreamdownProps) {
      return <Streamdown plugins={{ code }} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="text-sm leading-6 text-slate-400">Loading preview...</div>
    ),
  },
);

const previewImageReplacements: Record<string, string> = {
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_HEADER: "/background-image.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MAIN_PORTRAIT: "/LykoTwins.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_FENRYS: "/boot/Fenrys.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MORRIS: "/boot/Morris.webp",
  REPLACE_WITH_ARTFIGHT_USERNAME: "exocorpse",
};

const previewShellCss = `
  html, body {
    min-height: 100%;
    margin: 0;
    background:
      radial-gradient(circle at 18% 8%, rgba(251, 113, 133, 0.18), transparent 28%),
      radial-gradient(circle at 78% 4%, rgba(34, 211, 238, 0.12), transparent 28%),
      #020617;
  }

  body {
    padding: 24px;
  }

  @media (max-width: 700px) {
    body {
      padding: 10px;
    }
  }
`;

const inlinePreviewCss = `
  ${previewShellCss}

  .container-fluid {
    width: 100%;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
  }

  .no-gutters {
    margin-right: 0;
    margin-left: 0;
  }

  .p-2 {
    padding: 0.5rem;
  }

  .p-3 {
    padding: 1rem;
  }

  .col-lg-4,
  .col-lg-8,
  .col-md-6 {
    position: relative;
    width: 100%;
  }

  @media (min-width: 768px) {
    .col-md-6 {
      flex: 0 0 50%;
      max-width: 50%;
    }
  }

  @media (min-width: 992px) {
    .col-lg-4 {
      flex: 0 0 33.333333%;
      max-width: 33.333333%;
    }

    .col-lg-8 {
      flex: 0 0 66.666667%;
      max-width: 66.666667%;
    }
  }
`;

function applyPreviewReplacements(value: string) {
  return Object.entries(previewImageReplacements).reduce(
    (current, [token, replacement]) => current.replaceAll(token, replacement),
    value,
  );
}

function buildSrcDoc(body: string, css: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>${css}</style>
  </head>
  <body>${body}</body>
</html>`;
}

function buildCodeMarkdown(language: string, code: string) {
  const longestBacktickRun = Math.max(
    0,
    ...Array.from(code.matchAll(/`+/g), (match) => match[0].length),
  );
  const fence = "`".repeat(Math.max(3, longestBacktickRun + 1));

  return `${fence}${language}\n${code}\n${fence}`;
}

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function downloadTextFile(fileName: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

function DialogFrame({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/82 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[min(760px,calc(100vh-32px))] w-full max-w-3xl overflow-hidden border border-rose-300/35 bg-[#060912] text-slate-100 shadow-[0_28px_90px_rgba(2,6,23,0.8)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-700/80 bg-slate-950/88 px-4 py-3">
          <div>
            <h2 className="text-xl font-bold tracking-[0.04em] text-rose-50 uppercase">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-5 text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-slate-600/70 bg-slate-900 text-slate-100 transition hover:border-rose-200 hover:text-rose-100"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(min(760px,100vh-32px)-76px)] overflow-auto p-4">
          {children}
        </div>
      </section>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 border border-slate-600/70 bg-slate-900/80 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-200/70 hover:bg-cyan-300/10 hover:text-cyan-100"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function ArtfightProfilePreviewClient({
  source,
}: ArtfightProfilePreviewClientProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("supporter");
  const [codeMode, setCodeMode] = useState<CodeMode>("inlineHtml");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogMode | null>(null);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);

  const previewDocuments = useMemo(
    () => ({
      inline: buildSrcDoc(
        applyPreviewReplacements(source.inlineHtml),
        inlinePreviewCss,
      ),
      supporter: buildSrcDoc(
        applyPreviewReplacements(source.supporterHtml),
        `${previewShellCss}\n${source.supporterCss}`,
      ),
    }),
    [source.inlineHtml, source.supporterCss, source.supporterHtml],
  );

  const activeCodeTab = codeTabs.find((tab) => tab.id === codeMode);
  const activeCode = source[codeMode];
  const activeCodeMarkdown = useMemo(
    () => buildCodeMarkdown(activeCodeTab?.language ?? "html", activeCode),
    [activeCode, activeCodeTab?.language],
  );
  const previewTitle =
    previewMode === "supporter"
      ? "Fenrys & Morris supporter preview"
      : "Fenrys & Morris inline preview";

  useEffect(() => {
    if (!activeDialog && !copyMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDialog(null);
        setCopyMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDialog, copyMenuOpen]);

  useEffect(() => {
    if (!copyMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!copyMenuRef.current?.contains(event.target as Node)) {
        setCopyMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [copyMenuOpen]);

  const handleCopy = async (id: string, text: string) => {
    await writeClipboard(text);
    setCopiedId(id);
    setCopyMenuOpen(false);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <main className="h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="@container flex h-full flex-col">
        <header className="shrink-0 border-b border-rose-300/25 bg-slate-950/95 px-4 py-3 shadow-[0_18px_48px_rgba(2,6,23,0.44)]">
          <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
            <h1 className="text-3xl leading-none font-bold tracking-[0.03em] text-rose-50 uppercase @lg:text-4xl">
              Artfight Profile
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative" ref={copyMenuRef}>
                <button
                  type="button"
                  onClick={() => setCopyMenuOpen((current) => !current)}
                  className="inline-flex items-center gap-2 border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/18"
                  aria-haspopup="menu"
                  aria-expanded={copyMenuOpen}
                >
                  {copiedId ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                  {copiedId
                    ? `Copied ${
                        codeTabs.find((tab) => tab.id === copiedId)?.label ??
                        "Code"
                      }`
                    : "Copy"}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {copyMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 z-30 mt-2 w-56 border border-cyan-300/30 bg-[#07101b] p-1 shadow-[0_18px_48px_rgba(2,6,23,0.72)]"
                  >
                    {codeTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="menuitem"
                        onClick={() => handleCopy(tab.id, source[tab.id])}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-cyan-300/12 hover:text-cyan-100"
                      >
                        <span>{tab.label}</span>
                        {copiedId === tab.id ? (
                          <Check className="h-4 w-4 text-cyan-200" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <ActionButton
                icon={Palette}
                label="Preview Mode"
                onClick={() => setActiveDialog("preview")}
              />
              <ActionButton
                icon={ImageIcon}
                label="Placeholders"
                onClick={() => setActiveDialog("placeholders")}
              />
              <ActionButton
                icon={FileCode2}
                label="Code"
                onClick={() => setActiveDialog("code")}
              />
              <ActionButton
                icon={NotebookText}
                label="Notes"
                onClick={() => setActiveDialog("notes")}
              />
            </div>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col bg-[#030712]">
          <div className="min-h-0 flex-1 bg-[radial-gradient(circle_at_20%_10%,rgba(251,113,133,0.13),transparent_28%),radial-gradient(circle_at_78%_0%,rgba(34,211,238,0.11),transparent_24%),#020617] p-3 @lg:p-5">
            <iframe
              key={previewMode}
              title={previewTitle}
              srcDoc={previewDocuments[previewMode]}
              className="h-full w-full border border-rose-300/35 bg-slate-950 shadow-[0_26px_70px_rgba(2,6,23,0.65)]"
              sandbox=""
            />
          </div>
        </section>
      </div>

      {activeDialog === "preview" ? (
        <DialogFrame
          title="Preview Mode"
          description="Choose which ArtFight version to inspect in the live preview."
          onClose={() => setActiveDialog(null)}
        >
          <div className="grid gap-3 @lg:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setPreviewMode("supporter");
                setActiveDialog(null);
              }}
              className={`border p-4 text-left transition ${
                previewMode === "supporter"
                  ? "border-rose-200 bg-rose-300/14 text-rose-50"
                  : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-rose-300/60"
              }`}
            >
              <Palette className="mb-3 h-5 w-5" />
              <h3 className="font-bold">Supporter CSS</h3>
              <p className="mt-2 text-sm leading-5 text-slate-400">
                Shows the HTML paired with the custom CSS profile theme.
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewMode("inline");
                setActiveDialog(null);
              }}
              className={`border p-4 text-left transition ${
                previewMode === "inline"
                  ? "border-cyan-200 bg-cyan-300/14 text-cyan-50"
                  : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-cyan-300/60"
              }`}
            >
              <Monitor className="mb-3 h-5 w-5" />
              <h3 className="font-bold">Inline HTML</h3>
              <p className="mt-2 text-sm leading-5 text-slate-400">
                Shows the fallback profile using inline styles only.
              </p>
            </button>
          </div>
        </DialogFrame>
      ) : null}

      {activeDialog === "placeholders" ? (
        <DialogFrame
          title="Placeholders"
          description="Replace these tokens before using the profile on ArtFight."
          onClose={() => setActiveDialog(null)}
        >
          <div className="grid gap-2 font-mono text-xs text-slate-300">
            {placeholders.map((placeholder) => (
              <div
                key={placeholder}
                className="border border-slate-700/80 bg-slate-900/80 p-3 break-all"
              >
                {placeholder}
              </div>
            ))}
          </div>
        </DialogFrame>
      ) : null}

      {activeDialog === "code" ? (
        <DialogFrame
          title="Code"
          description="Inspect highlighted source files, copy, or download the active payload."
          onClose={() => setActiveDialog(null)}
        >
          <div className="grid grid-cols-3 border border-slate-700/70">
            {codeTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCodeMode(tab.id)}
                className={`px-2 py-3 text-xs font-semibold transition @lg:text-sm ${
                  codeMode === tab.id
                    ? "bg-rose-300/14 text-rose-100"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-50">
                {activeCodeTab?.fileName}
              </h3>
              <p className="mt-1 text-sm leading-5 text-slate-400">
                {activeCodeTab?.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(codeMode, activeCode)}
                className="inline-flex h-9 w-9 items-center justify-center border border-cyan-300/40 bg-cyan-300/10 text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/18"
                title="Copy active code"
                aria-label="Copy active code"
              >
                {copiedId === codeMode ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    activeCodeTab?.fileName ?? "artfight-profile.txt",
                    activeCode,
                  )
                }
                className="inline-flex h-9 w-9 items-center justify-center border border-slate-500/50 bg-slate-800 text-slate-100 transition hover:bg-slate-700"
                title="Download active code"
                aria-label="Download active code"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            role="region"
            aria-label={`${activeCodeTab?.label} highlighted source code`}
            className="mt-4 h-96 overflow-auto border border-slate-700 bg-[#020617]"
          >
            <Streamdown
              mode="static"
              controls={false}
              lineNumbers
              shikiTheme={["github-light", "github-dark"]}
              className="h-full text-xs leading-5 text-slate-200 [&_[data-streamdown='code-block']]:my-0 [&_[data-streamdown='code-block']]:h-full [&_[data-streamdown='code-block']]:rounded-none [&_[data-streamdown='code-block']]:border-0 [&_[data-streamdown='code-block']]:bg-[#020617] [&_[data-streamdown='code-block']]:p-0 [&_[data-streamdown='code-block-body']]:h-full [&_[data-streamdown='code-block-body']]:overflow-auto [&_[data-streamdown='code-block-body']]:rounded-none [&_[data-streamdown='code-block-body']]:border-0 [&_[data-streamdown='code-block-body']]:bg-[#020617] [&_[data-streamdown='code-block-body']]:p-3 [&_code]:font-mono [&_pre]:min-w-max [&_pre]:bg-transparent"
            >
              {activeCodeMarkdown}
            </Streamdown>
          </div>
        </DialogFrame>
      ) : null}

      {activeDialog === "notes" ? (
        <DialogFrame
          title="Notes"
          description="Usage notes for the local profile pack."
          onClose={() => setActiveDialog(null)}
        >
          <Streamdown
            mode="static"
            controls={false}
            className="max-h-[54vh] overflow-auto text-sm leading-6 text-slate-300 [&_a]:text-cyan-200 [&_a]:underline [&_code]:border [&_code]:border-slate-700 [&_code]:bg-slate-950 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-rose-100 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-rose-50 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-cyan-100 [&_li]:my-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_strong]:text-slate-100 [&_ul]:ml-5 [&_ul]:list-disc"
          >
            {source.readme}
          </Streamdown>
        </DialogFrame>
      ) : null}
    </main>
  );
}
