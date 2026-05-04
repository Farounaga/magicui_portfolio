"use client";

import * as React from "react";

const STARTUP_ASSETS = [
  "/images/services/bigscreenmeme.webp",
  "/images/services/code-screen.webp",
  "/images/services/debug-meme.webp",
  "/images/services/blue-desk.webp",
  "/images/services/web-code.webp",
  "/images/illustrations/slam-sisr.svg",
  "/images/illustrations/carnet-vaccination.svg",
];

function waitForWindowLoad() {
  if (document.readyState === "complete") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => {
      if ("decode" in image) {
        image.decode().then(resolve).catch(resolve);
        return;
      }

      resolve();
    };
    image.onerror = () => resolve();
    image.src = src;
  });
}

function waitForFonts() {
  return document.fonts?.ready ?? Promise.resolve();
}

export function StartupReveal({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const minimumDelay = new Promise<void>((resolve) => window.setTimeout(resolve, 520));
    const maximumDelay = new Promise<void>((resolve) => window.setTimeout(resolve, 2800));

    const prepare = async () => {
      await Promise.race([
        Promise.all([
          waitForWindowLoad(),
          waitForFonts(),
          Promise.all(STARTUP_ASSETS.map(preloadImage)),
          minimumDelay,
        ]),
        maximumDelay,
      ]);

      if (cancelled) {
        return;
      }

      setReady(true);
    };

    prepare();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background text-foreground transition-opacity duration-500 ${
          ready ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-px animate-pulse bg-emerald-400" />
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">Chargement</p>
          <p className="text-sm uppercase tracking-[0.22em] text-foreground/85">Vladimir Spirine</p>
        </div>
      </div>

      <div className={`transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}>{children}</div>
    </>
  );
}
