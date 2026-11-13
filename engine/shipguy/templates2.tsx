// The Ship Guy: scene templates for "Every Level of Ship Engine" (video #2). Same rules as templates.tsx:
// every scene is a function of (t, d, p) only. Registered into TEMPLATES at the bottom of templates.tsx.
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { H, INK, Pose, Sea, Sky, Stickman, Tanker, TinyWorker, W, Waterline } from "./art";
import { fontFamily, Push, ramp, Svg } from "./scenes";

type P = Record<string, string>;
type Tpl = React.FC<{ t: number; d: number; p: P }>;
const txt = (s?: string) => (s ?? "").replace(/_/g, " ");
const ink = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const BG = { navy: "#1f3a5f", teal: "#1f7a78", red: "#a83a33", shop: "#2b3440" };

const T: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; color?: string; anchor?: "start" | "middle" | "end"; o?: number }> = ({ x, y, size, children, color = "#fff", anchor = "middle", o = 1 }) => (
  <text x={x} y={y} fontFamily={fontFamily} fontWeight={700} fontSize={size} fill={color} textAnchor={anchor}
    stroke={INK} strokeWidth={size * 0.14} paintOrder="stroke" strokeLinejoin="round" opacity={o}>{children}</text>
);
const Rays: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(${W / 2} ${H / 2}) rotate(${t * 0.15})`} opacity={0.12}>
    {Array.from({ length: 16 }).map((_, i) => <path key={i} d="M0 0 L1400 -140 L1400 140 Z" fill="#fff" transform={`rotate(${i * 22.5})`} />)}
  </g>
);
const Stamp: React.FC<{ text: string; p: number }> = ({ text, p }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", opacity: p, transform: `rotate(-8deg) scale(${2 - p})` }}>
    <span style={{ fontFamily, fontWeight: 700, fontSize: 120, color: "#e8352b", border: "12px solid #e8352b", padding: "6px 36px", borderRadius: 24, background: "rgba(255,255,255,0.88)" }}>{text}</span>
  </div>
);

// ================================================================== drawn parts
/** Piston + rod, top-centre at (0,0), `h` px tall overall. */
export const PistonArt: React.FC<{ h: number }> = ({ h }) => {
  const w = h * 0.3, crown = h * 0.32;
  return (
    <g>
      <rect x={-w * 0.12} y={crown - 10} width={w * 0.24} height={h - crown - w * 0.18} fill="#9aa3ab" {...ink} />
      <rect x={-w / 2} y={0} width={w} height={crown} rx={14} fill="#c3ccd3" {...ink} />
      {[0.12, 0.2, 0.28].map((k) => <line key={k} x1={-w / 2} y1={crown * k * 2.2} x2={w / 2} y2={crown * k * 2.2} stroke={INK} strokeWidth={5} />)}
      <rect x={-w / 2} y={0} width={w * 0.18} height={crown} fill="#fff" opacity={0.25} />
      <circle cx={0} cy={h - w * 0.18} r={w * 0.26} fill="#8d969e" {...ink} />
      <circle cx={0} cy={h - w * 0.18} r={w * 0.1} fill="#5b636b" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** Crankshaft side view, centred at (0,0), `len` px long; throws rotate with angle `a` (radians). */
const CrankArt: React.FC<{ len: number; a: number; n?: number }> = ({ len, a, n = 7 }) => {
  const seg = len / n, r = seg * 0.55;
  const parts = [];
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + seg * (i + 0.5);
    const y = Math.cos(a + (i * 2 * Math.PI) / n) * r;
    parts.push(
      <g key={i}>
        <rect x={x - seg * 0.42} y={-r * 0.3} width={seg * 0.14} height={r * 0.6} fill="#7d868e" stroke={INK} strokeWidth={4} />
        <rect x={x + seg * 0.28} y={-r * 0.3} width={seg * 0.14} height={r * 0.6} fill="#7d868e" stroke={INK} strokeWidth={4} />
        <path d={`M${x - seg * 0.36} 0 L${x - seg * 0.36} ${y} M${x + seg * 0.36} 0 L${x + seg * 0.36} ${y}`} stroke="#5b636b" strokeWidth={seg * 0.24} strokeLinecap="round" />
        <path d={`M${x - seg * 0.36} 0 L${x - seg * 0.36} ${y} M${x + seg * 0.36} 0 L${x + seg * 0.36} ${y}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.6} />
        <rect x={x - seg * 0.36} y={y - r * 0.22} width={seg * 0.72} height={r * 0.44} rx={8} fill="#b8c1c8" stroke={INK} strokeWidth={4} />
      </g>,
    );
  }
  return (
    <g>
      <rect x={-len / 2 - 40} y={-r * 0.22} width={len + 80} height={r * 0.44} fill="#a6afb7" stroke={INK} strokeWidth={5} />
      {parts}
      <circle cx={len / 2 + 70} cy={0} r={r * 1.4} fill="#6c757d" {...ink} />
      <line x1={len / 2 + 70} y1={0} x2={len / 2 + 70 + Math.cos(a) * r * 1.2} y2={Math.sin(a) * r * 1.2} stroke="#ffd23f" strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};

/** The RT-flex96C, side view, bottom-left at (0,0), `w` px long (height = w * 0.508). */
export const BigEngine: React.FC<{ w: number; t: number; glow?: boolean }> = ({ w, t, glow }) => {
  const h = w * 0.508;
  const cyl = 14, cw = (w * 0.92) / cyl, x0 = w * 0.04;
  return (
    <g>
      {/* bedplate + frame */}
      <rect x={0} y={-h * 0.18} width={w} height={h * 0.18} fill="#4b545c" {...ink} />
      <rect x={w * 0.02} y={-h * 0.55} width={w * 0.96} height={h * 0.37} fill="#9fb3a6" {...ink} />
      {Array.from({ length: cyl + 1 }).map((_, i) => <rect key={i} x={x0 + i * cw - 8} y={-h * 0.55} width={16} height={h * 0.37} fill="#7f948a" />)}
      {/* cylinder block */}
      <rect x={w * 0.03} y={-h * 0.82} width={w * 0.94} height={h * 0.27} fill="#b9c9be" {...ink} />
      {Array.from({ length: cyl }).map((_, i) => {
        const bob = Math.sin(t * 0.35 + i * 1.7) * 3;
        return (
          <g key={i}>
            <rect x={x0 + i * cw + cw * 0.12} y={-h * 0.92 + bob} width={cw * 0.76} height={h * 0.1} rx={8} fill={glow ? "#ffb347" : "#d6dfd9"} stroke={INK} strokeWidth={4} />
            <circle cx={x0 + i * cw + cw / 2} cy={-h * 0.68} r={cw * 0.14} fill="#6d7f74" stroke={INK} strokeWidth={3} />
          </g>
        );
      })}
      {/* exhaust receiver + turbochargers */}
      <rect x={w * 0.03} y={-h * 1.0} width={w * 0.94} height={h * 0.07} rx={20} fill="#c98b4a" {...ink} />
      {[0.22, 0.5, 0.78].map((k) => (
        <g key={k} transform={`translate(${w * k} ${-h * 1.0})`}>
          <path d={`M${-w * 0.045} 0 Q${-w * 0.05} ${-h * 0.12} 0 ${-h * 0.13} Q${w * 0.055} ${-h * 0.12} ${w * 0.045} 0 Z`} fill="#c98b4a" {...ink} />
          <circle cx={0} cy={-h * 0.065} r={w * 0.016} fill="#6c4a2a" transform={`rotate(${t * 20})`} />
        </g>
      ))}
      {/* walkways */}
      {[0.35, 0.6].map((k) => <line key={k} x1={0} y1={-h * k} x2={w} y2={-h * k} stroke="#ffd23f" strokeWidth={6} strokeDasharray="20 10" opacity={0.8} />)}
    </g>
  );
};

