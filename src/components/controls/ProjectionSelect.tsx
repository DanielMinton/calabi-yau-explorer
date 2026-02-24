/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useExplorerStore } from "@/stores/explorer-store";
import { ProjectionMethod } from "@/lib/constants";

const OPTIONS = [
  { value: ProjectionMethod.Stereographic, label: "Stereographic" },
  { value: ProjectionMethod.Orthographic, label: "Orthographic" },
  { value: ProjectionMethod.Perspective, label: "Perspective" },
];

export default function ProjectionSelect() {
  const method = useExplorerStore((s) => s.projectionMethod);
  const setMethod = useExplorerStore((s) => s.setProjectionMethod);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
        Projection
      </label>
      <div className="flex rounded-md overflow-hidden border border-white/10">
        {OPTIONS.map((opt) => {
          const active = opt.value === method;
          return (
            <button
              key={opt.value}
              onClick={() => setMethod(opt.value)}
              className={`flex-1 px-2 py-1.5 text-[10px] font-mono transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "bg-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
