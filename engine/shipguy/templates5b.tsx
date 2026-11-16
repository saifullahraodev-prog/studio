// The Ship Guy: Dali / Key Bridge graphics + diagram templates (video #5). See templates5.tsx.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, Guy, IDLE, breathe } from "./guy";
import { fontFamily, ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, BOX, T3, WATER, clamp01, pop } from "./templates3";
import { DaliSide, DaliTop, DeckCrew, KeyBridge, LAMP, NIGHT1, NightSky, NWATER, RED, River, TrussPiece, YEL, rnd } from "./templates5";

const NAVY = "#1f3a5f", PAPER5 = "#f3f1ea";
const Num: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; color?: string; anchor?: "start" | "middle" | "end" }> = ({ x, y, size, children, color = INK, anchor = "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={fontFamily} fontWeight={700} fontSize={size} fill={color}>{children}</text>
);
const Card: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; children?: React.ReactNode }> = ({ x, y, w, h, fill = "#fff", children }) => (
  <g transform={`translate(${x} ${y})`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={24} fill={fill} stroke={INK} strokeWidth={8} />{children}</g>
);
const Rays: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(${W / 2} ${H / 2}) rotate(${t * 0.12})`} opacity={0.08}>
    {Array.from({ length: 16 }).map((_, i) => <path key={i} d="M0 0 L1400 -140 L1400 140 Z" fill="#fff" transform={`rotate(${i * 22.5})`} />)}
  </g>
);
const Ink = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// ================================================================== POWER: the ship as a floating power station
const PowerT: Tpl = ({ t, d, p, w }) => {
  const step = p.step ?? "station";
  const off = ["off", "engine", "prop"].includes(step);
  const lit = (part: string) => !off && (step === "all" || step === "station" || step === "gens" ? true : step === part || (step === "pumps" && part === "pumps") || (step === "cool" && part === "pumps"));
  const sx = 120, sy = 760, sw = 1680, s = sw / 1000;
  const gen = { x: sx + 150 * s, y: sy - 20 * s };
  const parts: Record<string, [number, number, string]> = {
    steer: [sx + 14 * s, sy + 20 * s, "RUDDER"], lights: [sx + 700 * s, sy - 262 * s, "LIGHTS"], radio: [sx + 668 * s, sy - 300 * s, "RADIO"], pumps: [sx + 230 * s, sy - 10 * s, "PUMPS"],
  };
  const flow = (x2: number, y2: number, on: boolean, i: number) => (
    <g key={i}>
      <path d={`M${gen.x} ${gen.y} Q ${(gen.x + x2) / 2} ${Math.min(gen.y, y2) - 120} ${x2} ${y2}`} stroke={on ? YEL : "#3d4756"} strokeWidth={on ? 10 : 6} fill="none" strokeDasharray={on ? "20 14" : undefined} strokeDashoffset={-t * 4} />
    </g>
  );
  const engineDie = step === "engine" ? 1 - ramp(t, 4, d * 0.6) : step === "prop" ? 0 : 1;
  const propSpin = step === "prop" ? (1 - ramp(t, 0, d * 0.8)) : off ? 0 : 1;
  return (
    <AbsoluteFill style={{ background: off ? "#16202e" : "#dfe9f0" }}>
      <Svg>
        <River t={t} y={sy} night={off} />
        <DaliSide x={sx} y={sy} w={sw} lightsOn={!off} dark={off} />
        {/* engine-room window cut into the hull */}
        <rect x={sx + 110 * s} y={sy - 60 * s} width={240 * s} height={90 * s} rx={12} fill={off ? "#0b0f16" : "#e8eef2"} stroke={INK} strokeWidth={6} />
        <rect x={gen.x - 50} y={gen.y - 40} width={100} height={70} rx={10} fill={off ? "#333" : "#3a73b8"} stroke={INK} strokeWidth={5} />
        <Num x={gen.x} y={gen.y + 8} size={22} color="#fff">GEN</Num>
        {!off && <circle cx={gen.x} cy={gen.y} r={70 + Math.sin(t * 0.3) * 6} fill={YEL} opacity={0.22} />}
        {Object.entries(parts).map(([k, [x, y, label]], i) => (
          <g key={k}>
            {flow(x, y, lit(k), i)}
            <circle cx={x} cy={y} r={16} fill={lit(k) ? YEL : "#3d4756"} stroke={INK} strokeWidth={4} />
            {(step === k || step === "all" || (step === "cool" && k === "pumps")) && <T3 x={x} y={y - 34} size={42} color={YEL}>{label}</T3>}
          </g>
        ))}
        {/* cooling water loop */}
        {(step === "cool" || step === "off") && <path d={`M${gen.x + 140} ${gen.y - 10} q 60 -60 120 0 q -60 60 -120 0`} stroke={step === "off" ? "#3d4756" : "#4fb3e8"} strokeWidth={10} fill="none" strokeDasharray="16 10" strokeDashoffset={step === "off" ? 0 : -t * 3} />}
        {/* engine gauge */}
        {(step === "engine" || step === "pumps") && (
          <g transform="translate(1500 300)">
            <circle r={110} fill="#fbfaf4" stroke={INK} strokeWidth={8} />
            <line x1={0} y1={0} x2={Math.cos(Math.PI + engineDie * 2.6) * 86} y2={Math.sin(Math.PI + engineDie * 2.6) * 86} stroke={RED} strokeWidth={12} strokeLinecap="round" />
            <Num x={0} y={70} size={30}>ENGINE</Num>
          </g>
        )}
        {/* propeller */}
        <g transform={`translate(${sx - 10} ${sy + 30 * s})`}><g transform={`rotate(${t * 22 * propSpin})`}><path d="M0 -40 L 10 0 L 0 40 L -10 0 Z M-40 0 L 0 10 L 40 0 L 0 -10 Z" fill="#c9a84a" stroke={INK} strokeWidth={4} /></g></g>
        {step === "station" && <Actor a="talk" t={t} x={1720} y={1060} s={0.5} w={w} id="pw" />}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== WIRE: the terminal block and the tiny label
const Terminal: React.FC<{ x: number; y: number; half?: number; bad?: boolean; loose?: number; t: number; color?: string }> = ({ x, y, half = 0, bad, loose = 0, t, color = "#c94a3a" }) => {
  const wig = loose > 0 ? Math.sin(t * 1.3) * 6 * loose : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-46} y={-120} width={92} height={240} rx={8} fill="#7d8790" stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={-70} r={18} fill="#c7ccd1" stroke={INK} strokeWidth={4} /><line x1={-12} y1={-70} x2={12} y2={-70} stroke={INK} strokeWidth={4} />
      <rect x={-22} y={-30} width={44} height={60} fill="#22262c" stroke={INK} strokeWidth={4} />
      {/* wire comes from below into the slot */}
      <g transform={`translate(${wig} ${half * 60 + loose * 20})`}>
        <rect x={-9} y={-10} width={18} height={50} fill="#c99b4a" stroke={INK} strokeWidth={3} />
        <rect x={-14} y={36} width={28} height={300} rx={8} fill={color} stroke={INK} strokeWidth={4} />
        <rect x={-18} y={bad ? 30 : 140} width={36} height={34} rx={6} fill="#fbfaf4" stroke={INK} strokeWidth={4} />
        <text x={0} y={bad ? 54 : 164} textAnchor="middle" fontSize={16} fontWeight={700} fill={INK}>381</text>
      </g>
    </g>
  );
};
const WireT: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "block";
  if (st === "hero" || st === "hero2") {
    return (
      <AbsoluteFill style={{ background: PAPER5 }}>
        <Svg>
          <Actor a={st === "hero2" ? "sad" : "pinch"} t={t} x={720} y={1060} s={1.1} w={w} id="hero" over={st === "hero2" ? { prop: "label", pose: breathe({ ...IDLE, armR: [70, 95], tilt: 8 }, t) } : undefined} />
          <g transform={`translate(1380 480) scale(${pop(t, 8)})`}>
            <circle r={270} fill="#fff" stroke={INK} strokeWidth={10} />
            <circle r={270} fill="none" stroke={YEL} strokeWidth={8} strokeDasharray="20 14" />
            {/* a wire coming in from the left, its copper tip, and the little white label sleeve */}
            <rect x={-260} y={-22} width={300} height={44} rx={20} fill={RED} stroke={INK} strokeWidth={6} />
            <rect x={36} y={-12} width={70} height={24} rx={6} fill="#c99b4a" stroke={INK} strokeWidth={5} />
            <rect x={-30} y={-36} width={62} height={72} rx={10} fill="#fbfaf4" stroke={INK} strokeWidth={6} />
            <Num x={1} y={10} size={26}>381</Num>
            {/* a fingertip for size */}
            <path d="M-170 270 L -170 120 Q -170 60 -110 60 Q -50 60 -50 120 L -50 270 Z" fill="#f2c9a0" stroke={INK} strokeWidth={6} />
            <path d="M-150 90 Q -110 70 -70 90 L -72 120 Q -110 104 -148 120 Z" fill="#fbe7d6" stroke={INK} strokeWidth={4} />
            {st === "hero2" && <T3 x={0} y={340} size={46} color={RED}>+ manual switch + wrong pump</T3>}
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "zoom") {
    const z = 1 + ramp(t, 4, d - 4) * 3.5;
    return (
      <AbsoluteFill style={{ background: "#dfe9f0" }}>
        <Svg>
          <g transform={`translate(960 600) scale(${z}) translate(${-960 + (960 - 450) * ((z - 1) / 3.5)} ${-600 + (600 - 630) * ((z - 1) / 3.5)})`}>
            <River t={t} y={760} night={false} />
            <DaliSide x={160} y={760} w={1600} lightsOn={false} />
            <rect x={300} y={560} width={300} height={140} rx={14} fill="#e8eef2" stroke={INK} strokeWidth={6} />
            {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={320 + i * 46} y={580} width={36} height={100} fill="#7d8790" stroke={INK} strokeWidth={3} />)}
            <circle cx={460} cy={630} r={18} fill={YEL} opacity={0.6 + 0.4 * Math.sin(t * 0.4)} />
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "wall" || st === "month" || st === "lab") {
    return (
      <AbsoluteFill style={{ background: "#2b3442" }}>
        <Svg>
          {st !== "lab" && Array.from({ length: 70 }).map((_, i) => {
            const x = 140 + (i % 14) * 120, y = 220 + Math.floor(i / 14) * 150;
            const hit = i === 37;
            return <g key={i}><rect x={x - 40} y={y - 50} width={80} height={100} rx={6} fill={hit && (st === "wall" ? t > d * 0.5 : t > d * 0.7) ? YEL : "#7d8790"} stroke={INK} strokeWidth={3} />
              <rect x={x - 6} y={y + 10} width={12} height={60} fill={BOX[i % BOX.length]} /></g>;
          })}
          {st === "month" && (
            <g>
              <Actor a="magnify" t={t} x={300 + ((t * 4) % 1300)} y={1080} s={0.7} w={w} id="mag" />
              <g transform="translate(1680 200)"><rect x={-110} y={-70} width={220} height={150} rx={12} fill="#fff" stroke={INK} strokeWidth={6} /><rect x={-110} y={-70} width={220} height={40} rx={12} fill={RED} stroke={INK} strokeWidth={6} />
                <Num x={0} y={56} size={64}>DAY {Math.min(29, 1 + Math.floor(ramp(t, 0, d) * 28))}</Num></g>
            </g>
          )}
          {st === "lab" && (
            <g>
              <circle cx={960} cy={540} r={380} fill="#e8eef2" stroke={INK} strokeWidth={14} />
              <rect x={760} y={420} width={400} height={80} rx={20} fill="#c99b4a" stroke={INK} strokeWidth={6} />
              {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${790 + i * 40} ${430 + (i % 3) * 18} l 22 ${10 + (i % 2) * 12}`} stroke="#6b5a36" strokeWidth={5} />)}
              {Array.from({ length: 6 }).map((_, i) => <circle key={`b${i}`} cx={1040 + rnd(i) * 100} cy={440 + rnd(i + 6) * 50} r={8 + rnd(i + 2) * 10} fill="#2a2018" opacity={0.75} />)}
              <T3 x={960} y={680} size={50} color={RED} o={ramp(t, 8, 16)}>scrape + burn marks</T3>
              <rect x={1300} y={780} width={70} height={260} rx={20} fill="#3d3d40" stroke={INK} strokeWidth={8} transform="rotate(-40 1300 780)" />
            </g>
          )}
        </Svg>
      </AbsoluteFill>
    );
  }
  // block / labels / wrong / half / held / loose
  const bad = ["wrong", "half", "held", "loose"].includes(st);
  const half = st === "half" || st === "held" || st === "loose" ? 0.5 * ramp(t, 4, 18) + (st !== "half" ? 0.5 - 0.5 * ramp(t, 4, 18) : 0) : 0;
  const loose = st === "loose" ? ramp(t, 4, 20) : 0;
  const spark = st === "loose" && t > 20 && t < 40;
  const dim = st === "loose" && t > 30;
  return (
    <AbsoluteFill style={{ background: dim ? "#0b0f16" : "#2b3442" }}>
      <Svg>
        <rect x={180} y={260} width={1560} height={60} fill="#596572" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 9 }).map((_, i) => {
          const isBad = bad && i === 4;
          return <Terminal key={i} x={300 + i * 165} y={430} t={t} half={isBad ? half : 0} bad={isBad} loose={isBad ? loose : 0} color={BOX[i % BOX.length]} />;
        })}
        {st === "labels" && <T3 x={960} y={900} size={54} color={YEL} o={ramp(t, 6, 14)}>each wire wears a label</T3>}
        {bad && <g opacity={ramp(t, 2, 10)}><circle cx={960} cy={500} r={120} fill="none" stroke={YEL} strokeWidth={8} strokeDasharray="18 12" /></g>}
        {st === "wrong" && <T3 x={960} y={900} size={54} color={YEL} o={ramp(t, 10, 18)}>label too close to the tip</T3>}
        {st === "half" && <T3 x={960} y={900} size={54} color={YEL} o={ramp(t, 10, 18)}>only half in the slot</T3>}
        {st === "held" && <g transform="translate(1600 160)"><rect x={-110} y={-60} width={220} height={130} rx={12} fill="#fff" stroke={INK} strokeWidth={6} /><Num x={0} y={36} size={70}>{2015 + Math.min(9, Math.floor(ramp(t, 0, d) * 9.99))}</Num></g>}
        {spark && <g><circle cx={960} cy={470} r={40 + (t % 6) * 6} fill={YEL} opacity={0.7} /><path d="M940 420 l 30 40 l -20 6 l 30 44" stroke="#fff" strokeWidth={8} fill="none" /></g>}
        {st === "loose" && (
          <g transform="translate(1600 820)">
            <rect x={-90} y={-90} width={180} height={180} rx={14} fill="#3d4756" stroke={INK} strokeWidth={6} />
            <rect x={-20} y={-60} width={40} height={120} rx={8} fill="#22262c" />
            <rect x={-30} y={t > 26 ? 10 : -60} width={60} height={50} rx={8} fill={RED} stroke={INK} strokeWidth={4} />
            <Num x={0} y={130} size={30} color="#fff">BREAKER</Num>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== ANCHOR (underwater side cut)
const AnchorT: Tpl = ({ t, d, p }) => {
  const drag = p.step === "drag";
  const k = drag ? 1 : ramp(t, 4, d * 0.7);
  const bedY = 900, ax = drag ? 700 + t * 3 : 760, ay = 480 + (bedY - 520) * k;
  return (
    <AbsoluteFill style={{ background: NIGHT1 }}>
      <Svg>
        <rect y={0} width={W} height={300} fill={NIGHT1} />
        <rect y={300} width={W} height={780} fill={NWATER} />
        <path d={`M0 ${bedY} Q 600 ${bedY - 20} 1200 ${bedY} T 1920 ${bedY} V 1080 H 0 Z`} fill="#3d3326" stroke={INK} strokeWidth={6} />
        <g transform="translate(-900 320) scale(1)"><DaliSide x={0} y={0} w={1600} lightsOn={false} dark /></g>
        <path d={`M640 330 Q ${(640 + ax) / 2 + 40} ${(330 + ay) / 2} ${ax} ${ay}`} stroke="#8a8f96" strokeWidth={10} fill="none" strokeDasharray="14 6" />
        <g transform={`translate(${ax} ${ay}) rotate(${drag ? -30 : 0})`}>
          <path d="M0 -50 V 40 M-40 20 Q 0 70 40 20 M-16 -50 h32" stroke="#9aa1a8" strokeWidth={16} fill="none" strokeLinecap="round" />
        </g>
        {drag && <g><path d={`M560 ${bedY - 4} L ${ax} ${bedY - 4}`} stroke="#2a2218" strokeWidth={14} />{Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={ax - 30 - i * 30} cy={bedY - 30 - (i % 2) * 20} r={18 + i * 3} fill="#5a4a36" opacity={0.6 - i * 0.08} />)}</g>}
        {!drag && k > 0.95 && <circle cx={ax} cy={bedY - 10} r={60} fill="#5a4a36" opacity={0.5} />}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== RADIO: mayday, police, the 90 seconds
const RadioT: Tpl = ({ t, d, p }) => {
  const st = p.step ?? "mayday";
  if (st === "timer" || st === "late") {
    const v = st === "late" ? 0 : Math.max(0, Math.round(90 - ramp(t, 0, d) * 30));
    return (
      <AbsoluteFill style={{ background: NIGHT1 }}><Svg>
        <circle cx={960} cy={560} r={300} fill="#fbfaf4" stroke={INK} strokeWidth={12} />
        <path d={`M960 560 L 960 260 A 300 300 0 ${v > 45 ? 1 : 0} 1 ${960 + Math.sin((v / 90) * Math.PI * 2) * 300} ${560 - Math.cos((v / 90) * Math.PI * 2) * 300} Z`} fill={st === "late" ? RED : "#f2a29d"} opacity={0.7} />
        <Num x={960} y={600} size={170}>{v}</Num>
        <Num x={960} y={700} size={50}>seconds</Num>
      </Svg></AbsoluteFill>
    );
  }
  if (st === "police" || st === "ntsb") {
    return (
      <AbsoluteFill style={{ background: "#1c2433" }}><Svg>
        <rect x={0} y={760} width={W} height={320} fill="#2b3442" stroke={INK} strokeWidth={6} />
        {[300, 700, 1100, 1500].map((x, i) => <rect key={x} x={x} y={500} width={300} height={200} rx={12} fill={i === 1 ? "#1e8f6a" : "#2c5b93"} stroke={INK} strokeWidth={6} />)}
        <g transform="translate(960 760)"><rect x={-12} y={-180} width={24} height={180} fill="#3d3d40" stroke={INK} strokeWidth={4} /><rect x={-40} y={-260} width={80} height={90} rx={36} fill="#555" stroke={INK} strokeWidth={6} /></g>
        {st === "police" && Array.from({ length: 3 }).map((_, i) => <circle key={i} cx={960} cy={510} r={60 + ((t * 3 + i * 40) % 120)} fill="none" stroke={YEL} strokeWidth={5} opacity={1 - ((t * 3 + i * 40) % 120) / 120} />)}
        {st === "ntsb" && <T3 x={960} y={300} size={44} color="#fff" o={ramp(t, 8, 20)}>“prevented a much bigger loss of life”</T3>}
      </Svg></AbsoluteFill>
    );
  }
  if (st === "stop" || st === "officer") {
    return (
      <AbsoluteFill><Svg>
        <NightSky t={t} />
        <KeyBridge t={t} police lights crew={st === "officer"} />
        <River t={t} y={760} />
        {st === "stop" && [0, 1, 2].map((i) => <g key={i} transform={`translate(${40 - i * 90 + Math.min(t, 20) * 0} 410)`}><rect x={-30} y={-18} width={60} height={22} rx={6} fill={BOX[i]} stroke={INK} strokeWidth={3} /><circle cx={34} cy={-8} r={6} fill={LAMP} /></g>)}
        {st === "officer" && <g transform={`translate(${120 + ramp(t, 0, d) * 260} 410)`}><rect x={-46} y={-30} width={92} height={30} rx={8} fill="#f4f4f4" stroke={INK} strokeWidth={4} /><rect x={-18} y={-44} width={36} height={14} rx={4} fill={Math.floor(t / 6) % 2 ? RED : "#3a73b8"} /></g>}
      </Svg></AbsoluteFill>
    );
  }
  // mayday
  return (
    <AbsoluteFill><Svg>
      <NightSky t={t} />
      <KeyBridge t={t} lights />
      <River t={t} y={760} />
      <DaliSide x={-200 + t * 0.6} y={790} w={900} lightsOn={false} dark />
      {Array.from({ length: 4 }).map((_, i) => <path key={i} d={`M${360 + t * 0.6} ${520 - 20 - ((t * 3 + i * 30) % 120)} q 60 -40 120 0`} stroke={YEL} strokeWidth={6} fill="none" opacity={1 - ((t * 3 + i * 30) % 120) / 120} transform={`translate(${-60 - ((t * 3 + i * 30) % 120) * 0.5} 0)`} />)}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== UNDER: divers searching (quiet)
const UnderT: Tpl = ({ t, p }) => {
  const st = p.step ?? "night";
  return (
    <AbsoluteFill style={{ background: "#07121f" }}><Svg>
      {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-200 + i * 300} y={300 + (i % 3) * 120} width={600} height={28} fill="#2a3442" stroke="#0a0f18" strokeWidth={4} transform={`rotate(${(rnd(i) - 0.5) * 50} ${100 + i * 300} ${400})`} opacity={st === "night" ? 0.5 : 0.9} />)}
      {st === "wall" && Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${1100 + rnd(i) * 500} ${200 + rnd(i + 3) * 700} l ${120 - rnd(i + 5) * 240} ${120 - rnd(i + 8) * 240}`} stroke="#3a4656" strokeWidth={26} strokeLinecap="round" />)}
      {[0, 1].map((i) => {
        const x = 520 + i * 760 + Math.sin(t * 0.03 + i) * 60, y = 460 + i * 220;
        return (
          <g key={i} opacity={st === "steel" && i === 1 ? 0 : 1} transform={`translate(${x} ${y}) scale(2) translate(${-x} ${-y})`}>
            <path d={`M${x + 60} ${y} L ${x + 760} ${y - 280} L ${x + 760} ${y + 280} Z`} fill="#fff6c9" opacity={0.1} />
            {/* a diver swimming right: wetsuit body, yellow air tank, mask, fins, torch */}
            <rect x={x - 70} y={y - 34} width={70} height={24} rx={12} fill="#e0b13a" stroke="#0a0f18" strokeWidth={3} />
            <ellipse cx={x - 30} cy={y} rx={70} ry={22} fill="#1b2533" stroke="#0a0f18" strokeWidth={4} />
            <path d={`M${x - 96} ${y - 6} L ${x - 170} ${y - 26 + Math.sin(t * 0.3 + i) * 10} M${x - 96} ${y + 8} L ${x - 172} ${y + 18 + Math.sin(t * 0.3 + i + 1) * 10}`} stroke="#1b2533" strokeWidth={12} strokeLinecap="round" />
            <path d={`M${x - 170} ${y - 26 + Math.sin(t * 0.3 + i) * 10} l -40 -14 l 6 26 Z M${x - 172} ${y + 18 + Math.sin(t * 0.3 + i + 1) * 10} l -40 -10 l 8 26 Z`} fill="#2f5f9a" />
            <circle cx={x + 50} cy={y - 6} r={20} fill="#1b2533" stroke="#0a0f18" strokeWidth={4} />
            <rect x={x + 52} y={y - 16} width={20} height={16} rx={5} fill="#9fd8f3" stroke="#0a0f18" strokeWidth={3} />
            <line x1={x + 10} y1={y + 12} x2={x + 60} y2={y + 4} stroke="#1b2533" strokeWidth={10} strokeLinecap="round" />
            <rect x={x + 56} y={y - 2} width={22} height={12} rx={4} fill="#888" />
            <circle cx={x + 80} cy={y + 4} r={7} fill="#fff6c9" />
          </g>
        );
      })}
      {Array.from({ length: 16 }).map((_, i) => <circle key={`b${i}`} cx={rnd(i) * W} cy={(1080 - ((t * 2 + i * 70) % 1080))} r={3 + rnd(i + 1) * 4} fill="#9fb8d0" opacity={0.3} />)}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== MEMORIAL: quiet shots
const MemorialT: Tpl = ({ t, d, p }) => {
  const k = p.kind ?? "sign";
  if (k === "hats") return (
    <AbsoluteFill><Svg>
      <NightSky t={t} />
      <KeyBridge t={t} gone lights={false} />
      <River t={t} y={640} />
      <rect x={0} y={780} width={W} height={300} fill="#2a2f37" />
      <rect x={0} y={770} width={W} height={20} fill="#5a6470" />
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 230 + i * 270, on = ramp(t, i * 5, i * 5 + 10);
        const fl = 1 + Math.sin(t * 0.6 + i * 1.7) * 0.12;
        return (
          <g key={i} opacity={on}>
            {/* a road worker's yellow hard hat */}
            <path d={`M${x - 70} 880 C ${x - 72} 800, ${x + 72} 800, ${x + 74} 880 Z`} fill="#ffd23f" stroke={INK} strokeWidth={6} />
            <ellipse cx={x + 2} cy={882} rx={94} ry={14} fill="#ffd23f" stroke={INK} strokeWidth={6} />
            {/* a candle in front */}
            <circle cx={x + 110} cy={840} r={90} fill={LAMP} opacity={0.16} />
            <rect x={x + 92} y={830} width={36} height={110} rx={6} fill="#fbfaf4" stroke={INK} strokeWidth={5} />
            <line x1={x + 110} y1={830} x2={x + 110} y2={816} stroke={INK} strokeWidth={4} />
            <path d={`M${x + 110} ${816 - 46 * fl} Q ${x + 128} ${806} ${x + 110} ${818} Q ${x + 92} ${806} ${x + 110} ${816 - 46 * fl} Z`} fill="#ffb347" stroke="#e8352b" strokeWidth={3} />
          </g>
        );
      })}
    </Svg></AbsoluteFill>
  );
  if (k === "calendar" || k === "crewcal") return (
    <AbsoluteFill style={{ background: k === "crewcal" ? "#bfe0f2" : "#1b2433" }}><Svg>
      {k === "crewcal" && <g><River t={t} y={720} night={false} /><DaliSide x={-500} y={760} w={2400} lightsOn={false} />{[0, 1, 2].map((i) => <Guy key={i} x={260 + i * 150} y={500} s={0.3} t={t + i * 9} id={`cc${i}`} pose={breathe(IDLE, t, i * 4)} face={FACES.worried} outfit={i === 1 ? "coverall" : "officer"} />)}</g>}
      <g transform="translate(1400 420)">
        <rect x={-180} y={-150} width={360} height={300} rx={16} fill="#fbfaf4" stroke={INK} strokeWidth={8} />
        <rect x={-180} y={-150} width={360} height={70} rx={16} fill={k === "crewcal" ? RED : "#5a6470"} stroke={INK} strokeWidth={8} />
        <Num x={0} y={60} size={110}>{k === "crewcal" ? (["JUN 24", "DEC 24", "JUN 25", "MAR 26"][Math.min(3, Math.floor(ramp(t, 0, d) * 3.99))]) : Math.min(42, 1 + Math.floor(ramp(t, 0, d) * 41))}</Num>
      </g>
    </Svg></AbsoluteFill>
  );
  if (k === "flower") return (
    <AbsoluteFill><Svg>
      <NightSky t={t} dawn={0.9} />
      <River t={t} y={600} dawn={0.8} />
      <g transform={`translate(${960 + Math.sin(t * 0.02) * 30} ${760 + Math.sin(t * 0.05) * 4})`}>
        {Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={Math.cos(i * 1.047) * 22} cy={Math.sin(i * 1.047) * 10} rx={20} ry={10} fill="#fbfaf4" stroke={INK} strokeWidth={3} />)}
        <circle r={10} fill={YEL} stroke={INK} strokeWidth={3} />
      </g>
    </Svg></AbsoluteFill>
  );
  if (k === "water") return (
    <AbsoluteFill><Svg>
      <NightSky t={t} />
      <River t={t} y={560} />
      {[0, 1].map((i) => <g key={i} transform={`translate(${600 + i * 600 + Math.sin(t * 0.02 + i) * 40} 680)`}><path d="M-90 0 L 90 0 Q 100 20 80 40 L -80 40 Z" fill="#c94a3a" stroke={INK} strokeWidth={5} /><circle cx={0} cy={-20} r={10} fill={Math.floor(t / 8) % 2 ? RED : "#3a73b8"} /><path d={`M0 -20 L ${400 * (i ? -1 : 1)} 160 L ${300 * (i ? -1 : 1)} 260 Z`} fill="#fff6c9" opacity={0.08} /></g>)}
    </Svg></AbsoluteFill>
  );
  if (k === "potholes") return (
    <AbsoluteFill style={{ background: "#222a36" }}><Svg>
      <rect y={560} width={W} height={520} fill="#3a3f47" />
      {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={i * 220} y={800} width={110} height={14} fill="#e8e1c8" />)}
      <ellipse cx={960} cy={860} rx={160} ry={40} fill="#1b1f25" stroke={INK} strokeWidth={4} />
      {[-1, 1].map((sd) => <path key={sd} d={`M${960 + sd * 300} 860 l 24 -70 l 24 70 Z`} fill="#f27c1e" stroke={INK} strokeWidth={4} />)}
      {[0, 1].map((i) => <Guy key={i} x={760 + i * 400} y={900} s={0.55} t={t + i * 20} id={`ph${i}`} pose={breathe({ ...IDLE, lean: i ? -14 : 14, armL: [40, 20], armR: [40, 20] }, t, i * 9)} face={FACES.talk} prop={i ? "spade" : "none"} />)}
      <circle cx={960} cy={300} r={260} fill={LAMP} opacity={0.08} />
    </Svg></AbsoluteFill>
  );
  if (k === "sign") return <AbsoluteFill><Svg><DeckCrew t={t} fade={ramp(t, d * 0.35, d * 0.95)} /></Svg></AbsoluteFill>;
  // (old) road-work sign + hard hat
  return (
    <AbsoluteFill style={{ background: "#141b26" }}><Svg>
      <rect y={700} width={W} height={380} fill="#2a2f37" />
      <g transform="translate(860 700)">
        <line x1={0} y1={0} x2={0} y2={-300} stroke="#8a8f96" strokeWidth={14} />
        <path d="M0 -480 L 150 -330 L 0 -180 L -150 -330 Z" fill="#f27c1e" stroke={INK} strokeWidth={8} />
        <circle cx={0} cy={-360} r={18} fill={INK} /><path d="M0 -340 v 50 M-30 -300 l 30 -20 l 30 20" stroke={INK} strokeWidth={10} fill="none" />
      </g>
      <g transform="translate(1180 690)" opacity={ramp(t, 10, 30)}>
        <path d="M-80 0 C -82 -80, 82 -80, 84 0 Z" fill="#f2f6fa" stroke={INK} strokeWidth={6} />
        <ellipse cx={2} cy={2} rx={104} ry={16} fill="#f2f6fa" stroke={INK} strokeWidth={6} />
      </g>
    </Svg></AbsoluteFill>
  );
};

// ================================================================== RISK: the 30x meter + the ship-strike maths
const RiskT: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "meter";
  if (m === "calc") return (
    <AbsoluteFill style={{ background: PAPER5 }}><Svg>
      <rect x={200} y={220} width={1100} height={640} rx={16} fill="#fbfaf4" stroke={INK} strokeWidth={10} />
      {["ship size × speed", "÷ distance to the piers", "= chance of a hit", "→ how strong the protection must be"].map((s, i) => (
        <text key={s} x={260} y={360 + i * 130} fontFamily={fontFamily} fontWeight={700} fontSize={64} fill={["#2c4a7a", "#2c4a7a", RED, "#2f7d4a"][i]} opacity={ramp(t, 6 + i * 14, 14 + i * 14)}>{s}</text>
      ))}
      <Actor a="notes" t={t} x={1580} y={1040} s={0.8} id="calc" />
    </Svg></AbsoluteFill>
  );
  const v = m === "red" ? 0.15 + 0.85 * ramp(t, 4, d * 0.6) : 0.15 * ramp(t, 4, d);
  const a = Math.PI + v * Math.PI;
  return (
    <AbsoluteFill style={{ background: NAVY }}><Svg>
      <Rays t={t} />
      <g transform="translate(960 760)">
        <path d="M-460 0 A 460 460 0 0 1 460 0 Z" fill="#fbfaf4" stroke={INK} strokeWidth={10} />
        <path d="M-420 0 A 420 420 0 0 1 -380 -180 L -300 -140 A 330 330 0 0 0 -330 0 Z" fill="#a9dcae" />
        <path d={`M${Math.cos(Math.PI * 1.12) * 420} ${Math.sin(Math.PI * 1.12) * 420} A 420 420 0 0 1 420 0 L 330 0 A 330 330 0 0 0 ${Math.cos(Math.PI * 1.12) * 330} ${Math.sin(Math.PI * 1.12) * 330} Z`} fill="#f2a29d" />
        <line x1={0} y1={0} x2={Math.cos(a) * 380} y2={Math.sin(a) * 380} stroke={INK} strokeWidth={20} strokeLinecap="round" />
        <circle r={36} fill={INK} />
        <T3 x={-330} y={80} size={46} color="#a9dcae">acceptable</T3>
        <T3 x={300} y={80} size={46} color="#f2a29d">Key Bridge</T3>
        {m === "red" && <T3 x={0} y={-180} size={170} color={RED} o={ramp(t, d * 0.5, d * 0.6)}>×30</T3>}
      </g>
    </Svg></AbsoluteFill>
  );
};

// ================================================================== SKYWAY: Tampa Bay, 9 May 1980
const SkywayT: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "storm";
  const stormy = ["storm", "squall", "ship", "radar", "hit", "edge", "survivor", "rescue"].includes(st);
  if (st === "rules" || st === "book" || st === "note") return (
    <AbsoluteFill style={{ background: PAPER5 }}><Svg>
      <g transform="translate(760 560)">
        <rect x={-300} y={-360} width={600} height={720} rx={20} fill="#2c4a7a" stroke={INK} strokeWidth={10} />
        <Num x={0} y={-200} size={64} color="#fff">BRIDGE</Num><Num x={0} y={-120} size={64} color="#fff">SHIP-STRIKE</Num><Num x={0} y={-40} size={64} color="#fff">RULES</Num>
        <Num x={0} y={80} size={90} color={YEL}>1991</Num>
        {st === "book" && <g transform={`rotate(-14) scale(${1 + (1 - ramp(t, 6, 12)) * 1.5})`} opacity={ramp(t, 6, 10)}><rect x={-280} y={160} width={560} height={130} rx={14} fill="none" stroke={RED} strokeWidth={12} /><Num x={0} y={250} size={60} color={RED}>NEW BRIDGES ONLY</Num></g>}
      </g>
      {st === "note" && [[1360, 380, "#ffe46b", "Key Bridge: 1977"], [1460, 700, "#9fe0b8", "rules: 1991"]].map(([x, y, c, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${i ? 4 : -5}) scale(${pop(t, 4 + i * 12)})`}><rect x={-230} y={-90} width={460} height={180} fill={String(c)} stroke={INK} strokeWidth={5} /><Num x={0} y={18} size={52}>{s}</Num></g>
      ))}
      {st === "rules" && <Actor a="notes" t={t} x={1500} y={1040} s={0.85} id="rb" w={w} />}
    </Svg></AbsoluteFill>
  );
  if (st === "new") return (
    <AbsoluteFill style={{ background: "#bfe0f2" }}><Svg>
      <rect y={720} width={W} height={360} fill={WATER} />
      <rect x={0} y={520} width={W} height={20} fill="#e8d84a" stroke={INK} strokeWidth={5} />
      {[620, 1300].map((x, i) => <g key={i}><rect x={x - 16} y={160} width={32} height={570} fill="#e8d84a" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 9 }).map((_, j) => <line key={j} x1={x} y1={180 + j * 14} x2={x + (j % 2 ? 1 : -1) * (80 + j * 36)} y2={520} stroke="#c9a84a" strokeWidth={3} />)}
        <ellipse cx={x} cy={725} rx={150 * ramp(t, 4 + i * 6, 20 + i * 6)} ry={36} fill="#a89878" stroke={INK} strokeWidth={5} /></g>)}
      <T3 x={960} y={300} size={54} color={YEL} o={ramp(t, 18, 26)}>SUNSHINE SKYWAY (1987)</T3>
    </Svg></AbsoluteFill>
  );
  if (st === "radar") return (
    <AbsoluteFill style={{ background: "#0f1611" }}><Svg>
      <circle cx={960} cy={560} r={360} fill="#0d2a14" stroke={INK} strokeWidth={14} />
      {Array.from({ length: 400 }).map((_, i) => <rect key={i} x={620 + rnd(i + t) * 680} y={220 + rnd(i * 3 + t) * 680} width={6} height={6} fill="#5be37a" opacity={rnd(i + t * 7) * 0.8 * ramp(t, 4, 12)} />)}
      <line x1={960} y1={560} x2={960 + Math.cos(t * 0.15) * 340} y2={560 + Math.sin(t * 0.15) * 340} stroke="#5be37a" strokeWidth={6} opacity={1 - ramp(t, 4, 12)} />
      <T3 x={960} y={1000} size={60} color={RED} o={ramp(t, 8, 14)}>RADAR FAILS</T3>
    </Svg></AbsoluteFill>
  );
  const kfall = st === "hit" ? ramp(t, 10, d * 0.8) : ["edge", "survivor", "rescue"].includes(st) ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: "#2a3138" }}><Svg>
      <rect width={W} height={H} fill="#38424c" />
      {stormy && Array.from({ length: 70 }).map((_, i) => <line key={i} x1={(i * 61 + t * 14) % (W + 200) - 100} y1={(i * 97 + t * 40) % 1080} x2={(i * 61 + t * 14) % (W + 200) - 140} y2={(i * 97 + t * 40) % 1080 + 70} stroke="#9fb0c0" strokeWidth={3} opacity={0.5} />)}
      {st === "squall" && t % 40 < 3 && <rect width={W} height={H} fill="#fff" opacity={0.4} />}
      <rect y={720} width={W} height={360} fill="#2c4250" />
      {/* the old Skyway: a long high span */}
      {(
        <g opacity={st === "storm" || st === "squall" ? 0.55 : 1}>
          <rect x={0} y={420} width={700} height={16} fill="#6b7480" stroke={INK} strokeWidth={4} />
          <rect x={1200} y={420} width={720} height={16} fill="#6b7480" stroke={INK} strokeWidth={4} />
          <g transform={`translate(0 ${kfall * 340}) rotate(${kfall * 4} 950 428)`} opacity={1 - kfall * 0.5}><rect x={700} y={420} width={500} height={16} fill="#6b7480" stroke={INK} strokeWidth={4} /></g>
          {[700, 1200].map((x) => <rect key={x} x={x - 14} y={436} width={28} height={300} fill="#5a6470" stroke={INK} strokeWidth={4} />)}
        </g>
      )}
      {["ship", "hit", "survivor", "rescue"].includes(st) && (
        <g transform={`translate(${st === "ship" ? 40 + t * 1.2 : 360} 760)`}>
          <path d="M0 -60 L 520 -60 Q 560 -40 540 30 L 30 30 Z" fill="#3b2f2a" stroke={INK} strokeWidth={6} />
          <rect x={30} y={-140} width={90} height={80} fill="#d8d0c0" stroke={INK} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={160 + i * 90} y={-100} width={70} height={40} fill="#5a4a40" stroke={INK} strokeWidth={3} />)}
          <T3 x={300} y={10} size={30} color="#d8d0c0">SUMMIT VENTURE</T3>
        </g>
      )}
      {st === "edge" && <g>{[0, 1, 2].map((i) => <circle key={i} cx={640 - i * 90} cy={410} r={10} fill={LAMP} opacity={0.6} />)}</g>}
      {st === "survivor" && <g transform={`translate(${760 + ramp(t, 0, d) * 60} ${430 + ramp(t, 0, d) * 300}) rotate(${ramp(t, 0, d) * 40})`}><rect x={-50} y={-26} width={100} height={36} rx={8} fill="#c94a3a" stroke={INK} strokeWidth={4} /><circle cx={-28} cy={14} r={10} fill={INK} /><circle cx={30} cy={14} r={10} fill={INK} /></g>}
      {st === "rescue" && <g><path d="M560 700 Q 640 640 700 790" stroke="#d8d0c0" strokeWidth={5} fill="none" /><circle cx={700} cy={800} r={30} fill="none" stroke="#f27c1e" strokeWidth={14} /><circle cx={720} cy={812} r={12} fill="#fff" stroke={INK} strokeWidth={3} /></g>}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== NTSB report
