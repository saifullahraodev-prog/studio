// The Ship Guy: scene templates for "The $2 Billion Job to Raise a Sunken Cruise Ship" (Costa Concordia, video #8), part 1
// (hook: the bill first, the ship, the route, too close / too fast). Same rules as templates7: full 1920x1080 frame from (t, d, p, w).
// Serious story (32 people died): the Ship Guy reacts only in the money / engineering beats; night shots stay quiet.
// No company logos: the funnel is plain yellow with a blue band, names appear only as plain text.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, IDLE, POSES } from "./guy";
import { ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, clamp01, pop } from "./templates3";
import { NightSky, rnd, YEL, RED, LAMP } from "./templates5";
import { DaySky, OpenSea } from "./templates6";
import { O, Txt, ease } from "./templates7";

const NAVY8 = "#1f3a68", FUN = "#f2c230", HULLW = "#f6f5ef", ANTI = "#b8432f";

// ================================================================== the cruise ship, side view (stern left, bow right, waterline y = 0, design 1000)
const LHULL = "M14 -86 L 880 -92 Q 948 -94 992 -70 Q 1006 -50 990 -18 Q 976 14 936 34 L 84 36 Q 40 36 22 12 Q 6 -18 14 -86 Z";
export const Liner: React.FC<{ L?: number; night?: number; dark?: number; gash?: number; water?: boolean; t?: number; name?: boolean; xray?: number }> = ({ L = 1300, night = 0, dark = 0, gash = 0, water = true, t = 0, name = true, xray = 0 }) => {
  const k = L / 1000, sw = (w: number) => w / k, cid = `lh${Math.round(L)}`;
  const lit = (i: number) => {
    // windows: day = dark blue glass; night = warm lamps (some off); blackout = almost all off, a few flicker
    if (night <= 0) return "#3b5f86";
    if (dark > 0) return rnd(i) > 0.96 && Math.sin(t * 0.7 + i) > 0.2 ? LAMP : "#1a2436";
    return rnd(i) > 0.18 ? LAMP : "#2a3550";
  };
  const tiers = 9;
  return (
    <g transform={`scale(${k})`}>
      <defs><clipPath id={cid}><path d={LHULL} /></clipPath></defs>
      {/* superstructure: 9 decks of balconies, terraced at the stern, rounded at the bow */}
      {Array.from({ length: tiers }).map((_, j) => {
        const y = -92 - (j + 1) * 20, a = 34 + j * 5 + (j > 5 ? (j - 5) * 26 : 0), b = 905 - j * j * 2.6 - j * 4;
        const n = Math.floor((b - a - 10) / 13);
        return (
          <g key={j}>
            <path d={`M${a} ${y + 20} L ${a} ${y} L ${b - 14} ${y} Q ${b} ${y + 2} ${b + 6} ${y + 20} Z`} fill={night > 0 ? "#dcdcd4" : HULLW} {...O(sw(2.5))} />
            {Array.from({ length: n }).map((__, i) => <rect key={i} x={a + 6 + i * 13} y={y + 5} width={9} height={9} fill={lit(j * 97 + i)} />)}
            <line x1={a} y1={y + 16} x2={b} y2={y + 16} stroke={night > 0 ? "#9aa4ad" : "#c9cbc4"} strokeWidth={sw(1.5)} />
          </g>
        );
      })}
      {/* bridge: dark window band near the bow on deck 7, bridge wings sticking out */}
      <rect x={760} y={-252} width={150} height={12} fill="#1d2a3a" />
      <rect x={748} y={-256} width={176} height={6} fill={HULLW} {...O(sw(2))} />
      {/* lifeboats in a row along deck 2 */}
      {Array.from({ length: 13 }).map((_, i) => <g key={i} transform={`translate(${120 + i * 54} -110)`}><path d="M-20 0 Q -20 -10 -10 -12 L 12 -12 Q 22 -10 22 0 Q 0 6 -20 0 Z" fill="#ff8a3a" {...O(sw(2))} /></g>)}
      {/* top deck: pools, a water slide, a mast */}
      <rect x={420} y={-282} width={90} height={8} rx={3} fill="#3fb4e8" {...O(sw(1.5))} />
      <rect x={560} y={-282} width={70} height={8} rx={3} fill="#3fb4e8" {...O(sw(1.5))} />
      <path d="M300 -274 q 20 -60 70 -50 q 40 10 30 50" fill="none" stroke="#e8352b" strokeWidth={sw(7)} />
      <path d="M820 -256 L 822 -300 M806 -288 L 838 -288" stroke={INK} strokeWidth={sw(3)} fill="none" />
      {/* funnel: plain yellow with a blue band (no logo) */}
      <path d="M170 -272 L 180 -340 Q 214 -350 252 -340 L 258 -272 Z" fill={FUN} {...O(sw(3.5))} />
      <rect x={176} y={-326} width={78} height={10} fill={NAVY8} />
      <path d="M182 -340 L 184 -348 L 250 -348 L 252 -340" fill="#2a2d33" stroke={INK} strokeWidth={sw(2)} />
      {/* hull: white topsides, a thin navy boot-top, red antifouling below the waterline */}
      <g clipPath={`url(#${cid})`}>
        <rect x={0} y={-100} width={1010} height={100} fill={night > 0 ? "#e4e3dc" : HULLW} />
        <rect x={0} y={-12} width={1010} height={12} fill={NAVY8} />
        <rect x={0} y={0} width={1010} height={60} fill={ANTI} />
        {Array.from({ length: 52 }).map((_, i) => <circle key={i} cx={60 + i * 17} cy={-46} r={2.8} fill={lit(900 + i)} />)}
        {Array.from({ length: 30 }).map((_, i) => <rect key={`d${i}`} x={60 + i * 29} y={-74} width={18} height={10} rx={2} fill={lit(1000 + i)} />)}
        {gash > 0 && <path d={`M${560} 8 l 16 -8 l 14 12 l 18 -10 l 16 12 l 20 -12 l 14 12 l 18 -10 l 16 10 l 18 -8 l 0 16 l -${150 * gash} 4 Z`} fill="#1a1414" opacity={gash} />}
      </g>
      <path d={LHULL} fill="none" {...O(sw(5))} />
      {name && <Txt x={810} y={-28} s={18} c={NAVY8}>COSTA CONCORDIA</Txt>}
      {/* x-ray: what's inside */}
      {xray > 0 && (
        <g opacity={xray}>
          <rect x={60} y={-272} width={820} height={176} fill="#f8f6ee" opacity={0.92} {...O(sw(2))} />
          {Array.from({ length: 8 }).map((_, i) => <g key={i}><line x1={60} y1={-250 + i * 20} x2={880} y2={-250 + i * 20} stroke="#c9cbc4" strokeWidth={sw(1.5)} />{Array.from({ length: 20 }).map((__, j) => <rect key={j} x={70 + j * 40} y={-266 + i * 20} width={34} height={13} fill={["#f2d9a6", "#cfe6f2", "#f4c9b8", "#d9e8c4"][(i + j) % 4]} />)}</g>)}
        </g>
      )}
      {night > 0 && dark === 0 && <ellipse cx={500} cy={-180} rx={560} ry={160} fill={LAMP} opacity={0.06 * night} />}
      {water && <g><rect x={-60} y={8} width={1140} height={70} fill={night > 0 ? "#0f2440" : "#3f86b0"} opacity={0.94} />{Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${(i * 140 + t * 1.2) % 1100 - 40} ${26 + (i % 3) * 14} q 14 -5 28 0 t 28 0`} stroke={night > 0 ? "#24476f" : "#bfe6f5"} strokeWidth={sw(3)} fill="none" />)}</g>}
    </g>
  );
};

/** the cruise ship seen from the stern (end view), keel at (0, 0), upright = rot 0. Positive rot = lying over to the right. */
export const LinerEnd: React.FC<{ s?: number; rot?: number; sponsons?: number; rust?: number; t?: number }> = ({ s = 1, rot = 0, sponsons = 0, rust = 0 }) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    {/* sponsons: big steel boxes welded on the left side (the side that faces up when she lies over) */}
    {sponsons > 0 && Array.from({ length: 3 }).map((_, i) => <g key={i} opacity={clamp01(sponsons * 3 - i)}><rect x={-118} y={-40 - i * 70} width={46} height={64} rx={4} fill="#d06a2e" {...O(4)} /><rect x={-112} y={-30 - i * 70} width={34} height={8} fill="#a8521f" /></g>)}
    {/* superstructure, stern face: decks of windows */}
    <rect x={-62} y={-292} width={124} height={196} fill={HULLW} {...O(5)} />
    {Array.from({ length: 9 }).map((_, j) => <g key={j}>{Array.from({ length: 6 }).map((__, i) => <rect key={i} x={-52 + i * 18} y={-284 + j * 21} width={12} height={10} fill="#3b5f86" />)}<line x1={-62} y1={-274 + j * 21} x2={62} y2={-274 + j * 21} stroke="#c9cbc4" strokeWidth={2} /></g>)}
    {/* lifeboats hanging on both sides */}
    {[-1, 1].map((sd) => <g key={sd}>{[0, 1].map((i) => <ellipse key={i} cx={sd * 72} cy={-130 - i * 22} rx={10} ry={9} fill="#ff8a3a" {...O(3)} />)}</g>)}
    {/* funnel */}
    <path d="M-20 -292 L -16 -336 L 16 -336 L 20 -292 Z" fill={FUN} {...O(4)} />
    <rect x={-17} y={-326} width={34} height={8} fill={NAVY8} />
    {/* hull */}
    <path d="M-70 -96 L -70 -30 Q -70 0 -40 0 L 40 0 Q 70 0 70 -30 L 70 -96 Z" fill={HULLW} {...O(5)} />
    <path d="M-70 -44 L -70 -30 Q -70 0 -40 0 L 40 0 Q 70 0 70 -30 L 70 -44 Z" fill={ANTI} {...O(4)} />
    <line x1={-70} y1={-52} x2={70} y2={-52} stroke={NAVY8} strokeWidth={8} />
    {rust > 0 && <g opacity={rust}><path d="M18 -292 L 62 -292 L 62 -30 Q 62 -6 40 -4 L 18 -4 Z" fill="#7a5a3a" /><path d="M30 -260 l 20 30 l -14 40 l 22 50 l -18 60" stroke="#4a3422" strokeWidth={4} fill="none" /></g>}
  </g>
);

/** the cruise ship from above (bow right), length 1000, centre (0,0) */
export const LinerTop: React.FC<{ s?: number; night?: boolean }> = ({ s = 1, night }) => (
  <g transform={`scale(${s})`}>
    <path d="M-500 -58 L 330 -60 Q 470 -40 506 0 Q 470 40 330 60 L -500 58 Q -516 0 -500 -58 Z" fill={night ? "#cfd3d6" : HULLW} {...O(6)} />
    <rect x={-430} y={-40} width={700} height={80} rx={14} fill={night ? "#b8bec3" : "#e2e2da"} {...O(3)} />
    <rect x={-60} y={-24} width={90} height={48} rx={8} fill="#3fb4e8" {...O(3)} />
    <rect x={90} y={-18} width={60} height={36} rx={6} fill="#3fb4e8" {...O(3)} />
    <ellipse cx={-300} cy={0} rx={34} ry={26} fill={FUN} {...O(4)} />
    {Array.from({ length: 12 }).map((_, i) => [-1, 1].map((sd) => <rect key={`${i}${sd}`} x={-380 + i * 54} y={sd * 52 - 6} width={34} height={12} rx={5} fill="#ff8a3a" {...O(2)} />))}
    {night && Array.from({ length: 20 }).map((_, i) => <circle key={i} cx={-460 + i * 44} cy={(i % 2 ? 1 : -1) * 46} r={4} fill={LAMP} />)}
  </g>
);

// ================================================================== shared bits
export const Quay8: React.FC<{ x0: number; x1: number; y: number; h?: number }> = ({ x0, x1, y, h = 200 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={h} fill="#a8aaa4" {...O(6)} />
    <rect x={x0} y={y} width={x1 - x0} height={16} fill="#c9cbc4" />
    {Array.from({ length: Math.max(1, Math.floor((x1 - x0) / 120)) }).map((_, i) => <line key={i} x1={x0 + 60 + i * 120} y1={y + 16} x2={x0 + 60 + i * 120} y2={y + h} stroke="#8e908a" strokeWidth={4} />)}
  </g>
);
/** a hanging price tag */
const Tag: React.FC<{ x: number; y: number; s: number; text: string; c?: string; rot?: number }> = ({ x, y, s, text, c = "#f4e2a0", rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <line x1={0} y1={0} x2={0} y2={-600} stroke={INK} strokeWidth={6} />
    <path d="M-360 -110 L 280 -110 L 380 0 L 280 110 L -360 110 Z" fill={c} {...O(9)} transform="translate(-280 0)" />
    <circle cx={0} cy={0} r={22} fill="#fff" {...O(6)} />
    <Txt x={-320} y={36} s={text.length > 8 ? 96 : 120}>{text}</Txt>
  </g>
);
/** a rocky Mediterranean island seen from the sea (side view), harbour houses on the slope */
export const Island: React.FC<{ x: number; y: number; s?: number; night?: boolean }> = ({ x, y, s = 1, night }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-520 0 Q -460 -180 -300 -230 Q -160 -300 -20 -240 Q 120 -190 220 -80 Q 280 -30 320 0 Z" fill={night ? "#1d2a22" : "#6f8a4f"} {...O(6)} />
    <path d="M-520 0 Q -480 -60 -420 -70 Q -360 -40 -330 0 Z" fill={night ? "#2a2f35" : "#9aa4ad"} {...O(4)} />
    {Array.from({ length: 9 }).map((_, i) => <g key={i} transform={`translate(${60 + (i % 5) * 36} ${-70 - Math.floor(i / 5) * 40 - (i % 5) * 8})`}><rect x={-14} y={-24} width={28} height={24} fill={night ? "#3a3f46" : ["#f2d9a6", "#e8a87c", "#f4f4ee"][i % 3]} {...O(3)} />{night && <rect x={-5} y={-16} width={10} height={9} fill={LAMP} opacity={i % 3 === 0 ? 1 : 0.2} />}</g>)}
  </g>
);

// ================================================================== templates
/** hook: built for €450M, removing her cost 3x more */
const Bill8: Tpl = ({ t, p, w }) => {
  const st = p.stage ?? "1";
  const k1 = st === "1" ? ease((t - 4) / 16) : 1, k2 = st === "2" ? ease((t - 6) / 12) : 0;
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={700} />
        <OpenSea t={t} y={720} />
        <g transform={`translate(${60 - t * 0.3} 720)`}><Liner L={1300} t={t} /></g>
        <Quay8 x0={1480} x1={1960} y={900} />
        <g transform={`translate(${st === "2" ? 560 : 1000} ${-260 + k1 * (st === "2" ? 450 : 560)})`}><Tag x={0} y={0} s={st === "2" ? 0.62 : 0.95} text="€450M" rot={Math.sin(t * 0.12) * 3} /></g>
        {st === "2" && <g transform={`translate(1320 ${-300 + k2 * 640})`}><Tag x={0} y={0} s={1.0} text="€1.5 BILLION" c="#ffb38a" rot={-4 + Math.sin(t * 0.15) * 3 * k2} /></g>}
        {st === "2" && k2 > 0.95 && <g>{[0, 1, 2].map((i) => <path key={i} d={`M${700 + i * 70} ${560 - i * 10} l -30 -40`} stroke={INK} strokeWidth={8} strokeLinecap="round" />)}</g>}
        <Actor a={st === "2" ? "shock" : "point"} t={st === "2" ? Math.max(0, t - 14) : t} x={1700} y={910} s={0.55} id="bill8" w={w} over={st === "1" ? { flip: true } : undefined} />
      </Svg>
    </AbsoluteFill>
  );
};

/** hook: the wreck on her side by the island; not to repair her (X), just to scrap her */
const Wreck8: Tpl = ({ t, p }) => {
  const m = p.mode ?? "x";
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={640} />
        <Island x={620} y={660} s={1.2} />
        <rect x={0} y={640} width={W} height={H - 640} fill="#3f86b0" />
        {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${((i * 151 + t * 1.2) % (W + 200)) - 100} ${680 + (i % 5) * 70} q 22 -8 44 0 t 44 0`} stroke="#bfe6f5" strokeWidth={5} fill="none" />)}
        <g transform="translate(1020 690)"><LinerEnd s={1.25} rot={70} /></g>
        <rect x={0} y={660} width={W} height={H - 660} fill="#3f86b0" opacity={0.88} />
        {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${((i * 233 + t * 1.2) % (W + 200)) - 100} ${700 + (i % 4) * 80} q 22 -8 44 0 t 44 0`} stroke="#bfe6f5" strokeWidth={5} fill="none" />)}
        <line x1={0} y1={660} x2={W} y2={660} stroke="#bfe6f5" strokeWidth={5} />
        {m === "x" && [["🔧", 760], ["⛴", 1180]].map(([, x], i) => (
          <g key={i} transform={`translate(${x} 300) scale(${pop(t, 4 + i * 16)})`}>
            <circle r={120} fill="#f4f4f0" {...O(8)} />
            {i === 0 ? <g transform="rotate(-40)"><rect x={-14} y={-70} width={28} height={120} rx={8} fill="#8e99a4" {...O(5)} /><path d="M-40 -80 Q -40 -120 0 -120 Q 40 -120 40 -80 L 20 -80 L 20 -100 L -20 -100 L -20 -80 Z" fill="#8e99a4" {...O(5)} /></g>
              : <g transform="translate(0 30) scale(0.22)"><Liner L={1000} water={false} name={false} /></g>}
            {i === 1 && <g transform="translate(-110 -10)"><rect x={0} y={0} width={0} height={0} /></g>}
            <g opacity={ramp(t, 10 + i * 16, 14 + i * 16)}><path d="M-80 -80 L 80 80 M80 -80 L -80 80" stroke={RED} strokeWidth={24} strokeLinecap="round" /></g>
          </g>
        ))}
        {m === "x" && <g><T3 x={760} y={480} size={44} o={ramp(t, 8, 14)}>REPAIR</T3><T3 x={1180} y={480} size={44} o={ramp(t, 24, 30)}>SAIL AGAIN</T3></g>}
        {m === "scrap" && (
          <g>
            {/* a floating crane waiting next to the wreck */}
            <g transform={`translate(${1820 - ease(t / 30) * 100} 650)`}>
              <rect x={-150} y={-30} width={300} height={60} fill="#5a636c" {...O(6)} />
              <path d="M-40 -30 L -40 -320 L 160 -420" stroke="#e0a23b" strokeWidth={22} fill="none" strokeLinejoin="round" />
              <path d="M-40 -30 L -40 -320 L 160 -420" stroke={INK} strokeWidth={4} fill="none" />
              <line x1={160} y1={-420} x2={160} y2={-260 + Math.sin(t * 0.1) * 20} stroke={INK} strokeWidth={4} />
              <path d={`M140 ${-260 + Math.sin(t * 0.1) * 20} l -20 40 M180 ${-260 + Math.sin(t * 0.1) * 20} l 20 40`} stroke={INK} strokeWidth={8} />
            </g>
            <g transform={`translate(560 280) rotate(-6) scale(${pop(t, 10)})`}><rect x={-200} y={-70} width={400} height={140} rx={16} fill={YEL} {...O(8)} /><Txt x={0} y={30} s={86}>SCRAP</Txt></g>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

/** underwater cross-section: grout bags, platforms, sponsons, chains; the wreck rolling up (teaser stages 1-3) */
export const RollScene: React.FC<{ t: number; a: number; sponsons?: number; chains?: number; dark?: boolean }> = ({ t, a, sponsons = 1, chains = 1 }) => {
  const sy = 470, kx = 820, ky = 650;
  return (
    <g>
      <rect width={W} height={sy} fill="#bcd9ea" />
      <rect x={0} y={sy} width={W} height={H - sy} fill="#2f6f99" />
      <rect x={0} y={sy} width={W} height={H - sy} fill="#0d2238" opacity={0.25} />
      {/* the island slope + the rock shelf */}
      <path d={`M0 ${sy - 160} Q 260 ${sy - 170} 420 ${sy} L 760 ${ky + 10} L 1100 ${ky + 40} L 1920 ${ky + 240} L 1920 1080 L 0 1080 Z`} fill="#8a7a5a" {...O(6)} />
      <path d={`M0 ${sy - 160} Q 260 ${sy - 170} 420 ${sy} L 0 ${sy} Z`} fill="#6f8a4f" />
      {/* grout bags + 6 platforms */}
      {Array.from({ length: 5 }).map((_, i) => <ellipse key={i} cx={720 + i * 40} cy={ky + 18} rx={26} ry={14} fill="#c9c3b0" {...O(3)} />)}
      {Array.from({ length: 3 }).map((_, i) => <g key={i}><rect x={900 + i * 70} y={ky + 40 + i * 10} width={60} height={20} fill="#9aa4ad" {...O(4)} /><line x1={915 + i * 70} y1={ky + 60 + i * 10} x2={915 + i * 70} y2={ky + 120} stroke="#5a636c" strokeWidth={8} /><line x1={945 + i * 70} y1={ky + 60 + i * 10} x2={945 + i * 70} y2={ky + 120} stroke="#5a636c" strokeWidth={8} /></g>)}
      {/* the ship */}
      <g transform={`translate(${kx} ${ky})`}><LinerEnd s={1.5} rot={a} sponsons={sponsons} rust={clamp01((50 - a) / 30) * 0.8} /></g>
      {/* chains: from the sponsons' top edge, round under the hull, down to the seabed anchors */}
      {chains > 0 && (() => {
        const r = (a * Math.PI) / 180, px = (x: number, y: number) => [kx + (x * Math.cos(r) - y * Math.sin(r)) * 1.5, ky + (x * Math.sin(r) + y * Math.cos(r)) * 1.5];
        return [0, 1, 2].map((i) => {
          const [x1, y1] = px(-96, -50 - i * 70);
          return <path key={i} d={`M${x1} ${y1} Q ${kx - 120} ${ky + 80} ${1000 + i * 60} ${ky + 90}`} stroke="#3a3f46" strokeWidth={7} strokeDasharray="12 6" fill="none" opacity={chains} />;
        });
      })()}
      {/* sea surface on top (in front of the hull) */}
      <rect x={0} y={sy} width={W} height={6} fill="#bfe6f5" opacity={0.8} />
      {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M${((i * 197 + t * 1.2) % (W + 200)) - 100} ${sy + 4} q 22 -8 44 0 t 44 0`} stroke="#e8f6fb" strokeWidth={4} fill="none" />)}
    </g>
  );
};
const Roll8: Tpl = ({ t, d, p, w }) => {
  const st = p.stage ?? "1";
  const span: Record<string, [number, number]> = { "1": [68, 56], "2": [56, 42], "3": [42, 30] };
  const [a0, a1] = span[st];
  const a = a0 + (a1 - a0) * ease(t / Math.max(30, d));
  const strain = st !== "3" ? 1 : 1;
  return (
    <AbsoluteFill>
      <Svg>
        <RollScene t={t} a={a + Math.sin(t * 0.9) * 0.4 * strain} />
        {st === "2" && <g transform={`translate(1500 300) rotate(-6) scale(${pop(t, 8)})`}><rect x={-230} y={-70} width={460} height={140} rx={16} fill="#f4f4f0" {...O(8)} /><Txt x={0} y={30} s={64}>IN ONE PIECE</Txt></g>}
        {st === "3" && <g transform={`translate(1460 300) rotate(-8) scale(${pop(t, 10)})`}><rect x={-300} y={-80} width={600} height={160} rx={16} fill={RED} {...O(8)} /><Txt x={0} y={-12} s={46} c="#fff">NO SHIP THAT BIG</Txt><Txt x={0} y={48} s={46} c="#fff">EVER LIFTED LIKE THIS</Txt></g>}
        {st === "3" && <Actor a="amazed" t={t} x={200} y={340} s={0.42} id="roll8" w={w} />}
      </Svg>
    </AbsoluteFill>
  );
};

