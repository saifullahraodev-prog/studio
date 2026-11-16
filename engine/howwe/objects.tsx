// How We Ended Up · object library ("exhibits"). Draw once, reuse forever.
// Every entry knows its own top/bottom (in its local units) so <Exhibit> can stand it ON the plinth top.
// Rule: every object must be drawn from a documented reference before it is used in a real video (log it in the video folder).
import React from "react";
import { Bowl, Chopsticks, Fork, Ink, Knife, Plate } from "./lab";
import { PlasterHand, T } from "./kit";
import { easeBack, prog, TIMING } from "./motion";

export const INK: Ink = { line: T.line, lw: 3.5, plate: "#FBFAF6", rim: "#E7E3D8", food1: "#8B4A2B", food2: "#5E7F33", metal: "#D6DBE1", wood: "#9C6233", bowl: "#B8432F", rice: "#FFFDF7" };
const st = { stroke: T.line, strokeWidth: 3.5, strokeLinejoin: "round" as const };

const Spoon: React.FC = () => (
  <g {...st}>
    <path d="M-9 20 L-11 330 Q0 348 11 330 L9 20 Z" fill={INK.metal} />
    <ellipse cx={0} cy={-40} rx={46} ry={68} fill={INK.metal} />
    <ellipse cx={-8} cy={-52} rx={20} ry={36} fill="#EEF1F4" stroke="none" />
  </g>
);
/** Two-pronged golden table fork (Byzantine style, c. 11th century; drawn from the "two-pronged golden fork" accounts). */
const Fork2: React.FC = () => (
  <g {...st}>
    <path d="M-12 40 L-14 330 Q0 350 14 330 L12 40 Z" fill="#D9B45A" />
    {[90, 170, 250].map((y) => <rect key={y} x={-16} y={y} width={32} height={10} rx={4} fill="#B8913A" />)}
    <path d="M-30 -110 L-30 0 Q-30 42 0 46 Q30 42 30 0 L30 -110 L18 -110 L16 -4 L-16 -4 L-18 -110 Z" fill="#E4C26A" />
  </g>
);
/** Three-tined table fork (early 18th century step between two and four tines). */
const Fork3: React.FC = () => (
  <g {...st}>
    <path d="M-10 60 L-12 330 Q0 350 12 330 L10 60 Z" fill={INK.metal} />
    <path d="M-32 -90 L-32 20 Q-32 62 0 66 Q32 62 32 20 L32 -90 L21 -90 L19 16 L6 16 L5 -90 L-5 -90 L-6 16 L-19 16 L-21 -90 Z" fill={INK.metal} />
  </g>
);
/** Round-tipped table knife (the blunt dinner knife). */
const KnifeRound: React.FC = () => (
  <g {...st}>
    <path d="M-12 70 L-13 330 Q0 348 13 330 L12 70 Z" fill={INK.metal} />
    <path d="M-14 70 L-16 -60 Q-16 -100 2 -100 Q20 -100 18 -60 L14 70 Z" fill={INK.metal} />
  </g>
);
/** Bowl of long pasta with a fork twirl (the "pasta" explanation for Italy keeping the fork). */
const Pasta: React.FC = () => (
  <g {...st}>
    <path d="M-220 -40 L220 -40 Q210 110 0 130 Q-210 110 -220 -40 Z" fill="#F4EFE4" />
    <path d="M-190 -40 Q-170 -120 0 -125 Q170 -120 190 -40 Z" fill="#E9C77B" />
    {[-120, -60, 0, 60, 120].map((x, i) => <path key={i} d={`M${x - 50} -50 Q${x} ${-110 + (i % 2) * 20} ${x + 50} -60`} fill="none" stroke="#C9A24A" strokeWidth={6} />)}
    <path d="M-30 -80 Q0 -100 30 -80" fill="none" stroke="#B8432F" strokeWidth={10} />
  </g>
);
/** Round flatbread (generic stand-in for injera / naan until drawn from a reference). */
const Flatbread: React.FC = () => (
  <g {...st}>
    <ellipse cx={0} cy={0} rx={230} ry={120} fill="#D9B48A" />
    {Array.from({ length: 26 }).map((_, i) => <circle key={i} cx={-170 + (i * 67) % 340} cy={-70 + ((i * 37) % 140)} r={7} fill="#B98E62" stroke="none" />)}
  </g>
);
const Teacup: React.FC = () => (
  <g {...st}>
    <ellipse cx={0} cy={110} rx={170} ry={34} fill={INK.plate} />
    <path d="M-120 -40 L120 -40 Q112 90 0 100 Q-112 90 -120 -40 Z" fill="#F4EFE4" />
    <path d="M118 -10 Q190 -10 180 40 Q170 80 104 60" fill="none" strokeWidth={14} stroke={T.line} />
    <path d="M118 -10 Q190 -10 180 40 Q170 80 104 60" fill="none" strokeWidth={7} stroke="#F4EFE4" />
    <ellipse cx={0} cy={-40} rx={120} ry={24} fill="#8A5A2E" />
  </g>
);
const Cleaver: React.FC = () => (
  <g {...st}>
    <rect x={-16} y={120} width={32} height={180} rx={8} fill="#5A3A22" />
    <path d="M-90 -160 L90 -160 L90 120 L-90 120 Z" fill={INK.metal} />
    <circle cx={60} cy={-120} r={14} fill="#FBF8F2" />
  </g>
);
const Bread: React.FC = () => (
  <g {...st}>
    <path d="M-170 60 Q-180 -60 0 -70 Q180 -60 170 60 Z" fill="#C99A5B" />
    {[-90, -30, 30, 90].map((x) => <path key={x} d={`M${x - 20} -40 L${x + 20} 0`} fill="none" stroke="#8E6230" strokeWidth={5} />)}
  </g>
);

