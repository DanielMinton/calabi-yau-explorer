/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
import { ProjectionMethod } from "@/lib/constants";
import { projectR4toR3 } from "./projections";
import { applyDualityTransform } from "./symmetry-groups";
import type { DualityMode } from "@/stores/explorer-store";

export interface CalabiYauGeometry {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  vertexCount: number;
  indexCount: number;
}

/**
 * Complex power: (r, θ)^(2/n) → (r^(2/n), 2θ/n)
 * Returns [re, im] of the result.
 */
function complexPow2overN(
  re: number,
  im: number,
  n: number
): [number, number] {
  const r = Math.sqrt(re * re + im * im);
  if (r < 1e-12) return [0, 0];
  const theta = Math.atan2(im, re);
  const newR = Math.pow(r, 2.0 / n);
  const newTheta = (2.0 * theta) / n;
  return [newR * Math.cos(newTheta), newR * Math.sin(newTheta)];
}

/**
 * Generate a triangulated mesh for a Calabi-Yau Fermat surface z1^n + z2^n = 1.
 * Produces n² patches parametrized by (α, β), projected from R⁴ to R³.
 */
export function generateCalabiYauMesh(
  n: number,
  resolution: number = 24,
  projection: ProjectionMethod = ProjectionMethod.Stereographic,
  dualityMode: DualityMode = "type-i"
): CalabiYauGeometry {
  const patches: { pos: [number, number, number]; }[][] = [];

  const alphaSteps = resolution;
  const betaSteps = resolution;

  const alphaMin = 0.01;
  const alphaMax = Math.PI / 2 - 0.01;
  const betaRange = 1.2;

  for (let k1 = 0; k1 < n; k1++) {
    for (let k2 = 0; k2 < n; k2++) {
      const patchVerts: { pos: [number, number, number] }[] = [];

      const phaseK1Re = Math.cos((2 * Math.PI * k1) / n);
      const phaseK1Im = Math.sin((2 * Math.PI * k1) / n);
      const phaseK2Re = Math.cos((2 * Math.PI * k2) / n);
      const phaseK2Im = Math.sin((2 * Math.PI * k2) / n);

      for (let ai = 0; ai <= alphaSteps; ai++) {
        const alpha = alphaMin + (ai / alphaSteps) * (alphaMax - alphaMin);

        for (let bi = 0; bi <= betaSteps; bi++) {
          const beta =
            -betaRange + (bi / betaSteps) * (2 * betaRange);

          // cos(α + iβ) = cos(α)cosh(β) - i·sin(α)sinh(β)
          const cosRe = Math.cos(alpha) * Math.cosh(beta);
          const cosIm = -Math.sin(alpha) * Math.sinh(beta);

          // sin(α + iβ) = sin(α)cosh(β) + i·cos(α)sinh(β)
          const sinRe = Math.sin(alpha) * Math.cosh(beta);
          const sinIm = Math.cos(alpha) * Math.sinh(beta);

          // cos(w)^(2/n)
          const [c2nRe, c2nIm] = complexPow2overN(cosRe, cosIm, n);
          // sin(w)^(2/n)
          const [s2nRe, s2nIm] = complexPow2overN(sinRe, sinIm, n);

          // z1 = phase_k1 · cos(w)^(2/n)
          const z1Re = phaseK1Re * c2nRe - phaseK1Im * c2nIm;
          const z1Im = phaseK1Re * c2nIm + phaseK1Im * c2nRe;

          // z2 = phase_k2 · sin(w)^(2/n)
          const z2Re = phaseK2Re * s2nRe - phaseK2Im * s2nIm;
          const z2Im = phaseK2Re * s2nIm + phaseK2Im * s2nRe;

          // R^4 point: (Re z1, Im z1, Re z2, Im z2)
          let p4: [number, number, number, number] = [
            z1Re,
            z1Im,
            z2Re,
            z2Im,
          ];

          p4 = applyDualityTransform(p4, dualityMode);
          const pos = projectR4toR3(p4, projection);
          patchVerts.push({ pos });
        }
      }

      patches.push(patchVerts);
    }
  }

  // Total vertices and indices
  const vertsPerPatch = (alphaSteps + 1) * (betaSteps + 1);
  const totalVerts = patches.length * vertsPerPatch;
  const quadsPerPatch = alphaSteps * betaSteps;
  const totalIndices = patches.length * quadsPerPatch * 6;

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const indices = new Uint32Array(totalIndices);

  // Fill positions
  let vi = 0;
  for (const patch of patches) {
    for (const vert of patch) {
      positions[vi * 3] = vert.pos[0];
      positions[vi * 3 + 1] = vert.pos[1];
      positions[vi * 3 + 2] = vert.pos[2];
      vi++;
    }
  }

  // Fill indices
  let ii = 0;
  const stride = betaSteps + 1;
  for (let p = 0; p < patches.length; p++) {
    const base = p * vertsPerPatch;
    for (let ai = 0; ai < alphaSteps; ai++) {
      for (let bi = 0; bi < betaSteps; bi++) {
        const i0 = base + ai * stride + bi;
        const i1 = i0 + 1;
        const i2 = i0 + stride;
        const i3 = i2 + 1;

        indices[ii++] = i0;
        indices[ii++] = i2;
        indices[ii++] = i1;
        indices[ii++] = i1;
        indices[ii++] = i2;
        indices[ii++] = i3;
      }
    }
  }

  // Compute normals from face normals (averaged per vertex)
  computeNormals(positions, indices, normals);

  return {
    positions,
    normals,
    indices,
    vertexCount: totalVerts,
    indexCount: totalIndices,
  };
}

function computeNormals(
  positions: Float32Array,
  indices: Uint32Array,
  normals: Float32Array
): void {
  // Accumulate face normals onto vertices
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i];
    const i1 = indices[i + 1];
    const i2 = indices[i + 2];

    const ax = positions[i1 * 3] - positions[i0 * 3];
    const ay = positions[i1 * 3 + 1] - positions[i0 * 3 + 1];
    const az = positions[i1 * 3 + 2] - positions[i0 * 3 + 2];

    const bx = positions[i2 * 3] - positions[i0 * 3];
    const by = positions[i2 * 3 + 1] - positions[i0 * 3 + 1];
    const bz = positions[i2 * 3 + 2] - positions[i0 * 3 + 2];

    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;

    for (const idx of [i0, i1, i2]) {
      normals[idx * 3] += nx;
      normals[idx * 3 + 1] += ny;
      normals[idx * 3 + 2] += nz;
    }
  }

  // Normalize
  for (let i = 0; i < normals.length; i += 3) {
    const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]);
    if (len > 1e-8) {
      normals[i] /= len;
      normals[i + 1] /= len;
      normals[i + 2] /= len;
    }
  }
}
