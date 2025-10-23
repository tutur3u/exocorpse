"use client";

import { useInitialWikiData } from "@/contexts/InitialWikiDataContext";
import { StoryThemeProvider } from "@/contexts/StoryThemeContext";
import { useStories } from "@/hooks/useStories";
import WikiClient from "./WikiClient";

export default function Wiki() {
  const initialData = useInitialWikiData();
  const preset =
    initialData?.stories && initialData.stories.length > 0
      ? initialData.stories
      : undefined;
  const { data: stories = [] } = useStories(preset);

  return (
    <StoryThemeProvider>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">
          <WikiClient stories={stories} initialData={initialData} />
        </div>
      </div>
    </StoryThemeProvider>
  );
}
