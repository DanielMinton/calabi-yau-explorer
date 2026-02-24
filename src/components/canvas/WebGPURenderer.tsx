/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import WebGPUCanvas from "./WebGPUCanvas";
import DimensionSlider from "@/components/controls/DimensionSlider";
import DualityToggle from "@/components/controls/DualityToggle";
import PlaybackControls from "@/components/controls/PlaybackControls";
import ProjectionSelect from "@/components/controls/ProjectionSelect";
import VibrationSynth from "@/components/controls/VibrationSynth";
import KeyboardHandler from "@/components/controls/KeyboardHandler";
import HUD from "@/components/ui/HUD";
import InfoPanel from "@/components/ui/InfoPanel";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function WebGPURenderer() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      <WebGPUCanvas />
      <KeyboardHandler />
      <LoadingOverlay />

      <HUD />
      <InfoPanel />

      {/* Dimension slider — bottom center, full width */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[min(600px,90vw)] px-4">
        <DimensionSlider />
      </div>

      {/* Control panel — bottom-left, compact */}
      <div className="absolute bottom-28 left-6 w-52 space-y-3 rounded-lg border border-white/10 bg-black/60 backdrop-blur-sm p-3">
        <DualityToggle />
        <ProjectionSelect />
        <PlaybackControls />
        <VibrationSynth />
      </div>

      {/* Keyboard hints — bottom-right */}
      <div className="pointer-events-none absolute bottom-28 right-6 font-mono text-[10px] text-zinc-700 space-y-0.5 text-right">
        <div>Space: play/pause</div>
        <div>&larr;&rarr;: dimensions &uarr;&darr;: speed</div>
        <div>1-9: quick dim &middot; R: reset</div>
        <div>D: duality &middot; P: projection</div>
        <div>S: sound &middot; H: HUD &middot; I: info</div>
      </div>
    </div>
  );
}
