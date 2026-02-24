/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { initWebGPU } from "@/gpu/init";
import type { GPUResources, RenderState } from "@/gpu/types";
import { DIMENSION_COLORS } from "@/lib/constants";
import { generateCalabiYauMesh } from "@/math/calabi-yau";
import {
  createMeshBuffers,
  createUniformBuffer,
  writeUniforms,
} from "@/gpu/buffers";
import { createRenderPipeline, renderFrame } from "@/gpu/pipelines/render";
import {
  createStarfieldPipeline,
  writeStarfieldUniforms,
  renderStarfield,
} from "@/gpu/pipelines/starfield";
import type { StarfieldState } from "@/gpu/pipelines/starfield";
import * as mat4 from "@/math/mat4";
import { useExplorerStore } from "@/stores/explorer-store";
import FallbackNotice from "./FallbackNotice";

/** Determine mesh resolution based on dimension and zoom level. */
function getLODResolution(dim: number, zoom: number): number {
  // Base resolution by dimension complexity
  const base = dim <= 5 ? 24 : dim <= 7 ? 16 : 12;
  // Boost when zoomed in, reduce when zoomed out
  if (zoom < 2.5) return Math.min(base + 8, 32);
  if (zoom > 7) return Math.max(base - 4, 8);
  return base;
}

