// The Ship Guy: detailed ship drawings ("HD", owner-approved direction A, 2026-11-13). Same ink-outline cartoon style
// as the stick figure, but with shading, plating, real ship parts, highlights and grime so ships stop looking flat.
// Every ship: local units, waterline at y=0, bow to the RIGHT, drawn at a design length then scaled to `w` px.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, Sea, Sky, Waterline } from "./art";
import { fontFamily, Svg } from "./scenes";

const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const BOXC = [["#c94a3a", "#a63a2d"], ["#3a73b8", "#2c5b93"], ["#e0a23b", "#b9812a"], ["#4f8a5b", "#3c6c46"], ["#8a5aa8", "#6d4686"], ["#d06a2e", "#a95322"], ["#3f9a9a", "#2f7979"], ["#d9d9d2", "#b4b4ac"]];
const O = (w = 3) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });

/** shared hull paint: vertical gradient + boot-top stripe + antifouling + plating + highlight, clipped to `d` */
const Hull: React.FC<{ id: string; d: string; top: string; mid: string; low: string; bootY: number; bottom?: string; plates?: number; len: number; deck: number; keel: number; rust?: number[] }> = ({ id, d, top, mid, low, bootY, bottom = "#b8432f", plates = 24, len, deck, keel, rust = [] }) => (
  <g>
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="0.6" stopColor={mid} /><stop offset="1" stopColor={low} /></linearGradient>
      <linearGradient id={`${id}-r`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={bottom} /><stop offset="1" stopColor="#7d2a1e" /></linearGradient>
      <clipPath id={`${id}-c`}><path d={d} /></clipPath>
    </defs>
    <path d={d} fill={`url(#${id}-g)`} />
    <g clipPath={`url(#${id}-c)`}>
      <rect x={-20} y={bootY + 6} width={len + 40} height={keel - bootY + 20} fill={`url(#${id}-r)`} />
      <rect x={-20} y={bootY} width={len + 40} height={7} fill="#ece6d8" />
      {Array.from({ length: plates }).map((_, i) => <line key={i} x1={(len / plates) * (i + 0.5)} y1={deck} x2={(len / plates) * (i + 0.5) - 2} y2={keel} stroke="#000" strokeOpacity={0.11} strokeWidth={1.5} />)}
      {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={0} y1={deck + (bootY - deck) * k} x2={len} y2={deck + (bootY - deck) * k} stroke="#000" strokeOpacity={0.09} strokeWidth={1.5} />)}
      <rect x={-20} y={deck} width={len + 40} height={8} fill="#fff" opacity={0.14} />
      <rect x={-20} y={keel - 14} width={len + 40} height={14} fill="#000" opacity={0.18} />
      {rust.map((x, i) => <path key={i} d={`M${x} ${deck + 6} q 3 ${18 + (i % 3) * 6} -2 ${36 + (i % 3) * 8}`} stroke="#7a3b22" strokeOpacity={0.32} strokeWidth={4} fill="none" />)}
    </g>
    <path d={d} fill="none" {...O(5)} />
  </g>
);

const Windows: React.FC<{ x: number; y: number; n: number; w: number; h: number; gap: number; c?: string }> = ({ x, y, n, w, h, gap, c = "#33557a" }) => (
  <g>{Array.from({ length: n }).map((_, i) => <rect key={i} x={x + i * (w + gap)} y={y} width={w} height={h} rx={1.5} fill={c} />)}</g>
);
const Lifeboat: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0 q 2 -9 12 -9 h 20 q 10 0 12 9 q -2 6 -12 6 h -20 q -10 0 -12 -6 Z" fill="#f08a24" {...O(2)} /><rect x={10} y={-12} width={24} height={4} fill="#f4f1e8" stroke={INK} strokeWidth={1.2} /></g>
);
const Railing: React.FC<{ x1: number; x2: number; y: number; h?: number }> = ({ x1, x2, y, h = 6 }) => (
  <g stroke={INK} strokeWidth={1.2} opacity={0.75}>
    <line x1={x1} y1={y - h} x2={x2} y2={y - h} />
    {Array.from({ length: Math.max(1, Math.floor((x2 - x1) / 8)) }).map((_, i) => <line key={i} x1={x1 + i * 8} y1={y - h} x2={x1 + i * 8} y2={y} />)}
  </g>
);

