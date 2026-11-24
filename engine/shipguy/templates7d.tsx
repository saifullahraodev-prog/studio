// The Ship Guy: Felicity Ace video (#7), part 4 scenes: the 2023 Fremantle Highway fire (one crew member died: quiet,
// no gags), new guidance and rules, the closing image, and the end card. Frame-driven only.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES } from "./guy";
import { ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, pop } from "./templates3";
import { NightSky, YEL, RED } from "./templates5";
import { DaySky, OpenSea } from "./templates6";
import { Car, CarTop, CAR_COLORS, O, Pctc, Txt, ease } from "./templates7";

// ================================================================== Fremantle Highway, July 2023 (quiet)
const Fremantle: Tpl = ({ t, p }) => {
  const m = p.mode ?? "year";
  if (m === "year") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#1f2328" />
          <g transform="translate(960 540)" opacity={ramp(t, 0, 12)}>
            <rect x={-240} y={-280} width={480} height={560} rx={20} fill="#efe9dc" {...O(8)} />
            <rect x={-240} y={-280} width={480} height={120} rx={20} fill="#5a636c" {...O(8)} />
            <Txt x={0} y={-200} s={64} c="#efe9dc">JULY</Txt>
            <Txt x={0} y={110} s={200}>2023</Txt>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  // ship / quiet: a grey North Sea, the ship far off with smoke; the quiet beat just holds and dims
  const dim = m === "quiet" ? ramp(t, 0, 20) * 0.45 : 0;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#7d8a96" />
        <rect y={640} width={W} height={440} fill="#4a5a68" />
        {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M${(i * 211 + t * 0.4) % W} ${700 + (i % 4) * 80} q 20 -6 40 0`} stroke="#6a7a88" strokeWidth={4} fill="none" />)}
        <g transform="translate(560 660) scale(0.55)"><Pctc L={1400} t={t} fire={0.6} scorch={0.4} name={false} water={false} /></g>
        <rect width={W} height={H} fill="#000" opacity={dim} />
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== new guidance and rules
const Rules: Tpl = ({ t, p, w }) => {
  const m = p.mode ?? "emsa";
  if (m === "emsa" || m === "imo") {
    const imo = m === "imo";
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#e8eef2" />
          <g transform={`translate(760 560) rotate(-3) scale(${pop(t, 4)})`}>
            <rect x={-360} y={-420} width={720} height={840} rx={16} fill={imo ? "#2c4a7a" : "#2f5fb0"} {...O(8)} />
            {imo ? <circle cx={0} cy={-200} r={110} fill="none" stroke="#fff" strokeWidth={10} /> : Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={Math.cos((i / 12) * Math.PI * 2) * 110} cy={-200 + Math.sin((i / 12) * Math.PI * 2) * 110} r={14} fill={YEL} />)}
            <Txt x={0} y={20} s={56} c="#fff">{imo ? "IMO" : "EMSA"}</Txt>
            <Txt x={0} y={100} s={40} c="#fff">{imo ? "VEHICLE CARRIER" : "ELECTRIC CARS"}</Txt>
            <Txt x={0} y={150} s={40} c="#fff">{imo ? "FIRE SAFETY" : "ON SHIPS: GUIDANCE"}</Txt>
            {imo && <Txt x={0} y={300} s={44} c={YEL}>DRAFT…</Txt>}
          </g>
          {imo && <g transform={`translate(1300 ${560 + Math.sin(t * 0.6) * 20}) rotate(30)`}><rect x={-14} y={-160} width={28} height={260} rx={8} fill={YEL} {...O(5)} /><path d="M-14 100 L 0 140 L 14 100 Z" fill="#2a2d33" /></g>}
          <Actor a={imo ? "notes" : "clipboard"} t={t} x={1580} y={1060} s={0.6} id="rul" w={w} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "detect") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#1d2025" />
          <rect x={260} y={160} width={1400} height={760} rx={20} fill="#0b1426" {...O(10)} />
          {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 8 }).map((__, c) => {
            const hot = r === 1 && c === 5;
            return <g key={`${r}${c}`} transform={`translate(${380 + c * 165} ${270 + r * 170})`}><rect x={-60} y={-30} width={120} height={60} rx={20} fill={hot ? (Math.floor(t / 6) % 2 ? "#ff3a2a" : "#ffb03a") : "#2c4a9a"} /><rect x={-24} y={-22} width={48} height={44} rx={10} fill={hot ? "#ffe08a" : "#3a64c0"} /></g>;
          }))}
          <g opacity={ramp(t, 10, 18)}><rect x={380 + 5 * 165 - 90} y={270 + 170 - 60} width={180} height={120} fill="none" stroke={YEL} strokeWidth={8} /><T3 x={380 + 5 * 165} y={270 + 170 - 80} size={44} color={YEL}>HOT!</T3></g>
          <Txt x={360} y={900} s={36} c="#4dff7a" a="start">THERMAL CAMERA · DECK 1</Txt>
        </Svg>
      </AbsoluteFill>
    );
  }
  // fight: an early, small fire knocked down before it spreads
  const k = ease((t - 6) / 40);
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#4a525b" />
        <rect x={0} y={820} width={W} height={260} fill="#5a636c" />
        {Array.from({ length: 6 }).map((_, i) => <g key={i} transform={`translate(${260 + i * 290} 820)`}><Car kind={(["sport", "suv", "sedan"] as const)[i % 3]} c={CAR_COLORS[i % CAR_COLORS.length]} s={2} glow={i === 3 ? 0.8 * (1 - k) : 0} /></g>)}
        <path d={`M300 560 Q 700 ${480 + Math.sin(t * 0.3) * 10} 1100 700`} stroke="#9fd3ee" strokeWidth={20} fill="none" opacity={0.85} />
        <Actor a="push" t={t} x={220} y={1060} s={0.55} id="fgt" outfit="coverall" over={{ emote: undefined, face: FACES.confident }} />
        <g transform={`translate(1500 260) scale(${pop(t, 30)})`}><circle r={70} fill="#3f9a4f" {...O(6)} /><path d="M-30 0 L -6 22 L 34 -22" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" /></g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the closing image: a new car carrier full of electric cars at sunrise
const Future: Tpl = ({ t }) => (
  <AbsoluteFill>
    <Svg>
      <NightSky t={t} dawn={0.95} />
      <circle cx={1500} cy={640} r={150} fill="#ffd27a" opacity={0.9} />
      <OpenSea t={t} y={680} />
      <g transform={`translate(${200 + t * 1.2} 700)`}><Pctc L={1300} xray={1} t={60} name={false} /></g>
      {Array.from({ length: 8 }).map((_, i) => <g key={i} transform={`translate(${380 + i * 140 + t * 1.2} 420)`} opacity={ramp(t, 6 + i * 4, 12 + i * 4)}><path d="M8 -30 L -10 0 L 2 0 L -6 26 L 14 -6 L 2 -6 Z" fill={YEL} stroke={INK} strokeWidth={3} /></g>)}
    </Svg>
  </AbsoluteFill>
);

// ================================================================== end card: next video ($100,000 a day) + subscribe
const Endcard7: Tpl = ({ t, w }) => (
  <AbsoluteFill>
    <Svg>
      <rect width={W} height={H} fill="#f3f1ea" />
      <g transform={`translate(560 470) scale(${pop(t, 4)})`}>
        <rect x={-430} y={-250} width={860} height={500} rx={24} fill="#1d2025" {...O(10)} />
        <g transform="translate(-230 150) scale(0.32)"><Pctc L={1400} name={false} water={false} /></g>
        <g transform="translate(0 -110) rotate(-4)"><rect x={-300} y={-60} width={600} height={120} rx={14} fill="#f4e2a0" {...O(6)} /><Txt x={0} y={22} s={60}>$100,000 / DAY</Txt></g>
      </g>
      <g transform={`translate(1450 ${520 + Math.sin(t * 0.2) * 4})`}>
        <rect x={-300} y={-60} width={600} height={120} rx={60} fill={RED} {...O(8)} />
        <Txt x={0} y={22} s={64} c="#fff">SUBSCRIBE</Txt>
      </g>
      <Actor a="point" t={t} x={1450} y={1060} s={0.55} id="end7" w={w} flip />
    </Svg>
  </AbsoluteFill>
);

export const TEMPLATES7D: Record<string, Tpl> = { fremantle: Fremantle, rules: Rules, future: Future, endcard7: Endcard7 };
export { DaySky as DaySky7D, CarTop as CarTop7D };
