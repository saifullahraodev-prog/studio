import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { CameraRig, CameraState, horizonScreenY } from "../cameras/CameraRig";
import { Captions, CaptionBeat } from "../captions/Captions";
import { Rain } from "../fx/Rain";
import { LightingPreset } from "../look/style";
import { Backdrop } from "../worlds/Backdrop";
import { Lighting } from "../worlds/Lighting";

// Standard layer stack for any shot in a world:
//   1. painted 2D backdrop (far)       — blurred = fake depth of field
//   2. 3D world + characters (near/mid) — transparent canvas
//   3. screen fx (rain)                 — preset-driven
//   4. colour grade wash                — preset-driven
//   5. captions                         — subtitle + keyword
export type WorldShotProps = {
  preset: LightingPreset;
  camera: CameraState;
  focus?: [number, number, number];
  captions?: CaptionBeat[];
  showSafeArea?: boolean;
  children: React.ReactNode; // world + characters (3D)
};

export const WorldShot: React.FC<WorldShotProps> = ({ preset, camera, focus, captions, showSafeArea, children }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: preset.fog.color }}>
      <Backdrop preset={preset} horizonY={horizonScreenY(camera)} />
      <ThreeCanvas width={width} height={height} shadows gl={{ alpha: true, antialias: true }}>
        <CameraRig {...camera} />
        <Lighting preset={preset} focus={focus} />
        {children}
      </ThreeCanvas>
      {preset.rain && <Rain />}
      {preset.grade && <AbsoluteFill style={{ backgroundColor: preset.grade, mixBlendMode: "multiply" }} />}
      {captions && <Captions beats={captions} showSafeArea={showSafeArea} />}
    </AbsoluteFill>
  );
};