const NtsbT: Tpl = ({ t, p, w }) => {
  const st = p.step ?? "1";
  return (
    <AbsoluteFill style={{ background: "#c9d3dc" }}><Svg>
      <g transform={`translate(760 ${600 + (st === "1" ? (1 - ramp(t, 0, 14)) * 600 : 0)}) rotate(-2) scale(0.9)`}>
        <rect x={-420} y={-460} width={840} height={920} fill="#fbfaf4" stroke={INK} strokeWidth={8} />
        <rect x={-420} y={-460} width={840} height={130} fill={NAVY} />
        <Num x={0} y={-376} size={46} color="#fff">NATIONAL TRANSPORTATION</Num>
        <Num x={0} y={-334} size={46} color="#fff">SAFETY BOARD</Num>
        <Num x={0} y={-230} size={44}>Contact of Containership Dali</Num>
        <Num x={0} y={-180} size={44}>with the Key Bridge</Num>
        {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-340} y={-100 + i * 50} width={680 - (i % 3) * 120} height={14} fill="#c9ced3" />)}
        {st === "2" && <g transform={`rotate(-10) scale(${pop(t, 6)})`}><rect x={-260} y={300} width={520} height={110} rx={14} fill="none" stroke={RED} strokeWidth={10} /><Num x={0} y={378} size={64} color={RED}>NOV 2025</Num></g>}
      </g>
      <Actor a={st === "1" ? "notes" : "fingerup"} t={t} x={1560} y={1040} s={0.85} id="ntsb" w={w} />
      {st === "1" && <g transform="translate(1560 260)"><rect x={-130} y={-70} width={260} height={140} rx={14} fill="#fff" stroke={INK} strokeWidth={6} /><Num x={0} y={22} size={70}>{Math.min(20, Math.round(ramp(t, 4, 40) * 20))} mo</Num></g>}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== CLOCKS: manual vs automatic
