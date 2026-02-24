/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useExplorerStore } from "@/stores/explorer-store";
import {
  DIMENSION_COLORS,
  DIMENSION_RANGE,
  DUALITY_INFO,
} from "@/lib/constants";

function colorToCSS(c: readonly [number, number, number]): string {
  return `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
}

export default function HUD() {
  const visible = useExplorerStore((s) => s.hudVisible);
  const fps = useExplorerStore((s) => s.fps);
  const dim = useExplorerStore((s) => s.activeDimensions);
  const mode = useExplorerStore((s) => s.dualityMode);
  const vertexCount = useExplorerStore((s) => s.vertexCount);
  const isPlaying = useExplorerStore((s) => s.isPlaying);
  const audioEnabled = useExplorerStore((s) => s.audioEnabled);

  const color = DIMENSION_COLORS[dim - DIMENSION_RANGE.min] ?? [0.5, 0.5, 0.8];

  return (
    <div
      className={`pointer-events-none absolute top-4 left-4 rounded-lg border border-white/5 bg-black/50 backdrop-blur-sm px-3 py-2 font-mono text-xs transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span style={{ color: colorToCSS(color) }} className="font-bold">
            {dim}D
          </span>
          <span className="text-zinc-500">{DUALITY_INFO[mode].label}</span>
          {!isPlaying && <span className="text-zinc-600">PAUSED</span>}
          {audioEnabled && <span className="text-zinc-600">&#9835;</span>}
        </div>
        <div className="flex items-center gap-3 text-zinc-600">
          <span>{fps} FPS</span>
          <span>{vertexCount.toLocaleString()} verts</span>
        </div>
      </div>
    </div>
  );
}
