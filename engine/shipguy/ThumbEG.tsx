// The Ship Guy: thumbnails for "Ever Given" (drawn at 1920x1080, exported as 1280x720 JPG).
// Channel thumbnail rules: the SHIP is the hero, max 3 words, one strong colour contrast, Ship Guy small or absent.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK } from "./art";
import { Guy, FACES, POSES } from "./guy";
import { fontFamily, Svg } from "./scenes";
import { BOX, EGSide, EGTop, GREEN, GREEN_D, SAND, SAND_D, WATER } from "./templates3";

const Big: React.FC<{ lines: { text: string; color: string; size: number }[]; x: number; y: number; rot?: number }> = ({ lines, x, y, rot = -4 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, lineHeight: 0.92, whiteSpace: "nowrap" }}>
    {lines.map((l, i) => (
      <div key={i} style={{ fontFamily, fontWeight: 700, fontSize: l.size, color: l.color, WebkitTextStroke: `${l.size * 0.16}px ${INK}`, paintOrder: "stroke fill", textShadow: `0 ${l.size * 0.08}px 0 ${INK}`, letterSpacing: 2 }}>{l.text}</div>
    ))}
  </div>
);

const rnd = (i: number) => { const x = Math.sin(i * 77.7 + 3.1) * 43758.5453; return x - Math.floor(x); };

const DiggerTopBig: React.FC = () => (
  <g>
    <rect x={-30} y={-24} width={60} height={48} rx={6} fill="#ffd23f" stroke={INK} strokeWidth={6} />
    <rect x={-20} y={-16} width={22} height={22} fill="#bfe6f5" stroke={INK} strokeWidth={4} />
    <path d="M30 -8 L 92 -16 L 92 16 L 30 8 Z" fill="#ffd23f" stroke={INK} strokeWidth={5} />
    <path d="M92 -22 h 26 v 44 h -26 Z" fill="#7d8790" stroke={INK} strokeWidth={5} />
  </g>
);

// A: top-down, the ship wedged bank to bank across the frame; one tiny yellow digger at the bow. "6 DAYS"
const EG_A: React.FC = () => (
  <AbsoluteFill style={{ background: SAND }}>
    <Svg>
      {Array.from({ length: 60 }).map((_, i) => <circle key={i} cx={rnd(i) * 1920} cy={rnd(i + 60) * 1080} r={6 + rnd(i + 9) * 14} fill={SAND_D} opacity={0.35} />)}
      <path d="M0 330 Q 960 300 1920 340 L 1920 760 Q 960 790 0 750 Z" fill={WATER} stroke={INK} strokeWidth={8} />
      <g transform="translate(900 545) rotate(38) scale(3.7)"><EGTop /></g>
      <g transform="translate(1520 905) rotate(-20) scale(1.2)"><DiggerTopBig /></g>
      <circle cx={1560} cy={900} r={130} fill="none" stroke="#e8352b" strokeWidth={12} />
    </Svg>
    <Big x={60} y={40} rot={-5} lines={[{ text: "6 DAYS", color: "#ffd23f", size: 260 }]} />
    <Big x={1060} y={20} rot={4} lines={[{ text: "STUCK", color: "#ffffff", size: 200 }]} />
  </AbsoluteFill>
);

