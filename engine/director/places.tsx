import React, { useMemo } from "react";
import { Character } from "../characters/Character";
import { makeCrowd } from "../characters/crowd";
import { gesture } from "../characters/gestures";
import { CameraState, Vec3 } from "../cameras/CameraRig";
import { LightingPresetName } from "../look/style";
import { factorySeats, FactoryFloor, FACTORY } from "../worlds/factory/Factory";
import { OFFICE, OfficeToday, Courtroom1911 } from "../worlds/sets/SmallSets";
import { Stairwell, STAIRWELL } from "../worlds/stairwell/Stairwell";
import { floorY, STREET, Street } from "../worlds/street/Street";

// ─────────────────────────────────────────────────────────────────────────────
// Places: a world + named SPOTS (where cast members stand) + named PROPS (insert
// targets, each with its own close-up camera) + ESTABLISHING cameras + background
// extras. The director only ever talks in these names, never coordinates.
// ─────────────────────────────────────────────────────────────────────────────

export type Spot = { pos: Vec3; rotY: number };
export type PropShot = { at: Vec3; cam: CameraState };
export type PlaceState = { t: number; fire: number; smoke: number; extras: boolean; doorShake?: number; doorOpen?: number; sprinkler?: number };
export type Place = {
  id: string;
  preset: LightingPresetName;
  spots: Record<string, Spot>;
  props: Record<string, PropShot>;
  establish: { cam: CameraState; focus: Vec3; range: number }[];
  World: React.FC<PlaceState>;
  // where the camera may go (keeps generic shots out of walls, tables and crowds)
  bounds?: { x: [number, number]; y: [number, number]; z: [number, number] };
};

const SeatedWorkers: React.FC<{ t: number; fire: number; skipNear?: Vec3[] }> = ({ t, fire, skipNear = [] }) => {
  const seats = useMemo(() => factorySeats(), []);
  const crowd = useMemo(() => makeCrowd({ seed: "factory", count: 60, area: { x: [-6, 6], z: [-12, 4] }, kind: "workers", minGap: 0.1 }), []);
  return (
    <>
      {seats
        .filter((_, i) => i % 2 === 0 || i % 7 === 3)
        .filter((s) => !skipNear.some((p) => Math.hypot(s.position[0] - p[0], s.position[2] - p[2]) < 1.2))
        .map((s, i) => {
          const e = crowd[i % crowd.length];
          const panic = fire > 0.15;
          const g = panic ? gesture(i % 3 ? "panic" : "cower", t + i * 0.31) : gesture("sew", t + i * 0.37);
          return <Character key={i} def={e.def} expression={panic ? (i % 2 ? "scared" : "shocked") : i % 5 === 0 ? "happy" : "neutral"} mouth={panic && i % 2 ? "wide" : "rest"} position={s.position} rotationY={s.rotationY + (panic ? Math.PI * 0.5 * (i % 2 ? 1 : -1) : 0)} pose={{ ...g, sink: panic ? 0 : 0.05 }} />;
        })}
    </>
  );
};

const StreetCrowd: React.FC<{ t: number; fire: number }> = ({ t, fire }) => {
  const crowd = useMemo(() => makeCrowd({ seed: "street", count: 28, area: { x: [-8, 8], z: [7.5, 13] }, faceToward: [0, -2], kind: "mixed", minGap: 0.95 }), []);
  return (
    <>
      {crowd.map((e, i) => (
        <Character key={i} def={e.def} expression={fire > 0 ? (i % 3 ? "scared" : "shocked") : "neutral"} position={e.position} rotationY={e.rotationY} pose={{ headNod: fire > 0 ? -0.35 : 0, bob: Math.sin(t * 2 + e.phase) * 0.01 }} />
      ))}
    </>
  );
};

const top = floorY(9) + 2;

