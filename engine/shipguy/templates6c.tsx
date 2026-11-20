// The Ship Guy: carrier video (#6), part 3 scenes: the USS Forrestal fire (1967), the hangar bay and elevators,
// the reactors, replenishment at sea, and life on board. Frame-driven only.
// The Forrestal scenes are deliberately quiet: muted colours, slow moves, no gags, no people shown being hurt.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, IDLE, POSES } from "./guy";
import { CarrierHD } from "./ships_hd";
import { fontFamily, ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, clamp01, pop } from "./templates3";
import { NightSky, rnd, YEL, RED } from "./templates5";
import { CarrierTop, Crew, DECK, DaySky, Escort, Fighter, FighterTop, JERSEY, OpenSea, TopSea } from "./templates6";

const O = (w = 5) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
const ease = (k: number) => { const c = clamp01(k); return c * c * (3 - 2 * c); };
const Txt: React.FC<{ x: number; y: number; s: number; c?: string; a?: "start" | "middle" | "end"; o?: number; children: React.ReactNode }> = ({ x, y, s, c = INK, a = "middle", o = 1, children }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={fontFamily} fontWeight={700} fontSize={s} fill={c} opacity={o}>{children}</text>
);

// ================================================================== 5b. USS Forrestal, 29 July 1967 (quiet)
const DuskSky: React.FC = () => (
  <g>
    <defs><linearGradient id="fdusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5d6b80" /><stop offset="1" stopColor="#c9b79a" /></linearGradient></defs>
    <rect width={W} height={H} fill="url(#fdusk)" />
  </g>
);
const Smoke: React.FC<{ x: number; y: number; t: number; k: number; dark?: boolean }> = ({ x, y, t, k, dark }) => (
  <g opacity={k}>
    {Array.from({ length: 14 }).map((_, i) => {
      const a = ((t * 0.6 + i * 18) % 250) / 250;
      return <circle key={i} cx={x + Math.sin(i * 1.7) * 30 + a * 160} cy={y - a * 560} r={40 + a * 110} fill={dark ? "#2c2f35" : "#5a5c60"} opacity={0.75 - a * 0.5} />;
    })}
  </g>
);
const Glow: React.FC<{ x: number; y: number; t: number; k: number }> = ({ x, y, t, k }) => (
  <g opacity={k}>
    <ellipse cx={x} cy={y} rx={180} ry={50} fill="#ff8a3a" opacity={0.35 + 0.1 * Math.sin(t * 0.3)} />
    <ellipse cx={x} cy={y} rx={90} ry={26} fill="#ffc46a" opacity={0.6} />
  </g>
);