/** night at sea: the lit cruise ship gliding past (rewind / dinner / calm / quiet / dark coast) */
const Night8: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "sail";
  const hz = 640;
  if (m === "dinner") {
    // close on the windows of the dining room: tables, plates, guests as soft silhouettes
    return (
      <AbsoluteFill>
        <Svg>
          <NightSky t={t} />
          <rect x={0} y={180} width={W} height={720} fill="#e4e3dc" {...O(8)} />
          {Array.from({ length: 4 }).map((_, i) => {
            const x = 80 + i * 460 - (t * 1.2) % 460;
            return (
              <g key={i} transform={`translate(${x} 280)`}>
                <rect x={0} y={0} width={400} height={300} rx={20} fill="#ffcf7a" {...O(7)} />
                <rect x={0} y={0} width={400} height={300} rx={20} fill="#e89a4a" opacity={0.25} />
                <rect x={40} y={200} width={320} height={20} rx={6} fill="#f4f4f0" {...O(3)} />
                {[0, 1, 2].map((j) => <g key={j} transform={`translate(${90 + j * 110} 200)`}><circle cy={-70} r={26} fill="#5a3a3a" opacity={0.75} /><path d="M-34 0 Q -30 -44 0 -44 Q 30 -44 34 0 Z" fill="#5a3a3a" opacity={0.75} /><ellipse cx={0} cy={-6} rx={20} ry={5} fill="#fff" /></g>)}
              </g>
            );
          })}
          {Array.from({ length: 18 }).map((_, i) => <rect key={i} x={((i * 120 - t * 1.2) % 2160) - 120} y={660} width={40} height={40} rx={20} fill={LAMP} {...O(3)} />)}
          <rect x={0} y={900} width={W} height={180} fill="#0f2440" />
        </Svg>
      </AbsoluteFill>
    );
  }
  const far = m === "quiet" || m === "calm";
  const dim = m === "quiet" ? ramp(t, d * 0.3, d) * 0.55 : 0;
  const rew = m === "rewind";
  const x = rew ? 900 - t * 9 : far ? 360 + t * 0.9 : 120 + t * 0.8;
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <circle cx={1580} cy={180} r={60} fill="#f4f1de" opacity={0.9} />
        {m === "dark" && <g><path d={`M1100 ${hz} Q 1300 ${hz - 160} 1520 ${hz - 200} Q 1760 ${hz - 230} 1920 ${hz - 150} L 1920 ${hz} Z`} fill="#0b1220" {...O(5)} /><circle cx={1640} cy={hz - 170} r={5} fill={LAMP} /><circle cx={1360} cy={hz - 120} r={4} fill={LAMP} opacity={0.6} /></g>}
        <OpenSea t={t} y={hz} night />
        {m === "calm" && <path d={`M1540 ${hz + 20} L 1620 ${hz + 20} L 1660 ${H} L 1500 ${H} Z`} fill="#f4f1de" opacity={0.12} />}
        <g transform={`translate(${x} ${hz + 10}) scale(${far ? 0.55 : 1})`}><Liner L={1300} night={1} t={t} name={false} /></g>
        {rew && <g>{Array.from({ length: 6 }).map((_, i) => <rect key={i} x={0} y={(i * 197 + t * 40) % H} width={W} height={6} fill="#fff" opacity={0.18} />)}<g transform="translate(160 140)"><path d="M0 0 L 50 -34 L 50 34 Z M50 0 L 100 -34 L 100 34 Z" fill="#fff" {...O(4)} /></g>
          <g transform={`translate(960 260) scale(${pop(t, 16)})`}><rect x={-330} y={-70} width={660} height={140} rx={16} fill="#0b1426" {...O(6)} /><text x={0} y={30} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={70} fill={YEL}>13.01.2012</text></g></g>}
        {m === "sail" && <g transform={`translate(1500 220) scale(${pop(t, 6)})`}><rect x={-220} y={-60} width={440} height={120} rx={16} fill="#0b1426" {...O(6)} /><text x={0} y={26} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={64} fill={YEL}>21:45</text></g>}
        {dim > 0 && <rect width={W} height={H} fill="#000" opacity={dim} />}
      </Svg>
    </AbsoluteFill>
  );
};

