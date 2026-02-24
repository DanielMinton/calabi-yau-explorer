/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useExplorerStore } from "@/stores/explorer-store";

/**
 * Logarithmic frequency mapping: 3D → 110Hz (A2), 11D → 880Hz (A5).
 * f(t) = 110 * 2^(3t) where t ∈ [0,1].
 */
function freqFromDimensionT(t: number): number {
  return 110 * Math.pow(2, 3 * t);
}

export default function VibrationSynth() {
  const audioEnabled = useExplorerStore((s) => s.audioEnabled);
  const setAudioEnabled = useExplorerStore((s) => s.setAudioEnabled);
  const dimensionT = useExplorerStore((s) => s.dimensionT);
  const duality = useExplorerStore((s) => s.dualityMode);
  const speed = useExplorerStore((s) => s.rotationSpeed);
  const isPlaying = useExplorerStore((s) => s.isPlaying);

  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement>(null);
  const scopeRafRef = useRef<number>(0);

  // Start / stop audio
  useEffect(() => {
    if (!audioEnabled) {
      cancelAnimationFrame(scopeRafRef.current);
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
        oscRef.current = null;
        gainRef.current = null;
        lfoRef.current = null;
        lfoGainRef.current = null;
        analyserRef.current = null;
      }
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    gainRef.current = gain;

    // LFO for breathing modulation
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 8;
    lfoGainRef.current = lfoGain;

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = speed * 0.4;
    lfoRef.current = lfo;

    const freq = freqFromDimensionT(dimensionT);
    const osc = ctx.createOscillator();
    osc.type = duality === "type-i" ? "sine" : "triangle";
    osc.frequency.value = freq;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    osc.start();
    lfo.start();
    oscRef.current = osc;

    // Smooth fade in
    gain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.3);

    // Start oscilloscope
    drawScope();

    return () => {
      cancelAnimationFrame(scopeRafRef.current);
      ctx.close();
      ctxRef.current = null;
      oscRef.current = null;
      gainRef.current = null;
      lfoRef.current = null;
      lfoGainRef.current = null;
      analyserRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEnabled]);

  // Update audio parameters reactively
  useEffect(() => {
    if (!ctxRef.current) return;
    const t = ctxRef.current.currentTime;

    if (oscRef.current) {
      const freq = freqFromDimensionT(dimensionT);
      oscRef.current.frequency.setTargetAtTime(freq, t, 0.08);
      oscRef.current.type = duality === "type-i" ? "sine" : "triangle";
    }
    if (lfoRef.current) {
      lfoRef.current.frequency.setTargetAtTime(speed * 0.4, t, 0.05);
    }
    if (gainRef.current) {
      const target = isPlaying ? 0.12 : 0.03;
      gainRef.current.gain.setTargetAtTime(target, t, 0.2);
    }
  }, [dimensionT, duality, speed, isPlaying]);

  const drawScope = useCallback(() => {
    function render() {
      const canvas = scopeCanvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) return;

      const w = canvas.width;
      const h = canvas.height;
      const bufLen = analyser.frequencyBinCount;
      const data = new Uint8Array(bufLen);
      analyser.getByteTimeDomainData(data);

      ctx2d.clearRect(0, 0, w, h);
      ctx2d.strokeStyle = "rgba(120,180,255,0.6)";
      ctx2d.lineWidth = 1.5;
      ctx2d.beginPath();

      const sliceWidth = w / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) {
          ctx2d.moveTo(x, y);
        } else {
          ctx2d.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx2d.stroke();

      scopeRafRef.current = requestAnimationFrame(render);
    }
    render();
  }, []);

  const freq = freqFromDimensionT(dimensionT);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`text-lg leading-none transition-all ${
            audioEnabled
              ? "text-white drop-shadow-[0_0_6px_rgba(120,180,255,0.5)]"
              : "text-zinc-600 hover:text-zinc-400"
          }`}
          aria-label={audioEnabled ? "Disable sound" : "Enable sound"}
        >
          {audioEnabled ? "\uD83D\uDD0A" : "\uD83D\uDD07"}
        </button>
        {audioEnabled && (
          <span className="text-[10px] font-mono text-zinc-500">
            {freq.toFixed(0)} Hz
          </span>
        )}
      </div>

      {/* Oscilloscope */}
      {audioEnabled && (
        <canvas
          ref={scopeCanvasRef}
          width={200}
          height={40}
          className="w-full h-10 rounded border border-white/5 bg-black/30"
        />
      )}
    </div>
  );
}
