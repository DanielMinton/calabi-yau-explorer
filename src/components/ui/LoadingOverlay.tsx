/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useExplorerStore } from "@/stores/explorer-store";

export default function LoadingOverlay() {
  const gpuReady = useExplorerStore((s) => s.gpuReady);

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#0a0a0f] transition-opacity duration-1000 ${
        gpuReady ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing ring */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full border border-white/10" />
          <div className="absolute inset-2 animate-pulse rounded-full border border-white/20" />
          <div className="absolute inset-4 rounded-full border border-white/30" />
        </div>
        <p className="font-mono text-xs text-zinc-600 tracking-widest uppercase">
          Initializing WebGPU
        </p>
      </div>
    </div>
  );
}
