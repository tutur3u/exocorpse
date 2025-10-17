"use client";

import { soundManager, type SoundType } from "@/lib/sounds";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface SoundContextType {
  playSound: (
    type: SoundType,
    options?: { volume?: number; onend?: () => void },
  ) => void;
  stopSound: (type: SoundType) => void;
  setVolume: (type: SoundType, volume: number) => void;
  isBootComplete: boolean;
  setBootComplete: (complete: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isBootComplete, setBootComplete] = useState(false);

  const playSound = useCallback(
    (type: SoundType, options?: { volume?: number; onend?: () => void }) => {
      soundManager.play(type, options);
    },
    [],
  );

  const stopSound = useCallback((type: SoundType) => {
    soundManager.stop(type);
  }, []);

  const setVolumeCallback = useCallback((type: SoundType, volume: number) => {
    soundManager.setVolume(type, volume);
  }, []);

  // Add global click listener
  useEffect(() => {
    if (!isBootComplete) return;

    const handleClick = () => {
      playSound("click");
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [playSound, isBootComplete]);

  // Add global hover listener (only for desktop)
  useEffect(() => {
    if (!isBootComplete) return;

    // Throttle hover sound to avoid overwhelming audio
    let lastHoverTime = 0;
    const HOVER_THROTTLE = 150; // ms

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Only play hover sound for interactive elements
      const isInteractive =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.role === "button" ||
        target.classList.contains("cursor-pointer") ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest('[role="button"]') ||
        target.closest(".cursor-pointer");

      if (isInteractive) {
        const now = Date.now();
        if (now - lastHoverTime > HOVER_THROTTLE) {
          lastHoverTime = now;
          playSound("hover");
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    return () => document.removeEventListener("mouseover", handleMouseOver);
  }, [playSound, isBootComplete]);

  // Add global error handler
  useEffect(() => {
    if (!isBootComplete) return;

    const handleError = () => {
      playSound("error");
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, [playSound, isBootComplete]);

  return (
    <SoundContext.Provider
      value={{
        playSound,
        stopSound,
        setVolume: setVolumeCallback,
        isBootComplete,
        setBootComplete,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
