/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useState } from "react";
import Image from "next/image";

export default function Footer() {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-black/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
        {/* Left — Logo */}
        <div className="flex items-center">
          <Image
            src="/images/OpossumLogo.png"
            alt="Daniel Minton"
            width={32}
            height={32}
            className="opacity-70 transition-opacity hover:opacity-100"
          />
        </div>

        {/* Center — Copyright */}
        <p className="font-mono text-[10px] text-zinc-600 sm:text-xs">
          &copy; 2026 Daniel Minton. All rights reserved.
        </p>

        {/* Right — Contact */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setShowPhone(true)}
          onMouseLeave={() => setShowPhone(false)}
        >
          <a
            href="mailto:daniel_minton@icloud.com"
            className="font-mono text-[10px] text-zinc-600 transition-colors hover:text-zinc-300 sm:text-xs"
          >
            Available for engineering opportunities
          </a>
          {/* Phone tooltip on hover */}
          <div
            className={`absolute bottom-full right-0 mb-2 rounded border border-white/10 bg-black/80 px-2 py-1 font-mono text-[10px] text-zinc-400 backdrop-blur-sm transition-all ${
              showPhone
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1 pointer-events-none"
            }`}
          >
            <a href="tel:+17276566448" className="hover:text-zinc-200">
              727.656.6448
            </a>
          </div>
        </div>
      </div>

      {/* Mobile stacked layout */}
      <style jsx>{`
        @media (max-width: 639px) {
          footer > div {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