/** Plain 4-storey building, bottom-left at (0,0). */
export const Building: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <g>
    {Array.from({ length: 4 }).map((_, i) => (
      <g key={i}>
        <rect x={0} y={-(i + 1) * (h / 4)} width={w} height={h / 4} fill={i % 2 ? "#e0c79a" : "#edd8ae"} stroke={INK} strokeWidth={5} />
        {[0.15, 0.45, 0.75].map((k) => <rect key={k} x={w * k} y={-(i + 1) * (h / 4) + h * 0.05} width={w * 0.14} height={h * 0.12} fill="#3b6ea5" />)}
      </g>
    ))}
  </g>
);

/** Small boat side view, waterline at (0,0), bow right, `s` scale; outboard(s) at the stern (left). */
export const Boat: React.FC<{ s?: number; motor?: number }> = ({ s = 1, motor = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M0 -70 L420 -70 Q470 -70 500 -110 L470 -20 Q450 20 380 20 L30 20 Q0 20 0 -10 Z" fill="#f4f1e8" {...ink} />
    <path d="M0 -10 L470 -10" stroke="#3b8fd9" strokeWidth={14} />
    <rect x={180} y={-130} width={110} height={60} rx={8} fill="#9fd3ff" opacity={0.7} {...ink} strokeWidth={4} />
    <g transform="translate(-10 -80)">
      <rect x={-50 * motor} y={0} width={60 * motor} height={70 * motor} rx={16} fill="#1f1f24" {...ink} strokeWidth={5} />
      <rect x={-30 * motor} y={70 * motor} width={20 * motor} height={90 * motor} fill="#2b2b30" stroke={INK} strokeWidth={4} />
      <ellipse cx={-20 * motor} cy={170 * motor} rx={12 * motor} ry={26 * motor} fill="#9aa3ab" stroke={INK} strokeWidth={4} />
    </g>
  </g>
);

/** Harbour tug, side view, waterline at (0,0), bow right. */
export const TugArt: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M0 -60 L330 -60 Q380 -60 400 -20 L380 40 L30 40 Q0 40 0 0 Z" fill="#d94a3a" {...ink} />
    <rect x={0} y={-60} width={400} height={20} fill="#2b2b30" />
    <path d="M395 -55 q 20 40 0 80" fill="none" stroke="#2b2b30" strokeWidth={22} />
    <rect x={150} y={-150} width={150} height={90} fill="#f4f1e8" {...ink} />
    <rect x={170} y={-190} width={110} height={40} fill="#f4f1e8" {...ink} />
    {[180, 220, 255].map((x) => <rect key={x} x={x} y={-182} width={22} height={22} fill="#3b6ea5" />)}
    <rect x={95} y={-150} width={34} height={90} fill="#e0a12a" {...ink} strokeWidth={5} />
  </g>
);

/** Car (side), bottom-left at (0,0), `s` scale (~90 px long). */
export const Car: React.FC<{ s?: number; c?: string }> = ({ s = 1, c = "#3b8fd9" }) => (
  <g transform={`scale(${s})`}>
    <path d="M0 -14 L10 -30 L28 -40 L62 -40 L78 -28 L92 -24 L92 -6 L0 -6 Z" fill={c} stroke={INK} strokeWidth={3} />
    <circle cx={22} cy={-6} r={8} fill={INK} /><circle cx={72} cy={-6} r={8} fill={INK} />
  </g>
);

/** Ferry side view, waterline at (0,0), `w` long. */
const FerryArt: React.FC<{ w: number }> = ({ w }) => (
  <g>
    <path d={`M0 -${w * 0.09} L${w * 0.93} -${w * 0.09} Q${w} -${w * 0.09} ${w * 1.02} -${w * 0.14} L${w * 0.97} ${w * 0.05} L${w * 0.04} ${w * 0.05} Q0 ${w * 0.05} 0 0 Z`} fill="#f4f1e8" {...ink} />
    <rect x={0} y={-w * 0.03} width={w * 0.99} height={w * 0.025} fill="#2f6fb0" />
    <rect x={w * 0.12} y={-w * 0.2} width={w * 0.72} height={w * 0.11} fill="#f4f1e8" {...ink} />
    <rect x={w * 0.22} y={-w * 0.27} width={w * 0.45} height={w * 0.07} fill="#f4f1e8" {...ink} />
    {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={w * (0.15 + i * 0.042)} y={-w * 0.17} width={w * 0.025} height={w * 0.03} fill="#3b6ea5" />)}
    <rect x={w * 0.3} y={-w * 0.34} width={w * 0.06} height={w * 0.07} fill="#e8352b" {...ink} strokeWidth={5} />
  </g>
);

/** Destroyer side view, waterline at (0,0), `w` long. */
const DestroyerArt: React.FC<{ w: number }> = ({ w }) => (
  <g>
    <path d={`M0 -${w * 0.05} L${w * 0.8} -${w * 0.06} L${w} -${w * 0.09} L${w * 0.93} ${w * 0.035} L${w * 0.03} ${w * 0.035} Z`} fill="#8e99a4" {...ink} />
    <path d={`M${w * 0.28} -${w * 0.055} L${w * 0.3} -${w * 0.13} L${w * 0.55} -${w * 0.13} L${w * 0.58} -${w * 0.058} Z`} fill="#a3adb7" {...ink} />
    <path d={`M${w * 0.4} -${w * 0.13} L${w * 0.42} -${w * 0.19} L${w * 0.53} -${w * 0.19} L${w * 0.55} -${w * 0.13} Z`} fill="#a3adb7" {...ink} />
    <line x1={w * 0.47} y1={-w * 0.19} x2={w * 0.47} y2={-w * 0.3} stroke={INK} strokeWidth={6} />
    <line x1={w * 0.43} y1={-w * 0.26} x2={w * 0.51} y2={-w * 0.26} stroke={INK} strokeWidth={5} />
    <rect x={w * 0.2} y={-w * 0.1} width={w * 0.05} height={w * 0.045} fill="#7d8790" {...ink} strokeWidth={4} />
    <g transform={`translate(${w * 0.76} -${w * 0.07})`}><rect x={-20} y={-18} width={40} height={18} fill="#7d8790" stroke={INK} strokeWidth={4} /><line x1={20} y1={-10} x2={70} y2={-16} stroke={INK} strokeWidth={6} /></g>
    <text x={w * 0.85} y={-w * 0.015} fontFamily={fontFamily} fontWeight={700} fontSize={w * 0.035} fill="#fff">71</text>
  </g>
);

