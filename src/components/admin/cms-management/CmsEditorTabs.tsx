"use client";

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
  | "settings"
  | "styles";

export default function CmsEditorTabs({
  activeTab,
  onChange,
  tabs,
}: {
  activeTab: CmsEditorTab;
  onChange: (tab: CmsEditorTab) => void;
  tabs: CmsEditorTabConfig[];
}) {
  return (
    <>
      <div className="border-b border-gray-300 px-4 pb-4 sm:hidden dark:border-gray-600">
        <label className="sr-only" htmlFor="editor-tabs">
          Select a tab
        </label>
        <select
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
          id="editor-tabs"
          onChange={(event) => onChange(event.target.value as CmsEditorTab)}
          value={activeTab}
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              <tab.icon className="size-4" aria-hidden="true" />
              {tab.label}
            </option>
          ))}
        </select>
      </div>
      <nav
        aria-label="Editing sections"
        role="tablist"
        className="hidden shrink-0 gap-1 overflow-x-auto border-b border-gray-300 px-4 sm:flex sm:px-6 dark:border-gray-600"
      >
        {tabs.map((tab) => (
          <button
            aria-controls={`cms-${tab.id}-panel`}
            aria-selected={activeTab === tab.id}
            className={`inline-flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"}`}
            id={`cms-${tab.id}-tab`}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            <tab.icon className="size-4" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}
