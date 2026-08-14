"use client";

import type { AdminCmsTheme } from "@/components/admin/cms-management/admin-theme";
import type { CmsEditorTabConfig } from "@/components/admin/cms-management/legacy-editor-tabs";

export type CmsEditorTab =
  | "abilities"
  | "basic"
  | "connections"
  | "content"
  | "details"
  | "fanwork"
  | "gallery"
  | "media"
  | "personality"
  | "physical"
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
    <nav
      aria-label="Editing sections"
      className="flex gap-1.5 overflow-x-auto border-b border-slate-200 bg-slate-50/80 p-2.5 sm:px-5 dark:border-slate-700 dark:bg-slate-950/45"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            aria-controls={`cms-${tab.id}-panel`}
            aria-current={active ? "location" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
              active
                ? theme.activeTab
                : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            }`}
            id={`cms-${tab.id}-tab`}
            key={tab.id}
            onClick={() => onChange(tab.id)}
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
    </nav>
  );
}
