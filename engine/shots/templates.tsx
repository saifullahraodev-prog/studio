import React from "react";
import { interpolate } from "remotion";
import { BIBLE } from "../characters/bible";
import { Character, HEAD_HEIGHT } from "../characters/Character";
import { Crowd, makeCrowd } from "../characters/crowd";
import { Expression } from "../characters/face";
import { mouthAt, WordTiming } from "../characters/lipsync";
import { CameraState, Vec3 } from "../cameras/CameraRig";
import { breathe, follow, glide, shake } from "../cameras/moves";
import { LightingPresetName, style } from "../look/style";
import { Iceberg, Rulebook, ToyShip } from "../props/Props";
import { ShipDeck } from "../worlds/ship-deck/ShipDeck";

// ─────────────────────────────────────────────────────────────────────────────
// Shot templates. A template turns one beat of the scene file (+ the local time)
// into a camera, a focus point and 3D content. No new code per video: videos
// pick templates by name in scenes.txt.
// ─────────────────────────────────────────────────────────────────────────────

export type Beat = {
  id: string;
  speaker: "inspector" | "vo";
  say: string;
  subtitle: string;
  keyword?: string;
  shot: string;
  preset: LightingPresetName;
  face: Expression;
  start: number;
  end: number;
  voiceStart: number;
  voiceEnd: number;
  cueAt: number;
  words: WordTiming[];
};

export type ShotInput = {
  beat: Beat;
  t: number; // seconds since the beat started
  dur: number; // beat length (s)
  abs: number; // seconds since the video started (for lip-sync)
};

export type ShotOutput = {
  camera: CameraState;
  focus: Vec3;
  focusRange?: number;
  bokeh?: number;
  content: React.ReactNode;
};

const HY = HEAD_HEIGHT;
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
const talk = (b: Beat, abs: number) => (b.speaker === "inspector" ? mouthAt(b.words, abs) : "rest");
const P = (b: Beat) => style.lighting[b.preset];

