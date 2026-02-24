/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
import { vertexShaderCode } from "../shaders/vertex";
import { fragmentShaderCode } from "../shaders/fragment";
import type { GPUResources, RenderState } from "../types";
import { UNIFORM_BUFFER_SIZE } from "../types";
import type { MeshBuffers } from "../buffers";

/** Create the main manifold render pipeline with alpha blending for fade-in. */
export function createRenderPipeline(
  gpu: GPUResources,
  meshBuffers: MeshBuffers,
  uniformBuffer: GPUBuffer,
  canvasWidth: number,
  canvasHeight: number
): RenderState {
  const { device, format } = gpu;

  const vertexModule = device.createShaderModule({
    code: vertexShaderCode,
  });
  const fragmentModule = device.createShaderModule({
    code: fragmentShaderCode,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: vertexModule,
      entryPoint: "main",
      buffers: [
        {
          arrayStride: 24, // 6 floats × 4 bytes
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: "float32x3" as GPUVertexFormat,
            },
            {
              shaderLocation: 1,
              offset: 12,
              format: "float32x3" as GPUVertexFormat,
            },
          ],
        },
      ],
    },
    fragment: {
      module: fragmentModule,
      entryPoint: "main",
      targets: [
        {
          format,
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
          },
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "none",
    },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: { buffer: uniformBuffer, size: UNIFORM_BUFFER_SIZE },
      },
    ],
  });

  const depthTexture = device.createTexture({
    size: [canvasWidth, canvasHeight],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  return {
    pipeline,
    bindGroup,
    vertexBuffer: meshBuffers.vertexBuffer,
    indexBuffer: meshBuffers.indexBuffer,
    uniformBuffer,
    indexCount: meshBuffers.indexCount,
    depthTexture,
  };
}

/** Render the manifold (loads existing color attachment, does not clear). */
export function renderFrame(
  gpu: GPUResources,
  state: RenderState
): void {
  const texture = gpu.context.getCurrentTexture();
  const view = texture.createView();
  const depthView = state.depthTexture.createView();

  const encoder = gpu.device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view,
        loadOp: "load" as const,
        storeOp: "store" as const,
      },
    ],
    depthStencilAttachment: {
      view: depthView,
      depthClearValue: 1.0,
      depthLoadOp: "clear" as const,
      depthStoreOp: "store" as const,
    },
  });

  pass.setPipeline(state.pipeline);
  pass.setBindGroup(0, state.bindGroup);
  pass.setVertexBuffer(0, state.vertexBuffer);
  pass.setIndexBuffer(state.indexBuffer, "uint32");
  pass.drawIndexed(state.indexCount);
  pass.end();

  gpu.device.queue.submit([encoder.finish()]);
}
