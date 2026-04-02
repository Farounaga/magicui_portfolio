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
  { id: "hero", tintLight: "#2f6e86", tintDark: "#7bc9e4", drift: 15, scale: 1.0 },
  { id: "services", tintLight: "#2f6f7f", tintDark: "#79c8db", drift: 14, scale: 1.02 },
  { id: "presentation-section", tintLight: "#2f7a76", tintDark: "#7fd4c7", drift: 13, scale: 0.98 },
  { id: "etudes-section", tintLight: "#405f86", tintDark: "#9db7e2", drift: 12, scale: 1.0 },
  { id: "experience-section", tintLight: "#356a85", tintDark: "#84c8e0", drift: 13, scale: 1.03 },
  { id: "competences-section", tintLight: "#2f7b73", tintDark: "#83d3c7", drift: 16, scale: 1.04 },
  { id: "realisations-section", tintLight: "#3f6387", tintDark: "#8eb2dc", drift: 14, scale: 1.02 },
  { id: "veille-section", tintLight: "#2f7d82", tintDark: "#84d7dc", drift: 17, scale: 1.06 },
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

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  sides: number,
  radius: number,
  cx: number,
  cy: number,
  rotation: number,
  wobble: number,
  time: number,
  react: number,
) {
  const points: Array<{ x: number; y: number }> = [];
  const step = (Math.PI * 2) / sides;

  for (let i = 0; i < sides; i += 1) {
    const angle = rotation + i * step;
    const wave = Math.sin(time * 1.9 + i * 1.13) * wobble + Math.cos(time * 1.2 + i * 0.71) * wobble * 0.55;
    const r = radius * (1 + wave + react * 0.22);
    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();

  return points;
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
    const bandFloor = new Array<number>(128).fill(0.02);
    const bandPeak = new Array<number>(128).fill(0.28);

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
      const cyberAccent = mixRgb(cyberBase, themeTint, 0.45);
      const cyberAccent2 = mixRgb(cyberAccent, isDark ? hexToRgb("#9fb3dd") : hexToRgb("#3f5d8a"), 0.35);

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

      const panelW = panelVisible ? Math.min(width * 0.9, 1180) : 0;
      const panelH = panelVisible ? Math.max(150, Math.min(230, height * 0.28)) : 0;
      const panelX = panelVisible ? (width - panelW) * 0.5 : 0;
      const panelY = panelVisible ? height - panelH - 20 : height + 9999;

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
        glow.addColorStop(0, rgba(cyberAccent, isDark ? 0.08 : 0.05));
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        const outerSides = reducedMotionRef.current ? 8 : 8 + Math.round(lowReact * 4);
        const middleSides = reducedMotionRef.current ? 6 : 6 + Math.round(midReact * 4);
        const innerSides = 5 + Math.round(highReact * 4);

        const outerRot = t * (0.13 + lowReact * 0.22);
        const middleRot = -t * (0.17 + midReact * 0.24);
        const innerRot = t * (0.24 + highReact * 0.34);

        const outerPoints = drawPolygon(
          ctx,
          outerSides,
          base * (1.34 + beat * 0.2),
          cx,
          cy,
          outerRot,
          reducedMotionRef.current ? 0.015 : 0.035,
          t,
          lowReact,
        );
        ctx.strokeStyle = rgba(cyberAccent2, isDark ? 0.42 : 0.32);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const middlePoints = drawPolygon(
          ctx,
          middleSides,
          base * (1.0 + overall * 0.18),
          cx,
          cy,
          middleRot,
          reducedMotionRef.current ? 0.02 : 0.05,
          t + 0.6,
          midReact,
        );
        ctx.fillStyle = rgba(cyberAccent, isDark ? 0.06 : 0.045);
        ctx.fill();
        ctx.strokeStyle = rgba(cyberAccent, isDark ? 0.5 : 0.36);
        ctx.lineWidth = 1.2;
        ctx.stroke();

        const innerPoints = drawPolygon(
          ctx,
          innerSides,
          base * (0.66 + beat * 0.22),
          cx,
          cy,
          innerRot,
          reducedMotionRef.current ? 0.01 : 0.03,
          t + 1.2,
          highReact,
        );
        ctx.strokeStyle = rgba(cyberAccent2, isDark ? 0.55 : 0.42);
        ctx.lineWidth = 1.1;
        ctx.stroke();

        const links = Math.min(outerPoints.length, middlePoints.length);
        for (let i = 0; i < links; i += 1) {
          const a = outerPoints[i];
          const b = middlePoints[(i * 2) % middlePoints.length];
          ctx.strokeStyle = rgba(cyberAccent, (isDark ? 0.2 : 0.14) * (0.8 + beat));
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        const innerLinks = Math.min(middlePoints.length, innerPoints.length);
        for (let i = 0; i < innerLinks; i += 1) {
          const a = middlePoints[i];
          const b = innerPoints[(i + 1) % innerPoints.length];
          ctx.strokeStyle = rgba(cyberAccent2, (isDark ? 0.17 : 0.12) * (0.7 + treble));
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        const radialBars = reducedMotionRef.current ? 36 : 72;
        for (let i = 0; i < radialBars; i += 1) {
          const angle = (i / radialBars) * Math.PI * 2 + t * 0.075;
          const bandValue = sampleSpectrum(spectrum, i / Math.max(1, radialBars - 1));
          const fromR = base * 1.43;
          const len = base * (0.05 + bandValue * 0.34 + beat * 0.08);
          const x1 = cx + Math.cos(angle) * fromR;
          const y1 = cy + Math.sin(angle) * fromR;
          const x2 = cx + Math.cos(angle) * (fromR + len);
          const y2 = cy + Math.sin(angle) * (fromR + len);

          const mix = i / Math.max(1, radialBars - 1);
          const barColor = mixRgb(cyberAccent, cyberAccent2, mix);
          ctx.strokeStyle = rgba(barColor, (isDark ? 0.4 : 0.28) * (0.7 + bandValue));
          ctx.lineWidth = 0.9 + bandValue * 1.2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        const ringSamples = reducedMotionRef.current ? 48 : 96;
        ctx.beginPath();
        for (let i = 0; i <= ringSamples; i += 1) {
          const k = i / ringSamples;
          const angle = k * Math.PI * 2 - Math.PI / 2 + t * 0.05;
          const sv = sampleSpectrum(spectrum, k);
          const radius = base * (1.16 + sv * 0.28 + beat * 0.06);
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(cyberAccent2, isDark ? 0.46 : 0.34);
        ctx.lineWidth = 1.15;
        ctx.stroke();

        const satelliteCount = 4;
        for (let i = 0; i < satelliteCount; i += 1) {
          const angle = t * (0.18 + i * 0.03) + (i / satelliteCount) * Math.PI * 2;
          const orbit = base * (1.78 + Math.sin(t * 0.8 + i) * 0.08);
          const x = cx + Math.cos(angle) * orbit;
          const y = cy + Math.sin(angle) * orbit;
          const size = base * (0.05 + bass * 0.04);
          const rot = -angle + t * 0.16;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rot);
          ctx.strokeStyle = rgba(cyberAccent2, isDark ? 0.48 : 0.34);
          ctx.lineWidth = 1.2;
          ctx.strokeRect(-size, -size, size * 2, size * 2);
          ctx.restore();

          ctx.strokeStyle = rgba(cyberAccent, isDark ? 0.24 : 0.16);
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
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

        const lowCut = panelX + panelW * 0.28;
        const highCut = panelX + panelW * 0.72;
        ctx.strokeStyle = rgba(cyberAccent, isDark ? 0.2 : 0.13);
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(lowCut, panelY + 12);
        ctx.lineTo(lowCut, panelY + panelH - 14);
        ctx.moveTo(highCut, panelY + 12);
        ctx.lineTo(highCut, panelY + panelH - 14);
        ctx.stroke();

        ctx.fillStyle = rgba(cyberAccent2, isDark ? 0.62 : 0.5);
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        ctx.fillText("LOW", panelX + 14, panelY + 24);
        ctx.fillText("MID", lowCut + 12, panelY + 24);
        ctx.fillText("HIGH", highCut + 12, panelY + 24);

        const spectrumBars = reducedMotionRef.current ? 48 : 84;
        const barsAreaY = panelY + panelH * 0.42;
        const barsAreaH = panelH * 0.5;
        const barGap = 1.8;
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

        const scopeY = panelY + 14;
        const scopeH = panelH * 0.24;
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

        const freqTicks = [60, 120, 250, 500, 1000, 2000, 4000, 8000, 16000];
        ctx.fillStyle = rgba(cyberAccent2, isDark ? 0.5 : 0.42);
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        freqTicks.forEach((freq) => {
          const fx = panelX + 12 + freqToNormalized(freq) * (panelW - 24);
          const label = freq >= 1000 ? `${Math.round(freq / 1000)}k` : `${freq}`;
          ctx.fillText(label, fx - 8, panelY + panelH - 6);
        });
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
