import { useMemo } from "react";
import * as THREE from "three";
import styleJson from "./style-v0.1.json";

// The ONE place look values come from. Switch versions by changing the import above.
export const style = styleJson;
export type LightingPresetName = keyof typeof styleJson.lighting;
export type LightingPreset = (typeof styleJson.lighting)[LightingPresetName];
export const LIGHTING_PRESETS = Object.keys(styleJson.lighting) as LightingPresetName[];

// Soft toon shading: a few flat light bands, no outlines.
export const makeToonGradient = (steps: number[] = style.toon.gradientSteps) => {
  const tex = new THREE.DataTexture(new Uint8Array(steps), steps.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
};

let sharedGradient: THREE.DataTexture | null = null;
export const toonGradient = () => (sharedGradient ??= makeToonGradient());

// <Toon color="#..."/> material shortcut.
export const Toon: React.FC<{ color: string; map?: THREE.Texture; side?: THREE.Side; emissive?: string; emissiveIntensity?: number }> = ({
  color,
  map,
  side,
  emissive,
  emissiveIntensity,
}) => {
  const g = useMemo(() => toonGradient(), []);
  return (
    <meshToonMaterial
      color={color}
      gradientMap={g}
      map={map ?? null}
      side={side ?? THREE.FrontSide}
      emissive={emissive ?? "#000000"}
      emissiveIntensity={emissiveIntensity ?? 0}
    />
  );
};
