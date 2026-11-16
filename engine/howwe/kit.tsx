// How We Ended Up · "The Gallery" kit v0.1 (style frames, not yet approved).
// Spec: docs/howwe-visual-direction.md. Everything is a pure function of props, so any frame renders as a still.
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadPlex } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import React from "react";
import style from "./style-v1.0.json";
import world110 from "./data/world-110m.json";

export const { fontFamily: DISPLAY } = loadPlayfair("normal", { weights: ["700", "900"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadPlex("normal", { weights: ["400", "600"], subsets: ["latin"] });
export const { fontFamily: READ } = loadInter("normal", { weights: ["600"], subsets: ["latin"] });

export const W = 1920, H = 1080;

/** Style tokens: the ONE approved source is style-v1.0.json (owner-approved 2026-11-15). */
export const STYLE = style;
export const T = style.colors;
/** Realistic skin-tone range (never used to code a culture). */
export const SKIN = style.skin;

export const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Static paper grain over the whole frame (printed, not digital). */
export const Grain: React.FC<{ seed?: number; o?: number }> = ({ seed = 3, o = 1 }) => {
  const r = rng(seed);
  const d = Array.from({ length: 2600 }, () => ({ x: r() * W, y: r() * H, a: 0.025 + r() * 0.05, l: r() > 0.5 }));
  return <g opacity={o}>{d.map((p, i) => <rect key={i} x={p.x} y={p.y} width={2} height={2} fill={p.l ? "#fff" : "#3b2f1d"} opacity={p.a} />)}</g>;
};

/* ---------------- rooms ---------------- */
/** Gallery with N bays separated by wall pillars. Bay tints come from the split-side colours. */
export const Gallery: React.FC<{ id: string; bays: string[]; floorY?: number }> = ({ id, bays, floorY = 790 }) => {
  const bw = W / bays.length;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}day`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={T.wallLight} stopOpacity={0.95} /><stop offset="0.55" stopColor={T.wallLight} stopOpacity={0} /></linearGradient>
        <linearGradient id={`${id}floor`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={T.floorTop} /><stop offset="1" stopColor={T.floorBot} /></linearGradient>
      </defs>
      <rect width={W} height={H} fill={T.wall} />
      {bays.map((c, i) => <rect key={i} x={i * bw} width={bw} height={floorY} fill={c} opacity={0.075} />)}
      <rect width={W} height={floorY} fill={`url(#${id}day)`} />
      {/* picture rail */}
      <line x1={0} y1={86} x2={W} y2={86} stroke={T.baseboard} strokeWidth={2} opacity={0.6} />
      <rect y={floorY} width={W} height={H - floorY} fill={`url(#${id}floor)`} />
      <rect y={floorY - 14} width={W} height={14} fill="#E6DCCB" />
      <line x1={0} y1={floorY} x2={W} y2={floorY} stroke={T.baseboard} strokeWidth={3} />
      {/* floor boards perspective lines */}
      {Array.from({ length: 13 }).map((_, i) => <line key={i} x1={W / 2 + (i - 6) * 120} y1={floorY} x2={W / 2 + (i - 6) * 330} y2={H} stroke="#B8A98C" strokeWidth={1.5} opacity={0.35} />)}
      {bays.slice(1).map((_, i) => <Pillar key={i} x={(i + 1) * bw} floorY={floorY} />)}
    </g>
  );
};
export const Pillar: React.FC<{ x: number; floorY?: number }> = ({ x, floorY = 790 }) => (
  <g>
    <rect x={x - 34} y={0} width={68} height={floorY} fill={T.pillar} />
    <rect x={x + 26} y={0} width={10} height={floorY} fill="#000" opacity={0.07} />
    <rect x={x - 42} y={0} width={84} height={24} fill="#E9E1D2" />
    <rect x={x - 42} y={floorY - 30} width={84} height={30} fill="#E9E1D2" />
  </g>
);

export const Plinth: React.FC<{ x: number; top: number; w?: number; base?: number; accent?: string }> = ({ x, top, w = 400, base = 960, accent }) => (
  <g>
    <ellipse cx={x + 30} cy={base + 6} rx={w * 0.62} ry={22} fill="#4a3a1e" opacity={0.16} />
    <rect x={x - w / 2} y={top} width={w} height={base - top} fill={T.plinthSide} />
    <rect x={x - w / 2} y={top} width={w * 0.8} height={base - top} fill={T.plinth} />
    {accent && <rect x={x - w / 2} y={top} width={w} height={9} fill={accent} />}
  </g>
);

export const LabelCard: React.FC<{ x: number; y: number; meta: string; name: string; sub: string; edge: string; w?: number }> = ({ x, y, meta, name, sub, edge, w = 330 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={3} y={5} width={w} height={128} fill="#000" opacity={0.09} />
    <rect width={w} height={128} fill={T.card} />
    <rect width={7} height={128} fill={edge} />
    <text x={26} y={34} fontFamily={MONO} fontWeight={600} fontSize={17} letterSpacing={2} fill={T.label}>{meta}</text>
    <text x={26} y={80} fontFamily={DISPLAY} fontWeight={900} fontSize={38} fill={T.ink}>{name}</text>
    <text x={26} y={111} fontFamily={MONO} fontSize={17} fill="#3D382F">{sub}</text>
  </g>
);

/** Chapter tag (mono, pillar accent) + one Playfair keyword. */
export const Headline: React.FC<{ tag: string; word: string; accent: string; y?: number; light?: boolean }> = ({ tag, word, accent, y = 150, light }) => (
  <g>
    <rect x={W / 2 - 12} y={y - 78} width={24} height={6} fill={accent} />
    <text x={W / 2} y={y - 40} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={24} letterSpacing={8} fill={light ? accent : T.label}>{tag}</text>
    <text x={W / 2} y={y + 52} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={96} fill={light ? "#F4EEDF" : T.ink}>{word}</text>
  </g>
);

/** Subtitle bar for muted viewers (Inter, ivory bar) + optional source footnote. */
export const Subtitle: React.FC<{ text: string; source?: string }> = ({ text, source }) => (
  <g>
    <rect x={W / 2 - 640} y={968} width={1280} height={64} rx={10} fill="#FBF8F2" opacity={0.88} />
    <text x={W / 2} y={1011} textAnchor="middle" fontFamily={READ} fontWeight={600} fontSize={34} fill={T.ink}>{text}</text>
    {source && <text x={1880} y={1062} textAnchor="end" fontFamily={MONO} fontSize={16} fill={T.label}>{source}</text>}
  </g>
);

/** Era tint: desaturate + aged paper multiply over a group ("Then"). */
export const ThenTint: React.FC<{ id: string; children: React.ReactNode; x?: number; w?: number }> = ({ id, children, x = 0, w = W }) => (
  <g>
    <defs>
      <filter id={`${id}then`}><feColorMatrix type="saturate" values={String(STYLE.line.thenSaturate)} /></filter>
      <clipPath id={`${id}clip`}><rect x={x} y={0} width={w} height={H} /></clipPath>
    </defs>
    <g clipPath={`url(#${id}clip)`}>
      <g filter={`url(#${id}then)`}>{children}</g>
      <rect x={x} width={w} height={H} fill={T.thenPaper} opacity={STYLE.line.thenPaperOpacity} style={{ mixBlendMode: "multiply" }} />
    </g>
  </g>
);

/** Door sign for period rooms: PERIOD ROOM · REGION · c. YEAR */
export const RoomSign: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <g>
    <rect x={x - 250} y={y} width={500} height={52} fill={T.ink} />
    <text x={x} y={y + 34} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={20} letterSpacing={4} fill="#F4EEDF">{text}</text>
  </g>
);

/* ---------------- exhibits ---------------- */
/** Plaster cast of an open right hand (palm up) on a rod: the "eating with hands" exhibit. Neutral plaster, no skin tone. */
export const PlasterHand: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const fingers = [
    { x: -62, y: -150, h: 120, r: -16 }, { x: -24, y: -178, h: 140, r: -5 }, { x: 16, y: -176, h: 136, r: 5 }, { x: 52, y: -148, h: 112, r: 15 },
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={T.line} strokeWidth={3.5} strokeLinejoin="round">
      <rect x={-10} y={40} width={20} height={150} fill="#8E8576" />
      <rect x={-50} y={180} width={100} height={18} fill="#8E8576" />
      {fingers.map((f, i) => (
        <rect key={i} x={f.x - 17} y={f.y} width={34} height={f.h} rx={17} fill={T.plaster} transform={`rotate(${f.r} ${f.x} ${f.y + f.h})`} />
      ))}
      <path d="M-78 -40 Q-80 40 -30 60 L40 60 Q82 40 84 -36 Q86 -70 60 -76 L-64 -76 Q-80 -70 -78 -40 Z" fill={T.plaster} />
      <path d="M-70 10 Q-120 -10 -132 -70 Q-134 -90 -116 -92 Q-100 -90 -92 -64 Q-84 -40 -64 -30" fill={T.plaster} />
      <path d="M40 60 Q82 40 84 -36" fill="none" stroke={T.plasterShade} strokeWidth={14} opacity={0.8} />
      <path d="M-40 -20 Q0 0 50 -24" fill="none" strokeWidth={2} opacity={0.5} />
    </g>
  );
};

/* ---------------- people: faceless "diorama figures" (~6 heads tall) ---------------- */
export type Outfit = "tee" | "cardigan" | "euMan" | "euWoman" | "ming" | "saree" | "cook" | "kimono" | "habesha" | "kurta";
export type Hair = "short" | "long" | "bun" | "covered";
export type Pose = "stand" | "eatHand" | "knife" | "bowl" | "chop" | "fork" | "greet" | "forkDown" | "handDown" | "bowlDown" | "chopUp" | "knifeCut" | "point" | "feed" | "feedBack";
type Pt = [number, number];
const POSES: Record<Pose, { L: [Pt, Pt]; R: [Pt, Pt]; holdL?: string; holdR?: string }> = {
  stand: { L: [[-46, -236], [-48, -178]], R: [[46, -236], [48, -178]] },
  greet: { L: [[-46, -236], [-48, -178]], R: [[66, -270], [74, -330]] },
  eatHand: { L: [[-48, -238], [-30, -200]], R: [[46, -246], [12, -312]], holdR: "food" },
  knife: { L: [[-50, -240], [-34, -204]], R: [[52, -240], [38, -206]], holdL: "bread", holdR: "knife" },
  bowl: { L: [[-48, -252], [-16, -266]], R: [[48, -254], [18, -302]], holdL: "bowl", holdR: "chop" },
  chop: { L: [[-50, -242], [-34, -204]], R: [[54, -246], [40, -220]], holdR: "cleaver" },
  fork: { L: [[-48, -238], [-30, -200]], R: [[46, -248], [14, -308]], holdR: "fork" },
  // loop partners (Figure pose -> pose2 with mix 0..1)
  forkDown: { L: [[-48, -238], [-30, -200]], R: [[52, -238], [34, -204]], holdR: "fork" },
  handDown: { L: [[-48, -238], [-30, -200]], R: [[52, -238], [30, -206]], holdR: "food" },
  bowlDown: { L: [[-48, -252], [-16, -266]], R: [[48, -250], [10, -262]], holdL: "bowl", holdR: "chop" },
  chopUp: { L: [[-50, -242], [-34, -204]], R: [[56, -262], [46, -262]], holdR: "cleaver" },
  knifeCut: { L: [[-50, -240], [-34, -204]], R: [[50, -236], [26, -204]], holdL: "bread", holdR: "knife" },
  point: { L: [[-46, -236], [-48, -178]], R: [[80, -280], [128, -300]] },
  // gursha: right hand reaches across to feed the person on the right
  feed: { L: [[-48, -238], [-30, -200]], R: [[74, -262], [128, -300]], holdR: "food" },
  feedBack: { L: [[-48, -238], [-30, -200]], R: [[52, -238], [30, -206]], holdR: "food" },
};
const OUT: Record<Outfit, { top: string; bottom: string; extra?: string; shoes: string; sleeve: number }> = {
  tee: { top: "#4F7CAC", bottom: "#2F3E5C", shoes: "#EFEFEF", sleeve: 19 },
  cardigan: { top: "#8A6D9E", bottom: "#3B3B44", extra: "#EDE6DA", shoes: "#3B2A20", sleeve: 19 },
  euMan: { top: "#6B3B2E", bottom: "#4A3B30", extra: "#2F4A3A", shoes: "#2A211A", sleeve: 21 },
  euWoman: { top: "#7A2E2E", bottom: "#7A2E2E", extra: "#F2EEE4", shoes: "#2A211A", sleeve: 20 },
  kimono: { top: "#4F5D7A", bottom: "#4F5D7A", extra: "#C9A24A", shoes: "#EDE6DA", sleeve: 30 },
  habesha: { top: "#F2EEE4", bottom: "#F2EEE4", extra: "#3F7A5A", shoes: "#5A3A22", sleeve: 18 },
  kurta: { top: "#C98A3A", bottom: "#EDE6DA", extra: "#C98A3A", shoes: "#5A3A22", sleeve: 18 },
  ming: { top: "#3F5E7A", bottom: "#3F5E7A", extra: "#F2EEE4", shoes: "#1E1E24", sleeve: 32 },
  saree: { top: "#7A2E4A", bottom: "#C9862F", extra: "#C9862F", shoes: "#5A3A22", sleeve: 16 },
  cook: { top: "#8A7B5C", bottom: "#5C5240", extra: "#E8E0CC", shoes: "#2A211A", sleeve: 20 },
};
const Held: React.FC<{ kind?: string; at: Pt }> = ({ kind, at: [x, y] }) => {
  if (!kind) return null;
  const st = { stroke: T.line, strokeWidth: 3, strokeLinejoin: "round" as const };
  switch (kind) {
    case "fork": return <g {...st} transform={`translate(${x} ${y}) rotate(-35)`}><rect x={-3} y={-4} width={6} height={50} fill="#C9CFD6" /><path d="M-8 -26 L-8 -6 L8 -6 L8 -26" fill="none" /></g>;
    case "knife": return <g {...st} transform={`translate(${x} ${y}) rotate(160)`}><rect x={-3} y={-4} width={7} height={26} fill="#6B4A2E" /><path d="M-3 22 L-4 66 Q4 60 6 22 Z" fill="#C9CFD6" /></g>;
    case "chop": return <g {...st} transform={`translate(${x} ${y}) rotate(-60)`}><line x1={0} y1={0} x2={0} y2={78} stroke="#9C6233" strokeWidth={5} /><line x1={7} y1={2} x2={4} y2={78} stroke="#9C6233" strokeWidth={5} /></g>;
    case "bowl": return <g {...st} transform={`translate(${x + 6} ${y + 4})`}><path d="M-30 -10 L30 -10 Q28 18 0 22 Q-28 18 -30 -10 Z" fill="#B8432F" /><path d="M-26 -10 Q0 -26 26 -10" fill="#FFFDF7" /></g>;
    case "bread": return <g {...st}><ellipse cx={x} cy={y} rx={16} ry={11} fill="#C99A5B" /></g>;
    case "food": return <g {...st}><ellipse cx={x} cy={y - 6} rx={10} ry={8} fill="#E8D9A8" /></g>;
    case "cleaver": return <g {...st} transform={`translate(${x} ${y}) rotate(-20)`}><rect x={-4} y={-30} width={9} height={30} fill="#5A3A22" /><rect x={-16} y={-82} width={38} height={54} fill="#C9CFD6" /></g>;
  }
  return null;
};
const Arm: React.FC<{ from: Pt; pts: [Pt, Pt]; color: string; w: number; skin: string }> = ({ from, pts, color, w, skin }) => {
  const d = `M${from[0]} ${from[1]} L${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]}`;
  return (
    <g>
      <path d={d} fill="none" stroke={T.line} strokeWidth={w + 7} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[1][0]} cy={pts[1][1]} r={10} fill={skin} stroke={T.line} strokeWidth={3.5} />
    </g>
  );
};
const mixPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** Faceless diorama figure. Animate by blending `pose` -> `pose2` with `mix` (0..1); held objects follow the nearer pose. */
export const Figure: React.FC<{ x: number; y: number; s?: number; skin: string; hair: Hair; hairColor?: string; outfit: Outfit; pose?: Pose; pose2?: Pose; mix?: number; flip?: boolean }> = ({
  x, y, s = 1, skin, hair, hairColor = "#2B211B", outfit, pose = "stand", pose2, mix = 0, flip,
}) => {
  const o = OUT[outfit], pa = POSES[pose], pb = pose2 ? POSES[pose2] : pa;
  const t = pose2 ? mix : 0;
  const p = {
    L: [mixPt(pa.L[0], pb.L[0], t), mixPt(pa.L[1], pb.L[1], t)] as [Pt, Pt],
    R: [mixPt(pa.R[0], pb.R[0], t), mixPt(pa.R[1], pb.R[1], t)] as [Pt, Pt],
    holdL: (t < 0.5 ? pa : pb).holdL, holdR: (t < 0.5 ? pa : pb).holdR,
  };
  const ln = { stroke: T.line, strokeWidth: 3.5, strokeLinejoin: "round" as const };
  const long = outfit === "euWoman" || outfit === "ming" || outfit === "saree" || outfit === "kimono" || outfit === "habesha";
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* back hair */}
      {hair === "long" && <path d="M-28 -338 Q-32 -374 0 -370 Q32 -374 28 -338 L32 -282 L-32 -282 Z" fill={hairColor} {...ln} />}
      {/* legs / long garments */}
      {!long && (
        <g {...ln}>
          <rect x={-24} y={-178} width={21} height={170} fill={o.bottom} />
          <rect x={3} y={-178} width={21} height={170} fill={o.bottom} />
          <ellipse cx={-15} cy={-6} rx={17} ry={8} fill={o.shoes} />
          <ellipse cx={15} cy={-6} rx={17} ry={8} fill={o.shoes} />
        </g>
      )}
      {long && (
        <g {...ln}>
          <ellipse cx={-14} cy={-5} rx={15} ry={7} fill={o.shoes} />
          <ellipse cx={14} cy={-5} rx={15} ry={7} fill={o.shoes} />
          <path d={outfit === "ming" ? "M-38 -300 L38 -300 L54 -8 L-54 -8 Z" : "M-32 -196 L32 -196 L56 -8 L-56 -8 Z"} fill={o.bottom} />
        </g>
      )}
      {/* torso */}
      <path d="M-37 -300 L37 -300 L31 -172 L-31 -172 Z" fill={o.top} {...ln} />
      {outfit === "euMan" && <g {...ln}><path d="M-41 -302 L-22 -302 L-26 -110 L-48 -110 Z" fill={o.extra} /><path d="M41 -302 L22 -302 L26 -110 L48 -110 Z" fill={o.extra} /></g>}
      {outfit === "cardigan" && <g {...ln}><path d="M-37 -300 L-10 -300 L-14 -172 L-31 -172 Z" fill={o.extra} /><path d="M37 -300 L10 -300 L14 -172 L31 -172 Z" fill={o.extra} /></g>}
      {outfit === "ming" && <path d="M-16 -300 L12 -236 M16 -300 L2 -268" fill="none" stroke={o.extra} strokeWidth={7} />}
      {outfit === "euWoman" && <path d="M-26 -300 Q0 -270 26 -300" fill={o.extra} {...ln} />}
      {outfit === "saree" && <g {...ln}><path d="M-37 -300 L-12 -300 L34 -196 L36 -150 L14 -150 Z" fill={o.extra} /><path d="M-12 -300 L34 -196" fill="none" stroke="#7A2E4A" strokeWidth={6} /></g>}
      {outfit === "cook" && <path d="M-24 -250 L24 -250 L28 -120 L-28 -120 Z" fill={o.extra} {...ln} />}
      {outfit === "kimono" && <g {...ln}><path d="M-16 -300 L14 -232 M16 -300 L4 -262" fill="none" stroke="#EDE6DA" strokeWidth={7} /><rect x={-34} y={-214} width={68} height={26} fill={o.extra} /></g>}
      {outfit === "habesha" && <g><path d="M-6 -300 L6 -300 L6 -176 L-6 -176 Z" fill={o.extra} /><path d="M-50 -30 L50 -30" stroke={o.extra} strokeWidth={9} /></g>}
      {outfit === "kurta" && <path d="M-37 -300 L37 -300 L40 -120 L-40 -120 Z" fill={o.top} {...ln} />}
      {/* neck + head (faceless) */}
      <rect x={-9} y={-314} width={18} height={18} fill={skin} {...ln} />
      <ellipse cx={0} cy={-337} rx={23} ry={29} fill={skin} {...ln} />
      {/* hair / headwear */}
      {(hair === "short" || hair === "long" || hair === "bun") && <path d="M-24 -340 Q-27 -372 0 -370 Q27 -372 24 -340 Q12 -358 -24 -340 Z" fill={hairColor} {...ln} />}
      {hair === "bun" && <circle cx={0} cy={-374} r={13} fill={hairColor} {...ln} />}
      {hair === "covered" && outfit === "euMan" && <g {...ln}><ellipse cx={0} cy={-362} rx={36} ry={9} fill="#222" /><ellipse cx={0} cy={-369} rx={25} ry={10} fill="#222" /></g>}
      {hair === "covered" && outfit === "euWoman" && <path d="M-31 -298 Q-35 -378 0 -378 Q35 -378 31 -298 L23 -298 Q25 -356 0 -358 Q-25 -356 -23 -298 Z" fill={o.extra} {...ln} />}
      {hair === "covered" && outfit === "ming" && <g {...ln}><path d="M-25 -342 Q-27 -384 0 -384 Q27 -384 25 -342 Z" fill="#1E1E24" /><path d="M20 -366 Q34 -380 46 -372 Q36 -362 22 -358 Z" fill="#1E1E24" /><path d="M-20 -366 Q-34 -380 -46 -372 Q-36 -362 -22 -358 Z" fill="#1E1E24" /></g>}
      {/* arms + held objects */}
      <Arm from={[-36, -292]} pts={p.L} color={o.top} w={o.sleeve} skin={skin} />
      <Arm from={[36, -292]} pts={p.R} color={o.top} w={o.sleeve} skin={skin} />
      <Held kind={p.holdL} at={p.L[1]} />
      <Held kind={p.holdR} at={p.R[1]} />
    </g>
  );
};