/** Cruise ship, waterline at (0,0), `w` long. */
export const CruiseArt: React.FC<{ w: number }> = ({ w }) => (
  <g>
    <path d={`M0 -${w * 0.07} L${w * 0.95} -${w * 0.07} Q${w * 1.01} -${w * 0.08} ${w * 1.02} -${w * 0.12} L${w * 0.96} ${w * 0.06} L${w * 0.03} ${w * 0.06} Q0 ${w * 0.06} 0 0 Z`} fill="#1f3a5f" {...ink} />
    {Array.from({ length: 6 }).map((_, k) => (
      <g key={k}>
        <rect x={w * (0.03 + k * 0.012)} y={-w * (0.07 + (k + 1) * 0.035)} width={w * (0.92 - k * 0.03)} height={w * 0.035} fill="#f4f1e8" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 30 - k * 2 }).map((_, i) => <rect key={i} x={w * (0.05 + k * 0.012 + i * 0.029)} y={-w * (0.07 + (k + 1) * 0.035) + w * 0.01} width={w * 0.016} height={w * 0.014} fill="#3b6ea5" />)}
      </g>
    ))}
    <rect x={w * 0.22} y={-w * 0.36} width={w * 0.07} height={w * 0.08} fill="#e8352b" {...ink} strokeWidth={5} />
    <path d={`M${w * 0.6} -${w * 0.28} q ${w * 0.05} -${w * 0.08} ${w * 0.1} 0 q ${w * 0.04} ${w * 0.06} ${w * 0.08} 0`} fill="none" stroke="#ffd23f" strokeWidth={14} />
    <path d={`M${w * 0.62} -${w * 0.28} q ${w * 0.06} -${w * 0.1} ${w * 0.12} -${w * 0.02}`} fill="none" stroke="#4fb06a" strokeWidth={12} />
  </g>
);

/** Aircraft carrier, waterline at (0,0), `w` long, bow right. */
export const CarrierArt: React.FC<{ w: number }> = ({ w }) => (
  <g>
    <path d={`M0 -${w * 0.045} L${w} -${w * 0.06} L${w * 0.95} ${w * 0.035} L${w * 0.03} ${w * 0.035} Z`} fill="#7f8a95" {...ink} />
    <rect x={-w * 0.02} y={-w * 0.075} width={w * 1.04} height={w * 0.022} fill="#5f6a74" {...ink} strokeWidth={5} />
    <line x1={w * 0.05} y1={-w * 0.064} x2={w * 0.95} y2={-w * 0.064} stroke="#fff" strokeWidth={3} strokeDasharray="30 20" />
    <rect x={w * 0.62} y={-w * 0.16} width={w * 0.07} height={w * 0.085} fill="#8e99a4" {...ink} />
    <line x1={w * 0.655} y1={-w * 0.16} x2={w * 0.655} y2={-w * 0.22} stroke={INK} strokeWidth={6} />
    {[0.15, 0.3, 0.42, 0.8].map((k) => (
      <path key={k} d={`M${w * k} -${w * 0.08} l ${w * 0.04} 0 l -${w * 0.012} -${w * 0.012} l -${w * 0.016} 0 Z`} fill="#b9c3cc" stroke={INK} strokeWidth={3} />
    ))}
    <text x={w * 0.1} y={-w * 0.01} fontFamily={fontFamily} fontWeight={700} fontSize={w * 0.03} fill="#fff">68</text>
  </g>
);

/** Container ship (Emma Maersk-like), waterline at (0,0), `w` long, bow right. */
export const BoxShip: React.FC<{ w: number; name?: string }> = ({ w, name = "EMMA MÆRSK" }) => {
  const cols = ["#e8352b", "#3b8fd9", "#4fb06a", "#e0a12a", "#8e44ad", "#f4f1e8"];
  return (
    <g>
      <path d={`M0 -${w * 0.06} L${w * 0.95} -${w * 0.06} Q${w * 1.01} -${w * 0.06} ${w * 1.02} -${w * 0.1} L${w * 0.97} ${w * 0.04} L${w * 0.04} ${w * 0.04} Q0 ${w * 0.04} 0 0 Z`} fill="#2f6fb0" {...ink} />
      <rect x={0} y={w * 0.012} width={w * 0.98} height={w * 0.028} fill="#b8322a" />
      {Array.from({ length: 22 }).map((_, i) => {
        if (i === 15) return null;
        return Array.from({ length: 5 }).map((_, k) => (
          <rect key={`${i}-${k}`} x={w * (0.05 + i * 0.041)} y={-w * (0.06 + (k + 1) * 0.022)} width={w * 0.039} height={w * 0.021} fill={cols[(i * 7 + k * 3) % 6]} stroke={INK} strokeWidth={2} />
        ));
      })}
      <rect x={w * 0.66} y={-w * 0.2} width={w * 0.04} height={w * 0.14} fill="#f4f1e8" {...ink} strokeWidth={4} />
      <rect x={w * 0.62} y={-w * 0.215} width={w * 0.12} height={w * 0.02} fill="#f4f1e8" {...ink} strokeWidth={4} />
      <text x={w * 0.5} y={-w * 0.015} fontFamily={fontFamily} fontWeight={700} fontSize={w * 0.025} fill="#fff" textAnchor="middle">{name}</text>
    </g>
  );
};

export const Prop: React.FC<{ r: number; a: number }> = ({ r, a }) => (
  <g transform={`rotate(${a})`}>
    {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={0} cy={-r * 0.55} rx={r * 0.3} ry={r * 0.55} fill="#d9a441" {...ink} strokeWidth={5} transform={`rotate(${i * 72})`} />)}
    <circle r={r * 0.2} fill="#c8902e" {...ink} strokeWidth={5} />
  </g>
);

// ================================================================== templates
const Piston: Tpl = ({ t, p }) => {
  const tall = p.tall === "1";
  const ph = 760, drop = interpolate(ramp(t, 0, 14), [0, 1], [-900, 0]);
  const man = (1.75 / 6) * ph;
  return (
    <AbsoluteFill style={{ background: BG.shop }}>
      <Svg>
        <Rays t={t} />
        <rect x={0} y={960} width={W} height={120} fill="#5b636b" />
        <line x1={0} y1={960} x2={W} y2={960} stroke={INK} strokeWidth={6} />
        <g transform={`translate(860 ${200 + drop})`}><PistonArt h={ph} /></g>
        {tall && (
          <g opacity={ramp(t, 10, 20)}>
            <line x1={1100} y1={200} x2={1100} y2={960} stroke="#ffd23f" strokeWidth={8} />
            <line x1={1080} y1={200} x2={1120} y2={200} stroke="#ffd23f" strokeWidth={8} />
            <T x={1240} y={600} size={90} color="#ffd23f">6 m</T>
          </g>
        )}
      </Svg>
      <Stickman pose={tall ? "shocked" : "shocked-2"} x={480} y={965} height={man * 1.15} />
    </AbsoluteFill>
  );
};

