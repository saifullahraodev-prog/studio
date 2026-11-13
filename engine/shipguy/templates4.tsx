// The Ship Guy: scene templates for "Every Level of Ship by Cost" (video #4). Retention-first: every price lands
// on a swinging price tag, the Ship Guy climbs the price ladder, nothing sits still. Frame-driven only.
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { H, INK, Sea, Sky, W, Waterline } from "./art";
import { fontFamily, ramp, Svg } from "./scenes";
import { BoxShip, CarrierArt, CruiseArt, TugArt } from "./templates2";
import { Actor, pop, T3, txt } from "./templates3";

type P = Record<string, string>;
type Tpl = React.FC<{ t: number; d: number; p: P; w?: number[][] }>;
const ink = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const PAPER = "#f3f1ea";
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ================================================================== drawn ships (local: waterline y=0, bow right)
const JonBoat: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M0 -60 L380 -60 L420 -30 L400 20 L20 20 Z" fill="#b9c3cc" {...ink} />
    {[60, 140, 220, 300].map((x) => <line key={x} x1={x} y1={-58} x2={x - 6} y2={18} stroke="#8d969e" strokeWidth={4} />)}
    <rect x={150} y={-74} width={90} height={14} fill="#8d969e" stroke={INK} strokeWidth={4} />
  </g>
);
const V12: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-90} y={-260} width={180} height={220} rx={50} fill="#1f1f24" {...ink} />
    <text x={0} y={-130} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={56} fill="#d8d8d8">V12</text>
    <rect x={-30} y={-40} width={60} height={220} fill="#2b2b30" stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={190} rx={70} ry={26} fill="#9aa3ab" stroke={INK} strokeWidth={5} />
  </g>
);
/** LNG carrier with four spherical (Moss) tanks, `w` long. */
export const LngShip: React.FC<{ w: number; frost?: number }> = ({ w, frost = 0 }) => (
  <g>
    <path d={`M0 -${w * 0.07} L${w * 0.95} -${w * 0.07} Q${w * 1.01} -${w * 0.07} ${w * 1.02} -${w * 0.11} L${w * 0.97} ${w * 0.05} L${w * 0.04} ${w * 0.05} Q0 ${w * 0.05} 0 0 Z`} fill="#2b3d63" {...ink} />
    <rect x={0} y={w * 0.015} width={w * 0.98} height={w * 0.035} fill="#b8322a" />
    {[0.28, 0.46, 0.64, 0.82].map((k) => (
      <g key={k}>
        <path d={`M${w * (k - 0.08)} -${w * 0.07} A ${w * 0.08} ${w * 0.08} 0 0 1 ${w * (k + 0.08)} -${w * 0.07} Z`} fill={frost > 0.5 ? "#e6f3fb" : "#f4f1e8"} {...ink} />
        {frost > 0 && <path d={`M${w * (k - 0.06)} -${w * 0.09} q ${w * 0.02} -${w * 0.02} ${w * 0.04} 0 M${w * (k + 0.01)} -${w * 0.12} q ${w * 0.02} -${w * 0.02} ${w * 0.04} 0`} stroke="#9fd3ff" strokeWidth={6} fill="none" opacity={frost} />}
      </g>
    ))}
    <rect x={w * 0.04} y={-w * 0.16} width={w * 0.09} height={w * 0.09} fill="#f4f1e8" {...ink} strokeWidth={5} />
    <rect x={w * 0.06} y={-w * 0.2} width={w * 0.03} height={w * 0.04} fill="#2f86c9" {...ink} strokeWidth={4} />
  </g>
);
/** Superyacht (Azzam-like): sleek white, dark window bands, `w` long. */
export const Yacht: React.FC<{ w: number }> = ({ w }) => (
  <g>
    <path d={`M0 -${w * 0.03} L${w * 0.86} -${w * 0.03} Q${w * 1.0} -${w * 0.035} ${w * 1.04} -${w * 0.09} L${w * 0.92} ${w * 0.035} L${w * 0.05} ${w * 0.035} Q0 ${w * 0.035} 0 0 Z`} fill="#f7f7f2" {...ink} />
    <path d={`M${w * 0.08} -${w * 0.03} L${w * 0.12} -${w * 0.075} L${w * 0.8} -${w * 0.075} L${w * 0.86} -${w * 0.03} Z`} fill="#f7f7f2" {...ink} />
    <path d={`M${w * 0.18} -${w * 0.075} L${w * 0.22} -${w * 0.115} L${w * 0.66} -${w * 0.115} L${w * 0.72} -${w * 0.075} Z`} fill="#f7f7f2" {...ink} />
    <path d={`M${w * 0.3} -${w * 0.115} L${w * 0.33} -${w * 0.145} L${w * 0.54} -${w * 0.145} L${w * 0.58} -${w * 0.115} Z`} fill="#f7f7f2" {...ink} />
    {[[-0.012, 0.1, 0.8], [-0.058, 0.15, 0.73], [-0.1, 0.24, 0.62], [-0.132, 0.35, 0.53]].map(([y, a, b], i) => (
      <rect key={i} x={w * a} y={w * y - w * 0.01} width={w * (b - a)} height={w * 0.016} rx={6} fill="#1d2a3a" />
    ))}
    <line x1={w * 0.44} y1={-w * 0.145} x2={w * 0.44} y2={-w * 0.2} stroke={INK} strokeWidth={6} />
  </g>
);
/** Attack submarine, waterline at y=0 (mostly under water), `w` long. */
export const Sub: React.FC<{ w: number }> = ({ w }) => (
  <g>
    <path d={`M0 0 Q${w * 0.02} -${w * 0.05} ${w * 0.12} -${w * 0.055} L${w * 0.85} -${w * 0.055} Q${w} -${w * 0.05} ${w} 0 Q${w} ${w * 0.05} ${w * 0.85} ${w * 0.055} L${w * 0.12} ${w * 0.055} Q${w * 0.02} ${w * 0.05} 0 0 Z`} fill="#2b2f36" {...ink} />
    <path d={`M${w * 0.55} -${w * 0.055} L${w * 0.57} -${w * 0.14} L${w * 0.66} -${w * 0.14} L${w * 0.68} -${w * 0.055} Z`} fill="#2b2f36" {...ink} />
    <path d={`M${w * 0.58} -${w * 0.11} l -${w * 0.04} 0 M${w * 0.65} -${w * 0.11} l ${w * 0.04} 0`} stroke={INK} strokeWidth={8} />
    <path d={`M0 0 L-${w * 0.04} -${w * 0.04} L-${w * 0.04} ${w * 0.04} Z`} fill="#2b2f36" stroke={INK} strokeWidth={5} />
  </g>
);