// ================================================================== 1. container ship (design 1000)
export const BoxShipHD: React.FC<{ w: number; name?: string }> = ({ w, name = "" }) => {
  const d = "M0 -78 L905 -78 Q955 -78 985 -96 Q1000 -60 992 -20 Q984 30 958 46 L60 46 Q18 46 6 20 Q-2 -10 0 -78 Z";
  const bays = 19, bw = 42, x0 = 112;
  return (
    <g transform={`scale(${w / 1000})`}>
      <Hull id="bxh" d={d} top="#2a3c61" mid="#1f2e4c" low="#16223a" bootY={2} len={1000} deck={-78} keel={46} rust={[930, 610, 420, 240]} />
      <g transform="translate(948 -64)"><circle r={7} fill="#121a2a" stroke={INK} strokeWidth={2} /><path d="M0 7 v14 m-7 -6 q7 10 14 0" stroke="#9aa3ab" strokeWidth={2.5} fill="none" /></g>
      {[0, 1, 2, 3].map((k) => <text key={k} x={952} y={-6 - k * 12} fontSize={8} fill="#ece6d8" fontWeight={700} textAnchor="end">{`${12 - k * 2}M`}</text>)}
      {name && <text x={860} y={-46} textAnchor="end" fontFamily={fontFamily} fontSize={22} fontWeight={700} fill="#f1ede3" letterSpacing={2}>{name}</text>}
      <path d="M905 -78 L975 -96 L975 -104 L912 -92 Z" fill="#d9d4c7" {...O(3)} />
      <path d="M876 -78 l 10 -32 l 7 0 l -4 32" fill="#c9c3b5" {...O(2.5)} />
      {Array.from({ length: bays }).map((_, b) => {
        if (b === 13) return null;
        const x = x0 + b * bw;
        const tiers = 6 - (b < 2 ? 2 : b > 16 ? 2 : 0) - (b === 12 || b === 14 ? 1 : 0);
        return (
          <g key={b}>
            {Array.from({ length: tiers }).map((_, k) => {
              const c = BOXC[Math.floor(rnd(b * 13 + k * 7) * BOXC.length)];
              const y = -78 - (k + 1) * 17;
              return (
                <g key={k}>
                  <rect x={x} y={y} width={bw - 3} height={16.5} fill={c[0]} stroke={INK} strokeWidth={1.4} />
                  {[0.2, 0.4, 0.6, 0.8].map((q) => <line key={q} x1={x + (bw - 3) * q} y1={y + 2} x2={x + (bw - 3) * q} y2={y + 14.5} stroke={c[1]} strokeWidth={1.4} />)}
                  <rect x={x} y={y + 13} width={bw - 3} height={3.5} fill="#000" opacity={0.12} />
                </g>
              );
            })}
            <rect x={x + bw - 4} y={-112} width={3} height={34} fill="#d9d4c7" stroke={INK} strokeWidth={0.8} />
          </g>
        );
      })}
      {/* bridge at ~3/4 */}
      <g transform={`translate(${x0 + 13 * bw - 6} 0)`}>
        <rect x={0} y={-250} width={50} height={172} fill="#efe9dc" {...O(3)} />
        <rect x={0} y={-250} width={8} height={172} fill="#000" opacity={0.08} />
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={10} y={-240 + i * 20} width={34} height={7} fill="#3b5f86" />)}
        <rect x={-26} y={-262} width={102} height={14} fill="#efe9dc" {...O(3)} />
        <rect x={-20} y={-260} width={90} height={7} fill="#20334f" />
        <line x1={25} y1={-262} x2={25} y2={-300} {...O(3)} /><line x1={14} y1={-292} x2={36} y2={-292} {...O(2.5)} />
        <Lifeboat x={2} y={-84} s={1} />
      </g>
      {/* engine casing + funnel aft */}
      <path d="M44 -78 L44 -160 L96 -160 L100 -78 Z" fill="#efe9dc" {...O(3)} />
      <Windows x={52} y={-150} n={3} w={9} h={6} gap={6} />
      <Windows x={52} y={-132} n={3} w={9} h={6} gap={6} />
      <path d="M52 -160 L56 -205 L92 -205 L95 -160 Z" fill="#c9302c" {...O(3)} />
      <rect x={56} y={-205} width={36} height={7} fill="#1d1d22" />
      <rect x={x0} y={-80} width={bays * bw} height={4} fill="#000" opacity={0.25} />
    </g>
  );
};

