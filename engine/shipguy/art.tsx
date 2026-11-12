// The Ship Guy: 2D illustrated parts (SVG), drawn in code. Bold ink outlines + flat colour with one
// shade tone, to sit next to the owner's stick-figure poses. All sizes in a 1920x1080 viewBox.
import React from "react";
import { Img, staticFile } from "remotion";

export const INK = "#1d1d22";
export const W = 1920;
export const H = 1080;
const ink = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type SkyMood = "day" | "dusk" | "night" | "grey";
const SKIES: Record<SkyMood, [string, string, string]> = {
  day: ["#5fb2ef", "#a9dcff", "#e8f6ff"],
  dusk: ["#2e2a5c", "#c2557a", "#ffb35c"],
  night: ["#0b1530", "#1c2c5a", "#3a4f86"],
  grey: ["#8e9aa6", "#b9c2ca", "#dde2e6"],
};

export const Sky: React.FC<{ mood: SkyMood; horizon?: number }> = ({ mood, horizon = 640 }) => {
  const [a, b, c] = SKIES[mood];
  return (
    <>
      <defs>
        <linearGradient id={`sky-${mood}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.65" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={horizon} fill={`url(#sky-${mood})`} />
      {mood === "day" && (
        <g fill="#ffffff" opacity={0.95}>
          <Cloud x={260} y={170} s={1.1} />
          <Cloud x={1380} y={120} s={0.8} />
          <Cloud x={980} y={260} s={0.6} />
        </g>
      )}
      {mood === "dusk" && <circle cx={1500} cy={horizon - 40} r={90} fill="#ffd27a" opacity={0.9} />}
    </>
  );
};

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={110} ry={42} />
    <ellipse cx={-60} cy={-10} rx={60} ry={40} />
    <ellipse cx={40} cy={-30} rx={70} ry={52} />
  </g>
);

/** Open sea from the horizon down, with drawn wave strokes that drift with `t` (frames). */
export const Sea: React.FC<{ mood: SkyMood; horizon?: number; t: number }> = ({ mood, horizon = 640, t }) => {
  const top = { day: "#2f86c9", dusk: "#3a3f7a", night: "#13244d", grey: "#5d7487" }[mood];
  const bot = { day: "#13507f", dusk: "#1d2350", night: "#08142f", grey: "#33475a" }[mood];
  const waves = [];
  for (let i = 0; i < 26; i++) {
    const row = i % 6;
    const y = horizon + 30 + row * 70 + (i % 2) * 18;
    const x = ((i * 337 + t * (1.2 + row * 0.4)) % (W + 200)) - 100;
    const s = 0.6 + row * 0.25;
    waves.push(
      <path key={i} d={`M${x} ${y} q ${25 * s} ${-14 * s} ${50 * s} 0 q ${25 * s} ${-14 * s} ${50 * s} 0`}
        fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />,
    );
  }
  return (
    <>
      <defs>
        <linearGradient id={`sea-${mood}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
      </defs>
      <rect x={0} y={horizon} width={W} height={H - horizon} fill={`url(#sea-${mood})`} />
      <line x1={0} y1={horizon} x2={W} y2={horizon} stroke={INK} strokeOpacity={0.25} strokeWidth={3} />
      {waves}
    </>
  );
};

/**
 * Side view of an ultra-large crude carrier, bow to the right. Local units: 1000 long, deck at y=0,
 * keel at y=130. `draft` = how much of the hull sits under water (0..1); water is drawn over it by `Sea`
 * callers using `<Waterline>`. `burnt` darkens and streaks the paint.
 */
export const Tanker: React.FC<{ burnt?: boolean; name?: string }> = ({ burnt = false, name }) => {
  const hullTop = burnt ? "#3a2f2c" : "#24314f";
  const hullBot = burnt ? "#4a2a22" : "#b8322a";
  const deck = burnt ? "#5b524c" : "#4f8a5b";
  const hull = "M0 0 L955 0 Q1000 0 1012 18 L996 130 L52 130 Q12 128 4 92 Z";
  return (
    <g>
      <defs>
        <clipPath id="hullclip"><path d={hull} /></clipPath>
      </defs>
      {/* hull: dark topsides over red bottom paint */}
      <path d={hull} fill={hullTop} />
      <g clipPath="url(#hullclip)">
        <rect x={-20} y={78} width={1060} height={70} fill={hullBot} />
        <rect x={-20} y={0} width={1060} height={12} fill="#000" opacity={0.18} />
        {burnt && [80, 260, 410, 600, 770].map((x, i) => (
          <path key={i} d={`M${x} 0 q 20 40 -6 80 q -10 30 12 60`} stroke="#120d0b" strokeWidth={34} opacity={0.55} fill="none" />
        ))}
      </g>
      <path d={hull} fill="none" {...ink} />
      {name && (
        <text x={900} y={50} fontSize={34} fontFamily="Fredoka" fontWeight={700} fill="#fff" textAnchor="end">{name}</text>
      )}
      {/* deck */}
      <rect x={150} y={-10} width={800} height={10} fill={deck} {...ink} strokeWidth={4} />
      {/* pipeline + manifold + hatches */}
      <line x1={170} y1={-18} x2={930} y2={-18} stroke="#d9d4c7" strokeWidth={6} />
      <line x1={170} y1={-18} x2={930} y2={-18} stroke={INK} strokeWidth={2} strokeDasharray="2 38" />
      {[260, 400, 540, 680, 820].map((x) => (
        <rect key={x} x={x} y={-24} width={46} height={14} rx={3} fill="#d9d4c7" stroke={INK} strokeWidth={3} />
      ))}
      <path d="M515 -10 v -34 h 40 v 34" fill="none" stroke={INK} strokeWidth={4} />
      {/* bow mast */}
      <line x1={950} y1={-6} x2={950} y2={-60} stroke={INK} strokeWidth={4} />
      {/* superstructure at the stern */}
      <g>
        <rect x={40} y={-118} width={112} height={118} fill={burnt ? "#6d6560" : "#f4f1e8"} {...ink} strokeWidth={5} />
        <rect x={30} y={-130} width={132} height={16} fill={burnt ? "#6d6560" : "#f4f1e8"} {...ink} strokeWidth={5} />
        {[-100, -76, -52, -28].map((y) => (
          <g key={y}>
            {[52, 76, 100, 124].map((x) => (
              <rect key={x} x={x} y={y} width={14} height={10} rx={2} fill={burnt ? "#2a2522" : "#3b6ea5"} />
            ))}
          </g>
        ))}
        {/* funnel */}
        <path d="M70 -130 L76 -176 L116 -176 L120 -130 Z" fill={burnt ? "#3a302c" : "#e0a12a"} {...ink} strokeWidth={5} />
        <rect x={74} y={-176} width={44} height={10} fill={INK} />
        {/* radar mast */}
        <line x1={128} y1={-130} x2={128} y2={-168} stroke={INK} strokeWidth={4} />
        <line x1={114} y1={-160} x2={142} y2={-160} stroke={INK} strokeWidth={4} />
      </g>
    </g>
  );
};

/** Water band drawn over the lower hull so the ship sits IN the sea, not on it. */
export const Waterline: React.FC<{ x: number; y: number; width: number; mood: SkyMood; t: number; horizon?: number }> = ({ x, y, width, mood, t, horizon = 640 }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const px = x - 60 + ((width + 120) * i) / 40;
    pts.push(`${px},${y + Math.sin(i * 0.9 + t * 0.12) * 6}`);
  }
  // the same sea, redrawn in front of the hull below the waterline (so colours match exactly)
  const id = `wl-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g>
      <defs>
        <clipPath id={id}><polygon points={`${x - 60},${H} ${pts.join(" ")} ${x + width + 60},${H}`} /></clipPath>
      </defs>
      <g clipPath={`url(#${id})`}><Sea mood={mood} horizon={horizon} t={t} /></g>
      <polyline points={pts.join(" ")} fill="none" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

/** Tiny worker for scale: a 40-60 px stick figure in a hard hat, drawn in SVG. */
export const TinyWorker: React.FC<{ x: number; y: number; s?: number; wave?: boolean }> = ({ x, y, s = 1, wave }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none">
    <line x1={0} y1={-22} x2={0} y2={-6} />
    <line x1={0} y1={-6} x2={-6} y2={6} />
    <line x1={0} y1={-6} x2={6} y2={6} />
    <line x1={0} y1={-18} x2={-8} y2={wave ? -34 : -8} />
    <line x1={0} y1={-18} x2={8} y2={-10} />
    <rect x={-4} y={-22} width={8} height={10} fill="#f08a24" strokeWidth={2} />
    <circle cx={0} cy={-29} r={6} fill="#fff" />
    <path d="M-7 -31 Q0 -40 7 -31 Z" fill="#f2f2f2" strokeWidth={2} />
  </g>
);

/** Simple cartoon fighter jet, nose to the right. ~220 wide. */
export const Jet: React.FC = () => (
  <g>
    <path d="M0 0 L40 -10 L150 -12 Q200 -10 222 0 Q200 10 150 12 L40 10 Z" fill="#8d97a3" {...ink} strokeWidth={5} />
    <path d="M70 -10 L120 -60 L140 -60 L120 -10 Z" fill="#7a8490" {...ink} strokeWidth={5} />
    <path d="M70 10 L120 46 L138 46 L120 10 Z" fill="#6c7581" {...ink} strokeWidth={5} />
    <path d="M10 -8 L0 -40 L22 -40 L40 -9 Z" fill="#7a8490" {...ink} strokeWidth={5} />
    <path d="M150 -10 Q172 -22 192 -6" fill="#9fd3ff" {...ink} strokeWidth={4} />
    <ellipse cx={-6} cy={0} rx={14} ry={7} fill="#ffb347" />
  </g>
);

/** Missile with a smoke trail. The trail is a path from (x0,y0) to the missile tip (x1,y1). */
export const Missile: React.FC<{ x0: number; y0: number; x1: number; y1: number; bend?: number }> = ({ x0, y0, x1, y1, bend = -80 }) => {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + bend;
  const ang = (Math.atan2(y1 - my, x1 - mx) * 180) / Math.PI;
  return (
    <g>
      <path d={`M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}`} fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={22} strokeLinecap="round" />
      <path d={`M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}`} fill="none" stroke="#ffffff" strokeOpacity={0.9} strokeWidth={8} strokeLinecap="round" />
      <g transform={`translate(${x1} ${y1}) rotate(${ang})`}>
        <path d="M-46 -6 L18 -6 Q32 0 18 6 L-46 6 Z" fill="#e9e9e4" {...ink} strokeWidth={4} />
        <path d="M-46 -6 L-58 -18 L-36 -6 M-46 6 L-58 18 L-36 6" fill="#c33" stroke={INK} strokeWidth={3} />
        <ellipse cx={-56} cy={0} rx={14} ry={7} fill="#ffcf4a" />
      </g>
    </g>
  );
};

/** Cartoon explosion / fire ball. `p` 0..1 grows it; `seed` varies the shape. */
export const Boom: React.FC<{ x: number; y: number; r: number; p: number; seed?: number }> = ({ x, y, r, p, seed = 1 }) => {
  const spikes = 14;
  const star = (rad: number) => {
    const pts: string[] = [];
    for (let i = 0; i < spikes * 2; i++) {
      const a = (i / (spikes * 2)) * Math.PI * 2 + seed;
      const k = i % 2 === 0 ? 1 : 0.62 + 0.12 * Math.sin(i * 7.3 + seed);
      pts.push(`${Math.cos(a) * rad * k},${Math.sin(a) * rad * k}`);
    }
    return pts.join(" ");
  };
  const s = Math.max(0.01, p);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <polygon points={star(r)} fill="#ff6a2b" {...ink} strokeWidth={6 / s} />
      <polygon points={star(r * 0.7)} fill="#ffb02e" />
      <polygon points={star(r * 0.4)} fill="#fff1a8" />
    </g>
  );
};

/** Rolling flames along a line (fire on deck or on the water). */
export const Flames: React.FC<{ x: number; y: number; width: number; height: number; t: number; seed?: number }> = ({ x, y, width, height, t, seed = 0 }) => {
  // irregular tongues: varied width/height, some gaps, overlapping, so it reads as fire, not a fence
  const n = Math.max(2, Math.round(width / 85));
  const tongues = [];
  for (let i = 0; i < n; i++) {
    const h1 = Math.abs(Math.sin(i * 12.9898 + seed * 7.1) * 43758.5453) % 1;
    const h2 = Math.abs(Math.sin(i * 78.233 + seed * 3.7) * 12543.123) % 1;
    if (h1 < 0.18 && n > 4) continue;
    const cx = x + (width * (i + 0.5)) / n + (h2 - 0.5) * 40;
    const hh = height * (0.35 + 0.9 * h1) * (0.85 + 0.15 * Math.sin(t * 0.35 + i * 1.7));
    const w = (width / n) * (0.9 + 1.1 * h2);
    const sway = Math.sin(t * 0.3 + i) * 12;
    const tongue = (k: number) =>
      `M${cx - (w * k) / 2} ${y} Q${cx - (w * k) / 2} ${y - hh * k * 0.55} ${cx + sway * k} ${y - hh * k} Q${cx + (w * k) / 2 + sway * 0.3} ${y - hh * k * 0.45} ${cx + (w * k) / 2} ${y} Z`;
    tongues.push(
      <g key={i}>
        <path d={tongue(1)} fill="#ff5a1f" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={tongue(0.66)} fill="#ffad2e" />
        <path d={tongue(0.33)} fill="#fff0a0" />
      </g>,
    );
  }
  return <g>{tongues}</g>;
};

/** Column of dark smoke puffs rising from (x,y), leaning with the wind. */
export const Smoke: React.FC<{ x: number; y: number; t: number; size?: number; lean?: number; dark?: boolean }> = ({ x, y, t, size = 1, lean = -1, dark = true }) => {
  const puffs = [];
  for (let i = 0; i < 9; i++) {
    const k = ((i * 23 + t * 0.6) % 200) / 200; // 0..1 along the column
    const px = x + lean * k * 380 * size + Math.sin(i * 3.1) * 20;
    const py = y - k * 560 * size;
    const r = (40 + k * 120) * size;
    puffs.push(<circle key={i} cx={px} cy={py} r={r} fill={dark ? (i % 2 ? "#2c2a2c" : "#3d393a") : "#cfcfcf"} opacity={0.9 - k * 0.5} />);
  }
  return <g>{puffs}</g>;
};

/** Petronas Towers silhouette, base centre at (x, ground), drawn `height` px tall. */
export const Towers: React.FC<{ x: number; ground: number; height: number }> = ({ x, ground, height }) => {
  const one = (cx: number) => {
    const w = height * 0.11;
    const tiers = 8;
    const parts = [];
    for (let i = 0; i < tiers; i++) {
      const y0 = ground - (height * 0.86 * i) / tiers;
      const y1 = ground - (height * 0.86 * (i + 1)) / tiers;
      const ww = w * (1 - i * 0.07);
      parts.push(<rect key={i} x={cx - ww / 2} y={y1} width={ww} height={y0 - y1} fill={i % 2 ? "#b9c3cf" : "#c9d2dc"} {...ink} strokeWidth={4} />);
    }
    const top = ground - height * 0.86;
    parts.push(<path key="sp" d={`M${cx - w * 0.2} ${top} L${cx} ${ground - height} L${cx + w * 0.2} ${top} Z`} fill="#c9d2dc" {...ink} strokeWidth={4} />);
    return parts;
  };
  const gap = height * 0.2;
  const by = ground - height * 0.42;
  return (
    <g>
      {one(x - gap / 2)}
      {one(x + gap / 2)}
      <rect x={x - gap / 2} y={by} width={gap} height={height * 0.02} fill="#8e99a6" {...ink} strokeWidth={4} />
    </g>
  );
};

/** One of the owner's stick-figure poses (transparent PNG cut out by tools/cutout.py). */
export type Pose =
  | "confident" | "confused" | "explain" | "satisfied" | "saying" | "saying-2"
  | "scared" | "shocked" | "shocked-2" | "stop" | "thinking";
export const Stickman: React.FC<{ pose: Pose; x: number; y: number; height: number; flip?: boolean; bob?: number }> = ({ pose, x, y, height, flip, bob = 0 }) => (
  <Img
    src={staticFile(`shipguy/stickmen/${pose}.png`)}
    style={{
      position: "absolute",
      left: x,
      top: y - height + bob,
      height,
      transform: flip ? "scaleX(-1)" : undefined,
      filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.18))",
    }}
  />
);
