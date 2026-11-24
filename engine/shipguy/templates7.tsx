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
// Owner 2026-11-24: "make the ship like a ship, it looks more like a box". Lower, longer profile; deck sheer rising to the bow;
// rounded, raked bow with a bulb; curved stern; bridge with windows + mast up front; funnel aft; anchor, lifeboat, side door, vents.
const HULL_D = "M22 -168 Q 520 -180 930 -224 Q 1004 -226 1016 -178 Q 1018 -120 998 -52 Q 992 -32 1006 -14 Q 1022 10 1000 26 Q 978 40 940 42 L 130 42 Q 70 42 44 24 Q 20 6 14 -36 L 10 -158 Q 12 -168 22 -168 Z";
export const Pctc: React.FC<{ L?: number; fire?: number; scorch?: number; xray?: number; t?: number; ramp?: number; name?: boolean; water?: boolean }> = ({ L = 1400, fire = 0, scorch = 0, xray = 0, t = 0, ramp: rmp = 0, name = true, water = true }) => {
  const k = L / 1000;
  const top = -200, wl = 0, sw = (w: number) => w / k;
  const cid = `pcc${Math.round(L)}`;
  return (
    <g transform={`scale(${k})`}>
      <defs><clipPath id={cid}><path d={HULL_D} /></clipPath></defs>
      {/* hull colours: white topsides, blue band, red antifouling below the waterline */}
      <g clipPath={`url(#${cid})`}>
        <rect x={0} y={-260} width={1040} height={230} fill={HULL_W} />
        <rect x={0} y={-36} width={1040} height={36} fill={HULL_B} />
        <rect x={0} y={0} width={1040} height={60} fill={HULL_R} />
        {/* panel seams + a darker shade under the deck edge */}
        {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={90 + i * 85} y1={-196} x2={90 + i * 85} y2={-36} stroke="#dedbd0" strokeWidth={sw(2)} />)}
        <path d="M10 -158 Q 520 -170 1010 -212 L 1012 -200 Q 520 -158 10 -146 Z" fill="#d9d6cc" />
        {/* louvred vents along the top */}
        {Array.from({ length: 7 }).map((_, i) => { const y0 = -140 - i * i * 0.9 - i * 3; return <g key={`v${i}`}>{[0, 1, 2, 3].map((j) => <line key={j} x1={150 + i * 100} y1={y0 + j * 6} x2={190 + i * 100} y2={y0 + j * 6} stroke="#b8b4a8" strokeWidth={sw(2)} />)}</g>; })}
        {/* side door + stern quarter ramp outline */}
        <rect x={430} y={-112} width={56} height={60} rx={3} fill="none" stroke="#b8b4a8" strokeWidth={sw(3)} />
        {xray === 0 && Array.from({ length: 5 }).map((_, i) => <circle key={`p${i}`} cx={890 + i * 18} cy={-150} r={4.5} fill="#2c4a7a" />)}
        <line x1={0} y1={0} x2={1040} y2={0} stroke={INK} strokeWidth={sw(3)} />
      </g>
      <path d={HULL_D} fill="none" {...O(sw(5))} />
      {/* bulbous bow seam + anchor */}
      <path d="M992 -20 Q 1004 4 996 22" fill="none" stroke={INK} strokeWidth={sw(2)} opacity={0.5} />
      <g transform="translate(978 -112)"><path d="M0 0 V 22 M-8 16 Q 0 28 8 16" stroke={INK} strokeWidth={sw(3)} fill="none" /><circle cy={-2} r={4} fill="none" stroke={INK} strokeWidth={sw(2)} /></g>
      {/* bridge house up front: rounded front, a strip of windows, bridge wings, a mast */}
      <path d="M842 -216 L 842 -246 Q 846 -252 856 -252 L 948 -252 Q 972 -250 980 -232 L 982 -222 Z" fill={HULL_W} {...O(sw(3.5))} />
      {Array.from({ length: 8 }).map((_, i) => <rect key={`w${i}`} x={852 + i * 14} y={-244} width={10} height={9} rx={2} fill="#2c4a7a" />)}
      <rect x={830} y={-240} width={162} height={6} fill={HULL_W} {...O(sw(2))} />
      <path d="M900 -252 L 902 -288 M888 -276 L 916 -276" stroke={INK} strokeWidth={sw(3)} fill="none" />
      <circle cx={902} cy={-290} r={4} fill="#f4f4f0" stroke={INK} strokeWidth={sw(2)} />
      {/* funnel aft, with a company stripe */}
      <path d="M118 -168 L 126 -226 L 168 -226 L 170 -170 Z" fill="#e06a2e" {...O(sw(3.5))} />
      <rect x={124} y={-214} width={45} height={9} fill="#2c4a7a" />
      <path d="M128 -226 L 130 -234 L 164 -234 L 166 -226" fill="#2a2d33" stroke={INK} strokeWidth={sw(2)} />
      {/* deck rails + aft mooring deck */}
      <path d="M22 -168 Q 520 -180 930 -224" fill="none" stroke="#9aa4ad" strokeWidth={sw(2)} strokeDasharray="5 4" transform="translate(0 -6)" />
      {/* enclosed lifeboat */}
      <g transform="translate(870 -196)"><path d="M-30 0 Q -30 -12 -16 -14 L 18 -14 Q 32 -12 32 0 Q 0 8 -30 0 Z" fill="#ff8a3a" {...O(sw(2.5))} /><rect x={-10} y={-12} width={20} height={5} rx={2} fill="#f4f4f0" /></g>
      {/* stern ramp (folded up when closed, lowers to load cars) */}
      <g transform={`translate(12 -44) rotate(${-rmp * 118})`}><rect x={-6} y={-76} width={12} height={80} fill="#9aa4ad" {...O(sw(3))} /></g>
      {name && <Txt x={600} y={-70} s={28} c="#2c4a7a">FELICITY ACE</Txt>}
      {name && <Txt x={60} y={-56} s={14} c="#2c4a7a">PANAMA</Txt>}
      {/* x-ray: the 11 car decks inside */}
      {xray > 0 && (
        <g opacity={xray} clipPath={`url(#${cid})`}>
          <rect x={20} y={-200} width={980} height={160} fill="#f8f6ee" />
          {Array.from({ length: 11 }).map((_, i) => {
            const y = -160 + (i + 1) * (120 / 11);
            return (
              <g key={i}>
                <line x1={20} y1={y} x2={990} y2={y} stroke="#9aa4ad" strokeWidth={sw(2)} />
                {Array.from({ length: 34 }).map((__, j) => <rect key={j} x={34 + j * 28} y={y - 9} width={22} height={7} rx={3} fill={CAR_COLORS[(i * 7 + j * 3) % CAR_COLORS.length]} stroke={INK} strokeWidth={sw(1)} opacity={ramp(t, i * 2, i * 2 + 6)} />)}
              </g>
            );
          })}
        </g>
      )}
      {/* the sea in front of the hull below the waterline (a loaded ship shows only a sliver of red) */}
      {water && <g><rect x={-60} y={10} width={1140} height={70} fill="#3f86b0" opacity={0.93} />{Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${(i * 140 + t * 1.2) % 1100 - 40} ${30 + (i % 3) * 14} q 14 -5 28 0 t 28 0`} stroke="#bfe6f5" strokeWidth={sw(3)} fill="none" />)}</g>}
      {/* fire / scorch */}
      {scorch > 0 && <g clipPath={`url(#${cid})`}><rect x={0} y={-260} width={1040} height={224} fill="#2a2620" opacity={0.65 * scorch} /></g>}
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

const Quay: React.FC<{ x0: number; x1: number; y: number; h?: number }> = ({ x0, x1, y, h = 140 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={h} fill="#a8aaa4" {...O(6)} />
    <rect x={x0} y={y} width={x1 - x0} height={16} fill="#c9cbc4" />
    {Array.from({ length: Math.max(1, Math.floor((x1 - x0) / 120)) }).map((_, i) => <line key={i} x1={x0 + 60 + i * 120} y1={y + 16} x2={x0 + 60 + i * 120} y2={y + h} stroke="#8e908a" strokeWidth={4} />)}
    <g transform={`translate(${x0 + 50} ${y})`}><rect x={-14} y={-26} width={28} height={26} rx={6} fill="#2a2d33" {...O(4)} /><rect x={-20} y={-32} width={40} height={10} rx={4} fill="#2a2d33" {...O(3)} /></g>
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
          <g transform={`translate(260 ${hz + k * 520}) rotate(${-6 * k})`}><Pctc L={1400} scorch={1} t={t} water={false} /></g>
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
            <Quay x0={1280} x1={1940} y={900} h={200} />
            <Actor a="hold" t={t} x={1620} y={910} s={0.7} id="shoe" w={w} over={{ pose: { ...POSES.cheer, armL: [160, -10], armR: [160, -10] }, face: FACES.happy }} />
            <g transform={`translate(1620 ${460 + Math.sin(t * 0.2) * 4})`}><rect x={-120} y={-60} width={240} height={110} fill="#e8d6a6" {...O(6)} /><rect x={-126} y={-70} width={252} height={30} fill="#d9c18a" {...O(6)} /><Txt x={0} y={20} s={28}>SHOES</Txt></g>
          </g>
        )}
        {m === "xray" && p.count === "1" && <T3 x={960} y={260} size={60} color={YEL} o={ramp(t, 10, 18)}>ROOM FOR 5,000+ CARS</T3>}
        {m === "ramp" && (
          <g>
            <Quay x0={-40} x1={452} y={hz + 8} h={420} />
            {Array.from({ length: 4 }).map((_, i) => {
              const k = clamp01(((t - 10 - i * 14) % 64) / 56);
              // along the quay (to x = 440), then up the ramp to the stern door (537, 618)
              const onQ = k < 0.75, u = onQ ? k / 0.75 : (k - 0.75) / 0.25;
              const x = onQ ? -120 + u * 560 : 440 + u * 97, y = onQ ? hz + 8 : hz + 8 - u * 50;
              return <g key={i} transform={`translate(${x} ${y}) rotate(${onQ ? 0 : -27})`} opacity={k > 0.97 || k <= 0 ? 0 : 1}><Car kind={(["sport", "suv", "sedan", "super"] as CarKind[])[i]} c={CAR_COLORS[i + 2]} s={1.1} /></g>;
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
        <Quay x0={-40} x1={520} y={930} h={200} />
        <Actor a="shock" t={Math.max(0, t - 18)} x={260} y={940} s={0.45} id="p7" w={w} />
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

/** a courtroom: the judge taps the gavel under a board asking what started the fire */
const Court7: Tpl = ({ t, p, w }) => {
  const g = Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - 8) / 8)) * Math.PI));
  const blame = p.q === "blame";
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#e8d6a6" />
        {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={40 + i * 300} y={0} width={40} height={1080} fill="#d9c18a" />)}
        {/* the board */}
        <g transform="translate(960 250)">
          <rect x={-420} y={-190} width={840} height={360} rx={14} fill="#2a3a2a" stroke="#7a4a2a" strokeWidth={18} />
          <g transform="translate(-150 110)"><Car kind="sport" c="#f4f4f0" s={2.2} ev glow={0.8} /></g>
          {Array.from({ length: 4 }).map((_, i) => <path key={i} d={`M${-210 + i * 34} 70 q 12 ${-40 - Math.abs(Math.sin(t * 0.4 + i)) * 30} 4 -70 q 20 28 22 70 Z`} fill={i % 2 ? "#ffb03a" : "#ff6a2a"} />)}
          <T3 x={190} y={50} size={200} color={YEL} s={pop(t, 4)}>?</T3>
          <Txt x={0} y={-130} s={48} c="#fff">{blame ? "WHO IS TO BLAME?" : "WHAT STARTED THE FIRE?"}</Txt>
        </g>
        {/* the judge behind the bench */}
        <Actor a="talk" t={t} x={960} y={880} s={0.6} id="judge" outfit="officer" w={w} over={{ face: { eyes: "half", brows: "one", mouth: "flat" } }} />
        <path d="M918 640 Q 960 626 1002 640 L 1030 780 L 890 780 Z" fill="#1d1d22" {...O(5)} />
        <rect x={560} y={760} width={800} height={320} fill="#7a4a2a" {...O(8)} />
        <rect x={600} y={790} width={720} height={40} fill="#8a5a3a" />
        <g transform={`translate(1180 740) rotate(${-50 + g * 50} 0 0)`}><rect x={-10} y={-120} width={20} height={120} fill="#5a3a22" {...O(4)} /><rect x={-50} y={-150} width={100} height={46} rx={10} fill="#5a3a22" {...O(5)} /></g>
        <ellipse cx={1180} cy={760} rx={60} ry={12} fill="#5a3a22" {...O(4)} />
        {g > 0.6 && <g>{[0, 1, 2].map((i) => <path key={i} d={`M${1120 - i * 20} ${720 - i * 14} l -40 -20`} stroke={INK} strokeWidth={6} />)}</g>}
        {/* the two sides */}
        <rect x={60} y={900} width={380} height={180} fill="#8a5a3a" {...O(6)} />
        <rect x={1480} y={900} width={380} height={180} fill="#8a5a3a" {...O(6)} />
        <Actor a="watch" t={t} x={250} y={960} s={0.38} id="cl1" outfit="officer" />
        <Actor a="watch" t={t + 9} x={1670} y={960} s={0.38} id="cl2" outfit="officer" over={{ flip: true }} />
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES7: Record<string, Tpl> = {
  pc: Pc, lash: Lash, route7: Route7, parade: Parade, price7: Price7, ev7: Ev7, rounds: Rounds, bridge7: BridgeT7, court7: Court7,
};
export { NightSky as NightSky7, TopSea as TopSea7 };
