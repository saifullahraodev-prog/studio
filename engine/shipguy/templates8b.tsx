// The Ship Guy: Costa Concordia (video #8), part 2: the rock, the missing hour, abandon ship (sections 3-5).
// Serious: from the abandon-ship beats on there are no gags; people are small, simple figures, never the Ship Guy.
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
import { Island, Liner, LinerEnd, LinerTop } from "./templates8";

const SEA_N = "#0f2440";
const Card: React.FC<{ x: number; y: number; text: string; s?: number; c?: string }> = ({ x, y, text, s = 1, c = YEL }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-text.length * 24 - 30} y={-62} width={text.length * 48 + 60} height={124} rx={16} fill="#0b1426" {...O(6)} />
    <text x={0} y={26} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={72} fill={c}>{text}</text>
  </g>
);
/** a tiny person (not the Ship Guy): head + body, optional life jacket */
const Person: React.FC<{ x: number; y: number; s?: number; c?: string; jacket?: boolean; rot?: number }> = ({ x, y, s = 1, c = "#9fd3ee", jacket = true, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle cy={-34} r={9} fill="#f2d9b8" stroke={INK} strokeWidth={2.5} />
    <path d="M-10 -22 L 10 -22 L 8 0 L -8 0 Z" fill={jacket ? "#ff8a3a" : c} stroke={INK} strokeWidth={2.5} />
    <path d="M-5 0 L -6 14 M5 0 L 6 14" stroke={INK} strokeWidth={3} />
  </g>
);
const time = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

// ================================================================== 3. the rock
const Impact8: Tpl = ({ t, p }) => {
  const hit = p.mode === "hit";
  const shake = hit && t < 30 ? Math.sin(t * 2.3) * (30 - t) * 0.5 : 0;
  const hz = 640;
  return (
    <AbsoluteFill>
      <Svg>
        <g transform={`translate(${shake} ${shake * 0.4})`}>
          <NightSky t={t} />
          <OpenSea t={t} y={hz} night />
          <g transform={`translate(${hit ? 300 + Math.min(t, 10) * 2 : 80 + t * 2} ${hz + 10})`}><Liner L={1300} night={1} dark={hit && t > 8 && t < 40 ? 1 : 0} t={t} name={false} /></g>
          {/* the Scole rocks, barely above the water, right under the ship's side */}
          <g transform={`translate(${hit ? 1100 : 1500 - t * 1.2} ${hz + 14})`}>
            <path d="M-120 0 L -80 -30 L -40 -10 L 0 -46 L 40 -16 L 90 -34 L 130 0 Z" fill="#1a1c20" {...O(4)} />
          </g>
          {hit && t < 26 && Array.from({ length: 12 }).map((_, i) => {
            const a = rnd(i) * Math.PI - Math.PI, r = 20 + t * 9 * (0.5 + rnd(i + 4));
            return <circle key={i} cx={1060 + Math.cos(a) * r} cy={hz + Math.sin(a) * r * 0.6} r={5} fill={i % 2 ? YEL : "#ff8a3a"} opacity={1 - t / 26} />;
          })}
          {hit && t < 5 && <rect width={W} height={H} fill="#fff" opacity={0.6 - t * 0.12} />}
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/** underwater view of the hull: the gash opens, water rushes in */
const Gash8: Tpl = ({ t, d }) => {
  const k = ease((t - 4) / Math.max(30, d * 0.5));
  const hz = 640;
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <rect x={0} y={hz} width={W} height={H - hz} fill="#123a5c" />
        <g transform={`translate(-260 ${hz}) scale(1.9)`}><Liner L={1300} night={1} gash={k} water={false} t={t} name={false} /></g>
        <rect x={0} y={hz} width={W} height={H - hz} fill="#2f6f99" opacity={0.35} />
        <line x1={0} y1={hz} x2={W} y2={hz} stroke="#bfe6f5" strokeWidth={5} />
        {/* arrows of water pouring into the gash */}
        {k > 0.3 && Array.from({ length: 7 }).map((_, i) => {
          const x = 1150 + i * 50, u = ((t * 2 + i * 9) % 40) / 40;
          return <path key={i} d={`M${x} ${hz + 120 - u * 80} l 0 -40 m -14 14 l 14 -14 l 14 14`} stroke="#bfe6f5" strokeWidth={6} fill="none" opacity={(1 - u) * k} />;
        })}
        {/* measuring tape under the gash */}
        <g opacity={ramp(t, d * 0.45, d * 0.55)}>
          <line x1={1123} y1={hz + 180} x2={1494} y2={hz + 180} stroke={YEL} strokeWidth={10} />
          <line x1={1123} y1={hz + 150} x2={1123} y2={hz + 210} stroke={YEL} strokeWidth={10} />
          <line x1={1494} y1={hz + 150} x2={1494} y2={hz + 210} stroke={YEL} strokeWidth={10} />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/** watertight compartments, cross-section along the hull (and the ice cube tray) */
const NC = 12, CX0 = 220, CW = 123, HB = 780, DK = 520, WL = 620;
const FIVE = [4, 5, 6, 7, 8];
const Comp8: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "walls";
  if (m === "tray") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#f2ead8" />
          <Actor a="hold" t={t} x={620} y={1000} s={0.7} id="tray8" w={w} over={{ pose: { ...POSES.cheer, armL: [150, -20], armR: [150, -20] }, face: FACES.happy }} />
          <g transform={`translate(620 ${430 + Math.sin(t * 0.15) * 4}) rotate(-4)`}>
            <rect x={-260} y={-60} width={520} height={120} rx={18} fill="#e8f4fa" {...O(7)} />
            {Array.from({ length: 6 }).map((_, i) => [0, 1].map((r) => <rect key={`${i}${r}`} x={-240 + i * 80} y={-46 + r * 50} width={70} height={42} rx={8} fill="#cfe6f2" {...O(3)} />))}
          </g>
          <g transform={`translate(1380 560) scale(${pop(t, 10)})`}>
            <path d="M-300 -80 L 300 -80 L 280 60 Q 270 90 230 90 L -240 90 Q -290 90 -300 40 Z" fill="#f6f5ef" {...O(7)} />
            {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={-200 + i * 80} y1={-80} x2={-200 + i * 80} y2={90} stroke={INK} strokeWidth={5} opacity={ramp(t, 16 + i * 3, 20 + i * 3)} />)}
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  const fillOf = (i: number): number => {
    if (m === "walls") return 0;
    if (m === "one") return i === 6 ? ease((t - 6) / 20) * 0.6 : 0;
    const inFive = FIVE.includes(i);
    const base = inFive ? (m === "five" ? ease((t - 4 - (i - 4) * 3) / 16) * 0.8 : m === "heart" ? 0.8 : 1) : 0;
    if (m === "spill" && !inFive) { const dist = i < 4 ? 4 - i : i - 8; return ease((t - 10 - dist * 18) / 24); }
    if (m === "deck" && inFive) return 0.8 + ease((t - 4) / 30) * 0.2;
    return base;
  };
  const sink = m === "one" ? ease((t - 6) / 20) * 14 : m === "five" ? ease((t - 4) / 30) * 50 : m === "heart" ? 50 : m === "deck" ? 50 + ease(t / 30) * 30 : m === "spill" ? 80 + ease(t / d) * 60 : 0;
  const night = m !== "walls" && m !== "one";
  return (
    <AbsoluteFill>
      <Svg>
        {night ? <NightSky t={t} /> : <DaySky hz={WL} />}
        <rect x={0} y={WL} width={W} height={H - WL} fill={night ? "#123a5c" : "#3f86b0"} />
        <g transform={`translate(0 ${sink})`}>
          {/* hull section */}
          <path d={`M${CX0} ${DK} L ${CX0 + NC * CW} ${DK} L ${CX0 + NC * CW + 40} ${DK + 40} L ${CX0 + NC * CW} ${HB} L ${CX0 + 30} ${HB} Q ${CX0} ${HB} ${CX0} ${HB - 40} Z`} fill="#f6f5ef" {...O(7)} />
          {Array.from({ length: NC }).map((_, i) => {
            const f = fillOf(i), x = CX0 + i * CW, h = (HB - DK) * f;
            return <rect key={i} x={x + 5} y={HB - h} width={CW - 10} height={h} fill="#3f86b0" opacity={0.9} />;
          })}
          {Array.from({ length: NC - 1 }).map((_, i) => <line key={i} x1={CX0 + (i + 1) * CW} y1={DK} x2={CX0 + (i + 1) * CW} y2={HB} stroke={INK} strokeWidth={6} opacity={m === "walls" ? ramp(t, 4 + i * 2, 8 + i * 2) : 1} />)}
          <line x1={CX0} y1={DK} x2={CX0 + NC * CW + 40} y2={DK} stroke={m === "deck" ? RED : INK} strokeWidth={m === "deck" ? 12 : 8} />
          {m === "deck" && <T3 x={CX0 + 6 * CW} y={DK - 30} size={44} color={RED} o={ramp(t, 10, 16)}>BULKHEAD DECK</T3>}
          {/* superstructure ghost above */}
          <rect x={CX0 + 60} y={DK - 240} width={NC * CW - 120} height={240} fill="#f6f5ef" opacity={night ? 0.12 : 0.35} stroke="#9aa4ad" strokeWidth={3} strokeDasharray="12 8" />
          {/* the gash on compartments 5-9 */}
          {(m === "five" || m === "heart" || m === "deck" || m === "spill") && <path d={`M${CX0 + 4 * CW} ${HB - 40} l 30 -14 l 30 14 l 40 -14 l 40 14 l 40 -12 l 40 12 l 40 -14 l 40 14 l 40 -12 l 40 12 l 40 -14 l 40 14 l 40 -10 l 40 10 l 40 -14 l 40 14`} stroke={RED} strokeWidth={8} fill="none" opacity={m === "five" ? ramp(t, 2, 8) : 1} />}
          {m === "heart" && (() => {
            const ic = [["ENGINE ROOM", 4.5], ["PROPULSION", 6.5], ["6 GENERATORS", 8]] as [string, number][];
            return ic.map(([lab, c], i) => (
              <g key={lab} transform={`translate(${CX0 + c * CW} ${HB - 120}) scale(${pop(t, 6 + i * 24)})`}>
                {i === 0 && <g><rect x={-60} y={-40} width={120} height={70} rx={8} fill="#5a636c" {...O(5)} />{[0, 1, 2].map((q) => <rect key={q} x={-50 + q * 36} y={-60} width={26} height={22} fill="#8e99a4" {...O(3)} />)}</g>}
                {i === 1 && <g><circle r={34} fill="#c9a23a" {...O(5)} /><g transform={`rotate(${t * 4})`}><path d="M0 -30 L 10 0 L 0 30 L -10 0 Z M-30 0 L 0 10 L 30 0 L 0 -10 Z" fill="#8a6a1a" /></g></g>}
                {i === 2 && <g>{Array.from({ length: 6 }).map((_, q) => <rect key={q} x={-90 + (q % 3) * 62} y={-50 + Math.floor(q / 3) * 44} width={54} height={38} rx={6} fill="#e0a23b" {...O(3)} />)}</g>}
                <T3 x={0} y={-90} size={30}>{lab}</T3>
              </g>
            ));
          })()}
          {m === "spill" && [3, 9].map((b, i) => (
            <path key={b} d={`M${CX0 + (i === 0 ? 4 : 9) * CW} ${DK + 6} q ${i === 0 ? -40 : 40} -30 ${i === 0 ? -70 : 70} 30`} stroke="#bfe6f5" strokeWidth={10} fill="none" opacity={ramp(t, 4, 10)} />
          ))}
        </g>
        <rect x={0} y={WL} width={W} height={H - WL} fill={night ? "#123a5c" : "#3f86b0"} opacity={0.3} />
        <line x1={0} y1={WL} x2={W} y2={WL} stroke="#bfe6f5" strokeWidth={5} />
        {m === "one" && <g transform={`translate(1680 300) scale(${pop(t, 28)})`}><circle r={60} fill="#3f9a4f" {...O(6)} /><path d="M-26 0 L -6 20 L 28 -20" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" /></g>}
      </Svg>
    </AbsoluteFill>
  );
};

/** blackout in the engine room / emergency light flicker / rudder jammed */
const Power8: Tpl = ({ t, p }) => {
  const m = p.mode ?? "out";
  if (m === "rudder") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#123a5c" />
          {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={rnd(i) * W} cy={(rnd(i + 30) * H - t * 2 + H) % H} r={4 + rnd(i) * 6} fill="#bfe6f5" opacity={0.3} />)}
          {/* stern from below: hull, a still propeller, the rudder stuck hard over */}
          <path d="M1920 120 L 700 120 Q 520 140 470 300 L 1920 300 Z" fill="#b8432f" {...O(8)} />
          <g transform="translate(900 380)"><circle r={20} fill="#5a636c" {...O(4)} />{[0, 1, 2, 3].map((i) => <ellipse key={i} rx={20} ry={90} fill="#c9a23a" {...O(4)} transform={`rotate(${i * 90 + 20}) translate(0 -80)`} />)}</g>
          <g transform="translate(620 300) rotate(-38)"><rect x={-26} y={0} width={52} height={360} rx={12} fill="#9aa4ad" {...O(7)} /></g>
          <g transform={`translate(1360 620) scale(${pop(t, 8)})`}><rect x={-60} y={-30} width={120} height={100} rx={16} fill={YEL} {...O(6)} /><path d="M-36 -30 L -36 -64 Q -36 -100 0 -100 Q 36 -100 36 -64 L 36 -30" stroke={INK} strokeWidth={14} fill="none" /></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  const off = m === "out" ? t > 10 : Math.sin(t * 0.9) + Math.sin(t * 2.7) > 0.6;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#5a636c" />
        <rect x={0} y={760} width={W} height={320} fill="#3a424b" {...O(6)} />
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={140 + i * 300} y={60} width={160} height={30} rx={8} fill={LAMP} />)}
        {Array.from({ length: 3 }).map((_, i) => (
          <g key={i} transform={`translate(${380 + i * 580} 760)`}>
            <rect x={-220} y={-320} width={440} height={320} rx={16} fill="#8e99a4" {...O(7)} />
            {[0, 1, 2, 3].map((q) => <rect key={q} x={-190 + q * 100} y={-380} width={70} height={70} fill="#5a636c" {...O(5)} />)}
            <rect x={-160} y={-240} width={320} height={60} rx={8} fill="#2a2f35" {...O(4)} />
            <circle cx={-110} cy={-210} r={12} fill={m === "out" && t < 10 ? "#4dff7a" : "#1a3a22"} />
          </g>
        ))}
        {off && <rect width={W} height={H} fill="#05070a" opacity={0.86} />}
        {(off || m === "flicker") && <g><circle cx={1700} cy={140} r={30} fill={RED} opacity={0.9} /><circle cx={1700} cy={140} r={120} fill={RED} opacity={0.12 + 0.08 * Math.sin(t * 0.5)} /></g>}
      </Svg>
    </AbsoluteFill>
  );
};

