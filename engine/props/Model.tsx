import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { staticFile, useDelayRender } from "remotion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ─────────────────────────────────────────────────────────────────────────────
// Real 3D models (owner decision 2026-11-10: "Real models + mocap").
// Static props: CC0 glTF files from Poly Haven in public/models/polyhaven/<id>/<id>.gltf
// (licences: CREDITS.md). Loaded once, cloned per use; holds the render until drawn.
// ─────────────────────────────────────────────────────────────────────────────

const gltfCache = new Map<string, Promise<THREE.Group>>();
const loadGltf = (path: string) => {
  let p = gltfCache.get(path);
  if (!p) {
    p = new GLTFLoader().loadAsync(staticFile(path)).then((g) => {
      g.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
      });
      return g.scene;
    });
    gltfCache.set(path, p);
  }
  return p;
};

export const useGltf = (path: string) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const advance = useThree((s) => s.advance);
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const h = useRef<number | null>(null);
  useLayoutEffect(() => {
    let alive = true;
    h.current = delayRender(`model ${path}`, { timeoutInMilliseconds: 120000 });
    loadGltf(path)
      .then((s) => alive && setScene(s))
      .catch((e) => cancelRender(e));
    return () => {
      alive = false;
      if (h.current !== null) {
        continueRender(h.current);
        h.current = null;
      }
    };
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!scene || h.current === null) return;
    advance(performance.now());
    continueRender(h.current);
    h.current = null;
  }, [scene, advance, continueRender]);
  return scene;
};

export type PropId =
  | "barrel_03" | "Barrel_01" | "wooden_barrels_01" | "old_military_crate" | "wooden_military_crate" | "wooden_crate_02"
  | "ammo_box" | "cement_bag" | "compost_bags" | "stick_grenade" | "old_gas_mask" | "rusted_spade_01" | "wooden_ladder"
  | "tree_stump_01" | "tree_stump_02" | "dead_tree_trunk" | "rock_07" | "stone_01" | "wooden_bucket_01" | "dry_branches_medium_01";

// one placed prop. `size` scales the real-world model (our bodies are ~1.7x real people, so props default to 1.7)
export const Prop: React.FC<{ id: PropId; position?: [number, number, number]; rotation?: [number, number, number]; size?: number; tint?: string }> = ({ id, position, rotation, size = 1.7, tint }) => {
  const scene = useGltf(`models/polyhaven/${id}/${id}.gltf`);
  const obj = useMemo(() => {
    if (!scene) return null;
    const c = scene.clone(true);
    if (tint)
      c.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.material = (m.material as THREE.MeshStandardMaterial).clone();
          (m.material as THREE.MeshStandardMaterial).color.set(tint);
        }
      });
    return c;
  }, [scene, tint]);
  if (!obj) return null;
  return <primitive object={obj} position={position} rotation={rotation} scale={size} />;
};