const ClocksT: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "1";
  if (st === "1") return (
    <AbsoluteFill style={{ background: "#2b3442" }}><Svg>
      <g transform="translate(860 540)">
        <rect x={-220} y={-260} width={440} height={520} rx={20} fill="#596572" stroke={INK} strokeWidth={8} />
        <rect x={-60} y={-140} width={120} height={280} rx={20} fill="#22262c" stroke={INK} strokeWidth={6} />
        <rect x={-50} y={0} width={100} height={120} rx={16} fill={RED} stroke={INK} strokeWidth={6} />
        <Num x={0} y={-190} size={46} color="#fff">AUTO</Num><Num x={0} y={220} size={46} color={YEL}>MANUAL</Num>
      </g>
      <Actor a="fingerup" t={t} x={1500} y={1040} s={0.8} id="clk" w={w} />
    </Svg></AbsoluteFill>
  );
  const watch = (x: number, secs: number, label: string, col: string) => {
    const v = Math.min(secs, ramp(t, 4, d - 6) * 58);
    const a = (v / 60) * Math.PI * 2;
    return (
      <g transform={`translate(${x} 560)`}>
        <rect x={-30} y={-330} width={60} height={50} rx={10} fill="#596572" stroke={INK} strokeWidth={5} />
        <circle r={250} fill="#fbfaf4" stroke={INK} strokeWidth={12} />
        <path d={`M0 0 L 0 -230 A 230 230 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * 230} ${-Math.cos(a) * 230} Z`} fill={col} opacity={0.5} />
        <line x1={0} y1={0} x2={Math.sin(a) * 210} y2={-Math.cos(a) * 210} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <Num x={0} y={110} size={80}>{Math.round(v)} s</Num>
        <T3 x={0} y={340} size={60} color={col}>{label}</T3>
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ background: NAVY }}><Svg><Rays t={t} />{watch(560, 10, "AUTOMATIC", "#9fe0b8")}{watch(1360, 58, "MANUAL", "#f2a29d")}</Svg></AbsoluteFill>
  );
};