/** the dark ship drifting, a slight list, water rushing in (quiet) */
const Drift8: Tpl = ({ t }) => (
  <AbsoluteFill>
    <Svg>
      <NightSky t={t} />
      <OpenSea t={t * 0.5} y={640} night />
      <g transform={`translate(${300 + t * 0.25} ${650}) rotate(${Math.min(3, t * 0.03)} 650 0)`}><Liner L={1300} night={1} dark={1} t={t} name={false} /></g>
    </Svg>
  </AbsoluteFill>
);

// ================================================================== 4. the missing hour
/** clock: one hour passes / timeline of the calls / the gap / the alarm not sounded */
const Clock8: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "tick";
  if (m === "tick") {
    const mins = 45 + ease((t - 4) / Math.max(30, d - 10)) * 69;
    const h = 21 + Math.floor(mins / 60), mm = Math.floor(mins % 60);
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#0b1426" />
          <g transform="translate(960 560)">
            <circle r={300} fill="#f4f4f0" {...O(12)} />
            {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={-250} x2={0} y2={-280} stroke={INK} strokeWidth={10} transform={`rotate(${i * 30})`} />)}
            <line x1={0} y1={0} x2={0} y2={-170} stroke={INK} strokeWidth={18} strokeLinecap="round" transform={`rotate(${((h % 12) + mins / 60) * 30})`} />
            <line x1={0} y1={0} x2={0} y2={-250} stroke={RED} strokeWidth={10} strokeLinecap="round" transform={`rotate(${mins * 6})`} />
            <circle r={18} fill={INK} />
          </g>
          <Card x={960} y={960} text={time(h, mm)} s={0.8} />
        </Svg>
      </AbsoluteFill>
    );
  }
  const marks: [string, number, string, string][] = [["21:45", 0, "ROCKS", "#f4f4f0"], ["22:16", 31, "RESCUE STARTS", "#4dff7a"], ["22:38", 53, "DISTRESS CALL", YEL], ["22:54", 69, "ABANDON SHIP", RED]];
  const X = (min: number) => 220 + (min / 75) * 1480;
  const shown = m === "line" ? marks.map((_, i) => (i < 2 ? 1 : i === 2 ? ramp(t, 4, 10) : ramp(t, d * 0.55, d * 0.62))) : [1, 1, 1, 1];
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#0b1426" />
        <line x1={200} y1={560} x2={1740} y2={560} stroke="#5a636c" strokeWidth={14} strokeLinecap="round" />
        {marks.map(([lab, min, what, c], i) => (
          <g key={lab} opacity={shown[i]} transform={`translate(${X(min)} 560)`}>
            <circle r={22} fill={c} {...O(5)} />
            <text x={0} y={i % 2 ? 90 : -50} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={48} fill={c}>{lab}</text>
            <T3 x={0} y={i % 2 ? 140 : -110} size={32}>{what}</T3>
          </g>
        ))}
        {m === "gap" && (() => { const k = ease((t - 2) / 20); return <g><path d={`M${X(0)} 700 L ${X(0)} 740 L ${X(0) + (X(69) - X(0)) * k} 740 L ${X(0) + (X(69) - X(0)) * k} 700`} stroke={YEL} strokeWidth={10} fill="none" /><T3 x={(X(0) + X(69)) / 2} y={820} size={64} color={YEL} o={ramp(t, 18, 24)}>69 MINUTES</T3></g>; })()}
        {m === "alarm" && (
          <g transform="translate(960 830)">
            <g transform={`rotate(${t > d * 0.8 ? Math.sin(t * 1.6) * 14 : 0})`}>
              <path d="M-90 40 Q -90 -90 0 -100 Q 90 -90 90 40 L 110 60 L -110 60 Z" fill={t > d * 0.8 ? RED : "#5a636c"} {...O(6)} />
              <circle cy={80} r={20} fill={t > d * 0.8 ? RED : "#5a636c"} {...O(5)} />
            </g>
            {t <= d * 0.8 && <path d="M-140 -110 L 140 110" stroke="#f4f4f0" strokeWidth={14} strokeLinecap="round" />}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

/** someone on shore raises the alarm; a patrol boat sets out */
const Shore8: Tpl = ({ t, p }) => {
  const boat = p.mode === "boat";
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <rect x={0} y={640} width={W} height={H - 640} fill={SEA_N} />
        {!boat && (
          <g>
            {/* a house on the mainland with one lit window and a person on the telephone; a call wave to the coast guard */}
            <rect x={140} y={320} width={520} height={420} fill="#3a3f46" {...O(7)} />
            <path d="M110 330 L 400 160 L 690 330 Z" fill="#5a3a2a" {...O(7)} />
            <rect x={260} y={420} width={280} height={220} fill={LAMP} {...O(6)} />
            <Actor a="talk" t={t} x={400} y={700} s={0.4} id="shore8" outfit="road" over={{ prop: "mic", pose: { ...IDLE, armR: [60, 118] }, face: { eyes: "wide", brows: "worried", mouth: "o", lookX: 1 } }} />
            {[0, 1, 2].map((i) => { const u = ((t * 1.5 + i * 20) % 60) / 60; return <path key={i} d={`M${700 + u * 700} ${420 - Math.sin(u * Math.PI) * 120} a 40 40 0 0 1 0 60`} stroke={YEL} strokeWidth={8} fill="none" opacity={1 - u} />; })}
            <g transform="translate(1600 640)">
              <rect x={-170} y={-240} width={340} height={240} fill="#d9dde0" {...O(7)} />
              <rect x={-170} y={-240} width={340} height={50} fill="#c94a3a" {...O(5)} />
              <Txt x={0} y={-202} s={30} c="#fff">COAST GUARD</Txt>
              <line x1={120} y1={-240} x2={120} y2={-380} stroke={INK} strokeWidth={8} />
            </g>
          </g>
        )}
        {boat && (
          <g>
            <path d="M1920 640 L 1920 380 Q 1700 360 1560 460 Q 1460 540 1400 640 Z" fill="#1d2a22" {...O(6)} />
            {[1600, 1700, 1820].map((x) => <circle key={x} cx={x} cy={500} r={6} fill={LAMP} />)}
            <g transform={`translate(${1400 - t * 6} 660)`}>
              <path d="M-160 -20 L 140 -20 L 180 -50 L 170 10 Q 150 40 100 40 L -140 40 Q -170 30 -160 -20 Z" fill="#9aa4ad" {...O(6)} />
              <rect x={-150} y={-6} width={320} height={10} fill="#c94a3a" />
              <rect x={-60} y={-80} width={140} height={60} rx={8} fill="#d9dde0" {...O(5)} />
              <circle cx={10} cy={-96} r={10} fill={Math.floor(t / 5) % 2 ? "#3a8bff" : "#1a3a6a"} />
              {Array.from({ length: 5 }).map((_, i) => <path key={i} d={`M${170 + i * 40} ${30 + i * 6} q 30 -4 60 0`} stroke="#bfe6f5" strokeWidth={5} fill="none" opacity={0.6} />)}
            </g>
          </g>
        )}
        <OpenSea t={t} y={760} night />
      </Svg>
    </AbsoluteFill>
  );
};

/** end view of the listing ship at night: lean / degrees / high-side lifeboats / corridors become walls */
const List8: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "lean";
  if (m === "walls") {
    const k = ease(t / Math.max(30, d * 0.6));
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#1d2430" />
          <g transform={`translate(960 560) rotate(${k * 75})`}>
            {/* a cabin corridor: floor, doors, a staircase */}
            <rect x={-900} y={-220} width={1800} height={440} fill="#e8e3d6" {...O(8)} />
            <rect x={-900} y={160} width={1800} height={60} fill="#8a5a3a" />
            {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={-820 + i * 330} y={-150} width={130} height={310} rx={6} fill="#c9a87a" {...O(5)} />)}
            {Array.from({ length: 6 }).map((_, i) => <rect key={`s${i}`} x={620 + i * 40} y={160 - i * 50} width={60} height={14} fill="#5a3a2a" />)}
          </g>
          <rect width={W} height={H} fill="#000" opacity={0.25} />
        </Svg>
      </AbsoluteFill>
    );
  }
  const a = m === "lean" ? ease(t / Math.max(30, d)) * 15 : m === "deg" ? 40 + ease((t - 4) / Math.max(30, d - 10)) * 40 : 40;
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <rect x={0} y={700} width={W} height={H - 700} fill={SEA_N} />
        <g transform={`translate(960 ${780 + a * 1.2})`}><LinerEnd s={1.6} rot={a} /></g>
        <rect x={0} y={700} width={W} height={H - 700} fill={SEA_N} opacity={0.8} />
        <line x1={0} y1={700} x2={W} y2={700} stroke="#24476f" strokeWidth={5} />
        {m === "deg" && (
          <g transform="translate(300 380)">
            <path d="M-180 0 A 180 180 0 0 1 180 0" fill="none" stroke="#5a636c" strokeWidth={14} />
            <line x1={0} y1={0} x2={Math.sin((a * Math.PI) / 180) * 170} y2={-Math.cos((a * Math.PI) / 180) * 170} stroke={YEL} strokeWidth={12} strokeLinecap="round" />
            <text x={0} y={90} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={84} fill={YEL}>{Math.round(a)}°</text>
          </g>
        )}
        {m === "high" && (() => {
          // high-side (left) lifeboats can't swing out: crossed out; low side is usable
          const r = (a * Math.PI) / 180, P = (x: number, y: number) => [960 + (x * Math.cos(r) - y * Math.sin(r)) * 1.6, 780 + a * 1.2 + (x * Math.sin(r) + y * Math.cos(r)) * 1.6];
          const [hx, hy] = P(-72, -140);
          return <g transform={`translate(${hx} ${hy}) scale(${pop(t, 8)})`}><circle r={70} fill="none" stroke={RED} strokeWidth={12} /><path d="M-50 -50 L 50 50" stroke={RED} strokeWidth={12} /></g>;
        })()}
      </Svg>
    </AbsoluteFill>
  );
};

