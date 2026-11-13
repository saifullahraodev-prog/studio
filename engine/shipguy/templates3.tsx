// The Ship Guy: scene templates for "Ever Given in Suez" (video #3). Same rules as templates.tsx:
// full 1920x1080 frame from (t = frame in beat, d = beat length, p = params, w = spoken word spans).
// The animated puppet (guy.tsx) acts inside most scenes. Frame-driven only.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { Dust, Emote, FACES, Face, Guy, GuyProps, Hand, IDLE, Outfit, POSES, Pose, PropName, breathe, chatter, talkFrom, track, walk } from "./guy";
import { fontFamily, ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { TEMPLATES3B } from "./templates3b";

export const PAPER = "#f3f1ea", SAND = "#e8d6a6", SAND_D = "#cdb27a", WATER = "#4f9fc4", WATER_D = "#3a80a8";
export const GREEN = "#2f7d4a", GREEN_D = "#256a3d", ANTIFOUL = "#b8432f";
export const BOX = ["#c94a3a", "#3a73b8", "#e0a23b", "#4f8a5b", "#8a5aa8", "#d06a2e", "#3f9a9a", "#b8b8b0"];
export const ink = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
export const txt = (s?: string) => (s ?? "").replace(/_/g, " ");
export const clamp01 = (k: number) => Math.max(0, Math.min(1, k));
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const T3: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; color?: string; anchor?: "start" | "middle" | "end"; o?: number; s?: number; rot?: number }> = ({ x, y, size, children, color = "#fff", anchor = "middle", o = 1, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`} opacity={o}>
    <text x={0} y={0} fontFamily={fontFamily} fontWeight={700} fontSize={size} fill={color} textAnchor={anchor}
      stroke={INK} strokeWidth={size * 0.14} paintOrder="stroke" strokeLinejoin="round">{children}</text>
  </g>
);

/** pop-in scale 0 -> 1 with a soft settle, starting at frame a */
export const pop = (t: number, a: number, len = 12) => {
  const k = clamp01((t - a) / len);
  if (k <= 0) return 0;
  const c = 0.8, q = k - 1; // gentle ease-out-back (owner wants smooth, not snappy)
  return 1 + (c + 1) * q * q * q + c * q * q;
};

// ================================================================== the ship (Ever Given), side view
// origin: x=0 stern, x=1300 bow; y=0 deck line; keel at y=230; waterline (loaded) at y=150.
export const EGSide: React.FC<{ boxes?: number; t?: number; name?: boolean; stress?: number; thrusters?: boolean; red?: boolean }> = ({ boxes = 1, t = 0, name = true, stress = 0, thrusters = false, red = true }) => {
  const cols = 22;
  return (
    <g>
      {/* containers (drawn first, behind the bridge) */}
      {Array.from({ length: cols }).map((_, c) => {
        const show = clamp01(boxes * cols - c);
        if (show <= 0) return null;
        const x = 130 + c * 50;
        if (x > 1040 && x < 1110) return null; // gap for the bridge
        const rows = 4 + (c % 3 === 0 ? 1 : 0);
        return Array.from({ length: rows }).map((__, r) => (
          <rect key={`${c}-${r}`} x={x} y={-44 - r * 44 + (1 - show) * -60} width={48} height={42} opacity={show}
            fill={BOX[(c * 3 + r * 5) % BOX.length]} stroke={INK} strokeWidth={4} />
        ));
      })}
      {/* bridge tower near the bow (Golden class) + funnel aft */}
      <rect x={1040} y={-300} width={70} height={300} fill="#f4f4ee" stroke={INK} strokeWidth={6} />
      <rect x={1020} y={-300} width={110} height={34} fill="#f4f4ee" stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((i) => <rect key={i} x={1032 + i * 32} y={-292} width={24} height={16} fill="#2c4a6e" />)}
      <rect x={70} y={-150} width={60} height={150} fill="#f4f4ee" stroke={INK} strokeWidth={6} />
      <rect x={80} y={-200} width={40} height={50} fill="#2f7d4a" stroke={INK} strokeWidth={6} />
      {/* hull */}
      <path d="M0 -10 L1260 -10 Q1330 60 1300 230 L40 230 Q0 200 0 -10 Z" fill={GREEN} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {red && <path d="M3 150 L1316 150 Q1312 200 1300 230 L40 230 Q8 205 3 150 Z" fill={ANTIFOUL} />}
      <path d="M0 -10 L1260 -10 Q1330 60 1300 230 L40 230 Q0 200 0 -10 Z" fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M8 22 L1280 22" stroke={GREEN_D} strokeWidth={10} />
      {name && <text x={560} y={110} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={84} fill="#f4f4ee" letterSpacing={8}>EVERGREEN</text>}
      {thrusters && [0, 1].map((i) => (
        <g key={i} transform={`translate(${1180 + i * 60} 175)`}>
          <circle r={24} fill="#1d2a36" stroke={INK} strokeWidth={5} />
          <g transform={`rotate(${t * 25})`}><path d="M0 -18 L5 0 L0 18 L-5 0 Z M-18 0 L0 5 L18 0 L0 -5 Z" fill="#ffd23f" /></g>
        </g>
      ))}
      {stress > 0 && (
        <g opacity={stress}>
          <path d="M560 -10 l 30 60 l -26 40 l 34 60 l -20 70" stroke="#e8352b" strokeWidth={9} fill="none" strokeLinejoin="round" />
          <path d="M700 230 l -20 -50 l 24 -30 l -16 -50" stroke="#e8352b" strokeWidth={7} fill="none" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

// ================================================================== the ship, top view (world units = metres)
// centre (0,0), bow towards +x. Length 400, beam 59.
export const EGTop: React.FC<{ s?: number; ghost?: boolean }> = ({ ghost }) => (
  <g opacity={ghost ? 0.35 : 1}>
    <path d="M-200 -28 L150 -29.5 Q196 -14 204 0 Q196 14 150 29.5 L-200 28 Q-207 0 -200 -28 Z" fill={GREEN} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    {Array.from({ length: 24 }).map((_, c) => (c === 18 ? null : Array.from({ length: 4 }).map((__, r) => (
      <rect key={`${c}-${r}`} x={-178 + c * 13} y={-24 + r * 12} width={12} height={11} fill={BOX[(c * 5 + r * 3) % BOX.length]} stroke={INK} strokeWidth={0.8} />
    ))))}
    <rect x={56} y={-27} width={10} height={54} fill="#f4f4ee" stroke={INK} strokeWidth={1.5} />
    <rect x={-196} y={-10} width={12} height={20} fill="#f4f4ee" stroke={INK} strokeWidth={1.5} />
  </g>
);

const OtherShip: React.FC<{ len: number; color: string; seed?: number }> = ({ len, color, seed = 0 }) => (
  <g>
    <path d={`M${-len / 2} -14 L${len / 2 - 30} -15 Q${len / 2} -6 ${len / 2 + 4} 0 Q${len / 2} 6 ${len / 2 - 30} 15 L${-len / 2} 14 Q${-len / 2 - 4} 0 ${-len / 2} -14 Z`} fill={color} stroke={INK} strokeWidth={2.5} />
    {seed % 2 === 0
      ? Array.from({ length: Math.floor(len / 14) - 3 }).map((_, i) => <rect key={i} x={-len / 2 + 10 + i * 14} y={-11} width={13} height={22} fill={BOX[(i + seed) % BOX.length]} stroke={INK} strokeWidth={0.8} />)
      : <rect x={-len / 2 + 10} y={-9} width={len - 60} height={18} rx={4} fill="#d9d4c4" stroke={INK} strokeWidth={1} />}
    <rect x={-len / 2 + 2} y={-12} width={10} height={24} fill="#f4f4ee" stroke={INK} strokeWidth={1.2} />
  </g>
);

const TugTop: React.FC<{ big?: boolean }> = ({ big }) => (
  <g transform={`scale(${big ? 1.5 : 1})`}>
    <path d="M-16 -7 L10 -7 Q19 0 10 7 L-16 7 Z" fill={big ? "#e0a23b" : "#c94a3a"} stroke={INK} strokeWidth={1.6} />
    <rect x={-8} y={-4} width={9} height={8} fill="#f4f4ee" stroke={INK} strokeWidth={1} />
  </g>
);

const DiggerTop: React.FC = () => (
  <g>
    <rect x={-6} y={-5} width={12} height={10} fill="#ffd23f" stroke={INK} strokeWidth={1.2} />
    <path d="M6 -1 L18 -3 L18 3 L6 1 Z" fill="#ffd23f" stroke={INK} strokeWidth={1} />
  </g>
);

// ================================================================== Ship Guy acting library
export type ActOut = Partial<GuyProps> & { rot?: number; dy?: number };
export const act = (a: string, t: number, w?: number[][]): ActOut => {
  const talk = w ? talkFrom(t, w) : 0;
  const b = (p: Pose, seed = 0) => breathe(p, t, seed);
  switch (a) {
    case "wave": return { pose: { ...POSES.hipWave, armR: [150, -20 + Math.sin(t * 0.35) * 22] }, handR: "open", face: FACES.happy, talk };
    case "point": return { pose: b(track(t, [[0, IDLE], [4, POSES.point]])), handR: "point", face: FACES.happy, talk };
    case "think": return { pose: b(track(t, [[0, IDLE], [4, POSES.chin]])), face: FACES.thinking, emote: "?", emoteT: t - 8 };
    case "shrug": return { pose: b(track(t, [[0, IDLE], [4, POSES.shrug]])), face: { eyes: "dot", brows: "up", mouth: "wavy" }, handL: "open", handR: "open", talk };
    case "worried": return { pose: b({ ...IDLE, armL: [10, -30], armR: [10, -30], tilt: 4 }), face: FACES.worried, emote: "sweat", emoteT: t, talk };
    case "shock": {
      const pose = track(t, [[0, IDLE], [3, { ...POSES.crouch, armL: [40, 20], armR: [40, 20] }, 4], [9, { ...POSES.handsHead, hipY: 120, squash: -0.08 }, 5], [20, { ...POSES.handsHead, squash: 0.08 }, 4], [26, POSES.handsHead, 6]]);
      const hk = clamp01((t - 9) / 30);
      return { pose: t > 30 ? b(pose) : pose, face: t < 6 ? FACES.amazed : FACES.shocked, handL: "open", handR: "open", emote: "!", emoteT: t,
        hat: t < 9 || hk >= 1 ? undefined : { dx: hk * 26, dy: -Math.sin(hk * Math.PI) * 280, rot: Math.sin(hk * Math.PI) * 50 } };
    }
    case "amazed": return { pose: b(track(t, [[0, IDLE], [3, { ...POSES.present, armL: [40, 60], armR: [40, 60] }]])), face: FACES.amazed, handL: "open", handR: "open" };
    case "laugh": return { pose: { ...POSES.hold, hipY: Math.abs(Math.sin(t * 0.5)) * 8, tilt: Math.sin(t * 0.5) * 4 }, prop: "phone", face: { eyes: "happy", brows: "up", mouth: "grin" }, blink: false };
    case "clipboard": return { pose: b(POSES.hold), prop: "clipboard", face: FACES.talk, talk };
    case "wag": return { pose: b({ ...POSES.fingerUp, armR: [38 + Math.sin(t * 0.6) * 10, 130] }), handR: "point", face: FACES.confident, talk };
    case "fingerup": return { pose: b(track(t, [[0, IDLE], [3, POSES.fingerUp]])), handR: "point", face: FACES.happy, talk };
    case "hold": return { pose: b(track(t, [[0, IDLE], [3, POSES.stop]])), handR: "open", face: FACES.confident, talk };
    case "count": return { pose: b({ ...POSES.fingerUp, armR: [38, 130 + Math.sin(t * 0.4) * 12] }), handR: "open", face: { eyes: "dot", brows: "one", mouth: "flat", lookX: 0.5 }, talk };
    case "watch": return { pose: { ...IDLE, armL: [62, -128], hipY: Math.max(0, Math.sin(t * 0.5)) * 4 }, face: { eyes: "dot", brows: "angry", mouth: "frown", lookX: -0.5, lookY: 0.4 }, talk };
    case "plan": return { pose: b(track(t, [[0, IDLE], [4, POSES.point]])), handR: "point", face: FACES.talk, talk };
    case "relax": return { pose: { ...IDLE, hipY: -96, legL: [-80, -6], legR: [-74, -10], armR: [26, 100 + Math.max(0, Math.sin(t * 0.05)) * 30], armL: [30, 20] }, prop: "mug", face: FACES.satisfied, shadow: false, feet: "fwd", talk };
    case "cheer": return { pose: { ...POSES.cheer, hipY: Math.abs(Math.sin(t * 0.3)) * 40 }, handL: "open", handR: "open", face: { eyes: "happy", brows: "up", mouth: "grin" },
      hat: { dx: 0, dy: -Math.abs(Math.sin(t * 0.3)) * 140, rot: Math.sin(t * 0.3) * 20 } };
    case "hat": return { pose: { ...IDLE, lean: 12 + Math.sin(t * 0.4) * 3, armR: [150, 70], legL: [-14, 0], legR: [10, 0] }, face: { eyes: "half", brows: "angry", mouth: "teeth" } };
    case "measure": return { pose: b({ ...POSES.present, armL: [80, 0], armR: [80, 0] }), face: FACES.confident, handL: "mitt", handR: "mitt" };
    case "dig": {
      const c = (t % 30) / 30, down = Math.sin(c * Math.PI * 2);
      return { pose: { ...IDLE, lean: 18 + down * 12, hipY: -18 + down * 10, armR: [40 + down * 30, 60], armL: [50 + down * 30, 30], legL: [-24, 30], legR: [22, -20], tilt: 6 }, prop: "spade", face: { eyes: "dot", brows: "worried", mouth: "wavy" }, emote: "sweat", emoteT: t };
    }
    case "push": {
      const strain = Math.sin(t * 0.9) * 4, slide = (t * 0.6) % 24;
      return { pose: { ...IDLE, lean: -34 + strain * 0.4, hipY: Math.abs(strain), armL: [-78, 8], armR: [84, -10], legL: [-40 - slide * 0.3, 10], legR: [-12, 20], tilt: -4 }, face: { eyes: "closed", brows: "angry", mouth: "teeth" }, blink: true, handL: "open", handR: "open", emote: "steam", emoteT: t, feet: "fwd" };
    }
    case "rope": return { pose: { ...IDLE, hipY: 40 + Math.sin(t * 0.3) * 10, armL: [165, 0], armR: [165, 0], legL: [20 + Math.sin(t * 0.3) * 18, 30], legR: [36 + Math.sin(t * 0.3 + 1) * 18, 20] }, face: { eyes: "wide", brows: "worried", mouth: "teeth" }, shadow: false };
    case "fix": {
      const k = Math.abs(Math.sin(t * 0.35));
      return { pose: { ...IDLE, armR: [100 + k * 50, 20], armL: [40, 30] }, prop: "hammer", face: FACES.confident };
    }
    case "look": return { pose: b({ ...IDLE, tilt: -10 }), face: { eyes: "wide", brows: "up", mouth: "o", lookY: -1 } };
    case "faint": {
      const k = smooth3(clamp01((t - 6) / 14));
      return { pose: { ...IDLE, armL: [60, 10], armR: [60, 10] }, face: { eyes: "closed", brows: "worried", mouth: "wavy" }, blink: true, rot: -k * 88, emote: k > 0.9 ? "stars" : undefined, emoteT: t, shadow: k < 0.3 };
    }
    case "fish": return { pose: { ...IDLE, hipY: -96, legL: [-80, -6], legR: [-74, -10], armR: [40, 40], armL: [30, 30] }, prop: "rod", face: { eyes: "half", brows: "none", mouth: "flat" }, shadow: false, feet: "fwd" };
    case "drive": return { pose: { ...IDLE, hipY: -96, legL: [-80, -6], legR: [-74, -10], armL: [-70, 10], armR: [70, -10] }, face: FACES.happy, shadow: false, feet: "fwd" };
    case "talk": return { pose: b(IDLE), face: FACES.talk, talk: talk || chatter(t) * 0 };
    default: return { pose: b(IDLE), face: FACES.happy, talk };
  }
};
const smooth3 = (k: number) => k * k * (3 - 2 * k);

/** Ship Guy acting `a` at (x, y), scale s. */
export const Actor: React.FC<{ a: string; t: number; x: number; y: number; s?: number; flip?: boolean; w?: number[][]; id: string; outfit?: Outfit; over?: ActOut }> = ({ a, t, x, y, s = 1, flip, w, id, outfit, over }) => {
  const o = { ...act(a, t, w), ...(over ?? {}) };
  const { rot = 0, dy = 0, ...g } = o;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <Guy x={x} y={y + dy} s={s} flip={flip} t={t} id={id} outfit={outfit} {...g} />
    </g>
  );
};

/** small Ship Guy reacting in the bottom-right corner of a graphic shot (pops up from the bottom edge) */
export const CornerGuy: React.FC<{ t: number; d: number; act: string }> = ({ t, act: a }) => {
  const k = ramp(t, 4, 16);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Svg>
        <Actor a={a} t={Math.max(0, t - 6)} x={1740} y={1090 + (1 - k) * 330} s={0.46} id="corner" />
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== backgrounds
const Paper: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={W} height={H} fill={PAPER} />
    {Array.from({ length: 14 }).map((_, i) => (
      <circle key={i} cx={(rnd(i) * W + t * (0.2 + rnd(i + 9) * 0.3)) % W} cy={200 + rnd(i + 3) * 760} r={20 + rnd(i + 5) * 60} fill="#e9e4d6" opacity={0.6} />
    ))}
    <line x1={0} y1={990} x2={W} y2={990} stroke="#ddd6c4" strokeWidth={5} />
  </g>
);

const DesertSky: React.FC<{ haze?: number; dusk?: boolean }> = ({ haze = 0, dusk }) => (
  <g>
    <defs>
      <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={dusk ? "#f2a65a" : "#9fd3ee"} />
        <stop offset="1" stopColor={dusk ? "#f7d9a0" : "#e8f3f2"} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#dsky)" />
    {haze > 0 && <rect width={W} height={H} fill="#c79a5a" opacity={haze} />}
  </g>
);

// ================================================================== CANAL (top-down, the workhorse)
// World: metres. Canal runs left->right (north = right). Top bank = west, bottom bank = east.
const CAM: Record<string, number> = { far: 0.9, mid: 1.35, wide: 1.65, close: 2.3 };
const CANAL_W = 250;
const WEDGE = 38; // degrees: 400 m ship across a ~250 m canal

export const Canal: Tpl = ({ t, d, p }) => {
  const st = p.state ?? "empty";
  const S = CAM[p.cam ?? "wide"] ?? 1.65;
  const cy = 610;
  const k = ramp(t, 0, d);
  // ship pose in canal coords
  let sx = 0, sy = 0, ang = 0, show = true;
  if (st === "convoy" || st === "empty" || st === "moving") show = false;
  if (st === "drift") { sy = -40 * ramp(t, 0, d); ang = -4 * ramp(t, 0, d); sx = t * 0.4; }
  if (st === "nearbank") { sy = -48 - 8 * ramp(t, 0, d); ang = -4 + 6 * ramp(t, 0, d); sx = 20 + t * 0.3; }
  if (st === "swing") { ang = WEDGE * ramp(t, p.replay ? 10 : 4, p.replay ? d - 10 : Math.min(d, 90)); sy = -40 * (1 - ang / WEDGE); sx = 0; }
  if (st === "wedged") { ang = WEDGE; }
  if (st === "sternfree") { ang = WEDGE - 18 * ramp(t, 0, 40); sx = 60 * ramp(t, 0, 40); sy = 20 * ramp(t, 0, 40); }
  if (st === "free") { ang = 20 * (1 - ramp(t, 6, d * 0.7)); sx = 60; sy = 20 * (1 - ramp(t, 6, d * 0.7)); }
  const shake = p.impact === "1" && t < 18 ? Math.sin(t * 2.3) * (18 - t) * 0.6 : 0;
  // wedged pivots so the bow digs into the east (bottom) bank and the stern into the west bank
  const night = p.night === "1", dusk = p.dusk === "1";
  const waterC = night ? "#24476a" : WATER, sandC = night ? "#8a7a5c" : SAND;
  // canal edge shapes (slightly wavy). widen: east bank recedes by 40 m
  const wid = p.widen === "1" ? 40 * ramp(t, 8, d * 0.6) : 0;
  const lane = p.newlane === "1" ? ramp(t, 6, d * 0.7) : 0;
  const half = CANAL_W / 2;
  const span = W / S + 400;
  const edge = (y0: number, seed: number) => Array.from({ length: 41 }).map((_, i) => {
    const x = -span / 2 + (i / 40) * span;
    return `${x},${y0 + Math.sin(i * 0.9 + seed) * 4}`;
  }).join(" ");
  const top = -half, bot = half + wid;
  const laneY = half + 95; // second channel parallel, south of the main one
  const convoy = st === "convoy" || st === "moving";
  const tugs = Number(p.tugs ?? 0);
  return (
    <AbsoluteFill style={{ background: sandC }}>
      <Svg>
        <g transform={`translate(${W / 2 + shake} ${cy}) scale(${S})`}>
          {/* desert texture */}
          {Array.from({ length: 60 }).map((_, i) => (
            <circle key={i} cx={(rnd(i) - 0.5) * span} cy={(rnd(i + 40) - 0.5) * 900} r={3 + rnd(i + 7) * 7} fill={SAND_D} opacity={0.35} />
          ))}
          {/* main channel */}
          <polygon points={`${edge(top, 1)} ${edge(bot, 2).split(" ").reverse().join(" ")}`} fill={waterC} stroke={INK} strokeWidth={4 / S + 1} />
          {wid > 0 && <rect x={-span / 2} y={half} width={span} height={wid} fill="#7cc4e6" opacity={0.55} />}
          {Array.from({ length: 18 }).map((_, i) => (
            <path key={i} d={`M${((i * 140 + t * 1.2) % span) - span / 2} ${top + 30 + (i % 4) * ((bot - top - 60) / 3)} q 12 -5 24 0`} stroke="#bfe6f5" strokeWidth={2} fill="none" opacity={0.6} />
          ))}
          {/* second lane */}
          {lane > 0 && (
            <g>
              <rect x={-span / 2} y={laneY - 45} width={span * lane} height={90} fill={waterC} stroke={INK} strokeWidth={3} />
              <T3 x={-span / 2 + span * lane * 0.5} y={laneY + 14} size={44 / S} color="#ffd23f" o={lane}>NEW LANE</T3>
            </g>
          )}
          {p.highlight === "south" && (
            <g><rect x={-span / 2} y={top - 30} width={span} height={bot - top + 60} fill="#ffd23f" opacity={0.18 + 0.12 * Math.sin(t * 0.2)} /><T3 x={0} y={bot + 90} size={40} color="#ffd23f">SOUTHERN SECTION</T3></g>
          )}
          {/* km marker */}
          {p.km && (
            <g transform={`translate(${-260} ${top - 40})`}>
              <line x1={0} y1={0} x2={0} y2={-50} stroke={INK} strokeWidth={4} />
              <rect x={-44} y={-100} width={88} height={52} rx={6} fill="#fff" stroke={INK} strokeWidth={4} />
              <text x={0} y={-62} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={34} fill={INK}>{p.km}</text>
            </g>
          )}
          {/* convoy / traffic */}
          {convoy && Array.from({ length: 7 }).map((_, i) => {
            const len = 220 + (i % 3) * 60;
            const x = ((i * 360 + t * (st === "moving" ? 3 : 1.6)) % (span + 400)) - span / 2 - 200;
            const twoWay = p.twoway === "1" && i % 2 === 1;
            const y = twoWay ? laneY : 0;
            return <g key={i} transform={`translate(${twoWay ? -x : x} ${y}) rotate(${twoWay ? 180 : 0})`}><OtherShip len={len} color={["#c94a3a", "#3a73b8", "#4f8a5b", "#596572"][i % 4]} seed={i} /></g>;
          })}
          {st === "moving" && <g transform={`translate(${t * 3 - 100} 0)`}><EGTop /></g>}
          {/* the Ever Given */}
          {show && (
            <g transform={`translate(${sx} ${sy}) rotate(${ang})`}>
              <EGTop />
              {/* dust where it hits the banks */}
              {(st === "wedged" || (st === "swing" && ang > WEDGE - 2)) && p.impact === "1" && t < 30 && (
                <g>
                  <circle cx={200} cy={0} r={10 + t * 1.6} fill="#e7dcc4" opacity={1 - t / 30} />
                  <circle cx={-200} cy={0} r={8 + t * 1.2} fill="#e7dcc4" opacity={1 - t / 30} />
                </g>
              )}
            </g>
          )}
          {/* little yellow digger at the bow (east bank) */}
          {(st === "wedged" || st === "sternfree") && S >= 1.6 && (
            <g transform={`translate(${Math.cos(WEDGE * Math.PI / 180) * 205 + 14} ${Math.sin(WEDGE * Math.PI / 180) * 205 + 8 + Math.sin(t * 0.3) * 1.5})`}><DiggerTop /></g>
          )}
          {/* tugs */}
          {tugs > 0 && show && Array.from({ length: Math.min(tugs, 13) }).map((_, i) => {
            const big = p.big === "1" && i >= 11;
            const along = ((i % 6) - 2.5) * 62;
            const side = i % 2 ? 1 : -1;
            const a = ang * Math.PI / 180;
            const ax = sx + Math.cos(a) * along - Math.sin(a) * side * 30, ay = sy + Math.sin(a) * along + Math.cos(a) * side * 30;
            const pull = (p.work === "1" ? Math.sin(t * 0.2 + i) * 6 : 0) + (big ? 24 : 0);
            const tx = ax - Math.sin(a) * side * (60 + pull), ty = ay + Math.cos(a) * side * (60 + pull);
            const fade = ramp(t, i * 2, i * 2 + 10);
            return (
              <g key={i} opacity={fade}>
                <line x1={ax} y1={ay} x2={tx} y2={ty} stroke="#f4f4ee" strokeWidth={1.6} />
                <g transform={`translate(${tx} ${ty}) rotate(${ang + side * 90 + 180})`}><TugTop big={big} /></g>
              </g>
            );
          })}
          {/* measuring lines */}
          {p.measure === "1" && (
            <g opacity={ramp(t, 8, 20)}>
              <g transform={`rotate(${WEDGE})`}>
                <line x1={-200} y1={-46} x2={200} y2={-46} stroke="#ffd23f" strokeWidth={4} />
                <T3 x={0} y={-58} size={30} color="#ffd23f">400 m</T3>
              </g>
              <line x1={-330} y1={top} x2={-330} y2={bot} stroke="#fff" strokeWidth={4} />
              <T3 x={-330} y={bot + 40} size={26}>~250 m</T3>
            </g>
          )}
          {/* waiting ships pile up at both ends while it's stuck */}
          {p.closed === "1" && (
            <g opacity={ramp(t, 10, 24)}>
              {[-1, 1].map((sd) => (
                <g key={sd} transform={`translate(${sd * 360} ${top - 70})`}>
                  <rect x={-70} y={-36} width={140} height={72} rx={14} fill="#e8352b" stroke={INK} strokeWidth={5} />
                  <text x={0} y={14} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={40} fill="#fff">CLOSED</text>
                </g>
              ))}
            </g>
          )}
        </g>
        {night && <rect width={W} height={H} fill="#0d1b33" opacity={0.35} />}
        {dusk && <rect width={W} height={H} fill="#f08a3a" opacity={0.18} />}
        {/* days counter */}
        {p.days && (
          <g transform="translate(1690 900)" opacity={ramp(t, 10, 20)}>
            <rect x={-150} y={-90} width={300} height={160} rx={20} fill="#fff" stroke={INK} strokeWidth={6} />
            <text x={0} y={30} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={110} fill="#e8352b">{Math.min(6, 1 + Math.floor(ramp(t, 14, d - 6) * 5.99))}</text>
            <text x={0} y={-50} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={34} fill={INK}>DAY</text>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== SIDE (ship from the side, many scenes)
const Ground: React.FC<{ y: number; color?: string }> = ({ y, color = SAND }) => (
  <path d={`M0 ${y} Q 480 ${y - 22} 960 ${y} T 1920 ${y} V 1080 H 0 Z`} fill={color} stroke={INK} strokeWidth={6} />
);
const Water: React.FC<{ y: number; t: number; color?: string }> = ({ y, t, color = WATER }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill={color} />
    {Array.from({ length: 12 }).map((_, i) => (
      <path key={i} d={`M${((i * 190 + t * 1.5) % (W + 200)) - 100} ${y + 30 + (i % 3) * 60} q 20 -8 40 0 t 40 0`} stroke="#bfe6f5" strokeWidth={4} fill="none" />
    ))}
    <line x1={0} y1={y} x2={W} y2={y} stroke={INK} strokeWidth={6} />
  </g>
);
const DiggerSide: React.FC<{ t: number; s?: number; withGuy?: boolean }> = ({ t, s = 1, withGuy }) => {
  const arm = Math.sin(t * 0.18) * 14;
  return (
    <g transform={`scale(${s})`}>
      <rect x={-90} y={-30} width={180} height={34} rx={14} fill="#3d3d40" stroke={INK} strokeWidth={6} />
      {[-60, -20, 20, 60].map((x) => <circle key={x} cx={x} cy={-13} r={10} fill="#6b6b70" stroke={INK} strokeWidth={3} />)}
      <rect x={-70} y={-120} width={110} height={90} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={6} />
      <rect x={-56} y={-110} width={50} height={46} fill="#bfe6f5" stroke={INK} strokeWidth={4} />
      <g transform={`rotate(${-20 + arm} 40 -90)`}>
        <rect x={30} y={-104} width={150} height={26} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={6} />
        <g transform={`rotate(${50 - arm * 1.5} 176 -90)`}>
          <rect x={166} y={-100} width={26} height={110} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={6} />
          <path d="M160 6 h44 l-8 34 h-30 Z" fill="#7d8790" stroke={INK} strokeWidth={6} />
        </g>
      </g>
      {withGuy && <Guy x={-30} y={-46} s={0.32} t={t} id="dg" pose={{ ...IDLE, hipY: -96, legL: [-80, -6], legR: [-74, -10], armL: [-70, 10], armR: [70, -10] }} face={FACES.happy} shadow={false} feet="fwd" />}
    </g>
  );
};
const Crowd: React.FC<{ t: number; y: number; n?: number }> = ({ t, y, n = 26 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = 40 + i * (W / n);
      const j = Math.abs(Math.sin(t * 0.35 + i)) * 16;
      return (
        <g key={i} transform={`translate(${x} ${y - j})`}>
          <circle cx={0} cy={-58} r={16} fill="#fff" stroke={INK} strokeWidth={4} />
          <path d={`M0 -42 V -14 M0 -36 L ${-18} ${-70 - (i % 2) * 8} M0 -36 L 18 ${-70 - ((i + 1) % 2) * 8} M0 -14 L -10 8 M0 -14 L 10 8`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      );
    })}
  </g>
);
const Flag: React.FC<{ kind: string; t: number }> = ({ kind, t }) => {
  const wave = Math.sin(t * 0.25) * 4;
  const body = (() => {
    switch (kind) {
      case "jp": return <g><rect width={150} height={100} fill="#fff" /><circle cx={75} cy={50} r={28} fill="#bc002d" /></g>;
      case "tw": return <g><rect width={150} height={100} fill="#fe0000" /><rect width={75} height={50} fill="#000095" /><circle cx={37} cy={25} r={12} fill="#fff" /></g>;
      case "de": return <g><rect width={150} height={34} fill="#000" /><rect y={33} width={150} height={34} fill="#dd0000" /><rect y={66} width={150} height={34} fill="#ffce00" /></g>;
      default: return <g><rect width={150} height={100} fill="#fff" /><rect x={75} width={75} height={50} fill="#da121a" /><rect y={50} width={75} height={50} fill="#072357" /><circle cx={37} cy={25} r={9} fill="#072357" /><circle cx={112} cy={75} r={9} fill="#da121a" /></g>;
    }
  })();
  return <g transform={`skewY(${wave * 0.4})`}>{body}<rect width={150} height={100} fill="none" stroke={INK} strokeWidth={5} /></g>;
};

export const Side: Tpl = ({ t, d, p, w }) => {
  const sc = p.scene ?? "yard";
  const g = p.guy;
  const shipX = (x: number, y: number, s: number, extra?: React.ReactNode, opts?: Parameters<typeof EGSide>[0]) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}><EGSide t={t} {...opts} />{extra}</g>
  );
  const guyAt = (x: number, y: number, s: number, flip?: boolean, over?: ActOut) => g ? <Actor a={g} t={t} x={x} y={y} s={s} flip={flip} w={w} id="side" over={over} /> : null;
  let bg: React.ReactNode = null, mid: React.ReactNode = null, fg: React.ReactNode = null;
  const groundY = 900;
  switch (sc) {
    case "digger": case "bow": case "digging": case "push": case "weight": case "stress": {
      // bow buried in the east bank, seen from the bank; huge
      const s = sc === "bow" ? 2.2 + 0.1 * ramp(t, 0, d) : 1.7;
      bg = <DesertSky />;
      mid = (
        <g>
          <g transform={`translate(${sc === "bow" ? -1900 : sc === "stress" ? -560 : -1180} ${groundY - 230 * s + 120}) scale(${sc === "stress" ? 1.2 : s})`}><EGSide t={t} stress={sc === "stress" ? ramp(t, 10, 40) : 0} /></g>
          <Ground y={groundY} />
          <path d={`M${sc === "bow" ? 760 : 900} ${groundY - 10} q 160 -120 360 -40 q 120 30 300 40 Z`} fill={SAND} stroke={INK} strokeWidth={6} />
        </g>
      );
      if (sc === "digger") fg = <g><g transform={`translate(1300 ${groundY + 10})`}><DiggerSide t={t} s={0.9} withGuy={g === "drive"} /></g>{g === "dig" && guyAt(1620, groundY + 20, 0.55)}</g>;
      if (sc === "digging") fg = <g>{[0, 1, 2].map((i) => <g key={i} transform={`translate(${1150 + i * 240} ${groundY + 14})`}><DiggerSide t={t + i * 20} s={0.55} /></g>)}{guyAt(1750, groundY + 30, 0.5)}</g>;
      if (sc === "bow") fg = guyAt(1500, groundY + 30, 0.8);
      if (sc === "push") fg = guyAt(1080, groundY + 20, 0.75, false, { pose: act("push", t).pose });
      if (sc === "weight") fg = <g>{guyAt(1600, groundY + 30, 0.75)}<g transform={`translate(560 ${520 + Math.sin(t * 0.1) * 6})`}><path d="M-160 160 L-120 -80 L120 -80 L160 160 Z" fill="#596572" stroke={INK} strokeWidth={8} /><path d="M-60 -80 q 0 -90 60 -90 q 60 0 60 90" fill="none" stroke={INK} strokeWidth={22} /></g></g>;
      if (sc === "stress") fg = <g>{[[-1, "STUCK IN SAND"], [1, "JAMMED"]].map(([sd, l], i) => <g key={i} transform={`translate(${Number(sd) < 0 ? 1400 : 200} 860)`} opacity={ramp(t, 4 + i * 8, 12 + i * 8)}><T3 x={0} y={0} size={44} color="#ffd23f">{l}</T3></g>)}</g>;
      break;
    }
    case "yard": {
      bg = <g><DesertSky /><rect y={300} width={W} height={600} fill="#cfd8de" />{[260, 980, 1640].map((x, i) => (
        <g key={i} transform={`translate(${x} 880)`}><path d="M-10 0 V -620 M10 0 V -620 M-140 -620 H 340 M-140 -600 H 340" stroke="#e0a23b" strokeWidth={14} /><line x1={300} y1={-610} x2={300} y2={-400 + Math.sin(t * 0.05 + i) * 30} stroke={INK} strokeWidth={4} /></g>
      ))}</g>;
      mid = <g>{shipX(-260 + t * 0.4, 640, 1.25)}<rect y={890} width={W} height={190} fill="#9aa4ad" stroke={INK} strokeWidth={6} /></g>;
      fg = guyAt(1500, 1060, 0.55);
      break;
    }
    case "flags": {
      bg = <DesertSky />;
      mid = <g>{shipX(150, 560, 1.3)}<Water y={860} t={t} /></g>;
      fg = <g>{["jp", "tw", "de", "pa"].map((f, i) => {
        const k = pop(t, 10 + i * Math.max(12, (d - 40) / 4));
        return <g key={f} transform={`translate(${380 + i * 330} 310) scale(${k})`}><line x1={0} y1={100} x2={0} y2={180} stroke={INK} strokeWidth={6} /><Flag kind={f} t={t} />
          <T3 x={75} y={-20} size={40} o={k}>{["OWNER", "OPERATOR", "MANAGER", "FLAG"][i]}</T3></g>;
      })}{guyAt(1700, 1060, 0.5, true)}</g>;
      break;
    }
    case "pitches": {
      bg = <rect width={W} height={H} fill="#5fae5a" />;
      mid = <g>{[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${120 + i * 420} 560)`} opacity={ramp(t, 6 + i * 8, 14 + i * 8)}>
          <rect width={400} height={260} fill="#6cc066" stroke="#fff" strokeWidth={6} /><line x1={200} y1={0} x2={200} y2={260} stroke="#fff" strokeWidth={5} /><circle cx={200} cy={130} r={44} fill="none" stroke="#fff" strokeWidth={5} />
        </g>))}
        <g transform={`translate(${120 - 1700 + 1700 * ramp(t, 4, 40)} 380) scale(1.27 0.7)`}><EGSide name={false} red={false} /></g>
      </g>;
      break;
    }
    case "width": {
      bg = <DesertSky />;
      mid = <g><Water y={760} t={t} />
        <g transform="translate(960 760)">
          <path d="M-250 -380 H 250 V 0 Q 250 120 0 140 Q -250 120 -250 0 Z" fill={GREEN} stroke={INK} strokeWidth={8} />
          {Array.from({ length: 6 }).map((_, c) => Array.from({ length: 5 }).map((__, r) => <rect key={`${c}${r}`} x={-240 + c * 80} y={-380 - (r + 1) * 70} width={78} height={68} fill={BOX[(c + r * 2) % BOX.length]} stroke={INK} strokeWidth={4} />))}
          <g opacity={ramp(t, 8, 18)}><line x1={-250} y1={60} x2={250} y2={60} stroke="#ffd23f" strokeWidth={10} /><T3 x={0} y={40} size={80} color="#ffd23f">59 m</T3></g>
        </g></g>;
      fg = guyAt(1500, 1050, 0.55, true);
      break;
    }
    case "stack": {
      bg = <DesertSky />;
      mid = <g>{shipX(120, 600, 1.3, null, { boxes: ramp(t, 0, d * 0.8) })}<Water y={790} t={t} /></g>;
      fg = <T3 x={960} y={300} size={130} color="#ffd23f">{Math.round(20124 * ramp(t, 0, d * 0.8)).toLocaleString("en-US")}</T3>;
      break;
    }
    case "engine": {
      bg = <rect width={W} height={H} fill="#24324a" />;
      mid = (
        <g transform="translate(560 900)">
          <rect x={-300} y={-560} width={600} height={560} rx={20} fill="#7d8790" stroke={INK} strokeWidth={8} />
          {Array.from({ length: 11 }).map((_, i) => {
            const up = Math.sin(t * 0.5 + i * 1.7) * 30;
            return <g key={i}><rect x={-280 + i * 52} y={-520 + up} width={44} height={120} rx={6} fill="#c7ccd1" stroke={INK} strokeWidth={4} /><line x1={-258 + i * 52} y1={-400 + up} x2={-258 + i * 52} y2={-180} stroke={INK} strokeWidth={8} /></g>;
          })}
          <rect x={-300} y={-180} width={600} height={180} fill="#596572" stroke={INK} strokeWidth={8} />
        </g>
      );
      fg = <g>{Array.from({ length: 12 }).map((_, i) => (
        <text key={i} x={1000 + (i % 4) * 190} y={420 + Math.floor(i / 4) * 170 + Math.abs(Math.sin(t * 0.4 + i)) * -18} fontSize={120} opacity={ramp(t, i * 2, i * 2 + 6)}>🐎</text>
      ))}<T3 x={1340} y={330} size={100} color="#ffd23f" s={pop(t, 6)}>79,000 hp</T3>{guyAt(1760, 1070, 0.42)}</g>;
      break;
    }
    case "thrusters": {
      bg = <DesertSky />;
      mid = <g><Water y={760} t={t} /><g opacity={0.92}>{shipX(-700, 560, 1.6, null, { thrusters: true })}</g><line x1={0} y1={760} x2={W} y2={760} stroke="#bfe6f5" strokeWidth={6} strokeDasharray="30 20" /></g>;
      fg = <g opacity={ramp(t, 8, 16)}>{[0, 1].map((i) => <path key={i} d={`M${1200 + i * 96} ${840} l 0 ${110 + Math.sin(t * 0.6) * 10}`} stroke="#ffd23f" strokeWidth={14} markerEnd="" />)}
        <T3 x={1250} y={1020} size={56} color="#ffd23f">← PUSH THE BOW SIDEWAYS →</T3>{guyAt(500, 1060, 0.5)}</g>;
      break;
    }
    case "sandstorm": case "wall": case "sail": {
      const haze = sc === "sandstorm" ? 0.55 : sc === "sail" ? 0.25 : 0.1;
      bg = <DesertSky haze={haze} />;
      mid = <g>{shipX(200, 560, 1.2)}<Ground y={820} />
        {sc === "wall" && <g opacity={ramp(t, 10, 22)}><line x1={200} y1={260} x2={1760} y2={260} stroke="#ffd23f" strokeWidth={8} /><T3 x={980} y={240} size={70} color="#ffd23f">400 m STEEL WALL</T3></g>}
        {sc === "sail" && <path d="M260 540 Q 980 160 1720 540 Z" fill="#fff" opacity={0.35 * ramp(t, 10, 24)} stroke="#fff" strokeWidth={8} strokeDasharray="30 18" />}
      </g>;
      fg = <g>
        {Array.from({ length: sc === "sandstorm" ? 40 : 18 }).map((_, i) => {
          const x = ((i * 137 + t * (10 + (i % 5) * 4)) % (W + 400)) - 200;
          return <path key={i} d={`M${x} ${180 + (i * 53) % 700} h ${sc === "sail" ? 160 : 90}`} stroke={sc === "sail" ? "#fff" : "#a8743a"} strokeWidth={sc === "sail" ? 10 : 6} strokeLinecap="round" opacity={0.7} markerEnd="" />;
        })}
        {sc === "sail" && Array.from({ length: 5 }).map((_, i) => (
          <path key={i} d={`M${60 + ((t * 8 + i * 60) % 120)} ${300 + i * 90} h 130 l -24 -18 m 24 18 l -24 18`} stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {sc === "sandstorm" && g && guyAt(1650, 1050, 0.55)}
      </g>;
      break;
    }
    case "livestock": {
      bg = <DesertSky />;
      mid = <g>
        <g transform={`translate(260 ${560 + Math.sin(t * 0.08) * 6}) scale(1.1)`}>
          <path d="M0 0 L1100 0 Q1180 60 1150 200 L40 200 Q0 170 0 0 Z" fill="#e8e4d8" stroke={INK} strokeWidth={8} />
          {Array.from({ length: 5 }).map((_, r) => <rect key={r} x={60} y={-60 - r * 60} width={900 - r * 60} height={60} fill="#f4f1e8" stroke={INK} strokeWidth={5} />)}
          {Array.from({ length: 16 }).map((_, i) => (
            <g key={i} transform={`translate(${90 + i * 52} ${-24 - (i % 3) * 60}) translate(0 ${Math.sin(t * 0.3 + i) * 2})`}>
              <ellipse rx={22} ry={16} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={20} cy={-6} r={8} fill={INK} />
            </g>
          ))}
        </g>
        <Water y={790} t={t} />
      </g>;
      fg = <g>{guyAt(1680, 1060, 0.55, true)}<g transform="translate(1500 300)" opacity={ramp(t, 10, 20)}>
        <rect x={-130} y={-60} width={260} height={120} rx={16} fill="#fff" stroke={INK} strokeWidth={6} />
        <text x={0} y={-10} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={34} fill={INK}>FEED</text>
        <rect x={-100} y={14} width={200} height={26} fill="#ddd" stroke={INK} strokeWidth={4} />
        <rect x={-100} y={14} width={200 * (1 - ramp(t, 10, d))} height={26} fill="#e8352b" />
      </g></g>;
      break;
    }
    case "tugforce": {
      bg = <DesertSky />;
      mid = <g>{shipX(-900, 560, 1.4)}<Water y={770} t={t} />
        <g transform={`translate(${1480 + Math.sin(t * 0.3) * 6} 760)`}>
          <path d="M-160 0 L160 0 Q190 30 170 80 L-150 80 Q-170 60 -160 0 Z" fill="#e0a23b" stroke={INK} strokeWidth={6} />
          <rect x={-80} y={-90} width={140} height={90} fill="#f4f4ee" stroke={INK} strokeWidth={6} />
          <text x={0} y={60} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={36} fill={INK}>ALP GUARD</text>
        </g>
        <path d={`M920 700 Q 1150 ${720 + Math.sin(t * 0.3) * 20} 1330 760`} stroke={INK} strokeWidth={8} fill="none" />
      </g>;
      fg = <g>{guyAt(1130, 760, 0.42, false)}<g opacity={ramp(t, 8, 18)}><path d="M1250 420 h 300 l -40 -30 m 40 30 l -40 30" stroke="#ffd23f" strokeWidth={22} fill="none" strokeLinecap="round" /><T3 x={1400} y={380} size={90} color="#ffd23f">285 t</T3></g></g>;
      break;
    }
    case "crane": {
      bg = <DesertSky />;
      mid = <g>{shipX(-200, 600, 1.2, null, { boxes: 1 - 0.3 * ramp(t, 10, d) })}<Ground y={880} />
        <g transform="translate(1500 880)">
          <path d="M-40 0 V -720 M40 0 V -720 M-500 -720 H 200" stroke="#e0a23b" strokeWidth={22} />
          <line x1={-380 + Math.sin(t * 0.05) * 60} y1={-720} x2={-380 + Math.sin(t * 0.05) * 60} y2={-420 - Math.abs(Math.sin(t * 0.07)) * 120} stroke={INK} strokeWidth={5} />
          <rect x={-410 + Math.sin(t * 0.05) * 60} y={-420 - Math.abs(Math.sin(t * 0.07)) * 120} width={60} height={50} fill={BOX[1]} stroke={INK} strokeWidth={4} />
        </g></g>;
      fg = <g>{guyAt(1760, 1060, 0.5, true)}<g transform="translate(330 300)" opacity={ramp(t, 20, 30)}>
        <rect x={-120} y={-90} width={240} height={190} rx={14} fill="#fff" stroke={INK} strokeWidth={6} /><rect x={-120} y={-90} width={240} height={50} rx={14} fill="#e8352b" stroke={INK} strokeWidth={6} />
        <text x={0} y={60} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={56} fill={INK}>WEEKS?</text></g></g>;
      break;
    }
    case "tide": {
      bg = <DesertSky />;
      const lift = 60 * ramp(t, 6, d - 6);
      mid = <g>{shipX(160, 560 - lift, 1.2)}<rect x={0} y={820 - lift} width={W} height={260 + lift} fill={WATER} opacity={0.9} /><line x1={0} y1={820 - lift} x2={W} y2={820 - lift} stroke={INK} strokeWidth={6} />
        <path d="M0 960 Q 500 900 960 980 T 1920 960 V 1080 H 0 Z" fill={SAND} stroke={INK} strokeWidth={6} />
        <g transform="translate(1760 820)"><line x1={0} y1={0} x2={0} y2={-lift} stroke="#ffd23f" strokeWidth={10} /><T3 x={0} y={-lift - 20} size={50} color="#ffd23f">+ water</T3></g></g>;
      break;
    }
    case "cheer": {
      bg = <DesertSky />;
      mid = <g>{shipX(260 - t * 1.2, 520, 1.1)}<Water y={760} t={t} /><Ground y={900} />
        {[0, 1].map((i) => <g key={i} transform={`translate(${1250 + i * 300} 760)`}><path d="M-80 0 L80 0 Q95 20 85 46 L-75 46 Z" fill="#c94a3a" stroke={INK} strokeWidth={5} /><rect x={-40} y={-50} width={70} height={50} fill="#f4f4ee" stroke={INK} strokeWidth={5} />
          {t % 40 < 20 && <g opacity={0.8}><path d={`M${30} -70 q 20 -20 40 0 M38 -90 q 30 -30 60 0`} stroke="#fff" strokeWidth={6} fill="none" /></g>}</g>)}</g>;
      fg = <g><Crowd t={t} y={1010} />{guyAt(1700, 1070, 0.55)}</g>;
      break;
    }
    case "repaired": {
      bg = <rect width={W} height={H} fill="#cfd8de" />;
      mid = <g>{shipX(160, 520, 1.25)}<rect y={810} width={W} height={270} fill="#9aa4ad" stroke={INK} strokeWidth={6} />
        {[300, 700, 1100, 1500].map((x) => <rect key={x} x={x} y={810} width={60} height={60} fill="#7d8790" stroke={INK} strokeWidth={5} />)}
        {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={1740 + Math.sin(t * 0.7 + i) * 20} cy={700 - ((t * 3 + i * 18) % 90)} r={6} fill="#ffd23f" />)}</g>;
      fg = guyAt(1780, 830, 0.5, true);
      break;
    }
    case "sailing": {
      bg = <DesertSky />;
      mid = <g>{shipX(-300 + t * 1.4, 560, 1.15)}<Water y={800} t={t} /><Ground y={920} /></g>;
      fg = guyAt(1600, 1030, 0.55);
      break;
    }
    default: bg = <rect width={W} height={H} fill={PAPER} />;
  }
  return <AbsoluteFill><Svg>{bg}{mid}{fg}</Svg></AbsoluteFill>;
};

