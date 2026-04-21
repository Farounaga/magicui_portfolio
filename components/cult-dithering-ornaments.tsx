"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTime,
  useTransform,
  type MotionValue,
} from "motion/react";

type PixelLifeStripProps = {
  tint: "sky" | "indigo";
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function makeField(cols: number, rows: number, density: number) {
  const length = cols * rows;
  const field = new Uint8Array(length);
  for (let index = 0; index < length; index += 1) {
    field[index] = Math.random() < density ? 1 : 0;
  }
  return field;
}

function countNeighbors(field: Uint8Array, cols: number, rows: number, x: number, y: number) {
  let count = 0;

  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      if (ox === 0 && oy === 0) {
        continue;
      }

      const nx = (x + ox + cols) % cols;
      const ny = (y + oy + rows) % rows;
      count += field[ny * cols + nx];
    }
  }

  return count;
}

function stepLife(field: Uint8Array, next: Uint8Array, cols: number, rows: number) {
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const index = y * cols + x;
      const alive = field[index] === 1;
      const neighbors = countNeighbors(field, cols, rows, x, y);

      if (alive) {
        next[index] = neighbors === 2 || neighbors === 3 ? 1 : 0;
      } else {
        next[index] = neighbors === 3 ? 1 : 0;
      }
    }
  }
}

function randomSpark(field: Uint8Array, cols: number, rows: number, amount: number) {
  for (let i = 0; i < amount; i += 1) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    field[y * cols + x] = 1;
  }
}

function drawLife(
  ctx: CanvasRenderingContext2D,
  field: Uint8Array,
  cols: number,
  rows: number,
  cellSize: number,
  tint: "sky" | "indigo",
) {
  ctx.clearRect(0, 0, cols * cellSize, rows * cellSize);

  const liveColor = tint === "sky" ? "rgba(125, 211, 252, 0.56)" : "rgba(165, 180, 252, 0.52)";
  const glowColor = tint === "sky" ? "rgba(125, 211, 252, 0.2)" : "rgba(165, 180, 252, 0.18)";

  ctx.fillStyle = liveColor;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (field[y * cols + x] === 1) {
        const px = x * cellSize;
        const py = y * cellSize;
        ctx.fillRect(px, py, Math.max(1, cellSize - 1), Math.max(1, cellSize - 1));
      }
    }
  }

  ctx.fillStyle = glowColor;
  for (let y = 0; y < rows; y += 2) {
    for (let x = 0; x < cols; x += 2) {
      if (field[y * cols + x] === 1) {
        const px = x * cellSize;
        const py = y * cellSize;
        ctx.fillRect(px, py, Math.max(1, cellSize - 1), Math.max(1, cellSize - 1));
      }
    }
  }
}

function PixelLifeStrip({ tint }: PixelLifeStripProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let rafId = 0;
    let disposed = false;

    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    let cols = 0;
    let rows = 0;
    let cellSize = 0;
    let field = new Uint8Array(0);
    let next = new Uint8Array(0);
    let previousTime = 0;
    let accumulator = 0;
    const stepInterval = 140;

    const setup = () => {
      if (!canvas.parentElement) {
        return;
      }

      const cssWidth = Math.max(1, canvas.parentElement.clientWidth);
      const cssHeight = Math.max(1, canvas.parentElement.clientHeight);

      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;

      cellSize = Math.max(5, Math.round(6 * dpr));
      cols = Math.max(8, Math.floor(cssWidth / cellSize));
      rows = Math.max(24, Math.floor(cssHeight / cellSize));

      field = makeField(cols, rows, 0.22);
      next = new Uint8Array(cols * rows);

      drawLife(ctx, field, cols, rows, cellSize, tint);
    };

    const frame = (time: number) => {
      if (disposed) {
        return;
      }

      if (previousTime === 0) {
        previousTime = time;
      }

      const delta = time - previousTime;
      previousTime = time;
      accumulator += delta;

      while (accumulator >= stepInterval) {
        stepLife(field, next, cols, rows);

        let alive = 0;
        for (let index = 0; index < next.length; index += 1) {
          alive += next[index];
        }

        if (alive < cols * rows * 0.08 || alive > cols * rows * 0.62) {
          randomSpark(next, cols, rows, Math.floor(cols * 1.6));
        }

        const current = field;
        field = next;
        next = current;
        accumulator -= stepInterval;
      }

      drawLife(ctx, field, cols, rows, cellSize, tint);
      rafId = window.requestAnimationFrame(frame);
    };

    setup();
    rafId = window.requestAnimationFrame(frame);

    const onResize = () => {
      setup();
    };

    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [tint]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}

