"use client";

import * as React from "react";

type AudioEnergy = {
  overall: number;
  bass: number;
  mid: number;
  treble: number;
  beat: number;
  bands: [number, number, number, number, number];
  spectrum: number[];
  waveform: number[];
};

type AudioVisualizerContextValue = {
  energy: AudioEnergy;
  registerAudioElement: (element: HTMLMediaElement | null) => (() => void) | void;
  resumeAudio: () => void;
  showCore: boolean;
  showAnalyzer: boolean;
  toggleCore: () => void;
  toggleAnalyzer: () => void;
};

type AudioEngine = {
  context: AudioContext;
  analyser: AnalyserNode;
  outputGain: GainNode;
  frequencyData: Uint8Array<ArrayBuffer>;
  timeData: Uint8Array<ArrayBuffer>;
  elementSources: WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>;
  analyserConnections: WeakSet<AudioNode>;
  outputConnections: WeakSet<AudioNode>;
};

const DEFAULT_ENERGY: AudioEnergy = {
  overall: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  beat: 0,
  bands: [0, 0, 0, 0, 0],
  spectrum: [],
  waveform: [],
};

const SPECTRUM_SIZE = 72;
const WAVEFORM_SIZE = 180;

declare global {
  interface Window {
    __portfolioAudioEngine?: AudioEngine;
  }
}

const AudioVisualizerContext = React.createContext<AudioVisualizerContextValue>({
  energy: DEFAULT_ENERGY,
  registerAudioElement: () => {},
  resumeAudio: () => {},
  showCore: true,
  showAnalyzer: false,
  toggleCore: () => {},
  toggleAnalyzer: () => {},
});

function average(values: Uint8Array<ArrayBufferLike>, start: number, end: number): number {
  const safeStart = Math.max(0, Math.min(values.length - 1, start));
  const safeEnd = Math.max(safeStart + 1, Math.min(values.length, end));
  let sum = 0;

  for (let i = safeStart; i < safeEnd; i += 1) {
    sum += values[i];
  }

  return sum / (safeEnd - safeStart) / 255;
}

function smooth(current: number, next: number, factor: number): number {
  return current + (next - current) * factor;
}

function computeBands(values: Uint8Array<ArrayBufferLike>): [number, number, number, number, number] {
  const n = values.length;
  return [
    average(values, 1, Math.floor(n * 0.04)),
    average(values, Math.floor(n * 0.04), Math.floor(n * 0.1)),
    average(values, Math.floor(n * 0.1), Math.floor(n * 0.2)),
    average(values, Math.floor(n * 0.2), Math.floor(n * 0.4)),
    average(values, Math.floor(n * 0.4), n),
  ];
}

function computeSpectrum(values: Uint8Array<ArrayBufferLike>, bandCount = SPECTRUM_SIZE): number[] {
  const n = values.length;
  if (n < 2) {
    return new Array<number>(bandCount).fill(0);
  }

  const minIndex = 1;
  const maxIndex = n - 1;
  const range = maxIndex - minIndex;
  const spectrum = new Array<number>(bandCount).fill(0);

  for (let i = 0; i < bandCount; i += 1) {
    const t0 = i / bandCount;
    const t1 = (i + 1) / bandCount;
    const start = minIndex + Math.floor(Math.pow(t0, 2.35) * range);
    const end = minIndex + Math.floor(Math.pow(t1, 2.35) * range);
    const safeEnd = Math.max(start + 1, end);

    let sum = 0;
    let count = 0;
    for (let idx = start; idx < safeEnd && idx < n; idx += 1) {
      sum += values[idx];
      count += 1;
    }

    const avg = count > 0 ? sum / count : 0;
    spectrum[i] = Math.pow(avg / 255, 1.22);
  }

  return spectrum;
}

function computeWaveform(values: Uint8Array<ArrayBufferLike>, pointCount = WAVEFORM_SIZE): number[] {
  const n = values.length;
  if (n === 0) {
    return new Array<number>(pointCount).fill(0);
  }

  const waveform = new Array<number>(pointCount).fill(0);
  for (let i = 0; i < pointCount; i += 1) {
    const idx = Math.floor((i / Math.max(1, pointCount - 1)) * (n - 1));
    const normalized = ((values[idx] ?? 128) - 128) / 128;
    waveform[i] = Math.max(-1, Math.min(1, normalized));
  }

  return waveform;
}