// B: side view, giant bow buried in the bank, tiny digger + tiny Ship Guy. "TOO BIG?"
const EG_B: React.FC = () => (
  <AbsoluteFill style={{ background: "#9fd3ee" }}>
    <Svg>
      <g transform="translate(-1560 330) scale(2.25)"><EGSide /></g>
      <path d="M0 900 Q 480 878 960 900 T 1920 900 V 1080 H 0 Z" fill={SAND} stroke={INK} strokeWidth={8} />
      <path d="M1040 900 q 180 -170 420 -60 q 160 50 460 50 V 900 Z" fill={SAND} stroke={INK} strokeWidth={8} />
      <g transform="translate(1530 905) scale(1.15)">
        <rect x={-90} y={-30} width={180} height={34} rx={14} fill="#3d3d40" stroke={INK} strokeWidth={6} />
        <rect x={-70} y={-120} width={110} height={90} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={6} />
        <rect x={-56} y={-110} width={50} height={46} fill="#bfe6f5" stroke={INK} strokeWidth={4} />
        <g transform="rotate(-40 40 -90)"><rect x={30} y={-104} width={150} height={26} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={6} /></g>
      </g>
      <Guy x={1780} y={930} s={0.42} t={10} id="tb" pose={POSES.handsHead} face={FACES.shocked} handL="open" handR="open" />
    </Svg>
    <Big x={1070} y={60} rot={5} lines={[{ text: "ONE", color: "#ffffff", size: 190 }, { text: "DIGGER?", color: "#ffd23f", size: 200 }]} />
  </AbsoluteFill>
);

// C: the jam: the wedged ship in the middle, hundreds of ships piled at both ends. "$9.6B A DAY"
const EG_C: React.FC = () => (
  <AbsoluteFill style={{ background: "#1f3a5f" }}>
    <Svg>
      <path d="M0 470 Q 960 440 1920 480 L 1920 690 Q 960 720 0 680 Z" fill={WATER} stroke={INK} strokeWidth={8} />
      <path d="M0 0 H 1920 V 480 Q 960 440 0 470 Z" fill={SAND} stroke={INK} strokeWidth={8} />
      <path d="M0 680 Q 960 720 1920 690 V 1080 H 0 Z" fill={SAND} stroke={INK} strokeWidth={8} />
      <g transform="translate(960 580) rotate(28) scale(2.4)"><EGTop /></g>
      {Array.from({ length: 70 }).map((_, i) => {
        const left = i % 2 === 0, k = Math.floor(i / 2);
        const x = left ? 60 + (k % 6) * 70 : 1860 - (k % 6) * 70, y = 500 + (Math.floor(k / 6) % 3) * 60 + (rnd(i) - 0.5) * 20;
        if (Math.floor(k / 6) > 2) return null;
        return <rect key={i} x={x - 30} y={y - 12} width={60} height={24} rx={8} fill={BOX[i % BOX.length]} stroke={INK} strokeWidth={3} transform={`rotate(${(rnd(i + 3) - 0.5) * 20} ${x} ${y})`} />;
      })}
    </Svg>
    <Big x={330} y={20} rot={-3} lines={[{ text: "$9.6B", color: "#ffd23f", size: 280 }]} />
    <Big x={1000} y={760} rot={-3} lines={[{ text: "A DAY", color: "#ffffff", size: 230 }]} />
  </AbsoluteFill>
);


// ---------------------------------------------------------------- v2 (owner: "not convincing"): read the story at a glance
// Aerial view with real depth: the giant wedged bank to bank in a narrow desert canal, ships queued to the horizon.
// Hand-made perspective: world (u = metres sideways, v = metres ahead, z = metres up) -> screen.
const F = 2400, CAMH = 133, V0 = 400, HOR = 330;
const P = (u: number, v: number, z = 0): [number, number] => [960 + (F * u) / (v + V0), HOR + (F * (CAMH - z)) / (v + V0)];
type V3 = [number, number, number];
const quad = (pts: V3[]) => pts.map(([u, v, z]) => P(u, v, z).join(",")).join(" ");
const QCOL = ["#c94a3a", "#3a73b8", "#4f8a5b", "#596572", "#8a5aa8"];