function pulsedOpacity(sceneGate: MotionValue<number>, pulse: MotionValue<number>, strength: number) {
  return useTransform([sceneGate, pulse], (latest) => {
    const [gate, pulseFactor] = latest as [number, number];
    return gate * strength * pulseFactor;
  });
}

function computePresentationStart() {
  const marker = document.getElementById("presentation-section");
  if (!marker) {
    return 0.22;
  }

  const documentHeight = document.documentElement.scrollHeight;
  const maxScroll = Math.max(documentHeight - window.innerHeight, 1);
  const markerTop = marker.getBoundingClientRect().top + window.scrollY;
  return clamp(markerTop / maxScroll, 0, 1);
}

export function CultDitheringOrnaments() {
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [finePointer, setFinePointer] = React.useState(false);
  const [sceneStart, setSceneStart] = React.useState(0.22);

  const pointerRawX = useMotionValue(0);
  const pointerRawY = useMotionValue(0);
  const pointerX = useSpring(pointerRawX, { stiffness: 84, damping: 18, mass: 0.5 });
  const pointerY = useSpring(pointerRawY, { stiffness: 84, damping: 18, mass: 0.5 });

  const { scrollYProgress } = useScroll();
  const time = useTime();

  const sceneStartSafe = Math.min(sceneStart, 0.92);
  const revealEnd = Math.min(sceneStartSafe + 0.05, 0.995);
  const sceneGate = useTransform(scrollYProgress, [0, sceneStartSafe, revealEnd], [0, 0, 1]);
  const postStartProgress = useTransform(scrollYProgress, [sceneStartSafe, 1], [0, 1]);

  const leftX = useTransform([pointerX, postStartProgress], (latest) => {
    const [mouseX, progress] = latest as [number, number];
    return mouseX * -4 + (progress - 0.5) * 4;
  });
  const rightX = useTransform([pointerX, postStartProgress], (latest) => {
    const [mouseX, progress] = latest as [number, number];
    return mouseX * 4 + (progress - 0.5) * -4;
  });

  const pulseA = useTransform(time, (value) => 0.82 + Math.sin(value * 0.00058) * 0.18);
  const pulseB = useTransform(time, (value) => 0.8 + Math.sin(value * 0.00052 + 1.2) * 0.2);
  const pulseC = useTransform(time, (value) => 0.78 + Math.sin(value * 0.00064 + 2.3) * 0.22);
  const pulseD = useTransform(time, (value) => 0.8 + Math.sin(value * 0.00047 + 3.4) * 0.2);
  const pulseE = useTransform(time, (value) => 0.8 + Math.sin(value * 0.00054 + 4.2) * 0.2);
  const pulseF = useTransform(time, (value) => 0.78 + Math.sin(value * 0.0006 + 5) * 0.22);

  const leftLifeOpacity = pulsedOpacity(sceneGate, pulseA, 0.54);
  const rightLifeOpacity = pulsedOpacity(sceneGate, pulseB, 0.5);
  const leftGlyphAOpacity = pulsedOpacity(sceneGate, pulseC, 0.74);
  const rightGlyphAOpacity = pulsedOpacity(sceneGate, pulseD, 0.72);
  const leftGlyphBOpacity = pulsedOpacity(sceneGate, pulseE, 0.7);
  const rightGlyphBOpacity = pulsedOpacity(sceneGate, pulseF, 0.72);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  React.useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setFinePointer(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  React.useEffect(() => {
    const refresh = () => {
      setSceneStart(computePresentationStart());
    };

    refresh();
    window.addEventListener("resize", refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      window.removeEventListener("load", refresh);
    };
  }, []);

  React.useEffect(() => {
    if (!finePointer) {
      pointerRawX.set(0);
      pointerRawY.set(0);
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      pointerRawX.set(x * 2);
      pointerRawY.set(y * 2);
    };

    const resetPointer = () => {
      pointerRawX.set(0);
      pointerRawY.set(0);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", resetPointer);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", resetPointer);
    };
  }, [finePointer, pointerRawX, pointerRawY]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 w-[clamp(26px,2.4vw,40px)]"
        style={{ x: leftX, opacity: leftLifeOpacity }}
        animate={{ scaleY: [1, 1.03, 0.98, 1] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <PixelLifeStrip tint="sky" />
      </motion.div>

      <motion.div
        className="absolute inset-y-0 right-0 w-[clamp(26px,2.4vw,40px)]"
        style={{ x: rightX, opacity: rightLifeOpacity }}
        animate={{ scaleY: [1, 0.98, 1.03, 1] }}
        transition={{ duration: 9.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <PixelLifeStrip tint="indigo" />
      </motion.div>

      <motion.div
        className="absolute left-3 top-[19%] hidden h-[14rem] w-[2.1rem] rounded-md border border-sky-300/24 bg-[linear-gradient(rgba(125,211,252,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.16)_1px,transparent_1px)] md:block"
        style={{
          opacity: leftGlyphAOpacity,
          x: useTransform(pointerX, (value) => value * -5),
          y: useTransform(postStartProgress, (value) => (value - 0.5) * -90),
        }}
        animate={{ rotate: [0, 1.8, -1.4, 0], scale: [1, 1.05, 0.97, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-3 top-[27%] hidden h-[13.5rem] w-[2rem] rounded-md border border-cyan-300/24 bg-[linear-gradient(to_bottom,rgba(103,232,249,0.34)_1px,transparent_1px),repeating-linear-gradient(to_bottom,rgba(125,211,252,0.3)_0px,rgba(125,211,252,0.3)_2px,transparent_2px,transparent_12px)] md:block"
        style={{
          opacity: rightGlyphAOpacity,
          x: useTransform(pointerX, (value) => value * 5),
          y: useTransform(postStartProgress, (value) => (value - 0.5) * -110),
        }}
        animate={{ rotate: [0, -1.6, 1.2, 0], scale: [1, 0.96, 1.04, 1] }}
        transition={{ duration: 10.3, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-2.5 top-[55%] hidden h-[14rem] w-[2.15rem] rounded-md border border-blue-300/24 bg-[repeating-linear-gradient(90deg,rgba(147,197,253,0.3)_0px,rgba(147,197,253,0.3)_5px,transparent_5px,transparent_12px)] lg:block"
        style={{
          opacity: leftGlyphBOpacity,
          x: useTransform(pointerX, (value) => value * -6),
          y: useTransform(postStartProgress, (value) => (value - 0.5) * -120),
        }}
        animate={{ rotate: [0, 1.3, -1.8, 0], scale: [1, 1.04, 0.95, 1] }}
        transition={{ duration: 12.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-2.5 top-[64%] hidden h-[13.2rem] w-[1.9rem] rounded-md border border-indigo-300/24 bg-[repeating-linear-gradient(to_bottom,rgba(165,180,252,0.34)_0px,rgba(165,180,252,0.34)_2px,transparent_2px,transparent_12px)] lg:block"
        style={{
          opacity: rightGlyphBOpacity,
          x: useTransform(pointerX, (value) => value * 6),
          y: useTransform(postStartProgress, (value) => (value - 0.5) * -132),
        }}
        animate={{ rotate: [0, -1.5, 1.7, 0], scale: [1, 0.95, 1.05, 1] }}
        transition={{ duration: 11.7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
