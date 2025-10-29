"use client";

import { useMobile } from "@/contexts/MobileContext";
import type { AppId } from "@/types/window";
import { useEffect, useRef, useState } from "react";
import Icon from "../shared/Icon";

// AppButton component to manage individual app button hover state
function AppButton({
  appId,
  title,
  icon,
  onSelect,
}: {
  appId: AppId;
  title: string;
  icon: string;
  onSelect: (id: AppId) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(appId)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl bg-gray-50 p-6 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <Icon
        name={icon}
        size={32}
        alt={title}
        className="h-12 w-12"
        isHovered={isHovered}
      />
      <span className="text-sm font-medium">{title}</span>
    </button>
  );
}

export default function MobileBottomSheet() {
  const {
    sheetState,
    selectedApp,
    apps,
    openSheet,
    closeSheet,
    selectApp,
    goBackToAppList,
  } = useMobile();
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Get the selected app component
  const selectedAppConfig = apps.find((app) => app.id === selectedApp);
  const AppComponent = selectedAppConfig?.component;

  // Calculate sheet height based on state
  const getSheetHeight = () => {
    if (sheetState === "closed") return "60px";
    if (sheetState === "half-open") return "50%";
    if (sheetState === "full-open") return "85%";
    return "60px";
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;

    // Swipe down
    if (deltaY > 50) {
      if (sheetState === "full-open") {
        if (selectedApp) {
          goBackToAppList();
        } else {
          closeSheet();
        }
      } else if (sheetState === "half-open") {
        closeSheet();
      }
    }
    // Swipe up
    else if (deltaY < -50) {
      if (sheetState === "closed") {
        openSheet();
      }
    }

    setStartY(0);
    setCurrentY(0);
  };

  // Handle backdrop click
  const handleBackdropClick = () => {
    if (sheetState !== "closed") {
      closeSheet();
    }
  };

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (sheetState !== "closed") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetState]);

  return (
    <>
      {/* Backdrop */}
      {sheetState !== "closed" && (
        <div
          className="animate-fadeIn fixed inset-0 z-998 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        />
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed right-0 bottom-0 left-0 z-999 rounded-t-3xl bg-white shadow-2xl transition-all duration-300 ease-out dark:bg-gray-900"
        style={{
          height: getSheetHeight(),
          transform: isDragging
            ? `translateY(${Math.max(0, currentY - startY)}px)`
            : "translateY(0)",
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex cursor-grab items-center justify-center py-3 active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 px-6 pb-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {selectedApp ? selectedAppConfig?.title : "EXOCORPSE"}
            </h2>
            {selectedApp && (
              <button
                onClick={goBackToAppList}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Back to app list"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-80px)] overflow-y-auto">
          {!selectedApp ? (
            // App List
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {apps.map((app) => (
                  <AppButton
                    key={app.id}
                    appId={app.id}
                    title={app.title}
                    icon={app.icon}
                    onSelect={selectApp}
                  />
                ))}
              </div>
            </div>
          ) : (
            // App Content
            <div className="h-full">{AppComponent && <AppComponent />}</div>
          )}
        </div>
      </div>
    </>
  );
}