const Forrestal: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "open";
  if (st === "open") {
    return (
      <AbsoluteFill>
        <Svg>
          <DuskSky />
          <OpenSea t={t * 0.4} y={780} />
          <rect x={0} y={720} width={W} height={70} fill={DECK} {...O(5)} />
          <Actor a="sad" t={t} x={760} y={730} s={0.85} id="fo" w={w} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "date") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#1f2328" />
          <g transform={`translate(960 560) scale(${0.9 + 0.1 * ease(t / 40)})`} opacity={ramp(t, 0, 14)}>
            <rect x={-260} y={-300} width={520} height={600} rx={20} fill="#efe9dc" {...O(8)} />
            <rect x={-260} y={-300} width={520} height={130} rx={20} fill="#7a3a2a" {...O(8)} />
            <Txt x={0} y={-210} s={70} c="#efe9dc">JULY</Txt>
            <Txt x={0} y={90} s={230}>29</Txt>
            <Txt x={0} y={240} s={70} c="#5a5c60">1967</Txt>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "ship") {
    return (
      <AbsoluteFill>
        <Svg>
          <DuskSky />
          <OpenSea t={t * 0.4} y={700} />
          <g transform={`translate(${260 - t * 0.3} 740)`} opacity={0.95}><CarrierHD w={1400} num="59" /></g>
          <g transform={`translate(1560 240) scale(${ramp(t, 10, 24)})`}>
            <rect x={-200} y={-120} width={400} height={240} rx={16} fill="#efe9dc" {...O(6)} />
            <path d="M-80 -90 Q -40 -40 -60 0 Q -30 50 20 90 L 60 70 Q 10 20 0 -30 Q 20 -70 -20 -100 Z" fill="#9aa48a" {...O(3)} />
            <circle cx={120} cy={10} r={14} fill={RED} {...O(3)} />
            <Txt x={0} y={150} s={34} c="#efe9dc">GULF OF TONKIN</Txt>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  // top-down schematic of the crowded stern: jets parked in rows on both sides
  if (st === "deck" || st === "fault" || st === "strike") {
    const z = st === "deck" ? 1.3 + 0.2 * ease(t / 40) : 2.2;
    const rk = st === "fault" ? ease((t - 14) / 30) : st === "strike" ? 1 : 0;
    const hit = st === "strike" ? ramp(t, 4, 14) : 0;
    const ax = 440, ay = -70, bx = 460, by = 70; // F-4B (port row) and A-4E (starboard row), in carrier units
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#26374a" />
          <g transform={`translate(960 540) scale(${z}) translate(-480 0)`}>
            <g opacity={0.92}><CarrierTop num="59" wires={4} elevators={false} /></g>
            {[0, 1, 2, 3, 4, 5].map((i) => <g key={`a${i}`} transform={`translate(${300 + i * 55} -72) rotate(90) scale(0.4)`}><FighterTop folded /></g>)}
            {[0, 1, 2, 3, 4, 5].map((i) => <g key={`b${i}`} transform={`translate(${300 + i * 55} 70) rotate(-90) scale(0.34)`}><FighterTop folded color="#b0b8bf" /></g>)}
            {st !== "deck" && (
              <g>
                <circle cx={ax} cy={ay} r={18} fill="none" stroke={YEL} strokeWidth={2.5} opacity={ramp(t, 2, 10)} />
                <Txt x={ax} y={ay - 26} s={22} c="#fff" o={ramp(t, 2, 10)}>F-4B</Txt>
                <circle cx={bx} cy={by} r={18} fill="none" stroke={YEL} strokeWidth={2.5} opacity={st === "strike" ? 1 : 0.4} />
                <Txt x={bx} y={by + 44} s={22} c="#fff" o={st === "strike" ? 1 : 0}>A-4E</Txt>
                {rk > 0 && <line x1={ax} y1={ay + 10} x2={ax + (bx - ax) * rk} y2={ay + 10 + (by - 10 - ay - 10) * rk} stroke="#ffb03a" strokeWidth={3} strokeDasharray="6 4" />}
                {hit > 0 && <circle cx={bx} cy={by} r={10 + hit * 14} fill="#ffb03a" opacity={0.5 * (1 - hit * 0.5)} />}
              </g>
            )}
          </g>
          {st === "fault" && <g transform={`translate(380 300) scale(${pop(t, 4)})`}><rect x={-60} y={-60} width={120} height={120} rx={14} fill="#efe9dc" {...O(5)} /><path d="M10 -40 L -24 6 L 4 6 L -10 42 L 26 -8 L -2 -8 Z" fill={YEL} {...O(3)} /></g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "fire" || st === "toll" || st === "toll2" || st === "toll3") {
    const far = st === "fire" ? 1 : st === "toll" ? 0.75 : st === "toll2" ? 0.62 : 0.5;
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill={st === "fire" ? "#3b3f47" : "#23262c"} />
          <OpenSea t={t * 0.3} y={720} night />
          <g transform={`translate(${960 - 700 * far} ${740}) scale(${far})`}>
            <CarrierHD w={1400} num="59" />
            <Glow x={220} y={-70} t={t} k={1} />
            <Smoke x={200} y={-90} t={t} k={1} dark />
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "farrier" || st === "farrier2") {
    // a single silhouette walking toward the smoke; in the second beat the frame fills with light and fades
    const k = st === "farrier" ? t / Math.max(1, d) : 1;
    const flash = st === "farrier2" ? ramp(t, 2, 10) * (1 - ramp(t, 14, Math.max(16, d - 6))) : 0;
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#3b3f47" />
          <rect x={0} y={760} width={W} height={320} fill="#2c3036" />
          <Glow x={1500} y={760} t={t} k={1} />
          <Smoke x={1400} y={720} t={t} k={1} dark />
          <g transform={`translate(${560 + k * 380} 760)`} opacity={st === "farrier2" ? 1 - ramp(t, 8, 20) : 1}>
            <line x1={-10} y1={0} x2={-4} y2={-90} stroke="#111" strokeWidth={18} strokeLinecap="round" />
            <line x1={14} y1={0} x2={4} y2={-90} stroke="#111" strokeWidth={18} strokeLinecap="round" />
            <rect x={-26} y={-190} width={52} height={110} rx={18} fill="#111" />
            <circle cx={0} cy={-220} r={30} fill="#111" />
            <line x1={14} y1={-170} x2={60} y2={-120} stroke="#111" strokeWidth={16} strokeLinecap="round" />
            <rect x={52} y={-160} width={26} height={60} rx={8} fill="#7a1f1a" />
          </g>
          <rect width={W} height={H} fill="#f4e6c8" opacity={flash * 0.85} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "changed") {
    const yr = Math.round(1967 + ease((t - 4) / Math.max(10, d - 10)) * (2026 - 1967));
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={760} />
          <rect width={W} height={760} fill="#f2c79a" opacity={0.3} />
          <OpenSea t={t} y={760} />
          <g transform={`translate(${300 + t * 0.8} 800)`}><CarrierHD w={1300} num="68" /></g>
          <Txt x={960} y={300} s={120} c="#fff">{yr}</Txt>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "train") {
    const cols = ["blue", "yellow", "green", "purple", "white", "brown"];
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={780} />
          <rect x={0} y={780} width={W} height={300} fill="#7d8a96" {...O(5)} />
          {/* a training fire on a mock-up, crews of every colour on the hoses */}
          <g transform="translate(1450 780)">
            <rect x={-160} y={-90} width={320} height={90} fill="#5a636c" {...O(5)} />
            {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${-120 + i * 48} -90 q ${10 + Math.sin(t * 0.5 + i) * 10} -60 0 ${-100 - Math.abs(Math.sin(t * 0.3 + i)) * 40 * (1 - ramp(t, 40, 160))}`} fill="#ff9b3a" opacity={0.8 * (1 - ramp(t, 60, 200))} />)}
            {Array.from({ length: 18 }).map((_, i) => <circle key={`f${i}`} cx={-140 + rnd(i) * 280} cy={-100 - rnd(i + 4) * 120} r={18 + rnd(i + 8) * 20} fill="#fff" opacity={ramp(t, 20, 40) * 0.85} />)}
          </g>
          <path d={`M300 860 Q 800 ${700 + Math.sin(t * 0.2) * 10} 1300 700`} stroke="#fff" strokeWidth={14} fill="none" opacity={ramp(t, 10, 20) * 0.85} />
          {cols.map((c, i) => <Crew key={c} x={250 + i * 130} y={900} c={JERSEY[c]} s={1.6} t={t + i * 9} arm={1} />)}
          <path d="M240 830 L 1030 800" stroke="#c94a3a" strokeWidth={12} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "school") {
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={860} />
          <rect x={0} y={860} width={W} height={220} fill="#9aa68a" {...O(5)} />
          <g transform={`translate(960 860) scale(${0.95 + 0.05 * ease(t / 60)})`}>
            <rect x={-560} y={-420} width={1120} height={420} fill="#c9b79a" {...O(8)} />
            {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-500 + i * 175} y={-260} width={110} height={120} fill="#9fd3ee" {...O(5)} />)}
            <rect x={-80} y={-130} width={160} height={130} fill="#7a3a2a" {...O(5)} />
            <rect x={-480} y={-400} width={960} height={110} rx={12} fill="#1d2f4f" {...O(6)} />
            <Txt x={0} y={-330} s={56} c="#fff">FARRIER FIREFIGHTING SCHOOL</Txt>
          </g>
          {[0, 1, 2, 3].map((i) => <Crew key={i} x={300 + i * 110 + t * 1.2} y={900} c={JERSEY[["blue", "white", "red", "green"][i]]} s={1.3} t={t + i * 11} />)}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "alone") {
    return (
      <AbsoluteFill>
        <Svg>
          <DuskSky />
          <OpenSea t={t * 0.4} y={640} />
          <g transform={`translate(${760 - t * 0.2} 660) scale(0.3)`}><CarrierHD w={1400} num="68" /></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  // everyone: the Ship Guy (orange vest) on a hose with red jerseys, quiet drill
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={800} />
        <rect x={0} y={800} width={W} height={280} fill={DECK} {...O(5)} />
        <path d={`M200 900 Q 900 860 1500 700`} stroke="#c94a3a" strokeWidth={16} fill="none" />
        {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={1500 + i * 26 + (t * 3) % 30} cy={680 - i * 8 + Math.sin(t * 0.3 + i) * 10} r={14 + i} fill="#fff" opacity={0.85 - i * 0.05} />)}
        {[0, 2].map((i) => <Actor key={i} a="push" t={t + i * 7} x={520 + i * 260} y={1000} s={0.58} id={`fb${i}`} outfit="jersey" over={{ jersey: JERSEY.red, face: { eyes: "dot", brows: "angry", mouth: "flat" }, emote: undefined }} />)}
        <Actor a="push" t={t + 3} x={780} y={1000} s={0.62} id="fbsg" over={{ face: { eyes: "dot", brows: "angry", mouth: "flat" }, emote: undefined }} />
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 6. the hangar bay and the elevators
const Hangar: Tpl = ({ t, p }) => {
  const st = p.step ?? "crowd";
  if (st === "crowd") {
    const spots: [number, number][] = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 11; c++) spots.push([120 + c * 75, -70 + r * 60]);
    return (
      <AbsoluteFill>
        <Svg>
          <TopSea t={t} />
          <g transform={`translate(${160 - t * 0.6} 560) scale(1.7)`}>
            <CarrierTop num="68" />
            {spots.map(([x, y], i) => <g key={i} transform={`translate(${x} ${y}) scale(${0.3 * pop(t, i * 1.2)})`}><FighterTop folded /></g>)}
          </g>
          <T3 x={1500} y={960} size={90} color={YEL} s={pop(t, 30)} rot={-4}>FULL!</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  // bay: cut-away side view, flight deck on top, hangar bay below with jets under repair
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={300} />
        <OpenSea t={t} y={940} />
        <rect x={0} y={240} width={W} height={60} fill={DECK} {...O(6)} />
        <rect x={0} y={300} width={W} height={460} fill="#b9c2ca" {...O(6)} />
        <rect x={0} y={760} width={W} height={180} fill="#7d8a96" {...O(6)} />
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 170} y1={300} x2={i * 170} y2={330} {...O(4)} />)}
        {Array.from({ length: 8 }).map((_, i) => <rect key={`l${i}`} x={80 + i * 230} y={310} width={120} height={14} fill="#fff7c2" />)}
        {[300, 980, 1620].map((x, i) => (
          <g key={i}>
            <g transform={`translate(${x} 740) scale(1.1)`}><Fighter gear pilot={false} /></g>
            {i === 1 && <rect x={x - 20} y={640} width={60} height={30} fill="#ffd23f" transform={`rotate(-30 ${x} 640)`} {...O(3)} />}
          </g>
        ))}
        <Actor a="fix" t={t} x={900} y={760} s={0.42} id="hb1" outfit="jersey" over={{ jersey: JERSEY.green }} />
        <Actor a="notes" t={t} x={1460} y={760} s={0.42} id="hb2" outfit="jersey" over={{ jersey: JERSEY.green }} />
        {t % 20 < 6 && Array.from({ length: 5 }).map((_, i) => <line key={i} x1={1000} y1={650} x2={1000 + (rnd(i) - 0.5) * 60} y2={620 - rnd(i + 3) * 40} stroke={YEL} strokeWidth={4} />)}
        <T3 x={960} y={200} size={56} color="#fff">↑ FLIGHT DECK</T3>
      </Svg>
    </AbsoluteFill>
  );
};

const Elevator: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "1";
  if (st === "weapons") {
    const k = ease((t - 6) / Math.max(20, d - 30));
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#39424b" />
          <rect x={0} y={0} width={W} height={240} fill="#9fd3ee" />
          <g transform="translate(0 80)">
          <rect x={0} y={140} width={W} height={40} fill={DECK} {...O(6)} />
          {[400, 700, 1000].map((y, i) => <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="#2a2f35" strokeWidth={10} />)}
          {/* magazine shelves deep in the hull */}
          {Array.from({ length: 8 }).map((_, i) => <g key={i} transform={`translate(${160 + (i % 4) * 150} ${800 + Math.floor(i / 4) * 110})`}><rect x={-60} y={-24} width={120} height={48} rx={22} fill="#5a6a4a" {...O(4)} /><path d="M60 -24 l 24 24 l -24 24" fill="#5a6a4a" {...O(4)} /></g>)}
          <Txt x={460} y={760} s={40} c="#fff">MAGAZINE ↓</Txt>
          {/* the lift shaft */}
          <rect x={1100} y={180} width={300} height={880} fill="#2a2f35" {...O(5)} />
          <g transform={`translate(1250 ${980 - k * 790})`}>
            <rect x={-140} y={0} width={280} height={20} fill="#c9a23a" {...O(4)} />
            <rect x={-80} y={-50} width={160} height={50} rx={22} fill="#5a6a4a" {...O(4)} />
          </g>
          {[0, 1].map((i) => <Actor key={i} a="watch" t={t} x={1560 + i * 160} y={140} s={0.32} id={`wl${i}`} outfit="jersey" over={{ jersey: JERSEY.red }} />)}
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  const up = st === "2" ? ease((t - 6) / 50) : 0.5 + 0.5 * Math.sin(t * 0.06);
  const lift = 360 * up;
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={700} />
        <OpenSea t={t} y={900} />
        {/* the hull side, close up: flight deck at y = 300, hangar opening below */}
        <rect x={0} y={300} width={1100} height={640} fill="#8e99a4" {...O(6)} />
        <rect x={0} y={290} width={1100} height={26} fill={DECK} {...O(5)} />
        <rect x={700} y={420} width={400} height={280} fill="#2a2f35" {...O(5)} />
        {/* the platform sticks out from the side and moves between hangar (y = 700) and flight deck (y = 300) */}
        <g transform={`translate(0 ${-lift})`}>
          <rect x={1100} y={680} width={560} height={30} fill="#5a636c" {...O(5)} />
          <g transform="translate(1380 676) scale(1.25)"><Fighter gear pilot={false} /></g>
          {st === "2" && <Actor a="wave" t={t} x={1560} y={680} s={0.3} id="ride" w={w} />}
        </g>
        <line x1={1110} y1={300} x2={1110} y2={720} stroke="#2a2f35" strokeWidth={8} />
        <Txt x={560} y={270} s={40} c="#fff">FLIGHT DECK ↑</Txt><Txt x={900} y={760} s={40} c="#fff">HANGAR</Txt>
        {st === "2" && <g transform={`translate(400 180) scale(${pop(t, 10)})`}><rect x={-160} y={-60} width={320} height={120} rx={20} fill="#f4f4f0" {...O(6)} /><Txt x={0} y={22} s={58}>× 4</Txt></g>}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 7. the reactors
const Reactor: Tpl = ({ t, d, p }) => {
  const st = p.step ?? "1";
  const Core: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={120} fill="#5ab8ff" opacity={0.25 + 0.15 * Math.sin(t * 0.2)} />
      <rect x={-80} y={-110} width={160} height={220} rx={40} fill="#e6edf2" {...O(7)} />
      <g transform={`rotate(${t * 2})`}>{[0, 60, 120].map((a) => <ellipse key={a} rx={56} ry={20} fill="none" stroke="#2f6fd0" strokeWidth={6} transform={`rotate(${a})`} />)}</g>
      <circle r={12} fill="#2f6fd0" />
    </g>
  );
  if (st === "1") {
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={420} />
          <OpenSea t={t} y={420} />
          <g transform="translate(160 470)"><path d="M0 -40 L 1600 -40 Q 1640 200 1500 380 L 120 380 Q 0 200 0 -40 Z" fill="#8e99a4" {...O(7)} /></g>
          <rect x={560} y={560} width={800} height={260} fill="#2a2f35" {...O(5)} opacity={ramp(t, 0, 10)} />
          <Core x={760} y={690} s={pop(t, 4) * 0.9} />
          <Core x={1160} y={690} s={pop(t, 12) * 0.9} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "steam" || st === "turbine") {
    const sp = st === "turbine" ? 1 : 0.3;
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#13233d" />
          <Core x={260} y={560} s={0.9} />
          <path d="M370 500 H 700" stroke="#5ab8ff" strokeWidth={30} />
          <g transform="translate(800 520)">
            <rect x={-110} y={-150} width={220} height={300} rx={40} fill="#c9cfd5" {...O(6)} />
            {Array.from({ length: 6 }).map((_, i) => { const k2 = ((t * 2 + i * 20) % 120) / 120; return <circle key={i} cx={(rnd(i) - 0.5) * 120} cy={100 - k2 * 260} r={20 + k2 * 20} fill="#fff" opacity={0.9 - k2 * 0.6} />; })}
            <Txt x={0} y={210} s={42} c="#fff">WATER → STEAM</Txt>
          </g>
          {st === "turbine" && (
            <g>
              <path d="M910 420 H 1200" stroke="#f4f4f0" strokeWidth={30} opacity={0.85} />
              <g transform="translate(1290 420)">
                <circle r={100} fill="#7d8a96" {...O(6)} />
                <g transform={`rotate(${t * 20 * sp})`}>{Array.from({ length: 8 }).map((_, i) => <path key={i} d="M0 0 L 90 -16 L 90 16 Z" fill="#c9cfd5" stroke={INK} strokeWidth={3} transform={`rotate(${i * 45})`} />)}</g>
                <Txt x={0} y={150} s={38} c="#fff">TURBINE</Txt>
              </g>
              <line x1={1390} y1={420} x2={1700} y2={420} stroke="#c9cfd5" strokeWidth={22} />
              <g transform={`translate(1760 420) rotate(${t * 20})`}>{[0, 120, 240].map((a) => <ellipse key={a} cx={0} cy={-55} rx={26} ry={55} fill="#c9a23a" stroke={INK} strokeWidth={4} transform={`rotate(${a})`} />)}</g>
              <line x1={1290} y1={520} x2={1290} y2={720} stroke="#c9cfd5" strokeWidth={16} />
              <rect x={1200} y={720} width={180} height={120} rx={14} fill="#2f6fd0" {...O(5)} />
              <Txt x={1290} y={792} s={30} c="#fff">POWER</Txt>
              {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${1500 + i * 100} 800)`} opacity={ramp(t, 20 + i * 6, 26 + i * 6)}><circle r={30} fill="#ffe27a" {...O(4)} /><circle r={50} fill="#ffe27a" opacity={0.3} /></g>)}
            </g>
          )}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "years") {
    const yr = Math.floor(ease((t - 4) / Math.max(20, d - 20)) * 23);
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#13233d" />
          <Core x={560} y={540} s={1.4} />
          <g transform="translate(1300 540)">
            <rect x={-220} y={-240} width={440} height={480} rx={24} fill="#f4f4f0" {...O(8)} />
            <rect x={-220} y={-240} width={440} height={110} rx={24} fill={RED} {...O(8)} />
            <Txt x={0} y={-165} s={52} c="#fff">YEAR</Txt>
            <Txt x={0} y={90} s={200}>{yr}</Txt>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "rcoh") {
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={1080} />
          <rect x={0} y={700} width={W} height={380} fill="#9aa4ad" {...O(5)} />
          <rect x={160} y={620} width={1600} height={120} fill="#6b747d" {...O(5)} />
          <g transform="translate(260 640)"><CarrierHD w={1400} num="68" /></g>
          {[[500, 260], [1300, 220]].map(([x, h], i) => (
            <g key={i}>
              <rect x={x - 20} y={620 - h - 200} width={40} height={h + 200} fill={YEL} {...O(5)} />
              <path d={`M${x} ${420 - h} L ${x + 360} ${420 - h} M${x + 300 + Math.sin(t * 0.05 + i) * 30} ${420 - h} V ${560}`} stroke={INK} strokeWidth={10} />
            </g>
          ))}
          <g transform="translate(960 900)">
            <line x1={-600} y1={0} x2={600} y2={0} stroke="#fff" strokeWidth={14} />
            <circle cx={-600} cy={0} r={16} fill="#fff" /><circle cx={600} cy={0} r={16} fill="#fff" />
            <circle cx={0} cy={0} r={30} fill={YEL} {...O(5)} opacity={ramp(t, 6, 14)} />
            <Txt x={-600} y={70} s={36} c="#fff">START</Txt><Txt x={0} y={80} s={40} c={YEL} o={ramp(t, 6, 14)}>REFUEL</Txt><Txt x={600} y={70} s={36} c="#fff">END</Txt>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  // ford: power bars
  const ford = st === "ford" ? ease((t - 6) / 30) * 0.75 : 1;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#13233d" />
        <g transform="translate(0 960)">
          <rect x={460} y={-260} width={280} height={260} fill="#7d8a96" {...O(6)} />
          <Txt x={600} y={60} s={46} c="#fff">EARLIER CARRIERS</Txt>
          <rect x={1100} y={-780 * ford} width={280} height={780 * ford} fill="#5ab8ff" {...O(6)} />
          <Txt x={1240} y={60} s={46} c="#fff">FORD</Txt>
          {st === "emals" && <Txt x={1240} y={-800} s={70} c={YEL}>~3×</Txt>}
        </g>
        {st === "emals" && (
          <g>
            <path d="M1380 300 L 1600 300 L 1600 700" stroke={YEL} strokeWidth={10} strokeDasharray="24 14" strokeDashoffset={-t * 4} fill="none" />
            <rect x={1500} y={700} width={360} height={40} rx={8} fill="#1f3557" {...O(4)} />
            {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={1508 + i * 58} y={706} width={50} height={28} fill={i < (t / 4) % 7 ? "#5ab8ff" : "#2c4a7a"} />)}
            <Txt x={1680} y={810} s={34} c="#fff">EMALS</Txt>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 7. replenishment at sea
const Unrep: Tpl = ({ t, p }) => {
  const st = p.step ?? "1";
  if (st === "1") {
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={640} />
          <OpenSea t={t} y={640} />
          <g transform={`translate(${200 + t * 1.2} 680) scale(0.8)`}><CarrierHD w={1400} num="68" /></g>
          <g transform={`translate(1560 360) scale(${pop(t, 6)})`}>
            <rect x={-130} y={-150} width={260} height={300} rx={20} fill="#c94a3a" {...O(7)} />
            <rect x={-90} y={-110} width={180} height={90} rx={10} fill="#f4f4f0" {...O(4)} />
            <Txt x={0} y={-50} s={40}>FUEL</Txt>
            <line x1={-170} y1={-190} x2={170} y2={190} stroke={INK} strokeWidth={22} opacity={ramp(t, 16, 22)} />
            <line x1={-170} y1={-190} x2={170} y2={190} stroke={RED} strokeWidth={12} opacity={ramp(t, 16, 22)} />
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "2") {
    const lvl = 1 - clamp01(t / 80);
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={760} />
          <OpenSea t={t} y={760} />
          {[0, 1, 2].map((i) => <g key={i} transform={`translate(${300 + i * 420 + t * 4} ${300 + i * 120}) scale(1.1)`}><Fighter gear={false} flame={1} /></g>)}
          <g transform="translate(1640 560)">
            <rect x={-90} y={-260} width={180} height={520} rx={24} fill="#f4f4f0" {...O(7)} />
            <rect x={-70} y={240 - 480 * lvl} width={140} height={480 * lvl} rx={14} fill={JERSEY.purple} />
            <Txt x={0} y={320} s={40} c="#fff">JET FUEL</Txt>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  // 3 + 4: side by side, the supply ship alongside with hoses and a cargo line
  const k = st === "3" ? ease((t - 4) / 40) : 1;
  return (
    <AbsoluteFill>
      <Svg>
        <TopSea t={t} />
        <g transform="translate(960 380) scale(1.25) translate(-500 0)"><CarrierTop num="68" /></g>
        <g transform={`translate(${960 + (1 - k) * 900} ${760}) scale(2.4)`}><Escort len={420} supply /></g>
        {st === "4" && (
          <g>
            {[700, 1150].map((x, i) => <path key={i} d={`M${x} 700 Q ${x + 30} 600 ${x} 500`} stroke={JERSEY.purple} strokeWidth={16} fill="none" />)}
            <line x1={940} y1={700} x2={940} y2={500} stroke={INK} strokeWidth={4} />
            {[0, 1].map((i) => { const y = 700 - ((t * 2 + i * 100) % 200); return <rect key={i} x={915} y={y - 20} width={50} height={40} fill={["#e0a23b", "#4f8a5b"][i]} {...O(4)} />; })}
            <g transform={`translate(1500 230) scale(${pop(t, 6)})`}>
              <rect x={-300} y={-80} width={600} height={160} rx={20} fill="#f4f4f0" {...O(6)} />
              <text x={-240} y={30} fontSize={80}>⛽</text><text x={-100} y={30} fontSize={80}>🥫</text><text x={40} y={30} fontSize={80}>🔧</text><text x={180} y={30} fontSize={80}>💣</text>
            </g>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 8. the floating town
const Town: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "intro";
  if (st === "intro") {
    const m = Math.min(9, Math.floor(t / 8));
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={640} />
          <OpenSea t={t} y={640} />
          <g transform="translate(300 680) scale(0.7)"><CarrierHD w={1400} num="68" /></g>
          <g transform="translate(1560 300)">
            <rect x={-180} y={-180} width={360} height={360} rx={20} fill="#f4f4f0" {...O(8)} />
            <rect x={-180} y={-180} width={360} height={90} rx={20} fill={RED} {...O(8)} />
            <Txt x={0} y={-118} s={44} c="#fff">{["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT"][m]}</Txt>
            <Txt x={0} y={80} s={130}>{m + 1}</Txt>
            <Txt x={0} y={150} s={30}>MONTHS</Txt>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "meals") {
    const n = Math.round(ease((t - 4) / Math.max(20, d - 20)) * 18000);
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#e8e3d6" />
          <rect x={0} y={700} width={W} height={60} fill="#9aa4ad" {...O(5)} />
          {Array.from({ length: 10 }).map((_, i) => <g key={i} transform={`translate(${((i * 220 + t * 6) % (W + 200)) - 100} 690)`}><rect x={-70} y={-20} width={140} height={20} rx={4} fill="#c9cfd5" {...O(3)} /><circle cx={-30} cy={-30} r={18} fill="#e0a23b" /><circle cx={20} cy={-28} r={14} fill="#4f8a5b" /></g>)}
          <Actor a="present" t={t} x={420} y={1000} s={0.75} id="chef" w={w} over={{ pose: { ...POSES.hold }, prop: "mug", face: FACES.happy }} />
          <g transform="translate(1300 330)">
            <rect x={-360} y={-110} width={720} height={220} rx={24} fill="#1d2025" {...O(7)} />
            <text x={0} y={40} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={120} fill={YEL}>{n.toLocaleString("en-US")}</text>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "water" || st === "litres") {
    const k = ease((t - 2) / Math.max(20, d - 10));
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#e8eef2" />
          <path d="M0 560 H 360" stroke={JERSEY.blue} strokeWidth={40} />
          <Txt x={180} y={500} s={40}>SEAWATER</Txt>
          <g transform="translate(560 560)">
            <rect x={-200} y={-220} width={400} height={440} rx={30} fill="#c9cfd5" {...O(7)} />
            {Array.from({ length: 6 }).map((_, i) => { const a = ((t * 2 + i * 20) % 120) / 120; return <circle key={i} cx={(rnd(i) - 0.5) * 220} cy={140 - a * 300} r={18 + a * 18} fill="#fff" opacity={0.9 - a * 0.6} />; })}
            <rect x={-200} y={120} width={400} height={100} fill="#ff9b3a" opacity={0.5 + 0.2 * Math.sin(t * 0.4)} />
            <Txt x={0} y={280} s={40}>DISTILLER</Txt>
          </g>
          <path d="M760 400 H 1100 V 300" stroke="#9fd3ee" strokeWidth={30} fill="none" />
          <g transform="translate(1440 560)">
            <rect x={-260} y={-300} width={520} height={600} rx={20} fill="#f4f4f0" {...O(8)} />
            <rect x={-240} y={280 - 560 * k} width={480} height={560 * k} rx={10} fill="#5ab8ff" />
            <text x={0} y={60} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={st === "litres" ? 76 : 86} fill={INK}>
              {st === "litres" ? `${(1.5 * k).toFixed(1)} M L` : `${Math.round(400000 * k).toLocaleString("en-US")}`}
            </text>
            <Txt x={0} y={370} s={40}>{st === "litres" ? "LITRES / DAY" : "GALLONS / DAY"}</Txt>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "bunks" || st === "locker") {
    const bump = st === "bunks" && t > 40;
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#d9dde0" />
          {[0, 1, 2, 3].map((c) => (
            <g key={c} transform={`translate(${200 + c * 420} 0)`}>
              <rect x={-10} y={200} width={20} height={800} fill="#7d8a96" {...O(4)} /><rect x={330} y={200} width={20} height={800} fill="#7d8a96" {...O(4)} />
              {[0, 1, 2].map((r) => <g key={r}><rect x={0} y={330 + r * 230} width={340} height={40} fill="#3a73b8" {...O(5)} /><rect x={10} y={300 + r * 230} width={110} height={34} rx={14} fill="#f4f4f0" {...O(4)} />{!(c === 1 && r === 0) && <circle cx={190 + c * 10} cy={312 + r * 230} r={22} fill="#f3f1ea" {...O(4)} />}</g>)}
            </g>
          ))}
          {st === "bunks" && <Actor a="look" t={t} x={760} y={300 + (bump ? 0 : 0)} s={0.32} id="bunk" w={w} over={{ rot: -90, emote: bump ? "stars" : undefined, emoteT: t - 40, face: bump ? { eyes: "closed", brows: "worried", mouth: "wavy" } : FACES.happy }} />}
          {st === "locker" && (
            <g transform={`translate(960 560) scale(${pop(t, 2)})`}>
              <rect x={-170} y={-280} width={340} height={560} rx={10} fill="#8e99a4" {...O(8)} />
              {[0, 1, 2].map((i) => <rect key={i} x={-120} y={-250 + i * 24} width={240} height={10} rx={4} fill="#5f6a74" />)}
              <rect x={-140} y={-140} width={280} height={390} fill="#5f6a74" {...O(5)} opacity={0.5} />
              <text x={-100} y={20} fontSize={70}>👕</text><text x={10} y={20} fontSize={70}>📷</text><text x={-90} y={150} fontSize={70}>🧴</text><text x={20} y={150} fontSize={70}>📚</text>
            </g>
          )}
        </Svg>
      </AbsoluteFill>
    );
  }
  // extras: four quick vignettes
  const idx = Math.min(3, Math.floor((t / Math.max(1, Math.min(d, 210))) * 4));
  const lt = t - idx * Math.min(d, 210) / 4;
  const names = ["GYM", "POST OFFICE", "MEDICAL", "BARBER SHOP"];
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill={["#e8d6a6", "#cfe5f2", "#f2e6e6", "#e6eadf"][idx]} />
        <rect x={0} y={900} width={W} height={180} fill="#9aa4ad" {...O(5)} />
        {idx === 0 && (
          <g>
            <Actor a="cheer" t={lt} x={960} y={920} s={0.85} id="gym" over={{ pose: { ...IDLE, armL: [150 + Math.sin(lt * 0.3) * 20, 20], armR: [150 + Math.sin(lt * 0.3) * 20, 20] }, face: { eyes: "closed", brows: "angry", mouth: "teeth" }, emote: "sweat", emoteT: lt, hat: undefined }} />
            <g transform={`translate(960 ${320 - Math.sin(lt * 0.3) * 30})`}><rect x={-260} y={-10} width={520} height={20} fill="#5a636c" {...O(4)} /><rect x={-300} y={-60} width={50} height={120} rx={10} fill="#2a2f35" /><rect x={250} y={-60} width={50} height={120} rx={10} fill="#2a2f35" /></g>
          </g>
        )}
        {idx === 1 && (
          <g>
            <rect x={1100} y={420} width={520} height={480} fill="#3a73b8" {...O(7)} /><Txt x={1360} y={520} s={56} c="#fff">U.S. MAIL</Txt>
            <Actor a="hold" t={lt} x={700} y={920} s={0.85} id="post" over={{ prop: "label", face: FACES.happy }} />
            <g transform={`translate(${880 + lt * 3} 760)`}><rect x={-60} y={-46} width={120} height={92} rx={10} fill="#f4f4f0" {...O(5)} /><path d="M-60 -46 L 0 6 L 60 -46" fill="none" {...O(5)} /></g>
          </g>
        )}
        {idx === 2 && (
          <g>
            <rect x={600} y={720} width={720} height={60} rx={10} fill="#f4f4f0" {...O(6)} /><line x1={640} y1={780} x2={640} y2={900} {...O(8)} /><line x1={1280} y1={780} x2={1280} y2={900} {...O(8)} />
            <g transform="translate(960 400)"><rect x={-90} y={-30} width={180} height={60} fill={RED} /><rect x={-30} y={-90} width={60} height={180} fill={RED} /></g>
            <Txt x={960} y={600} s={46}>OPERATING ROOM</Txt>
          </g>
        )}
        {idx === 3 && (
          <g>
            <rect x={760} y={760} width={400} height={40} rx={10} fill="#c94a3a" {...O(5)} /><rect x={900} y={800} width={120} height={100} fill="#7d8a96" {...O(5)} />
            <Actor a="relax" t={lt} x={960} y={900} s={0.7} id="barber" over={{ prop: "none", face: { eyes: "half", brows: "worried", mouth: "wavy" }, hat: { dx: 300, dy: 40, rot: 20 } }} />
            <g transform={`translate(${1180 + Math.sin(lt * 0.8) * 20} 420) rotate(${Math.sin(lt * 0.8) * 20})`}><path d="M0 0 L 80 -20 M0 0 L 80 20" {...O(8)} /><circle cx={-16} cy={-14} r={14} fill="none" {...O(6)} /><circle cx={-16} cy={14} r={14} fill="none" {...O(6)} /></g>
            {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={1000 + rnd(i) * 80} y1={480 + ((lt * 3 + i * 30) % 300)} x2={1010 + rnd(i) * 80} y2={490 + ((lt * 3 + i * 30) % 300)} stroke={INK} strokeWidth={4} />)}
          </g>
        )}
        <T3 x={960} y={180} size={80} color={YEL} s={pop(lt, 2)}>{names[idx]}</T3>
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES6C: Record<string, Tpl> = {
  forrestal: Forrestal, hangar: Hangar, elevator: Elevator, reactor: Reactor, unrep: Unrep, town: Town,
};
export { NightSky as NightSky6C };
