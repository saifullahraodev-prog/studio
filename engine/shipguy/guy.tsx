// The Ship Guy as a posable, animated puppet (SVG, drawn in code). Matches the owner's stick-figure
// images (public/shipguy/stickmen): round white head with a blue-grey shade, white hard hat, orange hi-vis
// vest with white stripes, black stick limbs, black mitten hands, oval feet, soft ground shadow.
// Local units: feet on y = 0, about 640 units from feet to hat top at s = 1. Frame-driven only.
import React from "react";
import { Easing } from "remotion";
import { INK } from "./art";

// ------------------------------------------------------------------ pose + face data
// Arms: [shoulder, elbow] in degrees, 0 = hanging down, + = swings OUTWARD (mirrored per side).
// Legs: [hip, knee] in degrees, absolute screen direction (+ = towards screen right).
export type Pose = {
  lean: number; tilt: number; hipX: number; hipY: number; squash: number;
  armL: [number, number]; armR: [number, number]; legL: [number, number]; legR: [number, number];
};
export type Eyes = "dot" | "wide" | "half" | "closed" | "happy";
export type Brows = "none" | "up" | "worried" | "angry" | "one";
export type Mouth = "smile" | "grin" | "smirk" | "flat" | "o" | "scream" | "frown" | "wavy" | "teeth";
export type Face = { eyes: Eyes; brows: Brows; mouth: Mouth; lookX?: number; lookY?: number };
export type Hand = "mitt" | "open" | "point" | "thumb";
export type PropName = "clipboard" | "mug" | "spade" | "phone" | "hammer" | "rod" | "magnifier" | "label" | "radio" | "binoculars" | "mic" | "hose" | "extinguisher" | "none";
export type Outfit = "ship" | "pilot" | "captain" | "officer" | "coverall" | "road" | "jersey" | "aviator" | "fire";
export type Emote = "sweat" | "!" | "?" | "steam" | "stars" | "idea";

export const IDLE: Pose = { lean: 0, tilt: 0, hipX: 0, hipY: 0, squash: 0, armL: [14, 8], armR: [14, 8], legL: [-5, 0], legR: [5, 0] };
export const POSES = {
  idle: IDLE,
  point: { ...IDLE, tilt: -4, armR: [92, -4], armL: [16, 10] } as Pose, // explain.jpg
  present: { ...IDLE, tilt: 3, armR: [62, 34], armL: [62, 34] } as Pose,
  hipWave: { ...IDLE, tilt: -5, armL: [60, -90], armR: [55, 60] } as Pose, // confident.jpg
  handsHead: { ...IDLE, squash: -0.04, armL: [95, 100], armR: [95, 100], legL: [-10, 0], legR: [26, 8] } as Pose, // shocked.jpg
  shrug: { ...IDLE, tilt: 6, armL: [58, -95], armR: [58, -95] } as Pose,
  chin: { ...IDLE, tilt: 7, armR: [129, 159], armL: [16, 10] } as Pose, // thinking.jpg
  stop: { ...IDLE, lean: -3, armR: [70, 82], armL: [14, 6] } as Pose, // stop.jpg
  fingerUp: { ...IDLE, tilt: -3, armR: [38, 130], armL: [12, 6] } as Pose,
  cheer: { ...IDLE, hipY: 6, armL: [158, -10], armR: [158, -10] } as Pose,
  crouch: { ...IDLE, hipY: -42, squash: 0.06, legL: [-26, 50], legR: [26, -50], armL: [30, 20], armR: [30, 20] } as Pose,
  hold: { ...IDLE, armR: [26, 98], armL: [14, 8] } as Pose, // hold a clipboard / mug in front
};

export const FACES = {
  happy: { eyes: "dot", brows: "up", mouth: "grin" } as Face,
  confident: { eyes: "half", brows: "none", mouth: "smirk" } as Face,
  shocked: { eyes: "wide", brows: "worried", mouth: "scream" } as Face,
  scared: { eyes: "wide", brows: "worried", mouth: "wavy" } as Face,
  confused: { eyes: "dot", brows: "one", mouth: "wavy", lookX: 0.4 } as Face,
  thinking: { eyes: "wide", brows: "worried", mouth: "wavy", lookX: 0.5, lookY: -1 } as Face,
  satisfied: { eyes: "happy", brows: "up", mouth: "smile" } as Face,
  talk: { eyes: "dot", brows: "up", mouth: "smile" } as Face,
  worried: { eyes: "dot", brows: "worried", mouth: "frown" } as Face,
  amazed: { eyes: "wide", brows: "up", mouth: "o" } as Face,
};

// ------------------------------------------------------------------ animation helpers
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const pair = (a: [number, number], b: [number, number], k: number): [number, number] => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
export const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  lean: lerp(a.lean, b.lean, k), tilt: lerp(a.tilt, b.tilt, k), hipX: lerp(a.hipX, b.hipX, k), hipY: lerp(a.hipY, b.hipY, k),
  squash: lerp(a.squash, b.squash, k), armL: pair(a.armL, b.armL, k), armR: pair(a.armR, b.armR, k),
  legL: pair(a.legL, b.legL, k), legR: pair(a.legR, b.legR, k),
});
// owner 2026-11-13: "move smoother" -> gentle ease-in/out for poses (no snap), only a soft settle on pop-ins
const poseEase = Easing.bezier(0.42, 0, 0.22, 1);
const popEase = Easing.out(Easing.back(0.8));
const SLOW = 1.6; // every pose change takes 60% longer than its listed length
export const smooth = Easing.bezier(0.33, 0, 0.2, 1);

