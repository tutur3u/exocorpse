"use client";

import { useWindows } from "@/contexts/WindowContext";
import type { AppId } from "@/types/window";
import Image from "next/image";
import { useState } from "react";
import DesktopIcon from "./DesktopIcon";
import Taskbar from "./Taskbar";
import Window from "./Window";

export default function Desktop() {
  const { windows, appConfigs } = useWindows();
  const [selectedIconId, setSelectedIconId] = useState<AppId | null>(null);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black text-slate-100"
      onClick={() => setSelectedIconId(null)}
    >
      <Image
        src="/LykoTwins.webp"
        alt="Exocorpse character wallpaper"
        fill
        className="object-cover object-center"
        loading="eager"
        priority
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_38%),linear-gradient(180deg,rgba(2,6,23,0.34),rgba(2,6,23,0.68)_45%,rgba(2,6,23,0.92))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.6),transparent_30%,transparent_70%,rgba(15,23,42,0.55))]" />
      {/* Desktop Icons - Logo at Top, Icons Centered */}
      <div className="absolute top-1/2 left-1/2 z-10 flex w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 transform flex-col items-center gap-7 px-6">
        {/* Logo - Top of screen */}
        <div className="pointer-events-auto relative h-40 w-96">
          <Image
            src="/desktop-logo.webp"
            alt="EXOCORPSE & MORS Logo"
            fill
            className="object-contain drop-shadow-[0_14px_32px_rgba(2,6,23,0.9)]"
          />
        </div>
        <div className="rounded-full border border-white/10 bg-slate-950/45 px-5 py-2 shadow-[0_18px_40px_rgba(2,6,23,0.42)] backdrop-blur-md">
          <p className="text-center text-xl text-slate-100/92">
            the duo of artist & writer in one vessel
          </p>
        </div>
        {/* Icons - Just below logo */}
        <div className="pointer-events-auto flex flex-wrap items-start justify-center gap-8 rounded-[1.75rem] border border-white/10 bg-slate-950/28 px-8 py-7 shadow-[0_24px_60px_rgba(2,6,23,0.48)] backdrop-blur-sm">
          {appConfigs.map((app) => (
            <DesktopIcon
              key={app.id}
              id={app.id}
              title={app.title}
              icon={app.icon}
              selected={selectedIconId === app.id}
              onSelect={(id) => setSelectedIconId(id)}
            />
          ))}
        </div>
      </div>

      {/* Windows (non-interactive layer; windows themselves re-enable events) */}
      <div className="pointer-events-none absolute inset-0 bottom-12">
        {windows.map((window) => {
          const config = appConfigs.find((c) => c.id === window.id);
          if (!config) return null;

          const AppComponent = config.component;

          return (
            <Window key={window.id} id={window.id} title={config.title}>
              <AppComponent />
            </Window>
          );
        })}
      </div>

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
}
