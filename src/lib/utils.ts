/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
/** Clamp a number to the range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