const Crank: Tpl = ({ t, p }) => {
  const cars = p.cars === "1";
  const a = t * 0.06;
  return (
    <AbsoluteFill style={{ background: BG.shop }}>
      <Svg>
        <Rays t={t} />
        <g transform={`translate(900 ${cars ? 330 : 520}) scale(${cars ? 0.8 : 1})`}><CrankArt len={1400} a={a} /></g>
        {cars && Array.from({ length: 200 }).map((_, i) => {
          const show = ramp(t, 10 + (i / 200) * 40, 12 + (i / 200) * 40);
          return <g key={i} opacity={show} transform={`translate(${130 + (i % 20) * 84} ${640 + Math.floor(i / 20) * 42})`}><Car s={0.8} c={["#e8352b", "#3b8fd9", "#4fb06a", "#e0a12a", "#f4f1e8"][i % 5]} /></g>;
        })}
      </Svg>
      {!cars && <Stickman pose="scared" x={140} y={1050} height={260} />}
    </AbsoluteFill>
  );
};

const EngineT: Tpl = ({ t, p }) => {
  if (p.cut === "1") {
    // one cylinder cut open, the stick figure standing inside (scale 250 px/m)
    const m = 210, cw = 0.96 * m, ch = 3.6 * m;
    const pist = Math.sin(t * 0.05) * 30;
    return (
      <AbsoluteFill style={{ background: BG.shop }}>
        <Svg>
          <Rays t={t} />
          <rect x={960 - cw / 2 - 40} y={220} width={cw + 80} height={ch} fill="#9fb3a6" {...ink} />
          <rect x={960 - cw / 2} y={220} width={cw} height={ch} fill="#e9eef1" stroke={INK} strokeWidth={6} />
          <rect x={960 - cw / 2} y={220 + ch - 70 + pist} width={cw} height={70} fill="#c3ccd3" {...ink} />
          <line x1={960 - cw / 2} y1={200} x2={960 + cw / 2} y2={200} stroke="#ffd23f" strokeWidth={8} />
          <T x={960} y={185} size={56} color="#ffd23f">96 cm</T>
          <line x1={1300} y1={220} x2={1300} y2={220 + 2.5 * m} stroke="#ffd23f" strokeWidth={8} />
          <T x={1430} y={220 + 1.25 * m + 20} size={60} color="#ffd23f">2.5 m</T>
          <T x={1430} y={220 + 1.25 * m + 80} size={36}>stroke</T>
        </Svg>
        <Stickman pose="thinking" x={960 - 0.4 * 1.75 * m * 0.45} y={220 + ch - 74 + pist} height={1.75 * m * 0.95} />
      </AbsoluteFill>
    );
  }
  const vs = p.vs === "building";
  const ew = vs ? 1300 : 1640;
  const pxm = ew / 26.6;
  const x0 = vs ? 120 : 140, ground = 1000;
  return (
    <Push t={t} from={1.02} to={1.06} ox="50% 80%">
      <AbsoluteFill style={{ background: BG.shop }}>
        <Svg>
          <Rays t={t} />
          <rect x={0} y={ground} width={W} height={H - ground} fill="#5b636b" />
          <g transform={`translate(${x0} ${ground})`}><BigEngine w={ew} t={t} /></g>
          {vs && <g transform={`translate(${x0 + ew + 120} ${ground})`} opacity={ramp(t, 4, 14)}><Building w={6 * pxm} h={12 * pxm} /></g>}
          {p.dims === "1" && (
            <g opacity={ramp(t, 6, 16)}>
              <line x1={x0 - 50} y1={ground} x2={x0 - 50} y2={ground - 13.5 * pxm} stroke="#ffd23f" strokeWidth={8} />
              <T x={x0 - 40} y={ground - 13.5 * pxm - 20} size={54} color="#ffd23f" anchor="start">13.5 m</T>
              <line x1={x0} y1={ground + 40} x2={x0 + ew} y2={ground + 40} stroke="#ffd23f" strokeWidth={8} />
              <T x={x0 + ew / 2} y={ground + 70} size={44} color="#ffd23f">26.6 m</T>
            </g>
          )}
          <TinyWorker x={x0 + ew * 0.3} y={ground - 2} s={1.75 * pxm / 40} />
        </Svg>
        <Stickman pose="shocked-2" x={x0 + ew * 0.55} y={ground + 4} height={1.75 * pxm} />
      </AbsoluteFill>
    </Push>
  );
};

const Rpm: Tpl = ({ t, p }) => {
  const big = p.big === "1";
  const a = (t / 30) * (100 / 60) * 360; // ~100 rpm, true speed
  const dial = (cx: number, val: number, max: number, label: string, sub: string, o = 1) => {
    const ang = Math.PI + (Math.min(val, max) / max) * Math.PI;
    return (
      <g opacity={o}>
        <path d={`M${cx - 260} 640 A 260 260 0 0 1 ${cx + 260} 640`} fill="#f4f1e8" {...ink} strokeWidth={8} />
        {Array.from({ length: 11 }).map((_, i) => {
          const q = Math.PI + (i / 10) * Math.PI;
          return <line key={i} x1={cx + Math.cos(q) * 220} y1={640 + Math.sin(q) * 220} x2={cx + Math.cos(q) * 250} y2={640 + Math.sin(q) * 250} stroke={INK} strokeWidth={6} />;
        })}
        <line x1={cx} y1={640} x2={cx + Math.cos(ang) * 210} y2={640 + Math.sin(ang) * 210} stroke="#e8352b" strokeWidth={14} strokeLinecap="round" />
        <circle cx={cx} cy={640} r={22} fill={INK} />
        <T x={cx} y={760} size={64} color="#ffd23f">{label}</T>
        <T x={cx} y={830} size={42}>{sub}</T>
      </g>
    );
  };
  if (big) {
    return (
      <AbsoluteFill style={{ background: BG.navy }}>
        <Svg>
          <Rays t={t} />
          <g transform="translate(700 540)"><Prop r={380} a={a} /></g>
          {dial(1480, 100 * ramp(t, 0, 20), 1000, "~100 rpm", "full power")}
        </Svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: BG.navy }}>
      <Svg>
        <Rays t={t} />
        {dial(520, 100 * ramp(t, 4, 24), 1000, "~100 rpm", "this engine, full power")}
        {dial(1400, 800 * ramp(t, 30, 50), 1000, "~800 rpm", "your car, at a red light", ramp(t, 26, 34))}
      </Svg>
    </AbsoluteFill>
  );
};

