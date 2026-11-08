import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { staticFile, useDelayRender } from "remotion";
import * as THREE from "three";

// Load a texture from public/ (inside a <ThreeCanvas>) and hold the render until
// the 3D scene has actually been redrawn with it. Remotion only redraws three.js
// when the frame changes, so we force one redraw (advance) after the texture arrives.
const cache = new Map<string, Promise<THREE.Texture>>();
const done = new Map<string, THREE.Texture>();

const load = (path: string) => {
  let p = cache.get(path);
  if (!p) {
    p = new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(
        staticFile(path),
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 4;
          done.set(path, t);
          resolve(t);
        },
        undefined,
        reject,
      );
    });
    cache.set(path, p);
  }
  return p;
};

export const useStaticTexture = (path: string): THREE.Texture | null => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const advance = useThree((s) => s.advance);
  const [tex, setTex] = useState<THREE.Texture | null>(() => done.get(path) ?? null);
  const handle = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (tex) return;
    handle.current = delayRender(`Loading texture ${path}`);
    load(path)
      .then(setTex)
      .catch((e) => cancelRender(e));
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tex || handle.current === null) return;
    advance(performance.now());
    continueRender(handle.current);
    handle.current = null;
  }, [tex, advance, continueRender]);

  return tex;
};
