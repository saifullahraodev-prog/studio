// The Ship Guy: thumbnails (drawn at 1920x1080, exported as 1280x720 JPG).
// Rules from the channel review: the SHIP is the hero, max 3 words, one strong colour contrast,
// stick figure small or absent, a different layout from the old "shocked guy + yellow text" template.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Boom, Flames, INK, Jet, Sea, Sky, Smoke, Stickman, Tanker, Towers, Waterline } from "./art";
import { fontFamily, Svg } from "./scenes";

const Big: React.FC<{ lines: { text: string; color: string; size: number }[]; x: number; y: number; rot?: number; align?: "left" | "right" | "center" }> = ({ lines, x, y, rot = -4, align = "left" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, textAlign: align, lineHeight: 0.92 }}>
    {lines.map((l, i) => (
      <div key={i} style={{ fontFamily, fontWeight: 700, fontSize: l.size, color: l.color, WebkitTextStroke: `${l.size * 0.16}px ${INK}`, paintOrder: "stroke fill", textShadow: `0 ${l.size * 0.08}px 0 ${INK}`, letterSpacing: 2 }}>{l.text}</div>
    ))}
  </div>
);

// A: the giant on fire, filling the frame, a tiny tug for scale. "TOO BIG"
const ThumbA: React.FC = () => {
  const t = 40;
  const sc = 1.75, x = -40, deckY = 640;
  return (
    <AbsoluteFill>
      <Svg>
        <Sky mood="dusk" horizon={600} />
        <Sea mood="dusk" horizon={600} t={t} />
        <Smoke x={1000} y={620} t={t} size={1.3} lean={-1} />
        <Smoke x={700} y={620} t={t + 80} size={1.1} lean={-1} />
        <g transform={`translate(${x} ${deckY}) scale(${sc})`}><Tanker /></g>
        <Flames x={560} y={deckY - 14} width={900} height={230} t={t} seed={4} />
        <Waterline x={x} y={deckY + 86 * (sc / 1.2) * 0.95} width={1015 * sc} mood="dusk" t={t} horizon={600} />
        <Flames x={380} y={deckY + 140} width={1200} height={110} t={t} seed={9} />
        {/* tiny tug for scale */}
        <g transform="translate(1720 905) scale(0.55)">
          <path d="M-80 0 L80 0 L60 34 L-70 34 Z" fill="#d94a3a" stroke={INK} strokeWidth={6} />
          <rect x={-40} y={-40} width={60} height={40} fill="#f4f1e8" stroke={INK} strokeWidth={6} />
        </g>
      </Svg>
      <Big x={1240} y={30} rot={4} lines={[{ text: "TOO", color: "#ffffff", size: 250 }, { text: "BIG", color: "#ffd23f", size: 330 }]} />
    </AbsoluteFill>
  );
};

// B: the ship stood on its end next to the Petronas Towers. "458 m SHIP"
const ThumbB: React.FC = () => {
  const ground = 1040, shipLen = 960, sc = shipLen / 1012;
  return (
    <AbsoluteFill>
      <Svg>
        <Sky mood="day" horizon={ground} />
        <rect x={0} y={ground} width={1920} height={40} fill="#7fae5a" />
        <Towers x={1530} ground={ground} height={(452 / 458) * shipLen} />
        <g transform={`translate(1130 ${ground}) rotate(-90) scale(${sc}) translate(0 -130)`}><Tanker /></g>
        {/* arrow from the text to the ship */}
        <path d="M720 610 Q 900 640 1000 520" fill="none" stroke={INK} strokeWidth={34} strokeLinecap="round" />
        <path d="M720 610 Q 900 640 1000 520" fill="none" stroke="#ffd23f" strokeWidth={18} strokeLinecap="round" />
        <path d="M960 500 L1030 490 L1010 560 Z" fill="#ffd23f" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      </Svg>
      <Big x={60} y={150} rot={-3} lines={[{ text: "A SHIP", color: "#ffffff", size: 190 }, { text: "THIS", color: "#ffd23f", size: 260 }, { text: "TALL?", color: "#ffffff", size: 200 }]} />
    </AbsoluteFill>
  );
};

// C: the missile strike, explosion as the hero, small shocked figure. "BOMBED!"
const ThumbC: React.FC = () => {
  const t = 52;
  const sc = 1.45, x = 120, deckY = 660;
  const hitX = x + 640 * sc, hitY = deckY + 40;
  return (
    <AbsoluteFill>
      <Svg>
        <Sky mood="dusk" horizon={620} />
        <Sea mood="dusk" horizon={620} t={t} />
        <Smoke x={hitX - 40} y={deckY - 30} t={t} size={1.4} lean={-1} />
        <g transform={`translate(${x} ${deckY}) scale(${sc})`}><Tanker /></g>
        <Flames x={hitX - 360} y={deckY - 14} width={560} height={170} t={t} seed={2} />
        <Waterline x={x} y={deckY + 86 * (sc / 1.2) * 0.97} width={1015 * sc} mood="dusk" t={t} horizon={620} />
        <path d={`M100 180 Q ${(100 + hitX) / 2} 120 ${hitX} ${hitY}`} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={30} strokeLinecap="round" />
        <g transform="translate(-30 150) scale(1.6)"><Jet /></g>
        <Boom x={hitX} y={hitY} r={300} p={1} seed={2} />
      </Svg>
      <Stickman pose="shocked-2" x={1560} y={1100} height={430} />
      <Big x={820} y={50} rot={4} lines={[{ text: "BOMBED!", color: "#ffd23f", size: 215 }]} />
    </AbsoluteFill>
  );
};

export const ShipGuyThumb: React.FC<{ v: string }> = ({ v }) => (v === "B" ? <ThumbB /> : v === "C" ? <ThumbC /> : <ThumbA />);