// ================================================================== GUY (host shots)
// Owner 2026-11-13: "too static". While he talks, his gesture changes at every phrase of the voice (a pause or ~6 words),
// his head nods with the words, he shifts his weight, and the camera cuts in closer on every other phrase.
// Free hands never rest on the vest front.
const GEST: { pose: Pose; hl?: Hand; hr?: Hand }[] = [
  { pose: { ...IDLE, armL: [38, 40], armR: [38, 40] }, hl: "open", hr: "open" },
  { pose: { ...IDLE, armL: [16, 10], armR: [62, 50], hipX: 14, tilt: 4 }, hr: "open" },
  { pose: { ...POSES.fingerUp, hipX: -10 }, hr: "point" },
  { pose: { ...IDLE, armL: [60, -90], armR: [52, 64], tilt: -4 }, hr: "open" },
  { pose: { ...IDLE, armL: [52, -62], armR: [52, -62], tilt: 6 }, hl: "open", hr: "open" },
  { pose: { ...IDLE, armL: [88, 0], armR: [16, 10], hipX: -14, tilt: -5 }, hl: "point" },
];
const TALKY = new Set(["talk", "worried", "shrug", "fingerup", "hold", "wag", "count", "think", "watch"]);
/** start frames of spoken phrases: a new phrase after a pause (> 6 frames) or every 6 words */
export const phraseStarts = (w?: number[][]) => {
  const s: number[] = [];
  let since = 0;
  (w ?? []).forEach(([a], i) => {
    if (i === 0 || a - w![i - 1][1] > 6 || since >= 6) { s.push(a); since = 0; }
    since++;
  });
  return s;
};
const talkingOver = (a: string, t: number, w: number[][] | undefined, seed: number): { over?: ActOut; phrase: number } => {
  const starts = phraseStarts(w);
  let phrase = -1;
  starts.forEach((s, i) => { if (t >= s) phrase = i; });
  if (!TALKY.has(a) || starts.length < 2) return { phrase };
  const base = act(a, 30, w).pose ?? IDLE; // the act's settled signature pose (not its start)
  const keys: [number, Pose, number?][] = [[0, base]];
  starts.forEach((s, i) => { if (i > 0) keys.push([s - 4, GEST[(i + seed) % GEST.length].pose, 6]); });
  const g = phrase > 0 ? GEST[(phrase + seed) % GEST.length] : undefined;
  const talk = talkFrom(t, w);
  let pose = breathe(track(t, keys), t, seed * 7);
  pose = { ...pose, tilt: pose.tilt + talk * 3 * Math.sin(t * 0.4), hipY: pose.hipY + talk * 2 };
  const own = act(a, t, w);
  return { phrase, over: { pose, handL: g?.hl ?? own.handL ?? "mitt", handR: g?.hr ?? own.handR ?? "mitt" } };
};

