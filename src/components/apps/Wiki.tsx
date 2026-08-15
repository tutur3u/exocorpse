"use client";

import { useInitialWikiData } from "@/contexts/InitialWikiDataContext";
import { usePublicStories } from "@/hooks/useStories";
import WikiClient from "./WikiClient";

export default function Wiki() {
  const initialData = useInitialWikiData();
  const preset =
    initialData?.stories && initialData.stories.length > 0
      ? initialData.stories
      : undefined;
  const { data: stories = [], isLoading } = usePublicStories(preset);

  return (
    <div className="h-full overflow-hidden">
      <WikiClient
        stories={stories}
        initialData={initialData}
        isLoadingStories={isLoading}
      />
    </div>
  );
}
