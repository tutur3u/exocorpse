"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Character, Faction, World } from "@/lib/actions/wiki";

type WikiObject = World | Character | Faction | null;

type WikiThemeContextType = {
  currentObject: WikiObject;
  objectType: "world" | "character" | "faction" | null;
  setCurrentObject: (
    object: WikiObject,
    type: "world" | "character" | "faction" | null,
  ) => void;
};

const WikiThemeContext = createContext<WikiThemeContextType | undefined>(
  undefined,
);

export function WikiThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentObject, setCurrentObjectState] = useState<WikiObject>(null);
  const [objectType, setObjectType] = useState<
    "world" | "character" | "faction" | null
  >(null);

  const setCurrentObject = (
    object: WikiObject,
    type: "world" | "character" | "faction" | null,
  ) => {
    setCurrentObjectState(object);
    setObjectType(type);
  };

  // Apply theme when object changes
  useEffect(() => {
    if (currentObject) {
      const root = document.documentElement;

      // Apply custom colors if available (using type guards for safety)
      if (
        "theme_primary_color" in currentObject &&
        currentObject.theme_primary_color
      ) {
        root.style.setProperty(
          "--wiki-primary",
          currentObject.theme_primary_color,
        );
      }
      if (
        "theme_secondary_color" in currentObject &&
        currentObject.theme_secondary_color
      ) {
        root.style.setProperty(
          "--wiki-secondary",
          currentObject.theme_secondary_color,
        );
      }

      // For worlds, also apply background image if available
      if (objectType === "world" && "theme_background_image" in currentObject) {
        const world = currentObject as World;
        if (world.theme_background_image) {
          root.style.setProperty(
            "--wiki-bg-image",
            `url(${world.theme_background_image})`,
          );
        } else {
          root.style.removeProperty("--wiki-bg-image");
        }
      } else {
        root.style.removeProperty("--wiki-bg-image");
      }
    } else {
      // Clear theme when no object selected
      const root = document.documentElement;
      root.style.removeProperty("--wiki-primary");
      root.style.removeProperty("--wiki-secondary");
      root.style.removeProperty("--wiki-bg-image");
    }
  }, [currentObject, objectType]);

  return (
    <WikiThemeContext.Provider
      value={{ currentObject, objectType, setCurrentObject }}
    >
      {children}
    </WikiThemeContext.Provider>
  );
}

export function useWikiTheme() {
  const context = useContext(WikiThemeContext);
  if (context === undefined) {
    throw new Error("useWikiTheme must be used within a WikiThemeProvider");
  }
  return context;
}
