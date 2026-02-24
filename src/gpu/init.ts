/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
import type { GPUResources } from "./types";

/**
 * Initialize WebGPU: request adapter, device, and configure canvas context.
 * @throws If WebGPU is unavailable or the adapter/device cannot be obtained.
 */
export async function initWebGPU(
  canvas: HTMLCanvasElement
): Promise<GPUResources> {
  if (!navigator.gpu) {
    throw new Error(
      "WebGPU is not supported in this browser. Please use a recent version of Chrome."
    );
  }

  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });

  if (!adapter) {
    throw new Error(
      "Failed to obtain a WebGPU adapter. Your GPU may not be supported."
    );
  }

  const device = await adapter.requestDevice({
    requiredFeatures: [],
    requiredLimits: {},
  });

  device.lost.then((info) => {
    console.error(`WebGPU device was lost: ${info.message}`);
    if (info.reason !== "destroyed") {
      console.error("Unexpected device loss — may need to reinitialize.");
    }
  });

  const context = canvas.getContext("webgpu");
  if (!context) {
    throw new Error("Failed to get WebGPU canvas context.");
  }

  const format: GPUTextureFormat = "bgra8unorm";

  context.configure({
    device,
    format,
    alphaMode: "premultiplied",
  });

  return { device, context, format };
}
