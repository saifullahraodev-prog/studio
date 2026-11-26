// The Ship Guy: thumbnails for "The $2 Billion Job to Raise a Sunken Cruise Ship" (Costa Concordia, video #8).
// Same rules as before: one clear subject, a big Ship Guy face, 1-2 words, strong contrast, readable at phone size, no logos.
// The Ship Guy stands on a work boat, never in the water.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK } from "./art";
import { FACES, Guy, POSES } from "./guy";
import { fontFamily, Svg } from "./scenes";
import { LinerEnd, Liner, Island } from "./templates8";
import { Parb } from "./templates8c";

const Big: React.FC<{ text: string; color: string; size: number; x: number; y: number; rot?: number }> = ({ text, color, size, x, y, rot = -4 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, whiteSpace: "nowrap", lineHeight: 0.92 }}>
    <span style={{ fontFamily, fontWeight: 700, fontSize: size, color, WebkitTextStroke: `${size * 0.16}px ${INK}`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.08}px 0 ${INK}`, letterSpacing: 2 }}>{text}</span>
  </div>
);
const WorkBoat: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-260 -30 L 260 -30 L 210 80 L -220 80 Q -260 50 -260 -30 Z" fill="#e0a23b" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M-250 0 L 250 0" stroke="#fff" strokeWidth={14} />
  </g>
);

// A: "$2 BILLION": the wreck on her side by the island, chains pulling, the Ship Guy shocked on a work boat
const CA: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <defs><linearGradient id="tca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6fa8d6" /><stop offset="1" stopColor="#e8f3f2" /></linearGradient></defs>
      <rect width={1920} height={1080} fill="url(#tca)" />
      <Island x={420} y={700} s={1.4} />
      <rect x={0} y={680} width={1920} height={400} fill="#2f6f99" />
      <g transform="translate(1040 760)"><LinerEnd s={2.1} rot={66} sponsons={1} /></g>
      <rect x={0} y={700} width={1920} height={380} fill="#2f6f99" opacity={0.86} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${760 + i * 80} ${560 - i * 60} Q 900 900 ${1200 + i * 120} 1080`} stroke="#2a2d33" strokeWidth={14} strokeDasharray="22 10" fill="none" />)}
      <Guy x={1620} y={930} s={0.85} t={10} id="tca" blink={false} pose={POSES.handsHead} face={FACES.shocked} handL="open" handR="open" />
      <WorkBoat x={1620} y={870} />
    </Svg>
    <Big text="$2 BILLION" color="#ffd23f" size={220} x={60} y={30} rot={-5} />
  </AbsoluteFill>
);

// B: "HOW?": the underwater cross-section, the ship half rolled up on the platforms
const CB: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <g transform="translate(-200 -70) scale(1.15)"><Parb t={0} a={34} bags={1} plats={1} spL={1} chains={1} fill={0.5} /></g>
      <Guy x={1640} y={545} s={0.8} t={10} id="tcb" blink={false} pose={POSES.handsHead} face={FACES.amazed} handL="open" handR="open" />
      <WorkBoat x={1640} y={495} s={0.85} />
    </Svg>
    <Big text="HOW?" color="#ffffff" size={260} x={1180} y={560} rot={-6} />
  </AbsoluteFill>
);

// C: "TOO CLOSE": the lit cruise ship at night sliding past dark rocks
const CC: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <rect width={1920} height={1080} fill="#0d1a33" />
      {Array.from({ length: 60 }).map((_, i) => <circle key={i} cx={(i * 337) % 1920} cy={(i * 191) % 520} r={2 + (i % 3)} fill="#fff" opacity={0.6} />)}
      <rect x={0} y={700} width={1920} height={380} fill="#0f2440" />
      <g transform="translate(80 720)"><Liner L={1500} night={1} name={false} /></g>
      <path d="M1380 720 L 1460 640 L 1520 690 L 1600 600 L 1700 680 L 1800 620 L 1920 720 Z" fill="#1a1c20" stroke={INK} strokeWidth={8} />
      <path d="M1300 650 Q 1450 560 1560 600" stroke="#e8352b" strokeWidth={14} fill="none" strokeDasharray="30 16" />
    </Svg>
    <Big text="TOO CLOSE" color="#ff5a4a" size={210} x={80} y={40} rot={-4} />
  </AbsoluteFill>
);

export const COSTA_THUMBS: Record<string, React.FC> = { CA, CB, CC };