// ================================================================== 2. LNG carrier with Moss spheres (design 1000)
export const LngHD: React.FC<{ w: number; frost?: number }> = ({ w, frost = 0 }) => {
  const d = "M0 -70 L915 -70 Q960 -70 988 -92 Q1000 -55 993 -18 Q985 28 960 44 L56 44 Q16 44 5 18 Q-2 -12 0 -70 Z";
  return (
    <g transform={`scale(${w / 1000})`}>
      <defs>
        <radialGradient id="lng-dome" cx="0.38" cy="0.3" r="0.8"><stop offset="0" stopColor={frost > 0.5 ? "#ffffff" : "#fbf8f1"} /><stop offset="0.7" stopColor={frost > 0.5 ? "#dcebf6" : "#e7e1d3"} /><stop offset="1" stopColor={frost > 0.5 ? "#b9d6ec" : "#cfc7b6"} /></radialGradient>
      </defs>
      <Hull id="lngh" d={d} top="#2b3d63" mid="#22314f" low="#18233a" bootY={4} len={1000} deck={-70} keel={44} rust={[900, 560, 300]} />
      <rect x={130} y={-82} width={760} height={12} fill="#c9c3b5" {...O(2)} />
      {/* piping trunk along the deck */}
      <rect x={140} y={-96} width={740} height={10} fill="#b9b2a2" {...O(1.5)} />
      {[0.255, 0.43, 0.605, 0.78].map((k, i) => {
        const cx = k * 1000, r = 88;
        return (
          <g key={k}>
            <rect x={cx - r - 6} y={-118} width={2 * r + 12} height={36} fill="#d9d2c2" {...O(2.5)} />
            <path d={`M${cx - r} -118 A ${r} ${r} 0 0 1 ${cx + r} -118 Z`} fill="url(#lng-dome)" {...O(3)} />
            <path d={`M${cx - r * 0.55} ${-118 - r * 0.62} A ${r * 0.9} ${r * 0.9} 0 0 1 ${cx + r * 0.2} ${-118 - r * 0.98}`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.8} />
            <rect x={cx - 10} y={-118 - r - 12} width={20} height={14} fill="#b9b2a2" {...O(2)} />
            {frost > 0 && [0, 1, 2].map((j) => <path key={j} d={`M${cx - 50 + j * 40} ${-130 - j * 10} q 8 -10 16 0`} stroke="#9fd3ff" strokeWidth={3} fill="none" opacity={frost} />)}
            {i < 3 && <rect x={cx + r + 6} y={-100} width={1000 * 0.175 - 2 * r - 12} height={6} fill="#8d969e" />}
          </g>
        );
      })}
      {/* manifold + cranes mid */}
      <g transform="translate(520 -82)"><line x1={0} y1={0} x2={0} y2={-30} {...O(3)} /><line x1={0} y1={-30} x2={34} y2={-12} {...O(2.5)} /></g>
      {/* accommodation aft */}
      <path d="M30 -70 L30 -170 L118 -170 L122 -70 Z" fill="#efe9dc" {...O(3)} />
      <rect x={30} y={-170} width={10} height={100} fill="#000" opacity={0.08} />
      {[0, 1, 2, 3].map((r) => <Windows key={r} x={44} y={-160 + r * 22} n={5} w={10} h={7} gap={5} />)}
      <rect x={18} y={-182} width={116} height={14} fill="#efe9dc" {...O(3)} /><rect x={24} y={-180} width={104} height={7} fill="#20334f" />
      <path d="M58 -182 L62 -226 L96 -226 L99 -182 Z" fill="#2f86c9" {...O(3)} /><rect x={62} y={-226} width={34} height={7} fill="#1d1d22" />
      <line x1={110} y1={-182} x2={110} y2={-220} {...O(3)} />
      <Lifeboat x={124} y={-110} s={0.9} />
      <path d="M930 -70 L978 -90 L978 -98 L936 -84 Z" fill="#d9d4c7" {...O(2.5)} />
      <line x1={960} y1={-92} x2={960} y2={-150} {...O(3)} />
    </g>
  );
};

