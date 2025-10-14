"use client";

import { useEffect, useRef, useState } from "react";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [autoplayMuted, setAutoplayMuted] = useState(false);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Attempt autoplay on mount. If browser blocks unmuted autoplay,
  // fallback to muted autoplay so audio starts streaming without user click.
  useEffect(() => {
    const attemptAutoplay = async () => {
      const audio = audioRef.current;
      if (!audio) return;

      // Ensure we don't preload the whole file; allow streaming.
      audio.preload = "none";

      try {
        // Try playing unmuted first
        audio.muted = false;
        audio.volume = volume;
        await audio.play();
        setIsPlaying(true);
        setAutoplayMuted(false);
      } catch {
        // Autoplay blocked; try muted autoplay as a graceful fallback
        try {
          audio.muted = true;
          audio.volume = 0;
          await audio.play();
          setIsPlaying(true);
          setAutoplayMuted(true);
          setVolume(0);
        } catch {
          // Still blocked (rare). We'll stay paused and let user interact.
          setIsPlaying(false);
          setAutoplayMuted(false);
        }
      } finally {
        setAutoplayAttempted(true);
      }
    };

    // Run after a short delay to ensure the audio element is ready in some environments
    const t = setTimeout(() => attemptAutoplay(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.muted = false;
    }
    setAutoplayMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (audioRef.current.muted || volume === 0) {
      // Unmute and restore a sensible volume
      audioRef.current.muted = false;
      const restoredVolume = volume === 0 ? 0.5 : volume;
      setVolume(restoredVolume);
      audioRef.current.volume = restoredVolume;
      setAutoplayMuted(false);
    } else {
      audioRef.current.muted = true;
      setVolume(0);
      setAutoplayMuted(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Audio element with streaming support */}
      <audio
        ref={audioRef}
        src="/exocorpse.mp3"
        loop
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />

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
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
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
            onClick={() => {
              if (!audioRef.current) return;
              audioRef.current.muted = false;
              setAutoplayMuted(false);
              setShowVolumeSlider(true);
            }}
          >
            !
          </div>
        )}
      </div>
    </div>
  );
}