export const PLACES: Record<string, Place> = {
  office: {
    id: "office",
    preset: "day",
    spots: { center: { pos: [0, 0, 0.6], rotY: 0 }, left: { pos: [-1.6, 0, 0.5], rotY: 0.35 }, right: { pos: [1.4, 0, 0.6], rotY: -0.3 }, door: { pos: [1.6, 0, -0.8], rotY: Math.PI } },
    props: {
      exit: { at: [1.6, 1.4, -1.8], cam: { position: [0.6, 1.6, 1.4], target: [1.6, 1.6, -1.8], fov: 42 } },
      sprinkler: { at: [-1.8, 3.3, 0.6], cam: { position: [-1.0, 2.2, 1.9], target: [-1.8, 3.25, 0.6], fov: 40 } },
      alarm: { at: OFFICE.alarm, cam: { position: [-1.1, 1.5, -0.6], target: [-1.6, 1.4, -1.85], fov: 36 } },
    },
    establish: [{ cam: { position: [-0.4, 2.0, 6.5], target: [0.2, 1.4, -0.5], fov: 44 }, focus: [0, 1.5, 0.6], range: 3 }],
    World: ({ t, doorOpen, sprinkler }) => <OfficeToday t={t} doorOpen={doorOpen} sprinklerOn={sprinkler} />,
    bounds: { x: [-4, 6], y: [0.5, 3.2], z: [-1.4, 8] },
  },
  factory: {
    id: "factory",
    preset: "interior",
    spots: {
      aisle: { pos: [1.1, 0, 1.6], rotY: 0.05 },
      aisle2: { pos: [1.5, 0, -0.3], rotY: -0.15 },
      door: { pos: [-2.2, 0, -14.4], rotY: Math.PI },
      bin: { pos: [1.6, 0, 3.4], rotY: 0.6 },
      back: { pos: [1.1, 0, -8], rotY: 0 },
    },
    props: {
      door: { at: FACTORY.door, cam: { position: [-1.3, 1.6, -13.4], target: [-2.2, 1.45, -15.9], fov: 50 } },
      bin: { at: [2.4, 0.6, 2.6], cam: { position: [1.4, 1.5, 4.6], target: [2.4, 0.6, 2.6], fov: 40 } },
      machines: { at: [-0.55, 1.1, -6.5], cam: { position: [1.6, 2.1, -3.6], target: [-0.5, 1.0, -6.8], fov: 46 } },
      windows: { at: [6.8, 2.2, -2], cam: { position: [1.2, 1.6, 2], target: [6.8, 2.4, -3], fov: 44 } },
    },
    establish: [
      { cam: { position: [1.2, 2.6, 7.2], target: [0.6, 1.2, -4], fov: 46 }, focus: [1, 1.2, 1], range: 6 },
      { cam: { position: [6.3, 3.6, 6.8], target: [-1.5, 0.8, -6], fov: 50 }, focus: [1, 1, -2], range: 8 },
    ],
    World: ({ t, fire, smoke, extras }) => (
      <>
        <FactoryFloor t={t} fire={fire} smoke={smoke} stools={!extras} />
        {extras && <SeatedWorkers t={t} fire={fire} skipNear={[[1.1, 0, 1.6], [1.5, 0, -0.3], [1.6, 0, 3.4]]} />}
      </>
    ),
    bounds: { x: [0.85, 1.45], y: [0.9, 3.8], z: [-14.5, 7.6] }, // middle of the aisle: seated workers sit at x 0.15 and 2.15
  },
  stairwell: {
    id: "stairwell",
    preset: "interior",
    spots: { door: { pos: [-0.4, 0, 0.15], rotY: Math.PI }, landing: { pos: [0.3, 0, 1.7], rotY: 0.2 }, stairs: { pos: [1.35, 1.2, 1.1], rotY: Math.PI } },
    props: {
      door: { at: STAIRWELL.door, cam: { position: [0.65, 1.65, -0.05], target: [0.08, 1.33, -0.6], fov: 38 } },
      hole: { at: [1.45, -0.5, 2.2], cam: { position: [-1.2, 2.3, 2.7], target: [1.45, -0.7, 2.2], fov: 50 } },
      elevator: { at: [-1.9, 1.3, 1.6], cam: { position: [0.6, 1.5, 2.4], target: [-1.9, 1.3, 1.5], fov: 42 } },
      window: { at: [-2, 1.9, -0.05], cam: { position: [0.4, 1.7, 1.6], target: [-2, 1.8, -0.05], fov: 44 } },
    },
    establish: [{ cam: { position: [0.2, 1.7, 4.6], target: [0, 1.4, 0], fov: 46 }, focus: [0, 1.3, 0.5], range: 3 }],
    World: ({ t, fire, smoke, doorShake }) => <Stairwell t={t} fire={fire} smoke={smoke} doorShake={doorShake} />,
    bounds: { x: [-1.7, 0.7], y: [0.5, 3.3], z: [-0.4, 5.5] },
  },
  street: {
    id: "street",
    preset: "golden",
    spots: { front: { pos: [0.5, 0, 6.2], rotY: Math.PI * 0.9 }, firefighter: { pos: [3.0, 0, 5.6], rotY: -2.6 }, perkins: { pos: [-2.4, 0, 6.6], rotY: 2.8 }, corner: { pos: [-6, 0, 5], rotY: 2.4 } },
    props: {
      ladder: { at: [3.5, 20, 3], cam: { position: [16, 9, 34], target: [0, 24, 0], fov: 54 } },
      top: { at: [0, top, 0], cam: { position: [-3, top - 6, 18], target: [0, top - 2, 0], fov: 46 } },
      fireescape: { at: [7.9, floorY(8), 0.8], cam: { position: [2, floorY(8) - 3, 12], target: [7.9, floorY(8.5), 0.5], fov: 42 } },
      windows: { at: [0, floorY(9), 0], cam: { position: [0, floorY(9) - 1, 14], target: [0, floorY(9) + 1, 0], fov: 40 } },
      engine: { at: [-6, 1.5, 8.5], cam: { position: [-2.5, 2.2, 14], target: [-6, 1.8, 8.5], fov: 44 } },
    },
    establish: [
      { cam: { position: [-6, 3, 44], target: [0, 21, 0], fov: 56 }, focus: [0, 20, 0], range: 60 },
      { cam: { position: [16, 9, 34], target: [0, 24, 0], fov: 54 }, focus: [0, 24, 0], range: 60 },
    ],
    World: ({ t, fire, extras }) => (
      <>
        <Street t={t} fire={fire} />
        {extras && <StreetCrowd t={t} fire={fire} />}
      </>
    ),
  },
  courtroom: {
    id: "courtroom",
    preset: "interior",
    spots: { judge: { pos: [0, 0.5, -2.2], rotY: 0 }, owner: { pos: [-1.9, 0, 2.5], rotY: 0.45 }, owner2: { pos: [-0.7, 0, 2.6], rotY: 0.2 }, center: { pos: [1.2, 0, 1.2], rotY: -0.4 } },
    props: { bench: { at: [0, 1.8, -1.5], cam: { position: [0.6, 1.4, 2.6], target: [0, 2.2, -1.8], fov: 44 } } },
    establish: [{ cam: { position: [2.5, 2.8, 8.5], target: [-0.3, 1.4, -0.8], fov: 46 }, focus: [-0.8, 1.4, 1], range: 5 }],
    World: () => <Courtroom1911 />,
    bounds: { x: [-6, 6], y: [0.6, 4.4], z: [-0.9, 9] },
  },
};

export const STREET_INFO = STREET;
