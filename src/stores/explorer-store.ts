/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
import { create } from "zustand";
import { DIMENSION_RANGE, ProjectionMethod } from "@/lib/constants";
import { clamp } from "@/lib/utils";

export type DualityMode = "type-i" | "heterotic-e";

interface ExplorerState {
  activeDimensions: number;
  dimensionT: number;
  dualityMode: DualityMode;
  projectionMethod: ProjectionMethod;
  rotationSpeed: number;
  cameraPosition: [number, number, number];
  isPlaying: boolean;
  fps: number;
  audioEnabled: boolean;
  orbitYaw: number;
  orbitPitch: number;
  zoom: number;
  hudVisible: boolean;
  infoPanelOpen: boolean;
  vertexCount: number;
  cursorWorld: [number, number, number];
  cursorActive: boolean;
  gpuReady: boolean;

  setActiveDimensions: (n: number) => void;
  setDimensionT: (t: number) => void;
  setDualityMode: (mode: DualityMode) => void;
  setProjectionMethod: (method: ProjectionMethod) => void;
  setRotationSpeed: (speed: number) => void;
  setCameraPosition: (pos: [number, number, number]) => void;
  setIsPlaying: (playing: boolean) => void;
  setFps: (fps: number) => void;
  setAudioEnabled: (enabled: boolean) => void;
  addOrbit: (dyaw: number, dpitch: number) => void;
  setZoom: (zoom: number) => void;
  cycleDimension: (delta: number) => void;
  cycleProjection: () => void;
  toggleDuality: () => void;
  toggleHud: () => void;
  toggleInfoPanel: () => void;
  resetCamera: () => void;
  setVertexCount: (count: number) => void;
  setCursorWorld: (pos: [number, number, number]) => void;
  setCursorActive: (active: boolean) => void;
  setGpuReady: (ready: boolean) => void;
}

const PROJECTIONS = [
  ProjectionMethod.Stereographic,
  ProjectionMethod.Orthographic,
  ProjectionMethod.Perspective,
];

export const useExplorerStore = create<ExplorerState>((set) => ({
  activeDimensions: 3,
  dimensionT: 0,
  dualityMode: "type-i",
  projectionMethod: ProjectionMethod.Stereographic,
  rotationSpeed: 1.0,
  cameraPosition: [0, 0, 5],
  isPlaying: true,
  fps: 0,
  audioEnabled: false,
  orbitYaw: 0,
  orbitPitch: 0,
  zoom: 4,
  hudVisible: true,
  infoPanelOpen: false,
  vertexCount: 0,
  cursorWorld: [0, 0, 0],
  cursorActive: false,
  gpuReady: false,

  setActiveDimensions: (n) => {
    const clamped = clamp(n, DIMENSION_RANGE.min, DIMENSION_RANGE.max);
    set({
      activeDimensions: clamped,
      dimensionT: (clamped - DIMENSION_RANGE.min) / (DIMENSION_RANGE.max - DIMENSION_RANGE.min),
    });
  },
  setDimensionT: (t) => {
    const clamped = clamp(t, 0, 1);
    const dim = Math.round(
      DIMENSION_RANGE.min + clamped * (DIMENSION_RANGE.max - DIMENSION_RANGE.min)
    );
    set({ dimensionT: clamped, activeDimensions: dim });
  },
  setDualityMode: (mode) => set({ dualityMode: mode }),
  setProjectionMethod: (method) => set({ projectionMethod: method }),
  setRotationSpeed: (speed) => set({ rotationSpeed: speed }),
  setCameraPosition: (pos) => set({ cameraPosition: pos }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setFps: (fps) => set({ fps }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  addOrbit: (dyaw, dpitch) =>
    set((s) => ({
      orbitYaw: s.orbitYaw + dyaw,
      orbitPitch: clamp(s.orbitPitch + dpitch, -Math.PI / 2.2, Math.PI / 2.2),
    })),
  setZoom: (zoom) => set({ zoom: clamp(zoom, 1.5, 12) }),
  cycleDimension: (delta) =>
    set((s) => {
      const n = clamp(s.activeDimensions + delta, DIMENSION_RANGE.min, DIMENSION_RANGE.max);
      return {
        activeDimensions: n,
        dimensionT: (n - DIMENSION_RANGE.min) / (DIMENSION_RANGE.max - DIMENSION_RANGE.min),
      };
    }),
  cycleProjection: () =>
    set((s) => {
      const idx = PROJECTIONS.indexOf(s.projectionMethod);
      return { projectionMethod: PROJECTIONS[(idx + 1) % PROJECTIONS.length] };
    }),
  toggleDuality: () =>
    set((s) => ({
      dualityMode: s.dualityMode === "type-i" ? "heterotic-e" : "type-i",
    })),
  toggleHud: () => set((s) => ({ hudVisible: !s.hudVisible })),
  toggleInfoPanel: () => set((s) => ({ infoPanelOpen: !s.infoPanelOpen })),
  resetCamera: () => set({ orbitYaw: 0, orbitPitch: 0, zoom: 4 }),
  setVertexCount: (count) => set({ vertexCount: count }),
  setCursorWorld: (pos) => set({ cursorWorld: pos }),
  setCursorActive: (active) => set({ cursorActive: active }),
  setGpuReady: (ready) => set({ gpuReady: ready }),
}));
