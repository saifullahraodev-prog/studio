import React, { useMemo } from "react";
import { interpolate, random, spring } from "remotion";
import * as THREE from "three";
import { BIBLE, CharacterDef } from "../characters/bible";
import { Character, HEAD_HEIGHT, Pose } from "../characters/Character";
import { makeCrowd } from "../characters/crowd";
import { Expression, MouthSlot } from "../characters/face";
import { gesture } from "../characters/gestures";
import { mouthAt, WordTiming } from "../characters/lipsync";
import { CameraState, Vec3 } from "../cameras/CameraRig";
import { handheld, punchIn, push, shake, wideClose } from "../cameras/moves";
import { LightingPresetName, style } from "../look/style";
import { BoilerRoom, Certificate, Crate, Iceberg, MiniBoat, Rulebook, TextLabel, ToyShip } from "../props/Props";
import { Sea } from "../worlds/Sea";
import { ShipDeck } from "../worlds/ship-deck/ShipDeck";
import { ShotOutput } from "./templates";
import { DeckBoat, RocketFlare } from "../props/ActionProps";
import { FireJet, FloorRifle, MachineGun } from "../props/TrenchProps";
import { Barrel, Trench, TRENCH } from "../worlds/trench/Trench";
import { Prop } from "../props/Model";
import { MocapActor } from "../characters/MocapActor";
import { ChubbyActor } from "../characters/ChubbyActor";
import { ChubbyBodyPreview, FbxPreview } from "../characters/ChubbyBody";
import { Head, Headgear } from "../characters/Character";
import { faceSheetPath } from "../characters/face";
import { Flames, Smoke } from "../fx/Fire";
import SETS from "./sets.json";

// ─────────────────────────────────────────────────────────────────────────────
// Cut templates (v2 "micro-beats"): one short shot per phrase, chosen by name in
// scenes.txt (`cut: <cue> | <shot> | face= | do= | fx= | tr=`). Every shot moves:
// punch-in on entry, slow push, handheld drift. Gestures come from the gesture kit.
// ─────────────────────────────────────────────────────────────────────────────

export type Cut = { cue: string; shot: string; face: Expression; do?: string; fx?: string; tr: "cut" | "whip" | "flash" | "hard" | "dive"; start: number; end: number };
export type CutBeat = { id: string; speaker: "inspector" | "vo"; preset: LightingPresetName; words: WordTiming[]; start: number; end: number };
export type CutInput = { beat: CutBeat; cut: Cut; t: number; dur: number; abs: number };

const HY = HEAD_HEIGHT;
const P = (b: CutBeat) => style.lighting[b.preset];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
// these templates were framed for the original body (head centre at 1.7684 m); taller bodies (style.body)
// lift every camera height by the same ratio so heads stay in frame
const BODY_K = HY / 1.7684;
const lift = (c: CameraState): CameraState => ({ ...c, position: [c.position[0], c.position[1] * BODY_K, c.position[2]], target: [c.target[0], c.target[1] * BODY_K, c.target[2]] });
const live = (cam: CameraState, t: number, dur: number, opts: { punch?: number; push?: number; shake?: number } = {}) => {
  let c = push(cam, t / Math.max(dur, 0.3), opts.push ?? 0.07);
  if (opts.punch) c = punchIn(c, t, opts.punch);
  if (opts.shake) c = shake(c, t, opts.shake);
  const H = (style as unknown as { camera: { handheld: { pos: number; target: number; roll: number } } }).camera.handheld;
  return handheld(c, t + 3, H.pos, H.target, H.roll);
};
const talk = (b: CutBeat, abs: number): MouthSlot => (b.speaker === "inspector" ? mouthAt(b.words, abs) : "rest");

// one character with face + gesture from the cut
const Actor: React.FC<{ def: CharacterDef; cut: Cut; t: number; position: Vec3; rotationY?: number; mouth?: MouthSlot; pose?: Pose; face?: Expression }> = ({
  def,
  cut,
  t,
  position,
  rotationY = 0,
  mouth = "rest",
  pose = {},
  face,
}) => {
  const g = gesture(cut.do, t);
  const idle: Pose = { bob: Math.sin(t * 2.3) * 0.01, headTilt: Math.sin(t * 1.3) * 0.03 };
  return <Character def={def} expression={face ?? cut.face} mouth={g.mouth ?? mouth} position={position} rotationY={rotationY} pose={{ ...idle, ...pose, ...g }} />;
};

// world position of a glove (to frame hand inserts exactly)
const handWorld = (pos: Vec3, rotY: number, scale: number, side: 1 | -1, arm: [number, number]): Vec3 => {
  const v = new THREE.Vector3(0, -0.6, 0).applyEuler(new THREE.Euler(-arm[0], 0, side * arm[1])); // elbow arm reach
  v.add(new THREE.Vector3(side * 0.41, 1.06, 0)).multiplyScalar(scale).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  return [v.x + pos[0], v.y + pos[1], v.z + pos[2]];
};

const INSP: Vec3 = [0.6, 0, 1.4];
// templates are authored for the original body; cutShot() lifts camera + focus to the real height
const face = (p: Vec3, s = 1): Vec3 => [p[0], p[1] + 1.7684 * s, p[2] + 0.45 * s];

// ── crowd for the lifeboat beats (spawn times give the "piling in" gag) ──
const CROWD = makeCrowd({ seed: "v2-deck", count: 30, area: { x: [-2.6, 2.7], z: [-12, 2.2] }, faceToward: [3, -9], minGap: 0.85 });
const WOMEN = makeCrowd({ seed: "v3-women", count: 9, area: { x: [-3, 0], z: [-2, 2] }, kind: "workers", minGap: 0.5 });

type T = (i: CutInput) => ShotOutput;

