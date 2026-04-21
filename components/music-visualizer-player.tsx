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
        2: "Erreur réseau lors du chargement audio.",
        3: "Le fichier audio semble corrompu ou le décodage est impossible.",
        4: "Format audio non pris en charge par le navigateur.",
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
      className="fixed bottom-3 left-3 right-3 z-[65] overflow-hidden rounded-2xl border border-border/65 bg-background/80 p-2 shadow-[0_16px_42px_-30px_rgba(0,0,0,0.52)] backdrop-blur-xl md:bottom-4 md:left-auto md:right-4 md:w-[min(88vw,300px)] md:p-2.5"
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_140px_at_80%_-140px,rgba(16,185,129,0.16),transparent_60%)]"
      />

      <div className="relative mb-1.5 flex items-center justify-between gap-2">
        <div className="inline-flex min-w-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <ListMusic className="h-3.5 w-3.5 text-emerald-500" />
          <span className="truncate">Visualiseur audio</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/65 bg-background/72 text-foreground transition-colors hover:bg-muted/60 hover:text-emerald-500"
            aria-label={collapsed ? "Déplier" : "Replier"}
          >
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              resumeAudio();
              void togglePlayback();
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/65 bg-background/72 text-foreground transition-colors hover:bg-muted/60 hover:text-emerald-500"
            aria-label={isPlaying ? "Pause" : "Lecture"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="relative space-y-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleCore}
                className={`inline-flex h-7 items-center rounded-full border px-2 ${
                  showCore
                    ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-500"
                    : "border-border/70 bg-background/72 text-muted-foreground hover:text-foreground"
                }`}
              >
                Core
              </button>
              <button
                type="button"
                onClick={toggleAnalyzer}
                className={`inline-flex h-7 items-center rounded-full border px-2 ${
                  showAnalyzer
                    ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-500"
                    : "border-border/70 bg-background/72 text-muted-foreground hover:text-foreground"
                }`}
              >
                Spectrum
              </button>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 flex-1 truncate">Titres détectés dans `/public/music`</span>
              <button
                type="button"
                onClick={() => void loadTracks()}
                className="inline-flex shrink-0 items-center gap-1 text-foreground hover:text-emerald-500"
              >
                <RefreshCw className={isLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
                Actualiser
              </button>
            </div>

            <select
              value={selected}
              onChange={(event) => {
                resumeAudio();
                triedTracksRef.current.clear();
                setSelected(event.target.value);
              }}
              className="h-8 w-full rounded-lg border border-border/70 bg-background/72 px-2 text-xs text-foreground"
              disabled={tracks.length === 0}
            >
              {tracks.length === 0 ? (
                <option value="">Aucune piste détectée</option>
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
        className={collapsed ? "sr-only" : "mt-1.5 w-full"}
        controls={!collapsed}
        preload="metadata"
        onPlay={resumeAudio}
        onVolumeChange={resumeAudio}
      />
    </div>
  );
}
