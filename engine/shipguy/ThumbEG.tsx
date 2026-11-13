// The Ship Guy: thumbnails for "Ever Given" (drawn at 1920x1080, exported as 1280x720 JPG).
// Channel thumbnail rules: the SHIP is the hero, max 3 words, one strong colour contrast, Ship Guy small or absent.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK } from "./art";
import { Guy, FACES, POSES } from "./guy";
import { fontFamily, Svg } from "./scenes";
import { BOX, EGSide, EGTop, SAND, SAND_D, WATER } from "./templates3";

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

export const EG_THUMBS: Record<string, React.FC> = { EGA: EG_A, EGB: EG_B, EGC: EG_C };
