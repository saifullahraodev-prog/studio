import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { staticFile, useDelayRender } from "remotion";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Real } from "../look/materials";
import { Toon } from "../look/style";

// Static preview of the chubby soldier body (tools/chubby_body.mjs) BEFORE Mixamo rigs it:
// each named part gets its real material. After rigging, MocapActor reuses PART_LOOK.

export const PART_LOOK: Record<string, { tex?: "Fabric026"; tint: string; kind?: "leather" | "brass" | "glove" | "wool" }> = {
  tunic: { tex: "Fabric026", tint: "#9C8E62" },
  trousers: { tex: "Fabric026", tint: "#8A7E56" },
  puttees: { tex: "Fabric026", tint: "#7E7450" },
  webbing: { tex: "Fabric026", tint: "#C2B48A" },
  leather: { tint: "#5A3A22", kind: "leather" },
  boots: { tint: "#33241A", kind: "leather" },
  brass: { tint: "#C9A04A", kind: "brass" },
  glove: { tint: "#FFFFFF", kind: "glove" },
};

const objCache = new Map<string, Promise<THREE.Group>>();
const useObj = (path: string) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const advance = useThree((s) => s.advance);
  const [g, setG] = useState<THREE.Group | null>(null);
  const h = useRef<number | null>(null);
  useLayoutEffect(() => {
    let alive = true;
    h.current = delayRender(`obj ${path}`);
    let p = objCache.get(path);
    if (!p) {
      p = new OBJLoader().loadAsync(staticFile(path));
      objCache.set(path, p);
    }
    p.then((x) => alive && setG(x)).catch((e) => cancelRender(e));
    return () => {
      alive = false;
      if (h.current !== null) {
        continueRender(h.current);
        h.current = null;
      }
    };
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!g || h.current === null) return;
    advance(performance.now());
    continueRender(h.current);
    h.current = null;
  }, [g, advance, continueRender]);
  return g;
};

export const ChubbyBodyPreview: React.FC<{ position?: [number, number, number]; rotationY?: number; scale?: number; children?: React.ReactNode }> = ({ position, rotationY = 0, scale = 1, children }) => {
  const g = useObj("models/chubby/chubby_soldier.obj");
  const meshes = useMemo(() => {
    if (!g) return [];
    const out: { name: string; geo: THREE.BufferGeometry }[] = [];
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) out.push({ name: m.name, geo: m.geometry });
    });
    return out;
  }, [g]);
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {meshes
        .filter((m) => m.name !== "skin")
        .map((m) => {
          const L = PART_LOOK[m.name] ?? { tint: "#888888" };
          return (
            <mesh key={m.name} geometry={m.geo} castShadow receiveShadow>
              {L.tex ? <Real tex={L.tex} gray tint={L.tint} repeat={[4, 4]} /> : <Toon color={L.tint} kind={L.kind ?? "paint"} />}
            </mesh>
          );
        })}
      {children}
    </group>
  );
};
