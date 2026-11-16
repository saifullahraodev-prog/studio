// The Ship Guy: scene templates for "The Tiny Mistake That Brought Down a Bridge" (Dali / Key Bridge, video #5).
// Same rules as templates3: full 1920x1080 frame from (t, d, p, w). Frame-driven only. The Dali = BoxShipHD.
// Tone: the collapse/search scenes are quiet and respectful (no gags, slow moves).
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, Guy, IDLE, POSES, breathe, walk } from "./guy";
import { BoxShipHD } from "./ships_hd";
import { fontFamily, ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, BOX, T3, WATER, clamp01, pop } from "./templates3";
import { TEMPLATES5B } from "./templates5b";

export const NIGHT1 = "#0d1a33", NIGHT2 = "#1d3157", NWATER = "#122843", LAMP = "#ffd27a", STEEL = "#4a5868", YEL = "#ffd23f", RED = "#e8352b";
export const rnd = (i: number) => { const x = Math.sin(i * 157.3 + 71.1) * 43758.5453; return x - Math.floor(x); };

// ------------------------------------------------------------------ skies + water
export const NightSky: React.FC<{ t: number; dawn?: number }> = ({ t, dawn = 0 }) => (
  <g>
    <defs>
      <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={NIGHT1} /><stop offset="1" stopColor={NIGHT2} /></linearGradient>
      <linearGradient id="dsky5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7d93c2" /><stop offset="0.7" stopColor="#f2b98a" /><stop offset="1" stopColor="#f7d9a8" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#nsky)" />
    {dawn > 0 && <rect width={W} height={H} fill="url(#dsky5)" opacity={dawn} />}
    {Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 70) * 520} r={1.2 + rnd(i + 3) * 2} fill="#fff" opacity={(0.3 + 0.6 * Math.abs(Math.sin(t * 0.04 + i))) * (1 - dawn)} />)}
  </g>
);
export const River: React.FC<{ t: number; y: number; night?: boolean; dawn?: number }> = ({ t, y, night = true, dawn = 0 }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill={night ? NWATER : WATER} />
    {dawn > 0 && <rect x={0} y={y} width={W} height={H - y} fill="#e3a77a" opacity={dawn * 0.35} />}
    {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M${((i * 160 + t * 1.2) % (W + 200)) - 100} ${y + 24 + (i % 4) * 70} q 20 -7 40 0 t 40 0`} stroke={night ? "#2e4f78" : "#bfe6f5"} strokeWidth={4} fill="none" />)}
    <line x1={0} y1={y} x2={W} y2={y} stroke={INK} strokeWidth={5} />
  </g>
);
const Shore: React.FC<{ y: number; night?: boolean }> = ({ y, night = true }) => (
  <g>
    <path d={`M0 ${y} L 0 ${y - 40} Q 120 ${y - 70} 300 ${y - 46} L 340 ${y} Z`} fill={night ? "#1b2638" : "#7d9a6a"} />
    <path d={`M1920 ${y} L 1920 ${y - 44} Q 1780 ${y - 76} 1600 ${y - 50} L 1560 ${y} Z`} fill={night ? "#1b2638" : "#7d9a6a"} />
  </g>
);

// ------------------------------------------------------------------ the Francis Scott Key Bridge, side view
// Main continuous truss from x=300 to x=1620 (deck y=dy), main piers at 560 and 1360, approach spans to the edges.
export type BridgeState = { k?: number; gone?: boolean; crew?: boolean; police?: boolean; lights?: boolean; night?: boolean; t: number; dy?: number; wy?: number; hitShake?: number };
export const KeyBridge: React.FC<BridgeState> = ({ k = 0, gone, crew, police, lights = true, night = true, t, dy = 430, wy = 760, hitShake = 0 }) => {
  const steel = night ? "#3a4656" : STEEL;
  const ink = { stroke: INK, strokeWidth: 5, strokeLinejoin: "round" as const };
  const P1 = 560, P2 = 1360, L = 300, R = 1620;
  const top = (x: number) => dy - 40 - 150 * Math.sin(((x - L) / (R - L)) * Math.PI);
  const trussPath = (a: number, b: number) => {
    const pts: string[] = [];
    for (let x = a; x <= b; x += 20) pts.push(`${x},${top(x)}`);
    return `M${a} ${dy} L ${pts.join(" L ")} L ${b} ${dy} Z`;
  };
  const diag = (a: number, b: number) => Array.from({ length: Math.floor((b - a) / 60) }).map((_, i) => {
    const x = a + i * 60;
    return <path key={i} d={`M${x} ${dy} L ${x + 30} ${top(x + 30)} L ${x + 60} ${dy}`} stroke={steel} strokeWidth={6} fill="none" />;
  });
  const seg = (a: number, b: number, key: string) => (
    <g key={key}>
      <path d={trussPath(a, b)} fill="none" stroke={steel} strokeWidth={10} strokeLinejoin="round" />
      {diag(a, b)}
      <rect x={a} y={dy - 6} width={b - a} height={18} fill={night ? "#2b3442" : "#7d8790"} {...ink} />
      {lights && Array.from({ length: Math.floor((b - a) / 70) }).map((_, i) => <circle key={i} cx={a + 30 + i * 70} cy={dy - 12} r={5} fill={LAMP} opacity={0.9} />)}
    </g>
  );
  // collapse: the middle falls straight down, the two side pieces hinge at their outer ends
  const kk = clamp01(k), drop = kk * kk * (wy - dy + 120);
  const shake = hitShake ? Math.sin(t * 2.4) * hitShake : 0;
  return (
    <g transform={`translate(${shake} 0)`}>
      {/* approach spans */}
      {[[0, L], [R, W]].map(([a, b], i) => (
        <g key={i}>
          <rect x={a} y={dy - 2} width={b - a} height={16} fill={night ? "#2b3442" : "#7d8790"} {...ink} />
          {Array.from({ length: 4 }).map((_, j) => <rect key={j} x={a + 30 + j * ((b - a) / 4)} y={dy + 14} width={18} height={wy - dy - 14} fill={night ? "#26303d" : "#9aa4ad"} {...ink} />)}
          {lights && Array.from({ length: Math.floor((b - a) / 70) }).map((_, j) => <circle key={j} cx={a + 20 + j * 70} cy={dy - 8} r={5} fill={LAMP} />)}
        </g>
      ))}
      {/* main piers */}
      {[P1, P2].map((x, i) => (
        <g key={i} opacity={gone && i === 0 ? 0.0 : 1}>
          <rect x={x - 26} y={dy + 12} width={52} height={wy - dy - 12} fill={night ? "#26303d" : "#9aa4ad"} {...ink} />
          <rect x={x - 50} y={wy - 30} width={100} height={30} fill={night ? "#2f3a49" : "#b5bcc2"} {...ink} />
        </g>
      ))}
      {!gone && (
        <g>
          {kk === 0 ? seg(L, R, "all") : (
            <g>
              <g transform={`rotate(${kk * 38} ${L} ${dy})`}>{seg(L, P1, "l")}</g>
              <g transform={`translate(0 ${drop}) rotate(${kk * 6} 960 ${dy})`} opacity={1 - clamp01((kk - 0.85) / 0.15) * 0.6}>{seg(P1, P2, "m")}</g>
              <g transform={`rotate(${-kk * 34} ${R} ${dy})`}>{seg(P2, R, "r")}</g>
            </g>
          )}
        </g>
      )}
      {crew && !gone && kk === 0 && (
        <g transform={`translate(1000 ${dy - 8})`}>
          <rect x={-60} y={-44} width={110} height={44} rx={6} fill="#e0a23b" stroke={INK} strokeWidth={4} />
          <rect x={20} y={-60} width={40} height={60} rx={6} fill="#e0a23b" stroke={INK} strokeWidth={4} />
          <circle cx={-30} cy={2} r={10} fill={INK} /><circle cx={40} cy={2} r={10} fill={INK} />
          {[-110, -150, 90].map((x, i) => <path key={i} d={`M${x} 0 l 10 -28 l 10 28 Z`} fill="#f27c1e" stroke={INK} strokeWidth={3} />)}
          {[-90, 70, 110].map((x, i) => <g key={i}><circle cx={x} cy={-30} r={8} fill="#fff" stroke={INK} strokeWidth={2} /><rect x={x - 7} y={-22} width={14} height={18} fill="#f27c1e" stroke={INK} strokeWidth={2} /></g>)}
        </g>
      )}
      {police && [120, 1800].map((x, i) => (
        <g key={i} transform={`translate(${x} ${dy - 10})`}>
          <rect x={-46} y={-30} width={92} height={30} rx={8} fill="#f4f4f4" stroke={INK} strokeWidth={4} />
          <rect x={-18} y={-44} width={36} height={14} rx={4} fill={Math.floor(t / 6) % 2 ? RED : "#3a73b8"} stroke={INK} strokeWidth={3} />
          <circle cx={0} cy={-38} r={60} fill={Math.floor(t / 6) % 2 ? RED : "#3a73b8"} opacity={0.18} />
        </g>
      ))}
    </g>
  );
};

// ------------------------------------------------------------------ the Dali (side): BoxShipHD named DALI, with night lights
export const DaliSide: React.FC<{ x: number; y: number; w: number; lightsOn?: boolean; dark?: boolean }> = ({ x, y, w, lightsOn = true, dark }) => (
  <g transform={`translate(${x} ${y})`}>
    <g style={dark ? { filter: "brightness(0.42) saturate(0.6)" } : undefined}><BoxShipHD w={w} name="DALI" /></g>
    {lightsOn && (
      <g>
        {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={w * 0.66 + (i % 2) * w * 0.03} cy={-w * 0.24 + Math.floor(i / 2) * w * 0.02} r={w * 0.004 + 1} fill={LAMP} />)}
        {[0.05, 0.3, 0.55, 0.92].map((q, i) => <circle key={`d${i}`} cx={w * q} cy={-w * 0.085} r={w * 0.004 + 1.5} fill={LAMP} />)}
        <circle cx={w * 0.66} cy={-w * 0.3} r={w * 0.005 + 2} fill="#fff" />
      </g>
    )}
  </g>
);

// ------------------------------------------------------------------ NIGHT: the Dali under the lit bridge
const NightT: Tpl = ({ t, d, p }) => {
  const st = p.state ?? "sail";
  const close = p.cam === "close";
  const dawn = st === "dawn" ? 0.85 : 0;
  const offAt = st === "dark" ? Math.min(14, d * 0.4) : 9999;
  const lightsOn = st === "flicker" ? Math.floor(t / 5) % 3 !== 0 : t < offAt;
  const sw = close ? 1500 : 760;
  const sx = close ? -300 + t * 0.6 : 140 + t * 1.0;
  const wy = 760;
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} dawn={dawn} />
        {!close && <KeyBridge t={t} night={!dawn} gone={st === "dawn"} lights={st !== "dawn"} />}
        <Shore y={wy} night={!dawn} />
        <River t={t} y={wy} night={!dawn} dawn={dawn} />
        {st !== "dawn" && <DaliSide x={sx} y={wy + 14} w={sw} lightsOn={lightsOn} dark={!lightsOn} />}
        {/* reflections of lights */}
        {lightsOn && st !== "dawn" && Array.from({ length: 6 }).map((_, i) => <rect key={i} x={sx + sw * (0.3 + i * 0.1)} y={wy + 30 + (i % 3) * 18} width={30} height={4} fill={LAMP} opacity={0.35} />)}
        {st === "dawn" && <g opacity={ramp(t, 4, 30)}><path d="M0 430 L 300 430 M1620 430 L 1920 430" stroke="#5a6470" strokeWidth={16} /><circle cx={1200} cy={600} r={90} fill="#ffd9a0" opacity={0.6} /></g>}
      </Svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ TRUSS: the bridge side view, many modes
const TrussT: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "lit";
  const night = ["lit", "crew", "crew2", "empty", "hit", "collapse", "gone"].includes(m);
  const dayBg = !night;
  let k = 0, gone = false, hitShake = 0;
  if (m === "gone") { k = ramp(t, d * 0.35, d * 0.75); gone = t > d * 0.8; }
  if (m === "collapse") k = ramp(t, 6, Math.min(d - 4, 26 * 30));
  if (m === "hit") hitShake = t < 24 ? (24 - t) * 0.4 : 0;
  if (m === "domino") k = 0;
  if (m === "domino2") k = ramp(t, 4, d * 0.7);
  const diagram = m === "diag" || m === "domino" || m === "domino2";
  return (
    <AbsoluteFill>
      <Svg>
        {night ? <NightSky t={t} /> : <rect width={W} height={H} fill={diagram ? "#eef3f6" : "#bfe0f2"} />}
        {m === "new" ? (
          <g>
            <rect y={760} width={W} height={320} fill={WATER} />
            {/* new bridge: longer main span, cable-stayed look, big rock islands */}
            <rect x={0} y={430} width={W} height={18} fill="#7d8790" stroke={INK} strokeWidth={5} />
            {[460, 1460].map((x, i) => (
              <g key={i} opacity={ramp(t, 4 + i * 6, 16 + i * 6)}>
                <rect x={x - 18} y={170} width={36} height={600} fill="#b5bcc2" stroke={INK} strokeWidth={5} />
                {Array.from({ length: 8 }).map((_, j) => <line key={j} x1={x} y1={190 + j * 18} x2={x + (j % 2 ? 1 : -1) * (120 + j * 40)} y2={430} stroke="#5a6470" strokeWidth={3} />)}
                <ellipse cx={x} cy={770} rx={190 * ramp(t, 14, 30)} ry={40} fill="#9b8d76" stroke={INK} strokeWidth={5} />
              </g>
            ))}
            <T3 x={960} y={330} size={50} color={YEL} o={ramp(t, 20, 30)}>LONGER MAIN SPAN</T3>
          </g>
        ) : (
          <g>
            <KeyBridge t={t} k={k} gone={gone} night={night} crew={m === "crew" || m === "crew2"} police={m === "empty"} lights={night} hitShake={hitShake} />
            <Shore y={760} night={night} />
            <River t={t} y={760} night={night} />
            {(m === "hit" || m === "collapse") && <DaliSide x={-180 + (m === "hit" ? Math.min(t, 20) * 2 : 40)} y={790} w={760} lightsOn={false} dark />}
            {m === "hit" && t < 30 && <circle cx={560} cy={700} r={20 + t * 4} fill="#fff" opacity={(30 - t) / 60} />}
          </g>
        )}
        {m === "len" || p.len === "1" ? (
          <g opacity={ramp(t, 6, 16)}><line x1={0} y1={300} x2={W} y2={300} stroke={YEL} strokeWidth={8} /><T3 x={960} y={280} size={60} color={YEL}>2.6 km</T3></g>
        ) : null}
        {diagram && (
          <g opacity={ramp(t, 4, 14)}>
            <path d="M300 300 h 1320" stroke={RED} strokeWidth={6} strokeDasharray="20 12" />
            <T3 x={960} y={250} size={46} color={RED}>ONE LONG PIECE</T3>
            {[560, 1360].map((x) => <T3 key={x} x={x} y={880} size={36} color={INK}>support</T3>)}
            {m !== "diag" && <g transform={`translate(560 ${600 + ramp(t, 0, 10) * 0})`}><path d="M-40 -40 L40 40 M40 -40 L-40 40" stroke={RED} strokeWidth={16} strokeLinecap="round" opacity={ramp(t, 2, 8)} /></g>}
          </g>
        )}
        {m === "1977" && (
          <g transform={`translate(1500 600) scale(${pop(t, 6)})`}>
            <rect x={-150} y={-60} width={300} height={120} rx={10} fill="#c8a96a" stroke={INK} strokeWidth={6} />
            <text x={0} y={22} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={64} fill={INK}>1977</text>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ TOPD: the river from above
export const DaliTop: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M-150 -24 L 110 -25 Q 146 -12 152 0 Q 146 12 110 25 L -150 24 Q -156 0 -150 -24 Z" fill="#1f2e4c" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 19 }).map((_, c) => (c === 14 ? null : Array.from({ length: 4 }).map((__, r) => (
      <rect key={`${c}${r}`} x={-134 + c * 12.6} y={-20 + r * 10} width={11.6} height={9} fill={BOX[(c * 5 + r * 3) % BOX.length]} stroke={INK} strokeWidth={0.7} />
    ))))}
    <rect x={42} y={-24} width={9} height={48} fill="#efe9dc" stroke={INK} strokeWidth={1.2} />
    <rect x={-146} y={-10} width={12} height={20} fill="#efe9dc" stroke={INK} strokeWidth={1.2} />
  </g>
);
const TopdT: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "river";
  const night = !["river", "dolphins", "bounce", "islands", "tiny"].includes(m);
  const bridgeY = 300;
  const piers = [700, 1220];
  // ship travels up (north) towards the bridge
  let sy = 900, sx = 960, ang = -90, show = true;
  const progress = (a: number, b: number) => ramp(t, 0, d) * (b - a) + a;
  if (m === "dist") sy = 880;
  if (m === "dist2") sy = 880 - 260 * ramp(t, 0, d);
  if (m === "glide" || m === "glide2") sy = progress(900, 640);
  if (m === "rudder") sy = 820;
  if (m === "hardover") { sy = progress(820, 700); ang = -90 + 8 * ramp(t, 6, d); sx = 960 - 40 * ramp(t, 6, d); }
  if (m === "hit") { sy = progress(640, 420); sx = 760; ang = -84; }
  if (m === "river" || m === "dolphins" || m === "islands") show = false;
  if (m === "bounce") { sy = 560 + Math.max(0, Math.sin(ramp(t, 0, d) * Math.PI)) * -60 + 60; sx = 720; ang = -70; }
  if (m === "tiny") { sy = 520; sx = 700; ang = -88; }
  const len = 300 * 1.0;
  return (
    <AbsoluteFill style={{ background: night ? "#1b2638" : "#9cc287" }}>
      <Svg>
        {/* river with bends */}
        <path d="M600 1080 Q 520 760 640 520 Q 760 260 600 0 L 1380 0 Q 1240 260 1360 520 Q 1480 760 1320 1080 Z" fill={night ? NWATER : WATER} stroke={INK} strokeWidth={6} />
        {m === "river" && <g opacity={ramp(t, 6, 16)}><ellipse cx={700} cy={620} rx={70} ry={120} fill="#c9b98f" opacity={0.6} /><T3 x={700} y={630} size={34}>shallow</T3><T3 x={1440} y={760} size={40} color={YEL}>bends</T3></g>}
        {/* bridge from above */}
        <rect x={0} y={bridgeY - 20} width={W} height={40} fill={night ? "#3a4656" : "#8d97a1"} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={i * 66} y={bridgeY - 3} width={30} height={6} fill={night ? LAMP : "#fff"} opacity={night ? 0.8 : 0.6} />)}
        {piers.map((x) => <rect key={x} x={x - 30} y={bridgeY - 34} width={60} height={68} fill={night ? "#26303d" : "#9aa4ad"} stroke={INK} strokeWidth={5} />)}
        {/* protection */}
        {(m === "dolphins" || m === "bounce" || m === "tiny") && piers.map((x) => [-1, 1].map((sd) => <circle key={`${x}${sd}`} cx={x + sd * 70} cy={bridgeY + 70} r={m === "tiny" ? 18 : 30} fill="#b5bcc2" stroke={INK} strokeWidth={5} />))}
        {m === "islands" && piers.map((x) => <ellipse key={x} cx={x} cy={bridgeY + 40} rx={200 * ramp(t, 4, 20)} ry={110 * ramp(t, 4, 20)} fill="#a89878" stroke={INK} strokeWidth={5} />)}
        {m === "islands" && (
          <g transform={`translate(${700} ${560 - 120 * ramp(t, d * 0.4, d * 0.8)}) rotate(-90)`}><DaliTop s={1.1} /></g>
        )}
        {/* the Dali */}
        {show && <g transform={`translate(${sx} ${sy}) rotate(${ang})`}><DaliTop s={len / 300 * 1.2} /></g>}
        {/* rudder flow */}
        {m === "rudder" && Array.from({ length: 6 }).map((_, i) => {
          const fade = 1 - ramp(t, 6, d * 0.7);
          return <path key={i} d={`M${940 + (i % 3) * 20} ${1000 + ((t * 6 + i * 30) % 80)} v -40`} stroke="#9fd8f3" strokeWidth={6} opacity={fade} strokeLinecap="round" />;
        })}
        {/* distance line: three ship lengths */}
        {(m === "dist" || m === "dist2") && (
          <g opacity={ramp(t, 4, 12)}>
            <line x1={1180} y1={bridgeY + 30} x2={1180} y2={sy - 180} stroke={YEL} strokeWidth={8} strokeDasharray="22 12" />
            {[0, 1, 2].map((i) => <line key={i} x1={1150} y1={bridgeY + 30 + i * ((sy - 210 - bridgeY) / 3)} x2={1210} y2={bridgeY + 30 + i * ((sy - 210 - bridgeY) / 3)} stroke={YEL} strokeWidth={6} />)}
            <T3 x={1420} y={(bridgeY + sy) / 2} size={54} color={YEL}>3 ship lengths</T3>
          </g>
        )}
        {m === "hardover" && <T3 x={1360} y={900} size={70} color={YEL} o={ramp(t, 4, 10)}>↺ HARD OVER</T3>}
        {m === "hit" && t > d * 0.85 && <circle cx={700} cy={bridgeY + 30} r={60} fill="#fff" opacity={0.5} />}
        {(m === "glide" || m === "glide2") && <T3 x={1500} y={900} size={56} color="#fff" o={0.8}>still moving…</T3>}
      </Svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ DALI: the ship in day scenes (+ Ship Guy)
const DaliT: Tpl = ({ t, d, p, w }) => {
  const sc = p.scene ?? "sail";
  const g = p.guy;
  const guyAt = (x: number, y: number, s: number, flip?: boolean) => g ? <Actor a={g === "push" ? "push" : g} t={t} x={x} y={y} s={s} flip={flip} w={w} id="dali" /> : null;
  let body: React.ReactNode = null;
  const day = <rect width={W} height={H} fill="#bfe0f2" />;
  const sea = (y: number) => <River t={t} y={y} night={false} />;
  switch (sc) {
    case "sail": body = <g>{day}{sea(760)}<DaliSide x={60 + t * 1.2} y={790} w={1250} lightsOn={false} /><rect x={1450} y={760} width={470} height={320} fill="#9aa4ad" stroke={INK} strokeWidth={6} />{guyAt(1700, 780, 0.6, true)}</g>; break;
    case "yard": body = <g>{day}<rect y={300} width={W} height={600} fill="#cfd8de" />{[200, 900, 1600].map((x, i) => <g key={i} transform={`translate(${x} 860)`}><path d="M-10 0 V -620 M10 0 V -620 M-140 -620 H 340 M-140 -600 H 340" stroke="#e0a23b" strokeWidth={14} /><line x1={300} y1={-610} x2={300} y2={-380 + Math.sin(t * 0.05 + i) * 30} stroke={INK} strokeWidth={4} /></g>)}<DaliSide x={100} y={820} w={1500} lightsOn={false} /><rect y={860} width={W} height={220} fill="#9aa4ad" stroke={INK} strokeWidth={6} /><T3 x={1600} y={300} size={60} color={YEL} o={ramp(t, 6, 14)}>HYUNDAI · ULSAN</T3></g>; break;
    case "stack": case "weight": {
      const k = ramp(t, 0, d * 0.8);
      body = <g>{day}{sea(780)}<DaliSide x={120} y={800} w={1600} lightsOn={false} />
        <T3 x={960} y={300} size={130} color={YEL}>{sc === "stack" ? Math.round(4700 * k).toLocaleString("en-US") : `${Math.round(100 * k)},000+ t`}</T3></g>;
      break;
    }
    case "push": {
      body = <g>{day}{sea(800)}<rect x={0} y={800} width={W} height={280} fill="#9aa4ad" stroke={INK} strokeWidth={6} /><DaliSide x={-1500 + t * 0.9} y={800} w={2600} lightsOn={false} />
        {g && <Actor a={g === "pushslide" ? "pushslide" : "push"} t={t} x={g === "pushslide" ? 1300 + t * 0.9 : 1300} y={900} s={0.9} flip={true} w={w} id="push" />}</g>;
      break;
    }
    case "compare": body = <g>{day}{sea(760)}<g opacity={ramp(t, 0, 8)}><DaliSide x={160} y={780} w={520} lightsOn={false} /><T3 x={420} y={420} size={50}>1970s ship</T3></g><g opacity={ramp(t, 8, 18)}><DaliSide x={760} y={780} w={1100} lightsOn={false} /><T3 x={1310} y={330} size={50} color={YEL}>Dali (2015)</T3></g></g>; break;
    case "bigger": {
      body = <g>{day}<KeyBridge t={t} night={false} lights={false} />{sea(760)}{[420, 640, 900].map((wd, i) => <g key={i} opacity={ramp(t, i * 10, i * 10 + 8) * (i === 2 ? 1 : 1 - ramp(t, (i + 1) * 10, (i + 1) * 10 + 8))}><DaliSide x={300} y={790} w={wd} lightsOn={false} /></g>)}<T3 x={1500} y={300} size={60} color={RED} o={ramp(t, 24, 32)}>never re-checked</T3></g>;
      break;
    }
    case "draped": body = <g>{day}<KeyBridge t={t} night={false} lights={false} gone /><River t={t} y={760} night={false} />
      <DaliSide x={-200} y={790} w={1300} lightsOn={false} />
      <path d="M840 470 L 900 380 L 1000 330 L 1120 360 L 1200 520 L 1180 640 L 1100 620 L 1060 480 L 940 470 L 880 560 Z" fill="none" stroke="#5a6470" strokeWidth={16} strokeLinejoin="round" />
      <path d="M860 520 L 1150 400 M900 600 L 1120 470" stroke="#5a6470" strokeWidth={10} /></g>; break;
    case "drydock": body = <g><rect width={W} height={H} fill="#cfd8de" /><DaliSide x={160} y={760} w={1500} lightsOn={false} /><rect y={790} width={W} height={290} fill="#9aa4ad" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={1600 + Math.sin(t * 0.7 + i) * 24} cy={640 - ((t * 3 + i * 16) % 90)} r={6} fill={YEL} />)}
      <T3 x={1500} y={300} size={60} color={YEL} o={ramp(t, 6, 14)}>NEW BOW</T3></g>; break;
    case "sailing": body = <g>{day}{sea(760)}<DaliSide x={-300 + t * 1.6} y={790} w={1300} lightsOn={false} /><rect x={1500} y={760} width={420} height={320} fill="#9aa4ad" stroke={INK} strokeWidth={6} />{guyAt(1740, 780, 0.6, true)}</g>; break;
    default: body = day;
  }
  return <AbsoluteFill><Svg>{body}</Svg></AbsoluteFill>;
};

// ------------------------------------------------------------------ WHEEL: inside the ship's bridge at night
const WheelT: Tpl = ({ t, d, p, w }) => {
  const a = p.act ?? "crew";
  const dark = ["dark", "dark2", "orders2", "brake"].includes(a) || (a === "flicker" && Math.floor(t / 6) % 2 === 0);
  const dayDeck = a === "crewwait";
  const screens = !dark;
  const people = [
    { id: "p1", x: 760, outfit: "pilot" as const, a: "talk" },
    { id: "p2", x: 1060, outfit: "pilot" as const, a: "talk", flip: true },
    { id: "cp", x: 1440, outfit: "captain" as const, a: "talk", flip: true },
  ];
  const showPilots = a !== "crew";
  const guyAct = a === "chart" ? "notes" : a === "brake" ? "brake" : a === "dark2" ? "shock" : dark ? "worried" : "talk";
  return (
    <AbsoluteFill style={{ background: "#1f2735" }}>
      <Svg>
        {dayDeck ? (
          <g><rect width={W} height={H} fill="#bfe0f2" /><River t={t} y={720} night={false} /><DaliSide x={-400} y={760} w={2600} lightsOn={false} />
            {[0, 1, 2, 3, 4].map((i) => <Guy key={i} x={300 + i * 160} y={560} s={0.3} t={t + i * 11} id={`cw5${i}`} pose={breathe(IDLE, t, i * 7)} face={i % 2 ? FACES.worried : FACES.thinking} />)}</g>
        ) : (
          <g>
            <rect x={60} y={150} width={1800} height={420} fill={NIGHT1} stroke={INK} strokeWidth={8} />
            {/* the lit bridge ahead through the windows */}
            <g transform="translate(60 150) scale(0.94 0.5)"><KeyBridge t={t} night lights dy={460} wy={760} /></g>
            {[460, 860, 1260].map((x) => <rect key={x} x={x} y={150} width={22} height={420} fill="#1f2735" />)}
            <rect x={0} y={760} width={W} height={320} fill="#2b3442" stroke={INK} strokeWidth={8} />
            {[200, 600, 1300, 1650].map((x, i) => <rect key={x} x={x} y={790} width={180} height={110} rx={10} fill={screens ? (i === 1 ? "#1e8f6a" : "#2c5b93") : "#0b0f16"} stroke={INK} strokeWidth={5} />)}
            {a === "chart" && <g transform="translate(960 720)"><rect x={-260} y={-60} width={520} height={120} fill="#e8e1c8" stroke={INK} strokeWidth={6} /><path d="M-230 30 Q -60 -60 60 10 T 230 -30" stroke="#3a73b8" strokeWidth={14} fill="none" /></g>}
            {dark && <rect width={W} height={H} fill="#050a14" opacity={0.55} />}
            {showPilots && people.map((pp, i) => (
              <Actor key={pp.id} id={`wh-${pp.id}`} a={pp.a} t={t} x={a === "pilots" && i < 2 ? pp.x + (1 - ramp(t, i * 6, 36 + i * 6)) * 900 : pp.x} y={830} s={0.6} flip={pp.flip} outfit={pp.outfit}
                over={a === "pilots" && i < 2 && t < 36 + i * 6 ? { pose: walk(IDLE, t), feet: "fwd" } : a === "orders" || a === "orders2" ? { pose: breathe({ ...POSES.point, armR: [80 + Math.sin(t * 0.3) * 10, 0] }, t), handR: "point", face: { eyes: "dot", brows: "angry", mouth: "o" }, talk: Math.max(0, Math.sin(t * 0.7)) } : dark ? { face: FACES.worried } : undefined} />
            ))}
            <Actor a={guyAct} t={t} x={a === "crew" ? 960 : 330} y={830} s={0.62} id="wh-sg" w={a === "crew" ? undefined : w} over={a === "crew" ? { prop: "mug", pose: breathe(POSES.hold, t), face: FACES.satisfied } : undefined} />
            {a === "crew" && [0, 1, 2, 3].map((i) => <Guy key={i} x={300 + i * 420 + (i > 1 ? 400 : 0)} y={830} s={0.5} t={t + i * 9} id={`c5${i}`} pose={breathe(IDLE, t, i * 5)} face={FACES.happy} />)}
            {a === "brake" && <g transform="translate(330 860)"><rect x={-40} y={-10} width={80} height={24} rx={6} fill="#555" stroke={INK} strokeWidth={4} /><T3 x={0} y={-160} size={44} color={YEL}>BRAKE?</T3></g>}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES5: Record<string, Tpl> = {
  night: NightT, truss: TrussT, topd: TopdT, dali: DaliT, wheel: WheelT,
  ...TEMPLATES5B,
};
// used by templates5b
export { Guy };
