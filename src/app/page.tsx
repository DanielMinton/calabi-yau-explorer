/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Animated gradient background */}
      <div className="landing-gradient absolute inset-0" />

      {/* Hero section */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="mb-4 text-5xl font-light tracking-tight text-white sm:text-6xl">
            The Calabi-Yau Explorer
          </h1>
          <p className="mb-12 text-lg text-zinc-400">
            Visualizing the Hidden Dimensions of String Theory
          </p>
          <Link
            href="/explorer"
            className="glow-button inline-block rounded-full border border-white/20 px-10 py-3 text-sm font-medium tracking-widest text-white uppercase transition-all hover:border-white/50 hover:bg-white/5"
          >
            Enter
          </Link>
        </div>
      </div>

      {/* About section below the fold */}
      <section className="relative border-t border-white/5 bg-black/30 px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          <div>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
              About
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Calabi-Yau manifolds are compact complex manifolds that play a
              central role in string theory. In theories requiring extra
              dimensions beyond the four we observe (three spatial + time), the
              additional dimensions are &ldquo;compactified&rdquo; — curled up at
              scales far too small to detect directly. The specific topology of
              the Calabi-Yau space determines the particle physics we observe,
              including gauge symmetries, matter content, and coupling constants.
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
              The Math
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              This visualizer generates Fermat surfaces of the form{" "}
              <span className="font-mono text-zinc-300">
                z₁ⁿ + z₂ⁿ = 1
              </span>{" "}
              in ℂ², parametrized via{" "}
              <span className="font-mono text-zinc-300">
                w = α + iβ
              </span>
              . Each dimension n produces n² patches, rendered as a triangulated
              mesh projected from ℝ⁴ to ℝ³ using stereographic, orthographic, or
              perspective projection.
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
              Duality
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              String theory contains multiple consistent formulations connected
              by dualities. Type I strings (with SO(32) gauge symmetry) support
              both open and closed strings, while Heterotic E₈×E₈ strings
              are purely closed with gauge symmetry arising from the left-moving
              sector. This explorer lets you toggle between these perspectives,
              applying a Z₂ orbifold transformation that visibly alters the
              manifold&rsquo;s topology.
            </p>
          </div>

          {/* Author section */}
          <div className="border-t border-white/5 pt-8">
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/images/OpossumLogo.png"
                alt="Daniel Minton"
                width={28}
                height={28}
                className="opacity-80"
              />
              <div>
                <p className="font-mono text-xs text-zinc-400">
                  Built by Daniel Minton
                </p>
                <p className="font-mono text-[10px] text-zinc-600">
                  Full-stack engineer exploring the intersection of physics, GPU computing, and interactive visualization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