export default function WebGPUCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gpuRef = useRef<GPUResources | null>(null);
  const renderStateRef = useRef<RenderState | null>(null);
  const starfieldRef = useRef<StarfieldState | null>(null);
  const rafRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);

  const activeDimensions = useExplorerStore((s) => s.activeDimensions);
  const dualityMode = useExplorerStore((s) => s.dualityMode);
  const projectionMethod = useExplorerStore((s) => s.projectionMethod);
  const isPlaying = useExplorerStore((s) => s.isPlaying);
  const rotationSpeed = useExplorerStore((s) => s.rotationSpeed);
  const zoom = useExplorerStore((s) => s.zoom);
  const orbitYaw = useExplorerStore((s) => s.orbitYaw);
  const orbitPitch = useExplorerStore((s) => s.orbitPitch);
  const setFps = useExplorerStore((s) => s.setFps);
  const setVertexCount = useExplorerStore((s) => s.setVertexCount);
  const addOrbit = useExplorerStore((s) => s.addOrbit);
  const setZoom = useExplorerStore((s) => s.setZoom);
  const setGpuReady = useExplorerStore((s) => s.setGpuReady);

  // Refs for the render loop
  const dimensionsRef = useRef(activeDimensions);
  const dualityRef = useRef(dualityMode);
  const projectionRef = useRef(projectionMethod);
  const playingRef = useRef(isPlaying);
  const speedRef = useRef(rotationSpeed);
  const zoomRef = useRef(zoom);
  const orbitYawRef = useRef(orbitYaw);
  const orbitPitchRef = useRef(orbitPitch);
  dimensionsRef.current = activeDimensions;
  dualityRef.current = dualityMode;
  projectionRef.current = projectionMethod;
  playingRef.current = isPlaying;
  speedRef.current = rotationSpeed;
  zoomRef.current = zoom;
  orbitYawRef.current = orbitYaw;
  orbitPitchRef.current = orbitPitch;

  // Rebuild geometry when mesh-affecting parameters change
  const needsRebuildRef = useRef(true);
  const prevParamsRef = useRef({
    dim: activeDimensions,
    duality: dualityMode,
    projection: projectionMethod,
    lodRes: 0,
  });
  const currentLOD = getLODResolution(activeDimensions, zoom);
  if (
    prevParamsRef.current.dim !== activeDimensions ||
    prevParamsRef.current.duality !== dualityMode ||
    prevParamsRef.current.projection !== projectionMethod ||
    prevParamsRef.current.lodRes !== currentLOD
  ) {
    prevParamsRef.current = {
      dim: activeDimensions,
      duality: dualityMode,
      projection: projectionMethod,
      lodRes: currentLOD,
    };
    needsRebuildRef.current = true;
  }

  // Mouse drag for orbit
  const draggingRef = useRef(false);
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);
  // Cursor position in NDC for gravitational pull
  const cursorNDCRef = useRef<[number, number]>([0, 0]);
  const cursorActiveRef = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      draggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        cursorNDCRef.current = [nx, ny];
        cursorActiveRef.current = true;
      }

      if (!draggingRef.current || !lastMouseRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      addOrbit(dx * 0.005, dy * 0.005);
    },
    [addOrbit]
  );

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
    lastMouseRef.current = null;
  }, []);

  const onPointerLeave = useCallback(() => {
    cursorActiveRef.current = false;
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setZoom(zoomRef.current + e.deltaY * 0.005);
    },
    [setZoom]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;
    // Track old buffers for cleanup on geometry rebuild
    let prevVertexBuffer: GPUBuffer | null = null;
    let prevIndexBuffer: GPUBuffer | null = null;

    async function setup() {
      try {
        const gpu = await initWebGPU(canvas!);
        if (destroyed) {
          gpu.device.destroy();
          return;
        }
        gpuRef.current = gpu;

        // Create starfield pipeline
        starfieldRef.current = createStarfieldPipeline(gpu);

        rebuildAndStartLoop(gpu);
        setGpuReady(true);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "WebGPU initialization failed"
        );
      }
    }

    function rebuildGeometry(gpu: GPUResources): RenderState {
      const dim = dimensionsRef.current;
      const resolution = getLODResolution(dim, zoomRef.current);
      const geometry = generateCalabiYauMesh(
        dim,
        resolution,
        projectionRef.current,
        dualityRef.current
      );

      // Destroy old mesh buffers to prevent GPU memory leaks
      if (prevVertexBuffer) prevVertexBuffer.destroy();
      if (prevIndexBuffer) prevIndexBuffer.destroy();

      const meshBuffers = createMeshBuffers(gpu.device, geometry);
      prevVertexBuffer = meshBuffers.vertexBuffer;
      prevIndexBuffer = meshBuffers.indexBuffer;

      const uniformBuffer = renderStateRef.current
        ? renderStateRef.current.uniformBuffer
        : createUniformBuffer(gpu.device);

      const w = canvas!.width;
      const h = canvas!.height;

      if (renderStateRef.current) {
        renderStateRef.current.depthTexture.destroy();
      }

      const state = createRenderPipeline(
        gpu,
        meshBuffers,
        uniformBuffer,
        w || 1,
        h || 1
      );
      renderStateRef.current = state;
      needsRebuildRef.current = false;
      setVertexCount(geometry.vertexCount);
      return state;
    }

    function rebuildAndStartLoop(gpu: GPUResources) {
      let state = rebuildGeometry(gpu);
      let lastTime = performance.now();
      let frameCount = 0;
      let fpsAccum = 0;
      let autoAngle = 0;
      // Fade-in opacity: ramps from 0→1 over ~1.5s after init
      let opacity = 0;
      const FADE_DURATION = 1.5;

      function frame(now: number) {
        if (destroyed) return;

        const dt = (now - lastTime) / 1000;
        lastTime = now;

        // Fade-in
        if (opacity < 1) {
          opacity = Math.min(opacity + dt / FADE_DURATION, 1);
        }

        frameCount++;
        fpsAccum += dt;
        if (fpsAccum >= 1.0) {
          setFps(Math.round(frameCount / fpsAccum));
          frameCount = 0;
          fpsAccum = 0;
        }

        if (needsRebuildRef.current && gpuRef.current) {
          state = rebuildGeometry(gpuRef.current);
        }

        // Auto rotation
        if (playingRef.current) {
          autoAngle += dt * speedRef.current * 0.5;
        }

        // Combine auto rotation with manual orbit
        const aspect = canvas!.clientWidth / canvas!.clientHeight;
        const projMat = mat4.perspective(Math.PI / 4, aspect, 0.1, 100.0);
        const viewMat = mat4.lookAt(
          [0, 0, zoomRef.current],
          [0, 0, 0],
          [0, 1, 0]
        );

        const autoY = mat4.rotateY(autoAngle);
        const autoX = mat4.rotateX(autoAngle * 0.3);
        const orbitY = mat4.rotateY(orbitYawRef.current);
        const orbitX = mat4.rotateX(orbitPitchRef.current);

        // model = orbitY * orbitX * autoY * autoX
        const autoRot = mat4.multiply(autoY, autoX);
        const orbitRot = mat4.multiply(orbitY, orbitX);
        const model = mat4.multiply(orbitRot, autoRot);

        const dim = dimensionsRef.current;
        const colorIdx = dim - 3;
        const color = DIMENSION_COLORS[colorIdx] ?? [0.5, 0.5, 0.8];
        const lightDir: [number, number, number] = [0.5, 0.8, 1.0];

        // Compute cursor world position from NDC
        // Project cursor NDC to a point on the near plane in world space
        const [cx, cy] = cursorNDCRef.current;
        const cursorStrength = cursorActiveRef.current && !draggingRef.current ? 1.0 : 0.0;
        // Approximate world-space cursor: unproject NDC at z=0 plane
        const cursorZ = 0;
        const tanHalf = Math.tan(Math.PI / 8);
        const cursorWorldX = cx * tanHalf * aspect * zoomRef.current * 0.3;
        const cursorWorldY = cy * tanHalf * zoomRef.current * 0.3;
        const cursor: [number, number, number, number] = [
          cursorWorldX,
          cursorWorldY,
          cursorZ,
          cursorStrength,
        ];

        writeUniforms(
          gpu.device,
          state.uniformBuffer,
          model,
          viewMat,
          projMat,
          color,
          lightDir,
          cursor,
          opacity,
          now / 1000
        );

        // Render starfield background first
        if (starfieldRef.current) {
          writeStarfieldUniforms(
            gpu.device,
            starfieldRef.current.uniformBuffer,
            orbitYawRef.current + autoAngle * 0.1,
            orbitPitchRef.current,
            now / 1000
          );
          renderStarfield(gpu, starfieldRef.current);
        }

        // Then render the manifold on top
        renderFrame(gpu, state);
        rafRef.current = requestAnimationFrame(frame);
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    function handleResize() {
      if (!canvas) return;
      const dpr = devicePixelRatio;
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;

        if (gpuRef.current && renderStateRef.current) {
          renderStateRef.current.depthTexture.destroy();
          renderStateRef.current.depthTexture =
            gpuRef.current.device.createTexture({
              size: [w, h],
              format: "depth24plus",
              usage: GPUTextureUsage.RENDER_ATTACHMENT,
            });
        }
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    setup();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      if (renderStateRef.current) {
        renderStateRef.current.depthTexture.destroy();
      }
      // Clean up mesh buffers
      if (prevVertexBuffer) prevVertexBuffer.destroy();
      if (prevIndexBuffer) prevIndexBuffer.destroy();
      if (gpuRef.current) {
        gpuRef.current.device.destroy();
        gpuRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <FallbackNotice />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full block cursor-grab active:cursor-grabbing"
      style={{ background: "#0a0a0f" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
      onWheel={onWheel}
    />
  );
}
