/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
export interface GPUResources {
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

export interface RenderState {
  pipeline: GPURenderPipeline;
  bindGroup: GPUBindGroup;
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
  uniformBuffer: GPUBuffer;
  indexCount: number;
  depthTexture: GPUTexture;
}

export interface ComputeState {
  pipeline: GPUComputePipeline | null;
  bindGroup: GPUBindGroup | null;
  outputBuffer: GPUBuffer | null;
}

export interface Geometry {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  vertexCount: number;
  indexCount: number;
}

/** Uniform buffer layout — must match WGSL struct (std140 alignment). */
export interface UniformData {
  model: Float32Array;      // mat4x4 — 64 bytes, offset 0
  view: Float32Array;       // mat4x4 — 64 bytes, offset 64
  projection: Float32Array; // mat4x4 — 64 bytes, offset 128
  color: [number, number, number]; // vec4 — 16 bytes, offset 192
  lightDir: [number, number, number]; // vec4 — 16 bytes, offset 208
  cursor: [number, number, number, number]; // vec4 — 16 bytes, offset 224 (x, y, z, strength)
  opacity: number;          // f32 — offset 240, padded to 16 bytes → 256 total
  time: number;
}

/** Total uniform buffer size in bytes (must be multiple of 16). */
export const UNIFORM_BUFFER_SIZE = 256; // 3×64 + 4×16
