"use client";

import {
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileCode2,
  GitCompareArrows,
  ImageIcon,
  Maximize2,
  Menu,
  Minimize2,
  Monitor,
  NotebookText,
  Palette,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StreamdownProps } from "streamdown";

type ProfileVersionStatus = "current" | "archived";

type ProfileVersion = {
  id: string;
  label: string;
  date: string;
  status: ProfileVersionStatus;
  summary: string;
  inlineHtml: string;
  supporterHtml: string;
  supporterCss: string;
  readme: string;
};

type ArtfightProfilePreviewClientProps = {
  versions: ProfileVersion[];
};

type PreviewMode = "supporter" | "inline";
type CodeMode = "inlineHtml" | "supporterHtml" | "supporterCss";
type DialogMode = "preview" | "compare" | "placeholders" | "code" | "notes";

const emptyVersion: ProfileVersion = {
  id: "empty",
  label: "No version",
  date: "",
  status: "archived",
  summary: "No profile versions are available.",
  inlineHtml: "",
  supporterHtml: "",
  supporterCss: "",
  readme: "# No profile versions available",
};

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
    description: "Profile HTML to pair with the Supporter CSS file.",
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
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_PAGEDOLL",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_DECOR_01",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_DECOR_02",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_01",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_02",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_03",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_04",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_FENRYS_LYKOMEDES",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MORRIS_LYKOMEDES",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MINOS_ANATOLIOS",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_VERDAN_GOOSE_LOXWOOD",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_SYLVIS_AEVEILITH",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_AURELIUS_LYKOMEDES",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_ENDOSSEUS",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_UNA_RUKAWA",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MARKUS_WICKE",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_LUCILLE_YANG",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_YVAINE_LEWIS",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_PERSEUS_LYNDHURST",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_01",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_02",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_03",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_04",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_05",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_06",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_07",
  "REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_08",
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
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_PAGEDOLL: "/boot/Fenrys.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_DECOR_01: "/desktop-logo.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_DECOR_02: "/exocorpse.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_01: "/boot/Fenrys.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_02: "/boot/Morris.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_03: "/exocorpse.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MOOD_04: "/LykoTwins.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_FENRYS_LYKOMEDES:
    "/artfight-profile/characters-preview/fenrys-lykomedes.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MORRIS_LYKOMEDES:
    "/artfight-profile/characters-preview/morris-lykomedes.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MINOS_ANATOLIOS:
    "/artfight-profile/characters-preview/minos-anatolios.png",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_VERDAN_GOOSE_LOXWOOD:
    "/artfight-profile/characters-preview/verdan-goose-loxwood.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_SYLVIS_AEVEILITH:
    "/artfight-profile/characters-preview/sylvis-aeveilith.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_AURELIUS_LYKOMEDES: "/exocorpse.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_ENDOSSEUS:
    "/artfight-profile/characters-preview/endosseus.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_UNA_RUKAWA:
    "/artfight-profile/characters-preview/una-rukawa.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_MARKUS_WICKE: "/exocorpse.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_LUCILLE_YANG:
    "/artfight-profile/characters-preview/lucille-yang.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_YVAINE_LEWIS:
    "/artfight-profile/characters-preview/yvaine-lewis.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_PERSEUS_LYNDHURST:
    "/artfight-profile/characters-preview/perseus-lyndhurst.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_01:
    "/artfight-profile/gallery-preview/technoblade-26.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_02:
    "/artfight-profile/gallery-preview/drowning-love.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_03:
    "/artfight-profile/gallery-preview/musicvayle.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_04:
    "/artfight-profile/gallery-preview/psyncronize.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_05:
    "/artfight-profile/gallery-preview/successor-thrones.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_06:
    "/artfight-profile/gallery-preview/stasis-chamber.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_07:
    "/artfight-profile/gallery-preview/at-all-costs.webp",
  REPLACE_WITH_PUBLIC_HTTPS_IMAGE_URL_GALLERY_08:
    "/artfight-profile/gallery-preview/undertale-10th.webp",
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

  .col-lg-3,
  .col-lg-4,
  .col-lg-5,
  .col-lg-6,
  .col-lg-8,
  .col-md-4,
  .col-md-6 {
    position: relative;
    width: 100%;
  }

  @media (min-width: 768px) {
    .col-md-4 {
      flex: 0 0 33.333333%;
      max-width: 33.333333%;
    }

    .col-md-6 {
      flex: 0 0 50%;
      max-width: 50%;
    }
  }

  @media (min-width: 992px) {
    .col-lg-3 {
      flex: 0 0 25%;
      max-width: 25%;
    }

    .col-lg-4 {
      flex: 0 0 33.333333%;
      max-width: 33.333333%;
    }

    .col-lg-5 {
      flex: 0 0 41.666667%;
      max-width: 41.666667%;
    }

    .col-lg-6 {
      flex: 0 0 50%;
      max-width: 50%;
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
  size = "default",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  size?: "default" | "wide";
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
        className={`max-h-[min(800px,calc(100vh-32px))] w-full overflow-hidden border border-rose-300/35 bg-[#060912] text-slate-100 shadow-[0_28px_90px_rgba(2,6,23,0.8)] ${
          size === "wide" ? "max-w-6xl" : "max-w-3xl"
        }`}
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
        <div className="max-h-[calc(min(800px,100vh-32px)-76px)] overflow-auto p-4">
          {children}
        </div>
      </section>
    </div>
  );
}

