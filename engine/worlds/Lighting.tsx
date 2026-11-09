import { LightingPreset } from "../look/style";

// 3D lights + fog for a lighting preset (values live in the style file).
// `focus` = point the shadow camera is centred on (where the characters are).
export const Lighting: React.FC<{ preset: LightingPreset; focus?: [number, number, number]; shadowSize?: number }> = ({
  preset,
  focus = [0, 0, 0],
  shadowSize = 10,
}) => {
  const d = preset.sunLight.dir;
  const len = Math.hypot(d[0], d[1], d[2]);
  const dist = 30;
  const pos: [number, number, number] = [focus[0] + (d[0] / len) * dist, focus[1] + (d[1] / len) * dist, focus[2] + (d[2] / len) * dist];
  return (
    <>
      <fog attach="fog" args={[preset.fog.color, preset.fog.near, preset.fog.far]} />
      <hemisphereLight args={[preset.hemi.sky, preset.hemi.ground, preset.hemi.intensity]} />
      <directionalLight
        position={pos}
        color={preset.sunLight.color}
        intensity={preset.sunLight.intensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-shadowSize}
        shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize}
        shadow-camera-bottom={-shadowSize}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0006}
        shadow-normalBias={0.045}
      >
        <object3D attach="target" position={focus} />
      </directionalLight>
    </>
  );
};
