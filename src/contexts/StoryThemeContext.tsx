"use client";

import type { Story } from "@/lib/actions/wiki";
import { createContext, useContext, useEffect, useState } from "react";

type StoryThemeContextType = {
  currentStory: Story | null;
  setCurrentStory: (story: Story | null) => void;
};

const StoryThemeContext = createContext<StoryThemeContextType | undefined>(
  undefined,
);

export function StoryThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);

  // Apply theme when story changes
  useEffect(() => {
    if (currentStory) {
      const root = document.documentElement;

      // Apply custom colors if available
      if (currentStory.theme_primary_color) {
        root.style.setProperty(
          "--story-primary",
          currentStory.theme_primary_color,
        );
      } else {
        root.style.setProperty("--story-primary", "#3b82f6");
      }

      if (currentStory.theme_secondary_color) {
        root.style.setProperty(
          "--story-secondary",
          currentStory.theme_secondary_color,
        );
      } else {
        root.style.setProperty("--story-secondary", "#2563eb");
      }

      if (currentStory.theme_background_color) {
        root.style.setProperty(
          "--story-bg",
          currentStory.theme_background_color,
        );
      }

      if (currentStory.theme_text_color) {
        root.style.setProperty("--story-text", currentStory.theme_text_color);
      }

      // Apply background image if available
      if (currentStory.theme_background_image) {
        root.style.setProperty(
          "--story-bg-image",
          `url(${currentStory.theme_background_image})`,
        );
      } else {
        root.style.removeProperty("--story-bg-image");
      }
    } else {
      // Clear theme when no story selected
      const root = document.documentElement;
      root.style.removeProperty("--story-primary");
      root.style.removeProperty("--story-secondary");
      root.style.removeProperty("--story-bg");
      root.style.removeProperty("--story-text");
      root.style.removeProperty("--story-bg-image");
    }
  }, [currentStory]);

  return (
    <StoryThemeContext.Provider value={{ currentStory, setCurrentStory }}>
      {children}
    </StoryThemeContext.Provider>
  );
}

export function useStoryTheme() {
  const context = useContext(StoryThemeContext);
  if (context === undefined) {
    throw new Error("useStoryTheme must be used within a StoryThemeProvider");
  }
  return context;
}
