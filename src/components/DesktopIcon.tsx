"use client";

import { useWindows } from "@/contexts/WindowContext";
import type { AppId } from "@/types/window";
import { useState } from "react";
import Icon from "./shared/Icon";

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
        openWindow(id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex w-28 flex-col items-center gap-2 rounded-md border px-3 py-3 text-white transition-all duration-200 ${
        selected
          ? "border-cyan-300/70 bg-cyan-400/16 shadow-[0_0_0_1px_rgba(103,232,249,0.45),0_14px_28px_rgba(6,182,212,0.16)]"
          : "border-transparent hover:border-cyan-400/45 hover:bg-cyan-400/10"
      }`}
    >
      <div
        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-slate-950/45 backdrop-blur-md transition-all group-hover:scale-105 ${
          selected
            ? "shadow-[0_0_24px_rgba(34,211,238,0.22)]"
            : "group-hover:shadow-[0_0_18px_rgba(34,211,238,0.16)]"
        }`}
      >
        <Icon
          name={icon}
          size={256}
          alt={title}
          className="h-14 w-14"
          isHovered={isHovered}
        />
      </div>
      <span
        className={`relative z-10 px-1 text-center text-sm font-medium tracking-[0.08em] drop-shadow-[0_2px_8px_rgba(2,6,23,0.95)] ${
          selected ? "text-cyan-50" : "text-slate-100"
        }`}
      >
        {title}
      </span>
    </button>
  );
}