/* ---------------- map: Natural Earth (public domain), Equal Earth projection ---------------- */
// Data: engine/howwe/data/world-110m.json, made by tools/howwe_map.py (same projection as below; 1000 x 486.7 units).
const EA = [1.340264, -0.081106, 0.000893, 0.003796], EM = Math.sqrt(3) / 2, EXMAX = 2.70663, EYMAX = 1.31731;
const MAP_W = world110.w, MAP_H = world110.h;
/** lon/lat -> map units (0..1000, 0..486.7). Use for routes, pins and labels. */
export const projectEE = (lon: number, lat: number): [number, number] => {
  const lam = (lon * Math.PI) / 180, th = Math.asin(EM * Math.sin((lat * Math.PI) / 180));
  const t2 = th * th, t6 = t2 * t2 * t2;
  const x = (lam * Math.cos(th)) / (EM * (EA[0] + 3 * EA[1] * t2 + t6 * (7 * EA[2] + 9 * EA[3] * t2)));
  const y = th * (EA[0] + EA[1] * t2 + t6 * (EA[2] + EA[3] * t2));
  return [((x + EXMAX) / (2 * EXMAX)) * MAP_W, ((EYMAX - y) / (2 * EYMAX)) * MAP_H];
};
const line = (pts: [number, number][]) => "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L");
const OUTLINE = (() => {
  const e: [number, number][] = [];
  for (let la = -90; la <= 90; la += 3) e.push(projectEE(180, la));
  for (let la = 90; la >= -90; la -= 3) e.push(projectEE(-180, la));
  return line(e) + "Z";
})();
const GRATICULE = [
  ...[-60, -30, 0, 30, 60].map((la) => line(Array.from({ length: 73 }, (_, i) => projectEE(-180 + i * 5, la)))),
  ...[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lo) => line(Array.from({ length: 37 }, (_, i) => projectEE(lo, -90 + i * 5)))),
];
export type MapCat = "a" | "b" | "c" | "mix";
/** Framed-museum world map. `cats` colours countries by ISO A3 code: a=clay, b=slate, c=moss, mix=hatched a/c. */
export const WorldMap: React.FC<{ id: string; x: number; y: number; w: number; cats?: Record<string, MapCat>; catOpacity?: Partial<Record<MapCat, number>>; children?: React.ReactNode }> = ({
  id, x, y, w, cats = {}, catOpacity = {}, children,
}) => {
  const k = w / MAP_W;
  const fill = (a3: string) => {
    const c = cats[a3];
    return !c ? "#E9E1D0" : c === "a" ? T.clay : c === "b" ? T.slate : c === "c" ? T.moss : `url(#${id}mix)`;
  };
  const countries = world110.countries as Record<string, { n: string; d: string }>;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <defs>
        <pattern id={`${id}mix`} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={7} height={7} fill={T.moss} /><rect width={3.5} height={7} fill={T.clay} />
        </pattern>
        <clipPath id={`${id}globe`}><path d={OUTLINE} /></clipPath>
      </defs>
      <path d={OUTLINE} fill="#DCE3E0" />
      <g clipPath={`url(#${id}globe)`}>
        {GRATICULE.map((d, i) => <path key={i} d={d} fill="none" stroke="#B9C6C2" strokeWidth={0.6 / k * 1.2} />)}
        {Object.entries(countries).map(([a3, c]) => (
          <path key={a3} d={c.d} fill="#E9E1D0" stroke="#8A7E68" strokeWidth={0.9 / k} strokeLinejoin="round" fillRule="evenodd" />
        ))}
        {(["a", "b", "c", "mix"] as MapCat[]).map((cat) => (
          <g key={cat} opacity={catOpacity[cat] ?? 1}>
            {Object.entries(countries).filter(([a3]) => cats[a3] === cat).map(([a3, c]) => (
              <path key={a3} d={c.d} fill={fill(a3)} stroke="#8A7E68" strokeWidth={0.9 / k} strokeLinejoin="round" fillRule="evenodd" />
            ))}
          </g>
        ))}
        {children}
      </g>
      <path d={OUTLINE} fill="none" stroke="#8A7E68" strokeWidth={1.6 / k} />
    </g>
  );
};
/** Height of a WorldMap of width w. */
export const mapHeight = (w: number) => (w * MAP_H) / MAP_W;