/** Key-pose track: [frame, pose, transition frames?]. Each move overshoots a little and settles (cartoon snap). */
export const track = (t: number, keys: [number, Pose, number?][]): Pose => {
  let cur = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f, p, len0 = 8] = keys[i];
    const len = len0 * SLOW;
    if (t < f) break;
    const k = Math.min(1, (t - f) / len);
    cur = mixPose(cur, p, poseEase(k));
  }
  return cur;
};
/** Which key is active at t (for faces / hands / props that swap instead of blend). */
export const pick = <T,>(t: number, keys: [number, T][]): T => {
  let v = keys[0][1];
  for (const [f, x] of keys) if (t >= f) v = x;
  return v;
};

/** Walk / run cycle layered on any pose (legs + arm swing + bounce). */
export const walk = (base: Pose, t: number, speed = 1, run = false): Pose => {
  const ph = t * 0.32 * speed;
  const s = Math.sin(ph), amp = run ? 38 : 24;
  return {
    ...base,
    lean: base.lean - (run ? 10 : 3), // negative lean = leaning towards screen right (walking direction)
    hipY: base.hipY + Math.abs(Math.cos(ph)) * (run ? 10 : 4) - (run ? 6 : 1),
    legL: [amp * s, Math.max(0, -s) * (run ? -70 : -40)],
    legR: [-amp * s, Math.max(0, s) * (run ? -70 : -40)],
    armL: [base.armL[0] + 18 * s, base.armL[1] + (run ? 70 : 10)],
    armR: [base.armR[0] - 18 * s, base.armR[1] + (run ? 70 : 10)],
  };
};

/** Idle life: breathing bob + tiny sway, so he is never a frozen picture. */
export const breathe = (p: Pose, t: number, seed = 0): Pose => ({
  ...p,
  hipY: p.hipY + Math.sin((t + seed) * 0.09) * 2.5,
  tilt: p.tilt + Math.sin((t + seed) * 0.05) * 1.6,
  armL: [p.armL[0] + Math.sin((t + seed) * 0.09 + 1) * 1.5, p.armL[1]],
  armR: [p.armR[0] + Math.sin((t + seed) * 0.09 + 2) * 1.5, p.armR[1]],
});

/** Deterministic blinks (about every 3-4 s, sometimes a double blink). */
export const blinking = (t: number, seed = 0) => {
  const c = (t + seed * 37) % 104;
  return c < 4 || (seed % 3 === 0 && c > 9 && c < 12);
};

/** Mouth openness from real spoken-word spans [[f0,f1],...] (frames in the shot): moves only while the voice speaks. */
export const talkFrom = (t: number, words?: number[][]) => {
  if (!words) return 0;
  for (const [a, b] of words) if (t >= a && t <= b + 1) { const k = (t - a) / Math.max(2, b - a + 1); return 0.35 + 0.65 * Math.sin(Math.min(1, k) * Math.PI) * (0.6 + 0.4 * Math.sin(t * 1.1)); }
  return 0;
};

/** Mouth openness 0..1 while speaking (procedural; the video drives it from the voice word timings). */
export const chatter = (t: number) => Math.max(0, Math.sin(t * 0.6) * 0.55 + Math.sin(t * 1.3 + 1) * 0.3);

// ------------------------------------------------------------------ geometry
const D = Math.PI / 180;
const dir = (a: number) => [Math.sin(a * D), Math.cos(a * D)]; // 0 = straight down (y-down screen)
const at = (x: number, y: number, a: number, len: number) => { const [dx, dy] = dir(a); return [x + dx * len, y + dy * len]; };
const LIMB = 14, UPPER = 96, LOWER = 90, THIGH = 100, SHIN = 96;
const HIP_H = 196, TORSO = 150, HEAD_R = 106;

const ORANGE = "#f27c1e", ORANGE_D = "#d9621a", STRIPE = "#f6f6f2", SKIN = "#ffffff", SHADE = "#cfdde9";
const HAT = "#f1f6fa", HAT_D = "#bcd0df";

const MittHand: React.FC<{ x: number; y: number; a: number; hand: Hand; side: 1 | -1 }> = ({ x, y, a, hand, side }) => (
  <g transform={`translate(${x} ${y}) rotate(${-a})`}>
    {hand === "open" ? (
      <g fill={INK} stroke={INK} strokeLinecap="round">
        <ellipse cx={0} cy={10} rx={16} ry={14} />
        {[-24, -8, 8, 24].map((r, i) => <line key={i} x1={0} y1={12} x2={Math.sin(r * D) * 34} y2={12 + Math.cos(r * D) * 34} strokeWidth={9} />)}
        <line x1={0} y1={10} x2={side * 22} y2={-4} strokeWidth={9} />
      </g>
    ) : hand === "point" ? (
      <g fill={INK} stroke={INK} strokeLinecap="round">
        <ellipse cx={0} cy={12} rx={15} ry={14} />
        <line x1={0} y1={14} x2={0} y2={48} strokeWidth={9} />
      </g>
    ) : hand === "thumb" ? (
      <g fill={INK} stroke={INK} strokeLinecap="round">
        <ellipse cx={0} cy={14} rx={17} ry={15} />
        <line x1={side * 6} y1={8} x2={side * 26} y2={-10} strokeWidth={10} />
      </g>
    ) : (
      <g fill={INK}>
        <ellipse cx={0} cy={16} rx={15} ry={23} />
        <ellipse cx={side * 13} cy={4} rx={6} ry={11} transform={`rotate(${side * -35} ${side * 13} 4)`} />
      </g>
    )}
  </g>
);

