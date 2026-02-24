# The Calabi-Yau Explorer

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Interactive WebGPU visualization of Calabi-Yau manifolds — the hidden dimensions of string theory. Explore Fermat surfaces from 3D to 11D with real-time rendering, duality mode toggling, and audio synthesis driven by the manifold's geometry.

![Screenshot](public/images/screenshot.png)
<!-- TODO: Add screenshot -->

## Tech Stack

- **Next.js** (App Router) + **TypeScript** + **React**
- **WebGPU** — pure GPU rendering with custom **WGSL** shaders (no Three.js)
- **Zustand** — lightweight state management
- **KaTeX** — LaTeX equation rendering
- **Tailwind CSS v4** — styling
- **Web Audio API** — oscillator synthesis with real-time oscilloscope

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a WebGPU-capable browser.

## Browser Requirements

WebGPU is required:

- **Chrome 113+** (recommended)
- **Edge 113+**
- **Safari 18+** (partial support)
- **Firefox Nightly** (behind a flag)

Best experience on Chrome with macOS / Apple Silicon.

## The Physics

Calabi-Yau manifolds are compact complex manifolds central to string theory. In theories requiring extra spatial dimensions beyond the four we observe, the additional dimensions are "compactified" on a Calabi-Yau space. The topology of this compact space determines the particle physics we observe — gauge symmetries, matter content, and coupling constants.

This explorer renders **Fermat surfaces** defined by:

```
z₁ⁿ + z₂ⁿ = 1,  z₁, z₂ ∈ ℂ
```

Parametrized via w = α + iβ:

```
z₁ = e^(2πik₁/n) · cos(w)^(2/n)
z₂ = e^(2πik₂/n) · sin(w)^(2/n)
```

Each dimension **n** (3–11) produces **n²** patches, projected from ℝ⁴ → ℝ³ via stereographic, orthographic, or perspective projection.

**Duality modes** toggle between Type I (SO(32) gauge symmetry, open + closed strings) and Heterotic E₈×E₈ (closed strings only), applying a Z₂ orbifold transformation that visibly alters the manifold's topology.

## Controls

| Key | Action |
| --- | --- |
| **Space** | Play / pause rotation |
| **← →** | Cycle dimensions |
| **↑ ↓** | Adjust rotation speed |
| **1–9** | Jump to dimension 3–11 |
| **D** | Toggle duality mode |
| **P** | Cycle projection method |
| **S** | Toggle audio synthesis |
| **H** | Toggle HUD |
| **I** | Toggle info panel |
| **R** | Reset camera |

Mouse drag to orbit. Scroll to zoom. Hover for gravitational vertex pull.

## Architecture

```
src/
├── app/              # Next.js routes (landing + explorer)
├── components/
│   ├── canvas/       # WebGPU canvas, renderer, fallback
│   ├── controls/     # Slider, toggles, synth, keyboard handler
│   └── ui/           # HUD, info panel, loading overlay, footer
├── gpu/
│   ├── pipelines/    # Render + starfield pipeline setup
│   ├── shaders/      # WGSL vertex, fragment, starfield shaders
│   ├── buffers.ts    # Vertex/index/uniform buffer management
│   ├── init.ts       # WebGPU device initialization
│   └── types.ts      # GPU resource interfaces
├── lib/              # Constants, utilities
├── math/             # Matrix ops, Calabi-Yau mesh generation, projections
└── stores/           # Zustand explorer store
```

## License

MIT

---

Created by [Daniel Minton](https://github.com/DanielMinton)
