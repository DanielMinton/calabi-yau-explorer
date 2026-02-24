/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

export default function FallbackNotice() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0f]">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          WebGPU Not Available
        </h2>
        <p className="text-zinc-400">
          This application requires WebGPU, which is available in recent
          versions of Chrome. Please update your browser or enable WebGPU in
          your browser flags.
        </p>
      </div>
    </div>
  );
}