// ================================================================== the swinging price tag
const Tag: React.FC<{ t: number; x: number; y: number; price: string; sub?: string; col?: string; big?: boolean; a0?: number }> = ({ t, x, y, price, sub, col = "#ffd23f", big, a0 = 6 }) => {
  const k = t - a0;
  if (k < 0) return null;
  const drop = interpolate(k, [0, 8], [-420, 0], { extrapolateRight: "clamp" });
  const ang = 24 * Math.exp(-k / 14) * Math.cos(k / 3.2);
  const len = Math.max(price.length, 4);
  const fs = big ? Math.min(120, 1500 / len) : Math.min(150, 1250 / len);
  const wd = Math.max(520, len * fs * 0.62 + 120);
  return (
    <g transform={`translate(${x} ${y + drop}) rotate(${ang})`}>
      <line x1={0} y1={-260} x2={0} y2={-40} stroke={INK} strokeWidth={6} />
      <path d={`M${-wd / 2} 0 L${wd / 2 - 60} 0 L${wd / 2} 90 L${wd / 2 - 60} 180 L${-wd / 2} 180 Z`} transform={`translate(0 -40)`} fill={col} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      <circle cx={wd / 2 - 70} cy={50} r={16} fill="#fff" stroke={INK} strokeWidth={6} />
      <text x={-20} y={50 + fs * 0.35} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={fs} fill={INK}>{price}</text>
      {sub && <T3 x={-20} y={210} size={50}>{sub}</T3>}
    </g>
  );
};

const SeaBg: React.FC<{ t: number; mood?: "day" | "dusk" }> = ({ t, mood = "day" }) => (
  <><Sky mood={mood} horizon={620} /><Sea mood={mood} horizon={620} t={t} /></>
);

