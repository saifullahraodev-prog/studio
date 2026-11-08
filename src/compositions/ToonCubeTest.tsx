import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Captions } from "../ui/Captions";
import { ResProps } from "../ui/units";

// 3-step gradient map = soft toon shading (no outlines, per style direction F).
const useToonGradient = () =>
  useMemo(() => {
    const data = new Uint8Array([90, 170, 255]);
    const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const gradient = useToonGradient();
  const rot = frame * 0.04;
  return (
    <>
      <color attach="background" args={["#9fc7e3"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <mesh rotation={[rot * 0.6, rot, 0]} position={[0, 0.3, 0]}>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshToonMaterial color="#e8783c" gradientMap={gradient} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
        <circleGeometry args={[3, 48]} />
        <meshToonMaterial color="#5f8f6a" gradientMap={gradient} />
      </mesh>
    </>
  );
};

export const ToonCubeTest: React.FC<ResProps> = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const keyword = frame < 75 ? "TOON" : "CUBE";
  const pop = interpolate(frame % 75, [0, 6, 10], [0.6, 1.12, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 1.5, 9], fov: 40 }}
      >
        <Scene />
      </ThreeCanvas>
      <Captions
        subtitle="Phase 1 test: a spinning toon cube."
        keyword={keyword}
        keywordScale={pop}
      />
    </AbsoluteFill>
  );
};