// ================================================================== PUMP: the flushing pump feeding the generators
const PumpT: Tpl = ({ t, p }) => {
  const st = p.step ?? "1";
  const running = st === "1";
  const gensOn = st !== "3";
  return (
    <AbsoluteFill style={{ background: running ? "#dfe9f0" : "#1b2433" }}><Svg>
      <g transform="translate(420 600)">
        <rect x={-180} y={-140} width={360} height={280} rx={24} fill="#7d8790" stroke={INK} strokeWidth={8} />
        <circle r={90} fill="#c7ccd1" stroke={INK} strokeWidth={6} />
        <g transform={`rotate(${running ? t * 18 : 0})`}><path d="M0 -70 L 16 0 L 0 70 L -16 0 Z M-70 0 L 0 16 L 70 0 L 0 -16 Z" fill="#596572" /></g>
        <rect x={-150} y={-210} width={300} height={56} rx={10} fill="#e0a23b" stroke={INK} strokeWidth={5} />
        <Num x={0} y={-170} size={38}>FLUSHING PUMP</Num>
      </g>
      <path d="M600 600 H 1180" stroke="#3d3326" strokeWidth={36} />
      {running && Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={620 + ((t * 6 + i * 70) % 560)} cy={600} r={10} fill="#8a6a2a" />)}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${1340 + i * 300} ${520 + i * 160})`}>
          <rect x={-110} y={-90} width={220} height={180} rx={18} fill={gensOn ? "#3a73b8" : "#333"} stroke={INK} strokeWidth={6} />
          <Num x={0} y={14} size={40} color="#fff">GEN {i + 3}</Num>
          {gensOn && st === "2" && <circle r={90} fill={YEL} opacity={0.1 + 0.1 * Math.sin(t)} />}
          {st === "3" && Array.from({ length: 3 }).map((_, j) => <circle key={j} cx={-60 + j * 60} cy={-120 - ((t * 2 + j * 20) % 60)} r={16 + j * 4} fill="#555" opacity={0.6} />)}
        </g>
      ))}
      {st === "2" && <T3 x={420} y={900} size={56} color={RED}>stopped · no auto-restart</T3>}
      {st === "3" && <T3 x={1500} y={300} size={70} color={RED}>OUT OF FUEL</T3>}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== PORT: Baltimore cut off, channels reopening
const PortT: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "blocked";
  if (st === "cars") return (
    <AbsoluteFill style={{ background: "#bfe0f2" }}><Svg>
      <rect y={500} width={W} height={580} fill="#9aa4ad" />
      {Array.from({ length: 60 }).map((_, i) => <g key={i} transform={`translate(${100 + (i % 15) * 120} ${560 + Math.floor(i / 15) * 110})`} opacity={ramp(t, i * 0.4, i * 0.4 + 6)}>
        {i % 7 === 3 ? <g><rect x={-40} y={-30} width={70} height={40} rx={6} fill="#4f8a5b" stroke={INK} strokeWidth={3} /><circle cx={-24} cy={14} r={14} fill={INK} /><circle cx={22} cy={18} r={9} fill={INK} /></g>
          : <g><rect x={-44} y={-24} width={88} height={30} rx={10} fill={BOX[i % BOX.length]} stroke={INK} strokeWidth={3} /><rect x={-20} y={-40} width={44} height={20} rx={6} fill={BOX[i % BOX.length]} stroke={INK} strokeWidth={3} /><circle cx={-24} cy={8} r={9} fill={INK} /><circle cx={24} cy={8} r={9} fill={INK} /></g>}
      </g>)}
      <g transform={`translate(1620 280) scale(${pop(t, 10)})`}><circle r={130} fill={YEL} stroke={INK} strokeWidth={8} /><Num x={0} y={30} size={110}>#1</Num></g>
    </Svg></AbsoluteFill>
  );
  if (st === "jobs") return (
    <AbsoluteFill style={{ background: "#bfe0f2" }}><Svg>
      <rect y={620} width={W} height={460} fill="#9aa4ad" stroke={INK} strokeWidth={6} />
      {[300, 800, 1300].map((x) => <g key={x} transform={`translate(${x} 620)`}><path d="M-60 0 V -420 M60 0 V -420 M-60 -420 H 360" stroke="#c94a3a" strokeWidth={22} /><line x1={300} y1={-420} x2={300} y2={-200} stroke={INK} strokeWidth={4} /></g>)}
      <Actor a="sad" t={t} x={1600} y={1000} s={0.85} id="jobs" w={w} over={{ prop: "clipboard" }} />
    </Svg></AbsoluteFill>
  );
  if (st === "pile") return (
    <AbsoluteFill style={{ background: "#d9ecf3" }}><Svg>
      <rect y={820} width={W} height={260} fill="#9aa4ad" />
      {Array.from({ length: 60 }).map((_, i) => { const k = clamp01(ramp(t, 0, d * 0.8) * 60 - i); return <rect key={i} x={560 + rnd(i) * 800 - Math.floor(i / 12) * -20} y={800 - Math.floor(i / 12) * 70 - rnd(i + 2) * 20} width={160} height={24} fill={i % 3 ? "#7d8790" : "#b5bcc2"} stroke={INK} strokeWidth={3} transform={`rotate(${(rnd(i + 5) - 0.5) * 50} ${640 + rnd(i) * 800} 780)`} opacity={k} />; })}
      <T3 x={960} y={300} size={110} color={YEL}>≈ {Math.round(50 * ramp(t, 0, d * 0.8))},000 t</T3>
    </Svg></AbsoluteFill>
  );
  // map views of the channel
  const open = st === "open" ? 1 : st === "deep" ? 0.7 : st === "tug" ? 0.3 : st === "channels" ? ramp(t, 0, d) * 0.7 : 0;
  return (
    <AbsoluteFill style={{ background: "#9cc287" }}><Svg>
      <path d="M0 520 Q 500 470 900 540 T 1920 520 L 1920 760 Q 1400 800 900 740 T 0 760 Z" fill={WATER} stroke={INK} strokeWidth={6} />
      <rect x={880} y={430} width={40} height={420} fill="#7d8790" stroke={INK} strokeWidth={4} opacity={0.6} />
      <T3 x={300} y={430} size={50}>PORT OF BALTIMORE</T3>
      <T3 x={1640} y={430} size={44}>→ SEA</T3>
      {open < 1 && <g transform="translate(900 640)"><path d="M-60 -60 L60 60 M60 -60 L-60 60" stroke={INK} strokeWidth={34} strokeLinecap="round" /><path d="M-60 -60 L60 60 M60 -60 L-60 60" stroke={RED} strokeWidth={20} strokeLinecap="round" /></g>}
      {open > 0 && <rect x={860} y={640 - 120 * open} width={80} height={240 * open} fill="#7cc4e6" stroke="#fff" strokeWidth={4} strokeDasharray="12 8" />}
      {(st === "cutoff" || st === "blocked") && Array.from({ length: 8 }).map((_, i) => <g key={i} transform={`translate(${1300 + (i % 4) * 140} ${600 + Math.floor(i / 4) * 70})`}><rect x={-50} y={-14} width={100} height={28} rx={10} fill={BOX[i % BOX.length]} stroke={INK} strokeWidth={3} /></g>)}
      {st === "tug" && <g transform={`translate(${700 + ramp(t, 0, d) * 400} 640)`}><rect x={-30} y={-12} width={60} height={24} rx={8} fill="#c94a3a" stroke={INK} strokeWidth={3} /></g>}
      {(st === "deep" || st === "open") && <g transform={`translate(${600 + ramp(t, 0, d) * 700} 640)`}><DaliTop s={0.8} /></g>}
      {st === "open" && <T3 x={960} y={940} size={60} color={YEL}>CHANNEL FULLY OPEN</T3>}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== CRANE: the Chesapeake 1000
const CraneT: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "1";
  if (st === "sub") return (
    <AbsoluteFill style={{ background: "#0b1626" }}><Svg>
      <rect y={300} width={W} height={780} fill="#0f2238" />
      <g transform={`translate(960 ${900 - ramp(t, 4, d) * 360})`}>
        <path d="M-420 0 Q -420 -70 -300 -70 L 380 -70 Q 460 -60 460 0 Q 460 60 380 70 L -300 70 Q -420 70 -420 0 Z" fill="#2a3442" stroke={INK} strokeWidth={8} />
        <rect x={-80} y={-150} width={160} height={84} rx={14} fill="#2a3442" stroke={INK} strokeWidth={8} />
        <path d="M-420 -400 L -420 -70 M300 -400 L 300 -70" stroke="#8a8f96" strokeWidth={6} />
      </g>
      <g transform={`translate(1500 260) rotate(-12) scale(${pop(t, 6)})`}><rect x={-260} y={-70} width={520} height={140} rx={14} fill="none" stroke={RED} strokeWidth={12} /><Num x={0} y={26} size={76} color={RED}>TOP SECRET</Num></g>
    </Svg></AbsoluteFill>
  );
  if (st === "secret") return (
    <AbsoluteFill style={{ background: PAPER5 }}><Svg>
      <Actor a={t > 12 ? "cool" : "amazed"} t={t} x={960} y={1060} s={1.15} id="cool" w={w} />
    </Svg></AbsoluteFill>
  );
  if (st === "1") return (
    <AbsoluteFill style={{ background: "#bfe0f2" }}><Svg>
      <River t={t} y={780} night={false} />
      <rect x={140} y={720} width={1000} height={70} fill="#5a6470" stroke={INK} strokeWidth={6} />
      <TrussPiece pts={[[200, 700], [400, 620], [620, 600], [840, 640], [1060, 700]]} h={80} />
      {[0, 1].map((i) => (
        <g key={i}>
          <Guy x={420 + i * 360} y={720} s={0.42} t={t + i * 17} id={`cut${i}`} outfit="coverall" pose={breathe({ ...IDLE, lean: 10, armL: [70, 30], armR: [80, 20] }, t, i * 5)} face={FACES.confident} />
          <g transform={`translate(${470 + i * 360} ${606 + (i ? 20 : 0)})`}><circle r={14 + (t % 6) * 3} fill={YEL} opacity={0.6} />{Array.from({ length: 7 }).map((_, j) => <line key={j} x1={0} y1={0} x2={Math.cos(j * 0.9 + t * 0.7) * 50} y2={Math.sin(j * 0.9 + t * 0.7) * 50 + 20} stroke="#ffb347" strokeWidth={4} />)}</g>
        </g>
      ))}
      <Actor a="talk" t={t} x={1500} y={1000} s={0.75} id="cut" w={w} />
    </Svg></AbsoluteFill>
  );
  // the crane itself
  const lift = st === "3" ? ramp(t, 4, d - 4) : 0;
  return (
    <AbsoluteFill style={{ background: "#bfe0f2" }}><Svg>
      <River t={t} y={800} night={false} />
      <g transform={`translate(${st === "2" ? 1500 - ramp(t, 0, d) * 500 : 1000} 800)`}>
        <rect x={-260} y={-60} width={520} height={110} fill="#5a6470" stroke={INK} strokeWidth={6} />
        <rect x={-120} y={-200} width={240} height={140} fill="#e0a23b" stroke={INK} strokeWidth={6} />
        <path d="M60 -200 L -500 -760" stroke="#e0a23b" strokeWidth={46} strokeLinecap="round" />
        <path d="M60 -200 L -500 -760" stroke={INK} strokeWidth={4} strokeDasharray="30 30" />
        <line x1={-500} y1={-760} x2={-500} y2={-300 - lift * 240} stroke={INK} strokeWidth={6} />
        <g transform={`translate(-500 ${-300 - lift * 240})`}><path d="M-160 0 L -80 -60 L 80 -60 L 160 0 Z M-120 0 L 120 0" stroke="#5a6470" strokeWidth={18} fill="none" strokeLinejoin="round" /></g>
        <T3 x={0} y={30} size={34} color="#fff">CHESAPEAKE 1000</T3>
        {st === "2" && <Actor a="look" t={t} x={180} y={-60} s={0.32} id="crg" />}
      </g>
      {st === "3" && <T3 x={1500} y={300} size={90} color={YEL} o={ramp(t, 6, 14)}>1,000 t</T3>}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== BLAST: cutting the truss off the bow
const BlastT: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "1";
  const boom = st === "2" ? clamp01((t - 10) / 10) : 0;
  const away = st === "2" ? ramp(t, 14, d) : st === "float" ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: "#bfe0f2" }}><Svg>
      <River t={t} y={760} night={false} />
      <g transform={`translate(${st === "float" ? -200 - ramp(t, 4, d) * 500 : -200} 0)`}><DaliSide x={0} y={790} w={1300} lightsOn={false} /></g>
      {st !== "float" && (
        <g transform={`translate(0 ${away * 300}) rotate(${away * 12} 1000 500)`} opacity={1 - away * 0.4}>
          <TrussPiece pts={[[700, 640], [860, 560], [1000, 520], [1120, 560], [1220, 700], [1300, 820]]} h={70} />
        </g>
      )}
      {st === "1" && [880, 1000, 1120].map((x, i) => <g key={i} transform={`translate(${x} ${[540, 500, 540][i]}) scale(${pop(t, 6 + i * 6)})`}><rect x={-14} y={-24} width={28} height={48} rx={6} fill={RED} stroke={INK} strokeWidth={4} /><line x1={0} y1={-24} x2={10} y2={-50} stroke={INK} strokeWidth={3} /></g>)}
      {boom > 0 && boom < 1 && Array.from({ length: 3 }).map((_, i) => <circle key={i} cx={940 + i * 70} cy={450} r={60 + boom * 160} fill={i ? YEL : "#fff"} opacity={(1 - boom) * 0.8} />)}
      {st === "float" && [0, 1].map((i) => <g key={i} transform={`translate(${-200 - ramp(t, 4, d) * 500 + 1400 + i * 120} ${790})`}><path d="M-60 0 L 60 0 Q 70 18 60 34 L -56 34 Z" fill="#c94a3a" stroke={INK} strokeWidth={4} /><rect x={-30} y={-36} width={50} height={36} fill="#f4f4ee" stroke={INK} strokeWidth={4} /></g>)}
      {st === "2" && <Actor a="ears" t={t} x={1650} y={1050} s={0.7} id="ears" w={w} />}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== PRICE: cheque / 1977 tag / new bridge / 2030
const PriceT: Tpl = ({ t, d, p }) => {
  const k = p.kind ?? "cheque";
  if (k === "cheque") return (
    <AbsoluteFill style={{ background: NAVY }}><Svg><Rays t={t} />
      <g transform={`translate(${960 + (1 - ramp(t, 0, 14)) * 1200} 540) rotate(-4)`}>
        <rect x={-640} y={-260} width={1280} height={520} rx={20} fill="#e9f3e3" stroke={INK} strokeWidth={10} />
        <Num x={-560} y={-150} size={44} anchor="start">PAY TO: U.S. GOVERNMENT</Num>
        <Num x={-560} y={-80} size={36} anchor="start" color="#555">for clearing the channel</Num>
        <Num x={560} y={80} size={130} anchor="end" color="#2f7d4a">$102,000,000</Num>
        <line x1={-560} y1={170} x2={100} y2={170} stroke={INK} strokeWidth={4} />
        <Num x={-560} y={220} size={30} anchor="start" color="#555">(no admission of liability)</Num>
      </g>
    </Svg></AbsoluteFill>
  );
  if (k === "2030") return (
    <AbsoluteFill style={{ background: NAVY }}><Svg><Rays t={t} />
      <g transform={`translate(960 540) scale(${pop(t, 4)})`}><rect x={-260} y={-220} width={520} height={440} rx={24} fill="#fbfaf4" stroke={INK} strokeWidth={10} /><rect x={-260} y={-220} width={520} height={110} rx={24} fill={RED} stroke={INK} strokeWidth={10} />
        <Num x={0} y={-140} size={60} color="#fff">LATE</Num><Num x={0} y={120} size={190}>2030</Num></g>
    </Svg></AbsoluteFill>
  );
  const v = k === "new" ? 4.3 + 0.9 * ramp(t, d * 0.4, d - 4) : 60;
  return (
    <AbsoluteFill style={{ background: NAVY }}><Svg><Rays t={t} />
      <g transform={`translate(960 540) rotate(${Math.sin(t * 0.1) * 4})`}>
        <path d="M-520 -170 L 380 -170 L 540 0 L 380 170 L -520 170 Z" fill={k === "new" ? YEL : "#fbfaf4"} stroke={INK} strokeWidth={10} />
        <circle cx={420} cy={0} r={26} fill={NAVY} stroke={INK} strokeWidth={6} />
        <Num x={-80} y={k === "new" ? 30 : 50} size={k === "new" ? 150 : 170}>{k === "new" ? `$${v.toFixed(1)}B` : "$60M"}</Num>
        <Num x={-80} y={k === "new" ? 120 : 140} size={44} color="#555">{k === "new" ? "estimate: $4.3–5.2B" : "built in 1977"}</Num>
      </g>
    </Svg></AbsoluteFill>
  );
};

// ================================================================== USMAP: 68 bridges
const US_LL: [number, number][] = [[-124.7, 48.4], [-123.9, 46.2], [-124.2, 42], [-124.3, 40.3], [-122.4, 37.8], [-120.6, 34.6], [-117.1, 32.5], [-114.7, 32.7], [-111, 31.3], [-108.2, 31.3], [-106.5, 31.8], [-104.5, 29.6], [-103, 29], [-101.4, 29.8], [-99.5, 27.5], [-97.4, 25.9], [-97.4, 27.8], [-94.7, 29.4], [-93.8, 29.7], [-90, 29.2], [-89.4, 30.2], [-88, 30.4], [-85, 29.7], [-83.7, 29.9], [-82.7, 28], [-81.8, 26], [-80.4, 25.2], [-80.1, 26.9], [-81.3, 30.4], [-80.9, 32.1], [-78, 33.9], [-75.5, 35.3], [-76.3, 37], [-75.2, 38.5], [-74, 40.5], [-72, 41.1], [-70, 41.6], [-70.6, 42.7], [-70.2, 43.7], [-67, 44.8], [-67.8, 47.1], [-69.2, 47.4], [-71.5, 45], [-74.9, 45], [-76.8, 43.6], [-79, 43.3], [-79.1, 42.9], [-82.4, 41.7], [-83.4, 42], [-82.5, 43], [-82.4, 45.3], [-84.6, 46.5], [-88.4, 48.3], [-89.6, 48], [-95.2, 49], [-123, 49]];
const usP = ([lon, lat]: [number, number]): [number, number] => [130 + (lon + 126) * 28, 110 + (50 - lat) * 33];
const US = "M" + US_LL.map((q) => usP(q).join(" ")).join(" L ") + " Z";
// spots along coasts and big rivers where shipping lanes pass under bridges (illustrative placement, not the NTSB list)
const US_SPOTS: [number, number][] = [[-122.4, 37.8], [-122.3, 47.6], [-123.8, 46.2], [-118.2, 33.8], [-117.2, 32.7], [-97.4, 27.8], [-95, 29.6], [-93.8, 29.9], [-90.1, 29.95], [-91.1, 30.5], [-90.2, 32.3], [-90.1, 35.1], [-90.2, 38.6], [-91.4, 40.4], [-91.2, 43.8], [-88, 30.6], [-82.5, 27.7], [-81.6, 30.3], [-81.1, 32.1], [-79.9, 32.8], [-77.9, 34.2], [-76.3, 36.9], [-77, 38.9], [-75.5, 39.7], [-75.1, 40], [-74, 40.7], [-73.9, 40.8], [-71.4, 41.7], [-71, 42.3], [-70.2, 43.7], [-82.7, 41.6], [-83.1, 42.3], [-87.6, 41.9], [-84.5, 39.1], [-85.8, 38.2], [-80, 40.4], [-86.8, 36.2], [-88.6, 37.1]];
const UsmapT: Tpl = ({ t, d, p }) => {
  const st = Number(p.step ?? 1);
  const n = st === 1 ? 0 : st === 2 ? Math.round(68 * ramp(t, 4, d - 4)) : 68;
  return (
    <AbsoluteFill style={{ background: "#9fd3ee" }}><Svg>
      <path d={US} fill="#efe0b6" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <g transform={`translate(${usP([-76.6, 39.3]).join(" ")})`}><circle r={14} fill={RED} stroke={INK} strokeWidth={4} /><T3 x={70} y={-24} size={36}>Baltimore</T3></g>
      {Array.from({ length: n }).map((_, i) => {
        const [x, y] = usP(US_SPOTS[i % US_SPOTS.length]);
        const j = Math.floor(i / US_SPOTS.length);
        return <circle key={i} cx={x + j * 14 * (rnd(i) - 0.5) * 2} cy={y + j * 14 * (rnd(i + 3) - 0.5) * 2} r={10} fill={YEL} stroke={INK} strokeWidth={3} />;
      })}
      {st === 3 && <g transform={`translate(${usP([-122.5, 37.8]).join(" ")}) scale(${pop(t, 4)})`}><circle r={80} fill="none" stroke={RED} strokeWidth={10} /><T3 x={220} y={-60} size={46} color={RED}>GOLDEN GATE</T3></g>}
      {st >= 2 && <T3 x={960} y={1000} size={60} color={YEL}>{n} bridges to check</T3>}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== FORT: Fort McHenry, the flag, the buoy
const FortT: Tpl = ({ t, p, w }) => {
  const st = Number(p.step ?? 1);
  const night = st === 2;
  return (
    <AbsoluteFill style={{ background: night ? NIGHT1 : st === 3 ? "#f2b98a" : "#bfe0f2" }}><Svg>
      {night && <NightSky t={t} />}
      <River t={t} y={720} night={night} />
      <path d="M520 720 L 600 600 L 1000 560 L 1400 600 L 1480 720 Z" fill="#9b6b4a" stroke={INK} strokeWidth={6} />
      <path d="M560 600 L 620 520 L 1000 490 L 1380 520 L 1440 600 Z" fill="#7d5a3e" stroke={INK} strokeWidth={6} />
      <line x1={1000} y1={490} x2={1000} y2={160} stroke={INK} strokeWidth={8} />
      {st !== 4 && (
        <g transform={`translate(1004 170) skewY(${Math.sin(t * 0.2) * 4})`}>
          <rect x={0} y={0} width={300} height={190} fill="#fff" stroke={INK} strokeWidth={5} />
          {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={0} y={i * 27} width={300} height={13} fill="#c8202f" />)}
          <rect x={0} y={0} width={120} height={100} fill="#1f3a8a" />
        </g>
      )}
      {night && Array.from({ length: 6 }).map((_, i) => { const k = ((t * 0.02 + i / 6) % 1); return <circle key={i} cx={300 + i * 260} cy={200 + Math.sin(k * Math.PI) * -120 + 300 * k} r={10} fill="#ffb347" opacity={1 - k} />; })}
      {st === 3 && <T3 x={960} y={1000} size={56} color="#fff">“The Star-Spangled Banner”</T3>}
      {st === 4 && (
        <g>
          <g transform={`translate(960 ${740 + Math.sin(t * 0.15) * 6})`}>
            <path d="M-50 0 L 50 0 L 34 -150 L -34 -150 Z" fill="#fff" stroke={INK} strokeWidth={6} />
            <rect x={-46} y={-60} width={92} height={24} fill="#c8202f" /><rect x={-40} y={-110} width={80} height={24} fill="#1f3a8a" />
          </g>
          <Actor a="salute" t={t} x={1500} y={1000} s={0.75} id="fort" w={w} />
        </g>
      )}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== ROUTE: schematic world route
const ROUTE_MAP = (
  <g>
    <rect width={W} height={H} fill="#7ec0de" />
    <path d="M120 220 Q 300 160 480 230 L 560 360 Q 470 470 520 560 L 600 700 Q 560 900 470 1000 L 420 880 Q 360 700 300 600 Q 200 500 160 380 Z" fill="#efe0b6" stroke={INK} strokeWidth={6} />
    <path d="M820 300 Q 900 220 1050 230 L 1100 330 L 1060 420 L 1120 520 Q 1100 700 1000 860 Q 930 760 900 640 Q 830 560 840 460 Z" fill="#efe0b6" stroke={INK} strokeWidth={6} />
    <path d="M1100 200 Q 1500 140 1840 220 L 1860 420 Q 1760 500 1640 520 Q 1560 620 1460 560 L 1400 480 Q 1300 520 1240 450 L 1120 330 Z" fill="#efe0b6" stroke={INK} strokeWidth={6} />
    <ellipse cx={1500} cy={640} rx={30} ry={44} fill="#efe0b6" stroke={INK} strokeWidth={5} />
  </g>
);
const RouteT: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "srilanka";
  const pts = m === "srilanka" ? [[470, 360], [700, 420], [900, 430], [1060, 360], [1160, 470], [1340, 560], [1500, 600]] : [[1660, 520], [1840, 600], [1920, 640], [0, 640], [120, 600], [300, 560], [420, 520]];
  const k = ramp(t, 4, d - 4);
  const n = Math.max(2, Math.ceil(pts.length * k));
  const path = pts.slice(0, n).map((q, i) => `${i && !(m === "asia" && i === 3) ? "L" : "M"}${q[0]} ${q[1]}`).join(" ");
  return (
    <AbsoluteFill><Svg>
      {ROUTE_MAP}
      <path d={path} stroke={INK} strokeWidth={16} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={path} stroke={RED} strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="20 12" />
      {m === "srilanka" ? <><T3 x={470} y={320} size={40}>BALTIMORE</T3><T3 x={1500} y={720} size={40}>SRI LANKA</T3></> : <><T3 x={1600} y={470} size={40}>ASIA</T3><T3 x={420} y={480} size={40}>CENTRAL AMERICA</T3></>}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== END CARD → Ever Given
const Endcard5: Tpl = ({ t, w }) => (
  <AbsoluteFill style={{ background: NAVY }}>
    <Svg>
      <Rays t={t} />
      <g transform="translate(900 200)">
        <rect x={0} y={0} width={860} height={484} rx={24} fill="#e8d6a6" stroke={INK} strokeWidth={8} />
        <defs><clipPath id="thumb5"><rect x={0} y={0} width={860} height={484} rx={24} /></clipPath></defs>
        <g clipPath="url(#thumb5)">
          <path d="M0 160 Q 430 140 860 170 L 860 330 Q 430 350 0 320 Z" fill={WATER} stroke={INK} strokeWidth={6} />
          <g transform="translate(430 245) rotate(-24) scale(1.9)">
            <path d="M-150 -24 L 110 -25 Q 146 -12 152 0 Q 146 12 110 25 L -150 24 Q -156 0 -150 -24 Z" fill="#2f7d4a" stroke={INK} strokeWidth={3} />
            {Array.from({ length: 19 }).map((_, c) => Array.from({ length: 4 }).map((__, r) => <rect key={`${c}${r}`} x={-134 + c * 12.6} y={-20 + r * 10} width={11.6} height={9} fill={BOX[(c * 5 + r * 3) % BOX.length]} stroke={INK} strokeWidth={0.7} />))}
          </g>
        </g>
        <T3 x={430} y={110} size={80} color={YEL}>STUCK!</T3>
        <T3 x={430} y={560} size={46}>The Ever Given</T3>
      </g>
      <g transform={`translate(1330 ${820 + Math.sin(t * 0.2) * 4})`}>
        <rect x={-300} y={-60} width={600} height={120} rx={60} fill={RED} stroke={INK} strokeWidth={8} />
        <Num x={0} y={22} size={64} color="#fff">SUBSCRIBE</Num>
      </g>
      <Actor a="point" t={t} x={420} y={1040} s={0.95} id="end5" w={w} />
    </Svg>
  </AbsoluteFill>
);

export const TEMPLATES5B: Record<string, Tpl> = {
  power: PowerT, wire: WireT, anchor: AnchorT, radio: RadioT, under: UnderT, memorial: MemorialT, risk: RiskT, skyway: SkywayT,
  ntsb: NtsbT, clocks: ClocksT, pump: PumpT, port: PortT, crane: CraneT, blast: BlastT, price: PriceT, usmap: UsmapT,
  fort: FortT, route: RouteT, endcard5: Endcard5,
};
