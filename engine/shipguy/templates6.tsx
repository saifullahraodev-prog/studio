// The Ship Guy: scene templates for "How an Aircraft Carrier Actually Works" (video #6), part 1 (hook, the ship, the launch).
// Same rules as templates3/5: full 1920x1080 frame from (t, d, p, w), frame-driven only, flat cartoon art with ink outlines.
// Aircraft are generic cartoon shapes (twin-tail fighter, radar plane, helicopter, tiltrotor), not exact models.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, IDLE, POSES } from "./guy";
import { CarrierHD } from "./ships_hd";
import { fontFamily, ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, WATER, clamp01, pop } from "./templates3";
import { NightSky, rnd, YEL, RED } from "./templates5";

export const NAVY = "#9aa6b1", NAVY_D = "#7d8a96", DECK = "#5a636c", DECK_N = "#2c333b", SKY1 = "#9fd3ee", SKY2 = "#e8f3f2", SEA = "#3f86b0";
export const JERSEY: Record<string, string> = { yellow: "#ffd23f", green: "#3f9a4f", purple: "#8a5aa8", red: "#e0392b", blue: "#2f6fd0", brown: "#8a5a32", white: "#f4f4f0" };
const O = (w = 5) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
const ease = (k: number) => { const c = clamp01(k); return c * c * (3 - 2 * c); };

// ================================================================== backgrounds
export const DaySky: React.FC<{ hz?: number }> = ({ hz = 640 }) => (
  <g>
    <defs><linearGradient id="dsk6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SKY1} /><stop offset="1" stopColor={SKY2} /></linearGradient></defs>
    <rect width={W} height={hz} fill="url(#dsk6)" />
    {[[260, 180, 1], [1380, 130, 1.3], [900, 300, 0.8]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
        <ellipse cx={0} cy={0} rx={110} ry={34} fill="#fff" /><ellipse cx={50} cy={-22} rx={60} ry={30} fill="#fff" /><ellipse cx={-50} cy={-12} rx={50} ry={24} fill="#fff" />
      </g>
    ))}
  </g>
);
export const OpenSea: React.FC<{ t: number; y: number; night?: boolean; speed?: number }> = ({ t, y, night, speed = 1 }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill={night ? "#0f2440" : SEA} />
    {Array.from({ length: 18 }).map((_, i) => {
      const x = ((i * 137 + t * 1.4 * speed) % (W + 200)) - 100;
      return <path key={i} d={`M${x} ${y + 30 + (i % 5) * 80} q 22 -8 44 0 t 44 0`} stroke={night ? "#24476f" : "#bfe6f5"} strokeWidth={5} fill="none" opacity={0.8} />;
    })}
    <line x1={0} y1={y} x2={W} y2={y} stroke={INK} strokeWidth={5} />
  </g>
);
export const TopSea: React.FC<{ t: number; night?: boolean }> = ({ t, night }) => (
  <g>
    <rect width={W} height={H} fill={night ? "#0f2440" : "#3a83ad"} />
    {Array.from({ length: 40 }).map((_, i) => (
      <path key={i} d={`M${(rnd(i) * W + t * 0.6) % W} ${rnd(i + 40) * H} q 14 -6 28 0`} stroke={night ? "#24476f" : "#8cc8e4"} strokeWidth={4} fill="none" />
    ))}
  </g>
);

// ================================================================== aircraft (nose right)
/** Twin-tail strike fighter, side view. Wheels touch y = 0 when gear is down. */
export const Fighter: React.FC<{ gear?: boolean; hook?: boolean; flame?: number; pilot?: boolean; color?: string; pods?: boolean }> = ({ gear = true, hook, flame = 0, pilot = true, color = NAVY, pods }) => (
  <g>
    {flame > 0 && (
      <g>
        <path d={`M-196 -50 L ${-196 - 150 * flame} -46 L -196 -36 Z`} fill="#ffb03a" opacity={0.9} />
        <path d={`M-196 -47 L ${-196 - 90 * flame} -44 L -196 -40 Z`} fill="#fff4c2" />
      </g>
    )}
    {gear && (
      <g>
        <line x1={140} y1={-34} x2={146} y2={-12} {...O(6)} /><circle cx={146} cy={-10} r={10} fill="#2a2d33" {...O(3)} />
        <line x1={-40} y1={-32} x2={-46} y2={-14} {...O(7)} /><circle cx={-46} cy={-12} r={13} fill="#2a2d33" {...O(3)} />
      </g>
    )}
    {hook && <path d="M-160 -36 L -206 -2 L -214 -8" fill="none" {...O(6)} />}
    {/* twin tails */}
    <path d="M-176 -58 L -150 -132 L -122 -132 L -104 -60 Z" fill={NAVY_D} {...O(5)} />
    <path d="M-160 -58 L -128 -124 L -104 -124 L -92 -60 Z" fill={color} {...O(5)} />
    {/* body */}
    <path d="M-196 -58 L -60 -66 L 60 -72 Q 150 -66 214 -50 Q 150 -36 60 -34 L -60 -32 L -196 -38 Z" fill={color} {...O(6)} />
    <path d="M-196 -40 L -60 -34 L 60 -36 Q 150 -38 214 -50 Q 160 -46 60 -46 L -196 -48 Z" fill="#000" opacity={0.12} />
    <ellipse cx={-197} cy={-48} rx={8} ry={11} fill="#3b3f46" {...O(4)} />
    {/* intake, wing, stabiliser */}
    <path d="M-10 -40 L 40 -40 L 40 -26 L -10 -28 Z" fill={NAVY_D} {...O(4)} />
    <path d="M-100 -46 L 30 -50 L -30 -40 L -120 -40 Z" fill={NAVY_D} {...O(4)} />
    <path d="M-206 -46 L -150 -50 L -176 -36 Z" fill={NAVY_D} {...O(4)} />
    {pods && <g><rect x={-60} y={-30} width={70} height={16} rx={8} fill="#c9cfd5" {...O(3)} /><rect x={30} y={-30} width={50} height={14} rx={7} fill="#c9cfd5" {...O(3)} /></g>}
    {/* canopy + pilot */}
    {pilot && <g><circle cx={90} cy={-80} r={11} fill="#e9ecef" {...O(3)} /><path d="M80 -84 Q 90 -94 100 -84" stroke="#2b3340" strokeWidth={5} fill="none" /></g>}
    <path d="M44 -70 Q 84 -104 140 -66 Z" fill={SKY1} opacity={0.8} {...O(5)} />
    <text x={-60} y={-44} fontFamily={fontFamily} fontWeight={700} fontSize={14} fill="#4a5560">NAVY</text>
  </g>
);

/** Fighter from above (nose right), about 190 units long. folded = wings folded (parked). */
export const FighterTop: React.FC<{ folded?: boolean; color?: string }> = ({ folded, color = NAVY }) => {
  const span = folded ? 34 : 70;
  return (
    <g>
      {[-1, 1].map((s) => <path key={s} d={`M-26 ${s * 8} L 26 ${s * 8} L ${-8} ${s * span} L ${-34} ${s * span} Z`} fill={NAVY_D} {...O(3)} />)}
      {[-1, 1].map((s) => <path key={`h${s}`} d={`M-90 ${s * 6} L -66 ${s * 6} L -82 ${s * 30} L -96 ${s * 30} Z`} fill={NAVY_D} {...O(3)} />)}
      <path d="M-96 -10 L 60 -9 Q 96 0 60 9 L -96 10 Z" fill={color} {...O(4)} />
      {[-1, 1].map((s) => <path key={`t${s}`} d={`M-76 ${s * 6} L -56 ${s * 13} L -50 ${s * 9}`} fill="none" stroke={INK} strokeWidth={4} />)}
      <ellipse cx={46} cy={0} rx={18} ry={5} fill={SKY1} {...O(2)} />
    </g>
  );
};