/** top view: the drifting ship turns around and grounds by Giglio's harbour; vs open water */
const Aground8: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "turn";
  // path from out at sea, a U-turn, back to the shelf by the harbour
  const P: [number, number, number][] = [[700, 300, 160], [1000, 340, 110], [1180, 480, 60], [1150, 640, -10], [1000, 700, -60], [820, 690, -100]];
  const k = m === "turn" ? ease(t / Math.max(40, d)) * 0.8 : 1;
  const f = k * (P.length - 1), i0 = Math.min(P.length - 2, Math.floor(f)), u = f - i0;
  const x = P[i0][0] + (P[i0 + 1][0] - P[i0][0]) * u, y = P[i0][1] + (P[i0 + 1][1] - P[i0][1]) * u, hd = P[i0][2] + (P[i0 + 1][2] - P[i0][2]) * u;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill={SEA_N} />
        {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M${(rnd(i) * W + t * 0.4) % W} ${rnd(i + 30) * H} q 14 -6 28 0`} stroke="#24476f" strokeWidth={4} fill="none" />)}
        {/* Giglio's coast on the left, the little harbour with lights */}
        <path d="M-40 -40 L 420 -40 Q 560 200 620 420 Q 640 560 700 700 Q 640 900 500 1120 L -40 1120 Z" fill="#1d2a22" {...O(6)} />
        <path d="M640 740 Q 720 760 720 820 L 660 830" stroke="#9aa4ad" strokeWidth={14} fill="none" />
        {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={520 + (i % 4) * 30} cy={760 + Math.floor(i / 4) * 40} r={6} fill={LAMP} />)}
        <path d={`M${P.map(([a, b]) => `${a} ${b}`).join(" L ")}`} stroke="#fff" strokeWidth={5} strokeDasharray="14 10" fill="none" opacity={m === "turn" ? 0.5 : 0.3} />
        <g transform={`translate(${x} ${y}) rotate(${hd}) scale(0.32)`}><LinerTop night /></g>
        {m === "shelf" && <g opacity={ramp(t, 4, 12)}><ellipse cx={780} cy={700} rx={160} ry={60} fill="#8a7a5a" opacity={0.5} /></g>}
        {m === "open" && (
          <g>
            <g transform="translate(1450 420) scale(0.32)" opacity={0.35}><LinerTop night /></g>
            <g transform={`translate(1450 420) scale(${pop(t, 8)})`}><circle r={110} fill="none" stroke={RED} strokeWidth={10} /><T3 x={0} y={190} size={44} color="#f4f4f0">OPEN SEA</T3></g>
            <T3 x={1450} y={700} size={40} color="#9fd3ee" o={ramp(t, 14, 20)}>DEEP WATER</T3>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 5. abandon ship (quiet)
const Lifeboat8: Tpl = ({ t, d }) => {
  const a = 15;
  const k = ease(t / Math.max(40, d));
  const mins = Math.round(55 + k * 15);
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <rect x={0} y={700} width={W} height={H - 700} fill={SEA_N} />
        <path d="M1920 700 L 1920 520 Q 1800 500 1720 600 Q 1680 660 1640 700 Z" fill="#1d2a22" {...O(5)} />
        {[1760, 1820, 1880].map((x) => <circle key={x} cx={x} cy={600} r={6} fill={LAMP} />)}
        <g transform={`translate(700 ${780 + a * 1.2})`}><LinerEnd s={1.6} rot={a} /></g>
        <rect x={0} y={700} width={W} height={H - 700} fill={SEA_N} opacity={0.8} />
        {/* lifeboats lowered on the low side, motoring to the harbour */}
        {[0, 1, 2].map((i) => {
          const u = clamp01(k * 1.6 - i * 0.25);
          return <g key={i} transform={`translate(${900 + u * 700 + i * 30} ${700 + i * 26})`}><path d="M-60 0 Q -60 -24 -36 -28 L 40 -28 Q 64 -24 64 0 Q 0 14 -60 0 Z" fill="#ff8a3a" {...O(4)} /><rect x={-20} y={-24} width={40} height={10} rx={3} fill="#f4f4f0" /></g>;
        })}
        <Card x={360} y={240} text={time(22 + Math.floor(mins / 60), mins % 60)} s={0.8} />
      </Svg>
    </AbsoluteFill>
  );
};

/** people climbing down rope ladders on the hull, waiting on deck, swimming to the rocks (small, respectful) */
const Ladder8: Tpl = ({ t }) => {
  const a = 62, s = 1.7, r = (a * Math.PI) / 180, kx = 1100, ky = 830;
  const P = (x: number, y: number) => [kx + (x * Math.cos(r) - y * Math.sin(r)) * s, ky + (x * Math.sin(r) + y * Math.cos(r)) * s];
  const [tx, ty] = P(-70, -96), [bx, by] = P(-70, -10);
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <rect x={0} y={700} width={W} height={H - 700} fill={SEA_N} />
        <path d="M-20 700 L -20 560 Q 120 520 240 600 L 320 700 Z" fill="#1a1c20" {...O(5)} />
        <g transform={`translate(${kx} ${ky})`}><LinerEnd s={s} rot={a} /></g>
        {/* the rope ladder down the high side of the hull to the water */}
        <line x1={tx - 8} y1={ty} x2={bx - 30} y2={700} stroke="#c9a87a" strokeWidth={5} />
        <line x1={tx + 8} y1={ty} x2={bx - 14} y2={700} stroke="#c9a87a" strokeWidth={5} />
        {Array.from({ length: 8 }).map((_, i) => { const u = i / 8; return <line key={i} x1={tx - 8 + (bx - 30 - tx + 8) * u} y1={ty + (700 - ty) * u} x2={tx + 8 + (bx - 14 - tx - 8) * u} y2={ty + (700 - ty) * u} stroke="#c9a87a" strokeWidth={4} />; })}
        {[0, 1, 2].map((i) => { const u = ((t * 0.4 + i * 30) % 90) / 90; return <Person key={i} x={tx + (bx - 22 - tx) * u} y={ty + (700 - ty) * u} s={0.9} />; })}
        {/* waiting on the side of the hull */}
        {Array.from({ length: 7 }).map((_, i) => { const [px, py] = P(-70, -160 - i * 18); return <Person key={i} x={px - 4} y={py - 4} s={0.8} />; })}
        <rect x={0} y={700} width={W} height={H - 700} fill={SEA_N} opacity={0.75} />
        {/* swimmers heading for the rocks */}
        {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${800 - ((t * 0.8 + i * 70) % 400)} ${740 + i * 22})`}><circle r={9} fill="#f2d9b8" stroke={INK} strokeWidth={2.5} /><path d="M10 6 q 20 -6 40 0" stroke="#bfe6f5" strokeWidth={3} fill="none" /></g>)}
        <line x1={0} y1={700} x2={W} y2={700} stroke="#24476f" strokeWidth={5} />
      </Svg>
    </AbsoluteFill>
  );
};

