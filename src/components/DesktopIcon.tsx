"use client";

import { useWindows } from "@/contexts/WindowContext";
import type { AppId } from "@/types/window";

interface DesktopIconProps {
  id: AppId;
  title: string;
  icon: string;
  selected?: boolean;
  onSelect?: (id: AppId) => void;
}

export default function DesktopIcon({
  id,
  title,
  icon,
  selected = false,
  onSelect,
}: DesktopIconProps) {
  const { openWindow } = useWindows();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        // handle single click selection and defer double-click via native onDoubleClick
        onSelect?.(id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        openWindow(id);
      }}
      className={`group flex w-24 flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-white/10 ${selected ? "bg-white/15 ring-2 ring-white/40" : ""}`}
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-lg bg-white/20 text-4xl backdrop-blur-sm transition-transform group-hover:scale-110`}
      >
        {icon}
      </div>
      <span
        className={`text-center text-sm font-medium drop-shadow-lg ${selected ? "text-white" : "text-white/90"}`}
      >
        {title}
      </span>
    </button>
  );
}
