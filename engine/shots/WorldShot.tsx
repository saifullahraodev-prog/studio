import { useThree } from "@react-three/fiber";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CameraRig, CameraState, horizonScreenY } from "../cameras/CameraRig";
import { Captions, CaptionBeat } from "../captions/Captions";
import { Rain } from "../fx/Rain";
import { FaceLook, FaceLookContext, SceneLight, SceneLightContext } from "../look/faceShader";
import { LightingPreset, style } from "../look/style";
import { HdrSky, QUALITY } from "../look/materials";
import { Lighting } from "../worlds/Lighting";
import { SkyBackground } from "../worlds/Sky";

// Standard layer stack for any shot in a world:
//   1. painted sky (scene background, far)
//   2. 3D world + characters, soft reflections from an environment map
//   3. lens blur (real depth of field, focused on `focus`)  — switchable in style
//   4. screen fx (rain), colour grade wash, captions
export type WorldShotProps = {
  preset: LightingPreset;
  camera: CameraState;
  focus?: [number, number, number]; // what the lens is focused on (usually the speaker's face)
  focusRange?: number;
  bokeh?: number;
  faceLook?: FaceLook; // override the style's face shading options (for comparisons)
  captions?: CaptionBeat[];
  showSafeArea?: boolean;
  children: React.ReactNode;
};

export const EnvMap: React.FC<{ intensity: number }> = ({ intensity }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const t = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return t;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = intensity;
  });
  return null;
};

// Remotion only redraws three.js when the frame changes. A freshly mounted shot
// (first frame after a cut, or a single still) can be captured before the effect
// composer has drawn anything. Hold the frame until two real draws have happened.
const WarmUp: React.FC = () => {
  const advance = useThree((s) => s.advance);
  const { delayRender, continueRender } = useDelayRender();
  useEffect(() => {
    const h = delayRender("Warming up 3D shot");
    let n = 0;
    const tick = () => {
      advance(performance.now());
      if (++n < 3) requestAnimationFrame(tick);
      else continueRender(h);
    };
    requestAnimationFrame(tick);
  }, [advance, delayRender, continueRender]);
  return null;
};

export const sceneLightFor = (preset: LightingPreset): SceneLight => ({
  dir: preset.sunLight.dir as [number, number, number],
  color: preset.sunLight.color,
  ambient: preset.hemi.sky,
  glow: preset.faceGlow,
});

// Film grade (style.grade): grain that changes every frame but is deterministic (seeded by frame)
const Grain: React.FC<{ amount: number }> = ({ amount }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: amount * 4, pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${frame % 12}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${frame % 12})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const WorldShot: React.FC<WorldShotProps> = ({ preset, camera, focus = [0, 1.8, 0], focusRange, bokeh, faceLook, captions, showSafeArea, children }) => {
  const { width, height } = useVideoConfig();
  const k = height / 1920;
  const real = style.dof.mode === "real" && QUALITY.dof;
  const look = faceLook ?? style.face.shading;
  const G = (style as unknown as { grade: { saturate: number; contrast: number; sepia: number; warm: string; warmOpacity: number; vignette: number; grain: number } }).grade;
  const sky = (preset as unknown as { skyHdr?: string; skyIntensity?: number; skyRotation?: number });
  const photoSky = QUALITY.sky && !!sky.skyHdr;
  return (
    <AbsoluteFill style={{ backgroundColor: preset.fog.color }}>
      <AbsoluteFill style={{ filter: `saturate(${G.saturate}) contrast(${G.contrast}) sepia(${G.sepia})` }}>
      <SceneLightContext.Provider value={sceneLightFor(preset)}>
        <FaceLookContext.Provider value={look}>
          <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }}>
            <CameraRig {...camera} />
            <WarmUp />
            {photoSky ? (
              <HdrSky file={sky.skyHdr!} intensity={sky.skyIntensity ?? 1} envIntensity={style.render.envIntensity * preset.env * 1.4} rotationY={sky.skyRotation ?? 0} tilt={(sky as { skyTilt?: number }).skyTilt ?? 0} />
            ) : (
              <>
                <SkyBackground preset={preset} horizonY={horizonScreenY(camera)} />
                <EnvMap intensity={style.render.envIntensity * preset.env} />
              </>
            )}
            <Lighting preset={preset} focus={[focus[0], 0, focus[2]]} shadowMap={QUALITY.shadowMap} />
            {children}
            {real && (
              <EffectComposer multisampling={QUALITY.msaa}>
                <DepthOfField target={focus} worldFocusRange={focusRange ?? style.dof.focusRange} bokehScale={(bokeh ?? style.dof.bokehScale) * k} />
              </EffectComposer>
            )}
          </ThreeCanvas>
        </FaceLookContext.Provider>
      </SceneLightContext.Provider>
      </AbsoluteFill>
      {preset.rain && <Rain />}
      {preset.grade && <AbsoluteFill style={{ backgroundColor: preset.grade, mixBlendMode: "multiply" }} />}
      {/* film look: warm highlights, vignette, grain */}
      <AbsoluteFill style={{ backgroundColor: G.warm, mixBlendMode: "soft-light", opacity: G.warmOpacity, pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${G.vignette}) 100%)`, pointerEvents: "none" }} />
      {QUALITY.grain && <Grain amount={G.grain} />}
      {captions && <Captions beats={captions} showSafeArea={showSafeArea} />}
    </AbsoluteFill>
  );
};
