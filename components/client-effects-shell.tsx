"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AudioVisualizerProvider } from "@/components/audio-visualizer-context";

const DeferredVisualEffects = dynamic(
  () => import("@/components/deferred-visual-effects").then((mod) => mod.DeferredVisualEffects),
  { ssr: false },
);

const FloatingTimer = dynamic(
  () => import("@/components/floating-timer").then((mod) => mod.FloatingTimer),
  { ssr: false },
);

const MusicVisualizerPlayer = dynamic(
  () => import("@/components/music-visualizer-player").then((mod) => mod.MusicVisualizerPlayer),
  { ssr: false },
);

export function ClientEffectsShell() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let activated = false;

    const activate = () => {
      if (!activated) {
        activated = true;
        setReady(true);
      }
    };

    const timeout = window.setTimeout(activate, 900);
    const onLoad = () => activate();

    if (document.readyState !== "complete") {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <AudioVisualizerProvider>
      <DeferredVisualEffects />
      <FloatingTimer />
      <MusicVisualizerPlayer />
    </AudioVisualizerProvider>
  );
}