const LEVELS = ["OUTBOARD", "TUGBOAT", "4-STROKE", "JET ENGINE", "CRUISE SHIP", "NUCLEAR", "THE MONSTER"];
const Ladder: Tpl = ({ t, p }) => {
  const hi = Number(p.hi ?? 0);
  const mystery = p.mystery === "1";
  return (
    <AbsoluteFill style={{ background: BG.navy }}>
      <Svg>
        <Rays t={t} />
        {LEVELS.map((name, i) => {
          const x = 300 + i * 222, y = 940 - i * 105, a = ramp(t, i * 4, i * 4 + 8);
          const lit = hi === 8 || hi === i + 1;
          const hidden = (i === 6 && hi < 7) || (i === 5 && mystery);
          return (
            <g key={i} opacity={a}>
              <rect x={x} y={y} width={215} height={1080 - y} fill={lit ? "#ffd23f" : "#3d5a80"} stroke={INK} strokeWidth={6} />
              <T x={x + 108} y={y + 70} size={60} color={lit ? INK : "#fff"}>{i + 1}</T>
              <T x={x + 108} y={y - 24} size={34} color={lit ? "#ffd23f" : "#fff"}>{hidden ? "???" : name}</T>
            </g>
          );
        })}
      </Svg>
      <Stickman pose={hi === 8 ? "satisfied" : "explain"} x={20} y={1060} height={420} />
    </AbsoluteFill>
  );
};

const Outboard: Tpl = ({ t, p }) => {
  const n = Number(p.n ?? 1);
  if (n > 1) {
    // rear view of a fast boat's stern with n motors
    return (
      <Push t={t} from={1} to={1.05}>
        <Svg>
          <Sky mood="day" horizon={620} />
          <Sea mood="day" horizon={620} t={t * 3} />
          <path d="M360 520 L1560 520 L1500 760 L420 760 Z" fill="#f4f1e8" {...ink} />
          <rect x={360} y={520} width={1200} height={40} fill="#2f6fb0" />
          {Array.from({ length: n }).map((_, i) => {
            const x = 600 + i * 240;
            return (
              <g key={i} opacity={ramp(t, i * 6, i * 6 + 8)}>
                <rect x={x - 80} y={420} width={160} height={210} rx={30} fill="#1f1f24" {...ink} />
                <text x={x} y={520} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={34} fill="#ccc">V12</text>
                <rect x={x - 25} y={630} width={50} height={230} fill="#2b2b30" stroke={INK} strokeWidth={5} />
              </g>
            );
          })}
          {Array.from({ length: 18 }).map((_, i) => (
            <circle key={i} cx={560 + (i % 9) * 110 + Math.sin(t + i) * 10} cy={900 + Math.floor(i / 9) * 60 + Math.cos(t * 0.5 + i) * 8} r={30} fill="#fff" opacity={0.7} />
          ))}
        </Svg>
      </Push>
    );
  }
  const small = p.small === "1";
  return (
    <Push t={t} from={1} to={1.05}>
      <Svg>
        <Sky mood="day" horizon={600} />
        <Sea mood="day" horizon={600} t={t} />
        <g transform={`translate(${520 + t * 0.6} ${700 + Math.sin(t * 0.1) * 4}) scale(1.6)`}><Boat motor={small ? 0.7 : 1.2} /></g>
        <Waterline x={420 + t * 0.6} y={700 + 18} width={850} mood="day" t={t} horizon={600} />
      </Svg>
      {p.pose && <Stickman pose={p.pose as Pose} x={1450} y={1100} height={430} />}
    </Push>
  );
};

