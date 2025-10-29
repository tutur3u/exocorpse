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
      className="relative h-screen w-screen overflow-hidden bg-[url(/background-image.webp)] bg-cover bg-center bg-no-repeat"
      onClick={() => setSelectedIconId(null)}
    >
      {/* Desktop Icons - Logo at Top, Icons Centered */}
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center gap-6">
        {/* Logo - Top of screen */}
        <div className="pointer-events-auto relative h-40 w-96">
          <Image
            src="/desktop-logo.webp"
            alt="EXOCORPSE & MORS Logo"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-center text-xl">
            the duo of artist & writer in one vessel
          </p>
        </div>
        {/* Icons - Just below logo */}
        <div className="pointer-events-auto flex gap-8">
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
