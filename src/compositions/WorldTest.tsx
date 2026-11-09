import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { BIBLE } from "../../engine/characters/bible";
import { Character } from "../../engine/characters/Character";
import { makeCrowd } from "../../engine/characters/crowd";
import { gesture } from "../../engine/characters/gestures";
import { CameraState } from "../../engine/cameras/CameraRig";
import { ResProps } from "../../engine/look/units";
import { LightingPresetName, style } from "../../engine/look/style";
import { WorldShot } from "../../engine/shots/WorldShot";
import { factorySeats, FactoryFloor, FACTORY } from "../../engine/worlds/factory/Factory";
import { Stairwell } from "../../engine/worlds/stairwell/Stairwell";
import { Street } from "../../engine/worlds/street/Street";

// Phase 4 review: each new world from a few standard camera views, any preset,
// optional fire / smoke level and people.
export type WorldTestProps = ResProps & { world: "factory" | "stairwell" | "street"; view: number; preset: LightingPresetName; fire: number; smoke: number; people: boolean };

const VIEWS: Record<WorldTestProps["world"], { cam: CameraState; focus: [number, number, number]; range?: number }[]> = {
  factory: [
    { cam: { position: [1.2, 2.6, 7.2], target: [0.6, 1.2, -4], fov: 46 }, focus: [1, 1.2, 1], range: 6 }, // down the main aisle
    { cam: { position: [6.3, 3.6, 6.8], target: [-1.5, 0.8, -6], fov: 50 }, focus: [1, 1, -2], range: 8 }, // high corner wide
    { cam: { position: [2.3, 1.9, 4.9], target: [1.0, 1.45, 1.4], fov: 40 }, focus: [1.1, 1.6, 1.6], range: 1.6 }, // medium on the hero worker, machines behind
    { cam: { position: [-1.3, 1.6, -13.4], target: [-2.2, 1.45, -15.9], fov: 50 }, focus: [-2.2, 1.4, -15.8], range: 2.5 }, // the locked door
  ],
  stairwell: [
    { cam: { position: [0.2, 1.7, 4.6], target: [0, 1.4, 0], fov: 46 }, focus: [0, 1.3, 0.5], range: 3 },
    { cam: { position: [-1.2, 2.3, 2.7], target: [1.45, -0.7, 2.2], fov: 50 }, focus: [1.45, -0.5, 2.2], range: 4 }, // down the stair hole
    { cam: { position: [0.9, 1.5, 2.6], target: [-0.2, 1.4, 0.0], fov: 36 }, focus: [-0.2, 1.4, 0], range: 1.6 },
  ],
  street: [
    { cam: { position: [-6, 3, 44], target: [0, 21, 0], fov: 56 }, focus: [0, 20, 0], range: 60 }, // low wide, building towering
    { cam: { position: [16, 9, 34], target: [0, 24, 0], fov: 54 }, focus: [0, 24, 0], range: 60 }, // side angle, ladder stops short
    { cam: { position: [0.8, 1.9, 3.0], target: [0, 2.6, 10], fov: 44 }, focus: [0, 2, 7], range: 4 }, // crowd faces, looking up
  ],
};

export const WorldTest: React.FC<WorldTestProps> = ({ world, view, preset, fire, smoke, people }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + 2;
  const v = VIEWS[world][Math.min(view, VIEWS[world].length - 1)];
  const seats = useMemo(() => factorySeats(), []);
  const workers = useMemo(() => makeCrowd({ seed: "factory", count: 60, area: { x: [-6, 6], z: [-12, 4] }, kind: "workers", minGap: 0.1 }), []);
  const crowd = useMemo(() => makeCrowd({ seed: "street", count: 26, area: { x: [-7, 7], z: [6.5, 11.5] }, faceToward: [0, -2], kind: "mixed", minGap: 0.9 }), []);
  return (
    <WorldShot preset={style.lighting[preset]} camera={v.cam} focus={v.focus} focusRange={v.range}>
      {world === "factory" && (
        <>
          <FactoryFloor t={t} fire={fire} smoke={smoke} stools={!people} />
          {people &&
            seats
              .filter((_, i) => i % 2 === 0 || i % 7 === 3)
              .filter((s) => Math.hypot(s.position[0] - v.cam.position[0], s.position[2] - v.cam.position[2]) > 2.3) // nobody sits in the lens
              .map((s, i) => {
                const e = workers[i % workers.length];
                const g = gesture("sew", t + i * 0.37);
                return <Character key={i} def={e.def} expression={fire > 0 ? "scared" : "neutral"} position={s.position} rotationY={s.rotationY} pose={{ ...g, sink: 0.05 }} />;
              })}
          {people && <Character def={BIBLE.worker} expression={fire > 0 ? "shocked" : "happy"} position={[1.1, 0, 1.6]} rotationY={0.3} pose={fire > 0 ? gesture("panic", t) : gesture("carry", t)} />}
        </>
      )}
      {world === "stairwell" && (
        <>
          <Stairwell t={t} smoke={smoke} fire={fire} />
          {people && <Character def={BIBLE.worker} expression="shocked" mouth="wide" position={[-0.2, 0, 0.1]} rotationY={Math.PI} pose={gesture("rattle", t)} />}
        </>
      )}
      {world === "street" && (
        <>
          <Street t={t} fire={fire} />
          {people && crowd.map((e, i) => <Character key={i} def={e.def} expression={fire > 0 ? (i % 3 ? "scared" : "shocked") : "neutral"} position={e.position} rotationY={e.rotationY} pose={{ headNod: -0.35, bob: Math.sin(t * 2 + e.phase) * 0.01 }} />)}
          {people && <Character def={BIBLE.firefighter} expression="determined" position={[3.2, 0, 4.2]} rotationY={-0.6} pose={gesture("point", 1)} />}
        </>
      )}
    </WorldShot>
  );
};
export const FACTORY_INFO = FACTORY;