/** Radar plane (E-2D-like): high wing, two props, big dish on top. spin = frame for the dish stripe. */
const Hawkeye: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M-150 -60 L -150 -110 L -130 -110 L -120 -60 Z M-110 -60 L -110 -104 L -94 -104 L -86 -60 Z" fill={NAVY_D} {...O(4)} />
    <path d="M-170 -50 Q -170 -66 -120 -66 L 150 -66 Q 196 -62 204 -46 Q 196 -30 150 -30 L -120 -30 Q -170 -30 -170 -50 Z" fill={NAVY} {...O(6)} />
    <path d="M150 -66 Q 186 -60 200 -50 L 150 -50 Z" fill={SKY1} {...O(3)} />
    <rect x={-40} y={-80} width={150} height={14} rx={6} fill={NAVY_D} {...O(4)} />
    {[-10, 80].map((x) => (
      <g key={x}>
        <rect x={x} y={-80} width={50} height={22} rx={8} fill={NAVY_D} {...O(4)} />
        <ellipse cx={x + 54} cy={-70} rx={8} ry={46} fill="#dfe6ea" opacity={0.5} {...O(2)} />
      </g>
    ))}
    <line x1={10} y1={-66} x2={10} y2={-110} {...O(8)} /><line x1={60} y1={-66} x2={50} y2={-110} {...O(8)} />
    <ellipse cx={30} cy={-118} rx={120} ry={18} fill="#f4f4f0" {...O(5)} />
    <rect x={30 + Math.sin(t * 0.25) * 100 - 6} y={-134} width={12} height={32} fill="#c94a3a" opacity={0.9 * Math.abs(Math.cos(t * 0.25))} />
  </g>
);

export const Helo: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M-60 -50 L -240 -64 L -250 -90 L -230 -90 L -210 -70 L -60 -66 Z" fill={NAVY} {...O(5)} />
    <ellipse cx={-240} cy={-74} rx={6} ry={28} fill="#dfe6ea" opacity={0.6} {...O(2)} />
    <path d="M-80 -70 Q -80 -110 -10 -112 L 60 -110 Q 120 -100 130 -60 Q 120 -24 60 -20 L -40 -20 Q -80 -24 -80 -70 Z" fill={NAVY} {...O(6)} />
    <path d="M70 -100 Q 112 -92 124 -64 L 70 -64 Z" fill={SKY1} {...O(4)} />
    <rect x={-40} y={-80} width={60} height={42} rx={6} fill={NAVY_D} {...O(4)} />
    <rect x={-40} y={-124} width={70} height={16} rx={6} fill={NAVY_D} {...O(4)} />
    <line x1={-6} y1={-124} x2={-6} y2={-140} {...O(6)} />
    <ellipse cx={-6} cy={-142} rx={230} ry={8} fill="#2a2d33" opacity={0.35 + 0.2 * Math.abs(Math.sin(t * 0.9))} />
    <path d="M-60 -18 L -60 -4 M60 -18 L 60 -4" {...O(5)} />
  </g>
);

/** Tiltrotor transport, aeroplane mode. */
const Tiltrotor: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M-190 -50 L -200 -120 L -176 -120 L -150 -60 Z" fill={NAVY_D} {...O(5)} />
    <path d="M-200 -46 Q -200 -70 -150 -72 L 150 -74 Q 200 -70 214 -48 Q 200 -26 150 -24 L -150 -24 Q -200 -26 -200 -46 Z" fill="#8f9aa5" {...O(6)} />
    <path d="M150 -72 Q 190 -66 206 -52 L 150 -52 Z" fill={SKY1} {...O(3)} />
    <rect x={-50} y={-90} width={120} height={14} rx={6} fill={NAVY_D} {...O(4)} />
    <rect x={20} y={-104} width={70} height={26} rx={12} fill={NAVY_D} {...O(4)} />
    <ellipse cx={96} cy={-92} rx={10} ry={90} fill="#dfe6ea" opacity={0.45 + 0.15 * Math.sin(t)} {...O(2)} />
  </g>
);