const TagT: Tpl = ({ t, p }) => {
  const s = p.subj ?? "box";
  const price = txt(p.price ?? "");
  const tag = <Tag t={t} x={1300} y={s === "v12" ? 300 : 190} price={price} sub={p.sub ? txt(p.sub) : undefined} big={p.big === "1"}
    col={p.tagcol === "green" ? "#4fe08a" : p.tagcol === "white" ? "#ffffff" : "#ffd23f"} />;
  const drift = t * 0.6;
  let scene: React.ReactNode = null;
  if (s === "jon") scene = <><SeaBg t={t} /><g transform={`translate(${260 + drift} ${720 + Math.sin(t * 0.1) * 5})`}><JonBoat s={1.6} /></g><Waterline x={240 + drift} y={730} width={700} mood="day" t={t} horizon={620} /></>;
  else if (s === "v12") scene = <><rect width={W} height={H} fill={PAPER} /><g transform={`translate(560 760) rotate(${Math.sin(t * 0.12) * 3})`}><V12 s={1.8} /></g></>;
  else if (s === "box") scene = <><SeaBg t={t} /><g transform={`translate(${160 + drift} 820)`}><BoxShip w={1500} name="" /></g><Waterline x={160 + drift} y={834} width={1510} mood="day" t={t} horizon={620} /></>;
  else if (s === "lng") scene = <><SeaBg t={t} /><g transform={`translate(${200 + drift} 770)`}><LngShip w={1300} /></g><Waterline x={200 + drift} y={790} width={1320} mood="day" t={t} horizon={620} /></>;
  else if (s === "yacht") {
    const sp = p.speed === "1";
    const x = sp ? -200 + t * 4 : 120 + drift;
    scene = <><SeaBg t={t * (sp ? 3 : 1)} /><g transform={`translate(${x} 760)`}><Yacht w={1250} /></g><Waterline x={x} y={782} width={1300} mood="day" t={t * (sp ? 3 : 1)} horizon={620} />
      {sp && Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M${x - 40 - i * 110} ${790 + (i % 2) * 22} l -90 0`} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.8} />)}</>;
  }
  else if (s === "cruise") scene = <><SeaBg t={t} /><g transform={`translate(${120 + drift} 860)`}><CruiseArt w={1250} /></g><Waterline x={120 + drift} y={868} width={1280} mood="day" t={t} horizon={620} /></>;
  else if (s === "sub") scene = <><SeaBg t={t} mood="dusk" /><g transform={`translate(${200 + drift} 700)`}><Sub w={1300} /></g><Waterline x={150 + drift} y={706} width={1400} mood="dusk" t={t} horizon={620} /></>;
  else if (s === "carrier") scene = <><SeaBg t={t} /><g transform={`translate(${40 + drift * 0.5} 780)`}><CarrierArt w={1750} /></g><Waterline x={40 + drift * 0.5} y={800} width={1760} mood="day" t={t} horizon={620} /></>;
  else if (s === "tug") scene = <><SeaBg t={t} /><g transform={`translate(${300 + drift} 820)`}><TugArt s={2.4} /></g><Waterline x={260 + drift} y={840} width={1060} mood="day" t={t} horizon={620} /></>;
  return <AbsoluteFill><Svg>{scene}{tag}</Svg></AbsoluteFill>;
};

// ================================================================== the price ladder (Ship Guy climbs it)
const LADDER: [string, string, number][] = [
  ["FISHING BOAT", "$2K", 2e3], ["FAST BOAT", "$300K", 3.08e5], ["TUG", "€4–6M", 5.5e6], ["CONTAINER", "$242M", 2.42e8],
  ["LNG", "$245M", 2.45e8], ["SUPERYACHT", "$600M", 6e8], ["CRUISE", "$2B", 2e9], ["SUBMARINE", "$4.5B+", 4.75e9], ["CARRIER", "$13B", 1.3e10],
];
const PLadder: Tpl = ({ t, p }) => {
  const hi = Number(p.hi ?? 0);
  const step = (i: number) => {
    const x = 70 + i * 205, h = 110 + ((Math.log10(LADDER[i][2]) - 3) / 7.2) * 640;
    return { x, y: 1010 - h, w: 195 };
  };
  const g = hi >= 1 && hi <= 9 ? step(hi - 1) : hi === 10 ? step(8) : { x: 70, y: 1010, w: 0 };
  const prevG = hi >= 2 && hi <= 9 ? step(hi - 2) : g;
  const k = ramp(t, 2, 16);
  const gx = interpolate(k, [0, 1], [prevG.x + prevG.w / 2, g.x + g.w / 2]);
  const gy = interpolate(k, [0, 1], [prevG.y, g.y]) - Math.sin(k * Math.PI) * 120;
  return (
    <AbsoluteFill style={{ background: "#1f3a5f" }}>
      <Svg>
        <g transform="translate(960 540)" opacity={0.12}>{Array.from({ length: 16 }).map((_, i) => <path key={i} d="M0 0 L1400 -140 L1400 140 Z" fill="#fff" transform={`rotate(${i * 22.5 + t * 0.15})`} />)}</g>
        {LADDER.map(([name, price], i) => {
          const s = step(i);
          const shown = hi === 10 || i < Math.max(hi, 1);
          const cur = hi === i + 1;
          const hidden = !shown && (hi === 0 ? i > 0 : true);
          return (
            <g key={i} opacity={ramp(t, i * 1.5, i * 1.5 + 6)}>
              <rect x={s.x} y={s.y} width={s.w} height={1080 - s.y} fill={cur ? "#ffd23f" : shown ? "#4f8ac0" : "#2d4a6e"} stroke={INK} strokeWidth={6} />
              <T3 x={s.x + s.w / 2} y={s.y - 64} size={30} color={cur ? "#ffd23f" : "#fff"}>{hidden ? "???" : name}</T3>
              <T3 x={s.x + s.w / 2} y={s.y - 18} size={44} color={cur ? "#ffd23f" : "#cfe3ff"}>{hidden ? "?" : price}</T3>
              <T3 x={s.x + s.w / 2} y={s.y + 70} size={50} color={cur ? INK : "#fff"}>{i + 1}</T3>
            </g>
          );
        })}
        {hi >= 1 && <Actor a={hi === 10 ? "cheer" : hi >= 6 ? "amazed" : "wave"} t={t} x={gx} y={gy - 4} s={0.3} id="ladder" />}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== yacht vs container ships
const VsYacht: Tpl = ({ t, p }) => {
  const mode = p.mode ?? "mystery";
  const px = 1700 / 400; // px per metre
  if (mode === "scale") {
    const tilt = 9 * ramp(t, 8, 26) + Math.sin(t * 0.2) * 0.6;
    return (
      <AbsoluteFill style={{ background: PAPER }}>
        <Svg>
          <rect x={940} y={420} width={40} height={560} fill="#8d969e" {...ink} />
          <path d="M860 1000 L1060 1000 L1000 960 L920 960 Z" fill="#8d969e" {...ink} />
          <g transform={`translate(960 420) rotate(${-tilt})`}>
            <rect x={-760} y={-14} width={1520} height={28} rx={14} fill="#b9c2ca" {...ink} />
            {[-1, 1].map((sd) => (
              <g key={sd} transform={`translate(${sd * 700} 0) rotate(${tilt})`}>
                <line x1={-150} y1={240} x2={0} y2={0} stroke={INK} strokeWidth={5} /><line x1={150} y1={240} x2={0} y2={0} stroke={INK} strokeWidth={5} />
                <path d="M-200 240 L200 240 L160 280 L-160 280 Z" fill="#c9d2dc" {...ink} />
                {sd === 1 ? (
                  <g><g transform="translate(-190 230)"><BoxShip w={380} name="" /></g><g transform="translate(-190 150)"><BoxShip w={380} name="" /></g>
                    <T3 x={0} y={340} size={44}>2 × $242M</T3></g>
                ) : (
                  <g><g transform="translate(-130 228)"><Yacht w={260} /></g><T3 x={0} y={340} size={44} color="#ffd23f">$600M</T3></g>
                )}
              </g>
            ))}
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  const big = mode === "lng" ? 295 : 180;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#2f86c9" />
        {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={110 + i * 170} y1={140} x2={110 + i * 170} y2={980} stroke="#fff" strokeOpacity={0.15} strokeWidth={3} />)}
        <g transform="translate(110 520)"><BoxShip w={400 * px} name="" /></g>
        <T3 x={110 + 200 * px} y={190} size={56}>CONTAINER SHIP · ~400 m</T3>
        <g transform={`translate(110 860) scale(${ramp(t, 4, 16)} 1)`}>
          {mode === "lng" ? <LngShip w={big * px} /> : <g opacity={mode === "mystery" ? 0.85 : 1}><Yacht w={big * px} /></g>}
        </g>
        {mode === "mystery" && <rect x={110} y={700} width={big * px * 1.05} height={190} fill="#11161d" opacity={0.9} rx={20} />}
        {mode === "mystery" && <T3 x={110 + big * px * 0.5} y={830} size={130} color="#ffd23f">?</T3>}
        {mode === "lng" && <T3 x={110 + big * px * 0.5} y={1010} size={56} color="#ffd23f">LNG CARRIER · ~295 m</T3>}
        {mode === "mystery" && <T3 x={1500} y={830} size={64}>{"< HALF THE LENGTH"}</T3>}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== price per metre bars
const PerMetre: Tpl = ({ t, p }) => {
  const both = p.mode === "both";
  const a = ramp(t, 4, 24), b = ramp(t, 22, 50);
  const max = 1200;
  return (
    <AbsoluteFill style={{ background: "#1f3a5f" }}>
      <Svg>
        <g transform="translate(120 330)"><BoxShip w={360} name="" /></g>
        <rect x={560} y={260} width={max * (0.6 / 3.3) * a} height={110} fill="#4f8ac0" {...ink} />
        <T3 x={580 + max * (0.6 / 3.3) * a} y={340} size={64} anchor="start">{`$${(0.6 * a).toFixed(1)}M / metre`}</T3>
        {both && (
          <g>
            <g transform="translate(160 720)"><Yacht w={300} /></g>
            <rect x={560} y={630} width={max * b} height={110} fill="#ffd23f" {...ink} />
            <T3 x={b > 0.6 ? 560 + max * b - 20 : 580 + max * b} y={710} size={64} anchor={b > 0.6 ? "end" : "start"} color={b > 0.6 ? INK : "#fff"}>{`$${(3.3 * b).toFixed(1)}M / metre`}</T3>
          </g>
        )}
        {!both && <T3 x={960} y={760} size={70} color="#ffd23f" o={ramp(t, 30, 40)}>one of the cheapest per metre</T3>}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== hull + motor + trailer stack
const Stack: Tpl = ({ t }) => {
  const items: [string, string][] = [["HULL", "$2,095"], ["MOTOR", "+ $$$"], ["TRAILER", "+ $$"]];
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Svg>
        {items.map(([n, v], i) => {
          const k = pop(t, i * 10);
          return (
            <g key={i} transform={`translate(560 ${880 - i * 210}) scale(${k})`}>
              <rect x={-330} y={-90} width={660} height={180} rx={24} fill={["#b9c3cc", "#2b2b30", "#7d868e"][i]} {...ink} strokeWidth={8} />
              <T3 x={-280} y={20} size={70} anchor="start">{n}</T3>
              <T3 x={290} y={20} size={70} anchor="end" color="#ffd23f">{v}</T3>
            </g>
          );
        })}
        <T3 x={1400} y={560} size={130} color="#2f7d4a" s={pop(t, 34)}>= $5K–16K</T3>
      </Svg>
      <Svg><Actor a="count" t={t} x={1500} y={1040} s={0.5} id="stack" /></Svg>
    </AbsoluteFill>
  );
};

// ================================================================== factory line of identical boats / ships
const Factory: Tpl = ({ t, p }) => {
  const box = p.kind === "box";
  const n = box ? 3 : 6;
  const gap = box ? 900 : 420;
  return (
    <AbsoluteFill style={{ background: "#cfd6db" }}>
      <Svg>
        <rect x={0} y={800} width={W} height={280} fill="#8f8f88" />
        <line x1={0} y1={800} x2={W} y2={800} stroke={INK} strokeWidth={6} />
        {!box && Array.from({ length: 24 }).map((_, i) => <circle key={i} cx={((i * 90 + t * 4) % (W + 100)) - 50} cy={830} r={18} fill="#5b636b" stroke={INK} strokeWidth={4} />)}
        {Array.from({ length: n + 1 }).map((_, i) => {
          const x = ((i * gap + t * (box ? 3 : 4)) % (gap * (n + 1))) - gap;
          return box
            ? <g key={i} transform={`translate(${x} 760)`}><BoxShip w={820} name="" /></g>
            : <g key={i} transform={`translate(${x} 780)`}><JonBoat s={0.85} /></g>;
        })}
        {box && [300, 900, 1500].map((x) => (
          <g key={x}><rect x={x} y={120} width={40} height={680} fill="#e8b830" stroke={INK} strokeWidth={5} /><rect x={x - 120} y={110} width={280} height={36} fill="#e8b830" stroke={INK} strokeWidth={5} /></g>
        ))}
        {!box && <T3 x={960} y={300} size={90} color="#2f6fb0">× 1,000s</T3>}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== Damen used-tug listing card
const Listing: Tpl = ({ t }) => {
  const k = pop(t, 2);
  const price = ramp(t, 20, 34);
  return (
    <AbsoluteFill style={{ background: "#e9edf0" }}>
      <Svg>
        <g transform={`translate(960 540) scale(${k}) translate(-960 -540)`}>
          <rect x={260} y={110} width={1400} height={860} rx={28} fill="#fff" {...ink} strokeWidth={8} />
          <rect x={260} y={110} width={1400} height={70} rx={28} fill="#2b3d63" />
          {[0, 1, 2].map((i) => <circle key={i} cx={310 + i * 40} cy={145} r={11} fill={["#e8352b", "#ffd23f", "#4fe08a"][i]} />)}
          <rect x={300} y={210} width={700} height={460} rx={14} fill="#9fd3ee" stroke={INK} strokeWidth={5} />
          <rect x={300} y={520} width={700} height={150} fill="#2f86c9" />
          <g transform="translate(470 560)"><TugArt s={1.1} /></g>
          <T3 x={1050} y={290} size={58} anchor="start" color={INK}>ASD Tug 2810</T3>
          <text x={1050} y={360} fontFamily={fontFamily} fontWeight={600} fontSize={40} fill="#555">Used vessel · built 2015</text>
          <text x={1050} y={420} fontFamily={fontFamily} fontWeight={600} fontSize={40} fill="#555">Length ~28 m · Damen Trading</text>
          <rect x={1050} y={480} width={560} height={130} rx={16} fill="#ffd23f" stroke={INK} strokeWidth={6} opacity={price} />
          <text x={1330} y={565} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={64} fill={INK} opacity={price}>€4M – €6M</text>
          <rect x={300} y={720} width={1310} height={24} rx={12} fill="#e3e7ea" /><rect x={300} y={770} width={1000} height={24} rx={12} fill="#e3e7ea" /><rect x={300} y={820} width={1150} height={24} rx={12} fill="#e3e7ea" />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== LNG: cold, insulation, crack, boil-off, fuel
const Cold: Tpl = ({ t, p }) => {
  const m = p.mode ?? "temp";
  if (m === "temp") {
    const v = interpolate(ramp(t, 4, 40), [0, 1], [20, -162]);
    const fill = (v + 170) / 200;
    return (
      <AbsoluteFill style={{ background: "#14263f" }}>
        <Svg>
          {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={rnd(i) * W} cy={(rnd(i + 5) * H + t * (2 + rnd(i) * 3)) % H} r={4 + rnd(i + 2) * 6} fill="#fff" opacity={0.5} />)}
          <g transform="translate(600 540)">
            <rect x={-60} y={-400} width={120} height={720} rx={60} fill="#f4f1e8" {...ink} strokeWidth={8} />
            <circle cx={0} cy={380} r={110} fill="#3b8fd9" {...ink} strokeWidth={8} />
            <rect x={-30} y={340 - 700 * fill} width={60} height={700 * fill + 10} fill="#3b8fd9" />
            {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={60} y1={-360 + i * 80} x2={110} y2={-360 + i * 80} stroke="#f4f1e8" strokeWidth={6} />)}
          </g>
          <T3 x={1250} y={560} size={200} color="#9fd3ff">{`${Math.round(v)} °C`}</T3>
          <T3 x={1250} y={680} size={60}>liquid natural gas</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "cut") {
    const layers = ["#2b3d63", "#e0c79a", "#f4f1e8", "#e0c79a", "#c9d2dc"];
    return (
      <AbsoluteFill style={{ background: PAPER }}>
        <Svg>
          {layers.map((c, i) => <circle key={i} cx={760} cy={560} r={420 - i * 42} fill={c} {...ink} strokeWidth={5} opacity={ramp(t, i * 4, i * 4 + 8)} />)}
          <circle cx={760} cy={560} r={210} fill="#3b8fd9" stroke={INK} strokeWidth={6} opacity={ramp(t, 22, 30)} />
          <path d={`M560 ${600 + Math.sin(t * 0.2) * 8} Q 760 ${560 + Math.cos(t * 0.2) * 10} 960 ${600 + Math.sin(t * 0.2) * 8}`} stroke="#9fd3ff" strokeWidth={8} fill="none" opacity={ramp(t, 22, 30)} />
          <T3 x={760} y={575} size={64} o={ramp(t, 26, 34)}>LNG</T3>
          {["steel hull", "insulation", "barrier", "insulation", "inner tank"].map((s, i) => (
            <g key={s} opacity={ramp(t, i * 4 + 4, i * 4 + 12)}>
              <line x1={760 + (400 - i * 42) * 0.7} y1={560 - (400 - i * 42) * 0.7} x2={1300} y2={200 + i * 120} stroke={INK} strokeWidth={4} />
              <T3 x={1320} y={215 + i * 120} size={50} anchor="start" color={INK}>{s}</T3>
            </g>
          ))}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "crack") {
    const k = ramp(t, 10, 30);
    return (
      <AbsoluteFill style={{ background: "#2b3440" }}>
        <Svg>
          <rect x={360} y={420} width={1200} height={420} fill="#8d969e" {...ink} strokeWidth={8} />
          {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={960 + Math.sin(i) * 30} cy={120 + ((t * 6 + i * 50) % 300)} r={18} fill="#9fd3ff" stroke={INK} strokeWidth={4} />)}
          <path d="M960 420 L930 520 L990 600 L940 700 L980 840" fill="none" stroke={INK} strokeWidth={10} strokeDasharray={600} strokeDashoffset={600 * (1 - k)} />
          <path d="M930 520 L840 560 M990 600 L1090 640 M940 700 L860 760" fill="none" stroke={INK} strokeWidth={7} strokeDasharray={200} strokeDashoffset={200 * (1 - k)} />
          <rect x={360} y={420} width={1200} height={60} fill="#cfe9fb" opacity={0.5 * k} />
        </Svg>
      </AbsoluteFill>
    );
  }
  // boil (vapour rises from the tank) / fuel (vapour piped to the engine and burned)
  const fuel = m === "fuel";
  return (
    <AbsoluteFill style={{ background: "#1f3a5f" }}>
      <Svg>
        <g transform="translate(150 820)"><LngShip w={fuel ? 900 : 1500} frost={1} /></g>
        {Array.from({ length: 10 }).map((_, i) => {
          const kk = ((t * 0.02 + i / 10) % 1);
          const x0 = fuel ? 150 + 900 * (0.28 + (i % 4) * 0.18) : 150 + 1500 * (0.28 + (i % 4) * 0.18);
          return <circle key={i} cx={x0 + Math.sin(i + t * 0.1) * 20} cy={(fuel ? 700 : 690) - kk * 300} r={20 + kk * 40} fill="#cfe9fb" opacity={0.7 * (1 - kk)} />;
        })}
        {fuel && (
          <g>
            <path d="M600 420 L1300 420 L1300 600" fill="none" stroke="#9fd3ff" strokeWidth={22} strokeDasharray="30 18" strokeDashoffset={-t * 4} />
            <rect x={1200} y={600} width={320} height={260} rx={20} fill="#9fb3a6" {...ink} />
            <path d={`M1300 600 q 30 ${-60 - Math.sin(t * 0.6) * 20} 60 0 q 30 ${-80 - Math.cos(t * 0.5) * 20} 60 0`} fill="#ff8a3c" stroke={INK} strokeWidth={5} />
            <T3 x={1360} y={940} size={56} color="#ffd23f">ENGINE</T3>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== one container slot = $10,000
const Slot: Tpl = ({ t }) => (
  <AbsoluteFill style={{ background: "#1f3a5f" }}>
    <Svg>
      {Array.from({ length: 480 }).map((_, i) => (
        <rect key={i} x={60 + (i % 40) * 46} y={140 + Math.floor(i / 40) * 26} width={42} height={22} fill={["#c94a3a", "#3a73b8", "#e0a23b", "#4f8a5b", "#8a5aa8"][i % 5]} opacity={0.25 + 0.5 * ramp(t, i / 40, i / 40 + 4)} />
      ))}
      <g transform={`translate(960 640) scale(${pop(t, 14)})`}>
        <rect x={-330} y={-150} width={660} height={300} fill="#e0a23b" {...ink} strokeWidth={10} />
        {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={-300 + i * 64} y1={-140} x2={-300 + i * 64} y2={140} stroke="#b47a1e" strokeWidth={8} />)}
      </g>
      <Tag t={t} x={1380} y={430} price="$10,000" sub="per slot" a0={20} />
    </Svg>
  </AbsoluteFill>
);

// ================================================================== submarine
const SubT: Tpl = ({ t, p }) => {
  const cut = p.cut === "1";
  const rise = cut ? 0 : interpolate(ramp(t, 0, 30), [0, 1], [120, 0]);
  return (
    <AbsoluteFill>
      <Svg>
        <Sky mood="dusk" horizon={520} />
        <Sea mood="dusk" horizon={520} t={t} />
        <g transform={`translate(260 ${640 + rise})`}><Sub w={1400} /></g>
        <Waterline x={200} y={640} width={1500} mood="dusk" t={t} horizon={520} />
        {cut && (
          <g>
            <rect x={760} y={640} width={260} height={110} rx={20} fill="#2b3440" stroke={INK} strokeWidth={5} />
            <circle cx={890} cy={695} r={40 + 6 * Math.sin(t * 0.3)} fill="#4fe08a" stroke={INK} strokeWidth={5} />
            <g transform="translate(1400 300)">
              <rect x={-150} y={-150} width={300} height={300} rx={22} fill="#f4f1e8" {...ink} strokeWidth={8} />
              <rect x={-150} y={-150} width={300} height={70} fill="#e8352b" stroke={INK} strokeWidth={8} />
              <text x={0} y={70} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={110} fill={INK}>{`YR ${1 + Math.min(32, Math.floor(t / 2))}`}</text>
            </g>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== $130 per kilo
const Kilo: Tpl = ({ t }) => (
  <AbsoluteFill style={{ background: PAPER }}>
    <Svg>
      <g transform={`translate(700 700) scale(${pop(t, 2)})`}>
        <path d="M-200 220 L-150 -60 L150 -60 L200 220 Z" fill="#596572" {...ink} strokeWidth={8} />
        <path d="M-70 -60 q 0 -120 70 -120 q 70 0 70 120" fill="none" stroke={INK} strokeWidth={28} />
        <text x={0} y={140} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={120} fill="#fff">1 kg</text>
      </g>
      <Tag t={t} x={1400} y={360} price="$130" sub="per kilogram" a0={14} />
      <g transform="translate(1100 1000) scale(0.4)" opacity={0.9}><CarrierArt w={1400} /></g>
    </Svg>
  </AbsoluteFill>
);

// ================================================================== 54 container ships for one carrier
const Fleet: Tpl = ({ t }) => {
  const n = Math.round(54 * ramp(t, 4, 44));
  return (
    <AbsoluteFill style={{ background: "#2f86c9" }}>
      <Svg>
        {Array.from({ length: 54 }).map((_, i) => i < n && (
          <g key={i} transform={`translate(${80 + (i % 6) * 300} ${200 + Math.floor(i / 6) * 95}) scale(${pop(t, 4 + i * 0.75)})`}><BoxShip w={260} name="" /></g>
        ))}
        <T3 x={1640} y={140} size={90} color="#ffd23f">{`× ${n}`}</T3>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== end card -> the "hiring a cargo ship" video
const EndHire: Tpl = ({ t, w }) => (
  <AbsoluteFill style={{ background: "#1f3a5f" }}>
    <Svg>
      <g transform="translate(960 540)" opacity={0.12}>{Array.from({ length: 16 }).map((_, i) => <path key={i} d="M0 0 L1400 -140 L1400 140 Z" fill="#fff" transform={`rotate(${i * 22.5 + t * 0.15})`} />)}</g>
      <g transform="translate(960 210)">
        <rect x={0} y={0} width={820} height={462} rx={24} fill="#2f86c9" {...ink} strokeWidth={8} />
        <g transform="translate(60 330)"><BoxShip w={700} name="" /></g>
        <T3 x={410} y={120} size={84} color="#ffd23f">$2.5 MILLION</T3>
        <T3 x={410} y={200} size={56}>JUST TO HIRE IT?!</T3>
      </g>
      <rect x={960} y={720} width={820} height={120} rx={60} fill="#e8352b" {...ink} transform={`translate(0 ${Math.sin(t * 0.2) * 4})`} />
      <T3 x={1370} y={805} size={64}>SUBSCRIBE</T3>
      <Actor a="point" t={t} x={480} y={1040} s={0.75} id="endhire" w={w} />
    </Svg>
  </AbsoluteFill>
);

export const TEMPLATES4: Record<string, Tpl> = {
  tag: TagT, pladder: PLadder, vsyacht: VsYacht, permetre: PerMetre, stack: Stack, factory: Factory,
  listing: Listing, cold: Cold, slot: Slot, sub: SubT, kilo: Kilo, fleet: Fleet, endhire: EndHire,
};
