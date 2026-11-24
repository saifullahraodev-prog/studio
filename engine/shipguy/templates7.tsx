// The Ship Guy: scene templates for "The Ship That Sank With 4,000 Luxury Cars" (Felicity Ace, video #7), part 1
// (hook, the ship, the voyage). Same rules as templates6: full 1920x1080 frame from (t, d, p, w), frame-driven only.
// Cars are generic cartoon shapes (no brand logos); brand names appear only in captions/labels.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, IDLE, POSES } from "./guy";
import { fontFamily, ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, clamp01, pop } from "./templates3";
import { NightSky, rnd, YEL, RED } from "./templates5";
import { DaySky, OpenSea, TopSea } from "./templates6";

export const O = (w = 5) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
export const ease = (k: number) => { const c = clamp01(k); return c * c * (3 - 2 * c); };
export const Txt: React.FC<{ x: number; y: number; s: number; c?: string; a?: "start" | "middle" | "end"; o?: number; children: React.ReactNode }> = ({ x, y, s, c = INK, a = "middle", o = 1, children }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={fontFamily} fontWeight={700} fontSize={s} fill={c} opacity={o}>{children}</text>
);
export const HULL_W = "#f2f0e8", HULL_B = "#5b9bd5", HULL_R = "#b8432f";
export const CAR_COLORS = ["#f4f4f0", "#2a2d33", "#c94a3a", "#8e99a4", "#3a73b8", "#e0a23b", "#4f8a5b", "#d9d9d2"];

// ================================================================== cars (side view, nose right, wheels on y = 0, ~100 long)
export type CarKind = "sport" | "suv" | "sedan" | "super";
export const Car: React.FC<{ kind?: CarKind; c?: string; ev?: boolean; glow?: number; s?: number }> = ({ kind = "sport", c = "#f4f4f0", ev, glow = 0, s = 1 }) => {
  const body = kind === "sport" ? "M-50 -12 Q -50 -26 -34 -28 Q -14 -44 10 -42 Q 34 -36 46 -24 Q 54 -20 52 -12 Z"
    : kind === "suv" ? "M-50 -12 L -50 -34 Q -46 -48 -26 -50 L 18 -50 Q 34 -42 44 -30 Q 54 -26 52 -12 Z"
      : kind === "sedan" ? "M-52 -12 Q -52 -28 -38 -30 Q -20 -46 6 -44 Q 26 -42 38 -30 Q 54 -28 52 -12 Z"
        : "M-52 -12 Q -52 -22 -40 -26 Q -10 -40 14 -36 Q 40 -26 54 -16 L 52 -12 Z";
  const win = kind === "suv" ? "M-30 -34 L -24 -46 L 14 -46 L 26 -34 Z" : kind === "super" ? "M-16 -30 Q 0 -36 14 -32 L 24 -26 L -14 -26 Z" : "M-26 -30 Q -12 -40 6 -39 L 26 -30 Z";
  return (
    <g transform={`scale(${s})`}>
      {glow > 0 && <ellipse cx={0} cy={-18} rx={70} ry={40} fill="#ff8a3a" opacity={0.45 * glow} />}
      <path d={body} fill={c} {...O(4)} />
      <path d={win} fill="#9fd3ee" {...O(3)} />
      <circle cx={-30} cy={-10} r={10} fill="#2a2d33" {...O(3)} /><circle cx={30} cy={-10} r={10} fill="#2a2d33" {...O(3)} />
      <circle cx={-30} cy={-10} r={4} fill="#c9cfd5" /><circle cx={30} cy={-10} r={4} fill="#c9cfd5" />
      {ev && <path d="M2 -26 L -6 -16 L 0 -16 L -4 -6 L 6 -18 L 0 -18 Z" fill={YEL} stroke={INK} strokeWidth={1.5} />}
    </g>
  );
};
/** car from above (nose right), ~100 x 46 */
export const CarTop: React.FC<{ c?: string; ev?: boolean; glow?: number }> = ({ c = "#f4f4f0", ev, glow = 0 }) => (
  <g>
    {glow > 0 && <circle r={60} fill="#ff8a3a" opacity={0.5 * glow} />}
    <rect x={-48} y={-22} width={96} height={44} rx={16} fill={c} {...O(3)} />
    <rect x={-18} y={-17} width={36} height={34} rx={8} fill="#9fd3ee" {...O(2)} />
    {ev && <path d="M30 -10 L 22 2 L 28 2 L 24 12 L 34 -2 L 28 -2 Z" fill={YEL} stroke={INK} strokeWidth={1.5} />}
  </g>
);

