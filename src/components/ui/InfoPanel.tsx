/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useExplorerStore } from "@/stores/explorer-store";
import {
  DIMENSION_INFO,
  DIMENSION_COLORS,
  DIMENSION_RANGE,
  DIMENSION_EQUATIONS,
  DUALITY_INFO,
} from "@/lib/constants";
import { symmetryOrder } from "@/math/symmetry-groups";
import katex from "katex";

function colorToCSS(c: readonly [number, number, number]): string {
  return `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
}

function Equation({ latex }: { latex: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(latex, ref.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [latex]);

  return <div ref={ref} className="overflow-x-auto py-1" />;
}

export default function InfoPanel() {
  const open = useExplorerStore((s) => s.infoPanelOpen);
  const toggleInfoPanel = useExplorerStore((s) => s.toggleInfoPanel);
  const dim = useExplorerStore((s) => s.activeDimensions);
  const mode = useExplorerStore((s) => s.dualityMode);

  const info = DIMENSION_INFO[dim];
  const color = DIMENSION_COLORS[dim - DIMENSION_RANGE.min] ?? [0.5, 0.5, 0.8];
  const css = colorToCSS(color);
  const order = symmetryOrder(dim);
  const equation = DIMENSION_EQUATIONS[dim] ?? "";

  return (
    <>
      {/* Toggle button — always visible */}
      {!open && (
        <button
          onClick={toggleInfoPanel}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border border-white/10 bg-black/50 backdrop-blur-sm flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all font-mono text-xs"
          aria-label="Open info panel"
        >
          i
        </button>
      )}

      {/* Slide-out panel */}
      <div
        className={`absolute top-0 right-0 h-full w-80 border-l border-white/10 bg-black/70 backdrop-blur-xl z-20 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-5 font-mono text-xs">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ color: css }}>
              {info?.label ?? `${dim}D`} Calabi-Yau
            </span>
            <button
              onClick={toggleInfoPanel}
              className="text-zinc-600 hover:text-white transition-colors text-sm"
              aria-label="Close info panel"
            >
              &#x2715;
            </button>
          </div>

          {/* Properties */}
          {info && (
            <div className="space-y-3">
              <Section title="Properties">
                <Row label="Symmetry" value={info.symmetryGroup} />
                <Row label="Topology" value={info.topology} />
                <Row label="Patches" value={`${order} (${dim}\u00B2)`} />
              </Section>

              <Section title="Duality Mode">
                <Row
                  label="Mode"
                  value={DUALITY_INFO[mode].label}
                />
                <p className="text-zinc-500 text-[10px] leading-relaxed mt-1">
                  {DUALITY_INFO[mode].description}
                </p>
                {mode === "type-i" && (
                  <p className="text-zinc-600 text-[10px] leading-relaxed mt-1">
                    Type I strings include both open strings (with endpoints on D-branes)
                    and closed strings, with SO(32) as the gauge symmetry group.
                  </p>
                )}
                {mode === "heterotic-e" && (
                  <p className="text-zinc-600 text-[10px] leading-relaxed mt-1">
                    Heterotic strings combine a 26-dimensional bosonic left-mover
                    with a 10-dimensional superstring right-mover, producing
                    E&#x2088;&times;E&#x2088; gauge symmetry.
                  </p>
                )}
              </Section>

              <Section title="Parametric Equation">
                <div className="bg-white/[0.03] rounded p-2 my-1">
                  <Equation latex={equation} />
                </div>
                <p className="text-zinc-600 text-[10px] leading-relaxed mt-1">
                  Fermat surface with n={dim}, using complex parametrization
                  w&nbsp;=&nbsp;&alpha;&nbsp;+&nbsp;i&beta; projected from
                  &#x211D;&#x2074; to &#x211D;&#x00B3;.
                </p>
              </Section>

              <Section title="Physics">
                <p className="text-zinc-400 text-[10px] leading-relaxed">
                  {info.description}
                </p>
                {dim >= 10 && (
                  <p className="text-zinc-500 text-[10px] leading-relaxed mt-1">
                    In {dim}D, the extra dimensions are compactified on a
                    Calabi-Yau manifold. The topology of this compact space
                    determines the particle spectrum and coupling constants
                    observed in 4D spacetime.
                  </p>
                )}
              </Section>
            </div>
          )}

          {/* 🤫 */}
          <div className="mt-12 mb-6 flex justify-center opacity-[0.15] hover:opacity-[0.3] transition-opacity duration-700">
            <Image
              src="/images/OpossumLogo.png"
              alt=""
              width={48}
              height={48}
              className="grayscale invert"
            />
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-white/5 pt-2">
      <h3 className="text-zinc-500 uppercase tracking-wider text-[9px] mb-1.5">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-zinc-600">{label}</span>
      <span className="text-zinc-300">{value}</span>
    </div>
  );
}
