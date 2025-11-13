"use client";

import type { AppId } from "@/types/window";
import React, { createContext, useCallback, useContext, useState } from "react";

interface Theme {
  primary?: string;
  secondary?: string;
  text?: string;
}

interface WindowThemeContextType {
  getTheme: (windowId: AppId) => Theme | undefined;
  setTheme: (windowId: AppId, theme: Theme | null) => void;
}

const WindowThemeContext = createContext<WindowThemeContextType | undefined>(
  undefined,
);

export function WindowThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themes, setThemes] = useState<Record<string, Theme>>({});

  const getTheme = (windowId: AppId) => themes[windowId];

  const setTheme = useCallback((windowId: AppId, theme: Theme | null) => {
    setThemes((prev) => {
      if (theme === null) {
        // Remove theme if it exists
        if (!(windowId in prev)) return prev; // No change needed
        const { [windowId]: _, ...rest } = prev;
        return rest;
      }

      // Check if theme actually changed to avoid unnecessary updates
      const existingTheme = prev[windowId];
      if (
        existingTheme &&
        existingTheme.primary === theme.primary &&
        existingTheme.secondary === theme.secondary &&
        existingTheme.text === theme.text
      ) {
        return prev; // No change needed
      }

      return { ...prev, [windowId]: theme };
    });
  }, []);

  return (
    <WindowThemeContext.Provider value={{ getTheme, setTheme }}>
      {children}
    </WindowThemeContext.Provider>
  );
}

export function useWindowTheme() {
  const context = useContext(WindowThemeContext);
  if (!context) {
    throw new Error("useWindowTheme must be used within WindowThemeProvider");
  }
  return context;
}
