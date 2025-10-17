"use client";

import { useSound } from "@/contexts/SoundContext";
import { useEffect, useState } from "react";

export default function BootScreen({
  onBootComplete,
}: {
  onBootComplete: () => void;
}) {
  const { playSound, stopSound } = useSound();
  const [dots, setDots] = useState("");

  useEffect(() => {
    let hasCompleted = false;
    // Fallback timer - complete after 4 seconds even if audio fails
    const fallbackTimer = setTimeout(() => {
      if (!hasCompleted) {
        hasCompleted = true;
        onBootComplete();
      }
    }, 4000);

    playSound("boot", {
      onend: () => {
        if (!hasCompleted) {
          hasCompleted = true;
          clearTimeout(fallbackTimer);
          onBootComplete();
        }
      },
    });

    // Animate loading dots
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
      // Stop boot sound on cleanup (important for React StrictMode in development)
      stopSound("boot");
    };
  }, [playSound, onBootComplete, stopSound]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-8 text-6xl font-bold text-green-400">EXOCORPSE</div>
        <div className="font-mono text-xl text-green-400">
          BOOTING SYSTEM{dots}
        </div>
        <div className="mt-4 text-sm text-green-400/70">
          Initializing security protocols...
        </div>
      </div>
    </div>
  );
}
