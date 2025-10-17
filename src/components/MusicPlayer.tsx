"use client";

import { useSound } from "@/contexts/SoundContext";
import { soundManager } from "@/lib/sounds";
import { useEffect, useRef, useState } from "react";

export default function MusicPlayer() {
  const { isBootComplete } = useSound();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [autoplayMuted, setAutoplayMuted] = useState(false);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  const volumeRef = useRef(0.3);

  // Update volume in sound manager when it changes
  useEffect(() => {
    soundManager.setVolume("bgm", volume);
    volumeRef.current = volume;
  }, [volume]);

  // Attempt autoplay after boot is complete
  useEffect(() => {
    // Only attempt autoplay after boot and if not already attempted
    if (!isBootComplete || autoplayAttempted) return;

    const attemptAutoplay = () => {
      // Try playing with current volume first
      soundManager.play("bgm", {
        volume: volumeRef.current,
        onplay: () => {
          // Play succeeded
          setIsPlaying(true);
          setAutoplayMuted(false);
          setAutoplayAttempted(true);
        },
        onplayerror: () => {
          // Autoplay blocked; try muted autoplay as a graceful fallback
          soundManager.play("bgm", {
            volume: 0,
            onplay: () => {
              setIsPlaying(true);
              setAutoplayMuted(true);
              setVolume(0);
              setAutoplayAttempted(true);
            },
            onplayerror: () => {
              // Still blocked (rare). We'll stay paused and let user interact.
              setIsPlaying(false);
              setAutoplayMuted(false);
              setAutoplayAttempted(true);
            },
          });
        },
      });
    };

    // Run after a short delay to ensure the audio element is ready in some environments
    attemptAutoplay();
  }, [isBootComplete, autoplayAttempted]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      soundManager.stop("bgm");
      setIsPlaying(false);
    } else {
      soundManager.play("bgm", {
        volume,
        onplay: () => {
          setIsPlaying(true);
        },
        onplayerror: () => {
          setIsPlaying(false);
        },
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setAutoplayMuted(false);
  };

  const unmuteAudio = () => {
    const restoredVolume = volume === 0 ? 0.3 : volume;
    setVolume(restoredVolume);
    setAutoplayMuted(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (volume === 0) {
      // Unmute and restore a sensible volume
      unmuteAudio();
    } else {
      setVolume(0);
      setAutoplayMuted(false);
    }
  };

  const toggleVolumeSlider = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVolumeSlider(!showVolumeSlider);
  };

  const handleUnmuteIndicator = (e: React.MouseEvent) => {
    e.stopPropagation();
    unmuteAudio();
    setShowVolumeSlider(true);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Volume Slider Popup */}
      {showVolumeSlider && (
        <div className="absolute right-0 bottom-full mb-2 rounded-lg border border-gray-300 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {Math.round(volume * 100)}%
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="h-24 w-2 cursor-pointer appearance-none rounded-lg bg-gray-300 dark:bg-gray-600"
              style={{
                writingMode: "vertical-lr",
                direction: "rtl",
              }}
            />
            <button
              onClick={toggleMute}
              className="text-lg transition-colors hover:text-blue-500"
              title={volume > 0 ? "Mute" : "Unmute"}
            >
              {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
            </button>
          </div>
        </div>
      )}

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="flex h-10 w-10 items-center justify-center rounded text-lg transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "⏸️" : "▶️"}
      </button>

      {/* Volume Button (shows an autoplay-muted indicator if applicable) */}
      <div className="relative">
        <button
          onClick={toggleVolumeSlider}
          className="flex h-10 w-10 items-center justify-center rounded text-lg transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
          title="Volume"
        >
          {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
        </button>

        {/* Small indicator when autoplay started muted to prompt user to unmute */}
        {autoplayAttempted && autoplayMuted && (
          <div
            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-black"
            title="Autoplay started muted — click to unmute"
            onClick={handleUnmuteIndicator}
          >
            !
          </div>
        )}
      </div>
    </div>
  );
}
