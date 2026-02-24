/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
import type { Geometry } from "./types";
import { UNIFORM_BUFFER_SIZE } from "./types";

export interface MeshBuffers {
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
  indexCount: number;
}

/**
 * Create interleaved vertex buffer (position + normal) and index buffer.
 * Vertex layout: [px, py, pz, nx, ny, nz] per vertex — 24 bytes stride.
 */
export function createMeshBuffers(
  device: GPUDevice,
  geometry: Geometry
): MeshBuffers {
  const floatsPerVertex = 6; // pos(3) + normal(3)
  const interleaved = new Float32Array(
    geometry.vertexCount * floatsPerVertex
  );

  for (let i = 0; i < geometry.vertexCount; i++) {
    const vi = i * floatsPerVertex;
    const pi = i * 3;
    interleaved[vi] = geometry.positions[pi];
    interleaved[vi + 1] = geometry.positions[pi + 1];
    interleaved[vi + 2] = geometry.positions[pi + 2];
    interleaved[vi + 3] = geometry.normals[pi];
    interleaved[vi + 4] = geometry.normals[pi + 1];
    interleaved[vi + 5] = geometry.normals[pi + 2];
  }

  const vertexBuffer = device.createBuffer({
    size: interleaved.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Float32Array(vertexBuffer.getMappedRange()).set(interleaved);
  vertexBuffer.unmap();

  const indexBuffer = device.createBuffer({
    size: geometry.indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  new Uint32Array(indexBuffer.getMappedRange()).set(geometry.indices);
  indexBuffer.unmap();

  return {
    vertexBuffer,
    indexBuffer,
    indexCount: geometry.indexCount,
  };
}

/** Create a GPU uniform buffer sized for the manifold shader uniforms. */
export function createUniformBuffer(device: GPUDevice): GPUBuffer {
  return device.createBuffer({
    size: UNIFORM_BUFFER_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
}

/** Write all uniform values to the GPU buffer (model/view/proj matrices, lighting, cursor, opacity). */
export function writeUniforms(
  device: GPUDevice,
  buffer: GPUBuffer,
  model: Float32Array,
  view: Float32Array,
  projection: Float32Array,
  color: [number, number, number],
  lightDir: [number, number, number],
  cursor: [number, number, number, number],
  opacity: number,
  time: number
): void {
  const data = new ArrayBuffer(UNIFORM_BUFFER_SIZE);
  const f32 = new Float32Array(data);

  // model mat4 — offset 0 (16 floats)
  f32.set(model, 0);
  // view mat4 — offset 16 (16 floats)
  f32.set(view, 16);
  // projection mat4 — offset 32 (16 floats)
  f32.set(projection, 32);
  // color vec4 — offset 48 (4 floats, w=0)
  f32[48] = color[0];
  f32[49] = color[1];
  f32[50] = color[2];
  f32[51] = 0;
  // lightDir vec4 — offset 52 (4 floats, w=time)
  f32[52] = lightDir[0];
  f32[53] = lightDir[1];
  f32[54] = lightDir[2];
  f32[55] = time;
  // cursor vec4 — offset 56 (4 floats: x, y, z, strength)
  f32[56] = cursor[0];
  f32[57] = cursor[1];
  f32[58] = cursor[2];
  f32[59] = cursor[3];
  // opacity + padding — offset 60 (4 floats, only first used)
  f32[60] = opacity;
  f32[61] = 0;
  f32[62] = 0;
  f32[63] = 0;

  device.queue.writeBuffer(buffer, 0, data);
}
