import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { toonGradient } from "../look/style";

// Stylised toon sea: a near grid displaced by layered waves (frame-driven, so
// renders are deterministic) + a huge flat far plane that dissolves into fog.
export const Sea: React.FC<{ y: number; color: string; amp: number; size?: number; segments?: number }> = ({
  y,
  color,
  amp,
  size = 260,
  segments = 110,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const geo = useMemo(() => {
    // non-indexed = every triangle has its own normals = faceted, low-poly toon waves
    const g = new THREE.PlaneGeometry(size, size, segments, segments).toNonIndexed();
    g.rotateX(-Math.PI / 2);
    return g;
  }, [size, segments]);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);

  // displace every frame
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3];
    const z = base[i * 3 + 2];
    const h =
      Math.sin(x * 0.18 + t * 1.1) * 0.55 +
      Math.sin(z * 0.23 - t * 1.4 + x * 0.05) * 0.45 +
      Math.sin((x + z) * 0.5 + t * 2.3) * 0.18;
    pos.setY(i, h * amp);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const g = toonGradient();
  return (
    <group position={[0, y, 0]}>
      <mesh geometry={geo} receiveShadow>
        <meshToonMaterial color={color} gradientMap={g} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6 * amp - 0.05, 0]}>
        <planeGeometry args={[8000, 8000]} />
        <meshToonMaterial color={color} gradientMap={g} />
      </mesh>
    </group>
  );
};
