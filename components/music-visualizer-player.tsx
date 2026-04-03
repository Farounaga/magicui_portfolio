"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, ListMusic, Pause, Play, RefreshCw } from "lucide-react";
import { useAudioVisualizer } from "@/components/audio-visualizer-context";

type Track = {
  id: string;
  label: string;
  src: string;
};

type MusicPayload = {
  tracks: Track[];
};

export function MusicVisualizerPlayer() {
  const { registerAudioElement, resumeAudio, showCore, showAnalyzer, toggleCore, toggleAnalyzer } = useAudioVisualizer();
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const triedTracksRef = React.useRef<Set<string>>(new Set());

  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [selected, setSelected] = React.useState("");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [playbackError, setPlaybackError] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  const jumpToNextTrack = React.useCallback(
    (failedSrc: string) => {
      if (!failedSrc || tracks.length < 2) {
        return;
      }

      const currentIndex = tracks.findIndex((track) => track.src === failedSrc);
      if (currentIndex < 0) {
        return;
      }

      for (let step = 1; step < tracks.length; step += 1) {
        const nextIndex = (currentIndex + step) % tracks.length;
        const candidate = tracks[nextIndex];
        if (!candidate || triedTracksRef.current.has(candidate.src)) {
          continue;
        }
        setSelected(candidate.src);
        return;
      }
    },
    [tracks],
  );

  const loadTracks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/music", { cache: "no-store" });
      const data = (await response.json()) as MusicPayload;
      const nextTracks = data.tracks ?? [];
      setTracks(nextTracks);
      triedTracksRef.current.clear();
      setPlaybackError("");

      setSelected((prev) => {
        if (prev && nextTracks.some((track) => track.src === prev)) {
          return prev;
        }
        return nextTracks[0]?.src ?? "";
      });
    } catch {
      setTracks([]);
      setSelected("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    void loadTracks();
  }, [loadTracks]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.muted) {
      audio.muted = false;
    }
    if (audio.volume <= 0) {
      audio.volume = 0.8;
    }

    const unregister = registerAudioElement(audio);

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onCanPlay = () => {
      triedTracksRef.current.clear();
      setPlaybackError("");
    };
    const onError = () => {
      const failed = selected || audio.currentSrc;
      const code = audio.error?.code ?? 0;
      if (failed) {
        triedTracksRef.current.add(failed);
      }

      const messages: Record<number, string> = {
        1: "Lecture interrompue.",
        2: "Erreur reseau lors du chargement audio.",
        3: "Le fichier audio semble corrompu ou decode impossible.",
        4: "Format audio non supporte par le navigateur.",
      };

      setPlaybackError(messages[code] ?? "Impossible de lire ce morceau.");
      jumpToNextTrack(failed);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      if (typeof unregister === "function") {
        unregister();
      }
    };
  }, [jumpToNextTrack, registerAudioElement, selected]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !selected) {
      return;
    }

    setPlaybackError("");
    const shouldResume = !audio.paused;
    audio.src = selected;
    audio.load();

    if (shouldResume) {
      void audio.play().catch(() => undefined);
    }
  }, [selected]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!selected) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        // blocked until user interaction
      }
      return;
    }

    audio.pause();
  }

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="fixed bottom-2 left-2 right-2 z-[65] border border-border/70 bg-background/86 p-2.5 backdrop-blur-md md:bottom-4 md:left-auto md:right-4 md:w-[min(94vw,360px)] md:p-3"
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="inline-flex min-w-0 items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:text-xs md:tracking-[0.18em]">
          <ListMusic className="h-3.5 w-3.5 text-emerald-500" />
          <span className="truncate">Visualizer Audio</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="inline-flex h-8 w-8 items-center justify-center border border-border/70 text-foreground hover:text-emerald-500 md:h-8 md:w-8"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              resumeAudio();
              void togglePlayback();
            }}
            className="inline-flex h-8 w-8 items-center justify-center border border-border/70 text-foreground hover:text-emerald-500 md:h-8 md:w-8"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="space-y-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground md:text-xs md:tracking-[0.14em]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleCore}
                className={`inline-flex h-8 items-center border px-2 md:h-8 ${
                  showCore
                    ? "border-emerald-500/70 text-emerald-500"
                    : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                Core
              </button>
              <button
                type="button"
                onClick={toggleAnalyzer}
                className={`inline-flex h-8 items-center border px-2 md:h-8 ${
                  showAnalyzer
                    ? "border-emerald-500/70 text-emerald-500"
                    : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                Spectrum
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="truncate">Tracks from `/public/music`</span>
              <button
                type="button"
                onClick={() => void loadTracks()}
                className="inline-flex shrink-0 items-center gap-1 text-foreground hover:text-emerald-500"
              >
                <RefreshCw className={isLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
                Refresh
              </button>
            </div>

            <select
              value={selected}
              onChange={(event) => {
                resumeAudio();
                triedTracksRef.current.clear();
                setSelected(event.target.value);
              }}
              className="h-9 w-full border border-border/70 bg-transparent px-2 text-xs text-foreground md:text-sm"
              disabled={tracks.length === 0}
            >
              {tracks.length === 0 ? (
                <option value="">No tracks found</option>
              ) : (
                tracks.map((track) => (
                  <option key={track.id} value={track.src}>
                    {track.label}
                  </option>
                ))
              )}
            </select>

            {playbackError ? <p className="text-[10px] normal-case tracking-normal text-red-400">{playbackError}</p> : null}
          </div>
        </>
      )}

      <audio
        ref={audioRef}
        className={collapsed ? "sr-only" : "mt-2 w-full md:mt-3"}
        controls={!collapsed}
        preload="metadata"
        onPlay={resumeAudio}
        onVolumeChange={resumeAudio}
      />
    </div>
  );
}
