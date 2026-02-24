/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
"use client";

import { useEffect } from "react";
import { useExplorerStore } from "@/stores/explorer-store";

export default function KeyboardHandler() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const store = useExplorerStore.getState();

      switch (e.key) {
        case " ":
          e.preventDefault();
          store.setIsPlaying(!store.isPlaying);
          break;
        case "ArrowRight":
          e.preventDefault();
          store.cycleDimension(1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          store.cycleDimension(-1);
          break;
        case "ArrowUp":
          e.preventDefault();
          store.setRotationSpeed(Math.min(store.rotationSpeed + 0.2, 3));
          break;
        case "ArrowDown":
          e.preventDefault();
          store.setRotationSpeed(Math.max(store.rotationSpeed - 0.2, 0));
          break;
        case "h":
        case "H":
          store.toggleHud();
          break;
        case "i":
        case "I":
          store.toggleInfoPanel();
          break;
        case "r":
        case "R":
          store.resetCamera();
          break;
        case "d":
        case "D":
          store.toggleDuality();
          break;
        case "m":
        case "M":
          store.toggleDuality();
          break;
        case "p":
        case "P":
          store.cycleProjection();
          break;
        case "s":
        case "S":
          store.setAudioEnabled(!store.audioEnabled);
          break;
        default:
          // Number keys 1-9 → dimensions 3-11
          if (e.key >= "1" && e.key <= "9") {
            const dim = parseInt(e.key) + 2;
            if (dim >= 3 && dim <= 11) {
              store.setActiveDimensions(dim);
            }
          }
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
