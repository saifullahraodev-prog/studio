// The Ship Guy: Costa Concordia (video #8), part 4: the bill, the verdicts, the report's findings, the quiet recap and the end card.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { Svg, ramp } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, pop } from "./templates3";
import { NightSky, YEL, RED, LAMP } from "./templates5";
import { DaySky } from "./templates6";
import { O, Txt, ease } from "./templates7";
import { Liner, LinerEnd, Quay8 } from "./templates8";

const SEA = "#3f86b0";
const Tag8: React.FC<{ x: number; y: number; s: number; text: string; c?: string; rot?: number }> = ({ x, y, s, text, c = "#f4e2a0", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <line x1={0} y1={0} x2={0} y2={-700} stroke={INK} strokeWidth={6} />
    <path d="M-360 -110 L 280 -110 L 380 0 L 280 110 L -360 110 Z" fill={c} {...O(9)} transform="translate(-280 0)" />
    <circle cx={0} cy={0} r={22} fill="#fff" {...O(6)} />
    <Txt x={-320} y={36} s={text.length > 9 ? 92 : 120}>{text}</Txt>
  </g>
);

/** the bill: a giant receipt; the €1.5B tag; ≈ $2B; the build price next to it */
const Cost8: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "bill";
  if (m === "bill") {
    const k = ease((t - 4) / Math.max(20, d - 6));
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#f2ead8" />
          <Actor a="amazed" t={t} x={700} y={1000} s={0.7} id="cost8" w={w} />
          <g transform="translate(1180 120)">
            <path d={`M-200 0 L 200 0 L 200 ${80 + k * 820} L -200 ${80 + k * 820} Z`} fill="#fff" {...O(6)} />
            {Array.from({ length: Math.floor(k * 16) }).map((_, i) => <g key={i}><rect x={-170} y={40 + i * 50} width={200 - (i % 3) * 40} height={14} rx={6} fill="#c9cbc4" /><rect x={90} y={40 + i * 50} width={80} height={14} rx={6} fill="#9aa4ad" /></g>)}
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  const k = ease((t - 4) / 12);
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={700} />
        <rect x={0} y={700} width={W} height={380} fill={SEA} />
        <g transform="translate(80 720)"><Liner L={1200} t={t} /></g>
        {m === "compare" && <g transform="translate(560 300)"><Tag8 x={0} y={0} s={0.55} text="€450M" /></g>}
        <g transform={`translate(${m === "compare" ? 1420 : 1200} ${-300 + k * 660})`}>
          <Tag8 x={0} y={0} s={m === "compare" ? 1.0 : 1.1} text={m === "usd" ? "≈ $2 BILLION" : "€1.5 BILLION"} c={m === "usd" ? "#bfe6a8" : "#ffb38a"} rot={-4 + Math.sin(t * 0.15) * 3 * k} />
        </g>
        {m === "compare" && <g transform={`translate(960 600) scale(${pop(t, 14)})`}><rect x={-160} y={-56} width={320} height={112} rx={20} fill={RED} {...O(6)} /><Txt x={0} y={24} s={64} c="#fff">3× MORE</Txt></g>}
      </Svg>
    </AbsoluteFill>
  );
};

/** a diver's helmet resting on the quay, a moment of quiet */
const Diver8: Tpl = ({ t }) => (
  <AbsoluteFill>
    <Svg>
      <DaySky hz={640} />
      <rect x={0} y={640} width={W} height={440} fill="#5d7f96" />
      <Quay8 x0={-40} x1={1960} y={760} h={340} />
      <g transform="translate(960 760)">
        <ellipse cx={0} cy={-2} rx={150} ry={20} fill="#000" opacity={0.15} />
        <path d="M-120 0 Q -130 -200 0 -210 Q 130 -200 120 0 Z" fill="#c9a23a" {...O(8)} />
        <circle cx={0} cy={-110} r={66} fill="#9fd3ee" {...O(7)} />
        <circle cx={0} cy={-110} r={66} fill="#1d2a3a" opacity={0.35} />
        {[-1, 1].map((s) => <circle key={s} cx={s * 96} cy={-120} r={26} fill="#9fd3ee" {...O(5)} />)}
        <rect x={-140} y={-24} width={280} height={30} rx={8} fill="#8a6a1a" {...O(5)} />
      </g>
      <rect width={W} height={H} fill="#000" opacity={0.18 + 0.05 * Math.sin(t * 0.05)} />
    </Svg>
  </AbsoluteFill>
);

