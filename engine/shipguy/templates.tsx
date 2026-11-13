// The Ship Guy: scene templates. Each one draws a full 1920x1080 frame from (t = frame in beat,
// d = beat length in frames, p = key/value params from beats.txt). Only frame-driven animation.
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Flames, H, INK, Pose, Sea, Sky, SkyMood, Smoke, Stickman, Tanker, TinyWorker, W, Waterline } from "./art";
import { Attack, Caption, fontFamily, Push, ramp, Shipyard, Stopping, Svg, Upright } from "./scenes";
import { STAT_ICONS, StatX, TEMPLATES2 } from "./templates2";
import { TEMPLATES4 } from "./templates4";
import { TEMPLATES3 } from "./templates3";

export type P = Record<string, string>;
export type Tpl = React.FC<{ t: number; d: number; p: P; w?: number[][] }>; // w = spoken word spans (frames in the beat)
const txt = (s?: string) => (s ?? "").replace(/_/g, " ");
const num = (s: string | undefined, dflt = 0) => (s === undefined ? dflt : Number(s));
const ink = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const Text: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; color?: string; anchor?: "start" | "middle" | "end"; o?: number }> = ({ x, y, size, children, color = "#fff", anchor = "middle", o = 1 }) => (
  <text x={x} y={y} fontFamily={fontFamily} fontWeight={700} fontSize={size} fill={color} textAnchor={anchor}
    stroke={INK} strokeWidth={size * 0.14} paintOrder="stroke" strokeLinejoin="round" opacity={o}>{children}</text>
);

const RedX: React.FC<{ x: number; y: number; s?: number; p: number }> = ({ x, y, s = 1, p }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * p)})`} opacity={p}>
    <path d="M-60 -60 L60 60 M60 -60 L-60 60" stroke={INK} strokeWidth={34} strokeLinecap="round" />
    <path d="M-60 -60 L60 60 M60 -60 L-60 60" stroke="#e8352b" strokeWidth={20} strokeLinecap="round" />
  </g>
);

const Rays: React.FC<{ t: number; color: string }> = ({ t, color }) => (
  <g transform={`translate(${W / 2} ${H / 2}) rotate(${t * 0.15})`} opacity={0.12}>
    {Array.from({ length: 16 }).map((_, i) => (
      <path key={i} d="M0 0 L1400 -140 L1400 140 Z" fill={color} transform={`rotate(${i * 22.5})`} />
    ))}
  </g>
);

const BG: Record<string, string> = { navy: "#1f3a5f", red: "#a83a33", teal: "#1f7a78", sand: "#e9dcc0" };

// ------------------------------------------------------------------ ship at sea (the workhorse)
const SeaT: Tpl = ({ t, d, p }) => {
  const mood = (p.mood ?? "day") as SkyMood;
  const cam = p.cam ?? "wide";
  const state = p.state ?? "normal";
  const horizon = cam === "far" ? 560 : 600;
  const sc = cam === "close" ? 2.3 : cam === "far" ? 0.62 : 1.2;
  const sailing = p.wake === "1" || p.tugs === "1";
  const drift = sailing ? t * 0.6 : Math.sin(t * 0.03) * 6;
  const x0 = cam === "close" ? -120 : cam === "far" ? 640 : 360;
  const shipX = x0 + drift;
  const deckY = cam === "close" ? 600 : cam === "far" ? 610 : 640;
  const bob = Math.sin(t * 0.08) * 3;
  const fire = state === "fire";
  const burnt = state === "burnt" || fire;
  const fl = ramp(t, 0, 20);
  return (
    <Push t={t} from={1} to={cam === "close" ? 1.08 : 1.04} ox="55% 60%">
      <Svg>
        <Sky mood={mood} horizon={horizon} />
        <Sea mood={mood} horizon={horizon} t={t} />
        {p.island === "1" && (
          <path d={`M1250 ${horizon} q 120 -90 260 -60 q 90 -40 200 10 q 60 20 210 50 Z`} fill={mood === "dusk" ? "#3d3350" : "#6c8c5a"} stroke={INK} strokeWidth={4} />
        )}
        {p.fleet === "1" && [[180, 0.22], [520, 0.18], [1180, 0.2], [1500, 0.16], [1720, 0.24]].map(([x, s], i) => (
          <g key={i} transform={`translate(${x + t * 0.2 * (i % 2 ? 1 : -1)} ${horizon - 6}) scale(${s})`}><Tanker /></g>
        ))}
        {fire && <Smoke x={shipX + 560 * sc} y={deckY - 20} t={t} size={cam === "close" ? 1.6 : 1.1} lean={-1} />}
        {fire && <Smoke x={shipX + 300 * sc} y={deckY - 20} t={t + 70} size={cam === "close" ? 1.2 : 0.8} lean={-1} />}
        {state === "burnt" && <Smoke x={shipX + 500 * sc} y={deckY - 10} t={t} size={0.5} lean={-1} dark={false} />}
        {p.tugs === "1" && (
          <g>
            <line x1={shipX + 1010 * sc} y1={deckY + 10} x2={shipX + 1010 * sc + 220} y2={deckY + 70} stroke={INK} strokeWidth={4} />
            <g transform={`translate(${shipX + 1010 * sc + 220} ${deckY + 40 + bob})`}><Tug /></g>
          </g>
        )}
        <g transform={`translate(${shipX} ${deckY + bob}) scale(${sc})`}>
          <Tanker burnt={burnt} name={txt(p.name) || undefined} />
          {p.flags === "1" && <Bunting />}
        </g>
        {fire && <Flames x={shipX + 380 * sc} y={deckY - 10} width={460 * sc * fl + 10} height={(cam === "close" ? 200 : 120) * fl + 5} t={t} />}
        <Waterline x={shipX} y={deckY + bob + 86 * (sc / 1.2) * (cam === "close" ? 0.95 : 1)} width={1015 * sc} mood={mood} t={t} horizon={horizon} />
        {sailing && <BowWave x={shipX + 1005 * sc} y={deckY + bob + 86 * (sc / 1.2)} t={t} s={sc} />}
        {fire && <Flames x={shipX + 200 * sc} y={deckY + 100 * (sc / 1.2) + bob} width={760 * sc * fl + 10} height={80 * fl + 5} t={t} seed={3} />}
        {p.anchor === "1" && <line x1={shipX + 960 * sc} y1={deckY + 20} x2={shipX + 1040 * sc} y2={H} stroke={INK} strokeWidth={6} strokeDasharray="10 8" />}
      </Svg>
      {p.pose && <Stickman pose={p.pose as Pose} x={1440} y={1110} height={460} bob={Math.sin(t * 0.2) * 4} />}
      {p.stamp && <Stamp text={txt(p.stamp)} p={ramp(t, d * 0.15, d * 0.15 + 8)} />}
    </Push>
  );
};

const Tug: React.FC = () => (
  <g transform="scale(0.9)">
    <path d="M-80 0 L80 0 L60 34 L-70 34 Z" fill="#d94a3a" {...ink} strokeWidth={5} />
    <rect x={-40} y={-40} width={60} height={40} fill="#f4f1e8" {...ink} strokeWidth={5} />
    <rect x={-20} y={-66} width={18} height={26} fill="#e0a12a" {...ink} strokeWidth={4} />
  </g>
);

const Bunting: React.FC = () => (
  <g>
    <path d="M128 -165 Q540 -60 950 -60" fill="none" stroke={INK} strokeWidth={2} />
    {Array.from({ length: 18 }).map((_, i) => {
      const k = i / 17;
      const x = 128 + (950 - 128) * k;
      const y = -165 + 105 * Math.sin(k * Math.PI / 2) + (k > 0.5 ? 0 : 0);
      return <path key={i} d={`M${x - 8} ${y} L${x + 8} ${y} L${x} ${y + 16} Z`} fill={["#e8352b", "#ffd23f", "#3b8fd9", "#4fb06a"][i % 4]} />;
    })}
  </g>
);

const BowWave: React.FC<{ x: number; y: number; t: number; s: number }> = ({ x, y, t, s }) => (
  <g opacity={0.9}>
    {[0, 1, 2].map((i) => {
      const k = ((t * 0.04 + i / 3) % 1);
      return <path key={i} d={`M${x - 10} ${y} q ${40 * s * (0.5 + k)} ${-18 * s} ${90 * s * (0.5 + k)} ${6 * s}`} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={1 - k} />;
    })}
  </g>
);

const Stamp: React.FC<{ text: string; p: number }> = ({ text, p }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", opacity: p, transform: `rotate(-8deg) scale(${2 - p})` }}>
    <span style={{ fontFamily, fontWeight: 700, fontSize: 150, color: "#e8352b", border: "14px solid #e8352b", padding: "6px 40px", borderRadius: 24, background: "rgba(255,255,255,0.85)", letterSpacing: 4 }}>{text}</span>
  </div>
);

// ------------------------------------------------------------------ talking stick figure on a colour card
const Talk: Tpl = ({ t, p }) => {
  const bg = BG[p.bg ?? "navy"] ?? BG.navy;
  return (
    <AbsoluteFill style={{ background: bg }}>
      <Svg><Rays t={t} color="#ffffff" /></Svg>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.02 * Math.sin(t * 0.05)})` }}>
        <Stickman pose={(p.pose ?? "saying") as Pose} x={W / 2 - 280} y={1040} height={820} bob={Math.sin(t * 0.18) * 5} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ name card (person intro)