// ================================================================== 3. superyacht (Azzam-like, design 1000)
export const YachtHD: React.FC<{ w: number }> = ({ w }) => {
  const d = "M0 -30 L860 -34 Q980 -40 1040 -96 Q1020 -20 960 20 Q930 34 880 36 L50 36 Q14 36 4 14 Q-2 -6 0 -30 Z";
  const deck = (y: number, a: number, b: number, sl = 26) => `M${a} ${y} L${a + sl} ${y - 46} L${b - sl * 1.6} ${y - 46} Q${b - 10} ${y - 46} ${b + 10} ${y} Z`;
  return (
    <g transform={`scale(${w / 1000})`}>
      <defs>
        <linearGradient id="yt-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1b2a3c" /><stop offset="0.5" stopColor="#2f4a66" /><stop offset="1" stopColor="#16202e" /></linearGradient>
        <linearGradient id="yt-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dcdcd4" /></linearGradient>
      </defs>
      <Hull id="yth" d={d} top="#fbfbf7" mid="#eeeee8" low="#d6d6cf" bootY={10} bottom="#2b3d63" len={1040} deck={-34} keel={36} plates={0} />
      <path d="M40 -6 L900 -10" stroke="#c9a24a" strokeWidth={4} />
      {/* hull windows band */}
      <rect x={120} y={-22} width={700} height={9} rx={4} fill="url(#yt-glass)" />
      {/* tender garage + swim platform aft */}
      <rect x={30} y={-26} width={70} height={30} fill="#e8e8e1" {...O(2)} /><line x1={30} y1={-11} x2={100} y2={-11} stroke={INK} strokeWidth={1} />
      <path d="M0 4 L-30 4 L-30 12 L4 12" fill="#c9b28a" {...O(2)} />
      {/* superstructure decks */}
      <path d={deck(-34, 70, 840, 30)} fill="url(#yt-white)" {...O(3)} />
      <rect x={110} y={-70} width={690} height={22} rx={8} fill="url(#yt-glass)" />
      <path d={deck(-80, 170, 740, 28)} fill="url(#yt-white)" {...O(3)} />
      <rect x={210} y={-116} width={500} height={22} rx={8} fill="url(#yt-glass)" />
      <path d={deck(-126, 280, 640, 24)} fill="url(#yt-white)" {...O(3)} />
      <rect x={316} y={-162} width={300} height={20} rx={8} fill="url(#yt-glass)" />
      <path d={deck(-172, 380, 560, 20)} fill="url(#yt-white)" {...O(3)} />
      {/* glass reflections */}
      {[[150, -66], [260, -112], [360, -158]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l 40 0 l -18 14 l -40 0 Z`} fill="#fff" opacity={0.18} />)}
      {/* mast + radar domes */}
      <path d="M440 -218 L470 -262 L490 -262 L500 -218 Z" fill="#f4f4ee" {...O(3)} />
      <circle cx={470} cy={-276} r={13} fill="#fff" {...O(2.5)} /><circle cx={500} cy={-272} r={9} fill="#fff" {...O(2)} />
      {/* helipad on the foredeck */}
      <ellipse cx={860} cy={-44} rx={60} ry={10} fill="#5b636b" {...O(2)} />
      <text x={860} y={-40} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">H</text>
      <Railing x1={60} x2={830} y={-36} h={6} />
      <Railing x1={180} x2={720} y={-82} h={6} />
    </g>
  );
};

// ================================================================== 4. cruise ship (design 1000)
export const CruiseHD: React.FC<{ w: number }> = ({ w }) => {
  const d = "M0 -60 L940 -60 Q990 -62 1010 -100 Q1012 -40 990 0 Q970 36 930 44 L50 44 Q12 44 4 16 Q-2 -14 0 -60 Z";
  return (
    <g transform={`scale(${w / 1000})`}>
      <defs><linearGradient id="cr-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e2e2da" /></linearGradient></defs>
      <Hull id="crh" d={d} top="#24406b" mid="#1d3357" low="#152541" bootY={6} len={1010} deck={-60} keel={44} plates={30} rust={[820, 400]} />
      {/* portholes on the hull */}
      {Array.from({ length: 48 }).map((_, i) => <circle key={i} cx={60 + i * 18} cy={-30} r={2.6} fill="#9fc3e6" />)}
      {/* 10 decks of balconies, stepping back at the ends */}
      {Array.from({ length: 10 }).map((_, k) => {
        const a = 20 + k * 6 + (k > 6 ? (k - 6) * 22 : 0), b = 970 - k * 10 - (k > 6 ? (k - 6) * 40 : 0), y = -60 - (k + 1) * 24;
        return (
          <g key={k}>
            <rect x={a} y={y} width={b - a} height={24} fill="url(#cr-white)" stroke={INK} strokeWidth={2} />
            {Array.from({ length: Math.floor((b - a - 14) / 16) }).map((_, i) => (
              <g key={i}><rect x={a + 8 + i * 16} y={y + 5} width={12} height={12} fill="#3b5f86" /><line x1={a + 8 + i * 16} y1={y + 14} x2={a + 20 + i * 16} y2={y + 14} stroke="#fff" strokeWidth={1.4} /></g>
            ))}
            {k === 2 && Array.from({ length: 14 }).map((_, i) => <Lifeboat key={i} x={70 + i * 60} y={y + 22} s={0.85} />)}
          </g>
        );
      })}
      {/* pool deck: pools, slides, umbrellas */}
      <rect x={430} y={-300} width={120} height={10} rx={4} fill="#3fb4e8" {...O(1.5)} /><rect x={600} y={-300} width={90} height={10} rx={4} fill="#3fb4e8" {...O(1.5)} />
      {[460, 520, 630, 660].map((x, i) => <g key={x}><line x1={x} y1={-300} x2={x} y2={-318} stroke={INK} strokeWidth={1.5} /><path d={`M${x - 12} -344 Q${x} -356 ${x + 12} -344 Z`} fill={["#e8352b", "#ffd23f", "#4fb06a", "#e8352b"][i]} stroke={INK} strokeWidth={1.2} /></g>)}
      <path d="M260 -290 q 30 -80 90 -60 q 40 15 30 50" fill="none" stroke="#ffd23f" strokeWidth={10} />
      <path d="M260 -290 q 30 -80 90 -60 q 40 15 30 50" fill="none" stroke={INK} strokeWidth={1.5} />
      <path d="M300 -290 q 10 -110 80 -100 q 50 10 60 100" fill="none" stroke="#3fb4e8" strokeWidth={10} />
      <path d="M300 -290 q 10 -110 80 -100 q 50 10 60 100" fill="none" stroke={INK} strokeWidth={1.5} />
      {/* funnel */}
      <path d="M150 -290 L158 -354 L222 -354 L228 -290 Z" fill="#f4f4ee" {...O(3)} />
      <rect x={156} y={-346} width={68} height={14} fill="#2f6fb0" /><rect x={160} y={-354} width={60} height={6} fill="#1d1d22" />
    </g>
  );
};

// ================================================================== 5. aircraft carrier (design 1000)
export const CarrierHD: React.FC<{ w: number; num?: string }> = ({ w, num = "78" }) => {
  const d = "M0 -52 L1000 -64 Q990 -20 965 10 Q945 34 900 40 L50 40 Q16 40 6 14 Q-2 -14 0 -52 Z";
  return (
    <g transform={`scale(${w / 1000})`}>
      <Hull id="cvh" d={d} top="#8a95a0" mid="#76818c" low="#5f6a74" bootY={8} bottom="#7a3a2a" len={1000} deck={-52} keel={40} plates={30} rust={[880, 640, 300]} />
      <text x={900} y={-14} fontFamily={fontFamily} fontSize={26} fontWeight={700} fill="#fff" textAnchor="middle">{num}</text>
      {/* hangar openings + sponsons */}
      {[160, 420, 700].map((x) => <rect key={x} x={x} y={-44} width={60} height={22} fill="#3d454d" {...O(1.5)} />)}
      {/* flight deck: overhang, markings, angled landing area */}
      <path d="M-30 -60 L1010 -76 L1020 -66 L-24 -48 Z" fill="#4c555e" {...O(3)} />
      <path d="M40 -58 L1000 -73" stroke="#fff" strokeWidth={2} strokeDasharray="14 10" />
      <path d="M60 -55 L560 -64" stroke="#ffd23f" strokeWidth={1.6} />
      <path d="M700 -67 L990 -72" stroke="#fff" strokeWidth={1.2} />
      {/* island with phased-array panels + mast */}
      <path d="M600 -64 L604 -150 L676 -150 L680 -66 Z" fill="#8e99a4" {...O(3)} />
      <rect x={600} y={-150} width={10} height={86} fill="#000" opacity={0.1} />
      <rect x={612} y={-138} width={22} height={22} fill="#5f6a74" {...O(1.5)} /><rect x={644} y={-138} width={22} height={22} fill="#5f6a74" {...O(1.5)} />
      <Windows x={612} y={-106} n={4} w={11} h={6} gap={5} c="#20334f" />
      <path d="M620 -150 L626 -196 L654 -196 L660 -150 Z" fill="#8e99a4" {...O(2.5)} />
      <line x1={640} y1={-196} x2={640} y2={-240} {...O(3)} /><line x1={624} y1={-226} x2={656} y2={-226} {...O(2.5)} />
      <circle cx={640} cy={-244} r={6} fill="#d9d9d2" {...O(1.5)} />
      <text x={640} y={-78} textAnchor="middle" fontFamily={fontFamily} fontSize={18} fontWeight={700} fill="#fff">{num}</text>
      {/* parked jets (wings folded) */}
      {[[120, -64], [190, -65], [260, -66], [740, -69], [810, -70], [880, -71], [480, -66]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 0 L40 -2 L48 -6 L40 -8 L10 -8 L4 -14 L0 -14 Z" fill="#b9c3cc" stroke={INK} strokeWidth={1.4} />
          <path d="M18 -8 L24 -14 L28 -14 L26 -8 Z" fill="#9aa4ad" stroke={INK} strokeWidth={1} />
        </g>
      ))}
    </g>
  );
};

// ================================================================== 6. attack submarine (design 1000)
export const SubHD: React.FC<{ w: number }> = ({ w }) => {
  const d = "M0 0 Q14 -42 110 -46 L860 -46 Q985 -42 1000 0 Q985 42 860 46 L110 46 Q14 42 0 0 Z";
  return (
    <g transform={`scale(${w / 1000})`}>
      <defs>
        <linearGradient id="sb-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a5058" /><stop offset="0.35" stopColor="#2a2f36" /><stop offset="1" stopColor="#15181d" /></linearGradient>
        <clipPath id="sb-c"><path d={d} /></clipPath>
      </defs>
      <path d={d} fill="url(#sb-g)" />
      <g clipPath="url(#sb-c)">
        {Array.from({ length: 60 }).map((_, i) => <line key={i} x1={i * 17} y1={-50} x2={i * 17} y2={50} stroke="#000" strokeOpacity={0.18} strokeWidth={1} />)}
        {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={0} y1={-40 + i * 16} x2={1000} y2={-40 + i * 16} stroke="#000" strokeOpacity={0.14} strokeWidth={1} />)}
        <path d="M60 -38 Q500 -54 960 -30" stroke="#fff" strokeOpacity={0.18} strokeWidth={6} fill="none" />
      </g>
      <path d={d} fill="none" {...O(5)} />
      {/* sail with fairwater planes, masts */}
      <path d="M640 -46 L648 -132 Q652 -138 660 -138 L730 -138 Q740 -138 742 -128 L748 -46 Z" fill="url(#sb-g)" {...O(4)} />
      <path d="M642 -100 l -40 4 l 0 6 l 42 -2 Z M744 -100 l 40 4 l 0 6 l -42 -2 Z" fill="#2a2f36" {...O(2)} />
      {[[672, 30], [690, 44], [708, 22]].map(([x, h], i) => <rect key={i} x={x} y={-138 - h} width={6} height={h} fill="#3a4048" {...O(1.5)} />)}
      {/* hatch + white draft marks */}
      <ellipse cx={300} cy={-45} rx={16} ry={4} fill="#3a4048" {...O(1.5)} />
      {[0, 1, 2].map((k) => <rect key={k} x={940} y={-10 + k * 12} width={14} height={2} fill="#ece6d8" />)}
      {/* stern: rudder + cross planes + pump-jet shroud */}
      <path d="M40 -40 L-20 -80 L-36 -80 L-12 -4 Z" fill="#2a2f36" {...O(3)} />
      <path d="M-20 -8 L-60 -12 L-60 12 L-20 8 Z" fill="#3a4048" {...O(3)} />
    </g>
  );
};

// ================================================================== 7. harbour tug (design 400)
export const TugHD: React.FC<{ w: number }> = ({ w }) => {
  const d = "M0 -48 L320 -48 Q372 -48 398 -14 Q402 18 380 34 L36 34 Q6 34 2 8 Q-2 -20 0 -48 Z";
  return (
    <g transform={`scale(${w / 400})`}>
      <Hull id="tgh" d={d} top="#d94a3a" mid="#c03c2e" low="#9d3024" bootY={6} bottom="#2b2b30" len={400} deck={-48} keel={34} plates={12} rust={[340, 120]} />
      {/* rubber fender along the sheer + bow tyres */}
      <rect x={-4} y={-52} width={330} height={13} rx={6} fill="#26262b" {...O(2.5)} />
      <path d="M326 -52 Q384 -52 402 -16 Q406 0 400 10" fill="none" stroke="#26262b" strokeWidth={18} strokeLinecap="round" />
      {[350, 372, 390].map((x, i) => <circle key={x} cx={x} cy={-30 + i * 10} r={8} fill="#26262b" {...O(2)} />)}
      {/* deck gear: towing winch aft, bitts */}
      <rect x={30} y={-74} width={56} height={22} rx={6} fill="#2f6fb0" {...O(2.5)} /><circle cx={58} cy={-63} r={9} fill="#1f1f24" />
      <rect x={110} y={-64} width={10} height={14} fill="#1f1f24" /><rect x={250} y={-64} width={10} height={14} fill="#1f1f24" />
      {/* superstructure + wraparound wheelhouse */}
      <path d="M150 -48 L150 -104 L292 -104 L300 -48 Z" fill="#f4f1e8" {...O(3)} />
      <rect x={150} y={-104} width={10} height={56} fill="#000" opacity={0.08} />
      <Windows x={168} y={-92} n={4} w={18} h={10} gap={10} />
      <path d="M170 -104 L176 -148 L300 -148 L312 -104 Z" fill="#f4f1e8" {...O(3)} />
      <path d="M182 -140 L296 -140 L304 -116 L178 -116 Z" fill="#20334f" />
      <path d="M190 -138 l 26 0 l -10 18 l -26 0 Z" fill="#fff" opacity={0.2} />
      {/* mast with lights + radar, exhaust stacks */}
      <line x1={236} y1={-148} x2={236} y2={-206} {...O(3)} /><line x1={216} y1={-180} x2={256} y2={-180} {...O(2.5)} />
      <circle cx={236} cy={-208} r={4} fill="#ffd23f" {...O(1.2)} />
      {[118, 136].map((x) => <g key={x}><rect x={x} y={-130} width={12} height={82} fill="#e0a12a" {...O(2.5)} /><rect x={x} y={-130} width={12} height={8} fill="#1d1d22" /></g>)}
      <text x={60} y={-20} fontFamily={fontFamily} fontSize={16} fontWeight={700} fill="#fff">TUG</text>
    </g>
  );
};

// ================================================================== 8. 14-ft aluminium jon boat (design 420), optional tiller motor
export const JonHD: React.FC<{ w: number; motor?: boolean }> = ({ w, motor = false }) => (
  <g transform={`scale(${w / 420})`}>
    <defs><linearGradient id="jon-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfe5ea" /><stop offset="0.5" stopColor="#b9c3cc" /><stop offset="1" stopColor="#8f9aa4" /></linearGradient></defs>
    <path d="M0 -58 L372 -58 L420 -34 L404 12 Q398 22 386 22 L20 22 Q4 22 2 6 Z" fill="url(#jon-g)" {...O(5)} />
    <rect x={0} y={-62} width={374} height={8} rx={3} fill="#9aa4ad" {...O(2)} />
    {[40, 100, 160, 220, 280, 340].map((x) => <g key={x}><line x1={x} y1={-52} x2={x - 4} y2={18} stroke="#7d8790" strokeWidth={2.5} />{[-40, -20, 0].map((y) => <circle key={y} cx={x - 1} cy={y} r={2} fill="#6b757e" />)}</g>)}
    <path d="M10 -30 L380 -30" stroke="#fff" strokeOpacity={0.35} strokeWidth={5} />
    <rect x={150} y={-74} width={90} height={12} fill="#7d8790" {...O(2.5)} /><rect x={300} y={-70} width={60} height={10} fill="#7d8790" {...O(2)} />
    {motor && (
      <g transform="translate(-6 -64)">
        <rect x={-40} y={-30} width={46} height={44} rx={12} fill="#1f1f24" {...O(3)} />
        <rect x={-34} y={-22} width={30} height={5} fill="#c8c8c8" />
        <line x1={6} y1={-12} x2={60} y2={-30} {...O(4)} />
        <rect x={-24} y={14} width={14} height={70} fill="#2b2b30" {...O(2)} />
        <ellipse cx={-17} cy={88} rx={9} ry={20} fill="#9aa3ab" {...O(2)} />
      </g>
    )}
  </g>
);

// ================================================================== 9. V12 outboard (design height 520, origin at the mounting bracket top)
export const V12HD: React.FC<{ h: number }> = ({ h }) => (
  <g transform={`scale(${h / 520})`}>
    <defs>
      <linearGradient id="v12-c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a3d44" /><stop offset="0.45" stopColor="#1f2126" /><stop offset="1" stopColor="#0f1013" /></linearGradient>
      <linearGradient id="v12-m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5a5e66" /><stop offset="1" stopColor="#24262b" /></linearGradient>
    </defs>
    {/* cowling */}
    <path d="M-100 -20 Q-110 -150 -60 -200 Q0 -232 70 -200 Q112 -160 104 -20 Z" fill="url(#v12-c)" {...O(6)} />
    <path d="M-70 -180 Q-20 -210 40 -196" stroke="#fff" strokeOpacity={0.35} strokeWidth={10} fill="none" />
    <rect x={-98} y={-70} width={202} height={10} fill="#bfc4ca" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={50} y={-170 + i * 18} width={40} height={6} rx={3} fill="#0a0b0d" />)}
    <text x={-10} y={-110} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={54} fill="#e6e6e6">V12</text>
    {/* clamp bracket */}
    <rect x={-128} y={-10} width={40} height={70} rx={8} fill="#6b7078" {...O(3)} />
    {/* midsection + gearcase */}
    <path d="M-60 -20 L60 -20 L48 200 L-48 200 Z" fill="url(#v12-m)" {...O(4)} />
    <path d="M-90 200 L90 200 L76 214 L-76 214 Z" fill="#2b2d33" {...O(3)} />
    <path d="M-40 214 L40 214 Q46 300 0 330 Q-46 300 -40 214 Z" fill="url(#v12-m)" {...O(4)} />
    <path d="M30 230 L66 260 L52 266 L24 244 Z" fill="#2b2d33" {...O(2)} />
    {/* propeller */}
    <ellipse cx={0} cy={300} rx={14} ry={18} fill="#c9ccd1" {...O(3)} />
    <path d="M0 300 Q-80 270 -96 300 Q-70 330 0 300 Z M0 300 Q80 330 96 300 Q70 270 0 300 Z" fill="#c9ccd1" {...O(3)} />
  </g>
);

// ================================================================== look test: all ships in one frame
export const ShipLook: React.FC = () => (
  <AbsoluteFill style={{ background: "#cfe6f5" }}>
    <Svg>
      {[[60, 300], [1000, 300], [60, 640], [1000, 600], [60, 900], [1040, 860]].map(([x, y], i) => (
        <rect key={i} x={x - 20} y={y} width={i % 2 ? 880 : 920} height={60} fill="#7fb6dc" opacity={0.6} />
      ))}
      <g transform="translate(60 300)"><BoxShipHD w={880} /></g>
      <g transform="translate(1000 300)"><LngHD w={860} /></g>
      <g transform="translate(60 640)"><CruiseHD w={880} /></g>
      <g transform="translate(1000 600)"><YachtHD w={820} /></g>
      <g transform="translate(60 900)"><CarrierHD w={880} /></g>
      <g transform="translate(1060 860)"><SubHD w={760} /></g>
      <g transform="translate(1100 1040)"><TugHD w={300} /></g>
      <g transform="translate(1480 1040)"><JonHD w={300} motor /></g>
      <g transform="translate(1840 760)"><V12HD h={200} /></g>
    </Svg>
  </AbsoluteFill>
);
