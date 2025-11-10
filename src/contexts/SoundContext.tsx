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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize sound manager with storage URLs
  useEffect(() => {
    soundManager
      .initialize()
      .then(() => {
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error("Failed to initialize sound manager:", error);
      });
  }, []);

  const playSound = useCallback(
    (type: SoundType, options?: { volume?: number; onend?: () => void }) => {
      if (!isInitialized) return;
      soundManager.play(type, options);
    },
    [isInitialized],
  );

  const stopSound = useCallback(
    (type: SoundType) => {
      if (!isInitialized) return;
      soundManager.stop(type);
    },
    [isInitialized],
  );

  const setVolumeCallback = useCallback(
    (type: SoundType, volume: number) => {
      if (!isInitialized) return;
      soundManager.setVolume(type, volume);
    },
    [isInitialized],
  );

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
