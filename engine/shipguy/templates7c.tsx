// The Ship Guy: Felicity Ace video (#7), part 3 scenes: two weeks adrift (salvage, tow, sinking, oil watch),
// the bill (customers waiting, Lamborghini restarting production), and the mystery (Panama report, lawsuit, Stuttgart ruling).
// No brand logos: companies appear only as plain text labels. Frame-driven only.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, IDLE, POSES } from "./guy";
import { ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, clamp01, pop } from "./templates3";
import { rnd, YEL, RED } from "./templates5";
import { DaySky, OpenSea, TopSea } from "./templates6";
import { Car, CarKind, CarTop, CAR_COLORS, O, Pctc, Txt, ease } from "./templates7";

const SMOKE = "#3b3a3c";
const Tug: React.FC<{ name?: string; spray?: number; t?: number }> = ({ name, spray = 0, t = 0 }) => (
  <g>
    <path d="M0 -30 L 220 -30 Q 270 -26 280 0 L 262 30 L 18 30 Q 0 10 0 -30 Z" fill="#e06a2e" {...O(5)} />
    <rect x={0} y={-30} width={280} height={12} fill="#2a2d33" />
    <rect x={150} y={-90} width={80} height={60} fill="#f4f4f0" {...O(4)} />
    {[0, 1, 2].map((i) => <rect key={i} x={158 + i * 24} y={-80} width={16} height={12} fill="#2c4a7a" />)}
    <rect x={120} y={-120} width={16} height={90} fill="#2a2d33" {...O(3)} />
    {name && <Txt x={90} y={14} s={24} c="#fff">{name}</Txt>}
    {spray > 0 && (
      <g opacity={spray}>
        <path d="M200 -100 Q 60 -320 -260 -220" stroke="#cde9f7" strokeWidth={16} fill="none" />
        {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={-260 + rnd(i) * 80} cy={-220 + ((t * 4 + i * 14) % 80)} r={8} fill="#cde9f7" />)}
      </g>
    )}
  </g>
);

