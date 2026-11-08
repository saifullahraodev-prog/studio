import { useMemo } from "react";
import * as THREE from "three";
import styleJson from "./style-v0.2.json";

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

// ─── surface kinds (PBR mode) ───────────────────────────────────────────────
export type SurfaceKind = "paint" | "fabric" | "wool" | "leather" | "metal" | "brass" | "wood" | "glove" | "rubber" | "glass";
const KIND: Record<SurfaceKind, { roughness: number; metalness: number; bump?: number; clearcoat?: number }> = {
  paint: { roughness: 0.6, metalness: 0 },
  fabric: { roughness: 0.92, metalness: 0, bump: 1.2 },
  wool: { roughness: 0.95, metalness: 0, bump: 2 },
  leather: { roughness: 0.42, metalness: 0, bump: 0.4 },
  metal: { roughness: 0.32, metalness: 0.85 },
  brass: { roughness: 0.3, metalness: 1 },
  wood: { roughness: 0.75, metalness: 0, bump: 0.6 },
  glove: { roughness: 0.55, metalness: 0 },
  rubber: { roughness: 0.7, metalness: 0 },
  glass: { roughness: 0.08, metalness: 0.1 },
};

// Small tiling noise used as a bump map for cloth/wood so surfaces aren't plastic-smooth.
let weave: THREE.CanvasTexture | null = null;
const weaveTexture = () => {
  if (weave) return weave;
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const img = g.createImageData(s, s);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < s; y++)
    for (let x = 0; x < s; x++) {
      const weaveV = ((x % 4 < 2) !== (y % 4 < 2) ? 150 : 110) + rnd() * 70;
      const i = (y * s + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = weaveV;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  weave = new THREE.CanvasTexture(c);
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  weave.repeat.set(6, 6);
  return weave;
};

// <Toon color kind/> material shortcut. In "pbr" mode it renders soft realistic
// materials; in "toon" mode the original flat bands. Call sites never change.
export const Toon: React.FC<{
  color: string;
  map?: THREE.Texture;
  side?: THREE.Side;
  emissive?: string;
  emissiveIntensity?: number;
  kind?: SurfaceKind;
  roughness?: number;
}> = ({ color, map, side, emissive, emissiveIntensity, kind = "paint", roughness }) => {
  const g = useMemo(() => toonGradient(), []);
  if (style.render.materials === "pbr") {
    const k = KIND[kind];
    const bump = k.bump ? weaveTexture() : null;
    return (
      <meshStandardMaterial
        color={color}
        map={map ?? null}
        side={side ?? THREE.FrontSide}
        roughness={roughness ?? k.roughness}
        metalness={k.metalness}
        bumpMap={bump}
        bumpScale={k.bump ?? 0}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissiveIntensity ?? 0}
      />
    );
  }
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
