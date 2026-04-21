"use client";

import * as React from "react";
import { useAudioVisualizer } from "@/components/audio-visualizer-context";

type RGB = { r: number; g: number; b: number };

type SectionTheme = {
  id: string;
  tintLight: string;
  tintDark: string;
  drift: number;
  scale: number;
};

const SECTION_THEMES: SectionTheme[] = [
  { id: "hero", tintLight: "#345b8f", tintDark: "#8eb2e8", drift: 15, scale: 1.0 },
  { id: "services", tintLight: "#305a88", tintDark: "#89b1e0", drift: 14, scale: 1.02 },
  { id: "presentation-section", tintLight: "#2f5f92", tintDark: "#8ab9ee", drift: 13, scale: 0.98 },
  { id: "etudes-section", tintLight: "#405f86", tintDark: "#9db7e2", drift: 12, scale: 1.0 },
  { id: "experience-section", tintLight: "#35618d", tintDark: "#8eb8e4", drift: 13, scale: 1.03 },
  { id: "competences-section", tintLight: "#325f8d", tintDark: "#8cb9eb", drift: 16, scale: 1.04 },
  { id: "realisations-section", tintLight: "#3f6387", tintDark: "#8eb2dc", drift: 14, scale: 1.02 },
  { id: "veille-section", tintLight: "#33638f", tintDark: "#90c0ed", drift: 17, scale: 1.06 },
  { id: "contact-section", tintLight: "#4d6488", tintDark: "#a8b8df", drift: 11, scale: 0.97 },
];

