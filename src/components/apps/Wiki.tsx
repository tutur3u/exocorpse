"use client";

import { StoryThemeProvider } from "@/contexts/StoryThemeContext";
import { useStories } from "@/hooks/useStories";
import WikiClient from "./WikiClient";

export default function Wiki() {
  const { data: stories = [], isLoading } = useStories();

  return (
    <StoryThemeProvider>
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-2xl font-bold">Character & World Wiki</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          ) : (
            <WikiClient stories={stories} />
          )}
        </div>
      </div>
    </StoryThemeProvider>
  );
}