// ================================================================== the car carrier (side view, stern left, bow right, waterline y = 0, length L)
export const Pctc: React.FC<{ L?: number; fire?: number; scorch?: number; xray?: number; t?: number; ramp?: number; name?: boolean }> = ({ L = 1400, fire = 0, scorch = 0, xray = 0, t = 0, ramp: rmp = 0, name = true }) => {
  const k = L / 1000;
  const top = -300, wl = 0, keel = 60;
  return (
    <g transform={`scale(${k})`}>
      {/* hull: white box above, blue band, red bottom */}
      <path d={`M0 ${keel} L 0 ${top + 10} Q 0 ${top} 10 ${top} L 960 ${top} Q 1000 ${top + 20} 1004 ${top + 90} L 1000 ${keel - 20} Q 990 ${keel} 960 ${keel} Z`} fill={HULL_W} {...O(5 / k)} />
      <path d={`M0 ${wl - 60} L 1003 ${wl - 60} L 1000 ${keel - 20} Q 990 ${keel} 960 ${keel} L 0 ${keel} Z`} fill={HULL_B} {...O(4 / k)} />
      <path d={`M0 ${wl} L 1001 ${wl} L 1000 ${keel - 20} Q 990 ${keel} 960 ${keel} L 0 ${keel} Z`} fill={HULL_R} {...O(3 / k)} />
      {/* panel seams, portholes */}
      {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={100 + i * 100} y1={top + 4} x2={100 + i * 100} y2={wl - 60} stroke="#d9d6cc" strokeWidth={2 / k} />)}
      {Array.from({ length: 6 }).map((_, i) => <circle key={`p${i}`} cx={820 + i * 26} cy={top + 40} r={6} fill="#2c4a7a" />)}
      {/* bridge + funnel + lifeboat */}
      <rect x={830} y={top - 26} width={140} height={26} fill={HULL_W} {...O(3 / k)} />
      <rect x={840} y={top - 20} width={120} height={10} fill="#2c4a7a" />
      <rect x={140} y={top - 46} width={40} height={46} fill="#e06a2e" {...O(3 / k)} />
      <ellipse cx={880} cy={top + 70} rx={34} ry={12} fill="#ff8a3a" {...O(3 / k)} />
      {/* stern ramp (folded up when closed) */}
      <g transform={`translate(0 ${wl - 70}) rotate(${-rmp * 62})`}><rect x={-6} y={-90} width={14} height={90} fill="#9aa4ad" {...O(3 / k)} /></g>
      {name && <Txt x={560} y={wl - 90} s={34} c="#2c4a7a">FELICITY ACE</Txt>}
      {/* x-ray: the decks inside */}
      {xray > 0 && (
        <g opacity={xray}>
          <rect x={20} y={top + 14} width={960} height={(wl - 70) - (top + 14)} fill="#f8f6ee" />
          {Array.from({ length: 11 }).map((_, i) => {
            const y = top + 14 + (i + 1) * (((wl - 70) - (top + 14)) / 11);
            return (
              <g key={i}>
                <line x1={20} y1={y} x2={980} y2={y} stroke="#9aa4ad" strokeWidth={3 / k} />
                {Array.from({ length: 30 }).map((__, j) => <rect key={j} x={30 + j * 31} y={y - 12} width={24} height={10} rx={4} fill={CAR_COLORS[(i * 7 + j * 3) % CAR_COLORS.length]} stroke={INK} strokeWidth={1 / k} opacity={ramp(t, i * 2, i * 2 + 6)} />)}
              </g>
            );
          })}
        </g>
      )}
      {/* fire / scorch */}
      {scorch > 0 && <path d={`M0 ${top} L 1000 ${top} L 1000 ${wl - 60} L 0 ${wl - 60} Z`} fill="#2a2620" opacity={0.65 * scorch} />}
      {fire > 0 && (
        <g>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = ((t * 0.6 + i * 18) % 240) / 240;
            return <circle key={i} cx={300 + (i % 6) * 70 + a * 140} cy={top - a * 500} r={(40 + a * 130)} fill="#3b3a3c" opacity={(0.8 - a * 0.6) * fire} />;
          })}
          {Array.from({ length: 8 }).map((_, i) => <path key={`f${i}`} d={`M${260 + i * 50} ${top} q 14 ${-40 - Math.abs(Math.sin(t * 0.4 + i)) * 50} 28 0 Z`} fill={i % 2 ? "#ffb03a" : "#ff6a2a"} opacity={fire} />)}
        </g>
      )}
    </g>
  );
};

