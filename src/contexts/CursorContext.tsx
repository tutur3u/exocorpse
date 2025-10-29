"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type CursorType =
  | "normal"
  | "link"
  | "move"
  | "text"
  | "busy"
  | "working"
  | "help"
  | "unavailable"
  | "vertical"
  | "horizontal"
  | "diagonal1"
  | "diagonal2"
  | "handwriting"
  | "person"
  | "pin"
  | "precision"
  | "alternate";

interface CursorContextType {
  currentCursor: CursorType;
  setCursor: (cursor: CursorType) => void;
  resetCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [currentCursor, setCurrentCursor] = useState<CursorType>("normal");

  const setCursor = useCallback((cursor: CursorType) => {
    setCurrentCursor(cursor);
    const cursorValue = `var(--cursor-${cursor})`;
    document.documentElement.style.setProperty(
      "cursor",
      cursorValue,
      "important",
    );
    document.body.style.setProperty("cursor", cursorValue, "important");
  }, []);

  const resetCursor = useCallback(() => {
    setCurrentCursor("normal");
    const cursorValue = `var(--cursor-normal)`;
    document.documentElement.style.setProperty(
      "cursor",
      cursorValue,
      "important",
    );
    document.body.style.setProperty("cursor", cursorValue, "important");
  }, []);

  // Listen for cursor changes when hovering over interactive elements
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if hovering over text input fields (use text cursor)
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.classList.contains("cursor-text")
      ) {
        setCursor("text");
      }
      // Check if hovering over buttons or links
      else if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.role === "button" ||
        target.classList.contains("cursor-pointer") ||
        target.classList.contains("cursor-link") ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest('[role="button"]') ||
        target.closest(".cursor-pointer")
      ) {
        setCursor("link");
      }
      // Check if hovering over move handles
      else if (
        target.classList.contains("window-drag-handle") ||
        target.closest(".window-drag-handle")
      ) {
        setCursor("move");
      }
      // Check if hovering over resize handles
      else if (
        target.classList.contains("resize-handle") ||
        target.closest(".resize-handle")
      ) {
        const classes = target.className;
        if (classes.includes("resize-handle-ew")) {
          setCursor("horizontal");
        } else if (classes.includes("resize-handle-ns")) {
          setCursor("vertical");
        } else if (classes.includes("resize-handle-nwse")) {
          setCursor("diagonal1");
        } else if (classes.includes("resize-handle-nesw")) {
          setCursor("diagonal2");
        } else {
          setCursor("move");
        }
      }
      // Check for disabled elements
      else if (
        (target as HTMLButtonElement).disabled ||
        target.getAttribute("aria-disabled") === "true" ||
        target.classList.contains("cursor-not-allowed")
      ) {
        setCursor("unavailable");
      }
      // Check for custom cursor classes
      else if (target.classList.contains("cursor-help")) {
        setCursor("help");
      } else if (target.classList.contains("cursor-busy")) {
        setCursor("busy");
      } else if (target.classList.contains("cursor-working")) {
        setCursor("working");
      } else if (target.classList.contains("cursor-handwriting")) {
        setCursor("handwriting");
      } else if (target.classList.contains("cursor-person")) {
        setCursor("person");
      } else if (target.classList.contains("cursor-pin")) {
        setCursor("pin");
      } else if (target.classList.contains("cursor-precision")) {
        setCursor("precision");
      } else if (target.classList.contains("cursor-alternate")) {
        setCursor("alternate");
      }
    };

    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [setCursor, resetCursor]);

  return (
    <CursorContext.Provider value={{ currentCursor, setCursor, resetCursor }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
}
