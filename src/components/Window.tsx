"use client";

import { TASKBAR_HEIGHT } from "@/constants";
import { useSound } from "@/contexts/SoundContext";
import { useWindows } from "@/contexts/WindowContext";
import type { AppId } from "@/types/window";
import { parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";

interface WindowProps {
  id: AppId;
  title: string;
  children: React.ReactNode;
}

export default function Window({ id, title, children }: WindowProps) {
  const {
    windows,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindows();

  const { playSound } = useSound();

  // Set up params clearing for wiki, commission, and portfolio windows
  const [, setParams] = useQueryStates(
    {
      story: parseAsString,
      world: parseAsString,
      character: parseAsString,
      faction: parseAsString,
      "commission-tab": parseAsString,
      "blacklist-page": parseAsString,
      "blacklist-page-size": parseAsString,
      service: parseAsString,
      style: parseAsString,
      "portfolio-tab": parseAsString,
      "portfolio-piece": parseAsString,
      "story-tab": parseAsString,
      "faction-tab": parseAsString,
      "character-tab": parseAsString,
      "world-tab": parseAsString,
    },
    {
      shallow: true,
      history: "push",
    },
  );

  const window = windows.find((w) => w.id === id);
  const rndRef = useRef<Rnd>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const prevStateRef = useRef(window?.state);
  const animationFrameRef = useRef<number>(undefined);
  const hasAnimatedRef = useRef(false);
  const hasMountedRef = useRef(false);
  const [animatingSize, setAnimatingSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [animatingPos, setAnimatingPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Window opening animation - only run once on mount
  useEffect(() => {
    if (window && window.state !== "minimized" && !hasAnimatedRef.current) {
      setIsAnimating(true);
      hasAnimatedRef.current = true;
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [window]);

  // Animate window size/position changes
  const animateWindow = useCallback(
    (
      startPos: { x: number; y: number },
      startSize: { width: number; height: number },
      endPos: { x: number; y: number },
      endSize: { width: number; height: number },
      duration: number = 300,
    ) => {
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-in-out)
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - (-2 * progress + 2) ** 2 / 2;

        const currentPos = {
          x: startPos.x + (endPos.x - startPos.x) * eased,
          y: startPos.y + (endPos.y - startPos.y) * eased,
        };

        const currentSize = {
          width: startSize.width + (endSize.width - startSize.width) * eased,
          height:
            startSize.height + (endSize.height - startSize.height) * eased,
        };

        setAnimatingPos(currentPos);
        setAnimatingSize(currentSize);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete, sync with context
          setAnimatingPos(null);
          setAnimatingSize(null);
          updateWindowPosition(id, endPos);
          updateWindowSize(id, endSize);
        }
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [id, updateWindowPosition, updateWindowSize],
  );

  // Handle maximize/restore with animation
  useEffect(() => {
    // On first mount, initialize prevStateRef and skip animation for initially maximized windows
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (window) {
        prevStateRef.current = window.state;
      }
      return;
    }

    if (window && prevStateRef.current !== window.state) {
      if (prevStateRef.current === "normal" && window.state === "maximized") {
        // Animate to maximized
        const startPos = window.position;
        const startSize = window.size;
        const endPos = { x: 0, y: 0 };
        const endSize = {
          width: globalThis.window.innerWidth,
          height: globalThis.window.innerHeight - TASKBAR_HEIGHT,
        };

        animateWindow(startPos, startSize, endPos, endSize);
      } else if (
        prevStateRef.current === "maximized" &&
        window.state === "normal"
      ) {
        // Animate to normal (using previousState)
        const startPos = window.position;
        const startSize = window.size;
        const endPos = window.previousState?.position || window.position;
        const endSize = window.previousState?.size || window.size;

        animateWindow(startPos, startSize, endPos, endSize);
      }
      prevStateRef.current = window.state;
    }
  }, [animateWindow, window]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    // Play window close sound
    playSound("window-off");

    // If closing the wiki window, clear wiki search params
    if (id === "wiki") {
      setParams({
        story: null,
        world: null,
        character: null,
        faction: null,
        "story-tab": null,
        "faction-tab": null,
        "character-tab": null,
        "world-tab": null,
      });
    }

    // If closing the commission window, clear commission search params
    if (id === "commission") {
      setParams({
        "commission-tab": null,
        "blacklist-page": null,
        "blacklist-page-size": null,
        service: null,
        style: null,
      });
    }

    // If closing the portfolio window, clear portfolio search params
    if (id === "portfolio") {
      setParams({
        "portfolio-tab": null,
        "portfolio-piece": null,
      });
    }

    setIsClosing(true);
    setTimeout(() => {
      closeWindow(id);
    }, 150);
  };

  const handleMinimize = () => {
    setIsClosing(true);
    setTimeout(() => {
      minimizeWindow(id);
      setIsClosing(false);
    }, 150);
  };

  if (!window || window.state === "minimized") {
    return null;
  }

  const isMaximized = window.state === "maximized";

  // Use animating values during animation, otherwise use context values
  const currentPosition = animatingPos || window.position;
  const currentSize = animatingSize || window.size;

  return (
    <Rnd
      ref={rndRef}
      position={currentPosition}
      size={currentSize}
      onDragStart={() => focusWindow(id)}
      onDragStop={(_, d) => {
        updateWindowPosition(id, { x: d.x, y: d.y });
      }}
      onResizeStop={(_, __, ref, ___, position) => {
        updateWindowSize(id, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        });
        updateWindowPosition(id, position);
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="window-drag-handle"
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      style={{
        zIndex: window.zIndex,
      }}
      className="window-container pointer-events-auto"
    >
      <div
        className={`flex h-full flex-col overflow-hidden bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 ${
          !isMaximized ? "rounded-lg border border-gray-300" : ""
        } ${isAnimating ? "animate-scaleIn" : ""} ${isClosing ? "animate-fadeOut" : ""}`}
        onMouseDown={() => focusWindow(id)}
      >
        {/* Title Bar */}
        <div className="window-drag-handle flex cursor-move items-center justify-between border-b border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMinimize}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Minimize"
            >
              <svg
                width="12"
                height="2"
                viewBox="0 0 12 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="12" height="2" fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (isMaximized) {
                  restoreWindow(id);
                } else {
                  maximizeWindow(id);
                }
              }}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="1"
                  width="10"
                  height="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </button>
            <button
              onClick={handleClose}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-red-500 hover:text-white"
              title="Close"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L11 11M1 11L11 1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </Rnd>
  );
}
