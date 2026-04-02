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

  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [selected, setSelected] = React.useState("");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadTracks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/music", { cache: "no-store" });
      const data = (await response.json()) as MusicPayload;
      const nextTracks = data.tracks ?? [];
      setTracks(nextTracks);

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

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      if (typeof unregister === "function") {
        unregister();
      }
    };
  }, [registerAudioElement]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !selected) {
      return;
    }

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

  return (
    <div className="fixed bottom-4 right-4 z-[65] w-[min(94vw,360px)] border border-border/70 bg-background/86 p-3 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <ListMusic className="h-3.5 w-3.5 text-emerald-500" />
          Visualizer Audio
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="inline-flex h-8 w-8 items-center justify-center border border-border/70 text-foreground hover:text-emerald-500"
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
            className="inline-flex h-8 w-8 items-center justify-center border border-border/70 text-foreground hover:text-emerald-500"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="space-y-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleCore}
                className={`inline-flex h-8 items-center border px-2 ${
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
                className={`inline-flex h-8 items-center border px-2 ${
                  showAnalyzer
                    ? "border-emerald-500/70 text-emerald-500"
                    : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                Spectrum
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span>Tracks from `/public/music`</span>
              <button
                type="button"
                onClick={() => void loadTracks()}
                className="inline-flex items-center gap-1 text-foreground hover:text-emerald-500"
              >
                <RefreshCw className={isLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
                Refresh
              </button>
            </div>

            <select
              value={selected}
              onChange={(event) => {
                resumeAudio();
                setSelected(event.target.value);
              }}
              className="h-9 w-full border border-border/70 bg-transparent px-2 text-foreground"
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
          </div>
        </>
      )}

      <audio
        ref={audioRef}
        className={collapsed ? "sr-only" : "mt-3 w-full"}
        controls={!collapsed}
        preload="metadata"
        onPlay={resumeAudio}
        onVolumeChange={resumeAudio}
      />
    </div>
  );
}
