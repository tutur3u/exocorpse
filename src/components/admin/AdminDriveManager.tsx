"use client";

import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import PreviewModal from "@/components/shared/PreviewModal";
import type {
  AdminDriveItem,
  AdminDrivePayload,
} from "@/types/admin-integrations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  ChevronRight,
  Cloud,
  Download,
  Eye,
  File,
  FileArchive,
  FileImage,
  FileText,
  Folder,
  FolderPlus,
  HardDrive,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

type DriveUpload = {
  contentType?: string;
  headers?: Record<string, string>;
  path: string;
  signedUrl: string;
  token?: string;
};

async function jsonRequest<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...init });
  const payload = (await response.json().catch(() => null)) as
    ({ error?: string } & T) | null;
  if (!response.ok)
    throw new Error(payload?.error || "Tuturuuu Drive request failed.");
  return payload as T;
}

function mutateRequest<T>(method: "DELETE" | "PATCH" | "POST", body: unknown) {
  return jsonRequest<T>("/api/admin/drive", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method,
  });
}

function uploadDirect(
  upload: DriveUpload,
  file: File,
  onProgress: (value: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", upload.signedUrl);
    const headers = { ...(upload.headers ?? {}) };
    if (!headers["Content-Type"])
      headers["Content-Type"] =
        upload.contentType || file.type || "application/octet-stream";
    if (upload.token) headers.Authorization = `Bearer ${upload.token}`;
    for (const [name, value] of Object.entries(headers))
      xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new Error("The direct upload was interrupted."));
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status}).`));
    xhr.send(file);
  });
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function fileIcon(item: AdminDriveItem) {
  if (item.kind === "folder") return Folder;
  if (item.contentType?.startsWith("image/")) return FileImage;
  if (
    item.contentType?.startsWith("text/") ||
    item.contentType === "application/pdf"
  )
    return FileText;
  if (item.contentType?.includes("zip")) return FileArchive;
  return File;
}

export default function AdminDriveManager({
  initialData,
}: {
  initialData: AdminDrivePayload;
}) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(
    searchParams.get("path") ?? initialData.listing.path ?? "",
  );
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [editing, setEditing] = useState<{
    item?: AdminDriveItem;
    mode: "folder" | "rename";
  } | null>(null);
  const [confirmingEditDiscard, setConfirmingEditDiscard] = useState(false);
  const [entryName, setEntryName] = useState("");
  const [deleting, setDeleting] = useState<AdminDriveItem | null>(null);
  const [preview, setPreview] = useState<{
    item: AdminDriveItem;
    url: string;
  } | null>(null);

  const query = useQuery({
    initialData:
      path === initialData.listing.path && !search && sortBy === "name"
        ? initialData.listing
        : undefined,
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "100",
        path,
        sortBy,
        sortOrder: "asc",
      });
      if (search.trim()) params.set("search", search.trim());
      const result = await jsonRequest<{ data: AdminDrivePayload["listing"] }>(
        `/api/admin/drive?${params}`,
      );
      return result.data;
    },
    queryKey: ["admin", "drive", path, search, sortBy],
    staleTime: 15_000,
  });
  const analyticsQuery = useQuery({
    initialData: initialData.analytics,
    queryFn: async () => {
      const result = await jsonRequest<{
        data: AdminDrivePayload["analytics"];
      }>("/api/admin/drive?analytics=1");
      return result.data;
    },
    queryKey: ["admin", "drive", "analytics"],
    staleTime: 30_000,
  });
  const listing = query.data ?? initialData.listing;
  const analytics = analyticsQuery.data;
  const managedPath = path === "drive/root" || path.startsWith("drive/root/");
  const editDirty = Boolean(
    editing && entryName !== (editing.item?.name ?? ""),
  );

  const discardEdit = () => {
    setEditing(null);
    setEntryName("");
    setConfirmingEditDiscard(false);
  };

  const requestEditClose = () => {
    if (busy) return;
    if (editDirty) {
      setConfirmingEditDiscard(true);
      return;
    }
    discardEdit();
  };

  useEffect(() => {
    if (!editing) return;
    const guardEdit = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || confirmingEditDiscard || busy) return;
      if (editDirty) setConfirmingEditDiscard(true);
      else {
        setEditing(null);
        setEntryName("");
      }
    };
    const guardNavigation = (event: BeforeUnloadEvent) => {
      if (editDirty) event.preventDefault();
    };
    window.addEventListener("keydown", guardEdit);
    window.addEventListener("beforeunload", guardNavigation);
    return () => {
      window.removeEventListener("keydown", guardEdit);
      window.removeEventListener("beforeunload", guardNavigation);
    };
  }, [busy, confirmingEditDiscard, editDirty, editing]);

  const crumbs = useMemo(() => {
    const segments = path.split("/").filter(Boolean);
    return [
      { label: "All project files", path: "" },
      ...segments.map((segment, index) => ({
        label: segment === "drive" ? "Managed Drive" : segment,
        path: segments.slice(0, index + 1).join("/"),
      })),
    ];
  }, [path]);

  useEffect(() => {
    const syncPath = () => {
      setPath(new URL(window.location.href).searchParams.get("path") ?? "");
    };
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  function navigate(nextPath: string) {
    const url = nextPath
      ? `/admin/drive?path=${encodeURIComponent(nextPath)}`
      : "/admin/drive";
    window.history.pushState(null, "", url);
    setPath(nextPath);
  }

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin", "drive"] });
  }

  async function openPreview(item: AdminDriveItem) {
    setBusy(true);
    try {
      const result = await jsonRequest<{ data: { signedUrl: string } }>(
        `/api/admin/drive?filePath=${encodeURIComponent(item.path)}`,
      );
      setPreview({ item, url: result.data.signedUrl });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Preview unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveEntry() {
    if (!editing || !entryName.trim()) return;
    setBusy(true);
    try {
      if (editing.mode === "folder") {
        await mutateRequest("POST", {
          action: "create-folder",
          name: entryName.trim(),
          path,
        });
        toast.success("Folder created.");
      } else if (editing.item) {
        await mutateRequest("PATCH", {
          kind: editing.item.kind,
          newName: entryName.trim(),
          path: editing.item.path,
        });
        toast.success("Item renamed. Linked media references were updated.");
      }
      setEditing(null);
      setEntryName("");
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Drive update failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry() {
    if (!deleting) return;
    setBusy(true);
    try {
      const result = await mutateRequest<{ data: { detachedAssets: number } }>(
        "DELETE",
        { kind: deleting.kind, path: deleting.path },
      );
      toast.success(
        result.data.detachedAssets
          ? `Deleted and detached ${result.data.detachedAssets} linked media record(s).`
          : "Deleted from Drive.",
      );
      setDeleting(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    if (!managedPath) {
      toast.error("Open Managed Drive before uploading new files.");
      return;
    }
    setBusy(true);
    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files.item(index);
        if (!file) continue;
        setUploadProgress(0);
        const upload = await mutateRequest<DriveUpload>("POST", {
          action: "upload-url",
          contentType: file.type || "application/octet-stream",
          directory: path,
          filename: file.name,
          size: file.size,
        });
        await uploadDirect(upload, file, setUploadProgress);
      }
      toast.success(
        `${files.length} file${files.length === 1 ? "" : "s"} uploaded directly to Tuturuuu Drive.`,
      );
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      setUploadProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-cyan-900/40 bg-[radial-gradient(circle_at_top_right,rgba(8,145,178,0.22),transparent_40%),linear-gradient(135deg,#020617,#071827)] shadow-2xl shadow-cyan-950/20">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.24em] text-cyan-300 uppercase">
                <Cloud className="h-4 w-4" /> Tuturuuu Drive
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Storage control room
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Navigate project files, inspect live storage usage, preview
                media with short-lived links, and keep file operations
                synchronized with CMS assets.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate("drive/root")}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 text-sm font-bold text-cyan-100 hover:bg-cyan-400/20"
              >
                <HardDrive className="h-4 w-4" /> Managed Drive
              </button>
              <button
                type="button"
                onClick={() => void refresh()}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-bold text-white hover:bg-white/10"
              >
                <RefreshCw
                  className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`}
                />{" "}
                Refresh
              </button>
            </div>
          </div>
        </div>
        <div className="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: HardDrive,
              label: "Used",
              value: formatBytes(analytics.totalSize),
            },
            {
              icon: File,
              label: "Files",
              value: analytics.fileCount.toLocaleString(),
            },
            {
              icon: BarChart3,
              label: "Workspace quota",
              value: `${analytics.usagePercentage.toFixed(1)}%`,
            },
            {
              icon: Cloud,
              label: "Provider",
              value: listing.provider.toUpperCase(),
            },
          ].map((stat) => (
            <div
              className="border-white/10 p-4 sm:border-r sm:p-5"
              key={stat.label}
            >
              <stat.icon className="mb-3 h-4 w-4 text-cyan-300" />
              <div className="text-xl font-black text-white">{stat.value}</div>
              <div className="mt-1 text-xs font-semibold text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-linear-to-r from-cyan-500 to-violet-500"
            style={{ width: `${Math.max(analytics.usagePercentage, 0.4)}%` }}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="space-y-4 border-b border-gray-200 p-4 sm:p-5 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-1 text-sm">
            {crumbs.map((crumb, index) => (
              <div
                className="flex items-center gap-1"
                key={`${crumb.path}-${crumb.label}`}
              >
                <button
                  type="button"
                  onClick={() => navigate(crumb.path)}
                  className="max-w-44 truncate rounded-md px-2 py-1 font-bold text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 dark:text-gray-300 dark:hover:bg-cyan-950"
                >
                  {crumb.label}
                </button>
                {index < crumbs.length - 1 ? (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                ) : null}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                aria-label="Search Drive"
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pr-3 pl-9 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search this folder..."
                value={search}
              />
            </label>
            <select
              aria-label="Sort Drive"
              className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              onChange={(event) => setSortBy(event.target.value)}
              value={sortBy}
            >
              <option value="name">Name</option>
              <option value="updated_at">Last modified</option>
              <option value="size">Size</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setEditing({ mode: "folder" });
                setEntryName("");
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-bold text-gray-700 hover:border-cyan-400 dark:border-gray-700 dark:text-gray-200"
            >
              <FolderPlus className="h-4 w-4" /> New folder
            </button>
            <input
              ref={inputRef}
              className="hidden"
              multiple
              onChange={(event) => void uploadFiles(event.target.files)}
              type="file"
            />
            <button
              type="button"
              disabled={!managedPath || busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-bold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-4 w-4" /> Upload
            </button>
          </div>
          {!managedPath ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Browsing all CMS-managed project files. Open{" "}
              <button
                className="font-bold text-cyan-600 hover:underline"
                type="button"
                onClick={() => navigate("drive/root")}
              >
                Managed Drive
              </button>{" "}
              to upload general files.
            </p>
          ) : null}
          {uploadProgress !== null ? (
            <div>
              <div className="mb-1 flex justify-between text-xs font-bold text-cyan-700 dark:text-cyan-300">
                <span>Uploading directly to Tuturuuu</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full bg-cyan-500 transition-[width]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-h-72">
          {query.isPending ? (
            <div className="grid place-items-center p-16 text-sm text-gray-500">
              <RefreshCw className="mb-3 h-6 w-6 animate-spin" />
              Loading Drive...
            </div>
          ) : null}
          {query.isError ? (
            <div className="grid place-items-center p-16 text-center">
              <p className="font-bold text-red-600">{query.error.message}</p>
              <button
                className="mt-3 text-sm font-bold text-cyan-600"
                onClick={() => void query.refetch()}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : null}
          {!query.isPending && !query.isError && !listing.items.length ? (
            <div className="grid place-items-center p-16 text-center">
              <Folder className="mb-3 h-9 w-9 text-gray-300" />
              <p className="font-bold text-gray-700 dark:text-gray-200">
                This folder is empty
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Create a folder or upload a file to begin.
              </p>
            </div>
          ) : null}
          {listing.items.length ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {listing.items.map((item) => {
                const Icon = fileIcon(item);
                return (
                  <div
                    className="group grid gap-3 p-4 transition hover:bg-cyan-50/50 sm:grid-cols-[minmax(0,1fr)_120px_160px_auto] sm:items-center dark:hover:bg-cyan-950/20"
                    key={item.path}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        item.kind === "folder"
                          ? navigate(item.path)
                          : void openPreview(item)
                      }
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.kind === "folder" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-950 dark:text-white">
                          {item.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500 sm:hidden">
                          {item.kind === "folder"
                            ? "Folder"
                            : formatBytes(item.size)}
                        </p>
                      </div>
                    </button>
                    <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                      {item.kind === "folder"
                        ? "Folder"
                        : formatBytes(item.size)}
                    </span>
                    <span className="hidden text-xs text-gray-500 sm:block">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString()
                        : "—"}
                    </span>
                    <div className="flex flex-wrap gap-1 sm:justify-end">
                      {item.kind === "file" ? (
                        <button
                          aria-label={`Preview ${item.name}`}
                          className="rounded-lg p-2 text-gray-500 hover:bg-cyan-100 hover:text-cyan-700 dark:hover:bg-cyan-950"
                          disabled={busy}
                          onClick={() => void openPreview(item)}
                          type="button"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        aria-label={`Rename ${item.name}`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => {
                          setEditing({ item, mode: "rename" });
                          setEntryName(item.name);
                        }}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Delete ${item.name}`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        onClick={() => setDeleting(item)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {editing ? (
        <div
          className="fixed inset-0 z-10000 grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-950 dark:text-white">
                {editing.mode === "folder" ? "Create folder" : "Rename item"}
              </h2>
              <button
                aria-label="Close"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={requestEditClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              autoFocus
              className="mt-5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-cyan-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              onChange={(event) => setEntryName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void saveEntry();
              }}
              value={entryName}
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="h-10 rounded-lg px-4 text-sm font-bold text-gray-600 dark:text-gray-300"
                onClick={requestEditClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="h-10 rounded-lg bg-cyan-600 px-4 text-sm font-bold text-white disabled:opacity-50"
                disabled={busy || !entryName.trim() || !editDirty}
                onClick={() => void saveEntry()}
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDeleteDialog
        confirmText="Discard changes"
        isOpen={confirmingEditDiscard}
        message="The name you entered has not been saved."
        onCancel={() => setConfirmingEditDiscard(false)}
        onConfirm={discardEdit}
        title="Discard this change?"
      />

      <ConfirmDeleteDialog
        confirmText="Delete"
        isOpen={Boolean(deleting)}
        loading={busy}
        message={`Delete ${deleting?.name ?? "this item"}? Linked CMS media records are detached automatically.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void removeEntry()}
        title={`Delete ${deleting?.kind ?? "item"}?`}
      />

      <PreviewModal
        isOpen={Boolean(preview)}
        onCloseAction={() => setPreview(null)}
        title={preview?.item.name ?? "File preview"}
      >
        {preview ? (
          <div className="flex min-h-full flex-col bg-slate-950 p-4 sm:p-6">
            <div className="mb-4 flex justify-end">
              <a
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-cyan-600 px-3 text-xs font-bold text-white hover:bg-cyan-500"
                href={preview.url}
                rel="noreferrer"
                target="_blank"
              >
                <Download className="h-4 w-4" /> Open or download
              </a>
            </div>
            {preview.item.contentType?.startsWith("image/") ? (
              // Signed URLs are short-lived and provider-defined, so they cannot
              // safely be routed through the Next Image optimizer.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={preview.item.name}
                className="m-auto max-h-[76vh] max-w-full rounded-xl object-contain"
                src={preview.url}
              />
            ) : preview.item.contentType?.startsWith("audio/") ? (
              <audio
                className="m-auto w-full max-w-2xl"
                controls
                src={preview.url}
              />
            ) : preview.item.contentType?.startsWith("video/") ? (
              <video
                className="m-auto max-h-[76vh] max-w-full rounded-xl"
                controls
                src={preview.url}
              />
            ) : (
              <iframe
                className="min-h-[76vh] w-full rounded-xl bg-white"
                src={preview.url}
                title={preview.item.name}
              />
            )}
          </div>
        ) : null}
      </PreviewModal>
    </div>
  );
}
