"use client";

import * as React from "react";
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
      <SectionParticlesBackground />
    </>
  );
}