function getAudioEngine(): AudioEngine | null {
  if (typeof window === "undefined") {
    return null;
  }

  const win = window as Window;
  if (win.__portfolioAudioEngine && win.__portfolioAudioEngine.context.state !== "closed") {
    return win.__portfolioAudioEngine;
  }

  const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) {
    return null;
  }

  const context = new Ctx();
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.68;
  analyser.minDecibels = -95;
  analyser.maxDecibels = -15;

  const outputGain = context.createGain();
  outputGain.gain.value = 1;
  outputGain.connect(context.destination);

  const engine: AudioEngine = {
    context,
    analyser,
    outputGain,
    frequencyData: new Uint8Array(analyser.frequencyBinCount),
    timeData: new Uint8Array(analyser.fftSize),
    elementSources: new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>(),
    analyserConnections: new WeakSet<AudioNode>(),
    outputConnections: new WeakSet<AudioNode>(),
  };

  win.__portfolioAudioEngine = engine;
  return engine;
}

export function AudioVisualizerProvider({ children }: { children: React.ReactNode }) {
  const [energy, setEnergy] = React.useState<AudioEnergy>(DEFAULT_ENERGY);
  const [showCore, setShowCore] = React.useState(true);
  const [showAnalyzer, setShowAnalyzer] = React.useState(false);
  const autoConfiguredRef = React.useRef(false);

  const mediaElementRef = React.useRef<HTMLMediaElement | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const sourceRef = React.useRef<AudioNode | null>(null);
  const outputGainRef = React.useRef<GainNode | null>(null);
  const dataRef = React.useRef<Uint8Array<ArrayBuffer> | null>(null);
  const timeDataRef = React.useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = React.useRef<number>(0);
  const mountedRef = React.useRef(false);
  const smoothedRef = React.useRef<AudioEnergy>(DEFAULT_ENERGY);

  const setupAnalyser = React.useCallback((element: HTMLMediaElement) => {
    const engine = getAudioEngine();
    if (!engine) {
      return;
    }

    let source = engine.elementSources.get(element) ?? null;
    if (!source) {
      try {
        source = engine.context.createMediaElementSource(element);
        engine.elementSources.set(element, source);
      } catch {
        source = null;
      }
    }

    if (source) {
      if (!engine.analyserConnections.has(source)) {
        source.connect(engine.analyser);
        engine.analyserConnections.add(source);
      }
      if (!engine.outputConnections.has(source)) {
        source.connect(engine.outputGain);
        engine.outputConnections.add(source);
      }
    }

    audioContextRef.current = engine.context;
    analyserRef.current = engine.analyser;
    outputGainRef.current = engine.outputGain;
    dataRef.current = engine.frequencyData;
    timeDataRef.current = engine.timeData;
    sourceRef.current = source;

    if (element.muted) {
      element.muted = false;
    }

    mediaElementRef.current = element;
  }, []);

  const resumeAudio = React.useCallback(() => {
    const mediaEl = mediaElementRef.current;
    if (mediaEl && !audioContextRef.current) {
      setupAnalyser(mediaEl);
    }

    if (audioContextRef.current?.state === "suspended") {
      void audioContextRef.current.resume();
    }
  }, [setupAnalyser]);

  const registerAudioElement = React.useCallback(
    (element: HTMLMediaElement | null) => {
      if (!element) {
        mediaElementRef.current = null;
        return;
      }
      mediaElementRef.current = element;

      const resume = () => {
        resumeAudio();
      };

      element.addEventListener("play", resume);
      element.addEventListener("pointerdown", resume);
      element.addEventListener("keydown", resume);

      return () => {
        element.removeEventListener("play", resume);
        element.removeEventListener("pointerdown", resume);
        element.removeEventListener("keydown", resume);
      };
    },
    [resumeAudio],
  );

  React.useEffect(() => {
    mountedRef.current = true;

    const tick = () => {
      const analyser = analyserRef.current;
      const values = dataRef.current;
      const timeValues = timeDataRef.current;

      if (!analyser || !values || !timeValues) {
        const prev = smoothedRef.current;
        smoothedRef.current = {
          overall: smooth(prev.overall, 0, 0.08),
          bass: smooth(prev.bass, 0, 0.08),
          mid: smooth(prev.mid, 0, 0.08),
          treble: smooth(prev.treble, 0, 0.08),
          beat: smooth(prev.beat, 0, 0.12),
          bands: [
            smooth(prev.bands[0], 0, 0.08),
            smooth(prev.bands[1], 0, 0.08),
            smooth(prev.bands[2], 0, 0.08),
            smooth(prev.bands[3], 0, 0.08),
            smooth(prev.bands[4], 0, 0.08),
          ],
          spectrum:
            prev.spectrum.length > 0
              ? prev.spectrum.map((value) => smooth(value, 0, 0.1))
              : new Array<number>(SPECTRUM_SIZE).fill(0),
          waveform:
            prev.waveform.length > 0
              ? prev.waveform.map((value) => smooth(value, 0, 0.16))
              : new Array<number>(WAVEFORM_SIZE).fill(0),
        };

        setEnergy(smoothedRef.current);
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      analyser.getByteFrequencyData(values);
      analyser.getByteTimeDomainData(timeValues);

      const bandsRaw = computeBands(values);
      const spectrumRaw = computeSpectrum(values, SPECTRUM_SIZE);
      const waveformRaw = computeWaveform(timeValues, WAVEFORM_SIZE);
      const bassRaw = bandsRaw[0] * 0.65 + bandsRaw[1] * 0.35;
      const midRaw = bandsRaw[2] * 0.45 + bandsRaw[3] * 0.55;
      const trebleRaw = bandsRaw[4];
      const overallRaw = bassRaw * 0.45 + midRaw * 0.35 + trebleRaw * 0.2;

      const previousBass = smoothedRef.current.bass;
      const beatRaw = Math.max(0, bassRaw - previousBass - 0.028) * 5.8;

      const prev = smoothedRef.current;
      smoothedRef.current = {
        overall: smooth(prev.overall, overallRaw, 0.2),
        bass: smooth(prev.bass, bassRaw, 0.22),
        mid: smooth(prev.mid, midRaw, 0.2),
        treble: smooth(prev.treble, trebleRaw, 0.2),
        beat: smooth(prev.beat, Math.min(1, beatRaw), 0.28),
        bands: [
          smooth(prev.bands[0], bandsRaw[0], 0.24),
          smooth(prev.bands[1], bandsRaw[1], 0.24),
          smooth(prev.bands[2], bandsRaw[2], 0.24),
          smooth(prev.bands[3], bandsRaw[3], 0.24),
          smooth(prev.bands[4], bandsRaw[4], 0.24),
        ],
        spectrum:
          prev.spectrum.length === spectrumRaw.length
            ? prev.spectrum.map((value, idx) => smooth(value, spectrumRaw[idx] ?? 0, 0.62))
            : spectrumRaw,
        waveform:
          prev.waveform.length === waveformRaw.length
            ? prev.waveform.map((value, idx) => smooth(value, waveformRaw[idx] ?? 0, 0.68))
            : waveformRaw,
      };

      if (mountedRef.current) {
        setEnergy(smoothedRef.current);
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      mountedRef.current = false;
      window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (autoConfiguredRef.current || typeof window === "undefined") {
      return;
    }

    autoConfiguredRef.current = true;
    if (window.matchMedia("(max-width: 768px)").matches) {
      setShowCore(false);
      setShowAnalyzer(false);
    }
  }, []);

  React.useEffect(() => {
    const wakeAudio = () => {
      resumeAudio();
    };

    const onVisibility = () => {
      if (!document.hidden) {
        wakeAudio();
      }
    };

    window.addEventListener("pointerdown", wakeAudio, { passive: true });
    window.addEventListener("keydown", wakeAudio);
    window.addEventListener("touchstart", wakeAudio, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pointerdown", wakeAudio);
      window.removeEventListener("keydown", wakeAudio);
      window.removeEventListener("touchstart", wakeAudio);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [resumeAudio]);

  const toggleCore = React.useCallback(() => {
    setShowCore((prev) => !prev);
  }, []);

  const toggleAnalyzer = React.useCallback(() => {
    setShowAnalyzer((prev) => !prev);
  }, []);

  const value = React.useMemo<AudioVisualizerContextValue>(
    () => ({
      energy,
      registerAudioElement,
      resumeAudio,
      showCore,
      showAnalyzer,
      toggleCore,
      toggleAnalyzer,
    }),
    [energy, registerAudioElement, resumeAudio, showCore, showAnalyzer, toggleCore, toggleAnalyzer],
  );

  return <AudioVisualizerContext.Provider value={value}>{children}</AudioVisualizerContext.Provider>;
}

export function useAudioVisualizer() {
  return React.useContext(AudioVisualizerContext);
}

