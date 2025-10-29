"use client";

import { Howl } from "howler"; // Make sure you have 'howler' installed
import { useEffect, useRef, useState } from "react";
import Icon from "./shared/Icon";

export default function MusicPlayer() {
  // A ref to hold the Howl instance
  const soundRef = useRef<Howl | null>(null);

  // A ref to store the volume before muting
  const lastVolumeRef = useRef(0.5);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // Howler's volume is 0.0 to 1.0
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isPlayButtonHovered, setIsPlayButtonHovered] = useState(false);
  const [isVolumeButtonHovered, setIsVolumeButtonHovered] = useState(false);
  const [isVolumeMuteButtonHovered, setIsVolumeMuteButtonHovered] =
    useState(false);

  // Initialize Howler on component mount
  useEffect(() => {
    const sound = new Howl({
      src: ["/audio/bgm.mp3"], // Howler accepts an array of sources
      loop: true,
      volume: volume,
      html5: true, // Use HTML5 Audio for streaming BGM
      preload: "metadata", // Don't load the whole file immediately

      // Set state based on Howler's internal events
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onend: () => setIsPlaying(false), // Just in case loop is turned off
    });

    soundRef.current = sound;

    // --- Attempt Autoplay ---
    // We manually call play() and listen for an error on this specific ID
    const soundId = sound.play();

    sound.once("playerror", (id, err) => {
      if (id === soundId) {
        console.warn("Autoplay was blocked by the browser.", err);
        // The 'onplay' event won't fire, so ensure state is false
        setIsPlaying(false);
      }
    });

    // Cleanup on unmount
    return () => {
      sound.unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures this runs only once

  // Update Howler's volume when the state changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  const togglePlay = () => {
    const sound = soundRef.current;
    if (!sound) return;

    if (sound.playing()) {
      sound.pause();
    } else {
      sound.play();
    }
    // We don't need setIsPlaying here; the 'onplay'/'onpause' listeners do it.
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // If we're dragging the slider and it's not 0, update the "last" volume
    if (newVolume > 0) {
      lastVolumeRef.current = newVolume;
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      // Store the current volume before muting
      lastVolumeRef.current = volume;
      setVolume(0);
    } else {
      // Restore to the last known volume (or 0.5 as a default)
      setVolume(lastVolumeRef.current > 0 ? lastVolumeRef.current : 0.5);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* The <audio> element is no longer needed! 
        Howler manages the audio context internally.
      */}

      {/* Volume Slider Popup (No changes needed) */}
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
              type="button"
              onClick={toggleMute}
              onMouseEnter={() => setIsVolumeMuteButtonHovered(true)}
              onMouseLeave={() => setIsVolumeMuteButtonHovered(false)}
              className="flex h-8 w-8 items-center justify-center transition-colors hover:text-blue-500"
              title={volume > 0 ? "Mute" : "Unmute"}
            >
              <Icon
                name={
                  volume === 0
                    ? "Speaker_0"
                    : volume < 0.5
                      ? "Speaker_1"
                      : "Speaker_2"
                }
                size={32}
                alt={volume > 0 ? "Mute" : "Unmute"}
                className="h-6 w-6"
                isHovered={isVolumeMuteButtonHovered}
              />
            </button>
          </div>
        </div>
      )}

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        onMouseEnter={() => setIsPlayButtonHovered(true)}
        onMouseLeave={() => setIsPlayButtonHovered(false)}
        className="flex h-10 w-10 items-center justify-center rounded transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
        title={isPlaying ? "Pause" : "Play"}
      >
        <Icon
          name={isPlaying ? "Pause" : "Play"}
          size={32}
          alt={isPlaying ? "Pause" : "Play"}
          className="h-6 w-6"
          isHovered={isPlayButtonHovered}
        />
      </button>

      {/* Volume Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          onMouseEnter={() => setIsVolumeButtonHovered(true)}
          onMouseLeave={() => setIsVolumeButtonHovered(false)}
          className="flex h-10 w-10 items-center justify-center rounded transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
          title="Volume"
        >
          <Icon
            name={
              volume === 0
                ? "Speaker_0"
                : volume < 0.5
                  ? "Speaker_1"
                  : "Speaker_2"
            }
            size={32}
            alt="Volume"
            className="h-6 w-6"
            isHovered={isVolumeButtonHovered}
          />
        </button>
      </div>
    </div>
  );
}
