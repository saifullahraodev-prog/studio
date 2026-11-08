import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { ResProps } from "../ui/units";

// Heavier diagnostic scene, roughly what a busy world shot will cost:
// ~400 objects (~1.6M triangles), real-time shadows, fog.
const N = 20;

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const gradient = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return t;
  }, []);
  const items = useMemo(() => {
    const a: { x: number; z: number; c: string }[] = [];
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        a.push({ x: (i - N / 2) * 1.2, z: (j - N / 2) * 1.2, c: `hsl(${(i * 17 + j * 7) % 360},55%,60%)` });
    return a;
  }, []);
  const t = frame / 30;
  return (
    <>
      <color attach="background" args={["#a8c8e0"]} />
      <fog attach="fog" args={["#a8c8e0", 8, 30]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      {items.map((it, k) => (
        <mesh key={k} position={[it.x, 0.5 + 0.3 * Math.sin(t * 2 + k), it.z]} castShadow receiveShadow>
          <sphereGeometry args={[0.45, 48, 32]} />
          <meshToonMaterial color={it.c} gradientMap={gradient} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshToonMaterial color="#6f9a74" gradientMap={gradient} />
      </mesh>
    </>
  );
};

export const StressTest: React.FC<ResProps> = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const a = frame * 0.01;
  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{ position: [Math.sin(a) * 14, 7, Math.cos(a) * 14], fov: 50 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      >
        <Scene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