const Aerial: React.FC<{ digger?: boolean }> = ({ digger = true }) => {
  // the Ever Given: stern dug into the west bank (left), bow into the east bank (right, farther away)
  const C: [number, number] = [0, 400];
  const d: [number, number] = [0.757, 0.653];
  const n: [number, number] = [-d[1], d[0]];
  const Wp = (a: number, b: number): [number, number] => [C[0] + a * d[0] + b * n[0], C[1] + a * d[1] + b * n[1]];
  const at = (a: number, b: number, z: number): V3 => { const [u, v] = Wp(a, b); return [u, v, z]; };
  const DECK = 24, TOP = 46;
  const cols = Array.from({ length: 25 }).map((_, c) => -184 + c * 14).filter((a) => a + 13 < 54 || a > 80);
  const queue = Array.from({ length: 13 }).map((_, i) => ({ u: i % 2 ? 55 : -55, v: 900 + i * 520, c: QCOL[i % 5] }));
  const [bx, by] = Wp(214, 8);
  const [dx, dy] = P(bx, by);
  const dsc = F / (by + V0) / 2.6;
  const txtA = P(...Wp(-100, -29), 13), txtB = P(...Wp(60, -29), 13), txtC = P(...Wp(-20, -29), 10);
  const k = F / (Wp(-20, -29)[1] + V0);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3a96a" /><stop offset="1" stopColor="#f6dcae" /></linearGradient>
          <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6dcae" stopOpacity="1" /><stop offset="1" stopColor="#f6dcae" stopOpacity="0" /></linearGradient>
        </defs>
        <rect width={1920} height={HOR + 2} fill="url(#sky)" />
        <rect y={HOR} width={1920} height={1080 - HOR} fill={SAND} />
        {Array.from({ length: 220 }).map((_, i) => { const u = (rnd(i) - 0.5) * 3000, v = 40 + rnd(i + 220) * 4000; const [x, y] = P(u, v); const r = (F * (2 + rnd(i + 5) * 4)) / (v + V0); return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.45} fill={SAND_D} opacity={0.4} />; })}
        {/* canal to the horizon */}
        <polygon points={quad([[-150, 0, 0], [150, 0, 0], [150, 60000, 0], [-150, 60000, 0]])} fill={WATER} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 70 }).map((_, i) => { const u = (rnd(i + 9) - 0.5) * 260, v = rnd(i + 99) * 3000; const [x, y] = P(u, v); const w = (F * 10) / (v + V0); return <path key={i} d={`M${x} ${y} q ${w / 2} ${-w / 5} ${w} 0`} stroke="#bfe6f5" strokeWidth={Math.max(1, w / 6)} fill="none" />; })}
        {/* queued ships, far first */}
        {[...queue].reverse().map((q, i) => {
          const L = 300, B = 42, H = 22;
          const sx = q.u > 0 ? q.u - B / 2 : q.u + B / 2;
          return (
            <g key={i}>
              <polygon points={quad([[sx, q.v, 0], [sx, q.v + L, 0], [sx, q.v + L, H], [sx, q.v, H]])} fill={q.c} stroke={INK} strokeWidth={2} />
              <polygon points={quad([[q.u - B / 2, q.v, H], [q.u + B / 2, q.v, H], [q.u + B / 2, q.v + L, H], [q.u - B / 2, q.v + L, H]])} fill={q.c} stroke={INK} strokeWidth={2} />
              <polygon points={quad([[q.u - B / 2 + 4, q.v + 30, H + 14], [q.u + B / 2 - 4, q.v + 30, H + 14], [q.u + B / 2 - 4, q.v + L - 40, H + 14], [q.u - B / 2 + 4, q.v + L - 40, H + 14]])} fill={BOX[i % BOX.length]} stroke={INK} strokeWidth={1.5} />
              <polygon points={quad([[q.u - B / 2, q.v, 0], [q.u + B / 2, q.v, 0], [q.u + B / 2, q.v, H], [q.u - B / 2, q.v, H]])} fill={q.c} stroke={INK} strokeWidth={2} />
            </g>
          );
        })}
        <rect y={HOR} width={1920} height={120} fill="url(#haze)" />
        {/* sand pushed up where the bow and stern dug into the banks */}
        {[[206, 6], [-204, -6]].map(([a, b], i) => { const [u, v] = Wp(a, b); const [x, y] = P(u, v); const r = (F * 42) / (v + V0); return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.45} fill="#f3e7c8" opacity={0.95} />; })}
        {/* the Ever Given: deck, near side, bow + stern faces */}
        <polygon points={quad([at(-200, -28, DECK), at(150, -29, DECK), at(196, -12, DECK), at(205, 0, DECK), at(196, 12, DECK), at(150, 29, DECK), at(-200, 28, DECK)])} fill={GREEN_D} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <polygon points={quad([at(-200, -28, 0), at(150, -29, 0), at(150, -29, DECK), at(-200, -28, DECK)])} fill={GREEN} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <polygon points={quad([at(150, -29, 0), at(196, -12, 0), at(205, 0, 0), at(205, 0, DECK), at(196, -12, DECK), at(150, -29, DECK)])} fill={GREEN} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <polygon points={quad([at(-200, -28, 0), at(-200, 28, 0), at(-200, 28, DECK), at(-200, -28, DECK)])} fill={GREEN_D} stroke={INK} strokeWidth={5} />
        <polygon points={quad([at(-199, -28.2, 1), at(149, -29.2, 1), at(149, -29.2, 7), at(-199, -28.2, 7)])} fill="#b8432f" />
        <text x={txtC[0]} y={txtC[1]} fontFamily={fontFamily} fontWeight={700} fontSize={9 * k} fill="#f4f4ee" textAnchor="middle"
          transform={`rotate(${(Math.atan2(txtB[1] - txtA[1], txtB[0] - txtA[0]) * 180) / Math.PI} ${txtC[0]} ${txtC[1]})`}>EVERGREEN</text>
        {/* containers: columns far (bow) to near (stern); each column = side faces + top */}
        {[...cols].reverse().map((a, ci) => {
          const h = TOP + ((ci * 7) % 3) * 4;
          return (
            <g key={a}>
              <polygon points={quad([at(a, -26, DECK), at(a, 26, DECK), at(a, 26, h), at(a, -26, h)])} fill={BOX[(ci * 5 + 2) % BOX.length]} stroke={INK} strokeWidth={1.6} />
              <polygon points={quad([at(a, -26, DECK), at(a + 13, -26, DECK), at(a + 13, -26, h), at(a, -26, h)])} fill={BOX[(ci * 5) % BOX.length]} stroke={INK} strokeWidth={1.6} />
              {[0, 1, 2, 3].map((r) => <polygon key={r} points={quad([at(a, -26 + r * 13, h), at(a + 13, -26 + r * 13, h), at(a + 13, -13 + r * 13, h), at(a, -13 + r * 13, h)])} fill={BOX[(ci * 3 + r * 5) % BOX.length]} stroke={INK} strokeWidth={1.4} />)}
            </g>
          );
        })}
        {/* bridge tower (drawn in its place in the far-to-near order: after the bow-side columns) */}
        <polygon points={quad([at(56, -29, DECK), at(56, 29, DECK), at(56, 29, 82), at(56, -29, 82)])} fill="#d6dade" stroke={INK} strokeWidth={4} />
        <polygon points={quad([at(56, -29, DECK), at(78, -29, DECK), at(78, -29, 82), at(56, -29, 82)])} fill="#f4f4ee" stroke={INK} strokeWidth={4} />
        <polygon points={quad([at(56, -29, 82), at(78, -29, 82), at(78, 29, 82), at(56, 29, 82)])} fill="#e3e6e8" stroke={INK} strokeWidth={4} />
        <polygon points={quad([at(58, -29.6, 72), at(76, -29.6, 72), at(76, -29.6, 78), at(58, -29.6, 78)])} fill="#2c4a6e" />
        {/* the little yellow digger on the east bank, at the bow */}
        {digger && (
          <g transform={`translate(${dx + 30 * dsc} ${dy + 6 * dsc}) scale(${dsc * 0.6})`}>
            <rect x={-90} y={-30} width={180} height={34} rx={14} fill="#3d3d40" stroke={INK} strokeWidth={6} />
            <rect x={-70} y={-120} width={110} height={90} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={6} />
            <rect x={-56} y={-110} width={50} height={46} fill="#bfe6f5" stroke={INK} strokeWidth={4} />
            <g transform="rotate(205 -60 -90)"><rect x={-70} y={-104} width={150} height={26} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={6} /></g>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

const Stamp: React.FC<{ text: string; x: number; y: number; rot?: number; size?: number }> = ({ text, x, y, rot = -8, size = 170 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, background: "#e8352b", border: `12px solid ${INK}`, borderRadius: 24, padding: "0 40px", boxShadow: `0 14px 0 ${INK}`, whiteSpace: "nowrap" }}>
    <span style={{ fontFamily, fontWeight: 700, fontSize: size, color: "#fff", WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: "stroke fill", letterSpacing: 4 }}>{text}</span>
  </div>
);

// D: aerial jam + "STUCK" stamp + "6 DAYS"
const EG_D: React.FC = () => (
  <AbsoluteFill>
    <Aerial />
    <Stamp text="STUCK" x={70} y={40} rot={-7} />
    <Big x={1180} y={40} rot={5} lines={[{ text: "6 DAYS", color: "#ffd23f", size: 210 }]} />
  </AbsoluteFill>
);

// F: same aerial, question hook
const EG_F: React.FC = () => (
  <AbsoluteFill>
    <Aerial />
    <Big x={90} y={30} rot={-5} lines={[{ text: "MOVE THIS?", color: "#ffd23f", size: 230 }]} />
  </AbsoluteFill>
);

// E: the whole bow, buried in the bank, the little digger and Ship Guy for scale. "ONE DIGGER?"
const EG_E: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#7fc4ea, #d8eef6 70%)" }}>
    <Svg>
      <g transform="translate(-620 470) scale(1.62)"><EGSide /></g>
      <path d="M0 860 Q 600 830 1100 850 L 1920 880 V 1080 H 0 Z" fill={SAND} stroke={INK} strokeWidth={8} />
      <path d="M1000 860 Q 1320 600 1720 760 Q 1840 800 1920 820 V 880 H 1000 Z" fill={SAND} stroke={INK} strokeWidth={8} />
      {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={1050 + rnd(i) * 860} cy={800 + rnd(i + 30) * 260} r={5 + rnd(i + 3) * 9} fill={SAND_D} opacity={0.5} />)}
      <g transform="translate(1180 950) scale(1.25)">
        <rect x={-90} y={-30} width={180} height={34} rx={14} fill="#3d3d40" stroke={INK} strokeWidth={6} />
        <rect x={-70} y={-120} width={110} height={90} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={6} />
        <rect x={-56} y={-110} width={50} height={46} fill="#bfe6f5" stroke={INK} strokeWidth={4} />
        <g transform="rotate(-35 40 -90)"><rect x={30} y={-104} width={150} height={26} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={6} />
          <g transform="rotate(55 176 -90)"><rect x={166} y={-100} width={26} height={110} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={6} /><path d="M160 6 h44 l-8 34 h-30 Z" fill="#7d8790" stroke={INK} strokeWidth={6} /></g></g>
      </g>
      <circle cx={1250} cy={880} r={190} fill="none" stroke="#e8352b" strokeWidth={14} />
      <Guy x={1560} y={1000} s={0.5} t={10} id="te" pose={POSES.handsHead} face={FACES.shocked} handL="open" handR="open" />
    </Svg>
    <Big x={1080} y={60} rot={5} lines={[{ text: "ONE", color: "#ffffff", size: 190 }, { text: "DIGGER?", color: "#ffd23f", size: 210 }]} />
  </AbsoluteFill>
);

export const EG_THUMBS: Record<string, React.FC> = { EGA: EG_A, EGB: EG_B, EGC: EG_C, EGD: EG_D, EGE: EG_E, EGF: EG_F };
