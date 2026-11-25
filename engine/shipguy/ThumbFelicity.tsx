// The Ship Guy: thumbnails for "The Ship That Sank With 4,000 Luxury Cars" (Felicity Ace, video #7).
// Same rules as the Dali / carrier thumbnails: flat video style, one clear subject, a big emotional Ship Guy face,
// 1-2 words, strong colour contrast, readable at phone size. No brand logos.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK } from "./art";
import { FACES, Guy, POSES } from "./guy";
import { fontFamily, Svg } from "./scenes";
import { rnd } from "./templates5";
import { Car, Pctc } from "./templates7";

const Big: React.FC<{ text: string; color: string; size: number; x: number; y: number; rot?: number }> = ({ text, color, size, x, y, rot = -4 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, whiteSpace: "nowrap", lineHeight: 0.92 }}>
    <span style={{ fontFamily, fontWeight: 700, fontSize: size, color, WebkitTextStroke: `${size * 0.16}px ${INK}`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.08}px 0 ${INK}`, letterSpacing: 2 }}>{text}</span>
  </div>
);
const Sea: React.FC<{ y: number; dark?: boolean }> = ({ y, dark }) => (
  <g>
    <rect x={0} y={y} width={1920} height={1080 - y} fill={dark ? "#1f3a55" : "#2f6f99"} />
    {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M${(i * 173) % 1920} ${y + 40 + (i % 4) * 70} q 22 -8 44 0 t 44 0`} stroke="#7fb3d4" strokeWidth={6} fill="none" />)}
  </g>
);
const Sky: React.FC<{ dusk?: boolean }> = ({ dusk }) => (
  <g>
    <defs><linearGradient id="tfs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={dusk ? "#3a3f5c" : "#5d6b80"} /><stop offset="1" stopColor={dusk ? "#e08a4a" : "#c9b79a"} /></linearGradient></defs>
    <rect width={1920} height={1080} fill="url(#tfs)" />
  </g>
);

const Boat: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-260 -40 L 260 -40 L 200 90 L -200 90 Z" fill="#e0a23b" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M-250 -10 L 250 -10" stroke="#fff" strokeWidth={14} />
  </g>
);

// A: "$400M" the burning car carrier, a supercar in a circle, the Ship Guy shocked
const FA: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Sky dusk />
      <g transform="translate(-120 760)"><Pctc L={1500} fire={1} scorch={0.5} t={40} name={false} /></g>
      <Sea y={760} dark />
      <g transform="translate(1440 430)">
        <circle r={260} fill="#fff" stroke={INK} strokeWidth={14} />
        <circle r={260} fill="none" stroke="#ffd23f" strokeWidth={12} strokeDasharray="30 20" />
        <g transform="translate(0 90)"><Car kind="super" c="#e0a23b" s={4} /></g>
        {Array.from({ length: 4 }).map((_, i) => <path key={i} d={`M${-90 + i * 50} -20 q 16 ${-60 - rnd(i) * 40} 6 -110 q 30 44 34 110 Z`} fill={i % 2 ? "#ffb03a" : "#ff6a2a"} />)}
      </g>
      <Guy x={1600} y={955} s={0.85} t={10} id="tfa" blink={false} pose={POSES.handsHead} face={FACES.shocked} handL="open" handR="open" />
      <Boat x={1600} y={880} />
    </Svg>
    <Big text="$400M" color="#ffd23f" size={260} x={60} y={30} rot={-5} />
  </AbsoluteFill>
);

// B: "4,000 CARS" the ship going down, cars sliding off, the Ship Guy panicking
const FB: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Sky />
      <g transform="translate(160 720) rotate(-10 700 -100)"><Pctc L={1400} scorch={0.8} t={40} name={false} water={false} /></g>
      {Array.from({ length: 7 }).map((_, i) => <g key={i} transform={`translate(${1150 + i * 90} ${560 + i * 70}) rotate(${30 + i * 10})`}><Car kind={(["sport", "suv", "super"] as const)[i % 3]} c={["#c94a3a", "#2a2d33", "#e0a23b", "#f4f4f0", "#3a73b8"][i % 5]} s={1.4} /></g>)}
      <Sea y={760} />
      <Guy x={420} y={955} s={0.9} t={10} id="tfb" blink={false} pose={POSES.handsHead} face={FACES.shocked} handL="open" handR="open" />
      <Boat x={420} y={880} />
    </Svg>
    <Big text="4,000 CARS" color="#ffffff" size={210} x={70} y={40} rot={-4} />
  </AbsoluteFill>
);

// C: "WHO DID IT?" one glowing electric car on a dark car deck, smoke, the Ship Guy suspicious with a magnifier feel
const FC: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <rect width={1920} height={1080} fill="#2a2f36" />
      {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={rnd(i) * 1920} cy={120 + rnd(i + 5) * 400} r={140 + rnd(i + 3) * 120} fill="#1a1c20" opacity={0.85} />)}
      <rect x={0} y={820} width={1920} height={260} fill="#3a424b" />
      {Array.from({ length: 5 }).map((_, i) => <g key={i} transform={`translate(${160 + i * 380} 840)`}><Car kind="sedan" c="#5a636c" s={2.6} /></g>)}
      <ellipse cx={1180} cy={760} rx={330} ry={150} fill="#ff8a3a" opacity={0.45} />
      <g transform="translate(1180 860)"><Car kind="sport" c="#f4f4f0" s={5} ev glow={1} /></g>
      {Array.from({ length: 5 }).map((_, i) => <path key={i} d={`M${1060 + i * 50} 700 q 18 ${-90 - rnd(i) * 60} 6 -160 q 34 60 40 160 Z`} fill={i % 2 ? "#ffb03a" : "#ff6a2a"} />)}
      <Guy x={420} y={1220} s={1.0} t={10} id="tfc" blink={false} pose={POSES.chin} face={{ eyes: "half", brows: "one", mouth: "flat", lookX: 0.8 }} />
    </Svg>
    <Big text="WHO DID IT?" color="#ffd23f" size={200} x={760} y={60} rot={-4} />
  </AbsoluteFill>
);

export const FELICITY_THUMBS: Record<string, React.FC> = { FA, FB, FC };
