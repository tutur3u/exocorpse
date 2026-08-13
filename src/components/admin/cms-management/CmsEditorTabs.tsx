"use client";

import { FileText, Images, Link2, Settings2 } from "lucide-react";
import type { AdminCmsTheme } from "@/components/admin/cms-management/admin-theme";

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
  theme,
}: {
  activeTab: CmsEditorTab;
  assetCount: number;
  blockCount: number;
  connectionCount: number;
  hasConnections: boolean;
  onChange: (tab: CmsEditorTab) => void;
  theme: AdminCmsTheme;
}) {
  const tabs: Tab[] = [
    { count: blockCount, icon: FileText, id: "content", label: "Content" },
    ...(hasConnections
      ? [
          {
            count: connectionCount,
            icon: Link2,
            id: "connections" as const,
            label: "Related content",
          },
        ]
      : []),
    { count: assetCount, icon: Images, id: "media", label: "Media" },
    { icon: Settings2, id: "settings", label: "Publish" },
  ];

  return (
    <div
      aria-label="Editing sections"
      className="flex gap-1 overflow-x-auto border-b border-gray-300 px-4 sm:px-6 dark:border-gray-600"
      role="tablist"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            aria-controls={`cms-${tab.id}-panel`}
            aria-selected={active}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? theme.activeTab
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
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
                  active ? "bg-current/10" : "bg-gray-200 dark:bg-gray-700"
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
