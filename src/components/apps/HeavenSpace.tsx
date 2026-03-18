"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { useSound } from "@/contexts/SoundContext";
import { buildHeavenSpaceUrl } from "@/lib/game-query";
import {
  HEAVEN_SPACE_STORAGE_KEY,
  advanceHeavenSpaceSnapshot,
  createInitialHeavenSpaceSnapshot,
  isHeavenSpaceSnapshot,
  resolveCurrentHeavenSpacePassage,
  type HeavenSpaceEnding,
  type HeavenSpaceResolvedPassage,
  type HeavenSpaceSnapshot,
  type HeavenSpaceState,
} from "@/lib/heaven-space/runtime";
import toastWithSound from "@/lib/toast";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ViewMode = "cover" | "story";
type TrackableStat = keyof Pick<
  HeavenSpaceState,
  "memory" | "sleep" | "annoyed"
>;

type ScenePalette = {
  background: string;
  veil: string;
  accent: string;
  accentSoft: string;
  ink: string;
  panel: string;
  panelStrong: string;
  border: string;
  muted: string;
  imageMask: string;
  buttonText: string;
};

const ENDING_COPY: Record<
  Exclude<HeavenSpaceEnding, null>,
  { label: string; subtitle: string }
> = {
  sleep: {
    label: "Sleep Ending",
    subtitle: "A soul too heavy with exhaustion to greet the light awake.",
  },
  bad: {
    label: "Bad Ending",
    subtitle: "The space answers cruelty with an abyss of its own.",
  },
  neutral: {
    label: "Neutral Ending",
    subtitle: "You crossed over with no revelation, only a quieter next life.",
  },
  true: {
    label: "True Ending",
    subtitle: "A blessing carried forward into the next incarnation.",
  },
  weird: {
    label: "Weird Ending",
    subtitle: "A dead-end refusal that the story itself pushes back against.",
  },
};

const COVER_PALETTE: ScenePalette = {
  background:
    "radial-gradient(circle at 16% 14%, rgba(248, 225, 211, 0.16), transparent 20%), radial-gradient(circle at 84% 10%, rgba(198, 96, 83, 0.16), transparent 18%), linear-gradient(180deg, #171920 0%, #10131a 30%, #090c11 62%, #040608 100%)",
  veil: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(14,16,22,0.1) 20%, rgba(5,7,10,0.88) 100%)",
  accent: "#df9b8d",
  accentSoft: "rgba(223, 155, 141, 0.14)",
  ink: "#f8f0e9",
  panel: "rgba(11, 13, 18, 0.74)",
  panelStrong: "rgba(7, 9, 13, 0.9)",
  border: "rgba(223, 155, 141, 0.2)",
  muted: "rgba(248, 240, 233, 0.68)",
  imageMask:
    "linear-gradient(180deg, rgba(8,10,14,0.06), rgba(8,10,14,0.28) 40%, rgba(8,10,14,0.92) 100%)",
  buttonText: "#1a1310",
};