export const GuyT: Tpl = ({ t, d, p, w }) => {
  const a = p.act ?? "talk";
  const bgk = p.bg ?? "paper";
  let bg: React.ReactNode = <Paper t={t} />, extra: React.ReactNode = null;
  let gx = 960, gy = 1000, gs = 1.05, flip = false;
  if (bgk === "phone") {
    gx = 640;
    extra = (
      <g transform={`translate(1300 560) scale(${pop(t, 2)}) rotate(4)`}>
        <rect x={-230} y={-380} width={460} height={760} rx={50} fill="#2a2d33" stroke={INK} strokeWidth={10} />
        <rect x={-200} y={-330} width={400} height={640} rx={14} fill="#f4f4ee" />
        <rect x={-200} y={-260} width={400} height={300} fill="#e8d6a6" />
        <path d="M-200 -120 L 120 -230 L 200 -200 L 200 40 L -200 40 Z" fill={GREEN} stroke={INK} strokeWidth={4} />
        <rect x={-120} y={-20} width={44} height={30} fill="#ffd23f" stroke={INK} strokeWidth={4} />
        {["😂", "🚜", "😂"].map((e, i) => <text key={i} x={-150 + i * 120} y={150 + Math.sin(t * 0.3 + i) * 8} fontSize={80}>{e}</text>)}
        <text x={0} y={260} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={34} fill={INK}>{(12000 + t * 913).toLocaleString("en-US")} ♥</text>
      </g>
    );
  } else if (bgk === "factory") {
    bg = <g><Paper t={t} /><g opacity={0.9}>
      <path d="M1180 990 V 620 l 120 -80 v 80 l 120 -80 v 80 l 120 -80 v 80 l 120 -80 V 990 Z" fill="#b9c2ca" stroke={INK} strokeWidth={6} />
      <rect x={1600} y={560} width={60} height={160} fill="#9aa4ad" stroke={INK} strokeWidth={6} />
      <rect x={1240} y={760} width={420} height={60} fill="#e8352b" stroke={INK} strokeWidth={5} /><text x={1450} y={804} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={42} fill="#fff">WAITING FOR PARTS</text>
      <rect x={180} y={640} width={420} height={350} fill="#f4c24a" stroke={INK} strokeWidth={6} /><rect x={210} y={720} width={360} height={170} fill="#fff" stroke={INK} strokeWidth={5} />
      <text x={390} y={820} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={56} fill="#e8352b">SOLD OUT</text></g></g>;
  } else if (bgk === "salvage") {
    bg = <g><DesertSky /><g transform="translate(-200 560) scale(1.1)"><EGSide /></g><Ground y={880} />
      <g transform="translate(1300 880)">{[0, 1, 2].map((i) => <Guy key={i} x={i * 130} y={0} s={0.35} t={t + i * 13} id={`sv${i}`} pose={breathe(IDLE, t, i * 20)} face={FACES.confident} />)}</g>
      <rect x={1260} y={560} width={420} height={110} rx={16} fill="#fff" stroke={INK} strokeWidth={6} /><text x={1470} y={636} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={60} fill="#e8352b">SMIT SALVAGE</text></g>;
    gx = 900; gy = 1040; gs = 0.75;
  } else if (bgk === "board") {
    gx = 1500;
    flip = true;
    const items = p.act === "plan" ? ["1. DIG", "2. PULL", "3. TIDE"] : ["WIND?", "SPEED?", "BANK EFFECT?", "PEOPLE?"];
    extra = (
      <g>
        <rect x={180} y={240} width={980} height={640} rx={16} fill="#fbfaf4" stroke={INK} strokeWidth={10} />
        <line x1={260} y1={880} x2={220} y2={1000} stroke={INK} strokeWidth={10} /><line x1={1080} y1={880} x2={1120} y2={1000} stroke={INK} strokeWidth={10} />
        {items.map((s, i) => {
          const at0 = 8 + i * Math.max(10, (d - 20) / items.length);
          return <text key={s} x={260} y={380 + i * 130} fontFamily={fontFamily} fontWeight={700} fontSize={96} fill={["#e8352b", "#2c4a7a", "#2f7d4a", "#8a5aa8"][i]} opacity={ramp(t, at0, at0 + 6)}>{s}</text>;
        })}
      </g>
    );
  } else if (bgk === "canalbank") {
    bg = <g><DesertSky dusk /><circle cx={1500} cy={420} r={110} fill="#ffd27a" opacity={0.9} /><Water y={700} t={t} color="#3b7ea5" />
      <g transform={`translate(${380 - t * 0.5} 690) scale(0.45)`}><EGSide t={t} /></g>
      <rect y={860} width={W} height={220} fill={SAND} stroke={INK} strokeWidth={6} />
      <g transform="translate(300 880)"><DiggerSide t={0} s={0.7} /></g></g>;
    gx = 1450; gy = 930; gs = 0.6;
  }
  const label = p.label ? txt(p.label) : "";
  const seed = (a.length + (p.label ?? "").length) % GEST.length;
  const { over, phrase } = talkingOver(a, t, w, seed);
  // camera: cut in to a closer (upper-body) framing on every other phrase; not where a board/phone/team must stay in view
  const canCut = bgk === "paper" || bgk === "canalbank" || bgk === "factory";
  const z = canCut && phrase % 2 === 1 ? 1.38 : 1;
  const cx = gx, cy = gy - 430 * gs;
  return (
    <AbsoluteFill>
      <Svg>
        <g transform={z !== 1 ? `translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})` : undefined}>
          {bg}
          {extra}
          <Actor a={a} t={t} x={gx} y={gy} s={gs} flip={flip} w={w} id="host" over={over} />
        </g>
        {label && <T3 x={bgk === "phone" ? 1300 : 1450} y={460} size={110} color="#ffd23f" s={pop(t, 6)}>{label}</T3>}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== BRIDGE (interior, with pilots + captain)
export const BridgeT: Tpl = ({ t, d, p, w }) => {
  const a = p.act ?? "dawn";
  const impact = a === "impact";
  const jolt = impact ? clamp01((t - 12) / 6) * (1 - clamp01((t - 24) / 20)) : 0;
  const shake = impact && t > 12 && t < 40 ? Math.sin(t * 2.1) * (40 - t) * 0.7 : 0;
  const sky = a === "dawn" || a === "pilots" ? ["#f7b26a", "#fde3b0"] : ["#c9a56e", "#e9d3a8"];
  const people: { id: string; x: number; outfit: Outfit; a: string; flip?: boolean; over?: ActOut }[] = [
    { id: "sg", x: 320, outfit: "ship", a: "clipboard", over: { prop: "mug", pose: breathe(POSES.hold, t), face: FACES.satisfied, talk: 0 } },
    { id: "p1", x: 820, outfit: "pilot", a: "talk" },
    { id: "p2", x: 1120, outfit: "pilot", a: "talk", flip: true },
    { id: "cp", x: 1560, outfit: "captain", a: "talk", flip: true },
  ];
  // per-act overrides
  if (a === "pilots") { people[1].x = 820 + (1 - ramp(t, 0, 40)) * 900; people[2].x = 1120 + (1 - ramp(t, 6, 46)) * 900; people[1].over = { pose: t < 40 ? walk(IDLE, t) : breathe(IDLE, t), feet: "fwd" }; people[2].over = { pose: t < 46 ? walk(IDLE, t) : breathe(IDLE, t), feet: "fwd" }; people[3].a = "wave"; }
  if (a === "argue" || a === "arabic") {
    people[1].over = { pose: breathe({ ...POSES.point, armR: [70 + Math.sin(t * 0.4) * 20, 10] }, t), handR: "open", face: { eyes: "dot", brows: "angry", mouth: "o" }, talk: Math.max(0, Math.sin(t * 0.7)) };
    people[2].over = { pose: breathe(POSES.shrug, t), handL: "open", handR: "open", face: { eyes: "dot", brows: "worried", mouth: "o" }, talk: Math.max(0, Math.sin(t * 0.7 + 2)) };
  }
  if (a === "arabic") { people[0].over = { ...people[0].over, face: FACES.confused, emote: "?", emoteT: t }; people[3].over = { face: FACES.confused, emote: "?", emoteT: t - 10 }; }
  if (a === "captain") { people[3].x = 1560 - ramp(t, 4, 30) * 160; people[3].over = { pose: t < 30 ? walk(IDLE, t) : breathe(POSES.point, t), handR: t >= 30 ? "point" : "mitt", face: FACES.confident }; people[1].over = { face: FACES.worried }; people[2].over = { face: FACES.worried }; }
  if (impact) people.forEach((pp) => { pp.over = { ...(pp.over ?? {}), pose: { ...((pp.over?.pose) ?? IDLE), lean: (pp.flip ? 1 : -1) * 30 * jolt, hipY: 10 * jolt }, face: t > 12 ? FACES.shocked : pp.over?.face, prop: pp.id === "sg" && t > 12 ? "none" : pp.over?.prop }; });
  const mugK = clamp01((t - 12) / 22);
  const tele = a === "argue" ? (Math.floor(t / 20) % 2 ? -30 : 30) : 0;
  return (
    <AbsoluteFill style={{ background: "#2b3442" }}>
      <Svg>
        <g transform={`translate(${shake} 0)`}>
          <defs><linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient></defs>
          <rect x={60} y={170} width={1800} height={420} fill="url(#bsky)" stroke={INK} strokeWidth={8} />
          {/* view: canal ahead, desert, containers in front of the bridge */}
          <path d="M60 470 L 860 430 L 1060 430 L 1860 470 V 590 H 60 Z" fill={SAND} />
          <path d={`M860 430 L 1060 430 L ${1300 + jolt * 200} 590 L ${620 + jolt * 200} 590 Z`} fill={WATER} />
          {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={140 + i * 170} y={520} width={150} height={70} fill={BOX[i % BOX.length]} stroke={INK} strokeWidth={4} />)}
          {(a === "argue" || a === "impact" || a === "arabic") && <rect x={60} y={170} width={1800} height={420} fill="#b8864a" opacity={0.35} />}
          {[460, 860, 1260].map((x) => <rect key={x} x={x} y={170} width={22} height={420} fill="#2b3442" />)}
          {/* console */}
          <rect x={0} y={780} width={W} height={300} fill="#3d4a5c" stroke={INK} strokeWidth={8} />
          {[200, 600, 1300, 1650].map((x, i) => <rect key={x} x={x} y={810} width={180} height={110} rx={10} fill={i === 1 ? "#1e8f6a" : "#1d2a36"} stroke={INK} strokeWidth={5} />)}
          <g transform="translate(980 860)">
            <rect x={-60} y={-20} width={120} height={60} rx={10} fill="#596572" stroke={INK} strokeWidth={5} />
            <g transform={`rotate(${tele})`}><line x1={0} y1={0} x2={0} y2={-90} stroke={INK} strokeWidth={14} strokeLinecap="round" /><circle cx={0} cy={-92} r={18} fill="#e8352b" stroke={INK} strokeWidth={5} /></g>
          </g>
        </g>
        {people.map((pp) => <Actor key={pp.id} id={`br-${pp.id}`} a={pp.a} t={t} x={pp.x + shake} y={830} s={0.62} flip={pp.flip} outfit={pp.outfit} w={pp.id === "sg" ? undefined : undefined} over={pp.over} />)}
        {/* speech bubbles */}
        {(a === "argue" || a === "arabic") && [[820, "يمين؟"], [1120, "يسار!"]].map(([x, s], i) => (
          <g key={i} transform={`translate(${Number(x) + (i ? 60 : -60)} 300) scale(${pop(t, 4 + i * 10)})`}>
            <path d="M-120 -60 h 240 a 30 30 0 0 1 30 30 v 50 a 30 30 0 0 1 -30 30 h -200 l -30 40 v -40 a 30 30 0 0 1 -40 -30 v -50 a 30 30 0 0 1 30 -30 Z" fill="#fff" stroke={INK} strokeWidth={6} />
            <text x={0} y={20} textAnchor="middle" fontSize={a === "arabic" ? 64 : 46} fontFamily="Arial" fontWeight={700} fill={INK}>{a === "arabic" ? s : ["HARD PORT!", "FULL AHEAD!"][i]}</text>
          </g>
        ))}
        {a === "captain" && (
          <g transform={`translate(1180 300) scale(${pop(t, 34)})`}>
            <rect x={-300} y={-70} width={600} height={140} rx={24} fill="#22324f" stroke={INK} strokeWidth={6} />
            <text x={0} y={-6} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={54} fill="#e0b13a">CAPTAIN = IN COMMAND</text>
            <text x={0} y={46} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={36} fill="#fff">pilot = advises</text>
          </g>
        )}
        {impact && t > 12 && (
          <g transform={`translate(${430 + mugK * 400} ${640 - Math.sin(mugK * Math.PI) * 220 + mugK * 220}) rotate(${mugK * 540})`}>
            <rect x={-24} y={-28} width={48} height={56} rx={8} fill="#3d78c4" stroke={INK} strokeWidth={6} />
            {mugK < 0.9 && <path d="M-10 -28 q -20 -40 6 -70" stroke="#7b4a26" strokeWidth={10} fill="none" strokeLinecap="round" />}
          </g>
        )}
        {impact && t > 12 && t < 22 && <rect width={W} height={H} fill="#fff" opacity={(22 - t) / 14} />}
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES3: Record<string, Tpl> = {
  canal: Canal, side: Side, guy: GuyT, bridge: BridgeT,
  ...TEMPLATES3B,
};
export { Dust };
export type { Emote, Face, Hand, PropName };
