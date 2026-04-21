"use client";

import * as React from "react";
import { SectionParticlesBackground } from "@/components/section-particles-background";
import SplashCursor from "@/components/SplashCursor";
import { CultDitheringOrnaments } from "@/components/cult-dithering-ornaments";

const CURSOR_TRAIL_STORAGE_KEY = "vs_cursor_trail_enabled";
const CURSOR_TRAIL_EVENT = "vs-cursor-trail-toggle";

export function DeferredVisualEffects() {
  const [ready, setReady] = React.useState(false);
  const [showSplashCursor, setShowSplashCursor] = React.useState(false);
  const [canUseFinePointer, setCanUseFinePointer] = React.useState(false);
  const [cursorTrailEnabled, setCursorTrailEnabled] = React.useState(true);

  React.useEffect(() => {
    let activated = false;

    const activate = () => {
      if (!activated) {
        activated = true;
        setReady(true);
      }
    };

    const timeout = window.setTimeout(activate, 450);
    const onLoad = () => activate();

    if (document.readyState === "complete") {
      activate();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CURSOR_TRAIL_STORAGE_KEY);
      if (stored === "false") {
        setCursorTrailEnabled(false);
      }
      if (stored === "true") {
        setCursorTrailEnabled(true);
      }
    } catch {
      // ignore storage issues
    }

    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setCanUseFinePointer(media.matches);

    apply();
    media.addEventListener("change", apply);

    const onToggleEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ enabled?: boolean }>;
      if (typeof customEvent.detail?.enabled === "boolean") {
        setCursorTrailEnabled(customEvent.detail.enabled);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== CURSOR_TRAIL_STORAGE_KEY) {
        return;
      }
      if (event.newValue === "false") {
        setCursorTrailEnabled(false);
      } else if (event.newValue === "true") {
        setCursorTrailEnabled(true);
      }
    };

    window.addEventListener(CURSOR_TRAIL_EVENT, onToggleEvent as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      media.removeEventListener("change", apply);
      window.removeEventListener(CURSOR_TRAIL_EVENT, onToggleEvent as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  React.useEffect(() => {
    setShowSplashCursor(canUseFinePointer && cursorTrailEnabled);
  }, [canUseFinePointer, cursorTrailEnabled]);

  if (!ready) {
    return null;
  }

  return (
    <>
      {showSplashCursor ? (
        <SplashCursor
          SIM_RESOLUTION={32}
          DYE_RESOLUTION={512}
          DENSITY_DISSIPATION={4.5}
          VELOCITY_DISSIPATION={2.5}
          PRESSURE={0}
          CURL={1}
          SPLAT_RADIUS={0.05}
          SPLAT_FORCE={1000}
          COLOR_UPDATE_SPEED={1}
        />
      ) : null}
      <SectionParticlesBackground />
      <CultDitheringOrnaments />
    </>
  );
}
