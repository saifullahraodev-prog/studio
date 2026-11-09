import { useThree } from "@react-three/fiber";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getInputProps, staticFile, useDelayRender } from "remotion";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { style } from "./style";

// ─────────────────────────────────────────────────────────────────────────────
// Realistic surfaces (revision 2, task 3). CC0 photo textures (public/textures/<id>/
// Color.jpg, NormalGL.jpg, Roughness.jpg; see CREDITS.md) on near/middle surfaces, so
// stylised characters stand in a believable, gritty world. Painted surfaces use the
// texture's grain/scratches but take their colour from `tint` (gray mode).
// Quality: `--props {"quality":"preview"}` turns heavy effects off (see style.quality).
// ─────────────────────────────────────────────────────────────────────────────

type QualityFlags = { dof: boolean; grain: boolean; msaa: number; sky: boolean; textures: boolean; shadowMap: number };
const Q = (style as unknown as { quality: Record<string, QualityFlags> }).quality;
export const QUALITY: QualityFlags = Q[(getInputProps() as { quality?: string }).quality ?? "final"] ?? Q.final;

const texCache = new Map<string, Promise<THREE.Texture>>();
const cloneCache = new Map<string, THREE.Texture>();
const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });

const loadTex = (path: string, kind: "color" | "gray" | "data") => {
  const key = `${path}|${kind}`;
  let p = texCache.get(key);
  if (!p) {
    p = loadImage(staticFile(path)).then((img) => {
      let t: THREE.Texture;
      if (kind === "gray") {
        // desaturate + lift: keeps scratches, dirt and grain, loses the original paint colour
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const g = c.getContext("2d")!;
        g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height);
        for (let i = 0; i < d.data.length; i += 4) {
          const l = 0.3 * d.data[i] + 0.59 * d.data[i + 1] + 0.11 * d.data[i + 2];
          const v = Math.min(255, 120 + l * 0.75);
          d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        }
        g.putImageData(d, 0, 0);
        t = new THREE.CanvasTexture(c);
      } else {
        t = new THREE.Texture(img);
        t.needsUpdate = true;
      }
      t.colorSpace = kind === "data" ? THREE.NoColorSpace : THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
      return t;
    });
    texCache.set(key, p);
  }
  return p;
};

// hold the render until the maps are loaded and drawn once (Remotion redraws only on frame change)
const useMaps = (id: string, gray: boolean) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const advance = useThree((s) => s.advance);
  const [maps, setMaps] = useState<THREE.Texture[] | null>(null);
  const h = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (!QUALITY.textures) return;
    let alive = true;
    h.current = delayRender(`texture ${id}`);
    Promise.all([loadTex(`textures/${id}/Color.jpg`, gray ? "gray" : "color"), loadTex(`textures/${id}/NormalGL.jpg`, "data"), loadTex(`textures/${id}/Roughness.jpg`, "data")])
      .then((m) => alive && setMaps(m))
      .catch((e) => cancelRender(e));
    // unmounted before the maps arrived (e.g. a shot that only lives for a whip transition):
    // release the hold, or the render waits forever
    return () => {
      alive = false;
      if (h.current !== null) {
        continueRender(h.current);
        h.current = null;
      }
    };
  }, [id, gray]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!maps || h.current === null) return;
    advance(performance.now());
    continueRender(h.current);
    h.current = null;
  }, [maps, advance, continueRender]);
  return maps;
};

export type RealProps = {
  tex: "Planks037A" | "Metal041B" | "PaintedMetal004" | "MetalPlates004" | "Rope001" | "Ground054" | "Fabric026";
  repeat?: [number, number];
  rotate?: number; // texture rotation (radians), e.g. to run planks along the deck
  tint?: string; // colour (gray mode for painted surfaces; multiplies the photo otherwise)
  gray?: boolean;
  roughness?: number; // multiplier on the roughness map (wet deck < 1)
  normalScale?: number;
  metalness?: number;
  side?: THREE.Side;
};

export const Real: React.FC<RealProps> = ({ tex, repeat = [1, 1], rotate = 0, tint = "#FFFFFF", gray = false, roughness = 1, normalScale = 1, metalness = 0, side }) => {
  const maps = useMaps(tex, gray);
  const [map, normal, rough] = useMemo(() => {
    if (!maps) return [null, null, null];
    // one texture object per (map, repeat, rotation): identical surfaces share it, so the GPU
    // uploads each image a handful of times instead of once per mesh (huge speed-up)
    return maps.map((m, k) => {
      const key = `${tex}|${gray}|${k}|${repeat[0]}|${repeat[1]}|${rotate}`;
      let c = cloneCache.get(key);
      if (!c) {
        c = m.clone();
        c.repeat.set(repeat[0], repeat[1]);
        c.center.set(0.5, 0.5);
        c.rotation = rotate;
        c.needsUpdate = true;
        cloneCache.set(key, c);
      }
      return c;
    });
  }, [maps, repeat[0], repeat[1], rotate]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!QUALITY.textures || !map) return <meshStandardMaterial color={tint} roughness={0.8 * roughness} metalness={metalness} side={side} />;
  return (
    <meshStandardMaterial
      color={tint}
      map={map}
      normalMap={normal}
      normalScale={new THREE.Vector2(normalScale, normalScale)}
      roughnessMap={rough}
      roughness={roughness}
      metalness={metalness}
      side={side}
    />
  );
};

// ─── photographic sky (CC0 HDRI) as scene background + reflections ─────────
const hdrCache = new Map<string, Promise<THREE.DataTexture>>();
export const HdrSky: React.FC<{ file: string; intensity: number; envIntensity: number; rotationY?: number; tilt?: number; blur?: number }> = ({ file, intensity, envIntensity, rotationY = 0, tilt = 0, blur = 0 }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const advance = useThree((s) => s.advance);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [tex, setTex] = useState<{ bg: THREE.Texture; env: THREE.Texture } | null>(null);
  const h = useRef<number | null>(null);
  useLayoutEffect(() => {
    h.current = delayRender(`sky ${file}`);
    let p = hdrCache.get(file);
    if (!p) {
      p = new RGBELoader().loadAsync(staticFile(`sky/${file}`));
      hdrCache.set(file, p);
    }
    let alive = true;
    p.then((t) => {
      if (!alive) return;
      t.mapping = THREE.EquirectangularReflectionMapping;
      const pm = new THREE.PMREMGenerator(gl);
      const env = pm.fromEquirectangular(t).texture;
      pm.dispose();
      setTex({ bg: t, env });
    }).catch((e) => cancelRender(e));
    return () => {
      alive = false;
      if (h.current !== null) {
        continueRender(h.current);
        h.current = null;
      }
    };
  }, [file]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!tex) return;
    scene.background = tex.bg;
    scene.backgroundIntensity = intensity;
    scene.backgroundBlurriness = blur;
    // tilt (radians) lowers the photo's horizon so any land in it hides behind our 3D sea
    scene.backgroundRotation.set(tilt, rotationY, 0);
    scene.environment = tex.env;
    scene.environmentIntensity = envIntensity;
    scene.environmentRotation.set(0, rotationY, 0);
  });
  useEffect(() => {
    if (!tex || h.current === null) return;
    advance(performance.now());
    continueRender(h.current);
    h.current = null;
  }, [tex, advance, continueRender]);
  return null;
};