// ── 1. Inspector hero close-up, talking to camera ──
const heroCloseup = ({ beat, t, dur, abs }: ShotInput, era: "1912" | "today" = "1912"): ShotOutput => {
  const today = era === "today";
  const insp: Vec3 = today ? [-0.4, 0, 1.4] : [0.6, 0, 1.4];
  const p = Math.min(1, t / dur);
  const cam = breathe(
    today
      ? glide({ position: [0.3, HY + 0.3, 8.0], target: [0.2, HY - 0.45, 1.4], fov: 37 }, { position: [0.25, HY + 0.2, 7.0], target: [0.15, HY - 0.4, 1.4], fov: 36 }, p)
      : glide({ position: [-0.55, HY + 0.3, 8.2], target: [0.55, HY - 0.5, 1.4], fov: 30 }, { position: [-0.35, HY + 0.2, 6.9], target: [0.55, HY - 0.45, 1.4], fov: 30 }, p),
    t,
  );
  const clip = interpolate(t, [0, 0.5], [0.35, 1.0], { extrapolateRight: "clamp" });
  // closing shot: a pen "tick" on the clipboard in the last second
  const tick = era === "today" ? interpolate(t, [dur - 1.4, dur - 1.1, dur - 0.8], [0.25, 0.95, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0.25;
  return {
    camera: cam,
    focus: [insp[0], HY, insp[2] + 0.5],
    focusRange: 1.2,
    bokeh: 11,
    content: (
      <>
        <ShipDeck preset={P(beat)} era={era} />
        <Character
          def={BIBLE.inspector}
          expression={beat.face}
          mouth={talk(beat, abs)}
          position={insp}
          rotationY={today ? 0.12 : -0.12}
          pose={{ armL: [clip, 0.2], armR: [tick, 0.3], headTilt: Math.sin(t * 1.4) * 0.04, headNod: 0.04 + Math.sin(t * 4.5) * (talk(beat, abs) === "rest" ? 0 : 0.02), bob: Math.sin(t * 2) * 0.008 }}
        />
      </>
    ),
  };
};

// ── 2. Reveal the funnels, then push in on the stoker ──
const pushInStoker = ({ beat, t, dur }: ShotInput): ShotOutput => {
  const st: Vec3 = [1.0, 0, 0.8];
  const p = Math.min(1, t / (dur * 0.55));
  const cam = glide({ position: [-0.6, 1.0, 7.5], target: [-4.5, 7, -22], fov: 50 }, { position: [0.3, 1.95, 5.4], target: [1.0, 1.75, 0.8], fov: 32 }, p);
  return {
    camera: breathe(cam, t),
    focus: lerp3([-6, 8, -26], [st[0], HY, st[2] + 0.4], Math.min(1, p * 1.3)),
    focusRange: 3,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Character def={BIBLE.stoker} expression={beat.face} position={st} rotationY={-0.25} pose={{ bob: Math.sin(t * 2.4) * 0.012, headYaw: Math.sin(t * 0.8) * 0.15 }} />
      </>
    ),
  };
};

// ── 3. The iceberg slides past the railing; impact shake on the cue word ──
const icebergPass = ({ beat, t, dur }: ShotInput): ShotOutput => {
  const cueT = beat.cueAt - beat.start;
  const z = interpolate(t, [0, cueT, dur], [-48, -13, -3]);
  const st: Vec3 = [1.4, 0, 3.4];
  const turned = interpolate(t, [cueT - 0.3, cueT + 0.2], [1.25, 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cam = shake({ position: [0.4, 2.1, 7.6], target: [6.5, 2.0, -6], fov: 46 }, t - cueT, 0.16);
  return {
    camera: cam,
    focus: [st[0], HY, st[2]],
    focusRange: 4,
    bokeh: 7,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Iceberg size={8} seed={3} position={[11.5, -8.2, z]} rotationY={0.4} />
        <Character
          def={BIBLE.stoker}
          expression={t < cueT ? "neutral" : beat.face}
          position={st}
          rotationY={turned}
          pose={{ armL: [t < cueT ? 0.1 : 0.9, 0.5], bob: t > cueT ? Math.sin(t * 30) * 0.01 * Math.exp(-(t - cueT) * 3) : 0 }}
        />
      </>
    ),
  };
};

// ── 4. Run along the deck, stop and look up at the boats ──
const lifeboatGlide = ({ beat, t, dur }: ShotInput): ShotOutput => {
  const runFor = Math.max(0.5, dur - 1.3);
  const run = Math.min(t, runFor);
  const z = 5 - run * 3.4;
  const stopped = t > runFor;
  const stride = stopped ? interpolate(t, [runFor, runFor + 0.25], [1, 0], { extrapolateRight: "clamp" }) : 1;
  const st: Vec3 = [1.5, 0, z];
  const cam = follow([st[0], 0, z], [-2.3, 2.4, 5.6], [0.8, 1.9, -7], 40);
  return {
    camera: cam,
    focus: [st[0], HY, z],
    focusRange: 3.5,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Character
          def={BIBLE.stoker}
          expression={beat.face}
          position={st}
          rotationY={Math.PI + (stopped ? 0.6 : 0)}
          pose={{ walk: t * 11, stride, headNod: stopped ? -0.35 : 0 }}
        />
      </>
    ),
  };
};

// ── 5. High wide: a crowd on deck vs. a short row of boats ──
const CROWD = makeCrowd({ seed: "titanic-deck", count: 18, area: { x: [-2.4, 2.6], z: [-13, 2.5] }, faceToward: [3, -9] });
const crowdVsBoats = ({ beat, t, dur }: ShotInput): ShotOutput => {
  const cam = glide({ position: [-2.6, 6.8, 9.5], target: [1.4, 0.4, -6], fov: 44 }, { position: [-2.2, 6.0, 7.8], target: [1.5, 0.6, -6.5], fov: 42 }, t / dur);
  return {
    camera: cam,
    focus: [0.5, 1.5, -4],
    focusRange: 9,
    bokeh: 4,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <Crowd extras={CROWD} t={t} />
        <Character def={BIBLE.stoker} expression={beat.face} position={[0.3, 0, 3.6]} rotationY={2.6} pose={{ headNod: -0.2, armL: [0.6, 0.4], armR: [0.95, 0.12] }} />
      </>
    ),
  };
};

