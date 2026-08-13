"use client";

import type { AdminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import type { CmsEditorTabConfig } from "@/components/admin/cms-management/legacy-editor-tabs";

export type CmsEditorTab =
  | "basic"
  | "connections"
  | "content"
  | "details"
  | "media"
  | "settings";

export default function CmsEditorTabs({
  activeTab,
  onChange,
  tabs,
  theme,
}: {
  activeTab: CmsEditorTab;
  onChange: (tab: CmsEditorTab) => void;
  tabs: CmsEditorTabConfig[];
  theme: AdminCmsTheme;
}) {
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
