/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useExplorerStore } from "@/stores/explorer-store";

export default function PlaybackControls() {
  const isPlaying = useExplorerStore((s) => s.isPlaying);
  const setIsPlaying = useExplorerStore((s) => s.setIsPlaying);
  const speed = useExplorerStore((s) => s.rotationSpeed);
  const setSpeed = useExplorerStore((s) => s.setRotationSpeed);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Rotation
        </label>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-xs font-mono text-zinc-400 hover:text-white transition-colors border border-white/10 rounded px-2 py-0.5"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={3}
        step={0.1}
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className="w-full cursor-pointer accent-zinc-400"
      />
      <div className="flex justify-between text-[10px] font-mono text-zinc-600">
        <span>0\u00D7</span>
        <span>{speed.toFixed(1)}\u00D7</span>
        <span>3\u00D7</span>
      </div>
    </div>
  );
}