/** the rescue: counts of boats and helicopters; the island opens its doors */
const Rescue8: Tpl = ({ t, d, p }) => {
  if (p.mode === "island") {
    return (
      <AbsoluteFill>
        <Svg>
          <NightSky t={t} dawn={0.15} />
          <rect x={0} y={820} width={W} height={260} fill={SEA_N} />
          <path d="M0 820 L 0 520 Q 400 380 900 420 Q 1400 460 1920 600 L 1920 820 Z" fill="#2a3326" {...O(6)} />
          {/* church, school, homes with lit windows */}
          <g transform="translate(520 640)"><rect x={-90} y={-160} width={180} height={160} fill="#d9c18a" {...O(6)} /><path d="M-110 -160 L 0 -250 L 110 -160 Z" fill="#8a5a3a" {...O(6)} /><rect x={-20} y={-330} width={40} height={90} fill="#d9c18a" {...O(5)} /><path d="M0 -380 L 0 -330 M-16 -362 L 16 -362" stroke={INK} strokeWidth={6} /><rect x={-36} y={-90} width={72} height={90} rx={36} fill={LAMP} {...O(4)} /></g>
          <g transform="translate(980 680)"><rect x={-160} y={-140} width={320} height={140} fill="#e8a87c" {...O(6)} />{[0, 1, 2, 3].map((i) => <rect key={i} x={-130 + i * 70} y={-110} width={44} height={40} fill={LAMP} {...O(3)} />)}<Txt x={0} y={-30} s={28}>SCHOOL</Txt></g>
          {Array.from({ length: 6 }).map((_, i) => <g key={i} transform={`translate(${1300 + i * 100} ${700 - (i % 2) * 30})`}><rect x={-36} y={-70} width={72} height={70} fill={["#f2d9a6", "#f4f4ee", "#e8a87c"][i % 3]} {...O(4)} /><rect x={-14} y={-52} width={28} height={24} fill={LAMP} opacity={ramp(t, 4 + i * 4, 8 + i * 4)} /></g>)}
          {/* survivors in blankets walking up from the harbour */}
          {Array.from({ length: 6 }).map((_, i) => <Person key={i} x={700 + ((t * 0.9 + i * 60) % 400)} y={800 - i * 2} s={0.9} jacket={false} c="#9aa4ad" />)}
        </Svg>
      </AbsoluteFill>
    );
  }
  const items: [number, string][] = [[25, "PATROL BOATS"], [14, "OTHER VESSELS"], [4, "TUGS"], [8, "HELICOPTERS"]];
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#0b1426" />
        {items.map(([n, lab], i) => {
          const at = (d * i) / 4.5 + 2;
          return (
            <g key={lab} transform={`translate(${280 + i * 455} 560) scale(${pop(t, at)})`}>
              <circle r={130} fill="#1d2a3a" {...O(6)} />
              {i === 3 ? <g><ellipse rx={70} ry={30} fill="#c94a3a" {...O(4)} /><line x1={-100} y1={-44} x2={100} y2={-44} stroke={INK} strokeWidth={6} transform={`rotate(${Math.sin(t) * 8})`} /><line x1={0} y1={-30} x2={0} y2={-44} stroke={INK} strokeWidth={6} /><path d="M60 0 L 120 -10" stroke={INK} strokeWidth={8} /></g>
                : <g><path d="M-90 0 L 80 0 L 100 -24 L 96 20 Q 80 40 50 40 L -70 40 Q -94 30 -90 0 Z" fill={i === 2 ? "#c94a3a" : i === 0 ? "#9aa4ad" : "#3a73b8"} {...O(4)} /><rect x={-40} y={-40} width={80} height={40} rx={6} fill="#d9dde0" {...O(3)} /></g>}
              <text x={0} y={230} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={90} fill={YEL}>{n}</text>
              <T3 x={0} y={290} size={34}>{lab}</T3>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/** the captain leaves while people are still on board; a coast guard officer on the phone tells him to go back */
const Captain8: Tpl = ({ t, p, w }) => {
  if (p.mode === "call") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#2a3340" />
          <rect x={140} y={120} width={760} height={420} rx={12} fill="#0b1426" {...O(8)} />
          <g transform="translate(520 400) scale(0.55)"><LinerEnd rot={30} /></g>
          <rect x={0} y={760} width={W} height={320} fill="#5a3a2a" {...O(6)} />
          <Actor a="talk" t={t} x={1200} y={1060} s={0.7} id="cg8" outfit="officer" w={w} over={{ prop: "mic", pose: { ...IDLE, armR: [60, 118], armL: [70, -40] }, face: { eyes: "dot", brows: "angry", mouth: "o", lookX: -0.6 } }} />
          <g transform={`translate(1380 300) scale(${pop(t, 8)})`}>
            <path d="M-300 -90 Q -300 -150 -240 -150 L 260 -150 Q 320 -150 320 -90 L 320 10 Q 320 70 260 70 L -120 70 L -200 140 L -180 70 L -240 70 Q -300 70 -300 10 Z" fill="#f4f4f0" {...O(7)} />
            <Txt x={10} y={-50} s={56}>GO BACK</Txt>
            <Txt x={10} y={20} s={56}>ON BOARD!</Txt>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <rect x={0} y={700} width={W} height={H - 700} fill={SEA_N} />
        <g transform="translate(700 840)"><LinerEnd s={1.6} rot={34} /></g>
        <rect x={0} y={700} width={W} height={H - 700} fill={SEA_N} opacity={0.8} />
        {/* people still on board: tiny lights along the decks */}
        {Array.from({ length: 24 }).map((_, i) => <circle key={i} cx={640 + (i % 8) * 24 + Math.floor(i / 8) * 40} cy={420 + Math.floor(i / 8) * 60 + (i % 8) * 12} r={4} fill="#f4f4f0" opacity={0.7} />)}
        {/* one small boat moving away toward the shore */}
        <g transform={`translate(${1060 + t * 3} 720)`}><path d="M-50 0 Q -50 -20 -30 -24 L 34 -24 Q 54 -20 54 0 Q 0 12 -50 0 Z" fill="#ff8a3a" {...O(4)} /></g>
        <path d="M1920 700 L 1920 520 Q 1800 500 1720 600 Q 1680 660 1640 700 Z" fill="#1d2a22" {...O(5)} />
      </Svg>
    </AbsoluteFill>
  );
};

/** dawn over Giglio with the wreck on her side; saved counter / the memorial (quiet) */
const Dawn8: Tpl = ({ t, d, p }) => {
  if (p.mode === "memorial") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#1d2025" />
          <rect x={0} y={760} width={W} height={320} fill="#3a3f46" />
          <rect x={560} y={220} width={800} height={460} rx={10} fill="#8a7a62" {...O(8)} />
          <rect x={600} y={260} width={720} height={380} rx={6} fill="#6f624e" />
          <Txt x={960} y={380} s={60} c="#e8dcc0">13 · 01 · 2012</Txt>
          <Txt x={960} y={560} s={160} c="#e8dcc0">32</Txt>
          {Array.from({ length: 7 }).map((_, i) => (
            <g key={i} transform={`translate(${640 + i * 106} 800)`}>
              <rect x={-14} y={-60} width={28} height={60} fill="#f4f1de" {...O(3)} />
              <path d={`M0 -64 q ${-10 + Math.sin(t * 0.3 + i) * 3} -20 0 -40 q ${10 + Math.sin(t * 0.25 + i) * 3} 20 0 40 Z`} fill={LAMP} />
              <circle cy={-80} r={40} fill={LAMP} opacity={0.12} />
            </g>
          ))}
        </Svg>
      </AbsoluteFill>
    );
  }
  const n = Math.round(ease((t - 4) / Math.max(30, d * 0.6)) * 4194);
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} dawn={0.8} />
        <Island x={600} y={700} s={1.1} />
        <rect x={0} y={680} width={W} height={H - 680} fill="#4a6f8a" />
        <g transform="translate(1040 720)"><LinerEnd s={1.2} rot={72} /></g>
        <rect x={0} y={690} width={W} height={H - 690} fill="#4a6f8a" opacity={0.85} />
        <line x1={0} y1={690} x2={W} y2={690} stroke="#d9e8f0" strokeWidth={4} />
        <Card x={1500} y={260} text="06:17" s={0.7} c="#f4f4f0" />
        <g transform="translate(960 900)"><rect x={-300} y={-80} width={600} height={160} rx={20} fill="#0b1426" {...O(6)} /><text x={0} y={36} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={110} fill="#4dff7a">{n.toLocaleString("en-US")}</text></g>
        <g transform={`translate(1360 850) scale(${pop(t, d * 0.82)})`}><rect x={-70} y={-50} width={140} height={100} rx={16} fill="#4dff7a" {...O(6)} /><Txt x={0} y={22} s={60}>+3</Txt></g>
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES8B: Record<string, Tpl> = {
  impact8: Impact8, gash8: Gash8, comp8: Comp8, power8: Power8, drift8: Drift8, clock8: Clock8, shore8: Shore8, list8: List8,
  aground8: Aground8, lifeboat8: Lifeboat8, ladder8: Ladder8, rescue8: Rescue8, captain8: Captain8, dawn8: Dawn8,
};
