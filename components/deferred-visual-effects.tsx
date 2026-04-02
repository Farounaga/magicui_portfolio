"use client";

import * as React from "react";
import SplashCursor from "@/components/SplashCursor";
import { SectionParticlesBackground } from "@/components/section-particles-background";

export function DeferredVisualEffects() {
  const [ready, setReady] = React.useState(false);

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

  if (!ready) {
    return null;
  }

  return (
    <>
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
      <SectionParticlesBackground />
    </>
  );
}