const Tug: Tpl = ({ t, p }) => {
  if (p.view === "top") {
    const a = Math.sin(t * 0.05) * 140;
    const drift = interpolate(t, [0, 200], [0, 160], { extrapolateRight: "clamp" });
    return (
      <AbsoluteFill style={{ background: "#2f86c9" }}>
        <Svg>
          <g transform={`translate(${760 + drift} 540)`}>
            <path d="M-300 -120 L200 -120 Q330 -120 360 0 Q330 120 200 120 L-300 120 Q-340 120 -340 0 Q-340 -120 -300 -120 Z" fill="#d94a3a" {...ink} />
            <rect x={-120} y={-70} width={200} height={140} rx={16} fill="#f4f1e8" {...ink} />
            {[-60, 60].map((y) => (
              <g key={y} transform={`translate(-250 ${y})`}>
                <circle r={46} fill="#3d5a80" {...ink} strokeWidth={5} />
                <g transform={`rotate(${a + y})`}><rect x={-14} y={-60} width={28} height={70} rx={10} fill="#ffd23f" stroke={INK} strokeWidth={4} /></g>
              </g>
            ))}
          </g>
          <circle cx={510 + drift} cy={540} r={190} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="16 12" opacity={0.8} />
          {[0, 90, 180, 270].map((r) => (
            <g key={r} transform={`translate(${760 + drift} 540) rotate(${r}) translate(520 0)`} opacity={0.85}>
              <path d="M-40 -26 L20 -26 L20 -50 L70 0 L20 50 L20 26 L-40 26 Z" fill="#ffd23f" stroke={INK} strokeWidth={5} />
            </g>
          ))}
        </Svg>
      </AbsoluteFill>
    );
  }
  const push = Math.sin(t * 0.08) * 4;
  if (p.alone === "1") {
    return (
      <Push t={t} from={1} to={1.06}>
        <Svg>
          <Sky mood="day" horizon={600} />
          <Sea mood="day" horizon={600} t={t} />
          <g transform={`translate(${420 + t * 0.8} 800)`}><TugArt s={2.6} /></g>
          <Waterline x={380 + t * 0.8} y={820} width={1100} mood="day" t={t} horizon={600} />
        </Svg>
      </Push>
    );
  }
  return (
    <Push t={t} from={1} to={1.05}>
      <Svg>
        <Sky mood="day" horizon={560} />
        <Sea mood="day" horizon={560} t={t} />
        <g transform="translate(-1500 610) scale(2.2)"><Tanker /></g>
        <Waterline x={-1500} y={610 + 158} width={2240} mood="day" t={t} horizon={560} />
        <g transform={`translate(${1380 + push} 800) scale(-1 1)`}><TugArt s={1.6} /></g>
        <Waterline x={1100} y={812} width={780} mood="day" t={t} horizon={560} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${1420 + i * 30} ${740 - i * 30} l 60 0`} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.8 - i * 0.2} />)}
      </Svg>
    </Push>
  );
};

const RopeCars: Tpl = ({ t }) => {
  const pull = interpolate(t, [0, 200], [0, -120], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Svg>
        <Sky mood="day" horizon={560} />
        <rect x={0} y={560} width={760} height={520} fill="#2f86c9" />
        <rect x={760} y={560} width={1160} height={520} fill="#9a9a94" />
        <line x1={760} y1={560} x2={760} y2={1080} stroke={INK} strokeWidth={6} />
        <g transform={`translate(${560 + pull * 0.3} 820) scale(-1.2 1.2)`}><TugArt /></g>
        <line x1={560 + pull * 0.3} y1={760} x2={860 + pull} y2={780} stroke={INK} strokeWidth={8} />
        {Array.from({ length: 40 }).map((_, i) => (
          <g key={i} opacity={ramp(t, 6 + i * 0.6, 8 + i * 0.6)} transform={`translate(${860 + pull + (i % 10) * 104} ${700 + Math.floor(i / 10) * 90})`}>
            <Car s={1.05} c={["#e8352b", "#3b8fd9", "#4fb06a", "#e0a12a", "#f4f1e8"][i % 5]} />
          </g>
        ))}
        <T x={1380} y={1060} size={56} color="#ffd23f">= 40 CARS</T>
      </Svg>
    </AbsoluteFill>
  );
};

const Ferry: Tpl = ({ t, p }) => {
  const cut = p.cut === "1";
  if (cut) {
    return (
      <AbsoluteFill style={{ background: BG.shop }}>
        <Svg>
          <Rays t={t} />
          <rect x={260} y={420} width={1400} height={360} rx={20} fill="#9fb3a6" {...ink} />
          {Array.from({ length: 6 }).map((_, i) => {
            const y = Math.sin(t * 0.4 + i * 2.1) * 40;
            return (
              <g key={i}>
                <rect x={320 + i * 220} y={300} width={150} height={260} fill="#e9eef1" {...ink} strokeWidth={5} />
                <rect x={320 + i * 220} y={400 + y} width={150} height={70} fill="#c3ccd3" stroke={INK} strokeWidth={5} />
                <line x1={395 + i * 220} y1={470 + y} x2={395 + i * 220} y2={700} stroke="#5b636b" strokeWidth={22} />
              </g>
            );
          })}
          {/* washing machine for scale */}
          <g transform="translate(1700 780)" opacity={ramp(t, 10, 20)}>
            <rect x={-80} y={-170} width={160} height={170} rx={12} fill="#f4f1e8" {...ink} />
            <circle cx={0} cy={-80} r={50} fill="#9fd3ff" stroke={INK} strokeWidth={6} />
            <circle cx={0} cy={-80} r={30} fill="none" stroke="#fff" strokeWidth={6} transform={`rotate(${t * 8} 0 -80)`} strokeDasharray="20 20" />
          </g>
          <T x={1700} y={860} size={40}>washing machine</T>
        </Svg>
      </AbsoluteFill>
    );
  }
  return (
    <Push t={t} from={1} to={1.04}>
      <Svg>
        <Sky mood="day" horizon={600} />
        <Sea mood="day" horizon={600} t={t} />
        <g transform={`translate(${240 + t * 0.5} 700)`}><FerryArt w={1400} /></g>
        <Waterline x={240 + t * 0.5} y={720} width={1420} mood="day" t={t} horizon={600} />
      </Svg>
    </Push>
  );
};

const Destroyer: Tpl = ({ t, p }) => {
  const cut = p.cut === "1";
  const x = cut ? 220 : 120 + t * 2.2;
  return (
    <Push t={t} from={1} to={1.05}>
      <Svg>
        <Sky mood="dusk" horizon={600} />
        <Sea mood="dusk" horizon={600} t={t * 3} />
        <g transform={`translate(${x} 700)`}><DestroyerArt w={1500} /></g>
        {cut && [0.3, 0.38, 0.46, 0.54].map((k, i) => (
          <g key={k} transform={`translate(${x + 1500 * k} 712)`} opacity={ramp(t, 6 + i * 6, 12 + i * 6)}>
            <rect x={-46} y={-22} width={92} height={44} rx={22} fill="#ff8a3c" stroke={INK} strokeWidth={5} />
            <circle cx={-30} cy={0} r={16} fill="#ffd23f" />
          </g>
        ))}
        <Waterline x={x} y={712} width={1500} mood="dusk" t={t * 3} horizon={600} />
        {!cut && <path d={`M${x + 1490} 712 q 60 -40 140 -10`} fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" />}
        {!cut && Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${x - 40 - i * 120} ${720 + (i % 2) * 20} l -100 0`} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.7} />)}
      </Svg>
    </Push>
  );
};

