/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
import { ProjectionMethod } from "@/lib/constants";

/**
 * Project a 4D point to 3D using the specified projection method.
 * @param point - The R⁴ coordinates [x, y, z, w].
 * @param method - Stereographic, orthographic, or perspective projection.
 */
export function projectR4toR3(
  point: [number, number, number, number],
  method: ProjectionMethod = ProjectionMethod.Stereographic
): [number, number, number] {
  switch (method) {
    case ProjectionMethod.Stereographic: {
      const w = point[3];
      const denom = 1.0 - w * 0.5;
      const scale = denom !== 0 ? 1.0 / denom : 1.0;
      return [point[0] * scale, point[1] * scale, point[2] * scale];
    }
    case ProjectionMethod.Orthographic:
      return [point[0], point[1], point[2]];
    case ProjectionMethod.Perspective: {
      const d = 4.0;
      const w = point[3];
      const scale = d / (d - w);
      return [point[0] * scale, point[1] * scale, point[2] * scale];
    }
  }
}
