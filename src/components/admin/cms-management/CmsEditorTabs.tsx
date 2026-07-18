"use client";

import { FileText, Images, Link2, Settings2 } from "lucide-react";

export type CmsEditorTab = "connections" | "content" | "media" | "settings";

type Tab = {
  count?: number;
  icon: typeof FileText;
  id: CmsEditorTab;
  label: string;
};

export default function CmsEditorTabs({
  activeTab,
  assetCount,
  blockCount,
  connectionCount,
  hasConnections,
  onChange,
}: {
  activeTab: CmsEditorTab;
  assetCount: number;
  blockCount: number;
  connectionCount: number;
  hasConnections: boolean;
  onChange: (tab: CmsEditorTab) => void;
}) {
  const tabs: Tab[] = [
    { count: blockCount, icon: FileText, id: "content", label: "Content" },
    ...(hasConnections
      ? [
          {
            count: connectionCount,
            icon: Link2,
            id: "connections" as const,
            label: "Connections",
          },
        ]
      : []),
    { count: assetCount, icon: Images, id: "media", label: "Media" },
    { icon: Settings2, id: "settings", label: "Settings" },
  ];

  return (
    <div
      aria-label="Editing sections"
      className="flex gap-1 overflow-x-auto border-b border-zinc-200/80 bg-white/92 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950/92"
      role="tablist"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            aria-controls={`cms-${tab.id}-panel`}
            aria-selected={active}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              active
                ? "bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
            }`}
            id={`cms-${tab.id}-tab`}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
            {tab.count ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  active
                    ? "bg-white/15 dark:bg-black/10"
                    : "bg-zinc-200/80 dark:bg-zinc-800"
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