const Jet2Ship: Tpl = ({ t, d, p }) => {
  const m = p.stage === "1" ? 0 : p.stage === "2" ? ramp(t, 0, 20) : ramp(t, d * 0.4, d * 0.4 + 20);
  const spin = t * 25;
  return (
    <AbsoluteFill style={{ background: BG.navy }}>
      <Svg>
        <Rays t={t} />
        {/* airliner wing + engine */}
        <g opacity={1 - m * 0.65}>
          <path d="M80 300 L760 380 L760 420 L80 360 Z" fill="#dfe6ec" {...ink} />
          <g transform="translate(420 470)">
            <rect x={-200} y={-80} width={400} height={160} rx={80} fill="#c9d2dc" {...ink} />
            <ellipse cx={-200} cy={0} rx={30} ry={78} fill="#5b636b" stroke={INK} strokeWidth={5} />
          </g>
          <T x={420} y={680} size={50}>CF6 · airliner engine</T>
        </g>
        <path d="M820 470 L1000 470" stroke="#ffd23f" strokeWidth={18} strokeLinecap="round" />
        <path d="M980 430 L1050 470 L980 510 Z" fill="#ffd23f" stroke={INK} strokeWidth={5} />
        {/* ship turbine on a shaft to a propeller */}
        <g opacity={0.35 + m * 0.65}>
          <g transform="translate(1260 470)">
            <rect x={-150} y={-90} width={300} height={180} rx={30} fill="#9fb3a6" {...ink} />
            <circle cx={-150} cy={0} r={70} fill="#5b636b" stroke={INK} strokeWidth={6} />
            <g transform={`translate(-150 0) rotate(${spin})`}>{[0, 60, 120].map((r) => <line key={r} x1={-60} y1={0} x2={60} y2={0} stroke="#c3ccd3" strokeWidth={10} transform={`rotate(${r})`} />)}</g>
          </g>
          <rect x={1410} y={455} width={330} height={30} fill="#7a6a4a" stroke={INK} strokeWidth={5} />
          <g transform="translate(1760 470)"><Prop r={150} a={spin * 0.3} /></g>
          <T x={1420} y={700} size={50} color="#ffd23f">LM2500 · ship turbine</T>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

const Cruise: Tpl = ({ t, p }) => {
  const cut = p.cut === "1";
  const x = 160, wl = 760, w = 1600;
  return (
    <Push t={t} from={1} to={1.04}>
      <Svg>
        <Sky mood="day" horizon={620} />
        <Sea mood="day" horizon={620} t={t} />
        <g transform={`translate(${x} ${wl})`}><CruiseArt w={w} /></g>
        <Waterline x={x} y={wl + 10} width={w * 1.02} mood="day" t={t} horizon={620} />
        {cut && (
          <g>
            <rect x={x + w * 0.2} y={wl - 20} width={w * 0.5} height={110} rx={10} fill="#2b3440" stroke={INK} strokeWidth={5} opacity={0.95} />
            {Array.from({ length: 6 }).map((_, i) => (
              <rect key={i} x={x + w * (0.22 + i * 0.08)} y={wl} width={w * 0.06} height={70} rx={8} fill="#ffd23f" stroke={INK} strokeWidth={4} opacity={ramp(t, i * 3, i * 3 + 6)} />
            ))}
            {/* power up to the decks, out to the pods */}
            {[0.3, 0.45, 0.6].map((k, i) => (
              <path key={k} d={`M${x + w * k} ${wl - 20} l 20 -60 l -24 0 l 20 -70`} fill="none" stroke="#ffd23f" strokeWidth={8} strokeLinejoin="round" opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 0.3 + i))} />
            ))}
            <path d={`M${x + w * 0.2} ${wl + 50} L${x + w * 0.08} ${wl + 50} L${x + w * 0.08} ${wl + 110}`} fill="none" stroke="#ffd23f" strokeWidth={10} strokeDasharray="18 12" strokeDashoffset={-t * 3} />
            {[0.05, 0.12].map((k) => (
              <g key={k} transform={`translate(${x + w * k} ${wl + 140})`}>
                <rect x={-50} y={-30} width={100} height={60} rx={30} fill="#7f8a95" stroke={INK} strokeWidth={5} />
                <g transform="translate(-60 0) scale(0.35)"><Prop r={120} a={t * 4} /></g>
              </g>
            ))}
          </g>
        )}
      </Svg>
      {p.hotel === "1" && (
        <>
          <div style={{ position: "absolute", left: 600, top: 300, fontFamily, fontWeight: 700, fontSize: 70, color: "#fff", WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill" }}>HOTEL</div>
          <div style={{ position: "absolute", left: 520, top: 880, fontFamily, fontWeight: 700, fontSize: 60, color: "#ffd23f", WebkitTextStroke: `9px ${INK}`, paintOrder: "stroke fill" }}>POWER STATION</div>
        </>
      )}
    </Push>
  );
};

const Carrier: Tpl = ({ t, p }) => {
  const cut = p.cut === "1";
  const x = 120, wl = 720, w = 1680;
  return (
    <Push t={t} from={1} to={1.04}>
      <Svg>
        <Sky mood="day" horizon={600} />
        <Sea mood="day" horizon={600} t={t} />
        <g transform={`translate(${x + (cut ? 0 : t * 0.4)} ${wl})`}><CarrierArt w={w} /></g>
        {cut && (
          <g>
            <rect x={x + w * 0.15} y={wl - 40} width={w * 0.7} height={95} rx={10} fill="#2b3440" stroke={INK} strokeWidth={5} opacity={0.95} />
            {[0.55, 0.7].map((k, i) => (
              <g key={k} opacity={ramp(t, i * 6, i * 6 + 8)}>
                <circle cx={x + w * k} cy={wl + 8} r={36} fill="#4fe08a" stroke={INK} strokeWidth={5} />
                <circle cx={x + w * k} cy={wl + 8} r={52 + 6 * Math.sin(t * 0.3)} fill="none" stroke="#4fe08a" strokeWidth={4} opacity={0.6} />
              </g>
            ))}
            <path d={`M${x + w * 0.52} ${wl + 8} L${x + w * 0.32} ${wl + 8}`} stroke="#fff" strokeWidth={12} strokeDasharray="14 10" strokeDashoffset={t * 2} />
            {[0.22, 0.3].map((k) => <rect key={k} x={x + w * k} y={wl - 18} width={w * 0.06} height={50} rx={12} fill="#9fb3a6" stroke={INK} strokeWidth={4} />)}
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={x + w * 0.22} y1={wl + 2 + i * 10} x2={x + w * 0.03} y2={wl + 40 + i * 16} stroke="#7a6a4a" strokeWidth={8} />
            ))}
          </g>
        )}
        <Waterline x={x + (cut ? 0 : t * 0.4)} y={wl + 20} width={w} mood="day" t={t} horizon={600} />
      </Svg>
      {p.stamp && <Stamp text={txt(p.stamp)} p={ramp(t, d0(t), d0(t) + 8)} />}
    </Push>
  );
};
const d0 = (_t: number) => 20;

const Emma: Tpl = ({ t, p }) => {
  const sail = p.wake === "1";
  const x = 120 + (sail ? t * 0.8 : 0);
  return (
    <Push t={t} from={1} to={1.04}>
      <Svg>
        <Sky mood={sail ? "dusk" : "day"} horizon={600} />
        <Sea mood={sail ? "dusk" : "day"} horizon={600} t={t} />
        <g transform={`translate(${x} 720)`}><BoxShip w={1650} /></g>
        <Waterline x={x} y={736} width={1660} mood={sail ? "dusk" : "day"} t={t} horizon={600} />
      </Svg>
    </Push>
  );
};