export default function HeavenSpace() {
  const { playSound } = useSound();
  const [snapshot, setSnapshot] = useState<HeavenSpaceSnapshot>(
    createInitialHeavenSpaceSnapshot(),
  );
  const [mode, setMode] = useState<ViewMode>("cover");
  const [hasMounted, setHasMounted] = useState(false);
  const [sceneMotionKey, setSceneMotionKey] = useState(0);
  const [changedStats, setChangedStats] = useState<TrackableStat[]>([]);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const previousSnapshotRef = useRef<HeavenSpaceSnapshot | null>(null);

  useEffect(() => {
    setHasMounted(true);

    try {
      const stored = window.localStorage.getItem(HEAVEN_SPACE_STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);

      if (isHeavenSpaceSnapshot(parsed)) {
        setSnapshot(parsed);
      }
    } catch (error) {
      console.error("Failed to load Heaven Space save:", error);
    }
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    window.localStorage.setItem(
      HEAVEN_SPACE_STORAGE_KEY,
      JSON.stringify(snapshot),
    );
  }, [hasMounted, snapshot]);

  useEffect(() => {
    const previousSnapshot = previousSnapshotRef.current;
    previousSnapshotRef.current = snapshot;

    if (!previousSnapshot) {
      return;
    }

    const nextChangedStats = (["memory", "sleep", "annoyed"] as const).filter(
      (key) => previousSnapshot.state[key] !== snapshot.state[key],
    );

    if (
      previousSnapshot.currentPassage !== snapshot.currentPassage ||
      nextChangedStats.length > 0
    ) {
      setSceneMotionKey((current) => current + 1);
    }

    if (nextChangedStats.length === 0) {
      return;
    }

    setChangedStats(nextChangedStats);

    const timeoutId = window.setTimeout(() => {
      setChangedStats([]);
    }, 1300);

    return () => window.clearTimeout(timeoutId);
  }, [snapshot]);

  useEffect(() => {
    setIsImageFullscreen(false);
  }, [snapshot.currentPassage]);

  const scene = useMemo(
    () => resolveCurrentHeavenSpacePassage(snapshot),
    [snapshot],
  );
  const deferredScene = useDeferredValue(scene);
  const hasProgress =
    snapshot.currentPassage !== "WARNING" ||
    snapshot.state.memory > 0 ||
    snapshot.state.sleep > 0 ||
    snapshot.state.annoyed > 0;
  const palette = getScenePalette(deferredScene);
  const routeSignal = getRouteSignal(deferredScene);

  const handleAdvance = (target: string) => {
    playSound("click");
    startTransition(() => {
      setSnapshot((current) => advanceHeavenSpaceSnapshot(current, target));
    });
  };

  const handleRestart = (nextMode: ViewMode) => {
    playSound("click");
    window.localStorage.removeItem(HEAVEN_SPACE_STORAGE_KEY);
    startTransition(() => {
      setSnapshot(createInitialHeavenSpaceSnapshot());
      setMode(nextMode);
    });
  };

  const handleCopyLink = async () => {
    playSound("click");

    try {
      await navigator.clipboard.writeText(
        buildHeavenSpaceUrl(window.location.origin),
      );
      setHasCopiedLink(true);
      toastWithSound.success("Heaven Space link copied");
      window.setTimeout(() => setHasCopiedLink(false), 2000);
    } catch (error) {
      console.error("Failed to copy Heaven Space link:", error);
      toastWithSound.error("Failed to copy Heaven Space link");
    }
  };

  if (mode === "cover") {
    return (
      <div
        className="heaven-space-shell @container relative h-full overflow-hidden"
        style={{
          background: COVER_PALETTE.background,
          color: COVER_PALETTE.ink,
        }}
      >
        <div className="heaven-space-noise absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{ background: COVER_PALETTE.veil }}
        />
        <div className="heaven-space-grid absolute inset-0" />
        <div className="heaven-space-orb absolute top-[9%] left-[4%] h-36 w-36 rounded-full blur-3xl" />
        <div className="heaven-space-orb heaven-space-orb-right absolute right-[6%] bottom-[10%] h-52 w-52 rounded-full blur-3xl" />

        <div className="relative flex h-full flex-col overflow-auto px-4 py-4 @md:px-6 @md:py-6 @2xl:px-8">
          <div className="grid flex-1 gap-4 @xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            <section
              className="heaven-space-enter rounded-[1.9rem] border p-5 shadow-[0_24px_70px_rgba(0,0,0,0.36)] @md:p-7"
              style={{
                background: COVER_PALETTE.panel,
                borderColor: COVER_PALETTE.border,
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-3xl">
                  <p
                    className="text-[11px] tracking-[0.4em] uppercase"
                    style={{ color: COVER_PALETTE.muted }}
                  >
                    Exocorpse Release // Heaven Space
                  </p>
                  <h1 className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-4 text-4xl leading-none font-semibold @md:text-5xl @xl:text-6xl @2xl:text-7xl">
                    HEAVEN
                    <span
                      className="ml-3 inline-block"
                      style={{ color: COVER_PALETTE.accent }}
                    >
                      SPACE
                    </span>
                  </h1>
                </div>

                <div
                  className="rounded-full border px-4 py-2 text-[11px] tracking-[0.28em] uppercase"
                  style={{
                    borderColor: COVER_PALETTE.border,
                    color: COVER_PALETTE.muted,
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  5 endings // 30 min
                </div>
              </div>

              <div className="mt-5 grid gap-4 @lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <div className="flex flex-col gap-4">
                  <p
                    className="font-[Iowan Old Style,Palatino Linotype,Book Antiqua,serif] max-w-2xl text-base leading-8 @md:text-lg"
                    style={{ color: "rgba(248, 240, 233, 0.88)" }}
                  >
                    Remember. Regret. Reincarnate. Three days remain in a white
                    surgical afterlife where every kindness, every refusal, and
                    every memory alters the last crossing.
                  </p>

                  <div className="grid gap-3 @md:grid-cols-3">
                    {["5 endings", "Autosave enabled", "Fullscreen art"].map(
                      (item) => (
                        <div
                          key={item}
                          className="rounded-[1.3rem] border px-4 py-4 text-center text-[11px] tracking-[0.24em] uppercase"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            borderColor: COVER_PALETTE.border,
                            color: COVER_PALETTE.muted,
                          }}
                        >
                          {item}
                        </div>
                      ),
                    )}
                  </div>

                  <div
                    className="rounded-[1.6rem] border p-5"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(223,155,141,0.1), rgba(255,255,255,0.02))",
                      borderColor: COVER_PALETTE.border,
                    }}
                  >
                    <p
                      className="text-[11px] tracking-[0.3em] uppercase"
                      style={{ color: COVER_PALETTE.muted }}
                    >
                      Trigger Warning
                    </p>
                    <p
                      className="font-[Iowan Old Style,Palatino Linotype,Book Antiqua,serif] mt-3 text-sm leading-7"
                      style={{ color: "rgba(248, 240, 233, 0.82)" }}
                    >
                      Death, murder, violence, gore, and abuse.
                    </p>
                  </div>
                </div>

                <div
                  className="relative overflow-hidden rounded-[1.7rem] border"
                  style={{
                    background: COVER_PALETTE.panelStrong,
                    borderColor: COVER_PALETTE.border,
                  }}
                >
                  <div className="relative aspect-[16/11] min-h-[260px] @xl:min-h-[320px]">
                    <Image
                      src="/media/heaven-space/opening.png"
                      alt="Heaven Space opening scene"
                      fill
                      priority
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: COVER_PALETTE.imageMask }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_30%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-5 @md:p-6">
                      <p
                        className="text-[10px] tracking-[0.34em] uppercase"
                        style={{ color: "rgba(248, 240, 233, 0.62)" }}
                      >
                        Entry Frame // Awakening
                      </p>
                      <p
                        className="font-[Iowan Old Style,Palatino Linotype,Book Antiqua,serif] mt-3 max-w-xl text-sm leading-7"
                        style={{ color: "rgba(248, 240, 233, 0.86)" }}
                      >
                        A reaper with stitches and too much gentleness waits in
                        a white nowhere that reacts to grief like living tissue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setMode("story")}
                  className="heaven-space-cta rounded-full px-6 py-4 text-sm font-semibold tracking-[0.32em] uppercase transition hover:brightness-110"
                  style={{
                    background: COVER_PALETTE.accent,
                    color: COVER_PALETTE.buttonText,
                  }}
                >
                  {hasProgress ? "Resume Story" : "Begin Story"}
                </button>
                {hasProgress && (
                  <button
                    type="button"
                    onClick={() => handleRestart("story")}
                    className="rounded-full border px-6 py-4 text-sm font-semibold tracking-[0.28em] uppercase transition hover:bg-white/10"
                    style={{
                      borderColor: COVER_PALETTE.border,
                      background: "rgba(255,255,255,0.04)",
                      color: COVER_PALETTE.ink,
                    }}
                  >
                    Start Over
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-full border px-6 py-4 text-sm font-semibold tracking-[0.28em] uppercase transition hover:bg-white/10"
                  style={{
                    borderColor: COVER_PALETTE.border,
                    background: "rgba(255,255,255,0.04)",
                    color: COVER_PALETTE.ink,
                  }}
                >
                  {hasCopiedLink ? "Copied" : "Copy Link"}
                </button>
              </div>
            </section>

            <section className="flex flex-col gap-4 @xl:justify-end">
              <div
                className="heaven-space-enter rounded-[1.9rem] border p-5"
                style={{
                  background: "rgba(9, 11, 15, 0.72)",
                  borderColor: COVER_PALETTE.border,
                }}
              >
                <p
                  className="text-[10px] tracking-[0.32em] uppercase"
                  style={{ color: COVER_PALETTE.muted }}
                >
                  What determines your ending
                </p>
                <div className="mt-4 grid gap-3">
                  {[
                    {
                      label: "Memory",
                      text: "Recovered moments drag the white void toward clarity.",
                    },
                    {
                      label: "Sleep",
                      text: "Drifting through the stay changes the weight of the final crossing.",
                    },
                    {
                      label: "Annoyed",
                      text: "Cruelty mutates Percy and the space around him.",
                    },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className="heaven-space-choice-enter rounded-[1.3rem] border p-4"
                      style={{
                        borderColor: "rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        animationDelay: `${index * 80}ms`,
                      }}
                    >
                      <p
                        className="text-[11px] tracking-[0.26em] uppercase"
                        style={{ color: COVER_PALETTE.accent }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="font-[Iowan Old Style,Palatino Linotype,Book Antiqua,serif] mt-2 text-sm leading-7"
                        style={{ color: "rgba(248, 240, 233, 0.82)" }}
                      >
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="heaven-space-shell @container relative h-full overflow-hidden"
      style={{
        background: palette.background,
        color: palette.ink,
      }}
    >
      <div className="heaven-space-noise absolute inset-0" />
      <div className="heaven-space-grid absolute inset-0" />
      <div className="absolute inset-0" style={{ background: palette.veil }} />
      <div className="heaven-space-orb absolute top-[10%] left-[7%] h-32 w-32 rounded-full blur-3xl" />
      <div className="heaven-space-orb heaven-space-orb-right absolute right-[8%] bottom-[10%] h-44 w-44 rounded-full blur-3xl" />
      <div className="absolute inset-y-0 left-[8%] hidden w-px bg-white/7 @xl:block" />
      <div className="absolute inset-y-0 right-[10%] hidden w-px bg-white/5 @xl:block" />

      <div className="relative flex h-full flex-col overflow-auto px-4 py-4 @md:px-6 @md:py-6 @2xl:px-8">
        <div
          className="rounded-[1.8rem] border px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] @md:px-6"
          style={{
            background: palette.panelStrong,
            borderColor: palette.border,
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p
                className="text-[10px] tracking-[0.38em] uppercase"
                style={{ color: palette.muted }}
              >
                Heaven Space //{" "}
                {deferredScene.ending ? "terminal ending state" : "live run"}
              </p>
              <h2 className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-3 text-3xl leading-none @md:text-4xl @2xl:text-5xl">
                {deferredScene.displayName}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionPill
                label={hasCopiedLink ? "Copied" : "Copy Link"}
                onClick={handleCopyLink}
                palette={palette}
              />
              <ActionPill
                label="Restart"
                onClick={() => handleRestart("story")}
                palette={palette}
              />
              <ActionPill
                label="Cover"
                onClick={() => setMode("cover")}
                palette={palette}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid flex-1 gap-4 @xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
          <section
            className="order-2 flex min-h-0 flex-col overflow-hidden rounded-[1.9rem] border shadow-[0_24px_70px_rgba(0,0,0,0.34)] @xl:order-1"
            style={{
              background: palette.panelStrong,
              borderColor: palette.border,
            }}
          >
            <div
              className="border-b px-5 py-4 @md:px-6"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-3xl">
                  <p
                    className="text-[10px] tracking-[0.34em] uppercase"
                    style={{ color: palette.muted }}
                  >
                    Scene Transcript
                  </p>
                  <p
                    className="font-[Iowan Old Style,Palatino Linotype,Book Antiqua,serif] mt-2 text-sm leading-7"
                    style={{ color: "rgba(245, 239, 232, 0.78)" }}
                  >
                    {deferredScene.ending
                      ? ENDING_COPY[deferredScene.ending].subtitle
                      : routeSignal}
                  </p>
                </div>

                {deferredScene.ending && (
                  <div
                    className="heaven-space-chip rounded-full border px-4 py-2 text-[11px] tracking-[0.26em] uppercase"
                    style={{
                      borderColor: palette.border,
                      background: palette.accentSoft,
                      color: palette.accent,
                    }}
                  >
                    {ENDING_COPY[deferredScene.ending].label}
                  </div>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-4 py-4 @md:px-6 @md:py-5">
              <div
                key={`transcript-${deferredScene.passage}-${sceneMotionKey}`}
                className="heaven-space-scene-enter rounded-[1.7rem] border p-5 @md:p-6"
                style={{
                  background: palette.panel,
                  borderColor: "rgba(255,255,255,0.06)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              >
                <MarkdownRenderer
                  content={deferredScene.markdown}
                  className="prose prose-sm font-[Iowan Old Style,Palatino Linotype,Book Antiqua,serif] prose-headings:text-[#fff8f3] prose-p:text-[#f1e8e0] prose-strong:text-[#fffdf8] prose-em:text-[#ffd8d0] prose-code:text-[#fff7f1] @md:prose-base max-w-none leading-8"
                />
              </div>
            </div>

            <div
              className="border-t px-4 py-4 @md:px-6 @md:py-5"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-[10px] tracking-[0.34em] uppercase"
                  style={{ color: palette.muted }}
                >
                  {deferredScene.ending
                    ? "Run complete"
                    : deferredScene.choices.length > 0
                      ? `Choose next action // ${deferredScene.choices.length} option${deferredScene.choices.length === 1 ? "" : "s"}`
                      : "Awaiting next action"}
                </p>
              </div>

              {deferredScene.choices.length > 0 ? (
                <div className="mt-3 grid gap-3 @lg:grid-cols-2 @2xl:grid-cols-1">
                  {deferredScene.choices.map((choice, index) => (
                    <button
                      key={`${deferredScene.passage}-${choice.label}-${choice.target}`}
                      type="button"
                      onClick={() => handleAdvance(choice.target)}
                      className="heaven-space-choice-enter group relative overflow-hidden rounded-[1.35rem] border p-4 text-left transition duration-200 hover:-translate-y-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))",
                        borderColor: "rgba(255,255,255,0.1)",
                        boxShadow:
                          "0 12px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
                        animationDelay: `${index * 70}ms`,
                      }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 w-1.5 transition-all duration-200 group-hover:w-3"
                        style={{ background: palette.accent }}
                      />
                      <div className="pl-4">
                        <p className="text-sm font-semibold tracking-[0.18em] text-[#fff9f4] uppercase">
                          {choice.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !deferredScene.ending ? (
                <div
                  className="mt-3 rounded-[1.35rem] border px-4 py-4"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                  }}
                >
                  <p
                    className="font-[Iowan Old Style,Palatino Linotype,Book Antiqua,serif] text-sm leading-7"
                    style={{ color: "rgba(245, 239, 232, 0.8)" }}
                  >
                    No selectable action surfaced for this passage. If this does
                    not resolve after a refresh, restart the run.
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="order-1 grid gap-4 @xl:order-2 @2xl:grid-rows-[auto_auto_1fr]">
            <div
              className="rounded-[1.9rem] border shadow-[0_24px_70px_rgba(0,0,0,0.34)]"
              style={{
                background: palette.panelStrong,
                borderColor: palette.border,
              }}
            >
              <button
                type="button"
                key={`image-${deferredScene.passage}-${sceneMotionKey}`}
                disabled={!deferredScene.image}
                onClick={() => {
                  if (!deferredScene.image) {
                    return;
                  }

                  playSound("click");
                  setIsImageFullscreen(true);
                }}
                className="heaven-space-scene-enter group relative block aspect-[16/10] min-h-[230px] w-full overflow-hidden rounded-[1.9rem] text-left disabled:cursor-default"
              >
                {deferredScene.image ? (
                  <Image
                    src={deferredScene.image}
                    alt={deferredScene.imageAlt || deferredScene.displayName}
                    fill
                    priority
                    className="object-cover transition duration-500 group-hover:scale-[1.025]"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: palette.panel }}
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: palette.imageMask }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.08),transparent_28%)]" />
                {deferredScene.image && (
                  <div className="absolute top-4 right-4">
                    <span
                      className="rounded-full border px-3 py-2 text-[10px] font-semibold tracking-[0.26em] uppercase backdrop-blur-md transition duration-200 group-hover:bg-black/55"
                      style={{
                        borderColor: "rgba(255,255,255,0.16)",
                        background: "rgba(6, 8, 11, 0.38)",
                        color: "#fff8f3",
                      }}
                    >
                      Fullscreen
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p
                    className="text-[10px] tracking-[0.34em] uppercase"
                    style={{ color: "rgba(245, 239, 232, 0.62)" }}
                  >
                    Visual Plate // Scene Scan
                  </p>
                  <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-2 text-2xl text-[#fff9f4]">
                    {deferredScene.displayName}
                  </p>
                  {deferredScene.image && (
                    <p className="mt-2 text-[11px] tracking-[0.24em] text-[#fff3eb]/72 uppercase">
                      Tap or click to expand
                    </p>
                  )}
                </div>
              </button>
            </div>

            <div className="grid gap-3 @sm:grid-cols-3 @xl:grid-cols-3">
              <StatCard
                label="Memory"
                value={deferredScene.state.memory}
                changed={changedStats.includes("memory")}
                palette={palette}
              />
              <StatCard
                label="Sleep"
                value={deferredScene.state.sleep}
                changed={changedStats.includes("sleep")}
                palette={palette}
              />
              <StatCard
                label="Annoyed"
                value={deferredScene.state.annoyed}
                changed={changedStats.includes("annoyed")}
                palette={palette}
              />
            </div>

            <div
              className="rounded-[1.9rem] border p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)]"
              style={{
                background: palette.panel,
                borderColor: palette.border,
              }}
            >
              <p
                className="text-[10px] tracking-[0.34em] uppercase"
                style={{ color: palette.muted }}
              >
                Readout
              </p>
              <p
                className="font-[Iowan Old Style,Palatino Linotype,Book Antiqua,serif] mt-3 text-sm leading-7"
                style={{ color: "rgba(245, 239, 232, 0.84)" }}
              >
                Heaven Space shifts with memory retrieval, emotional neglect,
                and hostility. Percy changes with you, and the final day answers
                to everything you carried forward.
              </p>
            </div>
          </section>
        </div>
      </div>
      <FullscreenSceneImage
        isOpen={isImageFullscreen && Boolean(deferredScene.image)}
        imageSrc={deferredScene.image}
        imageAlt={deferredScene.imageAlt || deferredScene.displayName}
        title={deferredScene.displayName}
        palette={palette}
        onClose={() => setIsImageFullscreen(false)}
      />
    </div>
  );
}

function ActionPill({
  label,
  onClick,
  palette,
}: {
  label: string;
  onClick: () => void;
  palette: ScenePalette;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.24em] uppercase transition hover:bg-white/10"
      style={{
        borderColor: palette.border,
        background: "rgba(255,255,255,0.04)",
        color: palette.ink,
      }}
    >
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  changed,
  palette,
}: {
  label: string;
  value: number;
  changed: boolean;
  palette: ScenePalette;
}) {
  return (
    <div
      className={`rounded-[1.4rem] border px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.24)] ${changed ? "heaven-space-stat-changed" : ""}`}
      style={{
        background: palette.panel,
        borderColor: palette.border,
      }}
    >
      <p
        className="text-[10px] tracking-[0.28em] uppercase"
        style={{ color: palette.muted }}
      >
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] text-3xl text-[#fff9f4]">
          {value}
        </p>
        <span
          className="h-2 w-12 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${palette.accent}, rgba(255,255,255,0.18))`,
          }}
        />
      </div>
    </div>
  );
}

function FullscreenSceneImage({
  isOpen,
  imageSrc,
  imageAlt,
  title,
  palette,
  onClose,
}: {
  isOpen: boolean;
  imageSrc?: string | null;
  imageAlt: string;
  title: string;
  palette: ScenePalette;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !imageSrc) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-10001 flex items-center justify-center bg-[#030406]/88 p-3 backdrop-blur-xl @md:p-6"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="heaven-space-enter @container relative flex h-full max-h-[min(92vh,72rem)] w-full max-w-[min(96vw,110rem)] flex-col overflow-hidden rounded-[2rem] border shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} fullscreen image`}
        style={{
          background: palette.panelStrong,
          borderColor: palette.border,
        }}
      >
        <div
          className="flex items-center justify-between gap-4 border-b px-4 py-4 @md:px-6"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div>
            <p
              className="text-[10px] tracking-[0.34em] uppercase"
              style={{ color: palette.muted }}
            >
              Visual Plate // Fullscreen
            </p>
            <h3 className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-2 text-2xl text-[#fff9f4] @md:text-3xl">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border px-4 py-2 text-[11px] font-semibold tracking-[0.24em] uppercase transition hover:bg-white/10"
            style={{
              borderColor: palette.border,
              background: "rgba(255,255,255,0.04)",
              color: palette.ink,
            }}
          >
            Close
          </button>
        </div>

        <div className="relative min-h-0 flex-1 p-3 @md:p-5">
          <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] border bg-black/30">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              className="object-contain"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03), transparent 22%, transparent 78%, rgba(0,0,0,0.34))",
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function getRouteSignal(scene: HeavenSpaceResolvedPassage) {
  if (scene.passage.startsWith("Memory")) {
    return "Recovered memory nodes use warmer embalmed tones so recollection feels tactile instead of abstract.";
  }

  if (scene.passage === "FINAL DAY") {
    return "The final crossing exposes the accumulated state of your run more explicitly than earlier passages.";
  }

  if (scene.passage === "WARNING") {
    return "The terminal opens in a triage state before the narrative ruptures into Heaven Space proper.";
  }

  return "The white expanse stays calm until your choices start leaving marks on it.";
}

function getScenePalette(scene: HeavenSpaceResolvedPassage): ScenePalette {
  if (scene.ending === "bad") {
    return {
      background:
        "radial-gradient(circle at 50% 10%, rgba(243,95,95,0.11), transparent 22%), linear-gradient(180deg, #290709 0%, #180608 34%, #080709 100%)",
      veil: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(57,7,10,0.1) 22%, rgba(7,5,6,0.86) 100%)",
      accent: "#f35f5f",
      accentSoft: "rgba(243,95,95,0.15)",
      ink: "#f8efef",
      panel: "rgba(24, 8, 10, 0.78)",
      panelStrong: "rgba(16, 6, 8, 0.9)",
      border: "rgba(243,95,95,0.24)",
      muted: "rgba(248,239,239,0.66)",
      imageMask:
        "linear-gradient(180deg, rgba(7,5,6,0.08), rgba(7,5,6,0.34) 42%, rgba(7,5,6,0.92) 100%)",
      buttonText: "#1b0808",
    };
  }

  if (scene.ending === "sleep") {
    return {
      background:
        "radial-gradient(circle at 20% 14%, rgba(157,202,242,0.12), transparent 18%), linear-gradient(180deg, #12202d 0%, #0b151e 36%, #06090d 100%)",
      veil: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(157,202,242,0.08) 22%, rgba(5,8,11,0.86) 100%)",
      accent: "#9dcaf2",
      accentSoft: "rgba(157,202,242,0.16)",
      ink: "#eef7ff",
      panel: "rgba(10, 18, 27, 0.78)",
      panelStrong: "rgba(7, 12, 18, 0.9)",
      border: "rgba(157,202,242,0.22)",
      muted: "rgba(238,247,255,0.67)",
      imageMask:
        "linear-gradient(180deg, rgba(7,12,18,0.08), rgba(7,12,18,0.32) 42%, rgba(7,12,18,0.92) 100%)",
      buttonText: "#0a1219",
    };
  }

  if (scene.ending === "neutral") {
    return {
      background:
        "radial-gradient(circle at 82% 10%, rgba(166,195,189,0.14), transparent 18%), linear-gradient(180deg, #101b1b 0%, #0a1314 36%, #040708 100%)",
      veil: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(166,195,189,0.08) 22%, rgba(5,7,8,0.86) 100%)",
      accent: "#a6c3bd",
      accentSoft: "rgba(166,195,189,0.15)",
      ink: "#f0f8f6",
      panel: "rgba(10, 17, 18, 0.78)",
      panelStrong: "rgba(7, 12, 13, 0.9)",
      border: "rgba(166,195,189,0.22)",
      muted: "rgba(240,248,246,0.66)",
      imageMask:
        "linear-gradient(180deg, rgba(7,12,13,0.08), rgba(7,12,13,0.32) 42%, rgba(7,12,13,0.92) 100%)",
      buttonText: "#081110",
    };
  }

  if (scene.ending === "true") {
    return {
      background:
        "radial-gradient(circle at 50% 8%, rgba(214,193,255,0.14), transparent 18%), linear-gradient(180deg, #171328 0%, #100f1a 36%, #06070c 100%)",
      veil: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(214,193,255,0.1) 22%, rgba(5,6,10,0.86) 100%)",
      accent: "#d6c1ff",
      accentSoft: "rgba(214,193,255,0.16)",
      ink: "#f8f4ff",
      panel: "rgba(15, 13, 27, 0.78)",
      panelStrong: "rgba(10, 9, 18, 0.9)",
      border: "rgba(214,193,255,0.24)",
      muted: "rgba(248,244,255,0.68)",
      imageMask:
        "linear-gradient(180deg, rgba(10,9,18,0.08), rgba(10,9,18,0.32) 42%, rgba(10,9,18,0.92) 100%)",
      buttonText: "#110d19",
    };
  }

  if (scene.passage.startsWith("Memory")) {
    return {
      background:
        "radial-gradient(circle at 22% 8%, rgba(231,192,127,0.14), transparent 18%), linear-gradient(180deg, #211810 0%, #15100c 34%, #070605 100%)",
      veil: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(231,192,127,0.08) 22%, rgba(8,6,5,0.86) 100%)",
      accent: "#e7c07f",
      accentSoft: "rgba(231,192,127,0.15)",
      ink: "#fbf2e7",
      panel: "rgba(21, 16, 11, 0.78)",
      panelStrong: "rgba(14, 10, 7, 0.9)",
      border: "rgba(231,192,127,0.22)",
      muted: "rgba(251,242,231,0.66)",
      imageMask:
        "linear-gradient(180deg, rgba(14,10,7,0.08), rgba(14,10,7,0.32) 42%, rgba(14,10,7,0.92) 100%)",
      buttonText: "#161008",
    };
  }

  return {
    background:
      "radial-gradient(circle at 48% 6%, rgba(255,255,255,0.08), transparent 18%), radial-gradient(circle at 16% 20%, rgba(223,155,141,0.08), transparent 16%), linear-gradient(180deg, #15181f 0%, #0d1015 36%, #05070a 100%)",
    veil: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(223,155,141,0.06) 22%, rgba(5,7,10,0.86) 100%)",
    accent: "#df9b8d",
    accentSoft: "rgba(223,155,141,0.14)",
    ink: "#f8f0e9",
    panel: "rgba(12, 15, 20, 0.78)",
    panelStrong: "rgba(8, 10, 14, 0.9)",
    border: "rgba(223,155,141,0.2)",
    muted: "rgba(248,240,233,0.66)",
    imageMask:
      "linear-gradient(180deg, rgba(8,10,14,0.06), rgba(8,10,14,0.28) 42%, rgba(8,10,14,0.92) 100%)",
    buttonText: "#1a1310",
  };
}
