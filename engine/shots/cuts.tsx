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
import { breathe, punchIn, push, shake, wideClose } from "../cameras/moves";
import { LightingPresetName, style } from "../look/style";
import { BoilerRoom, Certificate, Crate, Iceberg, MiniBoat, Rulebook, TextLabel, ToyShip } from "../props/Props";
import { Sea } from "../worlds/Sea";
import { ShipDeck } from "../worlds/ship-deck/ShipDeck";
import { ShotOutput } from "./templates";

// ─────────────────────────────────────────────────────────────────────────────
// Cut templates (v2 "micro-beats"): one short shot per phrase, chosen by name in
// scenes.txt (`cut: <cue> | <shot> | face= | do= | fx= | tr=`). Every shot moves:
// punch-in on entry, slow push, handheld drift. Gestures come from the gesture kit.
// ─────────────────────────────────────────────────────────────────────────────

export type Cut = { cue: string; shot: string; face: Expression; do?: string; fx?: string; tr: "cut" | "whip" | "flash"; start: number; end: number };
export type CutBeat = { id: string; speaker: "inspector" | "vo"; preset: LightingPresetName; words: WordTiming[]; start: number; end: number };
export type CutInput = { beat: CutBeat; cut: Cut; t: number; dur: number; abs: number };

const HY = HEAD_HEIGHT;
const P = (b: CutBeat) => style.lighting[b.preset];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const live = (cam: CameraState, t: number, dur: number, opts: { punch?: number; push?: number; shake?: number } = {}) => {
  let c = push(cam, t / Math.max(dur, 0.3), opts.push ?? 0.07);
  if (opts.punch) c = punchIn(c, t, opts.punch);
  if (opts.shake) c = shake(c, t, opts.shake);
  return breathe(c, t + 3, 0.012);
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
  const v = new THREE.Vector3(0, -0.49, 0).applyEuler(new THREE.Euler(-arm[0], 0, side * arm[1]));
  v.add(new THREE.Vector3(side * 0.41, 1.06, 0)).multiplyScalar(scale).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  return [v.x + pos[0], v.y + pos[1], v.z + pos[2]];
};

const INSP: Vec3 = [0.6, 0, 1.4];
const face = (p: Vec3, s = 1): Vec3 => [p[0], p[1] + HY * s, p[2] + 0.45 * s];

// ── crowd for the lifeboat beats (spawn times give the "piling in" gag) ──
const CROWD = makeCrowd({ seed: "v2-deck", count: 30, area: { x: [-2.6, 2.7], z: [-12, 2.2] }, faceToward: [3, -9], minGap: 0.85 });

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
const Boats: React.FC<{ count: number; t: number; each: number; offset?: number; color?: string }> = ({ count, t, each, offset = 0, color }) => {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i + offset), [count, offset]);
  return (
    <group>
      {items.map((n, i) => {
        const k = t - i * each;
        if (k < 0) return null;
        const s = spring({ frame: k * 30, fps: 30, config: { damping: 9, stiffness: 260 } });
        const row = Math.floor(n / 8);
        const col = n % 8;
        return <MiniBoat key={n} position={[-0.34 + col * 0.24, 0.74, 1.72 + row * 0.42 + random(`b${n}`) * 0.02]} rotationY={0} scale={1.25 * s} color={color} />;
      })}
    </group>
  );
};

export const cutShot = (i: CutInput): ShotOutput => {
  const tpl = TPL[i.cut.shot];
  if (!tpl) throw new Error(`Unknown cut template "${i.cut.shot}" (${i.beat.id}). Known: ${Object.keys(TPL).join(", ")}`);
  return tpl(i);
};
export const CUT_TEMPLATES = Object.keys(TPL);
