/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
export const CALABI_YAU_DEFAULT_N = 5;

export const DIMENSION_RANGE = { min: 3, max: 11 } as const;

export enum ProjectionMethod {
  Stereographic = "stereographic",
  Orthographic = "orthographic",
  Perspective = "perspective",
}

export const DIMENSION_COLORS: readonly [number, number, number][] = [
  [0.18, 0.55, 0.84], // 3D — blue
  [0.30, 0.69, 0.31], // 4D — green
  [0.80, 0.56, 0.15], // 5D — amber
  [0.74, 0.21, 0.18], // 6D — red
  [0.56, 0.27, 0.68], // 7D — purple
  [0.16, 0.71, 0.65], // 8D — teal
  [0.85, 0.44, 0.55], // 9D — rose
  [0.39, 0.56, 0.82], // 10D — slate blue
  [0.91, 0.73, 0.26], // 11D — gold
];

export const BACKGROUND_COLOR = { r: 0.04, g: 0.04, b: 0.06, a: 1.0 };

export interface DimensionInfo {
  label: string;
  symmetryGroup: string;
  topology: string;
  description: string;
}

export const DIMENSION_INFO: Record<number, DimensionInfo> = {
  3: {
    label: "3D",
    symmetryGroup: "SU(2)",
    topology: "S\u00B3 / Z_n",
    description: "Minimal Calabi-Yau cross-section in real 3-space.",
  },
  4: {
    label: "4D",
    symmetryGroup: "SU(2) \u00D7 U(1)",
    topology: "K3 surface",
    description: "K3 manifold — the unique compact CY 2-fold.",
  },
  5: {
    label: "5D",
    symmetryGroup: "SU(3)",
    topology: "Quintic threefold",
    description: "Fermat quintic in CP\u2074 — the classic CY 3-fold.",
  },
  6: {
    label: "6D",
    symmetryGroup: "SU(3) \u00D7 SU(2)",
    topology: "CY\u2083 fibration",
    description: "Compactified extra dimensions for Type IIA strings.",
  },
  7: {
    label: "7D",
    symmetryGroup: "G\u2082",
    topology: "G\u2082 holonomy",
    description: "Joyce manifold — exceptional holonomy in M-theory.",
  },
  8: {
    label: "8D",
    symmetryGroup: "Spin(7)",
    topology: "Spin(7) holonomy",
    description: "8-dimensional manifold with Spin(7) holonomy.",
  },
  9: {
    label: "9D",
    symmetryGroup: "SU(4) \u00D7 U(1)",
    topology: "CY\u2084 manifold",
    description: "Calabi-Yau 4-fold used in F-theory compactifications.",
  },
  10: {
    label: "10D",
    symmetryGroup: "E\u2088 \u00D7 E\u2088",
    topology: "Heterotic bundle",
    description: "Full 10D target space of the heterotic string.",
  },
  11: {
    label: "11D",
    symmetryGroup: "E\u2088",
    topology: "M-theory bulk",
    description: "11-dimensional M-theory with CY\u2085 compactification.",
  },
};

export const DUALITY_INFO = {
  "type-i": {
    label: "Type I",
    description: "Open + closed strings, SO(32) gauge group",
  },
  "heterotic-e": {
    label: "Heterotic E",
    description: "Closed strings only, E\u2088\u00D7E\u2088 gauge group",
  },
} as const;

export const DIMENSION_LABELS: Record<number, string> = {
  3: "Euclidean Space",
  4: "Spacetime",
  5: "Kaluza-Klein",
  6: "Calabi-Yau",
  7: "G\u2082 Manifold",
  8: "Spin(7)",
  9: "F-Theory",
  10: "Superstring",
  11: "M-Theory",
};

export const DIMENSION_EQUATIONS: Record<number, string> = {
  3: "z_1^n + z_2^n = 1 \\subset \\mathbb{C}^2 \\to \\mathbb{R}^3",
  4: "\\text{K3}: \\; z_1^4 + z_2^4 + z_3^4 + z_4^4 = 0 \\subset \\mathbb{CP}^3",
  5: "\\sum_{i=0}^{4} z_i^5 = 0 \\subset \\mathbb{CP}^4",
  6: "c_1(X) = 0, \\quad \\text{SU}(3) \\text{ holonomy}",
  7: "\\nabla \\varphi = 0, \\quad G_2 \\text{ holonomy}",
  8: "\\nabla \\Phi = 0, \\quad \\text{Spin}(7) \\text{ holonomy}",
  9: "\\text{CY}_4 \\text{ with } \\text{SU}(4) \\text{ holonomy}",
  10: "E_8 \\times E_8 \\text{ or } \\text{SO}(32) \\text{ gauge bundle}",
  11: "S^1 / \\mathbb{Z}_2 \\times \\text{CY}_5 \\text{ compactification}",
};
