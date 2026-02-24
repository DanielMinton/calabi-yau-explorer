/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
import { starfieldVertexCode, starfieldFragmentCode } from "../shaders/starfield";
import type { GPUResources } from "../types";

export interface StarfieldState {
  pipeline: GPURenderPipeline;
  bindGroup: GPUBindGroup;
  uniformBuffer: GPUBuffer;
}

/** Size of the starfield uniform buffer in bytes (aligned to 16). */
const STAR_UNIFORM_SIZE = 16; // yaw, pitch, time, _pad

/** Create the starfield background render pipeline. */
export function createStarfieldPipeline(gpu: GPUResources): StarfieldState {
  const { device, format } = gpu;

  const vertModule = device.createShaderModule({ code: starfieldVertexCode });
  const fragModule = device.createShaderModule({ code: starfieldFragmentCode });

  const uniformBuffer = device.createBuffer({
    size: STAR_UNIFORM_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
    ],
  });

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
    vertex: {
      module: vertModule,
      entryPoint: "main",
    },
    fragment: {
      module: fragModule,
      entryPoint: "main",
      targets: [{ format }],
    },
    primitive: { topology: "triangle-list" },
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer, size: STAR_UNIFORM_SIZE } },
    ],
  });

  return { pipeline, bindGroup, uniformBuffer };
}

/** Write starfield uniforms. */
export function writeStarfieldUniforms(
  device: GPUDevice,
  buffer: GPUBuffer,
  yaw: number,
  pitch: number,
  time: number
): void {
  const data = new Float32Array([yaw, pitch, time, 0]);
  device.queue.writeBuffer(buffer, 0, data);
}

/** Render the starfield background (no depth). */
export function renderStarfield(
  gpu: GPUResources,
  state: StarfieldState
): void {
  const texture = gpu.context.getCurrentTexture();
  const view = texture.createView();

  const encoder = gpu.device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view,
        clearValue: { r: 0.039, g: 0.039, b: 0.059, a: 1.0 },
        loadOp: "clear" as const,
        storeOp: "store" as const,
      },
    ],
  });

  pass.setPipeline(state.pipeline);
  pass.setBindGroup(0, state.bindGroup);
  pass.draw(3); // Full-screen triangle
  pass.end();

  gpu.device.queue.submit([encoder.finish()]);
}