const ANALYZER_TUNING = {
  drive: 1.06,
  curve: 1.04,
  floor: 0.008,
  beatBoost: 0.08,
  lowBoost: 0.92,
  midBoost: 0.9,
  highBoost: 1.04,
  barHeightBoost: 1.0,
  waveformBoost: 1.32,
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smooth(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function sampleSpectrum(spectrum: number[], t: number): number {
  if (spectrum.length === 0) {
    return 0;
  }
  const x = clamp01(t) * (spectrum.length - 1);
  const i0 = Math.floor(x);
  const i1 = Math.min(spectrum.length - 1, i0 + 1);
  const k = x - i0;
  return (spectrum[i0] ?? 0) * (1 - k) + (spectrum[i1] ?? 0) * k;
}

function averageSpectrumRange(spectrum: number[], from: number, to: number): number {
  if (spectrum.length === 0) {
    return 0;
  }

  const start = Math.floor(clamp01(from) * (spectrum.length - 1));
  const end = Math.max(start + 1, Math.floor(clamp01(to) * (spectrum.length - 1)));
  let sum = 0;
  let count = 0;

  for (let i = start; i <= end && i < spectrum.length; i += 1) {
    sum += spectrum[i] ?? 0;
    count += 1;
  }

  return count > 0 ? sum / count : 0;
}

function tunedBandValue(normalizedRaw: number, normalizedPos: number, beat: number): number {
  const rangeBoost =
    normalizedPos < 0.28
      ? ANALYZER_TUNING.lowBoost
      : normalizedPos < 0.72
        ? ANALYZER_TUNING.midBoost
        : ANALYZER_TUNING.highBoost;
  const transient = Math.max(0, normalizedRaw - 0.72) * 0.8;

  const driven = clamp01((normalizedRaw * rangeBoost + transient * 0.22 + beat * ANALYZER_TUNING.beatBoost) * ANALYZER_TUNING.drive);
  return Math.pow(driven, ANALYZER_TUNING.curve);
}

function freqToNormalized(freq: number): number {
  const minF = 20;
  const maxF = 20000;
  const safe = Math.max(minF, Math.min(maxF, freq));
  return (Math.log10(safe) - Math.log10(minF)) / (Math.log10(maxF) - Math.log10(minF));
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function hexToRgb(hex: string): RGB {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((c) => `${c}${c}`).join("") : normalized;
  const int = Number.parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  const k = clamp01(t);
  return {
    r: Math.round(a.r + (b.r - a.r) * k),
    g: Math.round(a.g + (b.g - a.g) * k),
    b: Math.round(a.b + (b.b - a.b) * k),
  };
}

function rgba(color: RGB, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function buildSectionMap(): Array<{ top: number; theme: SectionTheme }> {
  return SECTION_THEMES.map((theme) => {
    const el = document.getElementById(theme.id);
    return { top: el ? el.offsetTop : Number.MAX_SAFE_INTEGER, theme };
  }).sort((a, b) => a.top - b.top);
}

function resolveBlend(centerY: number, map: Array<{ top: number; theme: SectionTheme }>) {
  if (map.length === 0) {
    return { from: SECTION_THEMES[0], to: SECTION_THEMES[0], mix: 0 };
  }

  if (centerY <= map[0].top) {
    return { from: map[0].theme, to: map[0].theme, mix: 0 };
  }

  for (let i = 0; i < map.length - 1; i += 1) {
    const current = map[i];
    const next = map[i + 1];
    if (centerY >= current.top && centerY < next.top) {
      const span = Math.max(1, next.top - current.top);
      return {
        from: current.theme,
        to: next.theme,
        mix: smooth((centerY - current.top) / span),
      };
    }
  }

  const last = map[map.length - 1].theme;
  return { from: last, to: last, mix: 0 };
}

export function SectionParticlesBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reducedMotionRef = React.useRef(false);
  const { energy, showCore, showAnalyzer } = useAudioVisualizer();
  const energyRef = React.useRef(energy);
  const showCoreRef = React.useRef(showCore);
  const showAnalyzerRef = React.useRef(showAnalyzer);

  React.useEffect(() => {
    energyRef.current = energy;
  }, [energy]);

  React.useEffect(() => {
    showCoreRef.current = showCore;
  }, [showCore]);

  React.useEffect(() => {
    showAnalyzerRef.current = showAnalyzer;
  }, [showAnalyzer]);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = media.matches;

    const onMedia = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };
    media.addEventListener("change", onMedia);

    const canvas = canvasRef.current;
    if (!canvas) {
      return () => media.removeEventListener("change", onMedia);
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      return () => media.removeEventListener("change", onMedia);
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let sectionMap = buildSectionMap();
    let lastMapRefresh = 0;
    let lastFrameMs = 0;
    const bandFloor = new Array<number>(128).fill(0.02);
    const bandPeak = new Array<number>(128).fill(0.28);
    let lastBeat = 0;
    const burstNodes: Array<{
      angle: number;
      radius: number;
      radialSpeed: number;
      orbitSpeed: number;
      life: number;
      maxLife: number;
      size: number;
      mix: number;
    }> = [];
    const shockRings: Array<{
      radius: number;
      speed: number;
      life: number;
      maxLife: number;
      thickness: number;
    }> = [];
    const flowNodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      mix: number;
    }> = [];
    const arcSegments: Array<{
      angle: number;
      radius: number;
      speed: number;
      length: number;
      life: number;
      maxLife: number;
      thickness: number;
      mix: number;
    }> = [];
    const pulseTiles: Array<{
      angle: number;
      radius: number;
      spin: number;
      life: number;
      maxLife: number;
      scale: number;
      mix: number;
    }> = [];
    const glitchRays: Array<{
      angle: number;
      length: number;
      speed: number;
      life: number;
      maxLife: number;
      width: number;
      mix: number;
    }> = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sectionMap = buildSectionMap();
    };

    resize();

    const render = (ms: number) => {
      const t = ms * 0.001;
      const deltaMs = Math.min(48, lastFrameMs === 0 ? 16 : ms - lastFrameMs);
      lastFrameMs = ms;
      const audio = energyRef.current;

      if (ms - lastMapRefresh > 700) {
        sectionMap = buildSectionMap();
        lastMapRefresh = ms;
      }

      const centerY = window.scrollY + height * 0.55;
      const blend = resolveBlend(centerY, sectionMap);
      const isDark = document.documentElement.classList.contains("dark");

      const tintA = hexToRgb(isDark ? blend.from.tintDark : blend.from.tintLight);
      const tintB = hexToRgb(isDark ? blend.to.tintDark : blend.to.tintLight);
      const themeTint = mixRgb(tintA, tintB, blend.mix);

      const cyberBase = isDark ? hexToRgb("#7ce4d5") : hexToRgb("#0f8f8c");
      const cyberAccent = mixRgb(cyberBase, themeTint, 0.52);
      const cyberAccent2 = mixRgb(cyberAccent, isDark ? hexToRgb("#9fb3dd") : hexToRgb("#3f5d8a"), 0.42);
      const coreCenterColor = mixRgb(
        isDark ? hexToRgb("#77e8cf") : hexToRgb("#1aa08a"),
        cyberAccent2,
        0.2,
      );

      const drift = blend.from.drift + (blend.to.drift - blend.from.drift) * blend.mix;
      const scaleMul = blend.from.scale + (blend.to.scale - blend.from.scale) * blend.mix;

      const bass = clamp01(audio.bass);
      const mid = clamp01(audio.mid);
      const treble = clamp01(audio.treble);
      const beat = clamp01(audio.beat);
      const overall = clamp01(audio.overall);
      const spectrum = audio.spectrum.length > 0 ? audio.spectrum : [bass, mid, treble];
      const waveform = audio.waveform.length > 0 ? audio.waveform : [0];

      const lowReact = averageSpectrumRange(spectrum, 0, 0.22);
      const midReact = averageSpectrumRange(spectrum, 0.22, 0.62);
      const highReact = averageSpectrumRange(spectrum, 0.62, 1);
      const panelVisible = showAnalyzerRef.current;
      const coreVisible = showCoreRef.current;
      const isMobile = width < 768;

      const panelW = panelVisible ? (isMobile ? Math.min(width * 0.96, width - 8) : Math.min(width * 0.9, 1180)) : 0;
      const panelH = panelVisible ? (isMobile ? Math.max(118, Math.min(150, height * 0.22)) : Math.max(150, Math.min(230, height * 0.28))) : 0;
      const panelX = panelVisible ? (width - panelW) * 0.5 : 0;
      const panelY = panelVisible ? (isMobile ? height - panelH - 8 : height - panelH - 20) : height + 9999;

      ctx.clearRect(0, 0, width, height);

      let cx = width * 0.5 + Math.cos(t * 0.07) * (drift + bass * 10);
      let cy = height * 0.52 + Math.sin(t * 0.065) * (drift + mid * 8);
      let base = Math.min(width, height) * 0.17 * scaleMul;

      if (coreVisible && panelVisible) {
        const estimatedOuterRadius = base * 1.92;
        const maxCy = panelY - estimatedOuterRadius - 18;
        cy = Math.min(cy, maxCy);

        if (cy < 110) {
          const allowedRadius = Math.max(70, panelY - 118);
          const scaleDown = Math.min(1, allowedRadius / Math.max(1, estimatedOuterRadius));
          base *= scaleDown;
          const correctedOuter = base * 1.92;
          cy = Math.min(cy, panelY - correctedOuter - 18);
          cy = Math.max(cy, 92);
        }
      }

      if (coreVisible) {
        const glow = ctx.createRadialGradient(cx, cy, base * 0.15, cx, cy, base * 1.7);
        glow.addColorStop(0, rgba(cyberAccent, isDark ? 0.09 : 0.06));
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        const coreActivity = clamp01(overall * 0.58 + beat * 0.42);
        const beatRising = beat > 0.56 && lastBeat <= 0.56;
        lastBeat = beat;

        if (beatRising) {
          const nodeCount = Math.max(5, Math.floor(7 + beat * 9 + highReact * 6));
          for (let i = 0; i < nodeCount; i += 1) {
            burstNodes.push({
              angle: Math.random() * Math.PI * 2,
              radius: base * (0.3 + Math.random() * 0.35),
              radialSpeed: base * (0.44 + Math.random() * 0.74) * (0.001 + beat * 0.0008),
              orbitSpeed: (Math.random() * 2 - 1) * (0.7 + highReact * 1.8),
              life: 1,
              maxLife: 680 + Math.random() * 900,
              size: 1.8 + Math.random() * 4.2,
              mix: Math.random(),
            });
          }
          const flowSpawn = Math.max(8, Math.floor(12 + beat * 14 + midReact * 8));
          for (let i = 0; i < flowSpawn; i += 1) {
            const angle = Math.random() * Math.PI * 2;
            const radius = base * (0.32 + Math.random() * 0.6);
            flowNodes.push({
              x: cx + Math.cos(angle) * radius,
              y: cy + Math.sin(angle) * radius,
              vx: (Math.random() * 2 - 1) * 0.05,
              vy: (Math.random() * 2 - 1) * 0.05,
              life: 1,
              maxLife: 700 + Math.random() * 980,
              size: 1.2 + Math.random() * 2.8,
              mix: Math.random(),
            });
          }
          const segments = Math.max(10, Math.floor(14 + beat * 12 + treble * 8));
          for (let i = 0; i < segments; i += 1) {
            arcSegments.push({
              angle: Math.random() * Math.PI * 2,
              radius: base * (0.92 + Math.random() * 0.96),
              speed: (Math.random() * 2 - 1) * (0.5 + highReact * 2.4),
              length: 0.08 + Math.random() * 0.16,
              life: 1,
              maxLife: 560 + Math.random() * 780,
              thickness: 0.7 + Math.random() * 1.3,
              mix: Math.random(),
            });
          }
          shockRings.push({
            radius: base * (0.34 + beat * 0.12),
            speed: base * (0.0009 + lowReact * 0.0014),
            life: 1,
            maxLife: 900 + beat * 520,
            thickness: 0.9 + beat * 1.5,
          });
          const tileCount = Math.max(6, Math.floor(8 + coreActivity * 14 + midReact * 8));
          for (let i = 0; i < tileCount; i += 1) {
            pulseTiles.push({
              angle: Math.random() * Math.PI * 2,
              radius: base * (0.98 + Math.random() * 1.22),
              spin: (Math.random() * 2 - 1) * (0.8 + highReact * 2),
              life: 1,
              maxLife: 540 + Math.random() * 760,
              scale: 1.3 + Math.random() * 4,
              mix: Math.random(),
            });
          }
          const rayCount = Math.max(5, Math.floor(7 + coreActivity * 10 + treble * 10));
          for (let i = 0; i < rayCount; i += 1) {
            glitchRays.push({
              angle: Math.random() * Math.PI * 2,
              length: base * (0.38 + Math.random() * 1.34),
              speed: (Math.random() * 2 - 1) * (1 + highReact * 2.6),
              life: 1,
              maxLife: 420 + Math.random() * 560,
              width: 0.6 + Math.random() * 1.3,
              mix: Math.random(),
            });
          }
        }

        if (!reducedMotionRef.current && Math.random() < 0.015 + beat * 0.045) {
          burstNodes.push({
            angle: Math.random() * Math.PI * 2,
            radius: base * (0.32 + Math.random() * 0.2),
            radialSpeed: base * (0.42 + Math.random() * 0.5) * 0.00075,
            orbitSpeed: (Math.random() * 2 - 1) * (0.4 + highReact * 1.2),
            life: 1,
            maxLife: 420 + Math.random() * 520,
            size: 1.4 + Math.random() * 3,
            mix: Math.random(),
          });
          flowNodes.push({
            x: cx + (Math.random() * 2 - 1) * base * 0.45,
            y: cy + (Math.random() * 2 - 1) * base * 0.45,
            vx: (Math.random() * 2 - 1) * 0.06,
            vy: (Math.random() * 2 - 1) * 0.06,
            life: 1,
            maxLife: 420 + Math.random() * 520,
            size: 1 + Math.random() * 2.2,
            mix: Math.random(),
          });
        }
        if (!reducedMotionRef.current && Math.random() < 0.012 + coreActivity * 0.03) {
          pulseTiles.push({
            angle: Math.random() * Math.PI * 2,
            radius: base * (0.96 + Math.random() * 0.85),
            spin: (Math.random() * 2 - 1) * (0.5 + highReact * 1.3),
            life: 1,
            maxLife: 360 + Math.random() * 520,
            scale: 1 + Math.random() * 2.8,
            mix: Math.random(),
          });
        }
        if (!reducedMotionRef.current && Math.random() < 0.01 + coreActivity * 0.028) {
          glitchRays.push({
            angle: Math.random() * Math.PI * 2,
            length: base * (0.34 + Math.random() * 0.78),
            speed: (Math.random() * 2 - 1) * (0.9 + highReact * 1.8),
            life: 1,
            maxLife: 340 + Math.random() * 430,
            width: 0.5 + Math.random() * 1,
            mix: Math.random(),
          });
        }

        if (burstNodes.length > 260) {
          burstNodes.splice(0, burstNodes.length - 260);
        }
        if (flowNodes.length > 340) {
          flowNodes.splice(0, flowNodes.length - 340);
        }
        if (arcSegments.length > 220) {
          arcSegments.splice(0, arcSegments.length - 220);
        }
        if (shockRings.length > 20) {
          shockRings.splice(0, shockRings.length - 20);
        }
        if (pulseTiles.length > 260) {
          pulseTiles.splice(0, pulseTiles.length - 260);
        }
        if (glitchRays.length > 220) {
          glitchRays.splice(0, glitchRays.length - 220);
        }

        const meshLayers = reducedMotionRef.current ? 2 : isMobile ? 3 : 5;
        for (let layer = 0; layer < meshLayers; layer += 1) {
          const samples = isMobile ? 36 : 64;
          const layerMix = layer / Math.max(1, meshLayers - 1);
          const baseRadius = base * (0.52 + layer * 0.2 + lowReact * 0.08);

          ctx.beginPath();
          for (let i = 0; i <= samples; i += 1) {
            const k = i / samples;
            const band = sampleSpectrum(spectrum, (k + layerMix * 0.19) % 1);
            const wave = waveform[Math.floor(k * Math.max(0, waveform.length - 1))] ?? 0;
            const warp =
              Math.sin(t * (1 + layer * 0.27) + k * 12.6) * base * 0.04 +
              Math.cos(t * (1.6 + layer * 0.18) + k * 8.9) * base * 0.03;
            const radius = baseRadius + band * base * 0.24 + wave * base * 0.14 + beat * base * 0.08 + warp;
            const angle = k * Math.PI * 2 + t * (0.18 + layer * 0.07) * (layer % 2 === 0 ? 1 : -1);
            const x = cx + Math.cos(angle + wave * 0.12) * radius;
            const y = cy + Math.sin(angle * (1.02 + layer * 0.03) - wave * 0.1) * radius * 0.9;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          const meshColor = mixRgb(coreCenterColor, cyberAccent2, layerMix * 0.9);
          ctx.strokeStyle = rgba(meshColor, isDark ? 0.24 + layerMix * 0.14 : 0.18 + layerMix * 0.1);
          ctx.lineWidth = 0.8 + layer * 0.32;
          ctx.stroke();
        }

        const shardCount = reducedMotionRef.current ? 32 : isMobile ? 48 : 82;
        for (let i = 0; i < shardCount; i += 1) {
          const k = i / Math.max(1, shardCount - 1);
          const band = sampleSpectrum(spectrum, k);
          const wave = waveform[Math.floor(k * Math.max(0, waveform.length - 1))] ?? 0;
          const angle = k * Math.PI * 2 + t * (0.38 + highReact * 0.28);
          const radius = base * (0.24 + ((i * 17) % 100) / 100 * 0.66 + band * 0.26 + beat * 0.08);
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle * 1.07 + wave * 0.8) * radius * 0.84;
          const size = 1.2 + band * 3.2 + Math.abs(wave) * 1.8;
          const color = mixRgb(coreCenterColor, cyberAccent2, k);
          ctx.fillStyle = rgba(color, isDark ? 0.3 + band * 0.34 : 0.24 + band * 0.26);
          ctx.fillRect(x - size * 0.5, y - size * 0.5, size, size);
        }

        const orbitPixels = reducedMotionRef.current ? 26 : isMobile ? 34 : 52;
        for (let i = 0; i < orbitPixels; i += 1) {
          const k = i / Math.max(1, orbitPixels - 1);
          const bandValue = sampleSpectrum(spectrum, k);
          const angle = k * Math.PI * 2 + t * (0.08 + highReact * 0.06);
          const radius = base * (1.34 + bandValue * 0.3 + beat * 0.08);
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;
          const size = 1.5 + bandValue * 3.4;
          const color = mixRgb(cyberAccent, cyberAccent2, k);
          ctx.fillStyle = rgba(color, isDark ? 0.56 : 0.42);
          ctx.fillRect(px - size * 0.5, py - size * 0.5, size, size);
        }

        const scannerCount = reducedMotionRef.current ? 1 : isMobile ? 2 : 3;
        for (let i = 0; i < scannerCount; i += 1) {
          const dir = i % 2 === 0 ? 1 : -1;
          const phase = t * (0.35 + i * 0.11 + coreActivity * 0.06) * dir + i * 1.7;
          const sweep = 0.18 + highReact * 0.1 + coreActivity * 0.06;
          const innerR = base * (0.46 + i * 0.2);
          const outerR = base * (1.56 + i * 0.26 + beat * 0.1);
          const scannerColor = mixRgb(cyberAccent, cyberAccent2, i / Math.max(1, scannerCount - 1));
          const alpha = (isDark ? 0.14 : 0.1) * (0.9 + coreActivity * 0.8);
          ctx.fillStyle = rgba(scannerColor, alpha);
          ctx.beginPath();
          ctx.arc(cx, cy, outerR, phase, phase + sweep);
          ctx.arc(cx, cy, innerR, phase + sweep, phase, true);
          ctx.closePath();
          ctx.fill();
        }

        const cometCount = reducedMotionRef.current ? 2 : isMobile ? 4 : 7;
        for (let i = 0; i < cometCount; i += 1) {
          const kBase = i / Math.max(1, cometCount);
          const orbitT = (kBase + t * (0.05 + i * 0.003 + coreActivity * 0.01)) % 1;
          const band = sampleSpectrum(spectrum, (orbitT + i * 0.13) % 1);
          const wave = waveform[Math.floor(orbitT * Math.max(0, waveform.length - 1))] ?? 0;
          const angle = orbitT * Math.PI * 2 + Math.sin(t * (0.7 + i * 0.12) + i * 2.1) * 0.22;
          const radius = base * (1.08 + (((i * 37) % 100) / 100) * 0.9 + band * 0.24 + beat * 0.08);
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle * 1.03 + wave * 0.28) * radius * 0.9;
          const tail = base * (0.15 + band * 0.26 + coreActivity * 0.17);
          const tx = x - Math.cos(angle) * tail;
          const ty = y - Math.sin(angle) * tail;
          const cometColor = mixRgb(coreCenterColor, cyberAccent2, kBase);
          ctx.strokeStyle = rgba(cometColor, isDark ? 0.3 + band * 0.28 : 0.22 + band * 0.2);
          ctx.lineWidth = 0.9 + band * 1.2;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(x, y);
          ctx.stroke();
          const size = 1.6 + band * 2.4 + coreActivity * 1.2;
          ctx.fillStyle = rgba(cometColor, isDark ? 0.58 : 0.44);
          ctx.fillRect(x - size * 0.5, y - size * 0.5, size, size);
        }

        for (let i = burstNodes.length - 1; i >= 0; i -= 1) {
          const node = burstNodes[i];
          const dt = deltaMs;
          node.life -= dt / node.maxLife;
          node.radius += node.radialSpeed * dt;
          node.angle += node.orbitSpeed * 0.001 * dt;

          if (node.life <= 0) {
            burstNodes.splice(i, 1);
            continue;
          }

          const lifeT = clamp01(node.life);
          const x = cx + Math.cos(node.angle) * node.radius;
          const y = cy + Math.sin(node.angle) * node.radius;
          const size = node.size * (0.8 + beat * 0.5 + lifeT * 0.35);
          const color = mixRgb(coreCenterColor, cyberAccent2, node.mix);
          const alpha = (isDark ? 0.52 : 0.4) * lifeT * (0.7 + beat * 0.5);
          ctx.fillStyle = rgba(color, alpha);
          ctx.fillRect(x - size * 0.5, y - size * 0.5, size, size);
        }

        for (let i = shockRings.length - 1; i >= 0; i -= 1) {
          const ring = shockRings[i];
          const dt = deltaMs;
          ring.life -= dt / ring.maxLife;
          ring.radius += ring.speed * dt;

          if (ring.life <= 0) {
            shockRings.splice(i, 1);
            continue;
          }

          const alpha = (isDark ? 0.48 : 0.34) * Math.pow(clamp01(ring.life), 1.15);
          ctx.strokeStyle = rgba(coreCenterColor, alpha);
          ctx.lineWidth = ring.thickness;
          ctx.beginPath();
          ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        const ribbonCount = reducedMotionRef.current ? 1 : isMobile ? 2 : 3;
        for (let ribbon = 0; ribbon < ribbonCount; ribbon += 1) {
          const samples = isMobile ? 44 : 70;
          const baseRadius = base * (0.74 + ribbon * 0.22 + lowReact * 0.08);
          ctx.beginPath();
          for (let i = 0; i <= samples; i += 1) {
            const k = i / samples;
            const sv = sampleSpectrum(spectrum, (k + ribbon * 0.17) % 1);
            const wave = waveform[Math.floor(k * (waveform.length - 1))] ?? 0;
            const wobble =
              Math.sin(t * (0.9 + ribbon * 0.22) + k * 12.4) * base * 0.05 +
              Math.cos(t * (1.4 + ribbon * 0.16) + k * 9.1) * base * 0.035;
            const radius =
              baseRadius +
              sv * base * 0.25 +
              wave * base * 0.16 +
              beat * base * 0.08 +
              wobble;
            const angle = k * Math.PI * 2 + t * (0.22 + ribbon * 0.08);
            const x = cx + Math.cos(angle + wave * 0.12) * radius;
            const y = cy + Math.sin(angle * (1.04 + ribbon * 0.02) - wave * 0.1) * radius * 0.9;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          const ribbonColor = mixRgb(coreCenterColor, cyberAccent2, ribbon / Math.max(1, ribbonCount - 1));
          ctx.strokeStyle = rgba(ribbonColor, isDark ? 0.24 : 0.18);
          ctx.lineWidth = 0.85 + ribbon * 0.35;
          ctx.stroke();
        }

        for (let i = flowNodes.length - 1; i >= 0; i -= 1) {
          const node = flowNodes[i];
          const prevX = node.x;
          const prevY = node.y;
          const dt = deltaMs;
          node.life -= dt / node.maxLife;

          if (node.life <= 0) {
            flowNodes.splice(i, 1);
            continue;
          }

          const dx = node.x - cx;
          const dy = node.y - cy;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const nx = dx / dist;
          const ny = dy / dist;
          const tx = -ny;
          const ty = nx;
          const band = sampleSpectrum(spectrum, node.mix);
          const waveIdx = Math.floor(node.mix * Math.max(0, waveform.length - 1));
          const wave = waveform[waveIdx] ?? 0;

          const radialPush = (beat - 0.24) * 0.02 + band * 0.015;
          const swirlPush = 0.02 + treble * 0.035 + Math.abs(wave) * 0.024;
          node.vx += (tx * swirlPush + nx * radialPush) * dt;
          node.vy += (ty * swirlPush + ny * radialPush) * dt;
          node.vx *= 0.974;
          node.vy *= 0.974;

          node.x += node.vx * 0.07;
          node.y += node.vy * 0.07;

          const newDx = node.x - cx;
          const newDy = node.y - cy;
          const newDist = Math.hypot(newDx, newDy);
          if (newDist > base * 2.8) {
            flowNodes.splice(i, 1);
            continue;
          }

          const lifeT = clamp01(node.life);
          const nodeColor = mixRgb(coreCenterColor, cyberAccent2, node.mix);
          const trailAlpha = (isDark ? 0.2 : 0.14) * lifeT * (0.8 + band);
          ctx.strokeStyle = rgba(nodeColor, trailAlpha);
          ctx.lineWidth = Math.max(0.8, node.size * 0.55);
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();

          const size = node.size * (0.9 + beat * 0.6 + band * 0.35);
          const alpha = (isDark ? 0.56 : 0.42) * lifeT * (0.72 + band * 0.4);
          ctx.fillStyle = rgba(nodeColor, alpha);
          ctx.fillRect(node.x - size * 0.5, node.y - size * 0.5, size, size);
        }

        for (let i = arcSegments.length - 1; i >= 0; i -= 1) {
          const segment = arcSegments[i];
          const dt = deltaMs;
          segment.life -= dt / segment.maxLife;
          if (segment.life <= 0) {
            arcSegments.splice(i, 1);
            continue;
          }

          const band = sampleSpectrum(spectrum, segment.mix);
          segment.angle += segment.speed * 0.001 * dt * (0.8 + band * 0.5);
          segment.radius += (band - 0.5) * base * 0.00035 * dt;
          segment.radius = clamp01(segment.radius / (base * 2.6)) * (base * 2.6);
          segment.radius = Math.max(base * 0.58, segment.radius);
          const length = segment.length * (0.75 + band * 0.9 + beat * 0.22);
          const color = mixRgb(cyberAccent, cyberAccent2, segment.mix);
          const alpha = (isDark ? 0.44 : 0.3) * Math.pow(clamp01(segment.life), 1.1);
          ctx.strokeStyle = rgba(color, alpha);
          ctx.lineWidth = segment.thickness * (0.8 + band * 0.8);
          ctx.beginPath();
          ctx.arc(cx, cy, segment.radius, segment.angle, segment.angle + length);
          ctx.stroke();
        }

        for (let i = pulseTiles.length - 1; i >= 0; i -= 1) {
          const tile = pulseTiles[i];
          const dt = deltaMs;
          tile.life -= dt / tile.maxLife;
          if (tile.life <= 0) {
            pulseTiles.splice(i, 1);
            continue;
          }
          const band = sampleSpectrum(spectrum, tile.mix);
          tile.angle += tile.spin * 0.001 * dt * (0.72 + band * 0.75);
          tile.radius += Math.sin(t * 2.2 + tile.mix * 12.4) * base * 0.00024 * dt;
          tile.radius = Math.max(base * 0.82, Math.min(base * 2.42, tile.radius));
          const lifeT = clamp01(tile.life);
          const size = tile.scale * (0.95 + band * 1.15 + coreActivity * 0.8);
          const x = cx + Math.cos(tile.angle) * tile.radius;
          const y = cy + Math.sin(tile.angle * 1.06) * tile.radius * 0.88;
          const tileColor = mixRgb(cyberAccent, cyberAccent2, tile.mix);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(tile.angle + t * 0.3);
          ctx.fillStyle = rgba(tileColor, (isDark ? 0.42 : 0.3) * lifeT * (0.72 + band * 0.7));
          ctx.fillRect(-size * 0.5, -size * 0.5, size, size * 0.64);
          ctx.restore();
        }

        for (let i = glitchRays.length - 1; i >= 0; i -= 1) {
          const ray = glitchRays[i];
          const dt = deltaMs;
          ray.life -= dt / ray.maxLife;
          if (ray.life <= 0) {
            glitchRays.splice(i, 1);
            continue;
          }
          const band = sampleSpectrum(spectrum, ray.mix);
          ray.angle += ray.speed * 0.001 * dt * (0.72 + highReact * 0.45);
          const startR = base * (0.2 + band * 0.16);
          const endR = startR + ray.length * (0.74 + band * 1.2 + beat * 0.44);
          const x1 = cx + Math.cos(ray.angle) * startR;
          const y1 = cy + Math.sin(ray.angle) * startR;
          const x2 = cx + Math.cos(ray.angle) * endR;
          const y2 = cy + Math.sin(ray.angle) * endR;
          const rayColor = mixRgb(coreCenterColor, cyberAccent2, ray.mix);
          ctx.strokeStyle = rgba(rayColor, (isDark ? 0.44 : 0.32) * Math.pow(clamp01(ray.life), 1.12));
          ctx.lineWidth = ray.width * (0.9 + band * 0.85);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        const spokeCount = reducedMotionRef.current ? 10 : isMobile ? 16 : 24;
        for (let i = 0; i < spokeCount; i += 1) {
          const k = i / Math.max(1, spokeCount);
          const band = sampleSpectrum(spectrum, k);
          const angle = k * Math.PI * 2 + t * (0.18 + midReact * 0.05) * (i % 2 === 0 ? 1 : -1);
          const startR = base * (0.32 + ((i * 13) % 9) * 0.03);
          const endR = startR + base * (0.68 + band * 0.72 + coreActivity * 0.34);
          const x1 = cx + Math.cos(angle) * startR;
          const y1 = cy + Math.sin(angle) * startR;
          const x2 = cx + Math.cos(angle) * endR;
          const y2 = cy + Math.sin(angle) * endR;
          const spokeColor = mixRgb(cyberAccent, cyberAccent2, k);
          ctx.strokeStyle = rgba(spokeColor, isDark ? 0.24 + band * 0.22 : 0.17 + band * 0.16);
          ctx.lineWidth = 0.7 + band * 0.9;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        const crossSize = base * (1.42 + beat * 0.06);
        ctx.strokeStyle = rgba(coreCenterColor, isDark ? 0.35 : 0.25);
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(cx - crossSize, cy);
        ctx.lineTo(cx + crossSize, cy);
        ctx.moveTo(cx, cy - crossSize);
        ctx.lineTo(cx, cy + crossSize);
        ctx.stroke();
      }

      if (panelVisible) {
        const panelGrad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
        panelGrad.addColorStop(0, rgba(themeTint, isDark ? 0.11 : 0.07));
        panelGrad.addColorStop(1, rgba(cyberAccent, isDark ? 0.08 : 0.05));
        roundedRectPath(ctx, panelX, panelY, panelW, panelH, 14);
        ctx.fillStyle = panelGrad;
        ctx.fill();
        ctx.strokeStyle = rgba(cyberAccent2, isDark ? 0.32 : 0.2);
        ctx.lineWidth = 1;
        ctx.stroke();

        const gridLines = 5;
        for (let i = 0; i <= gridLines; i += 1) {
          const gy = panelY + 16 + (i / gridLines) * (panelH - 40);
          ctx.strokeStyle = rgba(cyberAccent2, isDark ? 0.16 : 0.1);
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(panelX + 10, gy);
          ctx.lineTo(panelX + panelW - 10, gy);
          ctx.stroke();
        }

        const lowCut = panelX + panelW * 0.3;
        const highCut = panelX + panelW * 0.72;
        ctx.strokeStyle = rgba(cyberAccent, isDark ? 0.2 : 0.13);
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(lowCut, panelY + 12);
        ctx.lineTo(lowCut, panelY + panelH - 14);
        ctx.moveTo(highCut, panelY + 12);
        ctx.lineTo(highCut, panelY + panelH - 14);
        ctx.stroke();

        if (!isMobile) {
          ctx.fillStyle = rgba(cyberAccent2, isDark ? 0.62 : 0.5);
          ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
          ctx.fillText("LOW", panelX + 14, panelY + 24);
          ctx.fillText("MID", lowCut + 12, panelY + 24);
          ctx.fillText("HIGH", highCut + 12, panelY + 24);
        }

        const spectrumBars = reducedMotionRef.current ? 42 : isMobile ? 52 : 84;
        const barsAreaY = panelY + panelH * (isMobile ? 0.36 : 0.42);
        const barsAreaH = panelH * (isMobile ? 0.56 : 0.5);
        const barGap = isMobile ? 1.2 : 1.8;
        const barW = Math.max(1.6, (panelW - 24 - (spectrumBars - 1) * barGap) / spectrumBars);

        let contourStarted = false;
        ctx.beginPath();
        for (let i = 0; i < spectrumBars; i += 1) {
          const k = i / Math.max(1, spectrumBars - 1);
          const rawValue = sampleSpectrum(spectrum, k);

          const floorPrev = bandFloor[i] ?? 0.02;
          const peakPrev = bandPeak[i] ?? 0.28;

          const floorNext = rawValue < floorPrev ? rawValue : floorPrev + (rawValue - floorPrev) * 0.01;
          const peakNext = rawValue > peakPrev ? rawValue : peakPrev + (rawValue - peakPrev) * 0.04;
          const safePeak = Math.max(peakNext, floorNext + 0.09);

          bandFloor[i] = floorNext;
          bandPeak[i] = safePeak;

          const normalizedRaw = clamp01((rawValue - floorNext) / Math.max(0.06, safePeak - floorNext));
          const value = tunedBandValue(normalizedRaw, k, beat);
          const h = Math.max(2, (ANALYZER_TUNING.floor + value) * barsAreaH * ANALYZER_TUNING.barHeightBoost);
          const x = panelX + 12 + i * (barW + barGap);
          const y = barsAreaY + barsAreaH - h;

          let color = cyberAccent;
          if (k > 0.72) {
            color = mixRgb(cyberAccent2, themeTint, 0.35);
          } else if (k > 0.28) {
            color = mixRgb(cyberAccent, cyberAccent2, 0.35);
          }

          ctx.fillStyle = rgba(color, isDark ? 0.56 : 0.42);
          ctx.fillRect(x, y, barW, h);

          const cxTop = x + barW * 0.5;
          if (!contourStarted) {
            ctx.moveTo(cxTop, y);
            contourStarted = true;
          } else {
            ctx.lineTo(cxTop, y);
          }
        }
        ctx.strokeStyle = rgba(cyberAccent2, isDark ? 0.6 : 0.48);
        ctx.lineWidth = 1.2;
        ctx.stroke();

        const scopeY = panelY + (isMobile ? 10 : 14);
        const scopeH = panelH * (isMobile ? 0.2 : 0.24);
        const scopeMid = scopeY + scopeH * 0.5;
        ctx.strokeStyle = rgba(cyberAccent, isDark ? 0.52 : 0.38);
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(panelX + 12, scopeMid);
        ctx.lineTo(panelX + panelW - 12, scopeMid);
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < waveform.length; i += 1) {
          const k = i / Math.max(1, waveform.length - 1);
          const x = panelX + 12 + k * (panelW - 24);
          const y = scopeMid + (waveform[i] ?? 0) * scopeH * 0.42 * ANALYZER_TUNING.waveformBoost * (1 + beat * 0.08);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = rgba(cyberAccent2, isDark ? 0.74 : 0.58);
        ctx.lineWidth = 1.3;
        ctx.stroke();

        if (!isMobile) {
          const freqTicks = [60, 120, 250, 500, 1000, 2000, 4000, 8000, 16000];
          ctx.fillStyle = rgba(cyberAccent2, isDark ? 0.5 : 0.42);
          ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
          freqTicks.forEach((freq) => {
            const fx = panelX + 12 + freqToNormalized(freq) * (panelW - 24);
            const label = freq >= 1000 ? `${Math.round(freq / 1000)}k` : `${freq}`;
            ctx.fillText(label, fx - 8, panelY + panelH - 6);
          });
        }
      }

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      media.removeEventListener("change", onMedia);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full opacity-[0.95] [filter:blur(0.1px)_contrast(1.04)_saturate(1.05)]" />
    </div>
  );
}
