/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useExplorerStore } from "@/stores/explorer-store";

export default function DualityToggle() {
  const mode = useExplorerStore((s) => s.dualityMode);
  const toggleDuality = useExplorerStore((s) => s.toggleDuality);

  const isTypeI = mode === "type-i";

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleDuality}
        className="relative w-full h-12 rounded-full border border-white/10 bg-white/[0.03] overflow-hidden cursor-pointer"
        aria-label={`Duality mode: ${isTypeI ? "Type I" : "Heterotic E"}`}
      >
        {/* Sliding glow pill */}
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-in-out"
          style={{
            left: isTypeI ? "4px" : "calc(50%)",
            background: isTypeI
              ? "radial-gradient(ellipse at center, rgba(70,140,255,0.25), rgba(70,140,255,0.08))"
              : "radial-gradient(ellipse at center, rgba(200,130,255,0.25), rgba(200,130,255,0.08))",
            boxShadow: isTypeI
              ? "0 0 16px rgba(70,140,255,0.2)"
              : "0 0 16px rgba(200,130,255,0.2)",
          }}
        />

        {/* Labels */}
        <div className="relative flex h-full">
          <div
            className={`flex-1 flex flex-col items-center justify-center transition-colors duration-300 ${
              isTypeI ? "text-white" : "text-zinc-600"
            }`}
          >
            <span className="text-[11px] font-mono font-semibold leading-none">
              Type I
            </span>
            <span className="text-[9px] font-mono leading-none mt-0.5 opacity-60">
              SO(32)
            </span>
          </div>
          <div
            className={`flex-1 flex flex-col items-center justify-center transition-colors duration-300 ${
              !isTypeI ? "text-white" : "text-zinc-600"
            }`}
          >
            <span className="text-[11px] font-mono font-semibold leading-none">
              Heterotic-E
            </span>
            <span className="text-[9px] font-mono leading-none mt-0.5 opacity-60">
              E&#x2088; &times; E&#x2088;
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
