"use client";

import { Copy, ExternalLink, Trash2, Check, Pencil } from "lucide-react";
import { productionUrl } from "./cms-entry-public-url";
import { useState } from "react";

export default function CmsLegacyCardActions({
  onEdit,
  onDelete,
  path,
}: {
  onEdit: () => void;
  onDelete?: () => void;
  path?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="flex items-center gap-2"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        onClick={onEdit}
        type="button"
      >
        <Pencil className="size-3.5" aria-hidden="true" /> Edit
      </button>
      {path ? (
        <>
          <button
            aria-label="Copy link"
            className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            onClick={async () => {
              await navigator.clipboard.writeText(productionUrl(path));
              setCopied(true);
            }}
            title={copied ? "Public link copied" : "Copy public link"}
            type="button"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <a
            aria-label="View"
            className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            href={productionUrl(path)}
            rel="noreferrer"
            target="_blank"
            title="Open on the public site"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </>
      ) : null}
      {onDelete ? (
        <button
          aria-label="Delete"
          className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          onClick={onDelete}
          title="Delete this item"
          type="button"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
