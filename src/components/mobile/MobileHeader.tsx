"use client";

import { useEffect, useState } from "react";
import MusicPlayer from "../MusicPlayer";

export default function MobileHeader({ isAppOpen }: { isAppOpen: boolean }) {
  const [currentTime, setCurrentTime] = useState<string>("");

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`flex items-center justify-between px-4 text-white ${isAppOpen ? "bg-gray-900" : "bg-transparent"}`}
    >
      {/* Time Display */}
      <div className="flex h-10 items-center justify-center rounded-lg px-2 font-mono text-lg font-medium">
        {currentTime}
      </div>

      {/* Music Controls - Using shared MusicPlayer component */}
      <MusicPlayer isMobile={true} />
    </div>
  );
}