const Direct: Tpl = ({ t }) => {
  const a = (t / 30) * (100 / 60) * 360;
  return (
    <AbsoluteFill style={{ background: BG.navy }}>
      <Svg>
        <Rays t={t} />
        <g transform="translate(140 760)"><BigEngine w={700} t={t} /></g>
        <rect x={840} y={690} width={760} height={34} fill="#7a6a4a" stroke={INK} strokeWidth={5} />
        <g transform="translate(1680 707)"><Prop r={260} a={a} /></g>
        {/* crossed-out gearbox */}
        <g transform="translate(1180 520)" opacity={ramp(t, 10, 20)}>
          <rect x={-90} y={-70} width={180} height={140} rx={14} fill="#c3ccd3" {...ink} />
          {[0, 45, 90, 135].map((r) => <rect key={r} x={-8} y={-50} width={16} height={100} fill="#8d969e" transform={`rotate(${r})`} />)}
          <path d="M-110 -90 L110 90 M110 -90 L-110 90" stroke="#e8352b" strokeWidth={22} strokeLinecap="round" />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

const Versus: Tpl = ({ t, d }) => {
  const a = ramp(t, 4, 30), b = ramp(t, d * 0.55, d * 0.55 + 26);
  return (
    <AbsoluteFill style={{ background: BG.navy }}>
      <Svg>
        <Rays t={t} />
        <g transform="translate(120 330) scale(0.55)"><Tanker /></g>
        <T x={120} y={150} size={52} anchor="start">SEAWISE GIANT · steam turbine</T>
        <rect x={720} y={230} width={1080 * (50 / 107.39) * a} height={90} fill="#9fb3c8" stroke={INK} strokeWidth={6} />
        <T x={740 + 1080 * (50 / 107.39) * a} y={295} size={56} anchor="start">{`${Math.round(50000 * a).toLocaleString("en-US")} hp`}</T>
        <g transform="translate(120 820) scale(0.34)"><BoxShip w={1650} /></g>
        <T x={120} y={620} size={52} anchor="start" color="#ffd23f">ONE RT-flex96C engine</T>
        <rect x={720} y={700} width={1080 * b} height={90} fill="#ffd23f" stroke={INK} strokeWidth={6} />
        <T x={740 + 1080 * b > 1500 ? 1500 : 740 + 1080 * b} y={765} size={56} anchor={1080 * b > 760 ? "end" : "start"} color={1080 * b > 760 ? INK : "#fff"}>{`${Math.round(107390 * b).toLocaleString("en-US")} hp`}</T>
      </Svg>
      {b > 0.95 && <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontFamily, fontWeight: 700, fontSize: 90, color: "#ffd23f", WebkitTextStroke: `12px ${INK}`, paintOrder: "stroke fill" }}>MORE THAN 2×</div>}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ stat with this video's icons
const ICONS: Record<string, React.FC<{ t: number }>> = {
  outboard: () => (
    <g transform="scale(1.7)">
      <rect x={-60} y={-120} width={120} height={140} rx={30} fill="#1f1f24" {...ink} />
      <text x={0} y={-35} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={34} fill="#ccc">V12</text>
      <rect x={-18} y={20} width={36} height={130} fill="#2b2b30" stroke={INK} strokeWidth={5} />
    </g>
  ),
  car: () => <g transform="translate(-180 120) scale(4)"><Car c="#e8352b" /></g>,
  engine2: () => (
    <g>{[-170, 170].map((x) => <g key={x} transform={`translate(${x - 150} 130)`}><BigEngine w={300} t={0} /></g>)}</g>
  ),
  record: () => (
    <g>
      <circle r={170} fill="#ffd23f" {...ink} strokeWidth={8} />
      <circle r={120} fill="#f2b705" stroke={INK} strokeWidth={6} />
      <path d="M-80 150 L-120 300 L-40 260 L0 320 L20 160 Z M80 150 L120 300 L40 260 L0 320 L-20 160 Z" fill="#e8352b" stroke={INK} strokeWidth={6} />
      <text x={0} y={30} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={90} fill={INK}>#1</text>
    </g>
  ),
  home: () => (
    <g>{Array.from({ length: 9 }).map((_, i) => (
      <g key={i} transform={`translate(${-200 + (i % 3) * 200} ${-120 + Math.floor(i / 3) * 150}) scale(0.9)`}>
        <rect x={-60} y={-40} width={120} height={90} fill="#edd8ae" stroke={INK} strokeWidth={5} />
        <path d="M-75 -40 L0 -100 L75 -40 Z" fill="#c0392b" stroke={INK} strokeWidth={5} />
        <rect x={-15} y={5} width={30} height={45} fill="#ffd23f" />
      </g>
    ))}</g>
  ),
  turbine: ({ t }) => (
    <g>
      <circle r={190} fill="#c9d2dc" {...ink} strokeWidth={8} />
      <g transform={`rotate(${t * 12})`}>{Array.from({ length: 12 }).map((_, i) => <path key={i} d="M0 0 L40 -170 L-10 -170 Z" fill="#7d868e" stroke={INK} strokeWidth={3} transform={`rotate(${i * 30})`} />)}</g>
      <circle r={40} fill="#5b636b" stroke={INK} strokeWidth={5} />
    </g>
  ),
  navy: () => (
    <g>{Array.from({ length: 12 }).map((_, i) => (
      <path key={i} d="M-40 -14 L40 -14 L50 0 L-40 10 Z" fill="#8e99a4" stroke={INK} strokeWidth={3} transform={`translate(${-200 + (i % 4) * 135} ${-150 + Math.floor(i / 4) * 140}) scale(1.4)`} />
    ))}</g>
  ),
  fuel: ({ t }) => {
    const lvl = 1 - ((t * 0.01) % 1);
    return (
      <g>
        <rect x={-130} y={-200} width={220} height={360} rx={20} fill="#e8352b" {...ink} strokeWidth={8} />
        <rect x={-100} y={-170} width={160} height={110} rx={10} fill="#f4f1e8" stroke={INK} strokeWidth={5} />
        <rect x={-90} y={-160 + 90 * (1 - lvl)} width={140} height={90 * lvl} fill="#3fae5a" />
        <path d="M90 -120 Q160 -120 160 -40 L160 120 Q160 160 130 160" fill="none" stroke={INK} strokeWidth={14} />
      </g>
    );
  },
  lng: ({ t }) => (
    <g>
      <path d={`M0 -220 Q 120 -60 90 60 Q 60 170 0 180 Q -60 170 -90 60 Q -120 -60 0 -220 Z`} fill="#3b8fd9" {...ink} strokeWidth={8} transform={`scale(${1 + 0.04 * Math.sin(t * 0.4)})`} />
      <path d="M0 -60 Q 50 20 35 90 Q 15 140 0 140 Q -15 140 -35 90 Q -50 20 0 -60 Z" fill="#9fd3ff" />
    </g>
  ),
  calendar: ({ t }) => (
    <g>
      <rect x={-170} y={-170} width={340} height={340} rx={24} fill="#f4f1e8" {...ink} strokeWidth={8} />
      <rect x={-170} y={-170} width={340} height={80} fill="#e8352b" stroke={INK} strokeWidth={8} />
      <text x={0} y={80} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={120} fill={INK}>{`YR ${1 + Math.min(24, Math.floor(t / 3))}`}</text>
    </g>
  ),
  engine: ({ t }) => <g transform="translate(-260 150)"><BigEngine w={520} t={t} /></g>,
};

export const StatX: Tpl = ({ t, p }) => {
  const Icon = ICONS[p.icon ?? ""];
  const target = Number(p.num ?? 0);
  const v = p.raw === "1" ? target : target * ramp(t, 4, 34); // years etc. appear whole, no count-up
  const shown = p.raw === "1" ? String(Math.round(v)) : (p.num ?? "").includes(".") ? v.toFixed(1) : Math.round(v).toLocaleString("en-US");
  return (
    <AbsoluteFill style={{ background: BG.navy }}>
      <Svg>
        <Rays t={t} />
        <g transform={`translate(470 560) scale(${0.9 + 0.1 * ramp(t, 0, 12)})`}>{Icon && <Icon t={t} />}</g>
      </Svg>
      <div style={{ position: "absolute", left: 860, top: target ? 300 : 400, fontFamily, fontWeight: 700, lineHeight: 1, WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill" }}>
        {target > 0 && <div style={{ fontSize: 200, color: "#ffd23f" }}>{p.pre ?? ""}{shown}{p.plus === "1" ? "+" : ""}</div>}
        <div style={{ fontSize: target ? 100 : 130, color: "#fff", marginTop: 10 }}>{txt(p.unit)}</div>
        <div style={{ fontSize: 56, color: "#cfe3ff", marginTop: 20, WebkitTextStroke: `9px ${INK}` }}>{txt(p.label)}</div>
      </div>
    </AbsoluteFill>
  );
};
export const STAT_ICONS = Object.keys(ICONS);

export const TEMPLATES2: Record<string, Tpl> = {
  piston: Piston, crank: Crank, engine: EngineT, rpm: Rpm, ladder: Ladder, outboard: Outboard, tug: Tug,
  ropecars: RopeCars, ferry: Ferry, destroyer: Destroyer, jet2ship: Jet2Ship, cruise: Cruise, carrier: Carrier,
  emma: Emma, direct: Direct, versus: Versus,
};
