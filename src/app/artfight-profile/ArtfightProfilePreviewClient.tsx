"use client";

import {
  Check,
  Clipboard,
  Code2,
  Download,
  FileCode2,
  Monitor,
  Palette,
} from "lucide-react";
import { useMemo, useState } from "react";

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

const codeTabs: Array<{
  id: CodeMode;
  label: string;
  fileName: string;
  description: string;
}> = [
  {
    id: "inlineHtml",
    label: "Inline HTML",
    fileName: "inline-html.html",
    description: "Single paste field for non-Supporter ArtFight profiles.",
  },
  {
    id: "supporterHtml",
    label: "Supporter HTML",
    fileName: "supporter-css.html",
    description: "Profile HTML to pair with the Supporter CSS payload.",
  },
  {
    id: "supporterCss",
    label: "Supporter CSS",
    fileName: "supporter-profile.css",
    description: "Custom CSS for ArtFight Supporter profile styling.",
  },
];

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

export default function ArtfightProfilePreviewClient({
  source,
}: ArtfightProfilePreviewClientProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("supporter");
  const [codeMode, setCodeMode] = useState<CodeMode>("inlineHtml");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
  const previewTitle =
    previewMode === "supporter"
      ? "Supporter CSS profile preview"
      : "Inline HTML profile preview";

  const handleCopy = async (id: string, text: string) => {
    await writeClipboard(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <main className="h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="@container flex h-full flex-col">
        <header className="flex shrink-0 flex-col gap-4 border-b border-rose-300/25 bg-slate-950/95 px-5 py-4 shadow-[0_18px_48px_rgba(2,6,23,0.44)] @2xl:flex-row @2xl:items-center @2xl:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.28em] text-cyan-200 uppercase">
              EXOCORPSE / ARTFIGHT EXPORT
            </p>
            <h1 className="mt-1 text-3xl leading-none font-bold tracking-[0.04em] text-rose-50 uppercase @lg:text-5xl">
              Confidential Biology Record
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCopy("inlineHtml", source.inlineHtml)}
              className="inline-flex items-center gap-2 border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/18"
            >
              {copiedId === "inlineHtml" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
              {copiedId === "inlineHtml"
                ? "Copied Inline HTML"
                : "Copy Inline HTML"}
            </button>
            <button
              type="button"
              onClick={() =>
                handleCopy("supporterBundle", source.supporterHtml)
              }
              className="inline-flex items-center gap-2 border border-rose-300/40 bg-rose-300/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-200 hover:bg-rose-300/18"
            >
              {copiedId === "supporterBundle" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
              {copiedId === "supporterBundle"
                ? "Copied Supporter HTML"
                : "Copy Supporter HTML"}
            </button>
            <button
              type="button"
              onClick={() => handleCopy("supporterCss", source.supporterCss)}
              className="inline-flex items-center gap-2 border border-slate-400/30 bg-slate-800/75 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-200 hover:bg-slate-700"
            >
              {copiedId === "supporterCss" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
              {copiedId === "supporterCss"
                ? "Copied Supporter CSS"
                : "Copy Supporter CSS"}
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 @2xl:grid-cols-[minmax(360px,440px)_1fr]">
          <aside className="flex min-h-0 flex-col border-b border-rose-300/20 bg-[#070b13] @2xl:border-r @2xl:border-b-0">
            <div className="grid shrink-0 grid-cols-2 border-b border-slate-700/70">
              <button
                type="button"
                onClick={() => setPreviewMode("supporter")}
                className={`flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold transition ${
                  previewMode === "supporter"
                    ? "bg-rose-300/14 text-rose-100"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Palette className="h-4 w-4" />
                Supporter Preview
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("inline")}
                className={`flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold transition ${
                  previewMode === "inline"
                    ? "bg-cyan-300/14 text-cyan-100"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Monitor className="h-4 w-4" />
                Inline Preview
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              <section className="border border-cyan-300/25 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-cyan-100">
                  <FileCode2 className="h-4 w-4" />
                  <h2 className="text-lg font-bold tracking-[0.08em] uppercase">
                    Copy Center
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Hosted image URLs and the ArtFight username are the only
                  remaining placeholders in the pasteable files.
                </p>
                <div className="mt-4 grid gap-2 font-mono text-xs text-slate-300">
                  <div className="border border-slate-700/80 bg-slate-900/80 p-2 break-all">
                    REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_HEADER
                  </div>
                  <div className="border border-slate-700/80 bg-slate-900/80 p-2 break-all">
                    REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MAIN_PORTRAIT
                  </div>
                  <div className="border border-slate-700/80 bg-slate-900/80 p-2 break-all">
                    REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_FENRYS
                  </div>
                  <div className="border border-slate-700/80 bg-slate-900/80 p-2 break-all">
                    REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MORRIS
                  </div>
                  <div className="border border-slate-700/80 bg-slate-900/80 p-2 break-all">
                    REPLACE_WITH_ARTFIGHT_USERNAME
                  </div>
                </div>
              </section>

              <section className="mt-4 border border-rose-300/25 bg-slate-950/60">
                <div className="grid grid-cols-3 border-b border-slate-700/70">
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

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-50">
                        {activeCodeTab?.fileName}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-slate-400">
                        {activeCodeTab?.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(codeMode, activeCode)}
                        className="inline-flex h-9 w-9 items-center justify-center border border-cyan-300/35 bg-cyan-300/10 text-cyan-100 transition hover:bg-cyan-300/18"
                        title="Copy active code"
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
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    readOnly
                    value={activeCode}
                    className="mt-4 h-72 w-full resize-none border border-slate-700 bg-[#020617] p-3 font-mono text-xs leading-5 text-slate-200 outline-none focus:border-cyan-300/60"
                    spellCheck={false}
                    aria-label={`${activeCodeTab?.label} source code`}
                  />
                </div>
              </section>

              <section className="mt-4 border border-slate-700/70 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-slate-100">
                  <Code2 className="h-4 w-4" />
                  <h2 className="text-sm font-bold tracking-[0.08em] uppercase">
                    Pack Notes
                  </h2>
                </div>
                <pre className="mt-3 max-h-56 overflow-auto font-mono text-xs leading-5 whitespace-pre-wrap text-slate-400">
                  {source.readme}
                </pre>
              </section>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col bg-[#030712]">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-700/70 bg-slate-950/85 px-4 py-3">
              <div>
                <p className="font-mono text-xs tracking-[0.2em] text-slate-400 uppercase">
                  Live Customer Preview
                </p>
                <h2 className="text-lg font-bold text-slate-50">
                  {previewTitle}
                </h2>
              </div>
              <span className="border border-slate-600/70 px-2 py-1 font-mono text-xs text-slate-300">
                {previewMode === "supporter" ? "HTML + CSS" : "Inline HTML"}
              </span>
            </div>
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
      </div>
    </main>
  );
}