/** the ship by day: name / built / length / passengers / inside (x-ray) / floating city */
const Liner8: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "name";
  const hz = 660;
  if (m === "name") {
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={hz} />
          <OpenSea t={t} y={hz + 40} />
          <g transform={`translate(${-1000 - t * 1.2} ${hz + 160}) scale(2.6)`}><Liner L={1000} t={t} /></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  const xr = m === "xray" ? ramp(t, 2, 10) : 0;
  const icons: [string, string][] = [["POOLS", "#3fb4e8"], ["THEATRES", "#c94a3a"], ["RESTAURANTS", "#e0a23b"], ["SPA", "#4f8a5b"]];
  const yard = m === "built";
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={hz} />
        <OpenSea t={t} y={hz + 20} />
        <g transform={`translate(${m === "city" ? 80 : 300} ${hz + 20})`}><Liner L={1300} t={t} xray={xr} /></g>
        {yard && (
          <g>
            <g transform="translate(1720 680)"><path d="M0 0 L 0 -560 L -260 -600" stroke="#e0a23b" strokeWidth={26} fill="none" strokeLinejoin="round" /><path d="M0 0 L 0 -560 L -260 -600" stroke={INK} strokeWidth={4} fill="none" /><line x1={-240} y1={-596} x2={-240} y2={-420} stroke={INK} strokeWidth={4} /></g>
            <g transform={`translate(560 200) rotate(-4) scale(${pop(t, 6)})`}><rect x={-170} y={-70} width={340} height={140} rx={16} fill="#f4f4f0" {...O(8)} /><Txt x={0} y={34} s={96} c={NAVY8}>2006</Txt></g>
          </g>
        )}
        {m === "len" && (() => { const lk = ease((t - 4) / 20); return <g><line x1={300} y1={250} x2={300 + 1300 * lk} y2={250} stroke={YEL} strokeWidth={10} /><line x1={300} y1={220} x2={300} y2={280} stroke={YEL} strokeWidth={10} />{lk > 0.98 && <line x1={1600} y1={220} x2={1600} y2={280} stroke={YEL} strokeWidth={10} />}<T3 x={950} y={210} size={84} color={YEL} s={pop(t, 22)}>≈ 290 m</T3></g>; })()}
        {m === "pax" && (() => { const n = Math.round(ease((t - 4) / Math.max(20, d - 16)) * 3780); return <g>{Array.from({ length: 40 }).map((_, i) => <g key={i} transform={`translate(${380 + (i % 20) * 58} ${hz - 300 + Math.floor(i / 20) * 70}) scale(${pop(t, 4 + i * 0.6)})`}><circle cy={-30} r={12} fill={["#c94a3a", "#3a73b8", "#e0a23b", "#4f8a5b"][i % 4]} {...O(3)} /><path d="M-14 0 Q -14 -20 0 -20 Q 14 -20 14 0 Z" fill={["#c94a3a", "#3a73b8", "#e0a23b", "#4f8a5b"][i % 4]} {...O(3)} /></g>)}<g transform="translate(960 190)"><rect x={-250} y={-70} width={500} height={140} rx={20} fill="#0b1426" {...O(6)} /><text x={0} y={36} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={96} fill={YEL}>{n.toLocaleString("en-US")}</text></g></g>; })()}
        {m === "xray" && icons.map(([lab, c], i) => {
          const at = (d * (i + 0.4)) / 4.4;
          return (
            <g key={lab} transform={`translate(${520 + i * 270} ${hz - 120}) scale(${pop(t, at)})`}>
              <circle r={70} fill={c} {...O(6)} />
              {i === 0 && <path d="M-40 10 q 10 -10 20 0 t 20 0 t 20 0 t 20 0" stroke="#fff" strokeWidth={8} fill="none" />}
              {i === 1 && <g><path d="M-36 -26 Q -36 26 -6 30 Q 4 0 4 -26 Z" fill="#fff" /><path d="M6 -16 Q 6 36 36 40 Q 46 10 46 -16 Z" fill="#ffd23f" /></g>}
              {i === 2 && <g><circle r={28} fill="#fff" /><line x1={-44} y1={-30} x2={-44} y2={30} stroke="#fff" strokeWidth={8} /><line x1={44} y1={-30} x2={44} y2={30} stroke="#fff" strokeWidth={8} /></g>}
              {i === 3 && <path d="M0 30 Q -40 0 0 -36 Q 40 0 0 30 Z M0 30 Q -50 20 -44 -10 Q -20 10 0 30 Z M0 30 Q 50 20 44 -10 Q 20 10 0 30 Z" fill="#fff" />}
              <T3 x={0} y={120} size={38}>{lab}</T3>
            </g>
          );
        })}
        {m === "city" && (
          <g>
            <Quay8 x0={1440} x1={1960} y={900} />
            <Actor a="hold" t={t} x={1700} y={910} s={0.6} id="city8" w={w} over={{ pose: { ...POSES.cheer, armL: [160, -10], armR: [160, -10] }, face: FACES.happy }} />
            {/* a tiny city model held up: towers, a dome, a crane */}
            <g transform={`translate(1700 ${470 + Math.sin(t * 0.2) * 4})`}>
              <rect x={-150} y={0} width={300} height={24} fill="#8e99a4" {...O(5)} />
              {[[-130, 90], [-90, 150], [-50, 110], [-10, 180], [30, 120], [70, 160], [110, 100]].map(([x, h], i) => <rect key={i} x={x} y={-h} width={34} height={h} fill={["#e8a87c", "#f2d9a6", "#9fd3ee", "#f4f4ee"][i % 4]} {...O(4)} />)}
            </g>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ map of the Italian coast (Liguria to Lazio)
const PL: Record<string, [number, number]> = { SAVONA: [300, 150], GENOA: [440, 128], LIVORNO: [860, 420], CIVITAVECCHIA: [1330, 900], ROME: [1500, 930], GIGLIO: [1040, 760] };
const COAST = "M0 210 Q 160 160 300 150 Q 380 120 440 128 Q 560 150 700 250 Q 800 320 860 420 Q 900 520 920 600 Q 960 680 1060 700 Q 1100 740 1150 760 Q 1240 830 1330 900 Q 1420 960 1520 1080 L 1920 1080 L 1920 0 L 0 0 Z";
const Map8: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "depart";
  const route: [number, number][] = [[1330, 900], [1220, 850], [1110, 780], [1040, 700], [980, 600], [900, 460], [780, 340], [600, 240], [440, 190], [300, 175]];
  const zoom = m === "giglio" || m === "rock";
  const prog = m === "depart" ? ease(t / Math.max(40, d)) * 0.12 : m === "route" ? 0.12 + ease((t - 4) / Math.max(30, d - 10)) * 0.88 : 1;
  const seg = route.length - 1, f = prog * seg, i0 = Math.min(seg - 1, Math.floor(f)), u = f - i0;
  const sx = route[i0][0] + (route[i0 + 1][0] - route[i0][0]) * u, sy = route[i0][1] + (route[i0 + 1][1] - route[i0][1]) * u;
  const z = zoom ? 1 + ease(t / 20) * 1.4 : 1;
  const show = (name: string, k = 1) => { const [x, y] = PL[name]; return <g key={name} opacity={k}><circle cx={x} cy={y} r={14} fill={RED} {...O(4)} /><T3 x={x + 24} y={y - 18} size={40} anchor="start">{name}</T3></g>; };
  return (
    <AbsoluteFill>
      <Svg>
        <g transform={`translate(1040 760) scale(${z}) translate(-1040 -760)`}>
          <rect width={W} height={H} fill="#3f86b0" />
          <path d={COAST} fill="#c9b98a" {...O(6)} />
          <path d="M1920 0 L 1920 1080 L 1520 1080 Q 1700 700 1920 0 Z" fill="#b8a878" opacity={0.5} />
          {/* Corsica, Elba, Giglio */}
          <path d="M260 420 Q 340 380 400 440 Q 420 600 380 760 Q 330 880 280 800 Q 230 620 260 420 Z" fill="#c9b98a" {...O(5)} />
          <ellipse cx={800} cy={590} rx={50} ry={24} fill="#c9b98a" {...O(4)} />
          <ellipse cx={1040} cy={760} rx={26} ry={34} fill={zoom ? "#6f8a4f" : "#c9b98a"} {...O(4)} />
          {m !== "depart" && <path d={`M${route.map(([x, y]) => `${x} ${y}`).join(" L ")}`} stroke="#fff" strokeWidth={6} strokeDasharray="18 12" fill="none" opacity={0.7} />}
          {!zoom && show("CIVITAVECCHIA")}
          {m === "depart" && <g opacity={0.8}><circle cx={PL.ROME[0]} cy={PL.ROME[1]} r={8} fill={INK} /><T3 x={PL.ROME[0]} y={PL.ROME[1] + 56} size={32}>ROME</T3></g>}
          {m !== "depart" && show("SAVONA", m === "route" ? ramp(t, d * 0.5, d * 0.6) : 1)}
          {m !== "depart" && <g transform={`translate(${PL.GIGLIO[0] - 40} ${PL.GIGLIO[1] + 10})`}><T3 x={0} y={0} size={zoom ? 22 : 34} anchor="end">GIGLIO</T3></g>}
          {zoom && <circle cx={1040} cy={760} r={60 + Math.sin(t * 0.2) * 6} fill="none" stroke={YEL} strokeWidth={6 / z} />}
          {(() => { const hd = (Math.atan2(route[i0 + 1][1] - route[i0][1], route[i0 + 1][0] - route[i0][0]) * 180) / Math.PI; const [px, py] = zoom ? [1120, 800] : [sx, sy]; return <g transform={`translate(${px} ${py}) rotate(${zoom ? -125 : hd}) scale(${0.12 / z})`}><LinerTop /></g>; })()}
        </g>
        {m === "rock" && <T3 x={1400} y={420} size={260} color={YEL} s={pop(t, 10)}>?</T3>}
      </Svg>
    </AbsoluteFill>
  );
};

/** how many on board: passengers + crew = 4,229 */
const Count8: Tpl = ({ t, d }) => {
  const k = ease((t - 4) / Math.max(30, d - 16));
  const a = Math.round(k * 3206), b = Math.round(clamp01(k * 1.4 - 0.4) * 1023);
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#1d2a3a" />
        {Array.from({ length: 120 }).map((_, i) => {
          const crew = i >= 91, on = (crew ? (i - 91) / 29 <= clamp01(k * 1.4 - 0.4) : i / 91 <= k);
          return <g key={i} transform={`translate(${200 + (i % 20) * 80} ${170 + Math.floor(i / 20) * 90})`} opacity={on ? 1 : 0.15}><circle cy={-30} r={14} fill={crew ? "#ff8a3a" : "#9fd3ee"} {...O(3)} /><path d="M-18 0 Q -18 -22 0 -22 Q 18 -22 18 0 Z" fill={crew ? "#ff8a3a" : "#9fd3ee"} {...O(3)} /></g>;
        })}
        <g transform="translate(960 860)">
          <text x={-480} y={0} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={72} fill="#9fd3ee">{a.toLocaleString("en-US")}</text>
          <T3 x={-480} y={56} size={34}>PASSENGERS</T3>
          <T3 x={-240} y={0} size={72}>+</T3>
          <text x={0} y={0} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={72} fill="#ff8a3a">{b.toLocaleString("en-US")}</text>
          <T3 x={0} y={56} size={34}>CREW</T3>
          <T3 x={240} y={0} size={72}>=</T3>
          <text x={480} y={0} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={84} fill={YEL} opacity={ramp(t, d * 0.7, d * 0.8)}>4,229</text>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/** top view of Giglio's east coast: the usual wide route vs the night's close pass (half a mile) */
const Pass8: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "normal";
  const night = m !== "normal";
  const k = ease(t / Math.max(40, d));
  const yNorm = 380, yClose = 820;
  const y = m === "normal" ? yNorm : yClose;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill={night ? "#0f2440" : "#3a83ad"} />
        {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M${(rnd(i) * W + t * 0.6) % W} ${rnd(i + 30) * H} q 14 -6 28 0`} stroke={night ? "#24476f" : "#8cc8e4"} strokeWidth={4} fill="none" />)}
        {/* the island along the bottom edge, the harbour, the Scole rocks */}
        <path d="M-40 1080 L -40 960 Q 300 900 600 930 Q 900 960 1200 920 Q 1500 900 1960 960 L 1960 1080 Z" fill={night ? "#1d2a22" : "#6f8a4f"} {...O(6)} />
        {night && [300, 1400].map((x) => <circle key={x} cx={x} cy={990} r={6} fill={LAMP} />)}
        {Array.from({ length: 3 }).map((_, i) => <circle key={i} cx={1260 + i * 26} cy={880 - i * 6} r={10 - i * 2} fill="#5a5048" {...O(3)} />)}
        <line x1={0} y1={yNorm} x2={W} y2={yNorm} stroke="#4dff7a" strokeWidth={8} strokeDasharray="24 14" opacity={m === "normal" ? 0.9 : 0.35} />
        {m !== "normal" && <path d={`M0 ${yNorm} Q 500 ${yNorm} 800 ${yClose} L 1920 ${yClose}`} stroke={RED} strokeWidth={8} strokeDasharray="24 14" fill="none" opacity={ramp(t, 2, 12)} />}
        <g transform={`translate(${-300 + k * 1500} ${y}) scale(0.42)`}><LinerTop night={night} /></g>
        {m === "normal" && <T3 x={960} y={300} size={52} color="#4dff7a" o={ramp(t, 8, 16)}>USUAL ROUTE</T3>}
        {m === "half" && <g opacity={ramp(t, 8, 16)}><line x1={1100} y1={yClose + 40} x2={1100} y2={930} stroke={YEL} strokeWidth={8} /><T3 x={1130} y={600} size={72} color={YEL} anchor="start">≈ 0.5 MILE</T3></g>}
        {night && <g transform="translate(1720 140)"><circle r={50} fill="#f4f1de" opacity={0.9} /><circle cx={22} cy={-12} r={44} fill="#0f2440" /></g>}
      </Svg>
    </AbsoluteFill>
  );
};

/** speed: a dial to 16 knots, then ≈ 30 km/h */
const Speed8: Tpl = ({ t, p }) => {
  const kmh = p.mode === "kmh";
  const v = 16 * ease((t - 2) / 16);
  const ang = -120 + (v / 24) * 240;
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <OpenSea t={t * 4} y={760} night />
        <g transform={`translate(${1100 + Math.sin(t * 0.1) * 6} 770) scale(0.7)`}><Liner L={1300} night={1} t={t * 4} name={false} /></g>
        {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${1100 - i * 60 - ((t * 8) % 60)} ${790 + i * 8} q -40 4 -80 0`} stroke="#bfe6f5" strokeWidth={5} fill="none" opacity={0.6} />)}
        <g transform="translate(480 420)">
          <circle r={260} fill="#0b1426" {...O(10)} />
          {Array.from({ length: 13 }).map((_, i) => { const a = ((-120 + i * 20) * Math.PI) / 180; return <line key={i} x1={Math.sin(a) * 200} y1={-Math.cos(a) * 200} x2={Math.sin(a) * 236} y2={-Math.cos(a) * 236} stroke="#fff" strokeWidth={6} />; })}
          <g transform={`rotate(${ang})`}><path d="M-10 0 L 0 -210 L 10 0 Z" fill={RED} {...O(3)} /></g>
          <circle r={22} fill="#5a636c" {...O(4)} />
          <text x={0} y={140} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={90} fill={YEL}>{Math.round(v)}</text>
          <T3 x={0} y={200} size={36}>KNOTS</T3>
        </g>
        {kmh && <g transform={`translate(1300 250) scale(${pop(t, 6)})`}><rect x={-300} y={-80} width={600} height={160} rx={20} fill="#f4f4f0" {...O(8)} /><Txt x={0} y={30} s={88}>≈ 30 km/h</Txt></g>}
      </Svg>
    </AbsoluteFill>
  );
};

