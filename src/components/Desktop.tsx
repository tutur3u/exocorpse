"use client";

import { useWindows } from "@/contexts/WindowContext";
import type { AppId } from "@/types/window";
import { useState } from "react";
import DesktopIcon from "./DesktopIcon";
import Taskbar from "./Taskbar";
import Window from "./Window";

export default function Desktop() {
  const { windows, appConfigs } = useWindows();
  const [selectedIconId, setSelectedIconId] = useState<AppId | null>(null);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      onClick={() => setSelectedIconId(null)}
    >
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 grid gap-4">
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