const Card: Tpl = ({ t, p }) => {
  const a = ramp(t, 4, 16);
  return (
    <AbsoluteFill style={{ background: BG.teal }}>
      <Svg><Rays t={t} color="#ffffff" /></Svg>
      <Stickman pose={(p.pose ?? "confident") as Pose} x={170} y={1040} height={760} />
      <div style={{ position: "absolute", left: 820, top: 330, width: 950, padding: "50px 60px", background: "#fff", border: `8px solid ${INK}`, borderRadius: 30,
        transform: `translateX(${(1 - a) * 300}px)`, opacity: a, boxShadow: "0 14px 0 rgba(0,0,0,0.25)" }}>
        <div style={{ fontFamily, fontWeight: 700, fontSize: 120, color: INK, lineHeight: 1 }}>{txt(p.title)}</div>
        <div style={{ fontFamily, fontWeight: 600, fontSize: 56, color: "#1f7a78", marginTop: 20 }}>{txt(p.sub)}</div>
        <div style={{ fontFamily, fontWeight: 600, fontSize: 44, color: "#777", marginTop: 8 }}>Hong Kong</div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ canals it cannot use
const Gates: Tpl = ({ t, d }) => {
  const items = [
    { name: "SUEZ CANAL", why: "too deep" },
    { name: "PANAMA CANAL", why: "too wide" },
    { name: "ENGLISH CHANNEL", why: "too deep (loaded)" },
  ];
  return (
    <AbsoluteFill style={{ background: "#d9c9a3" }}>
      <Svg>
        {items.map((it, i) => {
          const cx = 320 + i * 640;
          const a = ramp(t, 4 + i * 6, 14 + i * 6);
          const x = ramp(t, d * (0.22 + i * 0.22), d * (0.22 + i * 0.22) + 8);
          const shipY = interpolate(t, [0, d], [880, 640], { extrapolateRight: "clamp" });
          return (
            <g key={i} opacity={a}>
              <rect x={cx - 290} y={140} width={580} height={800} rx={30} fill="#8cbf6a" {...ink} />
              <rect x={cx - (i === 1 ? 90 : 150)} y={146} width={i === 1 ? 180 : 300} height={788} fill="#4f9fd8" />
              {i === 1 && <><rect x={cx - 110} y={420} width={20} height={200} fill="#a6a6a0" {...ink} strokeWidth={4} /><rect x={cx + 90} y={420} width={20} height={200} fill="#a6a6a0" {...ink} strokeWidth={4} /></>}
              {/* ship from above, nosing in */}
              <g transform={`translate(${cx} ${shipY})`}>
                <path d="M-100 260 L-100 -40 Q-100 -150 0 -190 Q100 -150 100 -40 L100 260 Z" fill="#b8322a" {...ink} strokeWidth={5} />
                <rect x={-70} y={190} width={140} height={50} fill="#f4f1e8" {...ink} strokeWidth={4} />
              </g>
              <Text x={cx} y={110} size={54}>{it.name}</Text>
              <RedX x={cx} y={560} s={1.6} p={x} />
              <Text x={cx} y={1010} size={46} color="#ffd23f" o={x}>{it.why}</Text>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the names timeline
const Names: Tpl = ({ t, d }) => {
  const names: [string, string][] = [["SEAWISE GIANT", "1979"], ["HAPPY GIANT", "1991"], ["JAHRE VIKING", "1991"], ["KNOCK NEVIS", "2004"], ["MONT", "2009"]];
  return (
    <AbsoluteFill style={{ background: BG.navy }}>
      <Svg>
        <Rays t={t} color="#ffffff" />
        <line x1={120} y1={600} x2={1800} y2={600} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
        {names.map(([n, y], i) => {
          const cx = 210 + i * 375;
          const a = ramp(t, d * 0.25 + i * 10, d * 0.25 + i * 10 + 8);
          return (
            <g key={i} opacity={i === 0 ? 1 : a} transform={`translate(${cx} 600) scale(${i === 0 ? 1 : 0.7 + 0.3 * a})`}>
              <circle r={22} fill={i === 0 ? "#ffd23f" : "#fff"} {...ink} />
              <g transform="translate(-150 -200) scale(0.3)"><Tanker burnt={false} /></g>
              <Text x={0} y={-250} size={i === 0 ? 46 : 40}>{n}</Text>
              <Text x={0} y={90} size={52} color="#ffd23f">{y}</Text>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the bridge (inside)
const Bridge: Tpl = ({ t, p }) => {
  const shake = p.shake === "1";
  const sx = shake ? Math.sin(t * 2.1) * 9 : 0;
  const sy = shake ? Math.cos(t * 2.7) * 6 : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.03)` }}>
      <Svg>
        <rect x={0} y={0} width={W} height={H} fill="#cfd6db" />
        <defs><clipPath id="win"><rect x={120} y={110} width={1680} height={430} rx={12} /></clipPath></defs>
        <g clipPath="url(#win)">
          <Sky mood="day" horizon={400} />
          <Sea mood="day" horizon={400} t={t * 3} />
          <g transform="translate(300 420) scale(1.6)"><path d="M0 0 L900 0 Q1000 0 1040 60 L0 60 Z" fill="#4f8a5b" stroke={INK} strokeWidth={4} /></g>
        </g>
        {[120, 540, 960, 1380].map((x) => <rect key={x} x={x} y={110} width={420} height={430} fill="none" stroke={INK} strokeWidth={14} />)}
        {/* console */}
        <path d="M0 760 L1920 760 L1920 1080 L0 1080 Z" fill="#596572" />
        <path d="M0 700 L1920 700 L1920 780 L0 780 Z" fill="#76828f" {...ink} />
        {[300, 520, 1240, 1460].map((x, i) => (
          <g key={x} transform={`translate(${x} 740)`}>
            <circle r={44} fill="#f4f1e8" {...ink} strokeWidth={5} />
            <line x1={0} y1={0} x2={Math.cos(t * (shake ? 0.9 : 0.05) + i) * 34} y2={Math.sin(t * (shake ? 0.9 : 0.05) + i) * 34} stroke="#e8352b" strokeWidth={5} />
          </g>
        ))}
        {/* throttle lever */}
        <g transform={`translate(1700 760) rotate(${shake ? 30 : 30 * Math.min(1, t / 20)})`}>
          <rect x={-10} y={-150} width={20} height={150} fill="#333" />
          <circle cx={0} cy={-150} r={26} fill="#e8352b" {...ink} strokeWidth={5} />
        </g>
        {/* mugs jump when shaking */}
        {[880, 1010].map((x, i) => (
          <g key={x} transform={`translate(${x} ${700 - (shake ? Math.abs(Math.sin(t * 1.3 + i)) * 26 : 0)}) rotate(${shake ? Math.sin(t + i) * 14 : 0})`}>
            <rect x={-26} y={-60} width={52} height={60} rx={6} fill="#fff" {...ink} strokeWidth={5} />
            <path d="M26 -46 q 22 0 22 18 q 0 18 -22 18" fill="none" stroke={INK} strokeWidth={5} />
          </g>
        ))}
      </Svg>
      <Stickman pose={(p.pose ?? "scared") as Pose} x={560} y={1090} height={560} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ alone at the dock
const Dock: Tpl = ({ t, p }) => (
  <Push t={t} from={1.02} to={1.06} ox="40% 60%">
    <Svg>
      <Sky mood="grey" horizon={620} />
      <Sea mood="grey" horizon={620} t={t * 0.4} />
      <g transform={`translate(260 640) scale(1.15)`}><Tanker name={txt(p.name) || undefined} /></g>
      <Waterline x={260} y={640 + 86 * 0.96} width={1015 * 1.15} mood="grey" t={t * 0.4} horizon={620} />
      {/* quay */}
      <path d="M0 860 L1920 860 L1920 1080 L0 1080 Z" fill="#8f8f88" {...ink} />
      {[200, 700, 1200, 1700].map((x) => <rect key={x} x={x} y={830} width={40} height={30} fill="#3a3a3a" />)}
      {/* gulls */}
      {[0, 1, 2].map((i) => {
        const x = (300 + i * 260 + t * (1.2 + i * 0.3)) % 2000;
        const y = 200 + i * 60 + Math.sin(t * 0.1 + i) * 10;
        return <path key={i} d={`M${x - 20} ${y} q 10 -14 20 0 q 10 -14 20 0`} fill="none" stroke={INK} strokeWidth={4} />;
      })}
      {p.name && (
        <g transform={`translate(1560 860) rotate(-4)`} opacity={ramp(t, 10, 20)}>
          <line x1={0} y1={0} x2={0} y2={-150} stroke={INK} strokeWidth={8} />
          <rect x={-130} y={-260} width={260} height={120} rx={12} fill="#fff" {...ink} />
          <Text x={0} y={-180} size={64} color="#e8352b">SOLD</Text>
        </g>
      )}
    </Svg>
  </Push>
);

// ------------------------------------------------------------------ bigger ship = cheaper oil
const Cheaper: Tpl = ({ t }) => {
  const sizes = [0.28, 0.42, 0.6];
  const tags = ["$$$", "$$", "$"];
  return (
    <AbsoluteFill style={{ background: "#e9dcc0" }}>
      <Svg>
        <rect x={0} y={760} width={W} height={320} fill="#4f9fd8" />
        {sizes.map((s, i) => {
          const cx = [330, 900, 1500][i];
          const a = ramp(t, i * 14, i * 14 + 10);
          return (
            <g key={i} opacity={a}>
              <g transform={`translate(${cx - 500 * s} 760) scale(${s})`}><Tanker /></g>
              {Array.from({ length: (i + 1) * 3 }).map((_, k) => (
                <g key={k} transform={`translate(${cx - 120 + (k % 6) * 46} ${600 - Math.floor(k / 6) * 64 - 120 * s})`}><Barrel s={0.5} /></g>
              ))}
              <g transform={`translate(${cx} 300)`}>
                <rect x={-110} y={-60} width={220} height={110} rx={18} fill="#fff" {...ink} />
                <Text x={0} y={22} size={70} color={i === 2 ? "#3fae5a" : "#e8352b"}>{tags[i]}</Text>
              </g>
              <Text x={cx} y={180} size={36}>per barrel</Text>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

const Barrel: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-40} y={-110} width={80} height={110} rx={12} fill="#2f6fb0" {...ink} strokeWidth={5} />
    <line x1={-40} y1={-75} x2={40} y2={-75} stroke={INK} strokeWidth={5} />
    <line x1={-40} y1={-35} x2={40} y2={-35} stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={-110} rx={40} ry={9} fill="#3f86c9" stroke={INK} strokeWidth={4} />
  </g>
);

// ------------------------------------------------------------------ jumboisation: cut, insert, count
const Lengthen: Tpl = ({ t, d, p }) => {
  const phase = num(p.phase, 1);
  const gap = phase === 1 ? 0 : phase === 2 ? 200 * ramp(t, 10, 50) : 200;
  const drop = phase === 2 ? interpolate(ramp(t, 40, 80), [0, 1], [-520, 0]) : 0;
  const sc = 1.25;
  const total = 1012 + gap;
  const x0 = (W - total * sc) / 2;
  const deckY = 640;
  const cutP = phase === 1 ? ramp(t, d * 0.5, d * 0.5 + 25) : 1;
  const count = Math.round(146152 * ramp(t, 4, 40));
  return (
    <Push t={t} from={1} to={1.03}>
      <Svg>
        <Sky mood="day" horizon={600} />
        <rect x={0} y={600} width={W} height={480} fill="#9a9a94" />
        <line x1={0} y1={600} x2={W} y2={600} stroke={INK} strokeWidth={5} />
        <defs>
          <clipPath id="stern"><rect x={-60} y={-260} width={560} height={420} /></clipPath>
          <clipPath id="bow"><rect x={500} y={-260} width={600} height={420} /></clipPath>
        </defs>
        <g transform={`translate(${x0} ${deckY}) scale(${sc})`}>
          <g clipPath="url(#stern)"><Tanker /></g>
          <g transform={`translate(${gap} 0)`}><g clipPath="url(#bow)"><Tanker /></g></g>
          {phase === 1 && <line x1={500} y1={-30} x2={500} y2={-30 + 170 * cutP} stroke="#ffd23f" strokeWidth={8} strokeDasharray="14 10" />}
          {phase >= 2 && gap > 0 && (
            <g transform={`translate(500 ${drop})`}>
              <rect x={0} y={0} width={200} height={130} fill="#2b3d63" />
              <rect x={0} y={78} width={200} height={52} fill="#cf3b31" />
              <rect x={0} y={-10} width={200} height={10} fill="#5aa368" />
              <rect x={0} y={-10} width={200} height={140} fill="none" stroke={phase === 3 ? "#ffd23f" : INK} strokeWidth={phase === 3 ? 10 : 5} />
              {phase === 2 && <line x1={100} y1={-10} x2={100} y2={-400} stroke={INK} strokeWidth={4} />}
            </g>
          )}
        </g>
        {phase === 1 && cutP > 0 && cutP < 1 && Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={x0 + 500 * sc + Math.cos(i + t) * 30} cy={deckY - 30 + 170 * sc * cutP + Math.sin(i * 2 + t) * 30} r={5} fill="#ffd23f" />
        ))}
        {[300, 1500].map((x, i) => <TinyWorker key={x} x={x + Math.sin(t * 0.05 + i) * 20} y={900} s={1.3} wave={i === 1} />)}
      </Svg>
      {phase === 3 && <Caption text={`[+${count.toLocaleString("en-US")}] TONNES`} y={110} size={110} pop={ramp(t, 2, 10)} />}
      {phase === 1 && <Caption text="CUT IT IN [HALF]" y={110} size={100} pop={ramp(t, d * 0.5, d * 0.5 + 8)} />}
      {phase === 2 && <Caption text="ADD A [NEW SECTION]" y={110} size={100} pop={ramp(t, 40, 50)} />}
    </Push>
  );
};

// ------------------------------------------------------------------ the added piece > a whole tanker
const MoreThan: Tpl = ({ t }) => (
  <AbsoluteFill style={{ background: "#e9dcc0" }}>
    <Svg>
      <g transform={`translate(250 520) scale(${1.8 * (0.8 + 0.2 * ramp(t, 0, 10))})`}>
        <rect x={0} y={0} width={200} height={130} fill="#2b3d63" />
        <rect x={0} y={78} width={200} height={52} fill="#cf3b31" />
        <rect x={0} y={-10} width={200} height={140} fill="none" stroke="#ffd23f" strokeWidth={6} />
      </g>
      <Text x={430} y={880} size={48}>THE ADDED PIECE</Text>
      <Text x={960} y={700} size={200} color="#ffd23f" o={ramp(t, 14, 22)}>&gt;</Text>
      <g opacity={ramp(t, 8, 18)} transform="translate(1150 640) scale(0.62)"><Tanker /></g>
      <Text x={1460} y={880} size={48} o={ramp(t, 8, 18)}>A WHOLE NORMAL TANKER</Text>
    </Svg>
  </AbsoluteFill>
);

// ------------------------------------------------------------------ football fields
const Fields: Tpl = ({ t, p }) => {
  const n = num(p.n, 4.5);
  const deck = p.deck === "1";
  const shipPx = 1700;
  const fieldPx = deck ? shipPx / 4.4 : shipPx * (100 / 458);
  const x0 = 110;
  const pitch = (x: number, y: number, w: number, h: number, a: number, key: number) => (
    <g key={key} opacity={a}>
      <rect x={x} y={y} width={w} height={h} fill="#4fb06a" stroke="#fff" strokeWidth={5} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#fff" strokeWidth={4} />
      <circle cx={x + w / 2} cy={y + h / 2} r={h * 0.18} fill="none" stroke="#fff" strokeWidth={4} />
      <rect x={x} y={y + h * 0.25} width={w * 0.12} height={h * 0.5} fill="none" stroke="#fff" strokeWidth={4} />
      <rect x={x + w * 0.88} y={y + h * 0.25} width={w * 0.12} height={h * 0.5} fill="none" stroke="#fff" strokeWidth={4} />
    </g>
  );
  if (deck) {
    const y = 380, h = fieldPx * (68 / 105);
    return (
      <AbsoluteFill style={{ background: "#2f86c9" }}>
        <Svg>
          <path d={`M${x0} ${y - 40} L${x0 + shipPx - 120} ${y - 40} Q${x0 + shipPx + 40} ${y + h / 2} ${x0 + shipPx - 120} ${y + h + 40} L${x0} ${y + h + 40} Z`} fill="#24314f" {...ink} />
          {Array.from({ length: 4 }).map((_, i) => pitch(x0 + 20 + i * fieldPx, y, fieldPx - 10, h, ramp(t, 8 + i * 8, 16 + i * 8), i))}
          <Text x={960} y={y + h + 160} size={64} color="#ffd23f" o={ramp(t, 40, 50)}>4 FOOTBALL PITCHES</Text>
        </Svg>
      </AbsoluteFill>
    );
  }
  const y = 660;
  return (
    <AbsoluteFill style={{ background: "#87c6ef" }}>
      <Svg>
        <rect x={0} y={y + 10} width={W} height={H - y} fill="#3f9a57" />
        {Array.from({ length: Math.ceil(n) }).map((_, i) => {
          const w = i < Math.floor(n) ? fieldPx - 8 : fieldPx * (n - Math.floor(n)) - 8;
          return pitch(x0 + i * fieldPx, y + 60, w, 260, ramp(t, 10 + i * 8, 18 + i * 8), i);
        })}
        <g transform={`translate(${x0} ${y - 150 + 50 * (1 - ramp(t, 0, 14))}) scale(${shipPx / 1012})`} opacity={ramp(t, 0, 10)}>
          <Tanker />
        </g>
        <line x1={x0} y1={y + 360} x2={x0 + shipPx} y2={y + 360} stroke="#ffd23f" strokeWidth={8} />
        <Text x={x0 + shipPx / 2} y={y + 300} size={56} o={ramp(t, 50, 60)}>{`${n} football fields`}</Text>
      </Svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 20-lane highway across the deck
const Highway: Tpl = ({ t }) => {
  const y0 = 200, hgt = 700;
  const lanes = 20;
  const lh = hgt / lanes;
  return (
    <AbsoluteFill style={{ background: "#2f86c9" }}>
      <Svg>
        <rect x={-20} y={y0 - 30} width={W + 40} height={hgt + 60} fill="#24314f" {...ink} />
        <rect x={-20} y={y0} width={W + 40} height={hgt} fill="#4a4a4f" />
        {Array.from({ length: lanes - 1 }).map((_, i) => (
          <line key={i} x1={0} y1={y0 + (i + 1) * lh} x2={W} y2={y0 + (i + 1) * lh} stroke="#fff" strokeWidth={3} strokeDasharray="30 24" opacity={ramp(t, i * 1.5, i * 1.5 + 6)} />
        ))}
        {Array.from({ length: 40 }).map((_, i) => {
          const lane = i % lanes;
          const dir = lane < lanes / 2 ? 1 : -1;
          const speed = 4 + (i % 5);
          const x = ((i * 397 + t * speed * dir) % (W + 200) + W + 200) % (W + 200) - 100;
          return (
            <rect key={i} x={x} y={y0 + lane * lh + 6} width={60} height={lh - 12} rx={6}
              fill={["#e8352b", "#ffd23f", "#f4f1e8", "#4fb06a", "#3b8fd9"][i % 5]} stroke={INK} strokeWidth={2} opacity={ramp(t, 20, 30)} />
          );
        })}
        <line x1={1860} y1={y0} x2={1860} y2={y0 + hgt} stroke="#ffd23f" strokeWidth={8} />
        <Text x={1700} y={y0 + hgt + 120} size={56} color="#ffd23f">20 LANES</Text>
      </Svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ cross-section: 25 m draft = 8 storeys
const Cross: Tpl = ({ t }) => {
  const wl = 380;
  const m = 14; // px per metre
  const depth = 24.6 * m;
  const width = 68.6 * m;
  const x0 = 170;
  const sink = ramp(t, 4, 40);
  return (
    <AbsoluteFill>
      <Svg>
        <Sky mood="day" horizon={wl} />
        <rect x={0} y={wl} width={W} height={H - wl} fill="#2f86c9" />
        <rect x={0} y={wl + depth + 40} width={W} height={H} fill="#1d5f93" />
        {/* hull section */}
        <path d={`M${x0} ${wl - 70} L${x0} ${wl + depth - 40} Q${x0} ${wl + depth} ${x0 + 40} ${wl + depth} L${x0 + width - 40} ${wl + depth} Q${x0 + width} ${wl + depth} ${x0 + width} ${wl + depth - 40} L${x0 + width} ${wl - 70} Z`} fill="#24314f" {...ink} />
        <rect x={x0 + 6} y={wl} width={width - 12} height={depth - 6} fill="#b8322a" opacity={0.85} />
        <rect x={0} y={wl} width={W} height={depth} fill="#2f86c9" opacity={0.35} />
        <line x1={0} y1={wl} x2={W} y2={wl} stroke="#fff" strokeWidth={5} />
        {/* building sinking in */}
        <g transform={`translate(1360 ${wl + depth * sink - 8 * 3 * m})`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i}>
              <rect x={0} y={i * 3 * m} width={260} height={3 * m} fill={i % 2 ? "#e0c79a" : "#edd8ae"} stroke={INK} strokeWidth={4} />
              {[30, 100, 170].map((x) => <rect key={x} x={x} y={i * 3 * m + 10} width={50} height={3 * m - 20} fill="#3b6ea5" />)}
            </g>
          ))}
        </g>
        <line x1={1720} y1={wl} x2={1720} y2={wl + depth} stroke="#ffd23f" strokeWidth={8} />
        <Text x={1790} y={wl + depth / 2 + 20} size={60} color="#ffd23f">25 m</Text>
        <Text x={1490} y={wl + depth + 110} size={48} o={ramp(t, 40, 50)}>8 STOREYS</Text>
      </Svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ big animated number
const Stat: Tpl = ({ t, p }) => {
  const target = num(p.num, 0);
  const decimals = (p.num ?? "").includes(".") ? 1 : 0;
  const v = target * ramp(t, 4, 34);
  const shown = decimals ? v.toFixed(1) : Math.round(v).toLocaleString("en-US");
  const icon = p.icon ?? "barrel";
  return (
    <AbsoluteFill style={{ background: BG.navy }}>
      <Svg>
        <Rays t={t} color="#ffffff" />
        <g transform={`translate(480 560) scale(${0.9 + 0.1 * ramp(t, 0, 12)})`}>
          {icon === "barrel" && <g transform="translate(0 150) scale(2.6)"><Barrel /></g>}
          {icon === "weight" && (
            <g>
              <path d="M-160 160 L-120 -80 L120 -80 L160 160 Z" fill="#596572" {...ink} />
              <path d="M-60 -80 q 0 -90 60 -90 q 60 0 60 90" fill="none" stroke={INK} strokeWidth={22} />
              <text x={0} y={90} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={130} fill="#fff">t</text>
            </g>
          )}
          {icon === "speed" && (
            <g>
              <path d="M-200 80 A 200 200 0 0 1 200 80" fill="#f4f1e8" {...ink} strokeWidth={8} />
              {Array.from({ length: 9 }).map((_, i) => {
                const a = Math.PI + (i / 8) * Math.PI * 0.9 + 0.15;
                return <line key={i} x1={Math.cos(a) * 160} y1={80 + Math.sin(a) * 160} x2={Math.cos(a) * 190} y2={80 + Math.sin(a) * 190} stroke={INK} strokeWidth={6} />;
              })}
              <line x1={0} y1={80} x2={Math.cos(Math.PI + 0.3 + 1.1 * ramp(t, 4, 34)) * 160} y2={80 + Math.sin(Math.PI + 0.3 + 1.1 * ramp(t, 4, 34)) * 160} stroke="#e8352b" strokeWidth={12} strokeLinecap="round" />
              <circle cx={0} cy={80} r={18} fill={INK} />
            </g>
          )}
          {icon === "money" && [0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${-20 + i * 14} ${60 - i * 46})`}>
              <rect x={-170} y={-50} width={340} height={100} rx={10} fill="#5fb36d" {...ink} strokeWidth={5} />
              <circle r={32} fill="#8fd39b" stroke={INK} strokeWidth={4} />
              <text x={0} y={16} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={46} fill={INK}>$</text>
            </g>
          ))}
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 860, top: 330, fontFamily, fontWeight: 700, lineHeight: 1, WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill" }}>
        <div style={{ fontSize: 210, color: "#ffd23f" }}>{p.pre ?? ""}{shown}{p.plus === "1" ? "+" : ""}</div>
        <div style={{ fontSize: 110, color: "#fff", marginTop: 10 }}>{txt(p.unit)}</div>
        <div style={{ fontSize: 60, color: "#cfe3ff", marginTop: 20, WebkitTextStroke: `9px ${INK}` }}>{txt(p.label)}</div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ rudder + propeller in dry dock
const Propeller: Tpl = ({ t, d }) => {
  const r1 = ramp(t, 6, 14);
  const r2 = ramp(t, d * 0.5, d * 0.5 + 8);
  const spin = t * 0.4;
  return (
    <Push t={t} from={1.05} to={1}>
      <Svg>
        <rect x={0} y={0} width={W} height={H} fill="#b9c4cc" />
        <rect x={0} y={960} width={W} height={120} fill="#8f8f88" />
        <line x1={0} y1={960} x2={W} y2={960} stroke={INK} strokeWidth={6} />
        {/* hull underside + stern */}
        <path d="M-20 -20 L1560 -20 Q1600 140 1520 300 L1460 300 Q1250 330 1000 330 L-20 330 Z" fill="#b8322a" {...ink} />
        {/* shaft + propeller */}
        <rect x={900} y={505} width={220} height={36} fill="#7a6a4a" {...ink} strokeWidth={5} />
        <g transform={`translate(1090 523)`}>
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={0} cy={-120} rx={70} ry={130} fill="#d9a441" {...ink} strokeWidth={5} transform={`rotate(${i * 90 + spin * 10})`} />
          ))}
          <circle r={50} fill="#c8902e" {...ink} strokeWidth={5} />
        </g>
        {/* rudder */}
        <rect x={1360} y={300} width={170} height={540} rx={20} fill="#b8322a" {...ink} />
        <rect x={1430} y={250} width={30} height={60} fill="#7a7a7a" {...ink} strokeWidth={4} />
        <TinyWorker x={760} y={958} s={2.2} />
      </Svg>
      <Stickman pose="shocked" x={420} y={970} height={300} />
      <div style={{ position: "absolute", left: 1560, top: 640, opacity: r1, transform: `scale(${0.8 + 0.2 * r1})` }}>
        <Tag a="RUDDER" b="230 t" />
      </div>
      <div style={{ position: "absolute", left: 820, top: 120, opacity: r2, transform: `scale(${0.8 + 0.2 * r2})` }}>
        <Tag a="PROPELLER" b="50 t" />
      </div>
    </Push>
  );
};

const Tag: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <div style={{ fontFamily, fontWeight: 700, lineHeight: 1, WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill" }}>
    <div style={{ fontSize: 56, color: "#fff" }}>{a}</div>
    <div style={{ fontSize: 96, color: "#ffd23f" }}>{b}</div>
  </div>
);

// ------------------------------------------------------------------ turning circle from above
const Turning: Tpl = ({ t, d }) => {
  const cx = 1080, cy = 560, r = 350;
  const a = -Math.PI / 2 + Math.PI * 2 * ramp(t, 6, Math.max(30, d - 10));
  const sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r;
  const shipLen = (458 / 3000) * 2 * r;
  return (
    <AbsoluteFill style={{ background: "#2f86c9" }}>
      <Svg>
        {/* coast with city */}
        <path d="M0 0 L420 0 Q360 300 440 560 Q520 820 380 1080 L0 1080 Z" fill="#d8ccb2" {...ink} />
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x={30 + (i % 4) * 80} y={60 + Math.floor(i / 4) * 160} width={60} height={60} rx={6} fill="#e9dfc9" stroke="#c9bda4" strokeWidth={3} />
        ))}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="22 16" />
        <path d={`M${cx} ${cy - r} A ${r} ${r} 0 ${a + Math.PI / 2 > Math.PI ? 1 : 0} 1 ${sx} ${sy}`} fill="none" stroke="#ffd23f" strokeWidth={14} strokeLinecap="round" />
        <g transform={`translate(${sx} ${sy}) rotate(${(a * 180) / Math.PI + 90})`}>
          <path d={`M${-shipLen / 2} -11 L${shipLen * 0.35} -11 Q${shipLen / 2} 0 ${shipLen * 0.35} 11 L${-shipLen / 2} 11 Z`} fill="#b8322a" stroke={INK} strokeWidth={4} />
        </g>
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#fff" strokeWidth={5} />
        <Text x={cx} y={cy - 20} size={80} color="#ffd23f">3 km</Text>
      </Svg>
      <Caption text="TO TURN [AROUND]" y={950} size={80} pop={ramp(t, 2, 10)} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ tanker war: burning ships on the horizon
const War: Tpl = ({ t, p }) => {
  const ships: [number, number, boolean][] = p.fleet === "1"
    ? [[120, 0.32, true], [620, 0.22, false], [1000, 0.28, true], [1450, 0.24, true]]
    : [[300, 0.3, true], [1200, 0.26, true]];
  return (
    <Push t={t} from={1} to={1.05}>
      <Svg>
        <Sky mood="dusk" horizon={640} />
        <Sea mood="dusk" horizon={640} t={t} />
        {ships.map(([x, s, burning], i) => (
          <g key={i}>
            {burning && <Smoke x={x + 600 * s} y={636} t={t + i * 40} size={0.5 + s} lean={-1} />}
            <g transform={`translate(${x} ${646}) scale(${s})`}><Tanker burnt={burning} /></g>
            {burning && <Flames x={x + 400 * s} y={640} width={300 * s} height={70 * s} t={t} seed={i} />}
          </g>
        ))}
      </Svg>
    </Push>
  );
};

// ------------------------------------------------------------------ whiteboard question
const Board: Tpl = ({ t, d }) => {
  const strike = ramp(t, d * 0.55, d * 0.55 + 10);
  return (
    <AbsoluteFill style={{ background: "#e9dcc0" }}>
      <Svg>
        <rect x={640} y={140} width={1160} height={640} rx={20} fill="#fff" {...ink} strokeWidth={10} />
        <line x1={700} y1={850} x2={720} y2={780} stroke={INK} strokeWidth={10} />
        <line x1={1740} y1={850} x2={1720} y2={780} stroke={INK} strokeWidth={10} />
        <text x={1220} y={420} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={130} fill="#2f6fb0" opacity={ramp(t, 4, 14)}>BIGGER =</text>
        <text x={1220} y={580} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={130} fill="#2f6fb0" opacity={ramp(t, 10, 20)}>BETTER?</text>
        <line x1={800} y1={600} x2={800 + 840 * strike} y2={330 + 270 * (1 - strike)} stroke="#e8352b" strokeWidth={18} strokeLinecap="round" />
      </Svg>
      <Stickman pose="thinking" x={170} y={1050} height={720} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 1973 oil crisis
const Crisis: Tpl = ({ t }) => {
  const k = ramp(t, 6, 40);
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = i / 40;
    if (x > k) break;
    const y = x < 0.5 ? 0.15 + 0.03 * Math.sin(x * 30) : 0.15 + (x - 0.5) * 1.4;
    pts.push(`${700 + x * 1000},${880 - y * 640}`);
  }
  return (
    <AbsoluteFill style={{ background: BG.red }}>
      <Svg>
        <Rays t={t} color="#ffffff" />
        <rect x={660} y={200} width={1080} height={720} rx={20} fill="#fff" {...ink} />
        <polyline points={pts.join(" ")} fill="none" stroke="#e8352b" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
        <Text x={1200} y={300} size={60} color="#ffd23f">OIL PRICE</Text>
        <Text x={1200} y={980} size={44}>1973</Text>
      </Svg>
      <Stickman pose="scared" x={130} y={1040} height={640} />
      <Caption text="[1973] OIL CRISIS" y={50} size={110} pop={ramp(t, 2, 10)} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ why giants lose: three problems
const Ports: Tpl = ({ t, d }) => {
  const rows = ["Only a few ports", "No canal shortcuts", "Slow to fill"];
  return (
    <AbsoluteFill style={{ background: BG.navy }}>
      <Svg><Rays t={t} color="#ffffff" /></Svg>
      {rows.map((r, i) => {
        const a = ramp(t, d * (0.3 + i * 0.2), d * (0.3 + i * 0.2) + 8);
        return (
          <div key={i} style={{ position: "absolute", left: 160, top: 240 + i * 230, opacity: a, transform: `translateX(${(1 - a) * -120}px)`,
            fontFamily, fontWeight: 700, fontSize: 96, color: "#fff", WebkitTextStroke: `12px ${INK}`, paintOrder: "stroke fill" }}>
            <span style={{ color: "#ff5a4a" }}>✗ </span>{r}
          </div>
        );
      })}
      <Caption text="FULL AND [MOVING]" y={60} size={90} pop={ramp(t, 2, 10)} />
      <Stickman pose="explain" x={1380} y={1060} height={620} flip />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Batillus class: four giants, three scrapped
const Batillus: Tpl = ({ t, p }) => {
  const scrapped = p.scrapped === "1";
  const names = ["Batillus", "Bellamya", "Pierre Guillaumat", "Prairial"];
  return (
    <AbsoluteFill style={{ background: "#2f86c9" }}>
      <Svg>
        {names.map((n, i) => {
          const y = 270 + i * 205;
          const a = ramp(t, i * 6, i * 6 + 10);
          const x = scrapped && i < 3 ? ramp(t, 6 + i * 8, 14 + i * 8) : 0;
          return (
            <g key={i} opacity={a}>
              <g transform={`translate(${200 + (1 - a) * -300} ${y}) scale(0.62)`} opacity={1 - 0.5 * x}><Tanker burnt={x > 0.5} /></g>
              <Text x={1000} y={y + 50} size={60} anchor="start">{n}</Text>
              {i < 3 && <RedX x={510} y={y + 10} s={0.8} p={x} />}
            </g>
          );
        })}
      </Svg>
      <Caption text={scrapped ? "SCRAPPED IN [< 10 YEARS]" : "BATILLUS CLASS · [555,000 t]"} y={40} size={90} pop={ramp(t, 2, 10)} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ giant vs today's big tanker
const Modern: Tpl = ({ t }) => (
  <Push t={t} from={1} to={1.03}>
    <Svg>
      <Sky mood="day" horizon={560} />
      <Sea mood="day" horizon={560} t={t} />
      <g transform="translate(120 500) scale(1.45)" opacity={0.6}><Tanker /></g>
      <Waterline x={120} y={500 + 104} width={1015 * 1.45} mood="day" t={t} horizon={560} />
      <g transform={`translate(${300 + t * 0.8} 840) scale(1.0)`}><Tanker /></g>
      <Waterline x={300 + t * 0.8} y={840 + 72} width={1015} mood="day" t={t} horizon={560} />
      <Text x={820} y={250} size={60}>THE GIANT · 458 m</Text>
      <Text x={1500} y={700} size={60} color="#ffd23f">TODAY'S BIG TANKER</Text>
    </Svg>
  </Push>
);

// ------------------------------------------------------------------ beached at Alang
const Beach: Tpl = ({ t, p }) => {
  const cut = p.cut === "1";
  return (
    <Push t={t} from={1.03} to={1}>
      <Svg>
        <Sky mood="dusk" horizon={560} />
        <Sea mood="dusk" horizon={560} t={t * 0.5} />
        <path d="M0 760 Q600 700 1920 740 L1920 1080 L0 1080 Z" fill="#d9b77a" {...ink} />
        <defs><clipPath id="cutclip"><path d="M-100 -300 L520 -300 L470 -200 L540 -100 L480 0 L530 60 L470 160 L-100 160 Z" /></clipPath></defs>
        <g transform="translate(300 600) rotate(-4) scale(1.3)">
          {cut ? <g clipPath="url(#cutclip)"><Tanker burnt /></g> : <Tanker burnt />}
        </g>
        {cut && [1100, 1300, 1500].map((x, i) => (
          <g key={x}>
            {Array.from({ length: 5 }).map((_, k) => (
              <rect key={k} x={x - 70 + k * 6} y={860 - k * 22} width={150 - k * 12} height={20} fill={k % 2 ? "#5b524c" : "#7a6a5c"} stroke={INK} strokeWidth={3} transform={`rotate(${(k - 2) * 3 + i} ${x} ${860 - k * 22})`} />
            ))}
          </g>
        ))}
        {[500, 640, 820, 980, 1180, 1400, 1600].map((x, i) => <TinyWorker key={x} x={x} y={900 + (i % 2) * 40} s={1.6} wave={i === 3} />)}
      </Svg>
      {cut && <Caption text="CUT APART · [2010]" y={60} size={90} pop={ramp(t, 2, 10)} />}
    </Push>
  );
};

// ------------------------------------------------------------------ the anchor in Hong Kong
const Anchor: Tpl = ({ t }) => (
  <Push t={t} from={1} to={1.05} ox="40% 70%">
    <Svg>
      <Sky mood="day" horizon={620} />
      <g fill="#9fb3c8" stroke={INK} strokeWidth={4}>
        {[[100, 260], [230, 380], [370, 220], [520, 330], [1250, 300], [1400, 420], [1560, 260], [1720, 360]].map(([x, h], i) => (
          <rect key={i} x={x} y={620 - h} width={110} height={h} />
        ))}
      </g>
      <rect x={0} y={620} width={W} height={120} fill="#2f86c9" />
      <rect x={0} y={740} width={W} height={340} fill="#cfc6b6" {...ink} />
      {/* anchor */}
      <g transform="translate(900 360)" fill="#3a3d44" stroke={INK} strokeWidth={6}>
        <circle cx={0} cy={0} r={48} fill="none" strokeWidth={26} stroke="#3a3d44" />
        <rect x={-120} y={60} width={240} height={36} rx={10} />
        <rect x={-24} y={44} width={48} height={520} rx={10} />
        <path d="M-300 420 Q-260 600 0 600 Q260 600 300 420 L240 440 Q220 540 0 540 Q-220 540 -240 440 Z" />
        <path d="M-300 420 L-330 360 L-250 400 Z M300 420 L330 360 L250 400 Z" />
      </g>
      <rect x={760} y={960} width={280} height={40} fill="#8a8173" {...ink} />
    </Svg>
    <Stickman pose="satisfied" x={1150} y={1000} height={380} />
  </Push>
);

// ------------------------------------------------------------------ Prelude vs Seawise Giant
const Prelude: Tpl = ({ t, d }) => {
  const sc = 1700 / 488;
  const pre = 488 * sc, sg = 458 * sc;
  const m = ramp(t, d * 0.45, d * 0.45 + 15);
  return (
    <AbsoluteFill>
      <Svg>
        <Sky mood="day" horizon={150} />
        <rect x={0} y={150} width={W} height={H - 150} fill="#2f86c9" />
        <rect x={0} y={1010} width={W} height={70} fill="#c9b27a" stroke={INK} strokeWidth={5} />
        {/* Seawise Giant on top */}
        <g transform={`translate(110 330) scale(${(sg / 1012) * 0.92})`}><Tanker /></g>
        <Text x={110 + sg * 0.46} y={440} size={50}>SEAWISE GIANT · 458 m (sailed the world)</Text>
        {/* Prelude: long flat hull + gas plant on deck, chained to the seabed */}
        <g transform="translate(110 700)">
          <rect x={0} y={0} width={pre} height={80} rx={14} fill="#596572" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={60 + i * 160} y={-50 - (i % 3) * 26} width={110} height={50 + (i % 3) * 26} fill="#e0a12a" stroke={INK} strokeWidth={4} />
          ))}
          <rect x={pre - 160} y={-140} width={40} height={140} fill="#a6a6a0" stroke={INK} strokeWidth={4} />
          {[300, 900, 1500].map((x) => <line key={x} x1={x} y1={80} x2={x + (x - 900) * 0.15} y2={80 + 230 * m} stroke={INK} strokeWidth={7} strokeDasharray="14 8" />)}
          <Text x={pre / 2} y={56} size={46}>PRELUDE · 488 m</Text>
        </g>
      </Svg>
      <Caption text="FIXED TO THE [SEABED]" y={880} size={76} pop={m} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ end screen
const EndCard: Tpl = ({ t }) => (
  <AbsoluteFill style={{ background: BG.navy }}>
    <Svg>
      <Rays t={t} color="#ffffff" />
      <g transform="translate(960 210)">
        <rect x={0} y={0} width={820} height={462} rx={24} fill="#2f86c9" {...ink} strokeWidth={8} />
        <defs><clipPath id="thumb"><rect x={0} y={0} width={820} height={462} rx={24} /></clipPath></defs>
        <g clipPath="url(#thumb)">
          <rect x={0} y={0} width={820} height={250} fill="#4a5a7a" />
          <g transform="translate(60 250) scale(0.62)"><Tanker /></g>
          <rect x={0} y={300} width={820} height={162} fill="#1d4e7a" />
          <circle cx={480} cy={180} r={26} fill="#e8352b" opacity={0.5 + 0.5 * Math.sin(t * 0.4)} />
        </g>
        <Text x={410} y={110} size={74} color="#ffd23f">ENGINE FAILURE!</Text>
      </g>
      <rect x={960} y={720} width={820} height={120} rx={60} fill="#e8352b" {...ink} transform={`translate(${0} ${Math.sin(t * 0.2) * 4})`} />
      <Text x={1370} y={805} size={64}>SUBSCRIBE</Text>
    </Svg>
    <Stickman pose="explain" x={240} y={1050} height={760} />
  </AbsoluteFill>
);

export const TEMPLATES: Record<string, Tpl> = {
  attack: ({ t }) => <Attack t={t} />,
  upright: ({ t }) => <Upright t={t} />,
  shipyard: ({ t, p }) => <Shipyard t={t} close={p.close === "1"} />,
  stopping: ({ t }) => <Stopping t={t} />,
  sea: SeaT, talk: Talk, card: Card, gates: Gates, names: Names, bridge: Bridge, dock: Dock,
  cheaper: Cheaper, lengthen: Lengthen, morethan: MoreThan, fields: Fields, highway: Highway,
  cross: Cross, propeller: Propeller, turning: Turning, war: War, board: Board,
  crisis: Crisis, ports: Ports, batillus: Batillus, modern: Modern, beach: Beach, anchor: Anchor,
  prelude: Prelude, endcard: EndCard,
  ...TEMPLATES2,
  ...TEMPLATES3,
  ...TEMPLATES4,
  stat: (props) => (STAT_ICONS.includes(props.p.icon ?? "") ? <StatX {...props} /> : <Stat {...props} />),
};
