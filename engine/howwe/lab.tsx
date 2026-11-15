// "How We Ended Up" channel: look-development stills (nothing locked yet).
// Composition "HowLab": look = A | B | C, view = frame | thumb | board (board = all three looks side by side).
// Sample topic: "Why half the world doesn't use forks". All text in frames is placeholder, not fact-checked script.
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadPlex } from "@remotion/google-fonts/IBMPlexMono";
import React from "react";
import { AbsoluteFill } from "remotion";

const { fontFamily: SERIF } = loadFraunces("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });
const { fontFamily: HAND } = loadCaveat("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: BLACK } = loadArchivo("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: GROT } = loadGrotesk("normal", { weights: ["500", "700"], subsets: ["latin"] });
const { fontFamily: PLAY } = loadPlayfair("normal", { weights: ["700", "900"], subsets: ["latin"] });
const { fontFamily: MONO } = loadPlex("normal", { weights: ["400", "600"], subsets: ["latin"] });

export type Look = "A" | "B" | "C" | "D";
export type HowLabProps = { look: Look; view: "frame" | "thumb" | "board" | "museum" };

const W = 1920, H = 1080;
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* ---------------- shared objects (drawn once, styled per look) ---------------- */
export type Ink = { line: string; lw: number; plate: string; rim: string; food1: string; food2: string; metal: string; wood: string; bowl: string; rice: string };

export const Fork: React.FC<{ x: number; y: number; s?: number; rot?: number; ink: Ink }> = ({ x, y, s = 1, rot = 0, ink }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke={ink.line} strokeWidth={ink.lw} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-10 60 L-12 330 Q0 350 12 330 L10 60 Z" fill={ink.metal} />
    <path d="M-34 -80 L-34 20 Q-34 62 0 66 Q34 62 34 20 L34 -80 L24 -80 L22 18 L12 18 L11 -80 L-1 -80 L-2 18 L-12 18 L-14 -80 Z" fill={ink.metal} />
  </g>
);
export const Knife: React.FC<{ x: number; y: number; s?: number; rot?: number; ink: Ink }> = ({ x, y, s = 1, rot = 0, ink }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke={ink.line} strokeWidth={ink.lw} strokeLinejoin="round">
    <path d="M-12 70 L-13 330 Q0 348 13 330 L12 70 Z" fill={ink.metal} />
    <path d="M-14 70 L-16 -90 Q10 -100 18 -40 L14 70 Z" fill={ink.metal} />
  </g>
);
export const Chopsticks: React.FC<{ x: number; y: number; s?: number; rot?: number; ink: Ink }> = ({ x, y, s = 1, rot = 0, ink }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke={ink.line} strokeWidth={ink.lw} strokeLinejoin="round">
    <path d="M-30 -230 L-18 -232 L-4 230 L-10 232 Z" fill={ink.wood} />
    <path d="M22 -228 L34 -226 L8 232 L2 230 Z" fill={ink.wood} />
  </g>
);
export const Plate: React.FC<{ x: number; y: number; s?: number; ink: Ink }> = ({ x, y, s = 1, ink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={ink.line} strokeWidth={ink.lw}>
    <ellipse cx={0} cy={0} rx={250} ry={150} fill={ink.rim} />
    <ellipse cx={0} cy={-4} rx={185} ry={108} fill={ink.plate} />
    <path d="M-120 -10 Q-90 -70 0 -60 Q90 -55 100 0 Q80 50 -10 50 Q-110 45 -120 -10 Z" fill={ink.food1} />
    {[[-40, 10], [30, -10], [70, 20], [-80, -20]].map(([cx, cy], i) => <circle key={i} cx={cx + 40} cy={cy + 60} r={14} fill={ink.food2} />)}
  </g>
);
export const Bowl: React.FC<{ x: number; y: number; s?: number; ink: Ink }> = ({ x, y, s = 1, ink }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={ink.line} strokeWidth={ink.lw} strokeLinejoin="round">
    <path d="M-190 -40 Q-170 -150 0 -150 Q170 -150 190 -40 Z" fill={ink.rice} />
    {[[-80, -100], [-20, -125], [40, -110], [100, -80], [-120, -70], [10, -80], [70, -130]].map(([cx, cy], i) => (
      <ellipse key={i} cx={cx} cy={cy} rx={11} ry={6} fill="none" strokeWidth={ink.lw * 0.5} />
    ))}
    <path d="M-220 -40 L220 -40 Q210 110 0 130 Q-210 110 -220 -40 Z" fill={ink.bowl} />
    <path d="M-70 128 L-80 160 L80 160 L70 128" fill={ink.bowl} />
  </g>
);

/** Rough continent blobs for map insets (placeholder geography, not a real map). */
const blobs = {
  europe: "M40 40 C70 20 120 25 135 50 C145 75 120 95 95 92 C70 100 45 85 40 40Z",
  asia: "M140 35 C200 10 290 25 320 60 C340 100 300 140 250 130 C210 140 160 110 150 85Z",
  africa: "M70 105 C100 98 130 115 128 150 C125 190 100 215 88 200 C70 175 60 140 70 105Z",
};
const MiniMap: React.FC<{ x: number; y: number; hi: "europe" | "asia"; land: string; hiFill: string; line: string; paper: string; lw?: number }> = ({ x, y, hi, land, hiFill, line, paper, lw = 2.5 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={360} height={230} rx={10} fill={paper} stroke={line} strokeWidth={lw} />
    {(Object.keys(blobs) as (keyof typeof blobs)[]).map((k) => (
      <path key={k} d={blobs[k]} fill={k === hi ? hiFill : land} stroke={line} strokeWidth={lw * 0.8} />
    ))}
  </g>
);

/* ============================== LOOK A · Paper Atlas ============================== */
const A = { paper: "#EFE4CC", paperDark: "#E2D3B2", ink: "#2A2A35", west: "#C8553D", east: "#2E6F8E", gold: "#D9A441" };
const inkA: Ink = { line: A.ink, lw: 5, plate: "#F7F1E4", rim: "#E9DDC3", food1: "#9C5A3C", food2: "#6E8B3D", metal: "#C9CFD6", wood: "#B07A45", bowl: "#2E6F8E", rice: "#FBF8F1" };

const PaperA: React.FC<{ id: string }> = ({ id }) => {
  const r = rng(5);
  const specks = Array.from({ length: 900 }, () => ({ x: r() * W, y: r() * H, o: 0.05 + r() * 0.12, s: 0.6 + r() * 1.6 }));
  return (
    <g>
      <defs>
        <radialGradient id={`${id}v`} cx="50%" cy="50%" r="75%"><stop offset="55%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#5a4320" stopOpacity={0.3} /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={A.paper} />
      {/* faint map graticule */}
      {Array.from({ length: 9 }).map((_, i) => <path key={`la${i}`} d={`M0 ${120 * i + 40} Q${W / 2} ${120 * i + 70} ${W} ${120 * i + 40}`} fill="none" stroke={A.ink} strokeOpacity={0.07} strokeWidth={2} />)}
      {Array.from({ length: 13 }).map((_, i) => <path key={`lo${i}`} d={`M${160 * i} 0 Q${160 * i + (i - 6) * 18} ${H / 2} ${160 * i} ${H}`} fill="none" stroke={A.ink} strokeOpacity={0.07} strokeWidth={2} />)}
      {specks.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#7a5b2e" opacity={s.o} />)}
      <rect width={W} height={H} fill={`url(#${id}v)`} />
    </g>
  );
};
/** Watercolour wash: a few overlapping soft blobs. */
const Wash: React.FC<{ x: number; y: number; w: number; h: number; color: string; seed: number }> = ({ x, y, w, h, color, seed }) => {
  const r = rng(seed);
  return (
    <g>
      <defs><filter id={`wash${seed}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={45} /></filter></defs>
      <g filter={`url(#wash${seed})`}>
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse key={i} cx={x + w * (0.2 + r() * 0.6)} cy={y + h * (0.2 + r() * 0.6)} rx={w * (0.3 + r() * 0.25)} ry={h * (0.25 + r() * 0.25)} fill={color} opacity={0.13} />
        ))}
      </g>
    </g>
  );
};
const TornSeam: React.FC<{ x: number }> = ({ x }) => {
  const r = rng(9);
  const pts = Array.from({ length: 40 }, (_, i) => `${x + (r() - 0.5) * 22},${(i * H) / 39}`);
  return (
    <g>
      <polyline points={pts.map((p) => p.replace(/^([\d.]+)/, (m) => String(Number(m) + 8))).join(" ")} fill="none" stroke="#000" strokeOpacity={0.15} strokeWidth={14} />
      <polyline points={pts.join(" ")} fill="none" stroke="#FBF6EA" strokeWidth={12} />
      <polyline points={pts.join(" ")} fill="none" stroke={A.ink} strokeOpacity={0.35} strokeWidth={2} />
    </g>
  );
};
const HandLabel: React.FC<{ x: number; y: number; text: string; color: string; size?: number; rot?: number }> = ({ x, y, text, color, size = 54, rot = -2 }) => (
  <text x={x} y={y} transform={`rotate(${rot} ${x} ${y})`} fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} textAnchor="middle">{text}</text>
);

const FrameA: React.FC = () => (
  <g>
    <PaperA id="fa" />
    <Wash x={0} y={0} w={960} h={H} color={A.west} seed={2} />
    <Wash x={960} y={0} w={960} h={H} color={A.east} seed={3} />
    <Plate x={480} y={640} s={1.05} ink={inkA} />
    <Fork x={190} y={600} s={0.85} rot={-8} ink={inkA} />
    <Knife x={780} y={610} s={0.85} rot={6} ink={inkA} />
    <Bowl x={1440} y={700} s={1.05} ink={inkA} />
    <Chopsticks x={1560} y={460} s={0.95} rot={28} ink={inkA} />
    <TornSeam x={960} />
    <HandLabel x={480} y={930} text="Europe: knives at the table" color={A.west} />
    <HandLabel x={1440} y={960} text="China: food cut in the kitchen" color={A.east} />
    {/* arrow annotation */}
    <path d="M1200 300 Q1290 250 1340 330" fill="none" stroke={A.ink} strokeWidth={4} strokeLinecap="round" />
    <path d="M1326 300 L1342 334 L1306 328" fill="none" stroke={A.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    <HandLabel x={1110} y={300} text="bite-size = less fuel?" color={A.ink} size={46} rot={-4} />
    <MiniMap x={70} y={60} hi="europe" land={A.paperDark} hiFill={A.west} line={A.ink} paper="#F7F0E0" />
    <MiniMap x={1490} y={60} hi="asia" land={A.paperDark} hiFill={A.east} line={A.ink} paper="#F7F0E0" />
    {/* chapter tag + keyword */}
    <g transform="translate(960 92)">
      <rect x={-320} y={-44} width={640} height={64} rx={32} fill={A.ink} />
      <text x={0} y={2} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={30} letterSpacing={4} fill={A.paper}>THE FORGOTTEN PROBLEM</text>
    </g>
    <text x={960} y={230} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={96} fill={A.ink}>Fuel.</text>
    <text x={1890} y={1062} textAnchor="end" fontFamily={SERIF} fontSize={20} fill={A.ink} opacity={0.5}>look A test · placeholder text</text>
  </g>
);
const ThumbA: React.FC = () => (
  <g>
    <PaperA id="ta" />
    <Wash x={0} y={0} w={960} h={H} color={A.west} seed={12} />
    <Wash x={960} y={0} w={960} h={H} color={A.east} seed={13} />
    <Fork x={470} y={400} s={1.6} rot={-14} ink={{ ...inkA, lw: 8 }} />
    <Chopsticks x={1450} y={420} s={1.6} rot={18} ink={{ ...inkA, lw: 8 }} />
    <TornSeam x={960} />
    <g transform="rotate(-4 960 860)">
      <rect x={330} y={790} width={1260} height={210} rx={22} fill={A.ink} />
      <text x={960} y={945} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={160} fill={A.paper}>NO FORKS?</text>
    </g>
  </g>
);

/* ============================== LOOK B · Riso Print ============================== */
const B = { paper: "#F3EEE3", pink: "#FF4F8B", blue: "#2D5BD0", yellow: "#FFC83D", ink: "#1C1C3A" };
const inkB = (c: string): Ink => ({ line: "none", lw: 0, plate: c, rim: c, food1: c, food2: c, metal: c, wood: c, bowl: c, rice: c });

const PaperB: React.FC<{ id: string }> = ({ id }) => {
  const r = rng(17);
  const grain = Array.from({ length: 2600 }, () => ({ x: r() * W, y: r() * H, o: 0.06 + r() * 0.14 }));
  return (
    <g>
      <defs>
        <pattern id={`${id}dotP`} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><circle cx={7} cy={7} r={3.4} fill={B.pink} /></pattern>
        <pattern id={`${id}dotB`} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><circle cx={7} cy={7} r={3.4} fill={B.blue} /></pattern>
      </defs>
      <rect width={W} height={H} fill={B.paper} />
      <rect width={960} height={H} fill={`url(#${id}dotP)`} opacity={0.35} />
      <rect x={960} width={960} height={H} fill={`url(#${id}dotB)`} opacity={0.3} />
      {grain.map((g, i) => <rect key={i} x={g.x} y={g.y} width={2} height={2} fill={B.ink} opacity={g.o} />)}
    </g>
  );
};
/** Two-ink overprint: draw the same thing in two inks, slightly misregistered, multiplied. */
const Overprint: React.FC<{ a: string; b: string; dx?: number; dy?: number; children: (c: string) => React.ReactNode }> = ({ a, b, dx = 7, dy = 5, children }) => (
  <g>
    <g style={{ mixBlendMode: "multiply" }} opacity={0.92}>{children(a)}</g>
    <g style={{ mixBlendMode: "multiply" }} opacity={0.55} transform={`translate(${dx} ${dy})`}>{children(b)}</g>
  </g>
);

const FrameB: React.FC = () => (
  <g>
    <PaperB id="fb" />
    <Overprint a={B.pink} b={B.yellow}>{(c) => (<g><Plate x={480} y={650} s={1.05} ink={inkB(c)} /><Fork x={190} y={600} s={0.85} rot={-8} ink={inkB(c)} /><Knife x={780} y={610} s={0.85} rot={6} ink={inkB(c)} /></g>)}</Overprint>
    <Overprint a={B.blue} b={B.pink}>{(c) => (<g><Bowl x={1440} y={700} s={1.05} ink={inkB(c)} /><Chopsticks x={1560} y={460} s={0.95} rot={28} ink={inkB(c)} /></g>)}</Overprint>
    <rect x={952} y={0} width={16} height={H} fill={B.ink} />
    <text x={480} y={960} textAnchor="middle" fontFamily={GROT} fontWeight={700} fontSize={44} fill={B.ink}>EUROPE · knives at the table</text>
    <text x={1440} y={960} textAnchor="middle" fontFamily={GROT} fontWeight={700} fontSize={44} fill={B.ink}>CHINA · cut in the kitchen</text>
    <g transform="translate(960 150)">
      <rect x={-330} y={-80} width={660} height={150} fill={B.yellow} />
      <text x={0} y={-30} textAnchor="middle" fontFamily={GROT} fontWeight={700} fontSize={28} letterSpacing={6} fill={B.ink}>THE FORGOTTEN PROBLEM</text>
      <text x={0} y={52} textAnchor="middle" fontFamily={BLACK} fontSize={92} fill={B.ink}>FUEL</text>
    </g>
    <MiniMap x={70} y={60} hi="europe" land="#E3DBCB" hiFill={B.pink} line={B.ink} paper={B.paper} lw={3} />
    <MiniMap x={1490} y={60} hi="asia" land="#E3DBCB" hiFill={B.blue} line={B.ink} paper={B.paper} lw={3} />
    <text x={1890} y={1062} textAnchor="end" fontFamily={GROT} fontSize={20} fill={B.ink} opacity={0.5}>look B test · placeholder text</text>
  </g>
);
const ThumbB: React.FC = () => (
  <g>
    <PaperB id="tb" />
    <Overprint a={B.pink} b={B.yellow} dx={10} dy={8}>{(c) => <Fork x={470} y={400} s={1.6} rot={-14} ink={inkB(c)} />}</Overprint>
    <Overprint a={B.blue} b={B.pink} dx={10} dy={8}>{(c) => <Chopsticks x={1450} y={420} s={1.6} rot={18} ink={inkB(c)} />}</Overprint>
    <rect x={952} y={0} width={16} height={H} fill={B.ink} />
    <rect x={260} y={800} width={1400} height={220} fill={B.paper} />
    <g transform="rotate(-3 960 870)">
      <text x={968} y={968} textAnchor="middle" fontFamily={BLACK} fontSize={190} fill={B.pink} style={{ mixBlendMode: "multiply" }}>NO FORKS?</text>
      <text x={960} y={960} textAnchor="middle" fontFamily={BLACK} fontSize={190} fill={B.ink}>NO FORKS?</text>
    </g>
  </g>
);

/* ============================== LOOK C · Museum Exhibit ============================== */
const Cc = { wall: "#1E2B28", wall2: "#2C3D38", plinth: "#E9E2D3", plinthSide: "#C9C0AC", card: "#F4EEDF", gold: "#C9A24A", ink: "#1A1A1A" };
const inkC: Ink = { line: "#141414", lw: 3, plate: "#FBFAF6", rim: "#E7E3D8", food1: "#8B4A2B", food2: "#5E7F33", metal: "#D6DBE1", wood: "#9C6233", bowl: "#B8432F", rice: "#FFFDF7" };

const WallC: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <defs>
      <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={Cc.wall} /><stop offset="0.72" stopColor={Cc.wall2} /><stop offset="0.72" stopColor="#151D1B" /><stop offset="1" stopColor="#0E1412" /></linearGradient>
      <radialGradient id={`${id}s`} cx="50%" cy="0%" r="100%"><stop offset="0" stopColor="#FFF4D6" stopOpacity={0.55} /><stop offset="1" stopColor="#FFF4D6" stopOpacity={0} /></radialGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}w)`} />
  </g>
);
const Spot: React.FC<{ id: string; x: number }> = ({ id, x }) => (
  <polygon points={`${x - 70},0 ${x + 70},0 ${x + 360},${H} ${x - 360},${H}`} fill={`url(#${id}s)`} />
);
const Plinth: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 560 }) => (
  <g>
    <ellipse cx={x} cy={H - 70} rx={w * 0.62} ry={34} fill="#000" opacity={0.45} />
    <rect x={x - w / 2} y={y} width={w} height={H - 70 - y} fill={Cc.plinthSide} />
    <rect x={x - w / 2} y={y} width={w} height={28} fill={Cc.plinth} />
  </g>
);
const Card: React.FC<{ x: number; y: number; no: string; title: string; sub: string }> = ({ x, y, no, title, sub }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={4} y={6} width={380} height={150} fill="#000" opacity={0.35} />
    <rect width={380} height={150} fill={Cc.card} />
    <text x={24} y={40} fontFamily={MONO} fontSize={20} fill="#6B6252" letterSpacing={2}>{no}</text>
    <text x={24} y={92} fontFamily={PLAY} fontWeight={900} fontSize={44} fill={Cc.ink}>{title}</text>
    <text x={24} y={128} fontFamily={MONO} fontSize={20} fill="#3D382F">{sub}</text>
  </g>
);

