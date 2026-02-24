/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
import type { DualityMode } from "@/stores/explorer-store";

/** Apply duality transformation to an R⁴ point. Heterotic-E applies Z₂ orbifold (swap + conjugate). */
export function applyDualityTransform(
  point: [number, number, number, number],
  mode: DualityMode
): [number, number, number, number] {
  if (mode === "type-i") {
    return point;
  }

  // Heterotic E₈×E₈: Z₂ orbifold — swap z1↔z2 and conjugate
  // (Re z1, Im z1, Re z2, Im z2) → (Re z2, -Im z2, Re z1, -Im z1)
  return [point[2], -point[3], point[0], -point[1]];
}

/** Return the number of symmetry patches for a Fermat surface of degree n. */
export function symmetryOrder(n: number): number {
  return n * n;
}
