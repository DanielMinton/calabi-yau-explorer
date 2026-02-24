/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useCallback, useRef } from "react";
import { useExplorerStore } from "@/stores/explorer-store";
import {
  DIMENSION_RANGE,
  DIMENSION_COLORS,
  DIMENSION_LABELS,
} from "@/lib/constants";

const MIN = DIMENSION_RANGE.min;
const MAX = DIMENSION_RANGE.max;
const STEPS = MAX - MIN;

function colorToCSS(c: readonly [number, number, number]): string {
  return `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
}

function lerpColor(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function getColorForT(t: number): [number, number, number] {
  const idx = t * (DIMENSION_COLORS.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, DIMENSION_COLORS.length - 1);
  const frac = idx - lo;
  return lerpColor(DIMENSION_COLORS[lo], DIMENSION_COLORS[hi], frac);
}

export default function DimensionSlider() {
  const dim = useExplorerStore((s) => s.activeDimensions);
  const dimensionT = useExplorerStore((s) => s.dimensionT);
  const setDimensionT = useExplorerStore((s) => s.setDimensionT);
  const setActiveDimensions = useExplorerStore((s) => s.setActiveDimensions);

  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const positionFromEvent = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    []
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const t = positionFromEvent(e.clientX);
      setDimensionT(t);
    },
    [positionFromEvent, setDimensionT]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const t = positionFromEvent(e.clientX);
      setDimensionT(t);
    },
    [positionFromEvent, setDimensionT]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveDimensions(Math.min(dim + 1, MAX));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveDimensions(Math.max(dim - 1, MIN));
      }
    },
    [dim, setActiveDimensions]
  );

  const thumbColor = getColorForT(dimensionT);
  const thumbCSS = colorToCSS(thumbColor);
  const leftPercent = `${dimensionT * 100}%`;
  const label = DIMENSION_LABELS[dim] ?? "";

  return (
    <div className="w-full select-none">
      {/* Track + thumb */}
      <div
        ref={trackRef}
        className="relative h-10 cursor-pointer"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="slider"
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={dim}
        aria-label="Spatial dimensions"
      >
        {/* Gradient track line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 rounded-full"
          style={{
            background: `linear-gradient(to right, ${colorToCSS(DIMENSION_COLORS[0])}, ${colorToCSS(DIMENSION_COLORS[4])}, ${colorToCSS(DIMENSION_COLORS[8])})`,
          }}
        />

        {/* Tick marks */}
        {Array.from({ length: STEPS + 1 }, (_, i) => {
          const t = i / STEPS;
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-x-1/2"
              style={{ left: `${t * 100}%` }}
            >
              <div className="h-2 w-[1px] -mt-1 bg-white/20" />
            </div>
          );
        })}

        {/* Glowing thumb */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-[left] duration-75"
          style={{ left: leftPercent }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold text-black/90"
            style={{
              backgroundColor: thumbCSS,
              boxShadow: `0 0 12px ${thumbCSS}, 0 0 24px ${thumbCSS}40`,
            }}
          >
            {dim}
          </div>
        </div>
      </div>

      {/* Tick labels */}
      <div className="relative h-4 -mt-1">
        {Array.from({ length: STEPS + 1 }, (_, i) => {
          const d = MIN + i;
          const t = i / STEPS;
          const isActive = d === dim;
          return (
            <span
              key={d}
              className={`absolute -translate-x-1/2 font-mono transition-colors ${
                isActive ? "text-white text-[11px]" : "text-zinc-600 text-[9px]"
              }`}
              style={{ left: `${t * 100}%` }}
            >
              {d}D
            </span>
          );
        })}
      </div>

      {/* Dimension label */}
      <div
        className="text-center font-mono text-[11px] mt-1 transition-colors"
        style={{ color: thumbCSS }}
      >
        {label}
      </div>
    </div>
  );
}
