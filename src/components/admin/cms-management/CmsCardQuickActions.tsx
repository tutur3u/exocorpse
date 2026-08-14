"use client";

import { productionUrl } from "@/components/admin/cms-management/cms-entry-public-url";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@tuturuuu/ui/tooltip";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function CmsCardQuickActions({
  className = "",
  path,
}: {
  className?: string;
  path?: string;
}) {
  const [copied, setCopied] = useState(false);
  if (!path) return null;
  const href = productionUrl(path);
  const stop = (event: React.SyntheticEvent) => event.stopPropagation();

  return (
    <TooltipProvider>
      <div
        className={`flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/80 p-1 opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 ${className}`}
        onClick={stop}
        onKeyDown={stop}
        onPointerDown={stop}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              aria-label="Preview on the live site"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-200 transition hover:bg-cyan-400/15 hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
              href={href}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent>Preview on live site</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label="Copy live link"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-200 transition hover:bg-cyan-400/15 hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
              onClick={async () => {
                await navigator.clipboard.writeText(href);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              }}
              type="button"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-300" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {copied ? "Copied" : "Copy live link"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