const Held: React.FC<{ prop: PropName; x: number; y: number }> = ({ prop, x, y }) => {
  if (prop === "clipboard") return (
    <g transform={`translate(${x - 40} ${y - 70}) rotate(-6)`}>
      <rect x={0} y={0} width={86} height={112} rx={8} fill="#b98a55" stroke={INK} strokeWidth={6} />
      <rect x={10} y={16} width={66} height={86} fill="#fbfaf4" stroke={INK} strokeWidth={3} />
      {[36, 52, 68, 84].map((ly) => <line key={ly} x1={18} y1={ly} x2={66} y2={ly} stroke="#9aa7b3" strokeWidth={4} />)}
      <rect x={28} y={-8} width={30} height={18} rx={4} fill="#9aa1a8" stroke={INK} strokeWidth={5} />
    </g>
  );
  if (prop === "mug") return (
    <g transform={`translate(${x - 26} ${y - 34})`}>
      <path d="M44 14 q 22 4 16 22 q -4 12 -18 10" fill="none" stroke={INK} strokeWidth={7} />
      <rect x={0} y={0} width={48} height={56} rx={8} fill="#3d78c4" stroke={INK} strokeWidth={6} />
      <path d="M14 -10 q 6 -10 0 -20 M30 -10 q 6 -10 0 -20" stroke="#a9b6c2" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
  if (prop === "phone") return (
    <g transform={`translate(${x - 30} ${y - 96}) rotate(-8)`}>
      <rect x={0} y={0} width={64} height={112} rx={10} fill="#2a2d33" stroke={INK} strokeWidth={6} />
      <rect x={7} y={10} width={50} height={86} rx={4} fill="#8fd0f0" />
      <rect x={12} y={52} width={40} height={30} fill="#2f7d4a" />
      <rect x={14} y={70} width={10} height={8} fill="#ffd23f" />
    </g>
  );
  if (prop === "radio") return (
    <g transform={`translate(${x - 22} ${y - 90}) rotate(-8)`}>
      {/* handheld VHF ship radio: black body, stubby antenna, small screen, keypad */}
      <rect x={30} y={-46} width={12} height={52} rx={5} fill="#2a2d33" stroke={INK} strokeWidth={4} />
      <rect x={0} y={0} width={50} height={104} rx={10} fill="#2a2d33" stroke={INK} strokeWidth={6} />
      <rect x={8} y={12} width={34} height={22} rx={3} fill="#9fe07a" />
      {[0, 1, 2].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={10 + c * 18} y={46 + r * 16} width={12} height={10} rx={3} fill="#5a636c" />))}
      <circle cx={25} cy={96} r={4} fill="#e8352b" />
    </g>
  );
  if (prop === "binoculars") return (
    <g transform={`translate(${x - 40} ${y - 40})`}>
      <rect x={0} y={0} width={34} height={56} rx={12} fill="#2a2d33" stroke={INK} strokeWidth={5} />
      <rect x={44} y={0} width={34} height={56} rx={12} fill="#2a2d33" stroke={INK} strokeWidth={5} />
      <rect x={30} y={18} width={18} height={14} fill="#2a2d33" stroke={INK} strokeWidth={4} />
      <circle cx={17} cy={4} r={10} fill="#9fd3ee" stroke={INK} strokeWidth={3} /><circle cx={61} cy={4} r={10} fill="#9fd3ee" stroke={INK} strokeWidth={3} />
    </g>
  );
  if (prop === "mic") return (
    <g transform={`translate(${x - 24} ${y - 70}) rotate(-10)`}>
      {/* ship's PA / radio handset with a coiled cord */}
      <rect x={0} y={0} width={48} height={74} rx={18} fill="#2a2d33" stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((i) => <line key={i} x1={12} y1={16 + i * 12} x2={36} y2={16 + i * 12} stroke="#5a636c" strokeWidth={4} />)}
      <path d="M24 74 q -20 14 0 22 q 20 8 0 22 q -20 8 0 22 q 20 8 0 22" stroke={INK} strokeWidth={5} fill="none" />
    </g>
  );
  if (prop === "extinguisher") return (
    <g transform={`translate(${x} ${y})`}>
      {/* red fire extinguisher held by the handle, hose + nozzle pointing forward */}
      <rect x={-26} y={-6} width={52} height={120} rx={16} fill="#e0392b" stroke={INK} strokeWidth={6} />
      <rect x={-14} y={-26} width={28} height={22} rx={4} fill="#2a2d33" stroke={INK} strokeWidth={4} />
      <path d="M-20 -24 L 20 -24" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M14 -16 Q 70 -20 80 30" stroke="#2a2d33" strokeWidth={9} fill="none" />
      <rect x={70} y={26} width={22} height={16} rx={4} fill="#2a2d33" stroke={INK} strokeWidth={3} />
      <rect x={-18} y={30} width={36} height={30} rx={4} fill="#f4f4f0" />
    </g>
  );
  if (prop === "hose") return (
    <g transform={`translate(${x} ${y}) rotate(-20)`}>
      <rect x={-10} y={-20} width={70} height={30} rx={8} fill="#c9a23a" stroke={INK} strokeWidth={5} />
      <rect x={58} y={-16} width={30} height={22} rx={4} fill="#9aa4ad" stroke={INK} strokeWidth={4} />
      <path d="M-10 -5 Q -120 40 -200 200" stroke="#c94a3a" strokeWidth={16} fill="none" />
    </g>
  );
  if (prop === "hammer") return (
    <g transform={`translate(${x} ${y}) rotate(-30)`}>
      <line x1={0} y1={30} x2={0} y2={-90} stroke="#8a5a2b" strokeWidth={12} strokeLinecap="round" />
      <rect x={-34} y={-118} width={68} height={32} rx={6} fill="#7d8790" stroke={INK} strokeWidth={6} />
    </g>
  );
  if (prop === "rod") return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={0} y1={10} x2={260} y2={-200} stroke="#8a5a2b" strokeWidth={8} strokeLinecap="round" />
      <path d="M260 -200 Q 300 -40 290 260" stroke="#5c6670" strokeWidth={3} fill="none" />
    </g>
  );
  if (prop === "magnifier") return (
    <g transform={`translate(${x} ${y}) rotate(-30)`}>
      <line x1={0} y1={10} x2={0} y2={-60} stroke="#3d3d40" strokeWidth={14} strokeLinecap="round" />
      <circle cx={0} cy={-110} r={50} fill="#cfe9f7" fillOpacity={0.45} stroke={INK} strokeWidth={10} />
      <path d="M-24 -130 q 10 -18 30 -20" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  );
  if (prop === "label") return (
    <g transform={`translate(${x - 4} ${y - 34}) rotate(-12)`}>
      <rect x={-10} y={-8} width={26} height={14} rx={3} fill="#fbfaf4" stroke={INK} strokeWidth={3} />
      <circle cx={6} cy={-1} r={30} fill="none" stroke="#ffd23f" strokeWidth={4} strokeDasharray="6 6" />
    </g>
  );
  if (prop === "spade") return (
    <g transform={`translate(${x} ${y}) rotate(-28)`}>
      <line x1={0} y1={-60} x2={0} y2={150} stroke="#8a5a2b" strokeWidth={12} strokeLinecap="round" />
      <path d="M-32 140 h64 l-6 60 q -26 22 -52 0 Z" fill="#9aa4ad" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
  return null;
};