// ================================================================== shared backgrounds
const Bridge7: React.FC<{ t: number; alarm?: boolean; w?: number[][] }> = ({ t, alarm, w }) => (
  <g>
    <rect width={W} height={H} fill="#d9dde0" />
    <rect x={120} y={120} width={1680} height={420} rx={12} fill="#9fd3ee" {...O(8)} />
    <rect x={120} y={380} width={1680} height={160} fill="#3f86b0" />
    {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${200 + ((i * 230 + t) % 1500)} ${420 + (i % 3) * 36} q 16 -6 32 0`} stroke="#bfe6f5" strokeWidth={4} fill="none" />)}
    {[540, 960, 1380].map((x) => <line key={x} x1={x} y1={120} x2={x} y2={540} stroke="#2a2f35" strokeWidth={12} />)}
    <rect x={0} y={640} width={W} height={440} fill="#5a636c" {...O(6)} />
    <rect x={1200} y={600} width={520} height={180} rx={14} fill="#2a2f35" {...O(6)} />
    {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={1250 + i * 46} cy={650} r={12} fill={alarm && i === 6 ? (Math.floor(t / 6) % 2 ? RED : "#5a1a16") : "#4dff7a"} />)}
    <rect x={1250} y={690} width={420} height={70} rx={8} fill="#0b1426" {...O(3)} />
    {alarm && <g opacity={Math.floor(t / 6) % 2 ? 0.25 : 0}><rect width={W} height={H} fill={RED} /></g>}
  </g>
);

// ================================================================== templates
const Pc: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "sail";
  const hz = 660;
  const slide = t * 0.5;
  if (m === "sink") {
    const k = ease((t - 4) / Math.max(30, d - 20));
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={hz} />
          <rect width={W} height={hz} fill="#5d6b80" opacity={0.35} />
          <g transform={`translate(260 ${hz + k * 520}) rotate(${-6 * k})`}><Pctc L={1400} scorch={1} t={t} /></g>
          <OpenSea t={t} y={hz} />
          {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={500 + rnd(i) * 900} cy={hz + 40 + ((t * 3 + i * 37) % 300)} r={8 + rnd(i + 3) * 12} fill="#fff" opacity={0.6 * k} />)}
          {k > 0.7 && <g transform={`translate(${960 + Math.sin(t * 0.1) * 20} ${hz - 6 + Math.sin(t * 0.2) * 4})`}><circle r={30} fill="#2a2d33" {...O(4)} /><circle r={12} fill="#9aa4ad" /></g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "storm" || m === "calm") {
    const storm = m === "storm";
    const pitch = storm ? Math.sin(t * 0.09) * 5 : Math.sin(t * 0.04) * 0.6;
    return (
      <AbsoluteFill>
        <Svg>
          {storm ? <rect width={W} height={H} fill="#5d6b80" /> : <DaySky hz={hz} />}
          {storm && Array.from({ length: 30 }).map((_, i) => <line key={i} x1={(rnd(i) * W + t * 6) % W} y1={(rnd(i + 9) * H + t * 22) % H} x2={(rnd(i) * W + t * 6) % W - 10} y2={(rnd(i + 9) * H + t * 22) % H + 30} stroke="#c9d3df" strokeWidth={3} opacity={0.7} />)}
          <g transform={`translate(${260 + (storm ? 0 : -slide * 0.4)} ${hz + 20}) rotate(${pitch} 700 -100)`}><Pctc L={1400} t={t} /></g>
          <OpenSea t={t * (storm ? 3 : 1)} y={hz + 20} />
          {storm && Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${i * 340 - ((t * 5) % 340)} ${hz + 40} q 85 ${-60 - Math.sin(t * 0.1 + i) * 30} 170 0 t 170 0`} fill="#3f6f99" stroke="#fff" strokeWidth={5} />)}
          <defs><clipPath id={`ph7${m}`}><circle cx={1640} cy={300} r={190} /></clipPath></defs>
          <circle cx={1640} cy={300} r={200} fill="#8e99a4" {...O(10)} />
          <g clipPath={`url(#ph7${m})`}>
            <rect x={1440} y={100} width={400} height={400} fill="#d9dde0" />
            <rect x={1440} y={420} width={400} height={80} fill="#5a636c" />
            {storm ? (
              <Actor a="rope" t={t} x={1640} y={440} s={0.42} id="storm" w={w} over={{ face: { eyes: "wide", brows: "worried", mouth: "wavy" }, emote: "sweat", emoteT: t, rot: Math.sin(t * 0.09) * 8 }} />
            ) : (
              <Actor a="relax" t={t} x={1640} y={480} s={0.42} id="calm" w={w} />
            )}
          </g>
          {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={1640 + 200 * Math.cos(i * 0.785)} cy={300 + 200 * Math.sin(i * 0.785)} r={10} fill="#5a636c" {...O(3)} />)}
          {storm && <T3 x={360} y={240} size={70} color={YEL} s={pop(t, 6)}>~3 m WAVES</T3>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "sail" && (p.cam === "far" || p.cam === "close" || p.cam === "length")) {
    const far = p.cam === "far", len = p.cam === "length";
    const sc = far ? 0.32 : len ? 1 : 2.4;
    const lk = ease((t - 6) / 24);
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={far ? 600 : hz} />
          <OpenSea t={t} y={far ? 600 : hz + 20} />
          <g transform={far ? `translate(${700 + t * 0.6} 610) scale(${sc})` : len ? `translate(260 ${hz + 20})` : `translate(${-380 - t * 0.8} ${hz + 120})`}><g transform={far || len ? "" : `scale(${sc / 1.4})`}><Pctc L={1400} t={t} /></g></g>
          {far && <g>{Array.from({ length: 5 }).map((_, i) => <path key={i} d={`M${900 + i * 40 + t * 0.6} ${640 + i * 6} q -60 4 -120 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.7} />)}</g>}
          {len && (
            <g>
              <line x1={260} y1={250} x2={260 + 1400 * lk} y2={250} stroke={YEL} strokeWidth={10} />
              <line x1={260} y1={220} x2={260} y2={280} stroke={YEL} strokeWidth={10} />
              {lk > 0.98 && <line x1={1660} y1={220} x2={1660} y2={280} stroke={YEL} strokeWidth={10} />}
              <T3 x={960} y={210} size={80} color={YEL} s={pop(t, 26)}>≈ 200 m</T3>
            </g>
          )}
        </Svg>
      </AbsoluteFill>
    );
  }
  // sail / shoebox / xray / ramp / hook (badges)
  const xr = m === "xray" ? ramp(t, 2, 12) : 0;
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={hz} />
        <OpenSea t={t} y={hz + 20} />
        <g transform={`translate(${(m === "ramp" ? 520 : 260) - (m === "sail" || m === "hook" ? slide : 0)} ${hz + 20})`}><Pctc L={1400} xray={xr} t={t} ramp={m === "ramp" ? ease(t / 20) : 0} /></g>
        {m === "hook" && ["PORSCHE", "BENTLEY", "LAMBORGHINI"].map((b, i) => (
          <g key={b} transform={`translate(${520 + i * 440} 230) scale(${pop(t, 8 + i * 14)})`}>
            <rect x={-190} y={-60} width={380} height={120} rx={60} fill="#f4f4f0" {...O(7)} />
            <g transform="translate(-110 30) scale(1.1)"><Car kind={i === 2 ? "super" : i === 1 ? "sedan" : "sport"} c={["#c94a3a", "#2a2d33", "#e0a23b"][i]} /></g>
            <Txt x={40} y={14} s={36}>{b}</Txt>
          </g>
        ))}
        {m === "shoebox" && (
          <g>
            <Actor a="hold" t={t} x={1620} y={1040} s={0.75} id="shoe" w={w} over={{ pose: { ...POSES.hold, armR: [70, 60], armL: [70, 60] }, face: FACES.happy }} />
            <g transform={`translate(1640 ${700 + Math.sin(t * 0.2) * 4})`}><rect x={-120} y={-60} width={240} height={110} fill="#e8d6a6" {...O(6)} /><rect x={-126} y={-70} width={252} height={30} fill="#d9c18a" {...O(6)} /><Txt x={0} y={20} s={28}>SHOES</Txt></g>
          </g>
        )}
        {m === "xray" && p.count === "1" && <T3 x={960} y={260} size={60} color={YEL} o={ramp(t, 10, 18)}>ROOM FOR 5,000+ CARS</T3>}
        {m === "ramp" && (
          <g>
            {Array.from({ length: 4 }).map((_, i) => {
              const k = clamp01(((t - 14 - i * 12) % 60) / 50);
              return <g key={i} transform={`translate(${60 + k * 520} ${hz - 30 - k * 60}) rotate(${-8})`} opacity={k > 0.95 ? 0 : 1}><Car kind={(["sport", "suv", "sedan", "super"] as CarKind[])[i]} c={CAR_COLORS[i + 2]} s={1.3} /></g>;
            })}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

/** cars parked tight, top-down, being strapped down */
const Lash: Tpl = ({ t }) => (
  <AbsoluteFill>
    <Svg>
      <rect width={W} height={H} fill="#8e99a4" />
      {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 9 }).map((__, c) => (
        <g key={`${r}${c}`} transform={`translate(${180 + c * 200} ${240 + r * 200})`}>
          <CarTop c={CAR_COLORS[(r * 3 + c) % CAR_COLORS.length]} />
          {[-1, 1].map((s) => <g key={s} opacity={ramp(t, 10 + (r * 9 + c) * 0.8, 14 + (r * 9 + c) * 0.8)}><line x1={s * 40} y1={-22} x2={s * 52} y2={-44} stroke={YEL} strokeWidth={6} /><line x1={s * 40} y1={22} x2={s * 52} y2={44} stroke={YEL} strokeWidth={6} /></g>)}
        </g>
      )))}
      <g opacity={ramp(t, 20, 28)}><rect x={620} y={70} width={680} height={90} rx={20} fill="#1d2025" {...O(5)} /><T3 x={960} y={135} size={54} color={YEL}>CENTIMETRES APART</T3></g>
    </Svg>
  </AbsoluteFill>
);

/** route map Emden -> Davisville */
const Route7: Tpl = ({ t }) => {
  const k = ease((t - 6) / 60);
  const A = [1500, 360], B = [420, 560];
  const mx = (A[0] + B[0]) / 2, my = 300;
  const pt = (u: number) => [(1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * mx + u * u * B[0], (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * my + u * u * B[1]];
  const [sx, sy] = pt(k);
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#3f86b0" />
        <path d="M0 160 Q 200 260 320 420 Q 360 560 300 700 Q 240 900 0 1000 Z" fill="#9aa68a" {...O(6)} />
        <path d="M1920 120 Q 1660 160 1560 300 Q 1500 420 1600 520 Q 1680 640 1600 760 Q 1700 900 1920 960 Z" fill="#9aa68a" {...O(6)} />
        <path d={`M${A[0]} ${A[1]} Q ${mx} ${my} ${B[0]} ${B[1]}`} stroke="#fff" strokeWidth={8} strokeDasharray="22 16" fill="none" opacity={0.6} />
        <circle cx={A[0]} cy={A[1]} r={16} fill={RED} {...O(4)} /><T3 x={A[0] - 30} y={A[1] - 40} size={44} anchor="end">EMDEN, GERMANY</T3>
        <circle cx={B[0]} cy={B[1]} r={16} fill={RED} {...O(4)} /><T3 x={B[0] + 20} y={B[1] + 70} size={44} anchor="start">RHODE ISLAND, USA</T3>
        <g transform={`translate(${sx} ${sy}) scale(0.16)`}><Pctc L={1000} name={false} /></g>
        <T3 x={960} y={940} size={60} color={YEL} o={ramp(t, 30, 40)}>~3,500 NAUTICAL MILES</T3>
      </Svg>
    </AbsoluteFill>
  );
};

/** the cargo parade: brand groups of cars rolling past */
const Parade: Tpl = ({ t, d, p }) => {
  const names = p.names === "1";
  const groups: [string, string, CarKind, string, number][] = [["PORSCHE", "~1,100", "sport", "#c94a3a", 4], ["BENTLEY", "189", "sedan", "#2a2d33", 50], ["LAMBORGHINI AVENTADOR", "15", "super", "#e0a23b", 96]];
  const g = Math.min(2, Math.floor((t / Math.max(1, d)) * 3));
  const [name, n, kind, col] = groups[g];
  const lt = t - (g * d) / 3;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#e8e3d6" />
        <rect x={0} y={760} width={W} height={320} fill="#9aa4ad" {...O(5)} />
        {Array.from({ length: 7 }).map((_, i) => <g key={i} transform={`translate(${((i * 300 + lt * 9) % (W + 300)) - 150} 760)`}><Car kind={kind} c={i % 3 === 0 ? col : CAR_COLORS[(i + g) % CAR_COLORS.length]} s={2.2} /></g>)}
        <g transform={`translate(960 330) scale(${pop(lt, 2)})`}>
          <rect x={-420} y={-110} width={840} height={220} rx={30} fill="#f4f4f0" {...O(8)} />
          <Txt x={0} y={names ? 24 : -14} s={name.length > 12 ? 50 : 70}>{names && g === 2 ? "LAMBORGHINI" : name}</Txt>
          {!names && <Txt x={0} y={70} s={80} c={RED}>{"× " + n}</Txt>}
        </g>
        {g === 2 && !names && <g transform={`translate(1560 600) rotate(-8) scale(${pop(lt, 20)})`}><rect x={-170} y={-40} width={340} height={80} rx={12} fill={YEL} {...O(6)} /><Txt x={0} y={14} s={40}>LAST EDITION</Txt></g>}
      </Svg>
    </AbsoluteFill>
  );
};

/** a giant price tag drops on the ship */
const Price7: Tpl = ({ t, w, p }) => {
  const hook = p.hook === "1";
  const k = ease((t - 4) / 14);
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={660} />
        <OpenSea t={t} y={680} />
        <g transform="translate(260 680)"><Pctc L={1400} t={t} /></g>
        <g transform={`translate(1000 ${-200 + k * 520}) rotate(${-6 + Math.sin(t * 0.15) * 3 * k})`}>
          <path d="M-360 -110 L 280 -110 L 380 0 L 280 110 L -360 110 Z" fill="#f4e2a0" {...O(9)} />
          <circle cx={280} cy={0} r={22} fill="#fff" {...O(6)} />
          <Txt x={-40} y={36} s={hook ? 84 : 110}>{hook ? "$$$ MILLIONS" : "$400 MILLION"}</Txt>
        </g>
        <Actor a="shock" t={Math.max(0, t - 18)} x={260} y={1080} s={0.5} id="p7" w={w} />
        {!hook && <T3 x={1500} y={980} size={40} o={ramp(t, 20, 30)}>(INSURANCE ANALYST ESTIMATE)</T3>}
      </Svg>
    </AbsoluteFill>
  );
};

/** the electric cars light up; counter to 574 */
const Ev7: Tpl = ({ t, d, p }) => {
  const total = Number(p.n ?? 574), all = p.n !== undefined;
  const n = Math.round(ease((t - 4) / Math.max(20, d - 20)) * total);
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#1d2025" />
        {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 14 }).map((__, c) => {
          const i = r * 14 + c, ev = i % 7 === 3;
          if (all) return <g key={i} transform={`translate(${130 + c * 128} ${200 + r * 130}) scale(${pop(t, 2 + i * 0.5)})`}><CarTop c={CAR_COLORS[i % CAR_COLORS.length]} /></g>;
          return <g key={i} transform={`translate(${130 + c * 128} ${200 + r * 130})`} opacity={ev ? 1 : 0.35}><CarTop c={CAR_COLORS[i % CAR_COLORS.length]} ev={ev && t > 6 + (i % 20)} /></g>;
        }))}
        <g transform="translate(960 960)"><rect x={-260} y={-70} width={520} height={140} rx={20} fill="#0b1426" {...O(6)} /><text x={0} y={36} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={100} fill={YEL}>{n.toLocaleString("en-US")}</text></g>
      </Svg>
    </AbsoluteFill>
  );
};

/** safety rounds: a crew member with a torch walks between the cars, clock ticks, green ticks */
const Rounds: Tpl = ({ t, d }) => {
  const times = ["01:00", "05:00", "07:00"];
  const idx = Math.min(2, Math.floor((t / Math.max(1, d)) * 3));
  const x = 200 + ((t * 6) % 1500);
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#3a424b" />
        <rect x={0} y={0} width={W} height={120} fill="#2a2f35" />
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={120 + i * 320} y={40} width={200} height={24} rx={6} fill="#fff7c2" opacity={0.8} />)}
        {Array.from({ length: 8 }).map((_, i) => <g key={i} transform={`translate(${140 + i * 230} 760)`}><Car kind={(["sport", "suv", "sedan", "super"] as CarKind[])[i % 4]} c={CAR_COLORS[i % CAR_COLORS.length]} s={2} /></g>)}
        <path d={`M${x + 40} 560 L ${x + 400} 470 L ${x + 400} 650 Z`} fill="#fff7c2" opacity={0.25} />
        <Actor a="talk" t={t} x={x} y={900} s={0.5} id="round" outfit="coverall" over={{ pose: { ...IDLE, armR: [80, 10] }, prop: "phone", face: FACES.confident }} />
        <g transform="translate(1600 300)">
          <rect x={-200} y={-80} width={400} height={160} rx={20} fill="#0b1426" {...O(6)} />
          <text x={-40} y={30} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={80} fill="#4dff7a">{times[idx]}</text>
          <g transform={`translate(130 0) scale(${pop(t % (d / 3), 10)})`}><circle r={46} fill="#3f9a4f" {...O(5)} /><path d="M-20 0 L -4 16 L 22 -16" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" /></g>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/** the bridge: calm watch / the alarm */
const BridgeT7: Tpl = ({ t, p, w }) => {
  const alarm = p.alarm === "1";
  return (
    <AbsoluteFill>
      <Svg>
        <Bridge7 t={t} alarm={alarm} />
        <Actor a={alarm ? "shock" : "relax"} t={alarm ? Math.max(0, t - 6) : t} x={560} y={1060} s={0.6} id="b7sg" w={w}
          over={alarm ? undefined : { pose: { ...POSES.hold }, prop: "mug", shadow: false }} />
        <Actor a="talk" t={t} x={900} y={1060} s={0.58} id="b7o1" outfit="officer" over={{ face: alarm ? { eyes: "wide", brows: "worried", mouth: "o", lookX: 1 } : FACES.happy, pose: alarm ? { ...IDLE, tilt: -14 } : undefined }} />
        {!alarm && <Actor a="talk" t={t + 9} x={1060} y={1060} s={0.6} id="b7o2" outfit="captain" over={{ face: FACES.satisfied }} />}
        {alarm && <Actor a="talk" t={t + 9} x={1060} y={1060} s={0.6} id="b7o2" outfit="captain" over={{ face: { eyes: "wide", brows: "worried", mouth: "o", lookX: 1 }, pose: { ...IDLE, tilt: -14 } }} />}
        {alarm && <T3 x={1460} y={560} size={70} color={RED} s={pop(t, 2)}>SMOKE · DECK 1</T3>}
      </Svg>
    </AbsoluteFill>
  );
};

/** hook: a court, a gavel, a question mark over a tiny car */
const Court7: Tpl = ({ t }) => {
  const g = Math.max(0, Math.sin(Math.min(1, (t - 6) / 8) * Math.PI));
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#e8d6a6" />
        <rect x={0} y={760} width={W} height={320} fill="#8a6a4a" {...O(6)} />
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={120 + i * 300} y={160} width={60} height={600} fill="#d9c18a" {...O(4)} />)}
        <g transform={`translate(560 700) rotate(${-40 + g * 40} 120 0)`}><rect x={0} y={-40} width={200} height={80} rx={14} fill="#7a4a2a" {...O(6)} /><rect x={90} y={40} width={20} height={200} fill="#7a4a2a" {...O(5)} /></g>
        <ellipse cx={680} cy={760} rx={140} ry={26} fill="#5a3a22" {...O(5)} />
        <g transform="translate(1300 700)"><Car kind="sport" c="#f4f4f0" s={2.4} ev /></g>
        <T3 x={1300} y={420} size={260} color={YEL} s={pop(t, 14)}>?</T3>
        <T3 x={960} y={140} size={60} o={ramp(t, 20, 30)}>2026: STILL NOT PROVEN</T3>
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES7: Record<string, Tpl> = {
  pc: Pc, lash: Lash, route7: Route7, parade: Parade, price7: Price7, ev7: Ev7, rounds: Rounds, bridge7: BridgeT7, court7: Court7,
};
export { NightSky as NightSky7, TopSea as TopSea7 };
