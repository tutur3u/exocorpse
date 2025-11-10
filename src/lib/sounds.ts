import { Howl } from "howler";
import { getCachedSignedUrl } from "./actions/storage";

export type SoundType =
  | "boot"
  | "click"
  | "hover"
  | "window-off"
  | "error"
  | "bgm";

interface SoundConfig {
  path: string;
  volume: number;
  loop?: boolean;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  boot: { path: "public/audio/boot.mp3", volume: 0.5 },
  click: { path: "public/audio/click.mp3", volume: 0.3 },
  hover: { path: "public/audio/hover.mp3", volume: 0.2 },
  "window-off": { path: "public/audio/window-off.mp3", volume: 0.4 },
  error: { path: "public/audio/error.mp3", volume: 0.5 },
  bgm: { path: "public/audio/bgm.mp3", volume: 0.3, loop: true },
};

class SoundManager {
  private sounds: Map<SoundType, Howl> = new Map();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the sound manager with storage URLs
   * This should be called once when the app starts
   */
  async initialize() {
    if (this.initialized || this.initPromise) {
      return this.initPromise || Promise.resolve();
    }

    this.initPromise = (async () => {
      try {
        // Fetch audio URLs from storage one by one (getCachedSignedUrl is a server action)
        for (const [type, config] of Object.entries(SOUND_CONFIGS)) {
          try {
            const url = await getCachedSignedUrl(config.path);
            if (url) {
              this.sounds.set(
                type as SoundType,
                new Howl({
                  src: [url],
                  volume: config.volume,
                  loop: config.loop || false,
                  preload: true,
                }),
              );
            } else {
              console.warn(`Failed to get URL for sound: ${type}`);
            }
          } catch (error) {
            console.warn(`Error loading sound ${type}:`, error);
          }
        }

        this.initialized = true;
      } catch (error) {
        console.error("Error initializing sound manager:", error);
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  play(
    type: SoundType,
    options?: {
      volume?: number;
      onend?: () => void;
      onplay?: () => void;
      onplayerror?: () => void;
    },
  ) {
    const sound = this.sounds.get(type);
    if (sound) {
      const state = sound.state();

      // If sound is still loading, wait for it to load
      if (state === "loading") {
        sound.once("load", () => {
          this.playLoadedSound(sound, type, options);
        });
      } else {
        this.playLoadedSound(sound, type, options);
      }
    }
  }

  private playLoadedSound(
    sound: Howl,
    type: SoundType,
    options:
      | {
          volume?: number;
          onend?: () => void;
          onplay?: () => void;
          onplayerror?: () => void;
        }
      | undefined,
  ) {
    if (options?.volume !== undefined) {
      sound.volume(options.volume);
    }
    if (options?.onend) {
      sound.once("end", () => {
        options.onend!();
      });
    }

    // Set up play success handler
    if (options?.onplay) {
      sound.once("play", () => {
        options.onplay!();
      });
    }

    // Set up play error handler (for autoplay blocks, etc.)
    if (options?.onplayerror) {
      sound.once("playerror", () => {
        options.onplayerror!();
      });
    }

    sound.play();
  }

  stop(type: SoundType) {
    const sound = this.sounds.get(type);
    if (sound) {
      sound.stop();
    }
  }

  setVolume(type: SoundType, volume: number) {
    const sound = this.sounds.get(type);
    if (sound) {
      sound.volume(volume);
    }
  }

  markInitialized() {
    this.initialized = true;
  }

  isInitialized() {
    return this.initialized;
  }
}

// Singleton instance
export const soundManager = new SoundManager();