const FaceArt: React.FC<{ face: Face; blink: boolean; talk: number }> = ({ face, blink, talk }) => {
  const lx = (face.lookX ?? 0) * 16, ly = (face.lookY ?? 0) * 10;
  const eyes = blink && face.eyes !== "happy" ? "closed" : face.eyes;
  const eye = (cx: number) => {
    const x = cx + lx, y = -6 + ly;
    if (eyes === "closed") return <path d={`M${x - 14} ${y} q 14 8 28 0`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (eyes === "happy") return <path d={`M${x - 14} ${y + 4} q 14 -18 28 0`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
    if (eyes === "wide") return (
      <g>
        <ellipse cx={x} cy={y + 4} rx={24} ry={27} fill="#fff" stroke={INK} strokeWidth={6} />
        <circle cx={x + lx * 0.4} cy={y + 4 + ly * 0.4} r={8} fill={INK} />
      </g>
    );
    return (
      <g>
        <ellipse cx={x} cy={y} rx={11} ry={16} fill={INK} />
        <circle cx={x + 3} cy={y - 6} r={4} fill="#fff" />
        {eyes === "half" && <path d={`M${x - 16} ${y - 4} h32`} stroke={INK} strokeWidth={7} strokeLinecap="round" />}
        {eyes === "half" && <rect x={x - 14} y={y - 18} width={28} height={13} fill={SKIN} />}
      </g>
    );
  };
  const brow = (cx: number, side: 1 | -1) => {
    const b = face.brows;
    if (b === "none") return null;
    const x = cx + lx, y = (face.eyes === "wide" ? -33 : -32) + ly;
    // heights of the inner end (towards the nose) and the outer end; negative = higher
    const [inner, outer] = b === "worried" ? [-8, 3] : b === "angry" ? [8, -8] : b === "up" ? [-4, -4] : side === 1 ? [-14, -14] : [0, 0];
    const xi = x - side * 15, xo = x + side * 15;
    return <path d={`M${xi} ${y + inner} Q ${x} ${y + Math.min(inner, outer) - 9} ${xo} ${y + outer}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
  };

  const mx = lx * 0.7, my = 44 + ly * 0.5;
  let mouth: React.ReactNode;
  if (talk > 0.05) {
    const h = 6 + talk * 20, w = 22 - talk * 4;
    mouth = (
      <g>
        <ellipse cx={mx} cy={my + h / 2 - 4} rx={w} ry={h / 2 + 2} fill={INK} />
        <ellipse cx={mx} cy={my + h - 4} rx={w * 0.55} ry={Math.max(2, h * 0.22)} fill="#e46b6b" />
      </g>
    );
  } else {
    switch (face.mouth) {
      case "grin": mouth = <path d={`M${mx - 28} ${my - 6} q 28 34 56 0 q -28 8 -56 0 Z`} fill={INK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />; break;
      case "smile": mouth = <path d={`M${mx - 24} ${my - 4} q 24 20 48 0`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />; break;
      case "smirk": mouth = <path d={`M${mx - 30} ${my - 6} q 34 16 54 -6`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />; break;
      case "flat": mouth = <path d={`M${mx - 14} ${my} h 26`} stroke={INK} strokeWidth={6} strokeLinecap="round" />; break;
      case "teeth": mouth = (
        <g>
          <rect x={mx - 30} y={my - 12} width={60} height={26} rx={10} fill="#fff" stroke={INK} strokeWidth={6} />
          <path d={`M${mx - 28} ${my + 1} h56 M${mx - 10} ${my - 11} v24 M${mx + 10} ${my - 11} v24`} stroke={INK} strokeWidth={3} />
        </g>
      ); break;
      case "o": mouth = <ellipse cx={mx} cy={my + 2} rx={12} ry={15} fill={INK} />; break;
      case "frown": mouth = <path d={`M${mx - 22} ${my + 8} q 22 -18 44 0`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />; break;
      case "wavy": mouth = <path d={`M${mx - 24} ${my} q 8 -9 16 0 t 16 0 t 16 0`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />; break;
      case "scream": mouth = (
        <g>
          <path d={`M${mx - 30} ${my - 8} q 30 -18 60 0 q 6 46 -30 50 q -36 -4 -30 -50 Z`} fill={INK} />
          <path d={`M${mx - 18} ${my + 30} q 18 -16 36 0 q -18 14 -36 0 Z`} fill="#e46b6b" />
          <path d={`M${mx - 22} ${my - 6} q 22 -8 44 0 v 6 q -22 -6 -44 0 Z`} fill="#fff" />
        </g>
      ); break;
    }
  }
  return <g>{eye(-32)}{eye(32)}{brow(-32, -1)}{brow(32, 1)}{mouth}</g>;
};

const EmoteArt: React.FC<{ e: Emote; t: number }> = ({ e, t }) => {
  const pop = Math.min(1, t / 10);
  const s = popEase(pop);
  if (e === "sweat") {
    const y = (t * 2.2) % 70;
    return <g transform={`translate(128 ${-150 + y}) scale(${s})`} opacity={1 - y / 80}>
      <path d="M0 -26 q 18 26 0 38 q -18 -12 0 -38 Z" fill="#7cc4f2" stroke={INK} strokeWidth={5} />
    </g>;
  }
  if (e === "!" || e === "?") {
    return <g transform={`translate(${e === "!" ? 150 : -175} ${e === "!" ? -330 : -400}) scale(${s}) rotate(${Math.sin(t * 0.3) * 8})`}>
      <text x={0} y={0} fontSize={150} fontWeight={900} fontFamily="Arial Black, Arial" textAnchor="middle" fill={e === "!" ? "#ffd23f" : "#ffffff"} stroke={INK} strokeWidth={10} paintOrder="stroke">{e}</text>
    </g>;
  }
  if (e === "idea") {
    return <g transform={`translate(0 -590) scale(${s})`}>
      {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={0} y1={-62} x2={0} y2={-84} stroke="#ffd23f" strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 45 + t * 2})`} />)}
      <circle r={44} fill="#ffe46b" stroke={INK} strokeWidth={6} />
      <rect x={-18} y={38} width={36} height={24} rx={4} fill="#9aa1a8" stroke={INK} strokeWidth={5} />
    </g>;
  }
  if (e === "steam") {
    return <g opacity={0.9}>{[-1, 1].map((sd) => {
      const k = (t * 0.05) % 1;
      return <circle key={sd} cx={sd * (125 + k * 40)} cy={-300 - k * 90} r={18 + k * 26} fill="#e9eef2" stroke={INK} strokeWidth={4} opacity={1 - k} />;
    })}</g>;
  }
  // stars: spin around the head (dizzy)
  return <g>{[0, 1, 2].map((i) => {
    const a = t * 0.15 + (i * Math.PI * 2) / 3;
    return <path key={i} transform={`translate(${Math.cos(a) * 130} ${-470 + Math.sin(a) * 26}) scale(${s})`}
      d="M0 -22 L6 -7 L22 -7 L9 3 L14 20 L0 10 L-14 20 L-9 3 L-22 -7 L-6 -7 Z" fill="#ffd23f" stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
  })}</g>;
};

