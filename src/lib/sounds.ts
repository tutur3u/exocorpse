import { Howl } from "howler";

export type SoundType =
  | "boot"
  | "click"
  | "hover"
  | "window-off"
  | "error"
  | "bgm";

class SoundManager {
  private sounds: Map<SoundType, Howl> = new Map();
  private initialized = false;

  constructor() {
    this.sounds.set(
      "boot",
      new Howl({
        src: ["/audio/boot.mp3"],
        volume: 0.5,
        preload: true,
      }),
    );

    this.sounds.set(
      "click",
      new Howl({
        src: ["/audio/click.mp3"],
        volume: 0.3,
        preload: true,
      }),
    );

    this.sounds.set(
      "hover",
      new Howl({
        src: ["/audio/hover.mp3"],
        volume: 0.2,
        preload: true,
      }),
    );

    this.sounds.set(
      "window-off",
      new Howl({
        src: ["/audio/window-off.mp3"],
        volume: 0.4,
        preload: true,
      }),
    );

    this.sounds.set(
      "error",
      new Howl({
        src: ["/audio/error.mp3"],
        volume: 0.5,
        preload: true,
      }),
    );

    this.sounds.set(
      "bgm",
      new Howl({
        src: ["/audio/bgm.mp3"],
        volume: 0.3,
        loop: true,
        preload: true,
      }),
    );
  }

  play(type: SoundType, options?: { volume?: number; onend?: () => void }) {
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
    options: { volume?: number; onend?: () => void } | undefined,
  ) {
    if (options?.volume !== undefined) {
      sound.volume(options.volume);
    }
    if (options?.onend) {
      sound.once("end", () => {
        options.onend!();
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