// ================================================================== 7. two weeks adrift
const Salvage: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "team";
  if (m === "team" || m === "plane") {
    const plane = m === "plane";
    const k = ease((t - 4) / Math.max(30, d - 10));
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={plane ? 760 : 1080} />
          {plane ? (
            <g>
              <OpenSea t={t} y={760} />
              <path d="M1300 760 Q 1500 560 1700 600 Q 1820 640 1920 600 V 760 Z" fill="#7d9a6a" {...O(6)} />
              <T3 x={1600} y={540} size={50}>AZORES</T3>
              <g transform={`translate(${200 + k * 1200} ${240 + k * 260}) rotate(${12 * k})`}>
                <path d="M-160 0 Q -160 -30 -120 -30 L 140 -30 Q 190 -20 200 0 Q 190 20 140 24 L -120 24 Q -160 24 -160 0 Z" fill="#f4f4f0" {...O(6)} />
                <path d="M-20 -10 L 60 -110 L 90 -110 L 50 -10 Z" fill="#c9cfd5" {...O(5)} />
                <path d="M-150 -20 L -170 -80 L -140 -80 L -120 -24 Z" fill="#e06a2e" {...O(5)} />
                {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={-90 + i * 34} cy={-6} r={8} fill="#2c4a7a" />)}
              </g>
              <g transform={`translate(1500 980) scale(${pop(t, 30)})`}><rect x={-140} y={-60} width={280} height={120} rx={20} fill="#0b1426" {...O(6)} /><text x={0} y={34} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={90} fill={YEL}>× 16</text></g>
            </g>
          ) : (
            <g>
              <rect x={0} y={800} width={W} height={280} fill="#9aa4ad" {...O(5)} />
              <rect x={1100} y={380} width={700} height={420} fill="#f4f4f0" {...O(8)} />
              <rect x={1140} y={420} width={620} height={110} fill="#e06a2e" {...O(6)} />
              <Txt x={1450} y={500} s={60} c="#fff">SMIT SALVAGE</Txt>
              <Txt x={1450} y={620} s={40}>THE NETHERLANDS</Txt>
              {[0, 1, 2, 3, 4].map((i) => <Actor key={i} a={i === 2 ? "point" : "watch"} t={t + i * 7} x={180 + i * 170} y={1040} s={0.42} id={`sm${i}`} outfit="coverall" over={{ face: FACES.confident }} />)}
              <Actor a="fingerup" t={t} x={980} y={1040} s={0.48} id="smsg" w={w} />
            </g>
          )}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "spray" || m === "days" || m === "calmer" || m === "board") {
    const fire = m === "calmer" ? 1 - ease((t - 4) / 50) * 0.7 : m === "board" ? 0.25 : 1;
    const day = m === "days" ? Math.min(13, 1 + Math.floor(t / 6)) : null;
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={680} />
          <rect width={W} height={680} fill="#5d6b80" opacity={0.25} />
          <OpenSea t={t} y={700} />
          <g transform="translate(240 710)"><Pctc L={1400} fire={fire} scorch={0.6 + (m === "board" ? 0.4 : 0.2)} t={t} /></g>
          {(m === "spray" || m === "days") && [0, 1].map((i) => <g key={i} transform={`translate(${1500 + i * 220} ${800 + i * 50}) scale(0.9)`}><Tug spray={1} t={t + i * 9} /></g>)}
          {m === "board" && (
            <g>
              <g transform={`translate(${1100 + Math.sin(t * 0.1) * 6} 760)`}><path d="M-140 -20 L 140 -20 L 110 30 L -110 30 Z" fill="#2c4a7a" {...O(5)} /><rect x={-40} y={-60} width={80} height={40} fill="#f4f4f0" {...O(3)} /></g>
              <line x1={1120} y1={740} x2={1120} y2={480} stroke="#8a6a4a" strokeWidth={6} />
              <Actor a="rope" t={t} x={1120} y={600 - Math.min(110, t * 1.5)} s={0.22} id="brd" outfit="coverall" />
              <Actor a="look" t={t} x={1260} y={470} s={0.26} id="brd2" outfit="coverall" over={{ face: { eyes: "wide", brows: "worried", mouth: "o" } }} />
            </g>
          )}
          {day !== null && (
            <g transform="translate(260 250)">
              <rect x={-130} y={-130} width={260} height={260} rx={16} fill="#f4f4f0" {...O(7)} />
              <rect x={-130} y={-130} width={260} height={70} rx={16} fill={RED} {...O(7)} />
              <Txt x={0} y={-80} s={40} c="#fff">DAY</Txt>
              <Txt x={0} y={80} s={120}>{day}</Txt>
            </g>
          )}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "tow" || m === "lean") {
    const lean = m === "lean" ? ease((t - 6) / 60) * 9 : 0;
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={680} />
          <OpenSea t={t * 1.5} y={700} />
          <g transform={`translate(${160 - (m === "tow" ? t * 0.3 : 0)} 710) rotate(${-lean} 900 0)`}><Pctc L={1200} scorch={1} t={t} fire={0.15} /></g>
          <path d={`M1400 640 Q 1550 ${700 + lean * 4} 1660 760`} stroke={INK} strokeWidth={6} fill="none" />
          <g transform={`translate(${1640 + (m === "tow" ? Math.sin(t * 0.05) * 10 : 0)} 790) scale(1.1)`}><Tug name="BEAR" /></g>
          {m === "lean" && <g transform="translate(300 300)"><rect x={-130} y={-130} width={260} height={260} rx={16} fill="#f4f4f0" {...O(7)} /><rect x={-130} y={-130} width={260} height={70} rx={16} fill={RED} {...O(7)} /><Txt x={0} y={-80} s={40} c="#fff">MARCH</Txt><Txt x={0} y={80} s={120}>1</Txt></g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "cars") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#0d2440" />
          {Array.from({ length: 40 }).map((_, i) => {
            const k = ((t * 1.2 + i * 17) % 200) / 200;
            return <g key={i} transform={`translate(${100 + (i * 173) % 1720} ${-100 + k * 1300}) rotate(${(i % 7) * 25 + t * (i % 3)})`} opacity={1 - k * 0.6}><Car kind={(["sport", "suv", "sedan", "super"] as CarKind[])[i % 4]} c={CAR_COLORS[i % CAR_COLORS.length]} s={1.2} /></g>;
          })}
          <rect x={0} y={980} width={W} height={100} fill="#1a2a3a" />
        </Svg>
      </AbsoluteFill>
    );
  }
  // oil / sat
  const sat = m === "sat";
  return (
    <AbsoluteFill>
      <Svg>
        <TopSea t={t} />
        <circle cx={960} cy={560} r={sat ? 260 : 160} fill="none" stroke={YEL} strokeWidth={8} strokeDasharray="24 16" />
        {[0, 1, 2].map((i) => { const a = t * 0.01 + i * 2.1; return <g key={i} transform={`translate(${960 + Math.cos(a) * 400} ${560 + Math.sin(a) * 300}) rotate(${(a * 180) / Math.PI + 90}) scale(0.6)`}><rect x={-120} y={-30} width={240} height={60} rx={20} fill="#e06a2e" {...O(6)} /></g>; })}
        {sat && <g transform={`translate(${200 + t * 4} 160)`}><rect x={-40} y={-30} width={80} height={60} fill="#c9cfd5" {...O(5)} /><rect x={-150} y={-16} width={100} height={32} fill="#2c4a7a" {...O(4)} /><rect x={50} y={-16} width={100} height={32} fill="#2c4a7a" {...O(4)} /><path d="M0 30 L -120 300 L 120 300 Z" fill={YEL} opacity={0.15} /></g>}
        {sat && <g transform={`translate(1500 820) scale(${pop(t, 30)})`}><circle r={70} fill="#3f9a4f" {...O(6)} /><path d="M-30 0 L -6 22 L 34 -22" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" /></g>}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 8. the bill
const Bill: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "receipt";
  if (m === "receipt") {
    const k = ease((t - 2) / 24);
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#f3f1ea" />
          <path d={`M780 140 L 1180 140 L 1180 ${180 + k * 860} L 780 ${180 + k * 860} Z`} fill="#fff" {...O(6)} />
          {Array.from({ length: 12 }).map((_, i) => <g key={i} opacity={k * 12 > i ? 1 : 0}><rect x={820} y={200 + i * 66} width={200} height={14} fill="#c9cfd5" /><rect x={1060} y={200 + i * 66} width={80} height={14} fill="#c9cfd5" /></g>)}
          <Actor a="shock" t={Math.max(0, t - 8)} x={480} y={1040} s={0.8} id="rcp" w={w} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "showroom") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#e8eef2" />
          <rect x={0} y={780} width={W} height={300} fill="#c9cfd5" {...O(5)} />
          <rect x={100} y={120} width={1720} height={560} fill="#cfe5f2" {...O(8)} />
          <g transform="translate(560 780)"><Car kind="sport" c="#c94a3a" s={2.6} /></g>
          <rect x={1080} y={700} width={420} height={80} fill="none" stroke="#9aa4ad" strokeWidth={6} strokeDasharray="20 14" />
          <g transform="translate(1290 640) rotate(-6)"><rect x={-120} y={-40} width={240} height={80} rx={10} fill={RED} {...O(5)} /><Txt x={0} y={16} s={44} c="#fff">SOLD</Txt></g>
          <Actor a="worried" t={t} x={1620} y={1060} s={0.55} id="cust" outfit="officer" over={{ face: { eyes: "dot", brows: "worried", mouth: "frown", lookX: -0.8 } }} />
          <g transform="translate(1620 300)"><circle r={70} fill="#f4f4f0" {...O(6)} /><line x1={0} y1={0} x2={0} y2={-46} {...O(8)} /><line x1={0} y1={0} x2={36 * Math.cos(t * 0.3)} y2={36 * Math.sin(t * 0.3)} {...O(6)} /></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "lambo" || m === "factory") {
    const on = m === "factory";
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill={on ? "#e8e3d6" : "#3a3a3e"} />
          <rect x={0} y={800} width={W} height={280} fill={on ? "#9aa4ad" : "#2a2a2e"} {...O(5)} />
          {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={120 + i * 300} y={120} width={200} height={24} rx={8} fill="#fff7c2" opacity={on ? 0.9 : 0.1} />)}
          <rect x={300} y={240} width={1320} height={110} rx={12} fill={on ? "#e0a23b" : "#5a5040"} {...O(6)} />
          <Txt x={960} y={315} s={60} c={on ? INK : "#8a8070"}>LAMBORGHINI · AVENTADOR LINE</Txt>
          {on ? Array.from({ length: 5 }).map((_, i) => <g key={i} transform={`translate(${((i * 380 + t * 6) % (W + 300)) - 150} 800)`}><Car kind="super" c={["#e0a23b", "#4f8a5b", "#c94a3a", "#3a73b8", "#f4f4f0"][i]} s={2.2} /></g>)
            : <g transform="translate(960 600)"><rect x={-260} y={-60} width={520} height={120} rx={16} fill="#2a2a2e" stroke="#8a8070" strokeWidth={6} /><Txt x={0} y={20} s={60} c="#8a8070">PRODUCTION ENDED</Txt></g>}
          {on && <Actor a="salute" t={t} x={1720} y={1060} s={0.5} id="lsal" w={w} />}
          {on && <g transform={`translate(400 560) scale(${pop(t, 6)})`}><rect x={-190} y={-60} width={380} height={120} rx={16} fill="#0b1426" {...O(6)} /><text x={0} y={36} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={90} fill={YEL}>{Math.min(15, Math.floor(t / 4))}/15</text></g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  // seafloor: fifteen supercars on the bottom, fish swimming past
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#0d2440" />
        <path d="M0 880 Q 480 820 960 870 T 1920 860 V 1080 H 0 Z" fill="#3a3a30" />
        {Array.from({ length: 15 }).map((_, i) => <g key={i} transform={`translate(${120 + (i % 8) * 230 + (i >= 8 ? 110 : 0)} ${i >= 8 ? 960 : 880}) rotate(${(i % 3 - 1) * 6})`} opacity={0.85}><Car kind="super" c="#7a6a40" s={1.6} /></g>)}
        {Array.from({ length: 5 }).map((_, i) => { const x = ((t * (2 + i) + i * 400) % (W + 200)) - 100; return <g key={`f${i}`} transform={`translate(${x} ${300 + i * 90})`}><ellipse rx={30} ry={14} fill="#e0a23b" {...O(3)} /><path d="M-30 0 l -20 -14 l 0 28 Z" fill="#e0a23b" {...O(3)} /></g>; })}
        {Array.from({ length: 10 }).map((_, i) => <circle key={`b${i}`} cx={rnd(i) * W} cy={(H - ((t * 3 + i * 90) % H))} r={6 + rnd(i + 2) * 8} fill="#9fd3ee" opacity={0.4} />)}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 9. the mystery
const Report: React.FC<{ title: string; sub: string; rot?: number }> = ({ title, sub, rot = -2 }) => (
  <g transform={`translate(960 560) rotate(${rot})`}>
    <rect x={-420} y={-440} width={840} height={880} fill="#fbfaf4" {...O(8)} />
    <Txt x={0} y={-360} s={40} c="#2c4a7a">{title}</Txt>
    <Txt x={0} y={-310} s={32}>{sub}</Txt>
    {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-340} y={-240 + i * 56} width={680 - (i % 3) * 120} height={16} fill="#c9cfd5" />)}
  </g>
);
const Courtroom: React.FC<{ t: number; gavel?: number }> = ({ t, gavel = 0 }) => (
  <g>
    <rect width={W} height={H} fill="#e8d6a6" />
    <rect x={0} y={760} width={W} height={320} fill="#8a6a4a" {...O(6)} />
    {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={120 + i * 300} y={140} width={60} height={620} fill="#d9c18a" {...O(4)} />)}
    <rect x={560} y={560} width={800} height={220} fill="#7a4a2a" {...O(6)} />
    <g transform={`translate(880 520) rotate(${-40 + gavel * 40} 120 0)`}><rect x={0} y={-36} width={180} height={72} rx={12} fill="#5a3a22" {...O(6)} /><rect x={80} y={36} width={18} height={180} fill="#5a3a22" {...O(5)} /></g>
  </g>
);
const Case: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "panama";
  if (m === "panama") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#d9d6cc" />
          <g transform="translate(340 300)">
            <rect x={-200} y={-130} width={400} height={260} fill="#fff" {...O(6)} />
            <rect x={0} y={-130} width={200} height={130} fill={RED} /><rect x={-200} y={0} width={200} height={130} fill="#2c4a7a" />
            <path d="M-100 -80 l 14 40 l -36 -26 h 44 l -36 26 Z" fill="#2c4a7a" /><path d="M100 50 l 14 40 l -36 -26 h 44 l -36 26 Z" fill={RED} />
            <line x1={-200} y1={-130} x2={-200} y2={420} stroke={INK} strokeWidth={10} />
          </g>
          <g transform={`translate(0 ${-(1 - ease((t - 6) / 14)) * 900})`}><g transform="translate(300 40) scale(0.8)"><Report title="PANAMA MARITIME AUTHORITY" sub="FELICITY ACE · R-013-2022" /></g></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "taycan" || m === "unknown") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#3a424b" />
          <rect x={0} y={800} width={W} height={280} fill="#5a636c" />
          <g transform="translate(960 800)"><Car kind="sport" c="#f4f4f0" s={5} ev glow={m === "taycan" ? 0.6 + 0.3 * Math.sin(t * 0.4) : 0.3} /></g>
          <T3 x={960} y={300} size={60} color="#fff">{m === "taycan" ? "THE CREW SAID: HERE" : "BUT WHY?"}</T3>
          {m === "unknown" && <T3 x={960} y={520} size={240} color={YEL} s={pop(t, 8)}>?</T3>}
          {m === "taycan" && <path d="M960 340 L 960 560" stroke={YEL} strokeWidth={10} strokeDasharray="20 14" />}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "causes") {
    const items = ["FAULTY BATTERY CELL?", "DAMAGE DURING ASSEMBLY?", "SHORT CIRCUIT?"];
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#f3f1ea" />
          {items.map((s, i) => (
            <g key={s} transform={`translate(960 ${300 + i * 220}) scale(${pop(t, 6 + i * Math.max(10, (d - 60) / 3))})`}>
              <rect x={-520} y={-80} width={1040} height={160} rx={24} fill="#fff" {...O(7)} />
              <Txt x={0} y={22} s={64}>{s}</Txt>
            </g>
          ))}
          <g transform={`translate(960 980) rotate(-4) scale(${pop(t, d - 30)})`}><rect x={-300} y={-50} width={600} height={100} rx={14} fill="none" stroke={RED} strokeWidth={12} /><Txt x={0} y={22} s={60} c={RED}>NOT PROVEN</Txt></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "question") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#13233d" />
          <g transform="translate(960 560)"><circle r={260} fill="none" stroke={YEL} strokeWidth={12} strokeDasharray="30 20" /><g transform={`rotate(${-90 + t * 3})`}><line x1={0} y1={0} x2={200} y2={0} stroke="#fff" strokeWidth={14} strokeLinecap="round" /></g><circle r={20} fill="#fff" /></g>
          <T3 x={960} y={240} size={70} color="#fff">EARLY?</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "photo") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#d9d6cc" />
          <g transform={`translate(960 540) rotate(-3) scale(${0.85 + 0.1 * ease(t / 60)})`}>
            <rect x={-660} y={-400} width={1320} height={800} fill="#fff" {...O(8)} />
            <rect x={-620} y={-360} width={1240} height={720} fill="#5a636c" />
            {Array.from({ length: 4 }).map((_, i) => <rect key={i} x={-560 + i * 300} y={-320} width={180} height={20} rx={6} fill="#fff7c2" />)}
            {Array.from({ length: 5 }).map((_, i) => <g key={i} transform={`translate(${-500 + i * 240} 300)`}><Car kind={(["sport", "suv", "sedan"] as CarKind[])[i % 3]} c="#f4f4f0" s={2} /></g>)}
            <circle cx={300} cy={140} r={120} fill="#ff8a3a" opacity={0.4} />
          </g>
          <g transform={`translate(1500 220) scale(${pop(t, 30)})`}><circle r={80} fill="#f4f4f0" {...O(6)} /><circle r={30} fill="none" stroke={INK} strokeWidth={8} /><path d="M-60 0 Q 0 -50 60 0 Q 0 50 -60 0 Z" fill="none" stroke={INK} strokeWidth={8} /></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "hoses") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#4a525b" />
          <rect x={0} y={820} width={W} height={260} fill="#5a636c" />
          {Array.from({ length: 6 }).map((_, i) => <g key={i} transform={`translate(${220 + i * 300} 820)`}><Car kind={(["sport", "suv", "sedan"] as CarKind[])[i % 3]} c={CAR_COLORS[i % CAR_COLORS.length]} s={2} glow={i === 4 ? 0.8 : 0} /></g>)}
          <g transform="translate(160 420)"><rect x={-60} y={-80} width={120} height={160} rx={12} fill={RED} {...O(6)} /><circle r={44} fill="none" stroke="#c9cfd5" strokeWidth={14} /><Txt x={0} y={130} s={34} c="#fff">HOSE</Txt></g>
          <path d={`M220 440 Q 700 ${360 + Math.sin(t * 0.2) * 20} 1300 700`} stroke="#9fd3ee" strokeWidth={18} fill="none" opacity={ramp(t, 20, 30) * 0.8} strokeDasharray="4 0" />
          <T3 x={960} y={240} size={56} color="#fff" o={ramp(t, 10, 20)}>MAYBE… IF THEY'D GONE IN EARLY</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "training" || m === "confidence") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#8e99a4" />
          <rect x={1180} y={180} width={520} height={820} fill="#2a2b30" />
          {m === "training" ? (
            <g transform={`translate(560 500) scale(${pop(t, 4)})`}>
              <rect x={-380} y={-280} width={760} height={560} fill="#fbfaf4" {...O(8)} />
              <Txt x={0} y={-200} s={46} c="#2c4a7a">TRAINING</Txt>
              {["CAR DECK FIRES", "ELECTRIC CARS"].map((s, i) => <g key={s}><rect x={-300} y={-110 + i * 150} width={70} height={70} rx={8} fill="#fff" {...O(5)} /><Txt x={-200} y={-55 + i * 150} s={46} a="start">{s}</Txt><Txt x={-265} y={-55 + i * 150} s={56} c={RED} o={ramp(t, 10 + i * 12, 16 + i * 12)}>✕</Txt></g>)}
            </g>
          ) : (
            <g>
              <Actor a="worried" t={t} x={900} y={1060} s={0.75} id="conf" outfit="coverall" w={w} over={{ face: { eyes: "wide", brows: "worried", mouth: "wavy", lookX: 0.8 }, emote: "sweat", emoteT: t }} />
              <T3 x={1440} y={600} size={120} color="#fff" o={0.3 + 0.2 * Math.sin(t * 0.2)}>?</T3>
            </g>
          )}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "fan") {
    const k = ease((t - 6) / 50);
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#4a525b" />
          <rect x={0} y={820} width={W} height={260} fill="#5a636c" />
          <g transform="translate(1500 500)"><circle r={130} fill="#5a636c" {...O(8)} />{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={0} cy={-60} rx={30} ry={60} fill="#c9cfd5" stroke={INK} strokeWidth={4} transform={`rotate(${i * 90 + 10})`} />)}<circle r={20} fill={INK} /><rect x={-80} y={140} width={160} height={90} rx={10} fill="#3f9a9a" {...O(6)} /><Txt x={0} y={200} s={36} c="#fff">MOTOR</Txt></g>
          <path d="M1500 730 Q 1200 760 900 740 Q 600 720 300 760" stroke="#2a2d33" strokeWidth={14} fill="none" />
          <path d={`M300 760 Q 600 720 ${300 + k * 600} ${760 - k * 20}`} stroke="#ff6a2a" strokeWidth={16} fill="none" />
          <g transform="translate(360 820)"><g transform="scale(1.4)">{Array.from({ length: 5 }).map((_, i) => <path key={i} d={`M${-50 + i * 25} 0 q 14 ${-50 - Math.abs(Math.sin(t * 0.45 + i)) * 40} 4 -90 q 24 36 26 90 Z`} fill={i % 2 ? "#ffb03a" : "#ff6a2a"} />)}</g></g>
          <T3 x={960} y={300} size={56} color="#fff">"PROBABLY" — NOT PROVEN</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "lawsuit" || m === "warn") {
    return (
      <AbsoluteFill>
        <Svg>
          <Courtroom t={t} />
          <g transform={`translate(${m === "lawsuit" ? 500 + ease((t - 6) / 24) * 420 : 920} 900) rotate(-4)`}><rect x={-200} y={-120} width={400} height={240} fill="#fbfaf4" {...O(7)} /><Txt x={0} y={-50} s={40}>CLAIM</Txt><Txt x={0} y={30} s={64} c={RED}>~€30 M</Txt></g>
          <g transform="translate(1560 680)"><rect x={-200} y={-60} width={400} height={120} rx={16} fill="#f4f4f0" {...O(6)} /><Txt x={0} y={18} s={44}>PORSCHE AG</Txt></g>
          <g transform="translate(360 680)"><rect x={-220} y={-60} width={440} height={120} rx={16} fill="#f4f4f0" {...O(6)} /><Txt x={0} y={0} s={34}>SHIP OWNER</Txt><Txt x={0} y={40} s={34}>+ INSURERS</Txt></g>
          {m === "warn" && <g transform={`translate(560 360) scale(${pop(t, 4)})`}><path d="M-380 -90 H 380 V 70 H -40 L -120 150 L -100 70 H -380 Z" fill="#f4f4f0" {...O(7)} /><Txt x={0} y={0} s={42}>"WARN US HOW TO CARRY</Txt><Txt x={0} y={50} s={42}>ELECTRIC CARS SAFELY!"</Txt></g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "ruling" || m === "notproven") {
    const g = Math.max(0, Math.sin(Math.min(1, (t - 6) / 8) * Math.PI));
    return (
      <AbsoluteFill>
        <Svg>
          <Courtroom t={t} gavel={m === "ruling" ? g : 0} />
          {m === "ruling" && <g transform={`translate(960 900) rotate(-6) scale(${pop(t, 12)})`}><rect x={-320} y={-70} width={640} height={140} rx={16} fill="none" stroke={RED} strokeWidth={14} /><Txt x={0} y={30} s={84} c={RED}>REJECTED</Txt></g>}
          {m === "notproven" && <g transform={`translate(960 900) rotate(-4) scale(${pop(t, 4)})`}><rect x={-380} y={-70} width={760} height={140} rx={16} fill="#fbfaf4" {...O(8)} /><Txt x={0} y={26} s={60}>TAYCAN STARTED IT? ✕</Txt></g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "appeal") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#13233d" />
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${520 + i * 880} 600)`}>
              <path d="M-300 200 V -60 L 0 -220 L 300 -60 V 200 Z" fill="#e8d6a6" {...O(8)} />
              {Array.from({ length: 4 }).map((_, j) => <rect key={j} x={-230 + j * 130} y={-40} width={70} height={220} fill="#d9c18a" {...O(4)} />)}
              <rect x={-300} y={200} width={600} height={40} fill="#8a6a4a" {...O(5)} />
              {i === 1 && Array.from({ length: 4 }).map((_, j) => <rect key={`l${j}`} x={-220 + j * 130} y={-20} width={50} height={60} fill="#fff7c2" opacity={0.6 + 0.4 * Math.sin(t * 0.2 + j)} />)}
              <Txt x={0} y={300} s={44} c="#fff">{i === 0 ? "STUTTGART: APPEAL?" : "2ND CASE: ONGOING"}</Txt>
            </g>
          ))}
        </Svg>
      </AbsoluteFill>
    );
  }
  // shrug: the Ship Guy surrounded by question marks
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#f3f1ea" />
        {Array.from({ length: 9 }).map((_, i) => <T3 key={i} x={260 + (i % 5) * 360 + (i >= 5 ? 180 : 0)} y={330 + (i >= 5 ? 240 : 0) + Math.sin(t * 0.1 + i) * 14} size={110} color={YEL} s={pop(t, 4 + i * 3)}>?</T3>)}
        <Actor a="shrug" t={t} x={960} y={1060} s={0.9} id="shr" w={w} />
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES7C: Record<string, Tpl> = { salvage: Salvage, bill: Bill, case: Case };
export { CarTop as CarTop7C, IDLE as IDLE7C, POSES as POSES7C, clamp01 as clamp017C };