const FrameC: React.FC = () => (
  <g>
    <WallC id="fc" />
    <Spot id="fc" x={520} />
    <Spot id="fc" x={1400} />
    <Plinth x={520} y={720} />
    <Plinth x={1400} y={720} />
    <Plate x={520} y={640} s={0.95} ink={inkC} />
    <Fork x={260} y={520} s={0.7} rot={-10} ink={inkC} />
    <Knife x={790} y={530} s={0.7} rot={8} ink={inkC} />
    <Bowl x={1400} y={690} s={0.95} ink={inkC} />
    <Chopsticks x={1510} y={470} s={0.9} rot={26} ink={inkC} />
    <Card x={330} y={860} no="EXHIBIT 01 · EUROPE" title="The Fork" sub="cut at the table" />
    <Card x={1210} y={860} no="EXHIBIT 02 · CHINA" title="Chopsticks" sub="cut in the kitchen" />
    <text x={960} y={110} textAnchor="middle" fontFamily={MONO} fontSize={26} letterSpacing={8} fill={Cc.gold}>THE FORGOTTEN PROBLEM</text>
    <text x={960} y={210} textAnchor="middle" fontFamily={PLAY} fontWeight={900} fontSize={100} fill="#F4EEDF">Fuel.</text>
    <line x1={860} y1={240} x2={1060} y2={240} stroke={Cc.gold} strokeWidth={3} />
    <text x={1890} y={1062} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#F4EEDF" opacity={0.4}>look C test · placeholder text</text>
  </g>
);
const ThumbC: React.FC = () => (
  <g>
    <WallC id="tc" />
    <Spot id="tc" x={560} />
    <Spot id="tc" x={1380} />
    <Plinth x={560} y={820} w={480} />
    <Plinth x={1380} y={820} w={480} />
    <Fork x={560} y={560} s={1.25} rot={-8} ink={{ ...inkC, lw: 5 }} />
    <Chopsticks x={1380} y={590} s={1.25} rot={14} ink={{ ...inkC, lw: 5 }} />
    <text x={960} y={250} textAnchor="middle" fontFamily={PLAY} fontWeight={900} fontSize={170} fill="#F4EEDF" stroke="#0E1412" strokeWidth={8} paintOrder="stroke">NO FORKS?</text>
  </g>
);