/** Small stick person in a coloured jersey, seen from the side, `s` scale (deck crowds, top-down not needed). */
export const Crew: React.FC<{ x: number; y: number; c: string; s?: number; t: number; arm?: number }> = ({ x, y, c, s = 1, t, arm = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={-6} y1={0} x2={-2} y2={-34} {...O(5)} /><line x1={6} y1={0} x2={2} y2={-34} {...O(5)} />
    <rect x={-12} y={-70} width={24} height={38} rx={8} fill={c} {...O(4)} />
    <line x1={10} y1={-62} x2={30} y2={-62 - 18 * Math.sin(arm + t * 0.2)} {...O(5)} />
    <circle cx={0} cy={-84} r={13} fill="#f3f1ea" {...O(4)} />
    <path d="M-13 -86 Q 0 -104 13 -86" fill={c} {...O(3)} />
  </g>
);

// ================================================================== carrier from above (bow right, 1000 long, starboard = bottom)
// angled landing area runs from the stern up to port; island + 3 elevators starboard, 1 elevator port.
export const ANG = -12; // drawn angle of the landing area (degrees, screen)
export const CarrierTop: React.FC<{ night?: boolean; wires?: number; cats?: boolean; num?: string; elevators?: boolean }> = ({ night, wires = 4, cats = true, num = "68", elevators = true }) => {
  const deck = night ? DECK_N : DECK;
  return (
    <g>
      <path d="M0 -20 L 30 -95 L 520 -150 L 610 -110 L 880 -92 Q 975 -60 1004 -6 L 1004 18 Q 975 70 880 92 L 520 108 L 50 100 L 0 60 Z" fill={night ? "#1d2228" : "#6b747d"} {...O(6)} />
      <path d="M10 -16 L 36 -86 L 520 -140 L 604 -102 L 878 -84 Q 966 -54 994 -4 L 994 16 Q 966 64 878 84 L 520 98 L 54 92 L 10 56 Z" fill={deck} />
      {/* angled landing area */}
      <g transform={`translate(30 30) rotate(${ANG})`}>
        <rect x={0} y={-46} width={640} height={92} fill="none" stroke={night ? "#ffd27a" : "#fff"} strokeWidth={3} strokeDasharray="16 12" />
        <line x1={10} y1={0} x2={630} y2={0} stroke={YEL} strokeWidth={3} strokeDasharray="22 14" />
        {Array.from({ length: wires }).map((_, i) => <line key={i} x1={120 + i * 32} y1={-40} x2={120 + i * 32} y2={40} stroke={night ? "#c7cdd3" : "#20252b"} strokeWidth={4} />)}
        {night && Array.from({ length: 16 }).map((_, i) => <circle key={i} cx={20 + i * 40} cy={0} r={3} fill="#fff" />)}
      </g>
      {cats && (
        <g stroke={night ? "#4a525b" : "#3c434a"} strokeWidth={4}>
          <line x1={640} y1={-34} x2={980} y2={-20} /><line x1={640} y1={14} x2={985} y2={10} />
          <g transform={`translate(270 -40) rotate(${ANG})`}><line x1={0} y1={-20} x2={300} y2={-20} /><line x1={0} y1={22} x2={300} y2={22} /></g>
        </g>
      )}
      {elevators && <g fill={night ? "#262c33" : "#4d555d"} stroke={INK} strokeWidth={2}>
        <rect x={690} y={84} width={70} height={30} /><rect x={780} y={80} width={70} height={30} /><rect x={440} y={96} width={70} height={30} /><rect x={110} y={-124} width={70} height={28} />
      </g>}
      {/* island (starboard) */}
      <rect x={560} y={64} width={90} height={36} rx={4} fill={night ? "#3a424b" : "#8e99a4"} {...O(4)} />
      <rect x={576} y={72} width={36} height={18} fill={night ? "#1d2228" : "#5f6a74"} />
      <text x={900} y={10} fontFamily={fontFamily} fontWeight={700} fontSize={56} fill="#fff" opacity={0.85} transform="rotate(90 900 10)" textAnchor="middle">{num}</text>
    </g>
  );
};

// ================================================================== HOOK: cockpit view of a night approach
const Cockpit: Tpl = ({ t, d, p }) => {
  const v = p.view ?? "far";
  const app = v === "far" ? 0.25 + t / 900 : v === "bob" ? 0.42 : v === "box" ? 0.55 + t / 1500 : 0.62;
  const bob = v === "bob" || v === "box" ? Math.sin(t * 0.07) * 26 : Math.sin(t * 0.05) * 6;
  const sc = 0.42 + app * 1.1;
  const hz = 470;
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <rect x={0} y={hz} width={W} height={H - hz} fill="#08162a" />
        {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M${(rnd(i) * W + t * 0.8) % W} ${hz + 40 + rnd(i + 5) * 500} q 30 -8 60 0`} stroke="#13294a" strokeWidth={6} fill="none" />)}
        {/* the deck, seen from behind and above: lights in perspective */}
        <g transform={`translate(960 ${hz + 40 + bob}) scale(${sc}) rotate(${Math.sin(t * 0.04) * 1.5})`}>
          <path d="M-300 330 L -130 -70 L 130 -70 L 300 330 Z" fill="#232b36" stroke="#3a4656" strokeWidth={4} />
          <path d="M-300 330 L 300 330 L 250 420 L -250 420 Z" fill="#161c24" />
          {Array.from({ length: 10 }).map((_, i) => { const k = i / 9; const y = 300 - k * 360, hw = 260 - k * 140; return <g key={i}><circle cx={-hw} cy={y} r={7} fill="#ffd27a" /><circle cx={hw} cy={y} r={7} fill="#ffd27a" /><circle cx={0} cy={y} r={5} fill="#fff" /></g>; })}
          {Array.from({ length: 6 }).map((_, i) => <circle key={`dl${i}`} cx={0} cy={310 + i * 26} r={8} fill="#ff9b3a" />)}
          {/* the meatball on the left side: a tiny amber dot between green lights */}
          <g transform="translate(-330 120)"><circle cx={0} cy={0} r={10} fill="#ffb03a" />{[-1, 1].map((s) => [1, 2, 3].map((j) => <circle key={`${s}${j}`} cx={s * j * 26} cy={0} r={6} fill="#4dff7a" />))}</g>
        </g>
        {p.ring === "1" && <circle cx={960} cy={hz + 60 + bob + 100 * sc} r={220 + 20 * Math.sin(t * 0.3)} fill="none" stroke={YEL} strokeWidth={8} strokeDasharray="26 16" opacity={ramp(t, 6, 14)} />}
        {v === "box" && (
          <g opacity={ramp(t, 10, 20)}>
            <rect x={960 - 150 * sc / 0.6} y={hz + 40 + bob + 110 * sc} width={300 * sc / 0.6} height={120 * sc} fill="none" stroke={YEL} strokeWidth={6} strokeDasharray="20 12" />
            <T3 x={960} y={hz + 40 + bob + 110 * sc - 30} size={50} color={YEL}>YOUR TARGET</T3>
          </g>
        )}
        {/* HUD */}
        <g stroke="#4dff7a" strokeWidth={4} fill="none" opacity={0.85}>
          <circle cx={960} cy={500} r={18} /><line x1={920} y1={500} x2={942} y2={500} /><line x1={978} y1={500} x2={1000} y2={500} /><line x1={960} y1={482} x2={960} y2={468} />
          {[-1, 1].map((s) => <path key={s} d={`M${960 + s * 120} 400 h ${s * 80} v 14`} />)}
          <rect x={620} y={480} width={110} height={44} /><rect x={1190} y={480} width={110} height={44} />
        </g>
        <text x={675} y={514} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={32} fill="#4dff7a">130</text>
        <text x={1245} y={514} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={32} fill="#4dff7a">{Math.max(200, Math.round(900 - app * 900))}</text>
        <text x={675} y={560} textAnchor="middle" fontFamily={fontFamily} fontSize={22} fill="#4dff7a">KTS</text>
        {/* canopy frame */}
        <path d={`M0 0 H ${W} V 140 Q 960 40 0 140 Z`} fill="#15181d" />
        <path d="M0 1080 L 0 760 Q 300 820 520 1080 Z M1920 1080 L 1920 760 Q 1620 820 1400 1080 Z" fill="#15181d" />
        <path d="M520 1080 Q 960 900 1400 1080 Z" fill="#262b33" />
        <path d="M80 160 Q 400 90 700 110" stroke="#fff" strokeWidth={6} opacity={0.12} fill="none" />
        {v === "timer" && (
          <g transform={`translate(960 640) scale(${pop(t, 4)})`}>
            <circle r={170} fill="#f4f4f0" {...O(10)} /><rect x={-26} y={-212} width={52} height={40} rx={8} fill="#f4f4f0" {...O(8)} />
            <path d={`M0 0 L 0 -140 A 140 140 0 ${clamp01((t - 10) / 60) > 0.5 ? 1 : 0} 1 ${140 * Math.sin(clamp01((t - 10) / 60) * 6.283)} ${-140 * Math.cos(clamp01((t - 10) / 60) * 6.283)} Z`} fill={RED} opacity={0.85} />
            <text x={0} y={30} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={90} fill={INK}>{(clamp01((t - 10) / 60) * 2).toFixed(1)}s</text>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== HOOK: the jet seen from outside / the Ship Guy in the cockpit
const JetSide: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "fly";
  if (m === "guy") {
    // close-up: the Ship Guy in a flight helmet, gripping the stick, sweating
    const shake = Math.sin(t * 1.3) * 3;
    return (
      <AbsoluteFill>
        <Svg>
          <NightSky t={t} />
          <rect y={720} width={W} height={360} fill="#08162a" />
          <g transform={`translate(${shake} 0)`}>
            <defs><clipPath id="cp6"><rect x={0} y={0} width={W} height={860} /></clipPath></defs>
            <g clipPath="url(#cp6)">
              <Actor a="worried" t={t} x={960} y={1180} s={1.35} id="pilot6" outfit="aviator" w={w}
                over={{ pose: { ...IDLE, armL: [40, 70], armR: [40, 70], lean: 4 + Math.sin(t * 0.6) * 2, tilt: 0 }, face: { eyes: "wide", brows: "worried", mouth: "teeth" }, emote: "sweat", emoteT: t }} />
            </g>
            <path d="M0 860 Q 960 780 1920 860 V 1080 H 0 Z" fill="#2b3038" {...O(8)} />
            <rect x={860} y={760} width={30} height={140} rx={10} fill="#1d2025" {...O(5)} transform={`rotate(${Math.sin(t * 0.5) * 6} 875 900)`} />
            {[[300, 930], [1560, 930], [1250, 960]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={56} fill="#111" {...O(5)} /><line x1={x} y1={y} x2={x + 40 * Math.cos(t * 0.1 + i)} y2={y - 40 * Math.abs(Math.sin(t * 0.1 + i))} stroke="#4dff7a" strokeWidth={5} /></g>)}
            <path d="M0 0 H 1920 V 120 Q 960 30 0 120 Z" fill="#15181d" />
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "climb") {
    const k = t / 120;
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={900} />
          <OpenSea t={t * 3} y={900} />
          {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={W - ((t * 40 + i * 260) % (W + 400))} y1={150 + i * 90} x2={W - ((t * 40 + i * 260) % (W + 400)) + 160} y2={150 + i * 90} stroke="#fff" strokeWidth={6} opacity={0.6} />)}
          <g transform={`translate(${760 + k * 300} ${560 - k * 200}) scale(2.1) rotate(-12)`}><Fighter gear={false} flame={0.8} /></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  const night = m !== "day";
  const deckY = 820;
  const x = m === "fly" ? 560 + t * 2 : 900;
  const y = m === "fly" ? 470 + Math.sin(t * 0.06) * 20 : deckY;
  const slam = m === "touch" ? clamp01((t - 8) / 6) : 0;
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        {m === "fly" && <OpenSea t={t * 4} y={760} night />}
        {m === "fly" && Array.from({ length: 6 }).map((_, i) => <line key={i} x1={x - 260 - ((t * 30 + i * 90) % 600)} y1={y - 120 + i * 40} x2={x - 360 - ((t * 30 + i * 90) % 600)} y2={y - 120 + i * 40} stroke="#fff" strokeWidth={4} opacity={0.4} />)}
        {(m === "touch" || m === "grab") && (
          <g>
            <OpenSea t={t} y={900} night />
            <rect x={0} y={deckY} width={W} height={60} fill={DECK_N} {...O(5)} />
            {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={60 + i * 140} cy={deckY + 8} r={5} fill="#ffd27a" />)}
          </g>
        )}
        <g transform={`translate(${x} ${m === "touch" ? deckY - 6 - (1 - slam) * 120 : y}) scale(1.9) rotate(${m === "touch" ? -4 * (1 - slam) : -3})`}>
          <Fighter gear hook={m !== "fly"} flame={m === "touch" && t > 14 ? 1 : 0.35} />
        </g>
        {m === "touch" && t > 13 && t < 30 && Array.from({ length: 10 }).map((_, i) => <line key={i} x1={820 + i * 18} y1={deckY} x2={760 + i * 10 - (t - 13) * 6} y2={deckY - 20 - rnd(i) * 40} stroke={YEL} strokeWidth={4} />)}
        {m === "grab" && (
          <g opacity={ramp(t, 6, 16)}>
            <rect x={300} y={deckY - 160} width={340} height={170} fill="none" stroke={YEL} strokeWidth={6} strokeDasharray="22 14" />
            <T3 x={470} y={deckY - 40} size={140} color={YEL} s={pop(t, 8)}>?</T3>
            <g transform={`translate(1550 300) scale(${pop(t, 12) * 0.8})`}>
              <circle r={150} fill="#f4f4f0" {...O(10)} /><rect x={-24} y={-190} width={48} height={36} rx={8} fill="#f4f4f0" {...O(8)} />
              <text x={0} y={34} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={90} fill={INK}>{(clamp01((t - 16) / 60) * 2).toFixed(1)}s</text>
            </g>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== HOOK: the throttle slammed forward
const Throttle: Tpl = ({ t }) => {
  const k = ease((t - 8) / 6);
  const lx = 640 + k * 560;
  const needle = -120 + k * 230 + (k > 0.95 ? Math.sin(t * 2) * 3 : 0);
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#1d2127" />
        {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={140 + i * 240} cy={110} r={40} fill="#111" {...O(4)} />)}
        <rect x={380} y={600} width={1100} height={60} rx={30} fill="#2e333b" {...O(6)} />
        <text x={460} y={720} fontFamily={fontFamily} fontWeight={700} fontSize={46} fill="#8a96a3">IDLE</text>
        <text x={1360} y={720} fontFamily={fontFamily} fontWeight={700} fontSize={46} fill={k > 0.9 ? YEL : "#8a96a3"}>MAX</text>
        <g transform={`translate(${lx} 630)`}>
          <rect x={-30} y={-260} width={60} height={260} rx={14} fill="#3a4049" {...O(6)} />
          <rect x={-70} y={-340} width={140} height={110} rx={40} fill="#c9a23a" {...O(6)} />
          <path d="M-60 -250 q 0 -90 60 -90 q 60 0 60 90" fill="none" stroke="#f4f4f0" strokeWidth={18} strokeLinecap="round" />
        </g>
        {t > 8 && t < 18 && Array.from({ length: 4 }).map((_, i) => <line key={i} x1={lx - 120 - i * 40} y1={360 + i * 30} x2={lx - 260 - i * 40} y2={360 + i * 30} stroke="#fff" strokeWidth={6} opacity={0.5} />)}
        <g transform="translate(1600 330)">
          <circle r={170} fill="#0b0d10" {...O(8)} />
          {Array.from({ length: 11 }).map((_, i) => { const a = (-120 + i * 23) * Math.PI / 180; return <line key={i} x1={Math.sin(a) * 130} y1={-Math.cos(a) * 130} x2={Math.sin(a) * 150} y2={-Math.cos(a) * 150} stroke={i > 8 ? RED : "#fff"} strokeWidth={6} />; })}
          <line x1={0} y1={0} x2={Math.sin(needle * Math.PI / 180) * 120} y2={-Math.cos(needle * Math.PI / 180) * 120} stroke={YEL} strokeWidth={10} strokeLinecap="round" />
          <circle r={14} fill={YEL} />
          <text x={0} y={90} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={36} fill="#fff">RPM %</text>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== SECTION 1: the carrier, side view
const Dinghy: React.FC<{ t: number; x: number; y: number; s: number; a?: string; w?: number[][] }> = ({ t, x, y, s, a = "wave", w }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 0.12) * 6}) rotate(${Math.sin(t * 0.1) * 4})`}>
    <Actor a={a} t={t} x={0} y={0} s={s} id="dinghy" w={w} />
    <path d={`M${-220 * s} ${-80 * s} L ${220 * s} ${-80 * s} L ${170 * s} ${40 * s} L ${-170 * s} ${40 * s} Z`} fill="#e0a23b" {...O(6)} />
    <path d={`M${-210 * s} ${-60 * s} L ${210 * s} ${-60 * s}`} stroke="#fff" strokeWidth={8} />
  </g>
);

const Cv: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "sail";
  const hz = 640;
  const slide = m === "speed" ? 0 : t * 0.4;
  const cw = m === "two" ? 820 : 1500;
  let extra: React.ReactNode = null;
  let ship: React.ReactNode = <g transform={`translate(${210 - slide} ${hz + 40})`}><CarrierHD w={cw} num={p.num ?? "68"} /></g>;
  if (m === "two") {
    ship = (
      <g>
        <g transform={`translate(${80 - slide * 0.5} ${hz + 40})`}><CarrierHD w={cw} num="68" /></g>
        <g transform={`translate(${1000 - slide * 0.5} ${hz + 40})`}><CarrierHD w={cw} num="78" /></g>
        <T3 x={490} y={470} size={64} s={pop(t, 4)}>NIMITZ CLASS</T3>
        <T3 x={1410} y={470} size={64} color={YEL} s={pop(t, 20)}>FORD CLASS</T3>
      </g>
    );
  }
  if (m === "length") {
    const k = ease((t - 6) / 24);
    extra = (
      <g>
        <line x1={210 - slide} y1={hz - 130} x2={210 - slide + 1500 * k} y2={hz - 130} stroke={YEL} strokeWidth={10} />
        <line x1={210 - slide} y1={hz - 160} x2={210 - slide} y2={hz - 100} stroke={YEL} strokeWidth={10} />
        {k > 0.98 && <line x1={1710 - slide} y1={hz - 160} x2={1710 - slide} y2={hz - 100} stroke={YEL} strokeWidth={10} />}
        <T3 x={960 - slide} y={hz - 170} size={90} color={YEL} s={pop(t, 26)}>≈ 333 m</T3>
      </g>
    );
  }
  if (m === "weight") {
    const k = ease((t - 6) / 30);
    extra = (
      <g transform={`translate(1560 380) scale(${0.8 * pop(t, 2)})`}>
        <circle r={180} fill="#f4f4f0" {...O(10)} />
        {Array.from({ length: 9 }).map((_, i) => { const a = (-120 + i * 30) * Math.PI / 180; return <line key={i} x1={Math.sin(a) * 140} y1={-Math.cos(a) * 140} x2={Math.sin(a) * 165} y2={-Math.cos(a) * 165} {...O(6)} />; })}
        <line x1={0} y1={0} x2={Math.sin((-120 + k * 220) * Math.PI / 180) * 130} y2={-Math.cos((-120 + k * 220) * Math.PI / 180) * 130} stroke={RED} strokeWidth={12} strokeLinecap="round" />
        <circle r={16} fill={INK} />
        <text x={0} y={100} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={56} fill={INK}>{Math.round(k * 100)},000 t</text>
      </g>
    );
  }
  if (m === "speed") {
    extra = (
      <g>
        {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${200 - ((t * 12 + i * 70) % 500)} ${hz + 50 + i * 12} q 40 -10 80 0`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.8} />)}
        {Array.from({ length: 5 }).map((_, i) => <line key={`s${i}`} x1={120 - ((t * 20 + i * 140) % 700)} y1={hz - 120 + i * 30} x2={20 - ((t * 20 + i * 140) % 700)} y2={hz - 120 + i * 30} stroke="#fff" strokeWidth={5} opacity={0.6} />)}
        <Dinghy t={t} x={240 - t * 6} y={hz + 230 + Math.sin(t * 0.5) * 30} s={0.32} a="shock" />
      </g>
    );
  }
  if (m === "xray") {
    const k = ramp(t, 4, 18);
    extra = (
      <g opacity={k}>
        <rect x={300 - slide} y={hz + 60} width={1300} height={70} fill="#f4f4f0" opacity={0.92} {...O(4)} />
        {Array.from({ length: 26 }).map((_, i) => (
          <g key={i} transform={`translate(${330 - slide + i * 49} ${hz + 70})`}>
            {[0, 1, 2].map((r) => <rect key={r} x={0} y={r * 18} width={36} height={12} rx={3} fill={["#3a73b8", "#c94a3a", "#4f8a5b"][(i + r) % 3]} stroke={INK} strokeWidth={1.5} />)}
          </g>
        ))}
        <g transform={`translate(1500 300) scale(${pop(t, 20)}) rotate(-3)`}>
          <rect x={-230} y={-90} width={460} height={180} rx={14} fill="#2f7d4a" {...O(8)} />
          <rect x={-216} y={-76} width={432} height={152} rx={8} fill="none" stroke="#fff" strokeWidth={5} />
          <text x={0} y={-16} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={50} fill="#fff">USS NIMITZ</text>
          <text x={0} y={52} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={50} fill="#fff">POP. ~5,000</text>
          <rect x={-10} y={90} width={20} height={150} fill="#7a8088" {...O(4)} />
        </g>
      </g>
    );
  }
  if (m === "town") {
    extra = (
      <g>
        <rect x={0} y={hz - 10} width={W} height={50} fill="#7d9a6a" opacity={0} />
        <g transform={`translate(150 ${hz + 200})`}>
          <rect x={-120} y={-30} width={1700} height={300} fill="#7d9a6a" {...O(6)} />
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={i} transform={`translate(${-60 + i * 130} ${-30}) scale(${pop(t, 4 + i * 2)})`}>
              <rect x={-44} y={-70} width={88} height={70} fill={["#e8d6a6", "#f3f1ea", "#d9a77a"][i % 3]} {...O(5)} />
              <path d="M-54 -66 L 0 -112 L 54 -66 Z" fill={["#c94a3a", "#3a73b8", "#4f8a5b"][i % 3]} {...O(5)} />
              <rect x={-12} y={-34} width={24} height={34} fill="#5a4636" />
            </g>
          ))}
        </g>
        <g transform={`translate(1500 ${hz + 120}) scale(${pop(t, 16)})`}>
          <rect x={-200} y={-70} width={400} height={140} rx={12} fill="#f4f4f0" {...O(7)} />
          <text x={0} y={-10} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={40} fill={INK}>SMALL TOWN</text>
          <text x={0} y={44} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={40} fill={RED}>POP. 3,000</text>
        </g>
      </g>
    );
    ship = <g transform={`translate(${260 - slide} ${hz - 40}) scale(0.62)`}><CarrierHD w={1500} num="68" /></g>;
  }
  if (m === "title") {
    return (
      <AbsoluteFill>
        <Svg>
          <NightSky t={t} dawn={0.85} />
          <OpenSea t={t} y={hz + 60} />
          <g transform={`translate(${260 - slide} ${hz + 100})`} opacity={0.95}><CarrierHD w={1400} num="68" /></g>
          <T3 x={960} y={330} size={120} s={pop(t, 4)}>HOW IT</T3>
          <T3 x={960} y={470} size={140} color={YEL} s={pop(t, 12)}>REALLY WORKS</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={hz} />
        <OpenSea t={t} y={hz} speed={m === "speed" ? 6 : 1} />
        {m !== "town" && <g transform={`translate(${210 - slide} ${hz + 40})`} opacity={0.12}><ellipse cx={750} cy={30} rx={780} ry={30} fill="#fff" /></g>}
        {ship}
        {extra}
        {m === "helps" && (
          <g transform={`translate(1260 300) scale(${pop(t, 4)})`}>
            <path d="M-260 -90 H 260 V 70 H 20 L -40 160 L -40 70 H -260 Z" fill="#f4f4f0" {...O(8)} />
            <text x={0} y={10} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={62} fill={INK}>I'LL HELP!</text>
          </g>
        )}
        {m === "sail" && <Dinghy t={t} x={1500} y={hz + 300} s={0.38} w={w} />}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== SECTION 1: about as tall as the Eiffel Tower
const Eiffel: React.FC<{ h: number }> = ({ h }) => {
  const s = h / 1000;
  return (
    <g transform={`scale(${s})`} fill="#8a6a4a" stroke={INK} strokeWidth={8 / s * 0.6} strokeLinejoin="round">
      <path d="M-330 0 Q -200 -160 -120 -420 L -60 -800 L -20 -960 L 20 -960 L 60 -800 L 120 -420 Q 200 -160 330 0 L 220 0 Q 120 -200 0 -210 Q -120 -200 -220 0 Z" />
      <rect x={-150} y={-440} width={300} height={36} /><rect x={-90} y={-720} width={180} height={30} />
      <line x1={0} y1={-960} x2={0} y2={-1000} />
      {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={-260 + i * 10} y1={-40 - i * 40} x2={260 - i * 10} y2={-80 - i * 40} stroke="#6b4f35" strokeWidth={3} />)}
    </g>
  );
};
const EiffelT: Tpl = ({ t }) => {
  const g = 980, hpx = 760;
  const k = ease((t - 8) / 26);
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={g} />
        <rect y={g} width={W} height={H - g} fill="#7d9a6a" {...O(5)} />
        <g transform={`translate(620 ${g})`}><Eiffel h={hpx} /></g>
        <g transform={`translate(1060 ${g}) rotate(${-90 * k})`}><CarrierHD w={hpx * 333 / 330} num="68" /></g>
        <line x1={300} y1={g - hpx} x2={1500} y2={g - hpx} stroke={YEL} strokeWidth={6} strokeDasharray="20 14" opacity={ramp(t, 34, 42)} />
        <T3 x={620} y={g - hpx - 30} size={52} o={ramp(t, 36, 44)}>330 m</T3>
        <T3 x={1130} y={g - hpx - 30} size={52} color={YEL} o={ramp(t, 40, 48)}>333 m</T3>
        <Actor a="look" t={t} x={860} y={g} s={0.2} id="eif" />
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== SECTION 1: the strike group (top-down)
export const Escort: React.FC<{ len?: number; supply?: boolean }> = ({ len = 260, supply }) => (
  <g>
    <path d={`M${-len / 2} -${supply ? 30 : 20} L ${len * 0.3} -${supply ? 30 : 20} Q ${len / 2} 0 ${len * 0.3} ${supply ? 30 : 20} L ${-len / 2} ${supply ? 30 : 20} Z`} fill={supply ? "#8f8a80" : "#8e99a4"} {...O(4)} />
    {supply ? [-0.3, -0.05, 0.2].map((k) => <g key={k}><line x1={len * k} y1={-24} x2={len * k} y2={24} {...O(4)} /><circle cx={len * k} cy={0} r={6} fill={INK} /></g>)
      : <g><rect x={-len * 0.1} y={-11} width={len * 0.22} height={22} fill="#b0bac3" {...O(3)} /><circle cx={len * 0.24} cy={0} r={7} fill="#6b747d" {...O(2)} /></g>}
  </g>
);
const Group: Tpl = ({ t, p }) => {
  const m = p.mode ?? "escorts";
  const zoom = m === "all" ? 0.75 - 0.15 * ease(t / 60) : 0.95;
  const esc: [number, number, number, string][] = [[-520, -300, 0, "DESTROYER"], [560, -260, 6, "CRUISER"], [-560, 300, 12, "DESTROYER"], [600, 320, 18, "DESTROYER"]];
  return (
    <AbsoluteFill>
      <Svg>
        <TopSea t={t} />
        <g transform={`translate(960 540) scale(${zoom})`}>
          {/* wakes */}
          <path d={`M-900 0 L -500 0`} stroke="#d8eef7" strokeWidth={60} opacity={0.4} />
          <g transform="translate(-500 0)"><CarrierTop num="68" /></g>
          {esc.map(([x, y, a, label], i) => (
            <g key={i} transform={`translate(${x + Math.sin(t * 0.03 + i) * 10} ${y}) scale(${pop(t, a)})`}>
              <path d="M-300 0 L -130 0" stroke="#d8eef7" strokeWidth={20} opacity={0.4} />
              <Escort />
              <T3 x={0} y={-50} size={34}>{label}</T3>
              {m === "escorts" && <circle r={130 + (t * 3 + i * 30) % 60} fill="none" stroke="#fff" strokeWidth={4} opacity={0.5 - ((t * 3 + i * 30) % 60) / 120} />}
            </g>
          ))}
          {m !== "escorts" && (
            <g transform={`translate(${m === "supply" ? 20 : 20} 260) scale(${pop(t, 2)})`}>
              <Escort len={420} supply />
              <path d="M-60 -30 L -40 -130 M60 -30 L 80 -140" stroke="#2a2d33" strokeWidth={6} strokeDasharray="10 8" />
              {m === "supply" && [0, 1, 2].map((i) => <rect key={i} x={-90 + i * 70 + ((t * 2) % 30)} y={-100 - ((t * 3 + i * 20) % 60)} width={26} height={22} fill={["#e0a23b", "#4f8a5b", "#c94a3a"][i]} {...O(3)} />)}
              <T3 x={0} y={80} size={34}>SUPPLY SHIP</T3>
            </g>
          )}
          {m === "escorts" && t > 20 && (
            <g transform={`translate(${900 - (t - 20) * 18} -520)`}>
              <path d="M0 0 L 40 -8 L 40 8 Z" fill={RED} {...O(3)} />
              {t > 44 && <g><circle cx={0} cy={0} r={(t - 44) * 4} fill={YEL} opacity={Math.max(0, 1 - (t - 44) / 15)} /><T3 x={0} y={-50} size={44} color={YEL}>BLOCKED</T3></g>}
            </g>
          )}
          {m === "all" && <ellipse cx={0} cy={0} rx={900} ry={560} fill="none" stroke={YEL} strokeWidth={8} strokeDasharray="30 18" opacity={ramp(t, 10, 22)} />}
        </g>
        {m === "all" && (
          <g transform={`translate(1660 960) scale(${pop(t, 24)})`}>
            <rect x={-220} y={-56} width={440} height={112} rx={20} fill="#f4f4f0" {...O(6)} />
            {Array.from({ length: 9 }).map((_, i) => <g key={i} transform={`translate(${-180 + i * 34} 12)`}><circle cy={-26} r={10} fill={INK} /><rect x={-9} y={-14} width={18} height={30} rx={6} fill={INK} /></g>)}
            <text x={150} y={20} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={44} fill={RED}>+</text>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== SECTION 1: the deck and the air wing (top-down)
const SPOTS: [number, number, number][] = [[700, -50, 0], [760, -10, 0], [820, 30, 0], [880, -40, 0], [260, 60, 180], [320, 70, 180], [380, 74, 180], [180, 50, 180], [940, 10, 0], [470, -120, 160]];
const Deck: Tpl = ({ t, p }) => {
  const m = p.mode ?? "jets";
  const sc = 1.65;
  return (
    <AbsoluteFill>
      <Svg>
        <TopSea t={t} />
        <g transform={`translate(${130 - t * 0.3} 560) scale(${sc})`}>
          <CarrierTop num="68" />
          {SPOTS.map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${0.5 * pop(t, 2 + i * 3)})`}>
              {m === "mix" && i % 3 === 1 ? <g><circle r={70} fill="#2a2d33" opacity={0.25} /><path d="M-60 0 H 60 M0 -60 V 60" {...O(6)} /><ellipse rx={50} ry={22} fill={NAVY} {...O(4)} /></g> : <FighterTop folded={i >= 4} />}
            </g>
          ))}
        </g>
        {m === "fighters" && <T3 x={960} y={1000} size={130} color={YEL} s={pop(t, 10)}>40+</T3>}
        {m === "types" && (
          <g>
            <g transform={`translate(420 200) scale(${pop(t, 6)})`}><rect x={-180} y={-50} width={360} height={100} rx={18} fill="#f4f4f0" {...O(6)} /><text x={0} y={18} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={50} fill={INK}>F/A-18E/F</text></g>
            <g transform={`translate(1500 200) scale(${pop(t, 30)})`}><rect x={-140} y={-50} width={280} height={100} rx={18} fill="#f4f4f0" {...O(6)} /><text x={0} y={18} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={50} fill={INK}>F-35C</text></g>
          </g>
        )}
        {m === "mix" && (
          <g>
            {["?", "?", "?"].map((q, i) => <T3 key={i} x={500 + i * 460} y={200 + Math.sin(t * 0.2 + i) * 14} size={120} color={YEL} s={pop(t, 6 + i * 6)}>{q}</T3>)}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== SECTION 1: the specialist aircraft
const Plane: Tpl = ({ t, p }) => {
  const k = p.kind ?? "hawkeye";
  const x = 760 + t * 1.6, y = 470 + Math.sin(t * 0.05) * 14;
  let fx: React.ReactNode = null, art: React.ReactNode;
  if (k === "hawkeye") {
    art = <Hawkeye t={t} />;
    fx = Array.from({ length: 4 }).map((_, i) => { const r = ((t * 6 + i * 120) % 480); return <circle key={i} cx={x + 30 * 2.3} cy={y - 118 * 2.3} r={r + 60} fill="none" stroke="#fff" strokeWidth={6} opacity={Math.max(0, 0.7 - r / 600)} />; });
  } else if (k === "growler") {
    art = <Fighter gear={false} pods flame={0.3} color="#8792a0" />;
    fx = (
      <g>
        <g transform="translate(1640 700)"><path d="M-50 60 L 0 -40 L 50 60 Z" fill="#7a8088" {...O(5)} /><path d="M-60 -60 Q 0 -10 60 -60" fill="none" {...O(8)} />
          {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={-60 + rnd(i + Math.floor(t / 3)) * 120} y1={-120 - rnd(i * 3 + Math.floor(t / 3)) * 60} x2={-60 + rnd(i + 9 + Math.floor(t / 3)) * 120} y2={-120 - rnd(i * 7 + Math.floor(t / 3)) * 60} stroke="#fff" strokeWidth={4} />)}
          <T3 x={0} y={110} size={40}>ENEMY RADAR</T3></g>
        {Array.from({ length: 5 }).map((_, i) => { const r = (t * 8 + i * 90) % 450; return <path key={`w${i}`} d={`M${x + 100 + r} ${y - 20 + r * 0.45} q 30 -20 60 0 t 60 0`} stroke={YEL} strokeWidth={6} fill="none" opacity={0.8} />; })}
      </g>
    );
  } else if (k === "helo") {
    art = <Helo t={t} />;
    fx = (
      <g>
        <line x1={x + 20} y1={y - 10} x2={x + 20} y2={y - 10 + 290 * ramp(t, 4, 30)} stroke={INK} strokeWidth={4} />
        <g transform={`translate(${x + 20} ${760 - 300 * ramp(t, 40, 80) * 0})`}>
          <circle cx={0} cy={0} r={34} fill="#ff8a3a" {...O(5)} /><circle cx={0} cy={-40} r={20} fill="#f3f1ea" {...O(4)} />
          <line x1={-20} y1={-10} x2={-50} y2={-60 + Math.sin(t * 0.4) * 20} {...O(5)} />
        </g>
      </g>
    );
  } else {
    art = <Tiltrotor t={t} />;
    fx = (
      <g>
        {["✉️", "📦", "🧑‍✈️"].map((e, i) => <text key={i} x={x - 400 + i * 240} y={y + 330 + Math.sin(t * 0.2 + i) * 10} fontSize={140} opacity={ramp(t, 8 + i * 8, 14 + i * 8)}>{e}</text>)}
      </g>
    );
  }
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={760} />
        <OpenSea t={t} y={760} />
        {fx}
        <g transform={`translate(${x} ${y}) scale(2.3)`}>{art}</g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== SECTION 2: land runway vs catapult
const Runway: Tpl = ({ t, p, w }) => {
  const m = p.mode ?? "land";
  if (m === "short") {
    return (
      <AbsoluteFill>
        <Svg>
          <TopSea t={t} />
          <g transform="translate(300 600) scale(1.1)">
            <CarrierTop num="68" />
            <g opacity={ramp(t, 6, 18)}>
              <rect x={640} y={-40} width={1400 * ramp(t, 6, 40)} height={70} fill="none" stroke={YEL} strokeWidth={6} strokeDasharray="22 14" />
              <T3 x={760} y={-80} size={52} color={YEL} anchor="start">A NORMAL RUNWAY…</T3>
            </g>
          </g>
          <Actor a="worried" t={t} x={220} y={1060} s={0.55} id="rws" w={w} />
        </Svg>
      </AbsoluteFill>
    );
  }
  const k = ease((t - 4) / 30);
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#cfe5c0" />
        <g transform="translate(60 330)">
          <rect x={0} y={-60} width={1800} height={120} fill="#4a4f56" {...O(6)} />
          {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={30 + i * 60} y={-4} width={34} height={8} fill="#fff" />)}
          <g transform={`translate(${80 + k * 1500} -10) scale(0.5)`}><FighterTop /></g>
          <T3 x={900} y={-90} size={60}>LAND RUNWAY · 1 km +</T3>
        </g>
        {m === "compare" && (
          <g opacity={ramp(t, 2, 10)}>
            <rect x={0} y={560} width={W} height={520} fill={SEA} />
            <g transform="translate(60 800)">
              <rect x={0} y={-50} width={180} height={100} fill={DECK} {...O(6)} />
              <rect x={40} y={-10} width={90} height={20} fill={YEL} {...O(4)} />
              <T3 x={260} y={-80} size={60} color={YEL} anchor="start">CATAPULT ≈ 90 m</T3>
              <path d="M40 60 L 40 90 L 130 90 L 130 60" fill="none" stroke={YEL} strokeWidth={6} />
            </g>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== SECTION 2: the catapult (deck-level side view + cut-away)
const Cat: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "slot";
  const deck = 640;
  const cut = m === "track" || m === "hook" || m === "steam";
  const launchK = m === "launch" ? clamp01((t - 12) / 30) : 0;
  const jx = 760 + launchK * launchK * 2200;
  const fullPower = m === "hold" || m === "jbd" || m === "check" || m === "shooter" || (m === "launch" && t < 12);
  const jbdUp = m === "jbd" ? ease((t - 4) / 16) : m === "hold" || m === "check" || m === "shooter" || m === "launch" ? 1 : 0;
  const shake = fullPower ? Math.sin(t * 2.1) * 2 : 0;
  const tag = p.tag === "1";
  const zc = m === "jbd" ? [380, 560] : [640, 600];
  const z = p.zoom === "1" ? 1 + 0.6 * ease(t / 20) : 1;
  return (
    <AbsoluteFill>
      <Svg>
        <g transform={`translate(${zc[0]} ${zc[1]}) scale(${z}) translate(${-zc[0]} ${-zc[1]})`}>
        <DaySky hz={deck} />
        {/* deck */}
        <rect x={0} y={deck} width={W} height={cut ? 50 : H - deck} fill={DECK} {...O(6)} />
        <line x1={300} y1={deck + 4} x2={1900} y2={deck + 4} stroke="#2a2f35" strokeWidth={8} />
        {cut && (
          <g>
            <rect x={0} y={deck + 50} width={W} height={H - deck - 50} fill="#39424b" />
            {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={i * 200} y1={deck + 50} x2={i * 200} y2={H} stroke="#2e353d" strokeWidth={4} />)}
            {/* the track: two long cylinders */}
            <rect x={200} y={deck + 90} width={1650} height={56} rx={28} fill="#7d8a96" {...O(5)} />
            <rect x={200} y={deck + 170} width={1650} height={56} rx={28} fill="#7d8a96" {...O(5)} />
            {/* shuttle */}
            <g transform={`translate(${m === "steam" ? 994 + ease((t - 20) / 30) * 700 : 994} ${deck})`}>
              <rect x={-60} y={-4} width={120} height={150} rx={10} fill={YEL} {...O(5)} />
              <T3 x={0} y={260} size={42} o={m === "steam" ? 0 : 1}>SHUTTLE</T3>
            </g>
            {m === "steam" && (
              <g>
                <g transform="translate(120 900)"><circle r={70} fill="#ffb03a" {...O(6)} opacity={0.6 + 0.3 * Math.sin(t * 0.3)} /><text x={0} y={14} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={36} fill={INK}>HEAT</text></g>
                <path d="M190 900 Q 220 820 240 760" stroke="#f4f4f0" strokeWidth={18} fill="none" />
                {Array.from({ length: 10 }).map((_, i) => { const k2 = ((t * 2 + i * 15) % 120) / 120; return <circle key={i} cx={240 + k2 * 1500 * ease((t - 20) / 30)} cy={deck + 118 + Math.sin(i) * 20} r={20 + k2 * 20} fill="#f4f4f0" opacity={0.8 - k2 * 0.6} />; })}
                <T3 x={960} y={1020} size={56} color="#fff">STEAM, MADE WITH REACTOR HEAT</T3>
              </g>
            )}
          </g>
        )}
        {/* jet blast deflector */}
        <g transform={`translate(420 ${deck}) rotate(${55 * jbdUp})`}>
          <rect x={-260} y={-14} width={260} height={28} fill="#8e99a4" {...O(5)} />
          {Array.from({ length: 5 }).map((_, i) => <line key={i} x1={-240 + i * 50} y1={-10} x2={-240 + i * 50} y2={10} stroke="#6b747d" strokeWidth={6} />)}
        </g>
        {fullPower && jbdUp > 0.5 && Array.from({ length: 6 }).map((_, i) => { const k2 = ((t * 3 + i * 10) % 40) / 40; return <path key={i} d={`M${540 - k2 * 100} ${deck - 90 + i * 8} q -30 ${-40 - k2 * 120} -10 ${-160 - k2 * 120}`} stroke="#ffb03a" strokeWidth={6} fill="none" opacity={0.7 - k2 * 0.6} />; })}
        {/* the jet (only when it is still on or near the deck) */}
        {jx < 2400 && (
          <g transform={`translate(${jx + shake} ${deck - 6 - launchK * 160}) scale(1.6) rotate(${-launchK * 8})`}>
            <Fighter gear flame={fullPower || launchK > 0 ? 1 : 0} hook={false} />
            {m === "hold" && <line x1={-40} y1={-12} x2={-110} y2={4} stroke={RED} strokeWidth={8} />}
            {(m === "hook" || m === "track") && <line x1={146} y1={-10} x2={146 + 10} y2={4} stroke={YEL} strokeWidth={8} />}
          </g>
        )}
        {m === "hold" && (tag || p.zoom === "1") && <g transform={`translate(560 ${deck - 70}) scale(${pop(t, 10)})`}><rect x={-120} y={-34} width={240} height={68} rx={14} fill={RED} {...O(5)} /><text x={0} y={16} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={42} fill="#fff">HOLDBACK</text></g>}
        {m === "hook" && <circle cx={760 + 146 * 1.6} cy={deck + 30} r={110} fill="none" stroke={YEL} strokeWidth={8} opacity={ramp(t, 8, 16)} />}
        {m === "slot" && <Actor a="point" t={t} x={260} y={deck + 260} s={0.75} id="slot" w={w} />}
        {m === "slot" && <path d={`M450 ${deck - 30} Q 700 ${deck - 120} ${900 + (t % 40) * 20} ${deck - 6}`} stroke={YEL} strokeWidth={8} fill="none" strokeDasharray="20 14" />}
        {m === "jbd" && tag && <g transform={`translate(560 ${deck - 330}) scale(${pop(t, 6)})`}><rect x={-120} y={-40} width={240} height={80} rx={16} fill="#f4f4f0" {...O(6)} /><text x={0} y={18} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={44} fill={INK}>J.B.D.</text><path d="M-60 40 L -140 230" stroke={INK} strokeWidth={6} /></g>}
        {m === "jbd" && <Actor a="worried" t={t} x={250} y={deck} s={0.45} id="jbdg" over={{ pose: { ...POSES.crouch, armL: [95, 100], armR: [95, 100] }, face: { eyes: "wide", brows: "worried", mouth: "teeth" } }} />}
        {m === "check" && [[1180, "green", 0], [1380, "white", 1], [560, "green", 2]].map(([x, c, i]) => (
          <Actor key={String(i)} a="look" t={t + Number(i) * 9} x={Number(x)} y={deck + 260} s={0.5} id={`chk${i}`} outfit="jersey"
            over={{ jersey: JERSEY[String(c)], pose: { ...IDLE, armR: [100, 40] }, handR: "thumb", face: FACES.confident }} />
        ))}
        {m === "shooter" && (
          <Actor a="point" t={t} x={1250} y={deck + 300} s={0.75} id="shoot" outfit="jersey"
            over={{ jersey: JERSEY.yellow, pose: t < 24 ? { ...IDLE, armR: [150, 0], armL: [20, 10] } : { ...POSES.crouch, lean: 20, armR: [100, -10], armL: [40, 20] }, handR: "point", face: FACES.confident }} />
        )}
        {m === "launch" && t > 12 && <g>{Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={760 + i * 120 - (t - 12) * 2} cy={deck - 30 - rnd(i) * 30} r={40 + (t - 12) * 1.5} fill="#f4f4f0" opacity={Math.max(0, 0.8 - (t - 12) / 40)} />)}</g>}
        {m === "launch" && <Actor a="shock" t={Math.max(0, t - 14)} x={300} y={deck + 330} s={0.75} id="lnch" />}
        {m === "speed" && (
          <g>
            <g transform="translate(960 520)">
              <circle r={300} fill="#f4f4f0" {...O(12)} />
              {Array.from({ length: 8 }).map((_, i) => { const a = (-130 + i * (260 / 7)) * Math.PI / 180; return <g key={i}><line x1={Math.sin(a) * 240} y1={-Math.cos(a) * 240} x2={Math.sin(a) * 280} y2={-Math.cos(a) * 280} {...O(8)} /><text x={Math.sin(a) * 200} y={-Math.cos(a) * 200 + 14} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={34} fill={INK}>{i * 40}</text></g>; })}
              {(() => { const v = ease((t - 6) / 60); const a = (-130 + v * 245) * Math.PI / 180; return <g><line x1={0} y1={0} x2={Math.sin(a) * 230} y2={-Math.cos(a) * 230} stroke={RED} strokeWidth={14} strokeLinecap="round" /><circle r={22} fill={INK} /><text x={0} y={130} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={80} fill={INK}>{Math.round(v * 280)} km/h</text><text x={0} y={200} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={50} fill={RED}>{(v * 2).toFixed(1)} s</text></g>; })()}
            </g>
          </g>
        )}
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== SECTION 2: EMALS, the electric catapult
const Emals: Tpl = ({ t, p }) => {
  const s = p.step ?? "1";
  const bg = <rect width={W} height={H} fill="#13233d" />;
  const Rotor: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r={110} fill="#2c4a7a" {...O(6)} />
      <g transform={`rotate(${t * 18 * k})`}>{Array.from({ length: 6 }).map((_, i) => <line key={i} x1={0} y1={0} x2={100 * Math.cos(i * 1.047)} y2={100 * Math.sin(i * 1.047)} stroke="#9fd3ee" strokeWidth={8} />)}</g>
      <circle r={20} fill="#9fd3ee" {...O(4)} />
      <rect x={-90} y={140} width={180} height={26} rx={8} fill="#0b1426" {...O(4)} /><rect x={-86} y={144} width={172 * k} height={18} rx={6} fill="#4dff7a" />
    </g>
  );
  const track = (lit: number) => (
    <g>
      <rect x={200} y={820} width={1600} height={50} rx={10} fill="#0b1426" {...O(5)} />
      {Array.from({ length: 20 }).map((_, i) => <rect key={i} x={210 + i * 79} y={828} width={70} height={34} rx={5} fill={i / 20 < lit ? "#5ab8ff" : "#1f3557"} />)}
      <g transform={`translate(${220 + lit * 1540} 800)`}><rect x={-40} y={0} width={80} height={60} rx={8} fill={YEL} {...O(4)} /></g>
    </g>
  );
  let body: React.ReactNode = null;
  if (s === "1") {
    const lit = clamp01((t % 70) / 40);
    body = (
      <g>
        {track(lit)}
        <g transform={`translate(${220 + lit * 1540} 800) scale(1.1)`}><Fighter gear={false} flame={0.6} /></g>
        {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${300 + i * 260} 880 l 20 30 l -20 10 l 26 34`} stroke="#9fd3ee" strokeWidth={5} fill="none" opacity={Math.abs(Math.sin(t * 0.5 + i))} />)}
        <T3 x={960} y={300} size={70} s={pop(t, 4)}>ELECTROMAGNETIC</T3><T3 x={960} y={400} size={70} s={pop(t, 10)}>AIRCRAFT LAUNCH SYSTEM</T3>
      </g>
    );
  } else if (s === "2") {
    const k = clamp01(t / 50);
    body = <g>{[0, 1, 2, 3].map((i) => <Rotor key={i} x={420 + i * 360} y={480} k={clamp01(k * 1.2 - i * 0.05)} />)}<T3 x={960} y={220} size={64}>ENERGY STORED IN SPINNING ROTORS</T3></g>;
  } else if (s === "4") {
    const lit = clamp01((t - 8) / 50);
    body = (
      <g>
        <path d="M960 0 L 960 800" stroke="#5ab8ff" strokeWidth={14} strokeDasharray="30 16" strokeDashoffset={-t * 6} />
        {track(lit)}
        <g transform={`translate(${220 + lit * 1540} 800) scale(1.1)`}><Fighter gear={false} flame={0.6} /></g>
        <T3 x={960} y={300} size={64} s={pop(t, 4)}>A LONG ELECTRIC MOTOR</T3>
        <T3 x={960} y={400} size={50} color={YEL} s={pop(t, 20)}>PULLS THE SHUTTLE</T3>
      </g>
    );
  } else if (s === "3") {
    const lit = 0;
    body = (
      <g>
        {[0, 1].map((i) => <Rotor key={i} x={240} y={260 + i * 300} k={1 - lit * 0.6} />)}
        <path d="M380 410 H 640" stroke="#5ab8ff" strokeWidth={14} strokeDasharray="30 16" strokeDashoffset={-t * 6} />
        <g transform={`translate(800 410) scale(${pop(t, 8)})`}>
          <rect x={-150} y={-150} width={300} height={300} rx={20} fill="#2c4a7a" {...O(6)} />
          <rect x={-70} y={-70} width={140} height={140} rx={10} fill="#0b1426" {...O(4)} />
          <path d="M-56 0 q 14 -40 28 0 t 28 0 t 28 0 t 28 0" stroke="#4dff7a" strokeWidth={6} fill="none" />
          <T3 x={0} y={210} size={38}>POWER CONVERTERS</T3>
        </g>
        <path d="M960 410 H 1400" stroke="#5ab8ff" strokeWidth={14} fill="none" strokeDasharray="30 16" strokeDashoffset={-t * 6} opacity={ramp(t, 20, 26)} />
        <g opacity={ramp(t, 20, 26)}><circle cx={1520} cy={410} r={90} fill="#5ab8ff" opacity={0.3 + 0.2 * Math.sin(t * 0.6)} /><text x={1520} y={430} textAnchor="middle" fontSize={80}>⚡</text></g>
      </g>
    );
  } else {
    const k = 0.5 + 0.45 * Math.sin(t * 0.08);
    body = (
      <g>
        <g transform="translate(960 560)">
          <path d="M-300 0 A 300 300 0 0 1 300 0" fill="none" stroke="#2c4a7a" strokeWidth={50} />
          <path d={`M-300 0 A 300 300 0 0 1 ${-300 * Math.cos(k * Math.PI)} ${-300 * Math.sin(k * Math.PI)}`} fill="none" stroke="#4dff7a" strokeWidth={50} />
          <line x1={0} y1={0} x2={-260 * Math.cos(k * Math.PI)} y2={-260 * Math.sin(k * Math.PI)} stroke={YEL} strokeWidth={16} strokeLinecap="round" />
          <circle r={30} fill={YEL} {...O(5)} />
        </g>
        <g transform="translate(420 820) scale(1.2)"><path d="M-60 0 L 40 0 L 70 -14 L 40 -28 L -60 -28 L -80 -14 Z" fill="#9aa6b1" {...O(4)} /><path d="M-10 -28 L -40 -60 L -20 -60 L 20 -28" fill="#7d8a96" {...O(4)} /><T3 x={0} y={60} size={40}>LIGHT DRONE</T3></g>
        <g transform="translate(1500 860) scale(1.3)"><Fighter gear={false} pilot={false} /><T3 x={0} y={60} size={40}>HEAVY JET</T3></g>
      </g>
    );
  }
  return <AbsoluteFill><Svg>{bg}{body}</Svg></AbsoluteFill>;
};

// ================================================================== SECTION 2: turning into the wind
const Wind: Tpl = ({ t }) => {
  const k = ease((t - 6) / 40);
  return (
    <AbsoluteFill>
      <Svg>
        <TopSea t={t} />
        {Array.from({ length: 9 }).map((_, i) => { const x = ((W + 300) - ((t * 9 + i * 260) % (W + 400))); return <g key={i} transform={`translate(${x} ${120 + (i % 5) * 200})`}><path d="M0 0 H -120 M-120 0 l 26 -16 M-120 0 l 26 16" stroke="#fff" strokeWidth={8} opacity={0.8} /></g>; })}
        <g transform={`translate(960 560) rotate(${35 * (1 - k)}) scale(0.95) translate(-500 0)`}><CarrierTop num="68" /></g>
        <T3 x={1580} y={140} size={60} color={YEL} o={ramp(t, 4, 12)}>WIND ←</T3>
        <g transform="translate(240 260)">
          <line x1={0} y1={0} x2={0} y2={200} {...O(8)} />
          <path d={`M0 0 Q ${60 * (0.4 + 0.6 * k)} ${40 * (1 - k) + Math.sin(t * 0.6) * 6} ${120 * (0.4 + 0.6 * k)} ${60 * (1 - k)} L ${120 * (0.4 + 0.6 * k)} ${60 * (1 - k) + 60} Q ${60 * (0.4 + 0.6 * k)} ${100 * (1 - k) + 60} 0 60 Z`} fill={RED} {...O(5)} />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES6: Record<string, Tpl> = {
  cockpit: Cockpit, jetside: JetSide, throttle: Throttle, cv: Cv, eiffel: EiffelT, group: Group, deck: Deck, plane: Plane,
  runway: Runway, cat: Cat, emals: Emals, wind: Wind,
};
export { SEA as SEA6, WATER as WATER6 };
