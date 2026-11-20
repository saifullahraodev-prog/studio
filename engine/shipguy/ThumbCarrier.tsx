// The Ship Guy: thumbnails for "How an Aircraft Carrier Actually Works" (video #6).
// Same rules as the Dali / Ever Given thumbnails: flat video style, one clear subject, a big emotional Ship Guy face,
// 1-2 words, strong colour contrast, readable at phone size.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK } from "./art";
import { FACES, Guy, IDLE, POSES } from "./guy";
import { fontFamily, Svg } from "./scenes";
import { NightSky, rnd } from "./templates5";
import { DECK_N, Fighter, OpenSea } from "./templates6";

const Big: React.FC<{ text: string; color: string; size: number; x: number; y: number; rot?: number }> = ({ text, color, size, x, y, rot = -4 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, whiteSpace: "nowrap", lineHeight: 0.92 }}>
    <span style={{ fontFamily, fontWeight: 700, fontSize: size, color, WebkitTextStroke: `${size * 0.16}px ${INK}`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.08}px 0 ${INK}`, letterSpacing: 2 }}>{text}</span>
  </div>
);

const NightDeck: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <NightSky t={20} />
    <OpenSea t={20} y={y + 90} night />
    <rect x={0} y={y} width={1920} height={90} fill={DECK_N} stroke={INK} strokeWidth={8} />
    {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={60 + i * 165} cy={y + 12} r={7} fill="#ffd27a" />)}
  </g>
);
const Sparks: React.FC<{ x: number; y: number; n?: number; s?: number }> = ({ x, y, n = 16, s = 1 }) => (
  <g>{Array.from({ length: n }).map((_, i) => <line key={i} x1={x} y1={y} x2={x - (40 + rnd(i) * 160) * s} y2={y - (20 + rnd(i + 7) * 140) * s} stroke="#ffd23f" strokeWidth={8} strokeLinecap="round" />)}</g>
);

// A: "2 SECONDS" the jet slamming down, hook on the wire (sparks), the Ship Guy shocked
const CA: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <NightDeck y={800} />
      <path d="M380 790 L 600 800 L 820 790" stroke={INK} strokeWidth={22} fill="none" />
      <path d="M380 790 L 600 800 L 820 790" stroke="#ffd23f" strokeWidth={12} fill="none" />
      <g transform="translate(980 790) scale(3)"><Fighter gear hook flame={1} /></g>
      <Sparks x={600} y={796} n={18} s={1.4} />
      <Guy x={1640} y={1180} s={1.05} t={10} id="tca" blink={false} pose={POSES.handsHead} face={FACES.shocked} handL="open" handR="open" />
    </Svg>
    <Big text="2 SECONDS" color="#ffd23f" size={210} x={60} y={30} rot={-4} />
  </AbsoluteFill>
);

// B: "FULL POWER?!" the Ship Guy as the pilot, huge and panicking, the jet landing behind him
const CB: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <NightDeck y={820} />
      <g transform="translate(560 800) scale(2.2) rotate(-4)"><Fighter gear hook flame={1} /></g>
      <Guy x={1500} y={1260} s={1.35} t={10} id="tcb" outfit="aviator" blink={false} pose={POSES.handsHead} face={FACES.shocked} handL="open" handR="open" />
    </Svg>
    <Big text="FULL POWER?!" color="#ffffff" size={170} x={50} y={40} rot={-4} />
  </AbsoluteFill>
);

// C: "STOP IT!" the Ship Guy hanging on to the jet's tailhook, heels dug in, sparks flying
const CC: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <NightDeck y={820} />
      <g transform="translate(1300 810) scale(2.6)"><Fighter gear hook flame={0.6} /></g>
      <path d="M744 806 L 686 632" stroke={INK} strokeWidth={20} strokeLinecap="round" />
      <path d="M744 806 L 686 632" stroke="#c7cdd3" strokeWidth={10} strokeLinecap="round" />
      <Sparks x={420} y={818} n={14} s={-0.8} />
      <Guy x={420} y={830} s={0.95} t={10} id="tcc" blink={false} pose={{ ...IDLE, lean: -28, hipY: 10, armL: [92, 6], armR: [86, 10], legL: [-38, 16], legR: [-12, 24], tilt: -6 }} face={{ eyes: "wide", brows: "worried", mouth: "teeth" }} handL="mitt" handR="mitt" emote="sweat" emoteT={10} />
    </Svg>
    <Big text="STOP IT!" color="#ffd23f" size={220} x={980} y={60} rot={-5} />
  </AbsoluteFill>
);

export const CARRIER_THUMBS: Record<string, React.FC> = { CA, CB, CC };