const TPL: Record<string, T> = {
  // ── Inspector on deck ──
  "insp-medium": ({ beat, cut, t, dur, abs }) => ({
    camera: live({ position: [-0.15, 1.95, 5.8], target: [0.55, 1.45, 1.4], fov: 34 }, t, dur),
    focus: face(INSP),
    focusRange: 1.4,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={INSP} rotationY={-0.12} mouth={talk(beat, abs)} />
      </>
    ),
  }),
  "insp-punch": ({ beat, cut, t, dur, abs }) => ({
    camera: live(wideClose(face(INSP), -0.15, 1.5, 58), t, dur, { punch: 0.35, push: 0.05 }),
    focus: face(INSP),
    focusRange: 0.9,
    bokeh: 12,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={INSP} rotationY={-0.12} mouth={talk(beat, abs)} />
      </>
    ),
  }),
  "insp-dutch": ({ beat, cut, t, dur, abs }) => ({
    camera: live({ position: [1.5, 0.85, 4.4], target: [0.6, 1.85, 1.4], fov: 42, roll: 0.24 }, t, dur, { punch: 0.15 }),
    focus: face(INSP),
    focusRange: 1.6,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={INSP} rotationY={0.25} mouth={talk(beat, abs)} />
      </>
    ),
  }),

  // ── the ship going down (night sea, model in silhouette) ──
  "ship-sinking": ({ beat, t, dur }) => ({
    camera: live({ position: [0, 2.2, 22], target: [0, 1.5, -40], fov: 32 }, t, dur, { shake: 0.05 }),
    focus: [0, 2, -40],
    focusRange: 30,
    bokeh: 2,
    content: (
      <>
        <Sea y={0} color={style.lighting.night.sea.color} amp={0.25} />
        <group position={[2, -1.2 - t * 0.8, -40]} rotation={[0.32 + t * 0.05, -0.6, 0]}>
          <ToyShip funnels={4} label=" " scale={16} />
        </group>
      </>
    ),
  }),

  // ── boiler room ──
  "furnace-insert": ({ cut, t, dur }) => ({
    camera: live({ position: [-0.4, 1.35, 2.3], target: [-1.15, 0.85, -0.7], fov: 44 }, t, dur, { push: 0.15 }),
    focus: [-1.2, 0.75, -0.7],
    focusRange: 0.8,
    bokeh: 10,
    content: (
      <>
        <BoilerRoom t={t + cut.start} />
      </>
    ),
  }),
  "stoker-furnace": ({ cut, t, dur }) => ({
    camera: live({ position: [2.3, 1.6, 3.4], target: [0.1, 1.2, 0.2], fov: 38 }, t, dur, { punch: 0.12 }),
    focus: face([0.3, 0, 0.4]),
    focusRange: 1.8,
    content: (
      <>
        <BoilerRoom t={t + cut.start} />
        <Actor def={BIBLE.stoker} cut={cut} t={t} position={[0.3, 0, 0.4]} rotationY={-0.5} />
      </>
    ),
  }),
  "stoker-yawn": ({ cut, t, dur }) => ({
    camera: live(wideClose(face([0.3, 0, 0.6], 0.97), 0.2, 2.0, 46), t, dur, { push: 0.1 }),
    focus: face([0.3, 0, 0.6], 0.97),
    focusRange: 1,
    bokeh: 10,
    content: (
      <>
        <BoilerRoom t={t + cut.start} />
        <Actor def={BIBLE.stoker} cut={cut} t={t} position={[0.3, 0, 0.6]} rotationY={0.2} />
      </>
    ),
  }),
  "stoker-yawn-hold": ({ cut, t, dur }) => ({
    camera: live(wideClose(face([0.3, 0, 0.6], 0.97), 0.2, 1.7, 46), t, dur, { push: 0.12 }),
    focus: face([0.3, 0, 0.6], 0.97),
    focusRange: 1,
    bokeh: 10,
    content: (
      <>
        <BoilerRoom t={t + cut.start} />
        <Actor def={BIBLE.stoker} cut={cut} t={t} position={[0.3, 0, 0.6]} rotationY={0.2} face="sad" pose={{ headNod: 0.25 + t * 0.15, headTilt: 0.1 }} />
      </>
    ),
  }),

  // ── CRUNCH: iceberg fills the frame, hard shake ──
  "iceberg-hit": ({ beat, t, dur }) => ({
    camera: live({ position: [1.2, 2.6, 4.5], target: [8, 3.5, -4], fov: 50 }, t, dur, { shake: 0.32, push: 0.02 }),
    focus: [8, 3, -4],
    focusRange: 12,
    bokeh: 3,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Iceberg size={9} seed={3} position={[10, -8.2, interpolate(t, [0, dur], [-9, 0])]} rotationY={0.4} />
      </>
    ),
  }),

  // ── stoker on deck ──
  "stoker-shocked-cu": ({ beat, cut, t, dur }) => ({
    camera: live(wideClose(face([1.2, 0, 1.6], 0.97), 0.35, 1.35, 62), t, dur, { punch: 0.4 }),
    focus: face([1.2, 0, 1.6], 0.97),
    focusRange: 0.8,
    bokeh: 12,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Actor def={BIBLE.stoker} cut={cut} t={t} position={[1.2, 0, 1.6]} rotationY={0.35} />
      </>
    ),
  }),
  "run-low": ({ beat, cut, t, dur }) => {
    const z = -7 + t * 3.6;
    return {
      camera: { position: [1.0, 0.45, z + 3.4], target: [1.3, 1.7, z], fov: 52, roll: 0.12 },
      motionBlur: 7, // sprint: speed blur
      focus: face([1.3, 0, z], 0.97),
      focusRange: 2,
      content: (
        <>
          <ShipDeck preset={P(beat)} />
          <Actor def={BIBLE.stoker} cut={cut} t={t} position={[1.3, 0, z]} rotationY={0} pose={{ walk: t * 12, stride: 1 }} />
        </>
      ),
    };
  },
  "count-fingers": ({ beat, cut, t, dur }) => {
    const pos: Vec3 = [1.2, 0, 1.0];
    const g = gesture(cut.do ?? "count", t);
    const hand = handWorld(pos, 0, BIBLE.stoker.body.scale, 1, (g.armL as [number, number]) ?? [1.75, -0.25]);
    return {
      camera: live({ position: [hand[0] - 0.25, hand[1] + 0.15, hand[2] + 1.15], target: [hand[0] + 0.05, hand[1] + 0.05, hand[2] - 0.2], fov: 42 }, t, dur, { push: 0.1 }),
      focus: hand,
      focusRange: 0.5,
      bokeh: 12,
      content: (
        <>
          <ShipDeck preset={P(beat)} />
          <Actor def={BIBLE.stoker} cut={{ ...cut, do: cut.do ?? "count" }} t={t} position={pos} rotationY={0} />
        </>
      ),
    };
  },
  "fingers-out": ({ beat, cut, t, dur }) => ({
    camera: live(wideClose(face([1.2, 0, 1.0], 0.97), 0, 2.4, 58, -0.2), t, dur, { punch: 0.35 }),
    focus: face([1.2, 0, 1.0], 0.97),
    focusRange: 1.2,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Actor def={BIBLE.stoker} cut={cut} t={t} position={[1.2, 0, 1.0]} rotationY={0} />
      </>
    ),
  }),

  // ── crowd gags ──
  "crowd-pile": ({ beat, t, dur }) => {
    const n = CROWD.length;
    return {
      camera: live({ position: [-2.4, 6.4, 9.2], target: [0.6, 0.4, -5.5], fov: interpolate(t, [0, dur], [36, 46]) }, t, dur, { push: -0.05 }),
      focus: [0.4, 1.2, -4],
      focusRange: 10,
      bokeh: 3,
      content: (
        <>
          <ShipDeck preset={P(beat)} />
          {CROWD.map((e, i) => {
            const at = (i / n) * dur * 0.85; // extras keep piling in
            const k = t - at;
            if (k < 0) return null;
            const drop = Math.max(0, 1.6 * (1 - k / 0.18)) + (k > 0.18 ? Math.abs(Math.sin((k - 0.18) * 18)) * 0.12 * Math.exp(-(k - 0.18) * 8) : 0);
            return <Character key={i} def={e.def} expression={e.expression} position={[e.position[0], drop, e.position[2]]} rotationY={e.rotationY} pose={{ armL: [0.3, 0.3], armR: [0.3, 0.3], bob: Math.sin(t * 3 + e.phase) * 0.015 }} />;
          })}
        </>
      ),
    };
  },
  "crowd-half": ({ beat, t, dur }) => ({
    camera: live({ position: [-2.2, 5.6, 8.0], target: [0.6, 0.6, -5.0], fov: 44 }, t, dur),
    focus: [0.4, 1.4, -4],
    focusRange: 10,
    bokeh: 3,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        {CROWD.map((e, i) => {
          const lucky = i % 2 === 0;
          const k = t - (i / CROWD.length) * dur * 0.6;
          const s = lucky && k > 0 ? spring({ frame: k * 30, fps: 30, config: { damping: 9, stiffness: 200 } }) : 0;
          return (
            <group key={i}>
              <Character def={e.def} expression={lucky ? "happy" : "worried"} position={e.position} rotationY={e.rotationY} pose={{ bob: Math.sin(t * 3 + e.phase) * 0.015 }} />
              {s > 0.01 && <MiniBoat position={[e.position[0], 2.75 + Math.sin(t * 4 + i) * 0.05, e.position[2]]} rotationY={t * 1.5 + i} scale={2.4 * s} />}
            </group>
          );
        })}
      </>
    ),
  }),
  "crowd-stare": ({ beat, t, dur }) => {
    const unlucky = CROWD.filter((_, i) => i % 2 === 1).slice(0, 9);
    return {
      camera: live({ position: [0.4, 1.9, 5.5], target: [0.3, 1.6, -2], fov: 40 }, t, dur, { push: 0.12 }),
      focus: [0.3, 1.8, 0],
      focusRange: 4,
      content: (
        <>
          <ShipDeck preset={P(beat)} />
          {unlucky.map((e, i) => {
            const x = -2 + (i % 5) * 1.0 + (i >= 5 ? 0.5 : 0);
            const z = i >= 5 ? -1.0 : 0.6;
            const turn = clamp01((t - 0.15 - i * 0.04) / 0.2);
            return <Character key={i} def={e.def} expression="sad" position={[x, 0, z]} rotationY={(1 - turn) * 1.6} pose={{ headTilt: -0.05 + (i % 3) * 0.05 }} />;
          })}
        </>
      ),
    };
  },

  // ── the twist: APPROVED ──
  stamp: ({ beat, cut, t, dur }) => ({
    camera: live({ position: [0.4, 2.15, 4.9], target: [0.4, 1.15, 1.6], fov: 38 }, t, dur, { shake: t > 0.32 && t < 0.7 ? 0.05 : 0, push: 0.04 }),
    focus: [0.3, 0.9, 1.8],
    focusRange: 1.6,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <pointLight position={[0.2, 3, 3.2]} color="#FFD9A0" intensity={4} distance={8} decay={1.6} />
        <Crate position={[0.4, 0, 2.05]} />
        <Certificate position={[0.2, 0.625, 1.92]} stamped={clamp01((t - 0.32) / 0.08)} />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={INSP} rotationY={0} pose={{ holdR: "stamp", noProp: false }} face={t > 0.5 ? "worried" : cut.face} />
      </>
    ),
  }),

  // ── 1894 rulebook ──
  "rulebook-open": ({ beat, cut, t, dur }) => ({
    camera: live({ position: [0.4, 2.0, 5.6], target: [0.45, 1.35, 1.4], fov: 33 }, t, dur, { punch: 0.2, push: 0.12 }),
    focus: [0.45, 1.3, 1.6],
    focusRange: 1.5,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <pointLight position={[-0.4, 2.7, 3.2]} color="#FFD9A0" intensity={4} distance={8} decay={1.6} />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={[0.4, 0, 1.2]} rotationY={0} pose={{ armL: [1.15, 0.05], armR: [1.15, 0.05], headNod: 0.25, noProp: true }} />
        <Rulebook position={[0.45, 1.02, 1.95]} rotation={[-0.55, 0, 0]} scale={0.95} highlight={0} />
      </>
    ),
  }),
  "rulebook-row": ({ beat, t, dur }) => ({
    camera: live({ position: [0.62, 1.55, 3.3], target: [0.62, 0.62, 1.95], fov: 30 }, t, dur, { punch: 0.18, push: 0.1 }),
    focus: [0.62, 0.85, 1.95],
    focusRange: 0.8,
    bokeh: 10,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <pointLight position={[-0.4, 2.7, 3.2]} color="#FFD9A0" intensity={4} distance={8} decay={1.6} />
        <Character def={BIBLE.inspector} expression="angry" position={[0.4, 0, 1.2]} pose={{ armL: [1.15, 0.05], armR: [1.15, 0.05], headNod: 0.25, noProp: true }} />
        <Rulebook position={[0.45, 1.02, 1.95]} rotation={[-0.55, 0, 0]} scale={0.95} highlight={clamp01(t / (dur * 0.5))} />
      </>
    ),
  }),

  // ── size gags on the crate ──
  "ship-too-big": ({ beat, cut, t, dur }) => {
    const land = 0.28;
    const y = t < land ? 0.66 + 2.2 * (1 - (t / land) ** 2) : 0.66 + Math.abs(Math.sin((t - land) * 16)) * 0.08 * Math.exp(-(t - land) * 7);
    return {
      camera: live({ position: [0.5, 2.9, 5.8], target: [0.5, 1.05, 1.7], fov: 42 }, t, dur, { shake: t > land && t < land + 0.4 ? 0.06 : 0 }),
      focus: [0.5, 0.8, 1.95],
      focusRange: 1.8,
      content: (
        <>
          <ShipDeck preset={P(beat)} />
          <pointLight position={[0.2, 3, 3.4]} color="#FFD9A0" intensity={4} distance={8} decay={1.6} />
          <Crate position={[0.5, 0, 2.0]} />
          <Rulebook position={[0.25, 0.64, 2.0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.8} highlight={1} />
          <ToyShip funnels={4} label="TITANIC 46,328 tons" position={[0.55, y, 2.02]} rotationY={-0.35} scale={1.25} />
          <Actor def={BIBLE.inspector} cut={cut} t={t} position={[0.5, 0, 0.75]} rotationY={0} />
        </>
      ),
    };
  },
  "boats-16": ({ beat, cut, t, dur }) => ({
    camera: live({ position: [0.5, 2.9, 5.6], target: [0.5, 1.05, 1.7], fov: 42 }, t, dur),
    focus: [0.5, 0.8, 1.95],
    focusRange: 1.8,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <pointLight position={[0.2, 3, 3.4]} color="#FFD9A0" intensity={4} distance={8} decay={1.6} />
        <Crate position={[0.5, 0, 2.0]} />
        <Boats count={16} t={t} each={Math.min(0.06, (dur * 0.7) / 16)} />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={[0.5, 0, 0.75]} rotationY={0} />
      </>
    ),
  }),
  "boats-plus4": ({ beat, cut, t, dur }) => ({
    camera: live({ position: [0.5, 2.85, 5.4], target: [0.5, 1.05, 1.7], fov: 42 }, t, dur, { punch: 0.12 }),
    focus: [0.5, 0.8, 1.95],
    focusRange: 1.8,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <pointLight position={[0.2, 3, 3.4]} color="#FFD9A0" intensity={4} distance={8} decay={1.6} />
        <Crate position={[0.5, 0, 2.0]} />
        <Boats count={16} t={99} each={0} />
        <Boats count={4} t={t - 0.15} each={0.12} offset={16} color="#FFB13B" />
        {t > 0.7 && <TextLabel text="+4" position={[1.45, 1.25, 2.3]} width={0.6} />}
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={[0.5, 0, 0.75]} rotationY={0} />
      </>
    ),
  }),

  // ── revision 2 (POV survival script) ──
  // 2:05 a.m., the deck is tilting: the whole world is rolled, the Inspector braces
  "insp-tilt": ({ beat, cut, t, dur, abs }) => ({
    camera: live({ position: [-0.15, 1.95, 5.8], target: [0.55, 1.45, 1.4], fov: 36, roll: 0.16 + Math.sin(t * 0.8) * 0.02 }, t, dur, { push: 0.08 }),
    focus: face(INSP),
    focusRange: 1.4,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={INSP} rotationY={-0.12} mouth={talk(beat, abs)} pose={{ lean: -0.05, armL: [0.6, 0.6] }} />
      </>
    ),
  }),
  // 20 boats on the crate, number on screen
  "boats-20": ({ beat, cut, t, dur }) => ({
    camera: live({ position: [0.5, 2.9, 5.4], target: [0.5, 1.05, 1.7], fov: 42 }, t, dur, { punch: 0.12 }),
    focus: [0.5, 0.8, 1.95],
    focusRange: 1.8,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <pointLight position={[0.2, 3, 3.4]} color="#FFD9A0" intensity={4} distance={8} decay={1.6} />
        <Crate position={[0.5, 0, 2.0]} />
        <Boats count={20} t={t} each={Math.min(0.05, (dur * 0.6) / 20)} perRow={10} />
        {t > 0.4 && <TextLabel text="20 BOATS" position={[0.5, 1.5, 2.3]} width={1.3} />}
      </>
    ),
  }),
  // the crowd from above, number on screen
  "crowd-2200": ({ beat, t, dur }) => ({
    camera: live({ position: [0.6, 15, -2.0], target: [0.5, 0, -4.6], fov: 44, roll: 0.25 }, t, dur, { push: -0.06 }),
    focus: [0.5, 1.5, -4.6],
    focusRange: 12,
    bokeh: 2,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        {CROWD.map((e, i) => (
          <Character key={i} def={e.def} expression={e.expression} position={e.position} rotationY={e.rotationY} pose={{ headNod: -0.4, bob: Math.abs(Math.sin(t * 5 + e.phase)) * 0.03 }} />
        ))}
        {t > 0.3 && <TextLabel text="2,200 PEOPLE" position={[0.5, 4.5, -3.8]} rotation={[-1.25, 0, -0.25]} width={4.2} />}
      </>
    ),
  }),
  // an officer waves women and children in
  "officer-wave": ({ beat, cut, t, dur }) => ({
    camera: live({ position: [1.6, 1.9, 5.6], target: [0.9, 1.4, 1.2], fov: 38 }, t, dur, { push: 0.08 }),
    focus: face([1.4, 0, 1.2]),
    focusRange: 2.2,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Actor def={BIBLE.officer} cut={{ ...cut, do: cut.do ?? "wave" }} t={t} position={[1.4, 0, 1.2]} rotationY={-0.7} face={cut.face} />
        {WOMEN.map((e, i) => (
          <Character key={i} def={e.def} expression={i % 2 ? "scared" : "worried"} position={[-0.3 - (i % 3) * 0.9, 0, 1.6 - Math.floor(i / 3) * 1.1]} rotationY={1.2} pose={{ walk: t * 6 + i, stride: 0.35 }} />
        ))}
      </>
    ),
  }),
  // an earlier boat rows away half empty
  "boat-away": ({ beat, t, dur }) => ({
    camera: live({ position: [3.6, 1.2, 3], target: [7.5, -7.0, -4 - t * 0.6], fov: 44 }, t, dur, { push: 0.04 }),
    focus: [7.5, -6.8, -4],
    focusRange: 6,
    bokeh: 4,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <group position={[7.5, -6.9, -4 - t * 0.6]} rotation={[0, 0.3, Math.sin(t * 1.3) * 0.04]}>
          {/* hull floats ON the sea (bottom above the water plane, so it never looks flooded) */}
          <mesh rotation={[Math.PI, 0, 0]} scale={[1.6, 0.45, 4.2]} castShadow>
            <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#EDE8DC" side={THREE.DoubleSide} roughness={0.7} />
          </mesh>
          {/* a lantern on the boat so it reads on the night sea */}
          <pointLight position={[0, 1.6, 0]} color="#FFD08A" intensity={14} distance={10} decay={1.4} />
          <mesh position={[0, 0.9, 0.4]}>
            <sphereGeometry args={[0.12, 10, 8]} />
            <meshBasicMaterial color="#FFE2A8" toneMapped={false} />
          </mesh>
          {[[-0.4, -2.2], [0.4, -1.6], [0, 2.4]].map(([x, z], i) => (
            <Character key={i} def={WOMEN[i].def} expression="sad" position={[x, -0.4, z]} rotationY={Math.PI} pose={{ headNod: 0.2 }} />
          ))}
        </group>
        <TextLabel text="HALF EMPTY" position={[7.5, -5.4, -4 - t * 0.6]} rotation={[-0.7, -0.4, 0]} width={3.2} />
      </>
    ),
  }),

  // -- review 2: ACTION-FIRST demo shots (real body size; every shot = someone does something) --
  // the crowd surges toward the rail and the last boat; an officer holds them back with a lantern
  "deck-surge": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [3.4, 4.4, 8.2], target: [0.4, 1.4, 0.2], fov: 46 }, t, dur, { push: 0.1 }),
    focus: [1.4, 1.9, 0.8],
    focusRange: 4,
    bokeh: 6,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <DeckBoat position={[4.35, 0.8, 1.4]} falls={false} />
        <Character def={BIBLE.officer} expression="angry" mouth="wide" position={[2.65, 0, 1.4]} rotationY={-Math.PI / 2} pose={gesture("lantern", t)} />
        {CROWD.slice(0, 22).map((e, i) => {
          const g = gesture("surge", t + e.phase);
          return <Character key={i} def={e.def} expression={i % 3 ? "scared" : "shocked"} mouth={i % 2 ? "wide" : "rest"} position={[e.position[0] * 0.7 - 0.2, 0, e.position[2] * 0.35 + 1.2]} rotationY={Math.PI / 2 + (e.rotationY % 0.5) - 0.25} pose={g} />;
        })}
      </>
    ),
  }),
  // an officer shoves a man back from the boat; the man flies backwards
  "officer-shove": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [1.7, 2.3, 7.6], target: [1.9, 1.8, 1.2], fov: 46 }, t, dur, { push: 0.06, shake: t > 0.3 && t < 0.6 ? 0.04 : 0 }),
    focus: [1.9, 1.9, 1.2],
    focusRange: 2,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <DeckBoat position={[4.35, 0.8, 1.4]} falls={false} />
        <Character def={BIBLE.officer} expression="angry" mouth="wide" position={[2.8, 0, 1.2]} rotationY={-Math.PI / 2 + 0.35} pose={gesture("shove", t)} />
        <Character def={BIBLE.passenger} expression={t > 0.3 ? "shocked" : "angry"} mouth="wide" position={[1.35, 0, 1.2]} rotationY={Math.PI / 2 + 0.35} pose={t > 0.3 ? gesture("pushed", t - 0.3) : gesture("surge", t)} />
        {CROWD.slice(0, 10).map((e, i) => (
          <Character key={i} def={e.def} expression="scared" position={[-0.8 - (i % 4) * 0.9, 0, -1.2 + Math.floor(i / 4) * 1.1]} rotationY={Math.PI / 2} pose={gesture("surge", t + e.phase)} />
        ))}
      </>
    ),
  }),
  // a woman climbs over the rail into the boat, clutching a life jacket; the officer waves her in
  "climb-boat": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [4.2, 2.5, 6.8], target: [2.9, 1.6, 1.8], fov: 44 }, t, dur, { push: 0.08 }),
    focus: [2.8, 1.8, 1.9],
    focusRange: 2.2,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <DeckBoat position={[4.35, 0.8, 1.9]} falls={false}>
          {[-1.9].map((z, i) => (
            <Character key={z} def={WOMEN[i + 3].def} expression="worried" position={[0, -0.55, z]} rotationY={-Math.PI / 2} pose={gesture("crouch", t)} />
          ))}
        </DeckBoat>
        <Character def={WOMEN[0].def} expression="scared" position={[2.45, 0, 2.0]} rotationY={Math.PI / 2} pose={{ ...gesture("climbin", t), holdR: "lifejacket" }} />
        <Character def={BIBLE.officer} expression="determined" mouth="wide" position={[2.55, 0, 0.6]} rotationY={-0.6} pose={gesture("wave", t)} />
      </>
    ),
  }),
  // a sailor fires a distress rocket; it streaks up and bursts over the ship
  "rocket-fire": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [-0.2, 0.9, 5.4], target: [1.6, 4.4, -1.6], fov: 54, roll: -0.08 }, t, dur, { push: 0.04, shake: t > 0.3 && t < 0.7 ? 0.05 : 0 }),
    focus: [1.5, 2.2, -0.6],
    focusRange: 6,
    bokeh: 3,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Character def={BIBLE.officer} expression="determined" position={[1.5, 0, -0.6]} rotationY={0.35} pose={gesture("rocket", t)} />
        <RocketFlare t={t - 0.3} from={[1.25, 3.4, -0.4]} height={7.5} />
      </>
    ),
  }),
  // a stoker sprints along the deck with a lantern; the camera tracks with him
  "stoker-dash": ({ beat, t, dur }) => {
    const x = -3.2 + 4 * t;
    return {
      real: true,
      camera: { position: [x + 3.4, 2.0, 3.6], target: [x + 0.2, 1.8, 0.4], fov: 46, roll: 0.05 },
      motionBlur: 3,
      focus: [x, 1.9, 0.4],
      focusRange: 2.5,
      content: (
        <>
          <ShipDeck preset={P(beat)} />
          <Character def={BIBLE.stoker} expression="scared" mouth="wide" position={[-3.2, 0, 0.4]} rotationY={Math.PI / 2} pose={{ ...gesture("runacross", t), holdR: "lantern", armR: [2.2, 0.3], elbowR: 0.3, noProp: true }} />
          {CROWD.slice(10, 16).map((e, i) => (
            <Character key={i} def={e.def} expression="scared" position={[-1 + i * 1.6, 0, -1.6 - (i % 2) * 0.8]} rotationY={Math.PI / 2 + 0.3} pose={gesture("panic", t + e.phase)} />
          ))}
        </>
      ),
    };
  },
  // the lifeboat drops down the ship's side, people clinging on
  "boat-lowering": ({ beat, t, dur }) => {
    const y = 0.8 - 2.2 * t;
    return {
      real: true,
      camera: live({ position: [9.0, y + 1.8, 4.0], target: [4.3, y + 0.3, 0.3], fov: 46 }, t, dur, { push: 0.03, shake: 0.015 }),
      focus: [4.4, y, 0.3],
      focusRange: 3,
      content: (
        <>
          <ShipDeck preset={P(beat)} />
          <DeckBoat position={[4.45, y, 0.3]} rotationY={Math.sin(t * 2.3) * 0.04}>
            {[-1.6, -0.5, 0.6].map((z, i) => (
              <Character key={z} def={WOMEN[i + 5].def} expression={i === 1 ? "sad" : "scared"} position={[0, -0.55, z]} rotationY={Math.PI / 2 + (i - 1) * 0.3} pose={gesture("crouch", t)} />
            ))}
            <Character def={BIBLE.passenger} expression="worried" position={[0, -0.55, 1.6]} rotationY={Math.PI / 2} pose={{ ...gesture("wave", t), sink: 0.25 }} />
          </DeckBoat>
        </>
      ),
    };
  },
  // a man takes his chance: leaps from the rail toward the boat below
  "man-leap": ({ beat, t, dur }) => {
    const g = gesture("leap", t);
    const r = (g.root as [number, number, number]) ?? [0, 0, 0];
    const drop = Math.max(0, t - 0.5) ** 2 * 11;
    const my = r[1] * 1.2 - drop; // the man's height above the deck: the camera follows him
    const mx = 2.35 + r[2] * 1.25;
    return {
      real: true,
      camera: live({ position: [5.8, my + 0.6, 4.2], target: [mx, my + 1.9, 0.6], fov: 54 }, t, dur, { push: 0.03 }),
      motionBlur: t > 0.4 ? 5 : 0,
      focus: [3.5, 1.2, 0.6],
      focusRange: 3,
      content: (
        <>
          <ShipDeck preset={P(beat)} />
          <DeckBoat position={[4.6, -1.7, 0.6]} />
          <Character def={BIBLE.passenger} expression={t > 0.3 ? "shocked" : "determined"} mouth={t > 0.3 ? "wide" : "rest"} position={[2.35, 0, 0.6]} rotationY={Math.PI / 2} pose={{ ...g, root: [r[0], r[1] * 1.2 - drop, r[2] * 1.25] }} />
        </>
      ),
    };
  },

  // TEMP: chubby rigged soldier playing mocap (do = clip name)
  "chubby-mocap": ({ beat, cut, t }) => ({
    real: true,
    camera: { position: [14.6, TRENCH.H + 1.6, 4.8], target: [14.6, TRENCH.H + 1.25, -2], fov: 46 },
    focus: [14.6, TRENCH.H + 1.3, -2],
    focusRange: 3,
    content: (
      <>
        <Trench preset={P(beat)} />
        <ChubbyActor def={BIBLE.tommy} clip={(cut.do as "rifle-aim") ?? "rifle-aim"} t={t} position={[13.6, TRENCH.H, -2]} rotationY={0.35} expression="scared" rifle />
        <ChubbyActor def={BIBLE.enemy} clip="rifle-walk" t={t + 0.3} position={[15.7, TRENCH.H, -2.6]} rotationY={-0.4} expression="angry" uniform="fieldgrey" rifle />
        <ChubbyActor def={BIBLE.enemy} clip="rifle-run" t={t + 0.1} position={[17.2, TRENCH.H, -4.6]} rotationY={-0.9} expression="angry" uniform="fieldgrey" rifle />
      </>
    ),
  }),
  // TEMP: the owner's chubby character, dressed in the WW1 uniform, with the reference face + helmet
  "sketch-test": ({ beat, cut }) => {
    const side = cut.do === "side";
    const K = 1.7;
    return {
      real: true,
      camera: side ? { position: [17.3, TRENCH.H + 1.5, 0.6], target: [14.5, TRENCH.H + 1.4, -2], fov: 44 } : { position: [14.5, TRENCH.H + 1.5, 3.0], target: [14.5, TRENCH.H + 1.4, -2], fov: 44 },
      focus: [14.5, TRENCH.H + 1.4, -2],
      focusRange: 3,
      content: (
        <>
          <Trench preset={P(beat)} />
          <ChubbyBodyPreview src="models/dressed/dressed_soldier.obj" showSkin position={[14.5, TRENCH.H, -2]} scale={K}>
            <group position={[0, 1.28, 0.02]} scale={0.5}>
              <Head sheet={faceSheetPath("tommy", "R")} variant="R" expression="neutral" mouth="rest" />
              <Headgear g={BIBLE.tommy.headgear} />
            </group>
          </ChubbyBodyPreview>
        </>
      ),
    };
  },
  // TEMP: chubby soldier body (T-pose, before rigging) with our head + helmet
  "chubby-test": ({ beat, cut }) => {
    const side = cut.do === "side";
    const K = 1.7;
    return {
      real: true,
      camera: side ? { position: [17.5, TRENCH.H + 1.6, 1.0], target: [14.5, TRENCH.H + 1.3, -2], fov: 42 } : { position: [14.5, TRENCH.H + 1.5, 3.0], target: [14.5, TRENCH.H + 1.35, -2], fov: 42 },
      focus: [14.5, TRENCH.H + 1.4, -2],
      focusRange: 3,
      content: (
        <>
          <Trench preset={P(beat)} />
          <ChubbyBodyPreview position={[14.5, TRENCH.H, -2]} scale={K}>
            <group position={[0, 1.4, 0.0]} scale={0.48}>
              <Head sheet={faceSheetPath("tommy", "R")} variant="R" expression="neutral" mouth="rest" />
              <Headgear g={BIBLE.tommy.headgear} />
            </group>
          </ChubbyBodyPreview>
        </>
      ),
    };
  },
  // TEMP: new look test (reference face + real helmets + big gloves on the small mocap body)
  "mocap-test": ({ beat, cut, t }) => {
    const look = { headK: 0.72, gloves: true, slim: 0.65, tint: "#C9B88C", bodyK: 1.0 };
    const enemyLook = { ...look, tint: "#9AA290" };
    const close = cut.do === "close";
    return {
      real: true,
      camera: close ? { position: [13.7, TRENCH.H + 1.7, 1.2], target: [13.5, TRENCH.H + 1.6, -2], fov: 40 } : { position: [14.3, TRENCH.H + 1.5, 5.0], target: [14.3, TRENCH.H + 1.3, -2], fov: 42 },
      focus: [14.2, TRENCH.H + 1.5, -2],
      focusRange: 3,
      content: (
        <>
          <Trench preset={P(beat)} />
          <Prop id="wooden_military_crate" position={[16.4, TRENCH.H, -3.4]} rotation={[0, 0.5, 0]} size={1.0} />
          <Prop id="dead_tree_trunk" position={[18, TRENCH.H, -9]} size={1.0} />
          <MocapActor def={BIBLE.tommy} clip="rifle-aim" t={t} position={[13.5, TRENCH.H, -2]} rotationY={0.25} expression={close ? "neutral" : "scared"} look={look} holdR="rifle" />
          <MocapActor def={BIBLE.enemy} clip="rifle-aim" t={t + 1} position={[15.1, TRENCH.H, -2.4]} rotationY={-0.35} expression="happy" look={enemyLook} holdR="rifle" />
        </>
      ),
    };
  },
  // TEMP: real CC0 models in the trench (proof of loading + scale)
  "props-test": ({ beat, t }) => ({
    real: true,
    camera: { position: [0.6, 2.4, 7.5], target: [0, 1.2, 0], fov: 55 },
    focus: [0, 1.2, 1],
    focusRange: 8,
    content: (
      <>
        <Trench preset={P(beat)} />
        <Prop id="barrel_03" position={[0.8, 0, 2.5]} />
        <Prop id="wooden_military_crate" position={[-0.8, 0, 3.2]} rotation={[0, 0.4, 0]} />
        <Prop id="ammo_box" position={[0.7, 0, 4.4]} rotation={[0, -0.6, 0]} />
        <Prop id="cement_bag" position={[-0.7, 0, 1.0]} rotation={[0, 1.2, 0]} />
        <Prop id="wooden_ladder" position={[1.25, 0, -0.5]} rotation={[-0.25, -Math.PI / 2, 0]} />
        <Prop id="old_gas_mask" position={[-0.4, 0.1, 4.8]} />
        <Prop id="rusted_spade_01" position={[-1.2, 0, -1.2]} rotation={[0, 0, 0.3]} />
        <Prop id="dead_tree_trunk" position={[4, TRENCH.H, -3]} />
        <Prop id="tree_stump_02" position={[-4, TRENCH.H, 1]} />
        <Prop id="rock_07" position={[3, TRENCH.H, 4]} />
        <Character def={BIBLE.tommy} expression="scared" position={[0, 0, 0.4]} rotationY={0.2} pose={gesture("aim", t)} />
      </>
    ),
  }),
  // -- "Trench Trap" line 1 (after the reference's first 2 s) --
  // (a) high, behind the enemy: soldiers with rifles close in on the trench; barrels in the foreground.
  //     The next shot (same place) makes the camera DIVE down into the trench.
  "enemies-close-in": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [21, TRENCH.H + 7.5, 5.0], target: [2.0, 1.0, 0.8], fov: 46 }, t, dur, { push: 0.1 }),
    focus: [9.5, TRENCH.H + 1.5, 1.4],
    focusRange: 7,
    bokeh: 3,
    content: (
      <>
        <Trench preset={P(beat)} />
        <Barrel p={[17.6, TRENCH.H, 4.6]} />
        <Barrel p={[18.4, TRENCH.H, 3.3]} tipped />
        <Barrel p={[17.0, TRENCH.H, 6.0]} />
        {[
          { x: 10.6, z: 1.0, ph: 0 },
          { x: 11.6, z: 3.6, ph: 0.35 },
          { x: 9.4, z: -1.6, ph: 0.6 },
          { x: 12.4, z: -0.8, ph: 0.2 },
          { x: 13.6, z: 5.6, ph: 0.8 },
          { x: 14.8, z: -3.0, ph: 0.45 },
        ].map((e, i) => (
          <Character key={i} def={BIBLE.enemy} expression="angry" position={[e.x, TRENCH.H, e.z]} rotationY={-Math.PI / 2 + (e.z - 1) * 0.04} pose={{ ...gesture("advance", t + e.ph), root: [0, 0, t * 2.2] }} />
        ))}
      </>
    ),
  }),
  // (b) you, crouched and cornered at the end of the trench, hand up; rifles aimed down over every edge
  "you-trapped": ({ beat, t, dur }) => {
    const rise = (d: number) => {
      const k = Math.max(0, Math.min(1, (t - d) / 0.25));
      const p = k - 1;
      return TRENCH.H - 1.8 * (1 - (1 + 2.6 * p * p * p + 1.6 * p * p));
    };
    return {
      real: true,
      camera: live({ position: [-0.6, 1.6, -2.2], target: [0.4, 2.7, -6.6], fov: 58 }, t, dur, { push: 0.12, shake: 0.015 }),
      focus: [0.5, 1.8, -6.4],
      focusRange: 1.8,
      bokeh: 6,
      content: (
        <>
          <Trench preset={P(beat)} />
          <Character def={BIBLE.tommy} expression="scared" mouth={t > 0.3 ? "round" : "rest"} position={[0.55, 0, -6.5]} rotationY={-0.25} pose={{ ...gesture("crouch", t), lean: 0.05, headNod: -0.3, headYaw: Math.sin(t * 2.6) * 0.35, armR: [2.0, 0.55], elbowR: 0.7, fingersR: 4, armL: [1.0, -0.3], elbowL: 1.2, holdL: "rifle" }} />
          {[
            { x: 2.6, z: -5.4, r: -Math.PI / 2 - 0.4, d: 0.15 },
            { x: 0.2, z: -8.6, r: 0.15, d: 0.3 },
            { x: -1.9, z: -8.7, r: 0.5, d: 0.45 },
            { x: 2.7, z: -3.0, r: -Math.PI / 2 - 0.1, d: 0.6 },
          ].map((e, i) => (
            <Character key={i} def={BIBLE.enemy} expression="angry" position={[e.x, rise(e.d), e.z]} rotationY={e.r} pose={gesture("aim", t + i * 0.6)} />
          ))}
        </>
      ),
    };
  },

  // -- trench Short ("The Flamethrower Trap", dramatized). Real body size. --
  // "Enemy soldiers have you cornered": you, looking up; rifles aimed down from both parapets
  "trench-cornered": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [1.0, 1.6, 10.2], target: [-0.3, 3.6, 1.8], fov: 58 }, t, dur, { push: 0.12 }),
    focus: [0, 2.4, 3.2],
    focusRange: 4,
    bokeh: 5,
    content: (
      <>
        <Trench preset={P(beat)} />
        <Character def={BIBLE.tommy} expression="scared" position={[0.1, 0, 3.4]} rotationY={-0.35} pose={{ armL: [0.5, 0.4], armR: [0.6, 0.4], headNod: -0.4, headYaw: -0.2, bob: Math.sin(t * 9) * 0.02, holdR: "rifle", noProp: true }} />
        {[[-2.4, 0.6, Math.PI / 2 - 0.3], [-2.5, 3.2, Math.PI / 2 + 0.2], [2.5, 1.6, -Math.PI / 2 + 0.2]].map(([x, z, r], i) => (
          <Character key={i} def={BIBLE.enemy} expression="angry" position={[x, TRENCH.H, z]} rotationY={r} pose={gesture("aim", t + i * 0.7)} />
        ))}
      </>
    ),
  }),
  // "so you make a plan": tight on your face, eyes narrowing, enemies blurred above
  "you-plan": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [0.7, 2.6, 6.9], target: [0.1, 2.6, 3.4], fov: 42 }, t, dur, { push: 0.12 }),
    focus: [0.1, 2.6, 3.4],
    focusRange: 1,
    bokeh: 8,
    content: (
      <>
        <Trench preset={P(beat)} />
        <Character def={BIBLE.tommy} expression="determined" position={[0.1, 0, 3.4]} rotationY={0.1} pose={{ ...gesture("think", t), headYaw: -0.25 + Math.min(t, 0.6) * 0.4 }} />
        {[[-2.4, 0.6], [2.5, 1.6]].map(([x, z], i) => (
          <Character key={i} def={BIBLE.enemy} expression="angry" position={[x, TRENCH.H, z]} rotationY={x < 0 ? Math.PI / 2 : -Math.PI / 2} pose={gesture("aim", t + i)} />
        ))}
      </>
    ),
  }),
  // "One of them climbs up": low angle from the floor, the flamethrower man steps onto the parapet
  "flame-climb": ({ beat, t, dur }) => {
    const k = Math.min(1, t / 0.7);
    return {
      real: true,
      camera: live({ position: [0.9, 0.7, 5.6], target: [-1.6, 4.6, 0.6], fov: 54, roll: -0.06 }, t, dur, { push: 0.08 }),
      focus: [-2.2, 4.8, 0.4],
      focusRange: 3,
      content: (
        <>
          <Trench preset={P(beat)} />
          <Character def={BIBLE.flamer} expression="angry" position={[-2.6 + 0.7 * k, TRENCH.H + 0.45 * Math.sin(k * Math.PI * 0.5), 0.4]} rotationY={Math.PI / 2 - 0.2} pose={k < 1 ? { ...gesture("climbin", t), holdR: "flamegun", noProp: true } : gesture("spray", t - 0.7)} />
          <Character def={BIBLE.enemy} expression="angry" position={[-2.7, TRENCH.H, 3.2]} rotationY={Math.PI / 2} pose={gesture("aim", t)} />
        </>
      ),
    };
  },
  // "and hoses the trench with fire": the jet pours down the trench behind you, you flinch toward camera
  "flame-blast": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [1.0, 2.0, 11.0], target: [-0.6, 3.1, 2.4], fov: 56 }, t, dur, { push: 0.1, shake: 0.05 }),
    focus: [0.2, 2.4, 4.4],
    focusRange: 3,
    bokeh: 4,
    content: (
      <>
        <Trench preset={P(beat)} />
        <Character def={BIBLE.flamer} expression="angry" position={[-1.9, TRENCH.H + 0.45, 0.2]} rotationY={Math.PI / 2 + 0.35} pose={gesture("spray", t)} />
        <FireJet t={t} from={[-0.6, TRENCH.H + 1.6, 1.3]} to={[0.1, 0.2, 2.2]} />
        <Character def={BIBLE.tommy} expression="shocked" mouth="wide" position={[0.2, 0, 4.4]} rotationY={0.25} pose={{ ...gesture("recoil", t), holdR: "rifle", noProp: true, root: [0, 0, Math.min(t, 0.5) * 1.2] }} />
      </>
    ),
  }),
  // "You scream, throw down your rifle": arms up, the rifle clatters to the duckboards, fire behind
  "you-drop": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [0.7, 2.2, 8.4], target: [0.0, 2.2, 4.4], fov: 44 }, t, dur, { punch: 0.25, shake: 0.03 }),
    focus: [0.1, 2.4, 4.6],
    focusRange: 1.6,
    bokeh: 6,
    content: (
      <>
        <Trench preset={P(beat)} />
        <Flames t={t} position={[0.2, 0.1, 1.6]} size={1.9} seed={3} />
        <Flames t={t + 0.5} position={[-0.7, 0.1, 0.4]} size={1.4} seed={7} light={false} />
        <Smoke t={t} position={[0, 2.5, 1]} amount={0.7} height={5} />
        <Character def={BIBLE.tommy} expression="shocked" mouth="wide" position={[0.1, 0, 4.6]} rotationY={0.1} pose={t < 0.35 ? { ...gesture("recoil", t + 0.4), holdR: "rifle", noProp: true } : gesture("scream", t - 0.35)} />
        {t >= 0.35 && <FloorRifle position={[0.5, 0, 5.4]} rotationY={0.8} drop={t - 0.35} fromY={1.7} />}
      </>
    ),
  }),
  // "and stagger away like you've lost your mind": reeling toward the camera down the trench
  "you-stagger": ({ beat, t, dur }) => {
    const z0 = 4.6;
    const zt = z0 - 2.6 * t;
    return {
      real: true,
      camera: { ...live({ position: [0.5, 2.4, zt - 5.2], target: [0, 2.0, zt], fov: 52 }, t, dur, { shake: 0.03 }) },
      motionBlur: 3,
      focus: [0, 2.3, zt],
      focusRange: 2,
      content: (
        <>
          <Trench preset={P(beat)} />
          <Flames t={t} position={[0.2, 0.1, 6.6]} size={2.1} seed={3} />
          <Smoke t={t} position={[0, 2.5, 7]} amount={0.8} height={5} />
          <FloorRifle position={[0.5, 0, 5.4]} rotationY={0.8} />
          <Character def={BIBLE.tommy} expression="shocked" mouth="wide" position={[Math.sin(t * 3.2) * 0.3, 0, zt]} rotationY={Math.PI} pose={{ ...gesture("stagger", t), root: [0, 0, 0] }} />
        </>
      ),
    };
  },
  // "You duck around the corner": from up the trench, you dash to the corner and vanish left
  "you-corner": ({ beat, t, dur }) => {
    // path: down the main trench to the corner, then left into the side trench
    const d = t * 3.4;
    const leg1 = 3.2;
    const pos: [number, number, number] = d < leg1 ? [0, 0, -2.6 - d] : [-(d - leg1), 0, -2.6 - leg1];
    const yaw = d < leg1 ? Math.PI : Math.PI + Math.min(1, (d - leg1) / 0.6) * (Math.PI / 2);
    return {
      real: true,
      camera: live({ position: [0.9, 3.0, 3.4], target: [-1.4, 1.8, -5.8], fov: 50 }, t, dur, { push: 0.1 }),
      focus: [-0.4, 1.8, -5.6],
      focusRange: 3,
      content: (
        <>
          <Trench preset={P(beat)} />
          <Character def={BIBLE.tommy} expression="scared" position={pos} rotationY={yaw} pose={{ walk: t * 12, stride: 0.9, lean: 0.25, armL: [1.0, 0.2], armR: [0.4, 0.2] }} />
        </>
      ),
    };
  },
  // "and go dead quiet": extreme close-up, back to the wall, finger to the lips
  "you-quiet": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [-0.2, 2.4, -6.6], target: [-3.3, 2.3, -5.2], fov: 50 }, t, dur, { push: 0.15 }),
    focus: [-3.3, 2.6, -5.0],
    focusRange: 0.8,
    bokeh: 8,
    content: (
      <>
        <Trench preset={P(beat)} />
        <Character def={BIBLE.tommy} expression="worried" position={[-3.3, 0, -5.15]} rotationY={1.75} pose={gesture("hush", t)} />
      </>
    ),
  }),
  // "They think you're finished, so they charge in after you": they jump in and run at the camera
  "enemies-charge": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [0.5, 1.3, -6.9], target: [-0.1, 2.6, 1.0], fov: 52 }, t, dur, { push: 0.06, shake: 0.02 }),
    motionBlur: 2,
    focus: [0, 2.3, -1],
    focusRange: 4,
    content: (
      <>
        <Trench preset={P(beat)} />
        {[
          { x: 0.0, z: 5.5, d: 0 },
          { x: -0.5, z: 8.0, d: 0.15 },
          { x: 0.5, z: 10.5, d: 0.3 },
          { x: 2.4, z: 7.0, d: 0.0, jump: true },
        ].map((e, i) => {
          const tt = t - e.d;
          if (e.jump) {
            // hops down from the right parapet, then runs
            const j = Math.max(0, Math.min(1, tt / 0.55));
            const x = e.x - 2.1 * j;
            const run = Math.max(0, tt - 0.55);
            return <Character key={i} def={BIBLE.enemy} expression="angry" mouth="wide" position={[x, Math.max(0, (1 - j * j) * TRENCH.H + Math.sin(j * Math.PI) * 0.5), e.z - run * 3.6]} rotationY={j < 1 ? -Math.PI / 2 - j * (Math.PI / 2) : Math.PI} pose={j < 1 ? { armL: [2.2, 0.6], armR: [2.0, 0.6], legs: [0.6, 0.2] } : gesture("charge", run)} />;
          }
          return <Character key={i} def={BIBLE.enemy} expression="angry" mouth="wide" position={[e.x, 0, e.z]} rotationY={Math.PI} pose={gesture("charge", Math.max(0, tt))} />;
        })}
      </>
    ),
  }),
  // "straight into the machine gun": low, right at the muzzle; you behind it, grinning
  "mg-reveal": ({ beat, t, dur }) => ({
    real: true,
    camera: live({ position: [-0.6, 1.4, -5.2], target: [-5.2, 2.0, -6.0], fov: 44 }, t, dur, { push: 0.2 }),
    focus: [-5.8, 2.4, -6.0],
    focusRange: 1.8,
    bokeh: 7,
    content: (
      <>
        <Trench preset={P(beat)} />
        <MachineGun position={[-4.4, 0, -6.0]} rotationY={Math.PI / 2} />
        <Character def={BIBLE.tommy} expression="happy" position={[-5.95, 0, -6.0]} rotationY={Math.PI / 2 + 0.25} pose={{ ...gesture("mgfire", t), headNod: -0.3, lean: 0.1 }} />
      </>
    ),
  }),
  // "you set up there an hour ago": side view, the gun opens up, the charge stops dead at the corner
  "mg-final": ({ beat, t, dur }) => {
    const fire = t > 0.5;
    return {
      real: true,
      camera: live({ position: [-4.9, 2.0, -4.85], target: [0.4, 1.6, -6.3], fov: 58 }, t, dur, { push: 0.05, shake: fire ? 0.04 : 0 }),
      focus: [0.3, 2.3, -6.0],
      focusRange: 2.5,
      content: (
        <>
          <Trench preset={P(beat)} />
          <MachineGun position={[-4.4, 0, -6.0]} rotationY={Math.PI / 2} t={t} firing={fire} />
          <Character def={BIBLE.tommy} expression="determined" position={[-5.95, 0, -6.0]} rotationY={Math.PI / 2} pose={{ ...gesture("mgfire", t), bob: fire ? Math.abs(Math.sin(t * 40)) * 0.03 : 0 }} />
          {[
            { x: 0.2, z: -6.6 },
            { x: 0.9, z: -5.3 },
            { x: 1.1, z: -7.0 },
          ].map((e, i) => (
            <Character key={i} def={BIBLE.enemy} expression="shocked" mouth="wide" position={[e.x, 0, e.z]} rotationY={-Math.PI / 2 - 0.4} pose={t < 0.4 + i * 0.1 ? { ...gesture("charge", 2 + t), root: [0, 0, 0] } : { ...gesture("recoil", t - 0.4 - i * 0.1), root: [0, 0, 0] }} />
          ))}
        </>
      ),
    };
  },

  // -- extreme close-ups + top-down (camera grammar: one every ~4-6 shots) ──
  "insp-eyes": ({ beat, cut, t, dur, abs }) => ({
    camera: live(wideClose([INSP[0], INSP[1] + 1.7684 - 0.04, INSP[2] + 0.45], -0.12, 1.45, 40), t, dur, { push: 0.05 }),
    focus: [INSP[0], INSP[1] + 1.7684, INSP[2] + 0.5],
    focusRange: 0.35,
    bokeh: 14,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={INSP} rotationY={-0.12} mouth={talk(beat, abs)} />
      </>
    ),
  }),
  "stoker-eyes": ({ beat, cut, t, dur }) => ({
    camera: live(wideClose([1.2, 1.7684 * 0.97 - 0.04, 1.6 + 0.45], 0.35, 1.45, 40), t, dur, { push: 0.05, shake: 0.02 }),
    focus: [1.2, 1.7684 * 0.97, 2.05],
    focusRange: 0.35,
    bokeh: 14,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Actor def={BIBLE.stoker} cut={cut} t={t} position={[1.2, 0, 1.6]} rotationY={0.35} />
      </>
    ),
  }),
  "crowd-top": ({ beat, t, dur }) => ({
    camera: live({ position: [0.6, 15, -2.0], target: [0.5, 0, -4.6], fov: 42, roll: 0.25 }, t, dur, { push: 0.06 }),
    focus: [0.5, 1.5, -4.6],
    focusRange: 12,
    bokeh: 2,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        {CROWD.map((e, i) => (
          <Character key={i} def={e.def} expression={e.expression} position={e.position} rotationY={e.rotationY + Math.sin(t * 2 + e.phase) * 0.3} pose={{ headNod: -0.4, armL: [0.4 + Math.sin(t * 6 + i) * 0.3, 0.4], bob: Math.abs(Math.sin(t * 5 + e.phase)) * 0.03 }} />
        ))}
      </>
    ),
  }),
  "boats-top": ({ beat, cut, t, dur }) => ({
    camera: live({ position: [0.55, 5.2, 2.3], target: [0.55, 0.7, 1.95], fov: 40, roll: 0.0 }, t, dur, { push: 0.08 }),
    focus: [0.55, 0.75, 1.95],
    focusRange: 1.5,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <pointLight position={[0.2, 3, 3.4]} color="#FFD9A0" intensity={4} distance={8} decay={1.6} />
        <Crate position={[0.5, 0, 2.0]} />
        <Boats count={16} t={99} each={0} />
        <Boats count={4} t={t - 0.1} each={0.12} offset={16} color="#FFB13B" />
      </>
    ),
  }),

  // ── today ──
  "today-medium": ({ beat, cut, t, dur, abs }) => ({
    camera: live({ position: [0.25, 1.95, 6.8], target: [0.15, 1.4, 1.4], fov: 36 }, t, dur),
    focus: face([-0.4, 0, 1.4]),
    focusRange: 1.5,
    content: (
      <>
        <ShipDeck preset={P(beat)} era="today" />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={[-0.4, 0, 1.4]} rotationY={0.12} mouth={talk(beat, abs)} />
      </>
    ),
  }),
  "today-low": ({ beat, cut, t, dur, abs }) => ({
    camera: live({ position: [-0.9, 0.7, 4.6], target: [0.4, 2.0, -1], fov: 46, roll: -0.12 }, t, dur, { punch: 0.15 }),
    focus: face([-0.4, 0, 1.4]),
    focusRange: 2.5,
    content: (
      <>
        <ShipDeck preset={P(beat)} era="today" />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={[-0.4, 0, 1.4]} rotationY={0.6} mouth={talk(beat, abs)} />
      </>
    ),
  }),
  "today-boat": ({ beat, t, dur }) => ({
    camera: live({ position: [0.3, 1.5, 0.5], target: [2.2, 2.8, -8], fov: 40 }, t, dur, { push: 0.15 }),
    focus: [2.2, 2.7, -8],
    focusRange: 5,
    bokeh: 5,
    content: <ShipDeck preset={P(beat)} era="today" />,
  }),
  "today-punch": ({ beat, cut, t, dur, abs }) => ({
    camera: live(wideClose(face([-0.4, 0, 1.4]), 0.1, 1.55, 56), t, dur, { punch: 0.35 }),
    focus: face([-0.4, 0, 1.4]),
    focusRange: 1,
    bokeh: 11,
    content: (
      <>
        <ShipDeck preset={P(beat)} era="today" />
        <Actor def={BIBLE.inspector} cut={cut} t={t} position={[-0.4, 0, 1.4]} rotationY={0.12} mouth={talk(beat, abs)} />
      </>
    ),
  }),
};