/* (look D below) */
/* ============================== LOOK D · Museum, daylight ============================== */
const Dd = { wall: "#EEE7DA", floor: "#D9CEB9", west: "#C8553D", east: "#2E6F8E", plinth: "#FBF8F2", plinthSide: "#E4DBCA", ink: "#1E1E24", gold: "#B08A3E" };
const inkD: Ink = { ...inkC, line: "#26262C", lw: 3.5 };
const WallD: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <defs>
      <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFBF2" stopOpacity={0.9} /><stop offset="0.6" stopColor="#FFFBF2" stopOpacity={0} /></linearGradient>
      <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={Dd.floor} /><stop offset="1" stopColor="#C9BCA2" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill={Dd.wall} />
    {/* two galleries: each wall faintly tinted with its region colour (Here vs There) */}
    <rect width={960} height={780} fill={Dd.west} opacity={0.07} />
    <rect x={960} width={960} height={780} fill={Dd.east} opacity={0.07} />
    <rect width={W} height={H} fill={`url(#${id}l)`} />
    <rect y={780} width={W} height={H - 780} fill={`url(#${id}f)`} />
    <line x1={0} y1={780} x2={W} y2={780} stroke="#BFB197" strokeWidth={3} />
    {/* centre pilaster = the split */}
    <rect x={930} y={0} width={60} height={800} fill="#F7F2E8" />
    <rect x={986} y={0} width={10} height={800} fill="#000" opacity={0.06} />
    <rect x={922} y={0} width={76} height={26} fill="#E9E1D2" />
  </g>
);
const PlinthD: React.FC<{ x: number; y: number; w?: number; accent: string }> = ({ x, y, w = 520, accent }) => (
  <g>
    <ellipse cx={x + 40} cy={H - 92} rx={w * 0.6} ry={26} fill="#5C4A2A" opacity={0.18} />
    <rect x={x - w / 2} y={y} width={w} height={H - 100 - y} fill={Dd.plinthSide} />
    <rect x={x - w / 2} y={y} width={w * 0.82} height={H - 100 - y} fill={Dd.plinth} />
    <rect x={x - w / 2} y={y} width={w} height={10} fill={accent} />
  </g>
);
const CardD: React.FC<{ x: number; y: number; no: string; title: string; sub: string; accent: string }> = ({ x, y, no, title, sub, accent }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={3} y={5} width={360} height={140} fill="#000" opacity={0.08} />
    <rect width={360} height={140} fill="#FFFFFF" />
    <rect width={8} height={140} fill={accent} />
    <text x={28} y={38} fontFamily={MONO} fontSize={19} fill="#6B6252" letterSpacing={2}>{no}</text>
    <text x={28} y={86} fontFamily={PLAY} fontWeight={900} fontSize={42} fill={Dd.ink}>{title}</text>
    <text x={28} y={120} fontFamily={MONO} fontSize={19} fill="#3D382F">{sub}</text>
  </g>
);
const FrameD: React.FC = () => (
  <g>
    <WallD id="fd" />
    <PlinthD x={480} y={690} accent={Dd.west} />
    <PlinthD x={1440} y={690} accent={Dd.east} />
    <Plate x={480} y={620} s={0.92} ink={inkD} />
    <Fork x={225} y={500} s={0.68} rot={-10} ink={inkD} />
    <Knife x={740} y={510} s={0.68} rot={8} ink={inkD} />
    <Bowl x={1440} y={660} s={0.92} ink={inkD} />
    <Chopsticks x={1545} y={445} s={0.86} rot={26} ink={inkD} />
    <CardD x={300} y={840} no="EXHIBIT 01 · EUROPE" title="The Fork" sub="cut at the table" accent={Dd.west} />
    <CardD x={1260} y={840} no="EXHIBIT 02 · CHINA" title="Chopsticks" sub="cut in the kitchen" accent={Dd.east} />
    <MiniMap x={60} y={50} hi="europe" land="#E2D8C6" hiFill={Dd.west} line="#8A7E68" paper="#FBF8F2" lw={2} />
    <MiniMap x={1500} y={50} hi="asia" land="#E2D8C6" hiFill={Dd.east} line="#8A7E68" paper="#FBF8F2" lw={2} />
    <text x={960} y={110} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={24} letterSpacing={8} fill={Dd.gold}>THE FORGOTTEN PROBLEM</text>
    <text x={960} y={215} textAnchor="middle" fontFamily={PLAY} fontWeight={900} fontSize={104} fill={Dd.ink}>Fuel.</text>
    <text x={1890} y={1062} textAnchor="end" fontFamily={MONO} fontSize={18} fill={Dd.ink} opacity={0.4}>look D test · placeholder text</text>
  </g>
);
const ThumbD: React.FC = () => (
  <g>
    <WallD id="td" />
    <PlinthD x={500} y={800} w={460} accent={Dd.west} />
    <PlinthD x={1420} y={800} w={460} accent={Dd.east} />
    <Fork x={500} y={560} s={1.25} rot={-8} ink={{ ...inkD, lw: 6 }} />
    <Chopsticks x={1420} y={580} s={1.25} rot={14} ink={{ ...inkD, lw: 6 }} />
    <text x={960} y={230} textAnchor="middle" fontFamily={PLAY} fontWeight={900} fontSize={180} fill={Dd.ink}>NO FORKS?</text>
  </g>
);