// ------------------------------------------------------------------ the character
export type GuyProps = {
  x: number; y: number; s?: number; flip?: boolean; t: number;
  pose?: Pose; face?: Face; talk?: number; blink?: boolean;
  handL?: Hand; handR?: Hand; prop?: PropName;
  hat?: { dx: number; dy: number; rot: number }; // hat offset (pop-off gag); undefined = on the head
  emote?: Emote; emoteT?: number; boil?: boolean; shadow?: boolean; feet?: "out" | "fwd";
  outfit?: Outfit; id?: string; shades?: boolean;
  jersey?: string; // flight-deck jersey colour (outfit "jersey")
};

export const Guy: React.FC<GuyProps> = ({
  x, y, s = 1, flip, t, pose = IDLE, face = FACES.happy, talk = 0, blink, handL = "mitt", handR = "mitt",
  prop = "none", hat, emote, emoteT = 0, boil = true, shadow = true, feet = "out", outfit = "ship", id = "guy", shades = false, jersey = "#ffd23f",
}) => {
  const p = pose;
  const sq = p.squash; // + = squashed (wider, shorter), - = stretched
  const hipX = p.hipX, hipY = -HIP_H - p.hipY;
  // legs
  const leg = (hipOff: number, [h, k]: [number, number], side: 1 | -1) => {
    const hx = hipX + hipOff, hy = hipY;
    const [kx, ky] = at(hx, hy, h, THIGH);
    const [fx, fy] = at(kx, ky, h + k, SHIN);
    const fdir = feet === "fwd" ? 1 : side;
    return (
      <g key={side}>
        <polyline points={`${hx},${hy} ${kx},${ky} ${fx},${fy}`} fill="none" stroke={INK} strokeWidth={LIMB} strokeLinejoin="round" strokeLinecap="round" />
        <ellipse cx={fx + fdir * 16} cy={fy - 2} rx={30} ry={14} fill={INK} transform={`rotate(${(h + k) * -0.25} ${fx} ${fy})`} />
      </g>
    );
  };
  // torso frame
  const [nx, ny] = at(hipX, hipY, 180 + p.lean, TORSO);
  const torsoRot = -p.lean;
  const headRot = -(p.lean + p.tilt);
  const [hx, hy] = at(nx, ny, 180 + p.lean + p.tilt * 0.6, HEAD_R - 6);
  // arms (shoulders sit inside the vest top)
  const arm = (side: 1 | -1, [sA, eA]: [number, number], hand: Hand) => {
    const [bx, by] = at(nx, ny, 180 + p.lean - side * 90, 46);
    const [sx, sy] = at(bx, by, p.lean, 22);
    const a1 = p.lean + side * sA;
    const [ex, ey] = at(sx, sy, a1, UPPER);
    const a2 = a1 + side * eA;
    const [wx, wy] = at(ex, ey, a2, LOWER);
    return {
      line: <polyline key={`a${side}`} points={`${sx},${sy} ${ex},${ey} ${wx},${wy}`} fill="none" stroke={INK} strokeWidth={LIMB} strokeLinejoin="round" strokeLinecap="round" />,
      hand: <MittHand key={`h${side}`} x={wx} y={wy} a={a2} hand={hand} side={side} />,
      wx, wy,
    };
  };
  const L = arm(-1, p.armL, handL), R = arm(1, p.armR, handR);
  const hatT = hat ?? { dx: 0, dy: 0, rot: 0 };
  const boilSeed = Math.floor(t / 8) % 3; // owner 2026-11-13: "less outline wobble" (was every 4 frames)
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s * (1 + sq * 0.6)} ${s * (1 - sq)})`}>
      {boil && (
        <defs>
          <filter id={`${id}-boil`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={1} seed={boilSeed} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={1.2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id={`${id}-head`} cx="62%" cy="32%" r="78%">
            <stop offset="0.55" stopColor={SKIN} />
            <stop offset="1" stopColor={SHADE} />
          </radialGradient>
        </defs>
      )}
      {shadow && <ellipse cx={hipX} cy={4} rx={Math.max(50, 125 - Math.max(0, p.hipY) * 0.6)} ry={18} fill="rgba(60,80,110,0.18)" />}
      <g filter={boil ? `url(#${id}-boil)` : undefined}>
        {leg(-22, p.legL, -1)}
        {leg(22, p.legR, 1)}
        {L.line}
        {/* vest */}
        <g transform={`translate(${nx} ${ny}) rotate(${torsoRot})`}>
          <line x1={0} y1={0} x2={0} y2={TORSO} stroke={INK} strokeWidth={LIMB} />
          {outfit === "ship" || outfit === "road" ? (
            <g>
              <path d="M-52 6 Q -60 80 -64 150 Q -30 166 0 160 Q 30 166 64 150 Q 60 80 52 6 Q 0 -6 -52 6 Z" fill={outfit === "road" ? "#cfe34a" : ORANGE} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M28 10 Q 50 80 54 148 Q 60 150 64 150 Q 60 80 52 6 Z" fill={outfit === "road" ? "#a9bd32" : ORANGE_D} />
              <path d="M-60 92 Q 0 102 60 92 L 61 112 Q 0 122 -61 112 Z" fill={STRIPE} stroke={INK} strokeWidth={3} />
              <path d="M-63 126 Q 0 136 63 126 L 64 140 Q 0 150 -64 140 Z" fill={STRIPE} stroke={INK} strokeWidth={3} />
              <path d="M-30 4 L -8 60 L -20 158 M30 4 L 8 60 L 20 158" stroke={STRIPE} strokeWidth={9} fill="none" />
              <path d="M-30 4 L -8 60 L -20 158 M30 4 L 8 60 L 20 158" stroke={INK} strokeWidth={3} fill="none" />
              <path d="M-22 4 L 0 46 L 22 4" fill={SKIN} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            </g>
          ) : outfit === "pilot" ? (
            <g>
              {/* harbour pilot: plain dark jacket, PILOT on the chest, no hat (owner: the old cap looked odd) */}
              <path d="M-54 6 Q -62 80 -64 152 Q 0 168 64 152 Q 62 80 54 6 Q 0 -6 -54 6 Z" fill="#2a3a52" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M30 10 Q 52 80 54 150 L 64 152 Q 62 80 54 6 Z" fill="#1f2c40" />
              <path d="M-24 4 L 0 34 L 24 4" fill="#e8ecef" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <line x1={0} y1={34} x2={0} y2={156} stroke="#8a97a8" strokeWidth={4} />
              <rect x={-50} y={58} width={42} height={18} rx={4} fill="#f4f4f4" stroke={INK} strokeWidth={3} />
              <text x={-29} y={72} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>PILOT</text>
            </g>
          ) : outfit === "officer" ? (
            <g>
              {/* ship's officer: white shirt, black shoulder boards with gold stripes, no hat */}
              <path d="M-52 6 Q -60 80 -62 150 Q 0 166 62 150 Q 60 80 52 6 Q 0 -6 -52 6 Z" fill="#f2f4f6" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M30 10 Q 50 80 52 148 L 62 150 Q 60 80 52 6 Z" fill="#cfd8df" />
              <path d="M-20 4 L 0 30 L 20 4" fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              {[-1, 1].map((sd) => <g key={sd}><rect x={sd > 0 ? 30 : -58} y={6} width={28} height={14} rx={3} fill="#1d1d22" stroke={INK} strokeWidth={2} /><line x1={sd > 0 ? 34 : -54} y1={13} x2={sd > 0 ? 54 : -34} y2={13} stroke="#e0b13a" strokeWidth={3} /></g>)}
              {[60, 92, 124].map((yy) => <circle key={yy} cx={0} cy={yy} r={4} fill="#c9ced3" />)}
              <rect x={22} y={54} width={22} height={18} rx={3} fill="none" stroke="#9aa6b1" strokeWidth={3} />
            </g>
          ) : outfit === "jersey" ? (
            <g>
              {/* flight-deck crew: long-sleeve jersey in the job colour + a float vest in the same colour, number on the back */}
              <path d="M-52 6 Q -60 80 -62 152 Q 0 166 62 152 Q 60 80 52 6 Q 0 -6 -52 6 Z" fill={jersey} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M30 10 Q 50 80 52 150 L 62 152 Q 60 80 52 6 Z" fill="#000" opacity={0.16} />
              <path d="M-50 40 Q 0 52 50 40 L 54 92 Q 0 104 -54 92 Z" fill={jersey} stroke={INK} strokeWidth={5} />
              <path d="M-50 40 Q 0 52 50 40 L 54 92 Q 0 104 -54 92 Z" fill="#fff" opacity={0.18} />
              <path d="M-56 58 h 18 M38 58 h 18" stroke="#e8ecef" strokeWidth={6} />
              <path d="M-20 4 L 0 26 L 20 4" fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            </g>
          ) : outfit === "fire" ? (
            <g>
              {/* firefighter: tan fire suit, yellow/silver reflective bands, breathing-set straps */}
              <path d="M-54 6 Q -62 80 -66 158 Q 0 172 66 158 Q 62 80 54 6 Q 0 -6 -54 6 Z" fill="#c8a86a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M30 10 Q 52 80 56 156 L 66 158 Q 62 80 54 6 Z" fill="#a88a50" />
              <path d="M-62 100 Q 0 110 62 100 L 63 118 Q 0 128 -63 118 Z" fill="#e8ef6a" stroke={INK} strokeWidth={3} />
              <path d="M-64 136 Q 0 146 64 136 L 65 150 Q 0 160 -65 150 Z" fill="#d9dde0" stroke={INK} strokeWidth={3} />
              <path d="M-34 6 L -24 96 M34 6 L 24 96" stroke="#2a2d33" strokeWidth={10} fill="none" />
              <rect x={-14} y={30} width={28} height={30} rx={6} fill="#5a636c" stroke={INK} strokeWidth={4} />
            </g>
          ) : outfit === "aviator" ? (
            <g>
              {/* naval aviator: olive flight suit, survival vest (harness) */}
              <path d="M-52 6 Q -60 80 -62 152 Q 0 166 62 152 Q 60 80 52 6 Q 0 -6 -52 6 Z" fill="#6f7a52" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M30 10 Q 50 80 52 150 L 62 152 Q 60 80 52 6 Z" fill="#59633f" />
              <path d="M-46 14 L -30 150 M46 14 L 30 150 M-48 70 L 48 70" stroke="#3a3f2c" strokeWidth={9} fill="none" />
              <rect x={-44} y={84} width={30} height={22} rx={4} fill="#59633f" stroke={INK} strokeWidth={3} />
              <rect x={10} y={30} width={34} height={16} rx={3} fill="#2c3550" stroke={INK} strokeWidth={2} />
            </g>
          ) : outfit === "coverall" ? (
            <g>
              {/* deck crew: blue coveralls with a reflective band, white hard hat */}
              <path d="M-52 6 Q -60 80 -62 152 Q 0 166 62 152 Q 60 80 52 6 Q 0 -6 -52 6 Z" fill="#2f5f9a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M30 10 Q 50 80 52 150 L 62 152 Q 60 80 52 6 Z" fill="#244a78" />
              <path d="M-60 104 Q 0 114 60 104 L 61 120 Q 0 130 -61 120 Z" fill="#dfe6ea" stroke={INK} strokeWidth={3} />
              <path d="M-20 4 L 0 28 L 20 4" fill="#e8ecef" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              <line x1={0} y1={28} x2={0} y2={100} stroke="#1c3a60" strokeWidth={4} />
            </g>
          ) : (
            <g>
              <path d="M-52 6 Q -60 80 -64 152 Q 0 168 64 152 Q 60 80 52 6 Q 0 -6 -52 6 Z" fill="#22324f" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M-22 4 L 0 52 L 22 4" fill="#f2f4f6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              {[70, 102, 134].map((yy) => <circle key={yy} cx={0} cy={yy} r={6} fill="#e0b13a" stroke={INK} strokeWidth={3} />)}
              {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 40} 150 h ${sd * 18} M${sd * 40} 140 h ${sd * 18}`} stroke="#e0b13a" strokeWidth={5} />)}
            </g>
          )}
        </g>
        {R.line}
        {/* head + face + hat */}
        <g transform={`translate(${hx} ${hy}) rotate(${headRot})`}>
          <circle r={HEAD_R} fill={boil ? `url(#${id}-head)` : SKIN} stroke={INK} strokeWidth={8} />
          <FaceArt face={face} blink={blink ?? blinking(t)} talk={talk} />
          {shades && <g><path d="M-62 -24 h52 q4 0 4 4 q-2 26 -26 26 q-26 -2 -30 -26 Z M10 -24 h52 q4 0 4 4 q-2 26 -26 26 q-26 -2 -30 -26 Z" fill="#111" stroke={INK} strokeWidth={4} /><line x1={-6} y1={-18} x2={10} y2={-18} stroke={INK} strokeWidth={6} /><path d="M-50 -16 l 14 0" stroke="#fff" strokeWidth={4} opacity={0.6} /></g>}
          {outfit === "captain" && (
            <g transform={`translate(${hatT.dx} ${hatT.dy}) rotate(${hatT.rot - 4} 0 -70)`}>
              <path d="M-112 -96 Q -110 -150 0 -154 Q 110 -150 112 -96 Q 0 -80 -112 -96 Z" fill="#f4f6f8" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M-90 -92 L -86 -66 Q 0 -56 86 -66 L 90 -92 Q 0 -80 -90 -92 Z" fill="#1d2f4f" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
              <path d="M-80 -64 Q 0 -30 80 -64 Q 0 -54 -80 -64 Z" fill={INK} />
              <circle cx={0} cy={-102} r={14} fill="#e0b13a" stroke={INK} strokeWidth={4} />
            </g>
          )}
          {outfit === "jersey" && (
            <g transform={`translate(${hatT.dx} ${hatT.dy}) rotate(${hatT.rot - 4} 0 -70)`}>
              {/* "cranial" flight-deck helmet: shell in the jersey colour, ear cups, goggles pushed up */}
              <path d="M-100 -40 C -108 -130, -56 -170, 2 -172 C 62 -170, 110 -130, 102 -40 L 84 -44 C 86 -110, 50 -146, 2 -148 C -48 -146, -84 -110, -82 -44 Z" fill={jersey} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <ellipse cx={-100} cy={-30} rx={22} ry={34} fill="#30353c" stroke={INK} strokeWidth={6} />
              <ellipse cx={102} cy={-30} rx={22} ry={34} fill="#30353c" stroke={INK} strokeWidth={6} />
              <rect x={-74} y={-150} width={60} height={34} rx={14} fill="#9fd3ee" stroke={INK} strokeWidth={6} />
              <rect x={14} y={-150} width={60} height={34} rx={14} fill="#9fd3ee" stroke={INK} strokeWidth={6} />
              <line x1={-14} y1={-133} x2={14} y2={-133} stroke={INK} strokeWidth={6} />
            </g>
          )}
          {outfit === "fire" && (
            <g>
              {/* breathing mask over the face: clear lens, black rubber rim, regulator */}
              <ellipse cx={0} cy={6} rx={80} ry={70} fill="#9fd3ee" opacity={0.35} stroke="#1d1d22" strokeWidth={12} />
              <path d="M-50 -30 Q 0 -46 50 -30" stroke="#fff" strokeWidth={6} fill="none" opacity={0.6} />
              <circle cx={0} cy={74} r={26} fill="#2a2d33" stroke={INK} strokeWidth={5} />
              <circle cx={0} cy={74} r={10} fill="#5a636c" />
              <path d="M26 80 Q 90 110 110 180" stroke="#2a2d33" strokeWidth={10} fill="none" />
              {/* fire helmet with a wide back brim */}
              <g transform={`translate(${hatT.dx} ${hatT.dy}) rotate(${hatT.rot - 6} 0 -70)`}>
                <path d="M-140 -50 Q -136 -70 -100 -72 L 110 -72 Q 146 -68 150 -40 Q 0 -30 -140 -50 Z" fill="#e0a23b" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
                <path d="M-98 -70 C -100 -150, -50 -186, 4 -188 C 62 -186, 108 -150, 104 -70 Z" fill="#ffd23f" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
                <path d="M4 -188 C -4 -150, -4 -110, -2 -72" stroke={INK} strokeWidth={6} fill="none" />
                <rect x={-34} y={-150} width={68} height={50} rx={10} fill="#fff" stroke={INK} strokeWidth={4} />
                <text x={0} y={-114} textAnchor="middle" fontSize={26} fontWeight={700} fill="#c94a3a">FIRE</text>
              </g>
            </g>
          )}
          {outfit === "aviator" && (
            <g transform={`translate(${hatT.dx} ${hatT.dy}) rotate(${hatT.rot - 4} 0 -70)`}>
              {/* flight helmet with the visor up and an oxygen-mask hose */}
              <path d="M-108 -20 C -116 -140, -60 -186, 2 -188 C 66 -186, 118 -140, 110 -20 L 88 -30 C 92 -120, 52 -160, 2 -162 C -50 -160, -88 -120, -86 -30 Z" fill="#e9ecef" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <path d="M-80 -150 Q 2 -196 84 -150 L 76 -126 Q 2 -164 -72 -126 Z" fill="#2b3340" stroke={INK} strokeWidth={5} />
              <path d="M-60 -170 Q 2 -186 60 -170" stroke="#ffd23f" strokeWidth={8} fill="none" />
            </g>
          )}
          {(outfit === "ship" || outfit === "coverall" || outfit === "road") && (
          <g transform={`translate(${hatT.dx} ${hatT.dy}) rotate(${hatT.rot - 8} 0 -70)`}>
            <path d="M-104 -56 C -110 -140, -60 -180, 4 -182 C 70 -180, 114 -140, 106 -56 Z" fill={outfit === "road" ? "#ffd23f" : HAT} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
            <path d="M52 -166 C 88 -146, 104 -110, 104 -62 L 66 -62 C 72 -100, 68 -136, 52 -166 Z" fill={HAT_D} opacity={0.75} />
            <path d="M2 -180 C -6 -140, -6 -100, -2 -66" stroke={INK} strokeWidth={4} fill="none" opacity={0.85} />
            <path d="M-72 -126 C -64 -150, -46 -164, -26 -170" stroke="#fff" strokeWidth={11} fill="none" strokeLinecap="round" />
            <path d="M-122 -52 Q -124 -72 -100 -68 L 108 -68 Q 130 -72 128 -52 Q 4 -40 -122 -52 Z" fill={HAT} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
            <path d="M-98 -54 Q 4 -46 106 -54" stroke={HAT_D} strokeWidth={5} fill="none" />
          </g>
          )}
        </g>
        {L.hand}
        {R.hand}
        {prop !== "none" && <Held prop={prop} x={R.wx} y={R.wy} />}
      </g>
      {emote && <g transform={`translate(${hx} ${hy + 330})`}><EmoteArt e={emote} t={emoteT} /></g>}
    </g>
  );
};

// ------------------------------------------------------------------ motion extras
/** Speed lines behind a fast mover. */
export const SpeedLines: React.FC<{ x: number; y: number; dir: 1 | -1; t: number; o?: number }> = ({ x, y, dir: d, t, o = 1 }) => (
  <g opacity={o}>
    {[0, 1, 2, 3].map((i) => {
      const len = 90 + ((t * 7 + i * 31) % 60);
      const yy = y - 120 - i * 90;
      return <line key={i} x1={x - d * 120} y1={yy} x2={x - d * (120 + len)} y2={yy} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={0.7} />;
    })}
  </g>
);

/** Dust puffs at the feet (landings, sliding, digging). k = 0..1 life of the puff. */
export const Dust: React.FC<{ x: number; y: number; k: number; spread?: number; color?: string }> = ({ x, y, k, spread = 1, color = "#e7dcc4" }) => (
  <g opacity={Math.max(0, 1 - k)}>
    {[-1, -0.4, 0.4, 1].map((d, i) => (
      <circle key={i} cx={x + d * (40 + k * 120) * spread} cy={y - 10 - k * 40 * (i % 2 ? 1.4 : 1)} r={14 + k * 26} fill={color} stroke={INK} strokeWidth={4} />
    ))}
  </g>
);