/** court: convicted / 16 years / upheld 2017 (no likeness: an empty dock and the judges' bench) */
const Court8: Tpl = ({ t, p }) => {
  const m = p.mode ?? "charges";
  const g = Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - 8) / 8)) * Math.PI));
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#e8d6a6" />
        {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={40 + i * 300} y={0} width={40} height={1080} fill="#d9c18a" />)}
        <rect x={360} y={640} width={1200} height={440} fill="#7a4a2a" {...O(8)} />
        <rect x={400} y={670} width={1120} height={40} fill="#8a5a3a" />
        <g transform={`translate(1300 620) rotate(${-50 + g * 50})`}><rect x={-10} y={-120} width={20} height={120} fill="#5a3a22" {...O(4)} /><rect x={-50} y={-150} width={100} height={46} rx={10} fill="#5a3a22" {...O(5)} /></g>
        <ellipse cx={1300} cy={640} rx={60} ry={12} fill="#5a3a22" {...O(4)} />
        {m === "charges" && ["MANSLAUGHTER", "CAUSING THE SHIPWRECK", "ABANDONING SHIP"].map((c, i) => (
          <g key={c} transform={`translate(960 ${270 + i * 120}) scale(${pop(t, 6 + i * 22)})`}><rect x={-440} y={-50} width={880} height={100} rx={16} fill="#f4f4f0" {...O(6)} /><Txt x={0} y={20} s={52}>{c}</Txt></g>
        ))}
        {m === "years" && <g transform={`translate(960 360) scale(${pop(t, 6)}) rotate(-4)`}><rect x={-360} y={-130} width={720} height={260} rx={20} fill="#1d2025" {...O(8)} /><Txt x={0} y={50} s={170} c={YEL}>16 YEARS</Txt></g>}
        {m === "upheld" && (
          <g>
            <g transform="translate(960 300)"><rect x={-360} y={-130} width={720} height={260} rx={20} fill="#1d2025" {...O(8)} /><Txt x={0} y={50} s={170} c={YEL}>16 YEARS</Txt></g>
            <g transform={`translate(1240 460) rotate(-12) scale(${pop(t, 10)})`}><rect x={-230} y={-60} width={460} height={120} rx={12} fill="none" stroke={RED} strokeWidth={14} /><Txt x={0} y={24} s={72} c={RED}>UPHELD</Txt></g>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

/** the official report's findings: three stamps */
const Find8: Tpl = ({ t, p }) => {
  const n = Number(p.n ?? "0");
  const items = ["BEYOND WHAT IT WAS BUILT TO SURVIVE", "NO FLOOD SENSORS REQUIRED", "THE BRIDGE TEAM DIDN'T WORK AS A TEAM"];
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#7a5a3a" />
        <g transform="translate(330 560) rotate(-6) scale(0.62)">
          <rect x={-300} y={-380} width={600} height={760} rx={10} fill="#f4f4f0" {...O(8)} />
          <rect x={-300} y={-380} width={600} height={140} fill="#2c4a7a" />
          <Txt x={0} y={-290} s={44} c="#fff">MARINE CASUALTY</Txt>
          <Txt x={0} y={-250} s={32} c="#fff">INVESTIGATION</Txt>
          {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-240} y={-160 + i * 44} width={480 - (i % 3) * 60} height={14} rx={6} fill="#c9cbc4" />)}
        </g>
        {n === 0 && <g transform={`translate(1180 540) scale(${pop(t, 6)})`}><circle r={150} fill="#f4f4f0" {...O(8)} />{[-60, 0, 60].map((x, i) => <g key={i} transform={`translate(${x} 20)`}><circle cy={-50} r={22} fill={i === 1 ? "#1d1d22" : "#8e99a4"} {...O(4)} /><path d="M-26 40 Q -26 -20 0 -20 Q 26 -20 26 40 Z" fill={i === 1 ? "#1d1d22" : "#8e99a4"} {...O(4)} /></g>)}</g>}
        {n > 0 && items.slice(0, n).map((lab, i) => {
          const cur = i === n - 1;
          return (
            <g key={lab} transform={`translate(1200 ${240 + i * 270}) rotate(${-2 + i}) scale(${cur ? pop(t, 4) : 1})`} opacity={cur ? 1 : 0.6}>
              <rect x={-620} y={-90} width={1240} height={180} rx={16} fill="#f4f4f0" stroke={RED} strokeWidth={12} />
              <Txt x={0} y={20} s={lab.length > 30 ? 46 : 56} c={RED}>{lab}</Txt>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/** the empty bridge at night: one chair */
const Empty8: Tpl = ({ t, d }) => (
  <AbsoluteFill>
    <Svg>
      <rect width={W} height={H} fill="#141a22" />
      <rect x={120} y={110} width={1680} height={430} rx={12} fill="#0b1426" {...O(8)} />
      {[700, 1350].map((x, i) => <circle key={i} cx={x} cy={420} r={5} fill={LAMP} opacity={0.6} />)}
      {[540, 960, 1380].map((x) => <line key={x} x1={x} y1={110} x2={x} y2={540} stroke="#2a2f35" strokeWidth={12} />)}
      <rect x={0} y={640} width={W} height={440} fill="#22272e" {...O(6)} />
      <rect x={140} y={600} width={600} height={150} rx={14} fill="#1a1f26" {...O(6)} />
      <g transform="translate(1100 900)">
        <rect x={-70} y={-180} width={140} height={150} rx={20} fill="#3a3f46" {...O(6)} />
        <rect x={-90} y={-40} width={180} height={40} rx={12} fill="#3a3f46" {...O(6)} />
        <line x1={0} y1={0} x2={0} y2={110} stroke={INK} strokeWidth={14} />
        <path d="M-70 120 L 70 120" stroke={INK} strokeWidth={12} strokeLinecap="round" />
      </g>
      <rect width={W} height={H} fill="#000" opacity={ramp(t, d * 0.5, d) * 0.5} />
    </Svg>
  </AbsoluteFill>
);

/** end screen: the Dali video (left card) + subscribe */
const Endcard8: Tpl = ({ t, w }) => (
  <AbsoluteFill>
    <Svg>
      <rect width={W} height={H} fill="#f3f1ea" />
      <g transform={`translate(560 470) scale(${pop(t, 4)})`}>
        <rect x={-430} y={-250} width={860} height={500} rx={24} fill="#1d2025" {...O(10)} />
        <NightSkyCard />
        {/* a dark container ship heading for a bridge */}
        <path d="M-380 150 Q -200 20 0 10 Q 200 20 380 150" stroke="#8e99a4" strokeWidth={14} fill="none" />
        {[-260, -130, 0, 130, 260].map((x) => <line key={x} x1={x} y1={20 + Math.abs(x) * 0.3} x2={x} y2={200} stroke="#8e99a4" strokeWidth={10} />)}
        <g transform="translate(-140 200)"><rect x={-160} y={-40} width={300} height={40} fill="#2a3a5a" {...O(4)} />{Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-140 + i * 42} y={-76} width={38} height={36} fill={["#c94a3a", "#3a73b8", "#e0a23b"][i % 3]} {...O(3)} />)}</g>
        <g transform="translate(0 -150) rotate(-4)"><rect x={-260} y={-56} width={520} height={112} rx={14} fill={YEL} {...O(6)} /><Txt x={0} y={22} s={60}>BLACKOUT</Txt></g>
      </g>
      <g transform={`translate(1450 ${520 + Math.sin(t * 0.2) * 4})`}>
        <rect x={-300} y={-60} width={600} height={120} rx={60} fill={RED} {...O(8)} />
        <Txt x={0} y={22} s={64} c="#fff">SUBSCRIBE</Txt>
      </g>
      <Actor a="point" t={t} x={1450} y={1060} s={0.55} id="end8" w={w} flip />
    </Svg>
  </AbsoluteFill>
);
const NightSkyCard: React.FC = () => (
  <g>{Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={-400 + ((i * 97) % 800)} cy={-220 + ((i * 53) % 200)} r={2.5} fill="#fff" opacity={0.6} />)}</g>
);

export const TEMPLATES8D: Record<string, Tpl> = { cost8: Cost8, diver8: Diver8, court8: Court8, find8: Find8, empty8: Empty8, endcard8: Endcard8 };
export const _u8d = [NightSky, T3, LinerEnd];
