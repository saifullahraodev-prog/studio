// The Ship Guy: thumbnails for "Every Level of Ship by Cost" (video #4). Keys used by ShipGuyThumb: cost1..cost3.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, Sea, Sky, Waterline } from "./art";
import { fontFamily, Svg } from "./scenes";
import { BoxShipHD, CarrierHD, JonHD, YachtHD } from "./ships_hd";
import { Actor } from "./templates3";

const Big: React.FC<{ x: number; y: number; size: number; color?: string; rot?: number; children: React.ReactNode }> = ({ x, y, size, color = "#fff", rot = 0, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, fontFamily, fontWeight: 700, fontSize: size, color, lineHeight: 0.95,
    WebkitTextStroke: `${size * 0.16}px ${INK}`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.08}px 0 ${INK}` }}>{children}</div>
);
const Tag: React.FC<{ x: number; y: number; text: string; fs: number; rot?: number; col?: string }> = ({ x, y, text, fs, rot = 0, col = "#ffd23f" }) => {
  const wd = text.length * fs * 0.62 + 140;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <line x1={0} y1={-200} x2={0} y2={-10} stroke={INK} strokeWidth={8} />
      <path d={`M${-wd / 2} 0 L${wd / 2 - 70} 0 L${wd / 2} ${fs * 0.75} L${wd / 2 - 70} ${fs * 1.5} L${-wd / 2} ${fs * 1.5} Z`} fill={col} stroke={INK} strokeWidth={12} strokeLinejoin="round" />
      <circle cx={wd / 2 - 80} cy={fs * 0.4} r={16} fill="#fff" stroke={INK} strokeWidth={6} />
      <text x={-30} y={fs * 1.08} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={fs} fill={INK}>{text}</text>
    </g>
  );
};

// cost1: tiny $2,000 boat vs giant $13B carrier
const Cost1: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Sky mood="day" horizon={660} /><Sea mood="day" horizon={660} t={10} />
      <g transform="translate(560 820)"><CarrierHD w={1380} /></g>
      <Waterline x={560} y={836} width={1390} mood="day" t={10} horizon={660} />
      <g transform="translate(70 900)"><JonHD w={330} /></g>
      <Waterline x={50} y={906} width={380} mood="day" t={14} horizon={660} />
      <Tag x={330} y={600} text="$2,000" fs={110} rot={-6} />
      <Tag x={1250} y={250} text="$13 BILLION" fs={130} rot={4} />
    </Svg>
  </AbsoluteFill>
);

// cost2: the yacht outweighs two container ships on a balance
const Cost2: React.FC = () => (
  <AbsoluteFill style={{ background: "#1f3a5f" }}>
    <Svg>
      <g transform="translate(960 540)" opacity={0.14}>{Array.from({ length: 16 }).map((_, i) => <path key={i} d="M0 0 L1400 -140 L1400 140 Z" fill="#fff" transform={`rotate(${i * 22.5})`} />)}</g>
      <rect x={940} y={470} width={40} height={560} fill="#8d969e" stroke={INK} strokeWidth={8} />
      <g transform="translate(960 470) rotate(-10)">
        <rect x={-820} y={-16} width={1640} height={32} rx={16} fill="#b9c2ca" stroke={INK} strokeWidth={8} />
        <g transform="translate(-720 0) rotate(10)">
          <line x1={-200} y1={300} x2={0} y2={0} stroke={INK} strokeWidth={6} /><line x1={200} y1={300} x2={0} y2={0} stroke={INK} strokeWidth={6} />
          <path d="M-260 300 L260 300 L210 350 L-210 350 Z" fill="#c9d2dc" stroke={INK} strokeWidth={8} />
          <g transform="translate(-230 296)"><YachtHD w={460} /></g>
        </g>
        <g transform="translate(720 0) rotate(10)">
          <line x1={-200} y1={300} x2={0} y2={0} stroke={INK} strokeWidth={6} /><line x1={200} y1={300} x2={0} y2={0} stroke={INK} strokeWidth={6} />
          <path d="M-260 300 L260 300 L210 350 L-210 350 Z" fill="#c9d2dc" stroke={INK} strokeWidth={8} />
          <g transform="translate(-240 290)"><BoxShipHD w={480} /></g>
          <g transform="translate(-240 190)"><BoxShipHD w={480} /></g>
        </g>
      </g>
    </Svg>
    <Big x={60} y={40} size={150} color="#ffd23f" rot={-3}>$600M YACHT</Big>
    <Big x={1060} y={870} size={110} rot={-3}>&gt; 2 CARGO SHIPS</Big>
  </AbsoluteFill>
);

// cost3: shocked Ship Guy + carrier + the price
const Cost3: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Sky mood="dusk" horizon={700} /><Sea mood="dusk" horizon={700} t={10} />
      <g transform="translate(480 860)"><CarrierHD w={1400} /></g>
      <Waterline x={480} y={876} width={1410} mood="dusk" t={10} horizon={700} />
      <Actor a="shock" t={30} x={300} y={1060} s={1.05} id="th3" />
      <Tag x={1250} y={300} text="$13,000,000,000" fs={104} rot={3} />
    </Svg>
    <Big x={660} y={500} size={96} rot={-2}>MOST EXPENSIVE SHIP</Big>
  </AbsoluteFill>
);

export const COST_THUMBS: Record<string, React.FC> = { cost1: Cost1, cost2: Cost2, cost3: Cost3 };