// rows of mini boats popping in one by one on the crate top
const Boats: React.FC<{ count: number; t: number; each: number; offset?: number; color?: string; perRow?: number }> = ({ count, t, each, offset = 0, color, perRow = 8 }) => {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i + offset), [count, offset]);
  return (
    <group>
      {items.map((n, i) => {
        const k = t - i * each;
        if (k < 0) return null;
        const s = spring({ frame: k * 30, fps: 30, config: { damping: 9, stiffness: 260 } });
        const row = Math.floor(n / perRow);
        const col = n % perRow;
        const dx = perRow > 8 ? 0.21 : 0.24;
        return <MiniBoat key={n} position={[0.5 - ((perRow - 1) * dx) / 2 + col * dx, 0.74, 1.78 + row * 0.42 + random(`b${n}`) * 0.02]} rotationY={0} scale={1.25 * s} color={color} />;
      })}
    </group>
  );
};

export const cutShot = (i: CutInput): ShotOutput => {
  const tpl = TPL[i.cut.shot];
  if (!tpl) throw new Error(`Unknown cut template "${i.cut.shot}" (${i.beat.id}). Known: ${Object.keys(TPL).join(", ")}`);
  const o = tpl(i);
  if (o.real) return o;
  return { ...o, camera: lift(o.camera), focus: [o.focus[0], o.focus[1] * BODY_K, o.focus[2]] };
};
export const CUT_TEMPLATES = Object.keys(TPL);

// Which place each cut template shows (engine/shots/sets.json, shared with the audio build).
// Consecutive cuts in the same place are joined by a fast camera move (no cut); a change of
// place uses the cut's transition (whip / flash / cut).
export const cutSet = (shot: string) => (SETS.sets as Record<string, string>)[shot] ?? SETS.default;