function ActionMenuButton({
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
      role="menuitem"
      className="flex w-full items-center gap-3 border-b border-slate-800 px-3 py-3 text-left text-sm font-semibold text-slate-100 transition last:border-b-0 hover:bg-cyan-300/10 hover:text-cyan-100"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function VersionSelect({
  versions,
  selectedVersionId,
  onChange,
}: {
  versions: ProfileVersion[];
  selectedVersionId: string;
  onChange: (versionId: string) => void;
}) {
  return (
    <label className="inline-flex min-w-0 items-center gap-2 border border-rose-300/35 bg-rose-300/10 px-3 py-2 text-sm font-semibold text-rose-50">
      <span className="sr-only">Select profile version</span>
      <span className="hidden text-rose-100/75 @lg:inline">Version</span>
      <select
        value={selectedVersionId}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-[12rem] min-w-0 bg-transparent text-sm font-semibold text-rose-50 outline-none @lg:max-w-[16rem]"
        aria-label="Select profile version"
      >
        {versions.map((version) => (
          <option key={version.id} value={version.id} className="bg-slate-950">
            {version.label}
            {version.status === "current" ? " (current)" : " (archived)"}
          </option>
        ))}
      </select>
      <ChevronDown className="h-4 w-4 shrink-0 text-rose-100/70" />
    </label>
  );
}

function CodePreview({ label, markdown }: { label: string; markdown: string }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-sm font-bold text-slate-100">{label}</h3>
      <div
        role="region"
        aria-label={`${label} highlighted source code`}
        className="h-80 overflow-auto border border-slate-700 bg-[#020617]"
      >
        <Streamdown
          mode="static"
          controls={false}
          lineNumbers
          shikiTheme={["github-light", "github-dark"]}
          className="h-full text-xs leading-5 text-slate-200 [&_[data-streamdown='code-block']]:my-0 [&_[data-streamdown='code-block']]:h-full [&_[data-streamdown='code-block']]:rounded-none [&_[data-streamdown='code-block']]:border-0 [&_[data-streamdown='code-block']]:bg-[#020617] [&_[data-streamdown='code-block']]:p-0 [&_[data-streamdown='code-block-body']]:h-full [&_[data-streamdown='code-block-body']]:overflow-auto [&_[data-streamdown='code-block-body']]:rounded-none [&_[data-streamdown='code-block-body']]:border-0 [&_[data-streamdown='code-block-body']]:bg-[#020617] [&_[data-streamdown='code-block-body']]:p-3 [&_code]:font-mono [&_pre]:min-w-max [&_pre]:bg-transparent"
        >
          {markdown}
        </Streamdown>
      </div>
    </div>
  );
}

export default function ArtfightProfilePreviewClient({
  versions,
}: ArtfightProfilePreviewClientProps) {
  const initialVersion =
    versions.find((version) => version.status === "current") ??
    versions[0] ??
    emptyVersion;
  const [selectedVersionId, setSelectedVersionId] = useState(initialVersion.id);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("supporter");
  const [codeMode, setCodeMode] = useState<CodeMode>("inlineHtml");
  const [compareCodeMode, setCompareCodeMode] =
    useState<CodeMode>("supporterHtml");
  const [compareLeftId, setCompareLeftId] = useState(
    versions.find((version) => version.status === "archived")?.id ??
      initialVersion.id,
  );
  const [compareRightId, setCompareRightId] = useState(initialVersion.id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogMode | null>(null);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [versionDetailsOpen, setVersionDetailsOpen] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const currentVersion =
    versions.find((version) => version.status === "current") ?? initialVersion;
  const selectedVersion =
    versions.find((version) => version.id === selectedVersionId) ??
    currentVersion;
  const compareLeftVersion =
    versions.find((version) => version.id === compareLeftId) ?? selectedVersion;
  const compareRightVersion =
    versions.find((version) => version.id === compareRightId) ?? currentVersion;
  const activeCodeTab = codeTabs.find((tab) => tab.id === codeMode);
  const activeCompareCodeTab = codeTabs.find(
    (tab) => tab.id === compareCodeMode,
  );
  const activeCode = selectedVersion[codeMode];
  const compareLeftCode = compareLeftVersion[compareCodeMode];
  const compareRightCode = compareRightVersion[compareCodeMode];

  const previewDocuments = useMemo(
    () => ({
      inline: buildSrcDoc(
        applyPreviewReplacements(selectedVersion.inlineHtml),
        inlinePreviewCss,
      ),
      supporter: buildSrcDoc(
        applyPreviewReplacements(selectedVersion.supporterHtml),
        `${previewShellCss}\n${selectedVersion.supporterCss}`,
      ),
    }),
    [
      selectedVersion.inlineHtml,
      selectedVersion.supporterCss,
      selectedVersion.supporterHtml,
    ],
  );

  const activeCodeMarkdown = useMemo(
    () => buildCodeMarkdown(activeCodeTab?.language ?? "html", activeCode),
    [activeCode, activeCodeTab?.language],
  );
  const compareLeftMarkdown = useMemo(
    () =>
      buildCodeMarkdown(
        activeCompareCodeTab?.language ?? "html",
        compareLeftCode,
      ),
    [activeCompareCodeTab?.language, compareLeftCode],
  );
  const compareRightMarkdown = useMemo(
    () =>
      buildCodeMarkdown(
        activeCompareCodeTab?.language ?? "html",
        compareRightCode,
      ),
    [activeCompareCodeTab?.language, compareRightCode],
  );
  const previewTitle =
    previewMode === "supporter"
      ? `${selectedVersion.label} supporter preview`
      : `${selectedVersion.label} inline preview`;

  useEffect(() => {
    if (
      versions.length > 0 &&
      !versions.some((version) => version.id === selectedVersionId)
    ) {
      setSelectedVersionId(currentVersion.id);
    }
  }, [currentVersion.id, selectedVersionId, versions]);

  useEffect(() => {
    if (
      !activeDialog &&
      !copyMenuOpen &&
      !actionMenuOpen &&
      !isPreviewFullscreen &&
      !versionDetailsOpen
    ) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDialog(null);
        setCopyMenuOpen(false);
        setActionMenuOpen(false);
        setIsPreviewFullscreen(false);
        setVersionDetailsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeDialog,
    actionMenuOpen,
    copyMenuOpen,
    isPreviewFullscreen,
    versionDetailsOpen,
  ]);

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

  useEffect(() => {
    if (!actionMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!actionMenuRef.current?.contains(event.target as Node)) {
        setActionMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [actionMenuOpen]);

  const openDialog = (dialog: DialogMode) => {
    setActiveDialog(dialog);
    setCopyMenuOpen(false);
    setActionMenuOpen(false);
  };

  const handleCopy = async (id: string, text: string) => {
    await writeClipboard(text);
    setCopiedId(id);
    setCopyMenuOpen(false);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <main className="h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="@container flex h-full flex-col">
        <header className="shrink-0 border-b border-rose-300/25 bg-slate-950/95 px-3 py-3 shadow-[0_18px_48px_rgba(2,6,23,0.44)] @lg:px-4">
          <div className="flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() =>
                  setVersionDetailsOpen((currentValue) => !currentValue)
                }
                className="inline-flex items-center gap-2 text-left text-lg leading-none font-bold tracking-[0.08em] text-rose-50 uppercase transition hover:text-cyan-100 @lg:text-xl"
                aria-expanded={versionDetailsOpen}
                aria-controls="artfight-version-details"
              >
                <span>ArtFight Profile</span>
                <ChevronDown
                  className={`h-4 w-4 text-cyan-100/80 transition ${
                    versionDetailsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <VersionSelect
                versions={versions.length > 0 ? versions : [emptyVersion]}
                selectedVersionId={selectedVersion.id}
                onChange={(versionId) => {
                  setSelectedVersionId(versionId);
                  setCopyMenuOpen(false);
                }}
              />

              <div className="relative" ref={copyMenuRef}>
                <button
                  type="button"
                  onClick={() => setCopyMenuOpen((current) => !current)}
                  className="inline-flex items-center gap-2 border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/18"
                  aria-haspopup="menu"
                  aria-expanded={copyMenuOpen}
                >
                  {copiedId && codeTabs.some((tab) => tab.id === copiedId) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                  {copiedId && codeTabs.some((tab) => tab.id === copiedId)
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
                    className="absolute right-0 z-40 mt-2 w-56 border border-cyan-300/30 bg-[#07101b] p-1 shadow-[0_18px_48px_rgba(2,6,23,0.72)]"
                  >
                    {codeTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="menuitem"
                        onClick={() =>
                          handleCopy(tab.id, selectedVersion[tab.id])
                        }
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

              <div className="relative" ref={actionMenuRef}>
                <button
                  type="button"
                  onClick={() => setActionMenuOpen((current) => !current)}
                  className="inline-flex items-center gap-2 border border-slate-600/70 bg-slate-900/85 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-200/70 hover:text-cyan-100"
                  aria-label="Open actions menu"
                  aria-controls="artfight-actions-menu"
                  aria-haspopup="menu"
                  aria-expanded={actionMenuOpen}
                >
                  <Menu className="h-4 w-4" />
                  <span>Actions</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {actionMenuOpen ? (
                  <>
                    <button
                      type="button"
                      aria-label="Close actions menu"
                      className="fixed inset-0 z-20 cursor-default bg-transparent"
                      onClick={() => setActionMenuOpen(false)}
                    />
                    <div
                      id="artfight-actions-menu"
                      role="menu"
                      className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] border border-cyan-300/30 bg-[#07101b] shadow-[0_18px_48px_rgba(2,6,23,0.72)]"
                    >
                      <ActionMenuButton
                        icon={Palette}
                        label="Preview Mode"
                        onClick={() => openDialog("preview")}
                      />
                      <ActionMenuButton
                        icon={GitCompareArrows}
                        label="Compare"
                        onClick={() => openDialog("compare")}
                      />
                      <ActionMenuButton
                        icon={ImageIcon}
                        label="Placeholders"
                        onClick={() => openDialog("placeholders")}
                      />
                      <ActionMenuButton
                        icon={FileCode2}
                        label="Code"
                        onClick={() => openDialog("code")}
                      />
                      <ActionMenuButton
                        icon={NotebookText}
                        label="Notes"
                        onClick={() => openDialog("notes")}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {versionDetailsOpen ? (
            <div
              id="artfight-version-details"
              className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-3 text-xs text-slate-400"
            >
              <span className="border border-slate-700/70 bg-slate-900/70 px-2 py-1 font-semibold text-slate-200">
                {selectedVersion.status === "current" ? "Current" : "Archived"}
              </span>
              <span>{selectedVersion.date}</span>
              <span className="min-w-0 flex-1">{selectedVersion.summary}</span>
            </div>
          ) : null}
        </header>

        <section
          className={
            isPreviewFullscreen
              ? "fixed inset-0 z-40 flex flex-col bg-[#030712]"
              : "flex min-h-0 flex-1 flex-col bg-[#030712]"
          }
        >
          <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_20%_10%,rgba(251,113,133,0.13),transparent_28%),radial-gradient(circle_at_78%_0%,rgba(34,211,238,0.11),transparent_24%),#020617] p-3 @lg:p-5">
            <iframe
              key={`${selectedVersion.id}-${previewMode}`}
              title={previewTitle}
              srcDoc={previewDocuments[previewMode]}
              className="h-full w-full border border-rose-300/35 bg-slate-950 shadow-[0_26px_70px_rgba(2,6,23,0.65)]"
              sandbox=""
            />
            <button
              type="button"
              onClick={() =>
                setIsPreviewFullscreen((currentValue) => !currentValue)
              }
              className="absolute top-6 right-6 z-10 inline-flex items-center gap-2 border border-cyan-200/50 bg-slate-950/88 px-3 py-2 text-sm font-bold text-cyan-100 shadow-[0_18px_48px_rgba(2,6,23,0.56)] backdrop-blur transition hover:border-cyan-100 hover:bg-cyan-300/14"
              aria-label={
                isPreviewFullscreen
                  ? "Exit fullscreen preview"
                  : "Open fullscreen preview"
              }
              aria-pressed={isPreviewFullscreen}
              title={
                isPreviewFullscreen
                  ? "Exit fullscreen preview"
                  : "Open fullscreen preview"
              }
            >
              {isPreviewFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="hidden @lg:inline">
                {isPreviewFullscreen ? "Exit Preview" : "Fullscreen Preview"}
              </span>
            </button>
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

      {activeDialog === "compare" ? (
        <DialogFrame
          title="Compare"
          description="Compare two saved profile versions, then select a version from the top bar to preview, copy, or download it."
          onClose={() => setActiveDialog(null)}
          size="wide"
        >
          <div className="grid gap-3 border border-slate-700/70 bg-slate-950/60 p-3 @lg:grid-cols-[1fr_auto_1fr] @lg:items-end">
            <label className="grid gap-2 text-sm font-semibold text-slate-200">
              Left version
              <select
                value={compareLeftVersion.id}
                onChange={(event) => setCompareLeftId(event.target.value)}
                className="border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              >
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.label}
                    {version.status === "current" ? " (current)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-3 border border-slate-700/70 @lg:w-96">
              {codeTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCompareCodeMode(tab.id)}
                  className={`px-2 py-3 text-xs font-semibold transition @lg:text-sm ${
                    compareCodeMode === tab.id
                      ? "bg-cyan-300/14 text-cyan-100"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <label className="grid gap-2 text-sm font-semibold text-slate-200">
              Right version
              <select
                value={compareRightVersion.id}
                onChange={(event) => setCompareRightId(event.target.value)}
                className="border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              >
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.label}
                    {version.status === "current" ? " (current)" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-4 @lg:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-rose-100">
                    {compareLeftVersion.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {compareLeftVersion.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(compareCodeMode, compareLeftCode)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-cyan-300/40 bg-cyan-300/10 text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/18"
                  title="Copy left code"
                  aria-label="Copy left code"
                >
                  {copiedId === compareCodeMode ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </button>
              </div>
              <CodePreview
                label={`${compareLeftVersion.label} ${activeCompareCodeTab?.label ?? "Code"}`}
                markdown={compareLeftMarkdown}
              />
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-cyan-100">
                    {compareRightVersion.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {compareRightVersion.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(compareCodeMode, compareRightCode)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-cyan-300/40 bg-cyan-300/10 text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/18"
                  title="Copy right code"
                  aria-label="Copy right code"
                >
                  {copiedId === compareCodeMode ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </button>
              </div>
              <CodePreview
                label={`${compareRightVersion.label} ${activeCompareCodeTab?.label ?? "Code"}`}
                markdown={compareRightMarkdown}
              />
            </div>
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
          description="Inspect highlighted source files, copy, or download the active file."
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
              <p className="mb-1 text-xs font-semibold tracking-[0.18em] text-cyan-100 uppercase">
                {selectedVersion.label}
              </p>
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
                    `${selectedVersion.id}-${activeCodeTab?.fileName ?? "artfight-profile.txt"}`,
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

          {selectedVersion.status === "archived" ? (
            <p className="mt-3 border border-rose-300/30 bg-rose-300/10 p-3 text-sm leading-5 text-rose-50">
              This saved version is available for comparison and reuse. Select
              it here, then copy or download the files you want.
            </p>
          ) : null}

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
          description={`${selectedVersion.label} usage notes.`}
          onClose={() => setActiveDialog(null)}
        >
          <Streamdown
            mode="static"
            controls={false}
            className="max-h-[54vh] overflow-auto text-sm leading-6 text-slate-300 [&_a]:text-cyan-200 [&_a]:underline [&_code]:border [&_code]:border-slate-700 [&_code]:bg-slate-950 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-rose-100 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-rose-50 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-cyan-100 [&_li]:my-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_strong]:text-slate-100 [&_ul]:ml-5 [&_ul]:list-disc"
          >
            {selectedVersion.readme}
          </Streamdown>
        </DialogFrame>
      ) : null}
    </main>
  );
}
