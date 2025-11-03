"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  const currentCursorRef = useRef<CursorType>("normal");
  useEffect(() => {
    currentCursorRef.current = currentCursor;
  }, [currentCursor]);

  const setCursor = useCallback((cursor: CursorType) => {
    if (currentCursorRef.current === cursor) return; // Avoid redundant work
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

  // Listen for cursor changes with requestAnimationFrame throttling
  useEffect(() => {
    let rafId = 0;
    let lastTarget: EventTarget | null = null;

    const processTarget = (el: HTMLElement) => {
      // Quick exits based on tagName and classes
      const tag = el.tagName;
      const classList = el.classList;

      // Inputs/text areas/selects or forced text cursor
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        classList.contains("cursor-text")
      ) {
        setCursor("text");
        return;
      }

      // Disabled/unavailable
      if (
        (el as HTMLButtonElement).disabled ||
        el.getAttribute("aria-disabled") === "true" ||
        classList.contains("cursor-not-allowed")
      ) {
        setCursor("unavailable");
        return;
      }

      // Move/drag handles
      const dragHandle = classList.contains("window-drag-handle")
        ? el
        : (el.closest(".window-drag-handle") as HTMLElement | null);
      if (dragHandle) {
        setCursor("move");
        return;
      }

      // Resize handles
      const resizeEl = classList.contains("resize-handle")
        ? el
        : (el.closest(".resize-handle") as HTMLElement | null);
      if (resizeEl) {
        const cls = resizeEl.className;
        if (cls.includes("resize-handle-ew")) {
          setCursor("horizontal");
        } else if (cls.includes("resize-handle-ns")) {
          setCursor("vertical");
        } else if (cls.includes("resize-handle-nwse")) {
          setCursor("diagonal1");
        } else if (cls.includes("resize-handle-nesw")) {
          setCursor("diagonal2");
        } else {
          setCursor("move");
        }
        return;
      }

      // Buttons/links/pointer-intent
      if (
        tag === "BUTTON" ||
        tag === "A" ||
        el.role === "button" ||
        classList.contains("cursor-pointer") ||
        classList.contains("cursor-link") ||
        el.closest('button,a,[role="button"],.cursor-pointer')
      ) {
        setCursor("link");
        return;
      }

      // Custom cursor classes
      if (classList.contains("cursor-help")) {
        setCursor("help");
        return;
      }
      if (classList.contains("cursor-busy")) {
        setCursor("busy");
        return;
      }
      if (classList.contains("cursor-working")) {
        setCursor("working");
        return;
      }
      if (classList.contains("cursor-handwriting")) {
        setCursor("handwriting");
        return;
      }
      if (classList.contains("cursor-person")) {
        setCursor("person");
        return;
      }
      if (classList.contains("cursor-pin")) {
        setCursor("pin");
        return;
      }
      if (classList.contains("cursor-precision")) {
        setCursor("precision");
        return;
      }
      if (classList.contains("cursor-alternate")) {
        setCursor("alternate");
        return;
      }

      // Default: do nothing; we keep whatever cursor is set until another element dictates
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const el = (lastTarget as HTMLElement) || document.body;
        if (el) processTarget(el);
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      lastTarget = e.target;
      schedule();
    };

    // pointermove + rAF throttling; use passive where supported
    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener("pointermove", onPointerMove);
    };
  }, [setCursor]);

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
