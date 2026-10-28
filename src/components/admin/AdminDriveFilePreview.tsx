import { Download } from "lucide-react";
import { isInlineMedia } from "@/lib/upload-media";
import type { AdminDriveItem } from "@/types/admin-integrations";

export default function AdminDriveFilePreview({
  item,
  url,
}: {
  item: AdminDriveItem;
  url: string;
}) {
  return (
    <div className="flex min-h-full flex-col bg-slate-950 p-4 sm:p-6">
      <div className="mb-4 flex justify-end">
        <a
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-cyan-600 px-3 text-xs font-bold text-white hover:bg-cyan-500"
          href={`${url}&download=1`}
          download={item.name}
          rel="noreferrer"
          target="_blank"
        >
          <Download className="h-4 w-4" /> Download
        </a>
      </div>
      {isInlineMedia(item.contentType ?? "", item.name) &&
      item.contentType?.startsWith("image/") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={item.name}
          className="m-auto max-h-[76vh] max-w-full rounded-xl object-contain"
          src={url}
        />
      ) : isInlineMedia(item.contentType ?? "", item.name) &&
        item.contentType?.startsWith("audio/") ? (
        <audio className="m-auto w-full max-w-2xl" controls src={url} />
      ) : isInlineMedia(item.contentType ?? "", item.name) &&
        item.contentType?.startsWith("video/") ? (
        <video
          className="m-auto max-h-[76vh] max-w-full rounded-xl"
          controls
          src={url}
        />
      ) : (
        <p className="m-auto text-sm text-slate-300">
          Download this file to view it.
        </p>
      )}
    </div>
  );
}
