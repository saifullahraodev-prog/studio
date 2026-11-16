// The Ship Guy: thumbnails for "The Tiny Mistake That Brought Down a Bridge" (Dali, video #5).
// Same rules as the Ever Given v3 thumbnails the owner liked: flat video style, one clear subject,
// a big emotional Ship Guy face, 1-2 words, strong colour contrast, readable at phone size.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK } from "./art";
import { FACES, Guy, POSES } from "./guy";
import { fontFamily, Svg } from "./scenes";
import { DaliSide, KeyBridge, NightSky, River } from "./templates5";

const Big: React.FC<{ text: string; color: string; size: number; x: number; y: number; rot?: number }> = ({ text, color, size, x, y, rot = -4 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, whiteSpace: "nowrap", lineHeight: 0.92 }}>
    <span style={{ fontFamily, fontWeight: 700, fontSize: size, color, WebkitTextStroke: `${size * 0.16}px ${INK}`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.08}px 0 ${INK}`, letterSpacing: 2 }}>{text}</span>
  </div>
);

// the tiny plastic label, drawn huge inside a circle
const LabelInset: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#fff" stroke={INK} strokeWidth={12} />
    <circle r={r} fill="none" stroke="#ffd23f" strokeWidth={10} strokeDasharray="26 18" />
    <rect x={-r * 0.62} y={-r * 0.1} width={r * 1.24} height={r * 0.2} rx={r * 0.08} fill="#e8352b" stroke={INK} strokeWidth={8} />
    <rect x={-r * 0.24} y={-r * 0.2} width={r * 0.46} height={r * 0.4} rx={r * 0.06} fill="#fbfaf4" stroke={INK} strokeWidth={8} />
  </g>
);

// A: "THIS?!" the collapsed bridge at night + the tiny label + the shocked Ship Guy pointing at it
const DA: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <NightSky t={20} />
      <KeyBridge t={20} k={0.75} lights />
      <River t={20} y={760} />
      <DaliSide x={-260} y={790} w={900} lightsOn={false} />
      <LabelInset x={1380} y={430} r={250} />
      <path d="M1180 640 Q 1060 760 900 800" stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d="M1180 640 Q 1060 760 900 800" stroke="#ffd23f" strokeWidth={16} fill="none" strokeLinecap="round" />
      <Guy x={760} y={1160} s={0.95} t={10} id="tda" blink={false} pose={POSES.handsHead} face={FACES.shocked} handL="open" handR="open" />
    </Svg>
    <Big text="THIS?!" color="#ffd23f" size={230} x={1130} y={730} rot={-6} />
  </AbsoluteFill>
);

// B: "NO POWER" the dark ship gliding at the lit bridge, Ship Guy big and scared
const DB: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <NightSky t={20} />
      <KeyBridge t={20} lights />
      <River t={20} y={760} />
      <DaliSide x={60} y={790} w={1150} lightsOn={false} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${1250 + i * 40} 700 l 70 0`} stroke="#9fb8d0" strokeWidth={10} strokeLinecap="round" opacity={0.7} />)}
      <Guy x={1600} y={1150} s={1.0} t={10} id="tdb" blink={false} pose={POSES.handsHead} face={FACES.scared} handL="open" handR="open" />
    </Svg>
    <Big text="NO POWER" color="#ffffff" size={190} x={70} y={40} rot={-4} />
  </AbsoluteFill>
);

// C: "4 MINUTES" the bridge falling, Ship Guy holding the tiny label
const DC: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <NightSky t={20} />
      <KeyBridge t={20} k={0.62} lights />
      <River t={20} y={760} />
      <DaliSide x={-180} y={790} w={760} lightsOn={false} />
      <Guy x={1560} y={1170} s={1.05} t={10} id="tdc" blink={false} pose={POSES.handsHead} face={FACES.shocked} handL="open" handR="open" />
    </Svg>
    <Big text="4 MINUTES" color="#ffd23f" size={200} x={80} y={40} rot={-4} />
  </AbsoluteFill>
);

export const DALI_THUMBS: Record<string, React.FC> = { DA, DB, DC };