/* ============================== board ============================== */
const frames: Record<Look, React.FC> = { A: FrameA, B: FrameB, C: FrameC, D: FrameD };
const thumbs: Record<Look, React.FC> = { A: ThumbA, B: ThumbB, C: ThumbC, D: ThumbD };
const names: Record<Look, string> = { A: "A · Paper Atlas", B: "B · Riso Print", C: "C · Museum, dark (your pick)", D: "D · Museum, daylight" };

const Nest: React.FC<{ x: number; y: number; w: number; children: React.ReactNode }> = ({ x, y, w, children }) => (
  <svg x={x} y={y} width={w} height={(w * H) / W} viewBox={`0 0 ${W} ${H}`}>{children}</svg>
);
const Board: React.FC<{ looks?: Look[]; title?: string }> = ({ looks = ["A", "B", "C"], title = "How We Ended Up · look test (pick one)" }) => {
  const colW = looks.length === 2 ? 900 : 600, gap = looks.length === 2 ? 60 : 30, x0 = (W - (colW * looks.length + gap * (looks.length - 1))) / 2;
  return (
    <g>
      <rect width={W} height={H} fill="#ECECEC" />
      <text x={x0} y={70} fontFamily={GROT} fontWeight={700} fontSize={40} fill="#222">{title}</text>
      {looks.map((k, i) => {
        const x = x0 + i * (colW + gap);
        const F = frames[k], T = thumbs[k];
        const fh = (colW * H) / W;
        const two = looks.length === 2;
        const tw = two ? 560 : colW;
        // 3-look board: feed row below the thumbnail (text to the right); 2-look board: feed column right of the thumbnail
        const fx = two ? x + tw + 30 : x, fy = two ? 172 + fh + 46 : 172 + fh * 2 + 94;
        const txX = two ? fx : x + 262, txY = two ? fy + 168 : fy + 26;
        return (
          <g key={k}>
            <text x={x} y={128} fontFamily={GROT} fontWeight={700} fontSize={32} fill="#222">{names[k]}</text>
            <text x={x} y={160} fontFamily={GROT} fontWeight={500} fontSize={20} fill="#666">video frame</text>
            <Nest x={x} y={172} w={colW}><F /></Nest>
            <text x={x} y={172 + fh + 34} fontFamily={GROT} fontWeight={500} fontSize={20} fill="#666">thumbnail</text>
            <Nest x={x} y={172 + fh + 46} w={tw}><T /></Nest>
            {/* feed-size check: thumbnail as it appears in a phone feed (beside the thumbnail on 2-look boards) */}
            <text x={fx} y={fy - 12} fontFamily={GROT} fontWeight={500} fontSize={20} fill="#666">feed size</text>
            <Nest x={fx} y={fy} w={246}><T /></Nest>
            <text x={txX} y={txY} fontFamily={GROT} fontWeight={700} fontSize={19} fill="#111">Why Half the World</text>
            <text x={txX} y={txY + 24} fontFamily={GROT} fontWeight={700} fontSize={19} fill="#111">Doesn't Use Forks</text>
            <text x={txX} y={txY + 52} fontFamily={GROT} fontWeight={500} fontSize={16} fill="#666">How We Ended Up · 12K views</text>
          </g>
        );
      })}
    </g>
  );
};

export const HowLab: React.FC<HowLabProps> = ({ look, view }) => {
  const F = frames[look], T = thumbs[look];
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {view === "board" ? <Board /> : view === "museum" ? <Board looks={["C", "D"]} title="Premium museum look: dark vs daylight" /> : view === "frame" ? <F /> : <T />}
      </svg>
    </AbsoluteFill>
  );
};