// ── 6. The Inspector reads the 1894 rulebook; push in to the last row ──
const rulebook = ({ beat, t, dur }: ShotInput): ShotOutput => {
  const insp: Vec3 = [0.4, 0, 1.2];
  const p = interpolate(t, [0.6, dur * 0.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cam = glide({ position: [0.4, 2.05, 6.2], target: [0.45, 1.45, 1.4], fov: 32 }, { position: [0.5, 1.8, 4.5], target: [0.5, 0.62, 1.95], fov: 32 }, p);
  return {
    camera: breathe(cam, t, 0.01),
    focus: lerp3([insp[0], HY, insp[2]], [0.62, 1.02, 1.95], p),
    focusRange: 1.4,
    bokeh: 9,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <pointLight position={[-0.4, 2.7, 3.2]} color="#FFD9A0" intensity={4} distance={8} decay={1.6} />
        <Character def={BIBLE.inspector} expression={beat.face} position={insp} rotationY={0} pose={{ armL: [1.15, 0.05], armR: [1.15, 0.05], headNod: 0.25, noProp: true }} />
        <Rulebook position={[0.45, 1.02, 1.95]} rotation={[-0.55, 0, 0]} scale={0.95} highlight={interpolate(t, [dur * 0.5, dur * 0.72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </>
    ),
  };
};

// ── 7. Size gag: a 10,000-ton liner model vs. Titanic (scaled by volume) ──
const sizeGag = ({ beat, t, dur }: ShotInput): ShotOutput => {
  const cueT = beat.cueAt - beat.start;
  // models scaled so their VOLUME ratio matches the tonnage ratio (46,328 / 10,000 ≈ 4.6 → ×1.66 per side)
  const grow = interpolate(t, [cueT - 0.1, cueT + 0.35], [1, 1.66], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cam = glide({ position: [0.6, 2.3, 8.2], target: [0.6, 0.75, 1.4], fov: 37 }, { position: [0.6, 2.2, 7.5], target: [0.6, 0.8, 1.4], fov: 36 }, t / dur);
  return {
    camera: breathe(cam, t),
    focus: [0.6, 1.2, 1.7],
    focusRange: 2.2,
    content: (
      <>
        <ShipDeck preset={P(beat)} />
        <pointLight position={[0.2, 3.0, 3.4]} color="#FFD9A0" intensity={4} distance={8} decay={1.6} />
        <mesh position={[0.6, 0.45, 1.7]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.9, 0.9]} />
          <meshStandardMaterial color="#8A6440" roughness={0.8} />
        </mesh>
        <ToyShip funnels={2} label="10,000 tons" position={[-0.05, 0.9, 2.0]} rotationY={0.6} scale={0.62} />
        <ToyShip funnels={4} label="TITANIC 46,328 tons" position={[0.95, 0.9, 1.7]} rotationY={-0.6} scale={0.62 * grow} />
        <Character def={BIBLE.inspector} expression={t < cueT + 0.4 ? "shocked" : beat.face} position={[0.6, 0, 0.55]} rotationY={0} pose={{ headNod: 0.2, headYaw: t < cueT ? -0.3 : 0.3 }} />
      </>
    ),
  };
};

// ── 8. Quiet: empty deck at night, slow glide toward the bow ──
const emptyDeck = ({ beat, t, dur }: ShotInput): ShotOutput => ({
  camera: glide({ position: [0.6, 1.2, 9], target: [0.3, 1.5, -20], fov: 40 }, { position: [0.5, 1.35, 3.5], target: [0.4, 1.6, -20], fov: 40 }, t / dur),
  focus: [0.4, 1.4, -8],
  focusRange: 10,
  bokeh: 4,
  content: <ShipDeck preset={P(beat)} />,
});

const TEMPLATES: Record<string, (i: ShotInput) => ShotOutput> = {
  "hero-closeup": (i) => heroCloseup(i, "1912"),
  "today-closeup": (i) => heroCloseup(i, "today"),
  "push-in-stoker": pushInStoker,
  "iceberg-pass": icebergPass,
  "lifeboat-glide": lifeboatGlide,
  "crowd-vs-boats": crowdVsBoats,
  rulebook,
  "size-gag": sizeGag,
  "empty-deck": emptyDeck,
};

export const shotFor = (i: ShotInput): ShotOutput => {
  const tpl = TEMPLATES[i.beat.shot];
  if (!tpl) throw new Error(`Unknown shot template "${i.beat.shot}" in ${i.beat.id}. Known: ${Object.keys(TEMPLATES).join(", ")}`);
  return tpl(i);
};
export const SHOT_TEMPLATES = Object.keys(TEMPLATES);