/** the official report: what the investigators found (icons added one per beat) */
const Report8: Tpl = ({ t, p }) => {
  const n = Number(p.n ?? "0");
  const drop = n === 0 ? ease((t - 2) / 10) : 1;
  const items = ["CHART NOT DETAILED ENOUGH", "PEOPLE NOT ON WATCH", "PHONE CALL"];
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#7a5a3a" />
        <rect x={0} y={0} width={W} height={H} fill="#000" opacity={0.15} />
        {/* the report on the desk */}
        <g transform={`translate(${n === 0 ? 960 : 330} ${-400 + drop * 920}) rotate(${n === 0 ? -3 : -6}) scale(${n === 0 ? 1 : 0.6})`}>
          <rect x={-300} y={-380} width={600} height={760} rx={10} fill="#f4f4f0" {...O(8)} />
          <rect x={-300} y={-380} width={600} height={140} fill="#2c4a7a" />
          <Txt x={0} y={-290} s={44} c="#fff">MARINE CASUALTY</Txt>
          <Txt x={0} y={-250} s={32} c="#fff">INVESTIGATION</Txt>
          <Txt x={0} y={-150} s={44}>COSTA CONCORDIA</Txt>
          {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-240} y={-80 + i * 44} width={480 - (i % 3) * 60} height={14} rx={6} fill="#c9cbc4" />)}
        </g>
        {n === 0 && <g>{[0, 1, 2].map((i) => <path key={i} d={`M${640 - i * 30} ${880 + i * 20} l -60 0`} stroke={INK} strokeWidth={8} opacity={ramp(t, 11, 13) * (1 - ramp(t, 20, 26))} />)}</g>}
        {n > 0 && items.slice(0, n).map((lab, i) => {
          const cur = i === n - 1;
          return (
            <g key={lab} transform={`translate(1220 ${230 + i * 280}) scale(${cur ? pop(t, 4) : 1})`} opacity={cur ? 1 : 0.55}>
              <rect x={-560} y={-110} width={1120} height={220} rx={20} fill="#f4f4f0" {...O(7)} />
              <g transform="translate(-440 0)">
                {i === 0 && <g><rect x={-80} y={-70} width={160} height={140} fill="#e8e3c8" {...O(5)} />{Array.from({ length: 4 }).map((_, j) => Array.from({ length: 4 }).map((__, q) => <rect key={`${j}${q}`} x={-70 + j * 36} y={-60 + q * 32} width={32} height={28} fill={(j + q) % 3 ? "#9fd3ee" : "#c9b98a"} />))}<T3 x={0} y={92} size={26}>1:100,000</T3></g>}
                {i === 1 && <g>{[-50, 0, 50].map((x, j) => <g key={j} transform={`translate(${x} 0)`}><circle cy={-40} r={22} fill={j === 1 ? "#1d1d22" : "#8e99a4"} {...O(4)} /><path d="M-28 40 Q -28 -12 0 -12 Q 28 -12 28 40 Z" fill={j === 1 ? "#1d1d22" : "#8e99a4"} {...O(4)} /></g>)}</g>}
                {i === 2 && <g transform={`rotate(${Math.sin(t * 1.4) * 8})`}><rect x={-70} y={-10} width={140} height={60} rx={14} fill="#2a2d33" {...O(5)} /><path d="M-80 -20 Q -80 -60 -40 -60 L 40 -60 Q 80 -60 80 -20 L 50 -20 L 40 -40 L -40 -40 L -50 -20 Z" fill="#2a2d33" {...O(5)} />{[0, 1, 2].map((q) => <path key={q} d={`M${90 + q * 16} ${-50 - q * 8} q 10 20 0 40`} stroke={RED} strokeWidth={6} fill="none" />)}</g>}
              </g>
              <Txt x={60} y={18} s={50}>{lab}</Txt>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/** the bridge at night: officers on duty; then silence (nobody pushed the captain to slow down) */
const Bridge8: Tpl = ({ t, p, w }) => {
  const silent = p.mode === "silent";
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#1d2430" />
        <rect x={120} y={110} width={1680} height={430} rx={12} fill="#0b1426" {...O(8)} />
        <path d={`M120 470 Q 600 ${380 - t * 0.6} 1200 ${330 - t * 0.6} Q 1500 300 1800 ${360 - t * 0.4} L 1800 540 L 120 540 Z`} fill="#05090f" />
        {[[700, 400], [1350, 360], [1500, 380]].map(([x, y], i) => <circle key={i} cx={x} cy={y - t * 0.5} r={5} fill={LAMP} opacity={0.7} />)}
        {[540, 960, 1380].map((x) => <line key={x} x1={x} y1={110} x2={x} y2={540} stroke="#2a2f35" strokeWidth={12} />)}
        <rect x={0} y={640} width={W} height={440} fill="#2a2f35" {...O(6)} />
        {/* consoles glowing */}
        <rect x={140} y={600} width={600} height={150} rx={14} fill="#1a1f26" {...O(6)} />
        <rect x={180} y={630} width={220} height={90} rx={6} fill="#123a2a" {...O(3)} /><rect x={440} y={630} width={260} height={90} rx={6} fill="#0f2a44" {...O(3)} />
        <path d={`M200 700 L 380 ${680 - Math.sin(t * 0.1) * 10}`} stroke="#4dff7a" strokeWidth={4} />
        <Actor a="talk" t={t} x={900} y={1080} s={0.62} id="b8cap" outfit="captain" w={silent ? undefined : w} over={{ face: { eyes: "dot", brows: "none", mouth: "flat", lookX: 1 } }} />
        <Actor a="watch" t={t + 5} x={1220} y={1080} s={0.58} id="b8o1" outfit="officer" over={{ pose: { ...IDLE, armL: [30, -120], armR: [30, -120] }, face: { eyes: "dot", brows: "worried", mouth: "flat", lookX: -1 } }} />
        <Actor a="watch" t={t + 11} x={1480} y={1080} s={0.58} id="b8o2" outfit="officer" over={{ pose: { ...IDLE }, face: { eyes: "half", brows: "worried", mouth: "flat", lookX: -1 } }} />
        {silent && [1220, 1480].map((x, i) => (
          <g key={x} transform={`translate(${x + 60} 520) scale(${pop(t, 6 + i * 6)})`}>
            <path d="M-80 -50 Q -80 -90 -40 -90 L 60 -90 Q 100 -90 100 -50 Q 100 -10 60 -10 L 0 -10 L -30 20 L -20 -10 L -40 -10 Q -80 -10 -80 -50 Z" fill="#f4f4f0" {...O(5)} />
            <Txt x={10} y={-34} s={50}>...</Txt>
          </g>
        ))}
      </Svg>
    </AbsoluteFill>
  );
};

/** dark rocks rising ahead of the bow (too late) */
const Rocks8: Tpl = ({ t, d }) => {
  const k = ease(t / Math.max(30, d));
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <rect x={0} y={560} width={W} height={H - 560} fill="#0f2440" />
        {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${((i * 151 + t * 3) % (W + 200)) - 100} ${600 + (i % 5) * 80} q 22 -8 44 0 t 44 0`} stroke="#24476f" strokeWidth={5} fill="none" />)}
        <g transform={`translate(960 600) scale(${0.6 + k * 1.2})`}>
          <path d="M-220 0 L -160 -70 L -110 -40 L -60 -110 L 0 -60 L 50 -120 L 120 -50 L 200 0 Z" fill="#1a1c20" {...O(5)} />
          <path d="M-220 0 Q 0 14 200 0" stroke="#bfe6f5" strokeWidth={4} fill="none" opacity={0.7} />
        </g>
        {/* bow rail in the foreground */}
        <path d="M0 1080 L 760 820 Q 960 780 1160 820 L 1920 1080 Z" fill="#cfd3d6" {...O(8)} />
        <path d="M60 1000 L 780 790 Q 960 752 1140 790 L 1860 1000" stroke="#9aa4ad" strokeWidth={10} fill="none" />
        <rect width={W} height={H} fill="#000" opacity={0.15 + 0.15 * Math.abs(Math.sin(t * 0.05))} />
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES8: Record<string, Tpl> = {
  bill8: Bill8, wreck8: Wreck8, roll8: Roll8, night8: Night8, liner8: Liner8, map8: Map8, count8: Count8, pass8: Pass8,
  speed8: Speed8, report8: Report8, bridge8: Bridge8, rocks8: Rocks8,
};