type Entry = { name: string; top: number; bottom: number; draw: React.FC };
/** Object registry. Units are the drawing's own; <Exhibit s> scales them. */
export const OBJECTS: Record<string, Entry> = {
  fork: { name: "Fork", top: -80, bottom: 350, draw: () => <Fork x={0} y={0} ink={INK} /> },
  fork2: { name: "Golden fork", top: -110, bottom: 350, draw: Fork2 },
  fork3: { name: "Three-tined fork", top: -90, bottom: 350, draw: Fork3 },
  knifeRound: { name: "Round-tipped knife", top: -100, bottom: 348, draw: KnifeRound },
  pasta: { name: "Pasta", top: -125, bottom: 130, draw: Pasta },
  flatbread: { name: "Flatbread", top: -120, bottom: 120, draw: Flatbread },
  knife: { name: "Knife", top: -100, bottom: 348, draw: () => <Knife x={0} y={0} ink={INK} /> },
  spoon: { name: "Spoon", top: -110, bottom: 348, draw: Spoon },
  chopsticks: { name: "Chopsticks", top: -232, bottom: 232, draw: () => <Chopsticks x={0} y={0} rot={6} ink={INK} /> },
  plate: { name: "Plate", top: -150, bottom: 150, draw: () => <Plate x={0} y={0} ink={INK} /> },
  bowl: { name: "Bowl", top: -150, bottom: 160, draw: () => <Bowl x={0} y={0} ink={INK} /> },
  hand: { name: "The Hand", top: -182, bottom: 198, draw: () => <PlasterHand x={0} y={0} /> },
  teacup: { name: "Teacup", top: -64, bottom: 144, draw: Teacup },
  cleaver: { name: "Cleaver", top: -160, bottom: 300, draw: Cleaver },
  bread: { name: "Bread", top: -70, bottom: 60, draw: Bread },
};
export type ObjectId = keyof typeof OBJECTS;

/**
 * An exhibit standing on a plinth top at `plinthTop`. `h` = on-screen height in px.
 * `f`/`start` animate the TIMING.rise entrance (rise from the plinth with a small overshoot).
 */
export const Exhibit: React.FC<{ id: ObjectId; x: number; plinthTop: number; h: number; f?: number; start?: number; gap?: number }> = ({
  id, x, plinthTop, h, f, start = 0, gap = 6,
}) => {
  const o = OBJECTS[id];
  const s = h / (o.bottom - o.top);
  const r = f === undefined ? 1 : easeBack(prog(f, start, TIMING.rise));
  const D = o.draw;
  if (r <= 0) {
    const yg = plinthTop - gap - o.bottom * s;
    return <g opacity={0.13} transform={`translate(${x} ${yg}) scale(${s})`}><D /></g>;
  }
  const y = plinthTop - gap - o.bottom * s + (1 - r) * 60;
  return (
    <g opacity={Math.min(1, r * 1.6)} transform={`translate(${x} ${y}) scale(${s})`}>
      <D />
    </g>
  );
};
