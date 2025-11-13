"use client";

import { useInitialWikiData } from "@/contexts/InitialWikiDataContext";
import { useStories } from "@/hooks/useStories";
import WikiClient from "./WikiClient";

export default function Wiki() {
  const initialData = useInitialWikiData();
  const preset =
    initialData?.stories && initialData.stories.length > 0
      ? initialData.stories
      : undefined;
  const { data: stories = [], isLoading } = useStories(preset);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <WikiClient
          stories={stories}
          initialData={initialData}
          isLoadingStories={isLoading}
        />
      </div>
    </div>
  );
}
