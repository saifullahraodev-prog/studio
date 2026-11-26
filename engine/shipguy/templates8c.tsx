// The Ship Guy: Costa Concordia (video #8), part 3: the salvage (sections 6-8): the problem, the choice,
// parbuckling step by step, refloating, the tow to Genoa, scrapping. The Ship Guy is back (engineering), always on a boat or quay.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, IDLE, POSES } from "./guy";
import { ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, clamp01, pop } from "./templates3";
import { NightSky, rnd, YEL, RED, LAMP } from "./templates5";
import { DaySky } from "./templates6";
import { O, Txt, ease } from "./templates7";
import { COAST, Island, Liner, LinerEnd, LinerTop, PL, Quay8 } from "./templates8";

const SEA = "#3f86b0";
/** small orange work boat (the Ship Guy stands on its deck) */
const WorkBoat: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-170 -20 L 170 -20 L 140 50 L -150 50 Q -170 30 -170 -20 Z" fill="#e0a23b" {...O(7)} />
    <rect x={-160} y={-6} width={320} height={10} fill="#fff" />
    <rect x={60} y={-80} width={80} height={60} rx={8} fill="#f4f4f0" {...O(5)} />
  </g>
);
const DaySea: React.FC<{ t: number; y: number }> = ({ t, y }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill={SEA} />
    {Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M${((i * 151 + t * 1.2) % (W + 200)) - 100} ${y + 40 + (i % 5) * 70} q 22 -8 44 0 t 44 0`} stroke="#bfe6f5" strokeWidth={5} fill="none" />)}
  </g>
);
/** daylight Giglio with the wreck on her side, water in front */
const Site: React.FC<{ t: number; x?: number }> = ({ t, x = 1020 }) => (
  <g>
    <DaySky hz={640} />
    <Island x={620} y={660} s={1.2} />
    <DaySea t={t} y={640} />
    <g transform={`translate(${x} 690)`}><LinerEnd s={1.25} rot={70} /></g>
    <rect x={0} y={660} width={W} height={H - 660} fill={SEA} opacity={0.88} />
    {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${((i * 233 + t * 1.2) % (W + 200)) - 100} ${700 + (i % 4) * 80} q 22 -8 44 0 t 44 0`} stroke="#bfe6f5" strokeWidth={5} fill="none" />)}
    <line x1={0} y1={660} x2={W} y2={660} stroke="#bfe6f5" strokeWidth={5} />
  </g>
);

// ================================================================== 6. the problem, the fuel, the choice, the team
const Site8: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "problem";
  if (m === "side") {
    return (
      <AbsoluteFill>
        <Svg>
          <Parb t={t} a={68} />
          <g opacity={ramp(t, 10, 18)}><path d="M1300 520 Q 1500 420 1700 470" stroke="#4f8a5b" strokeWidth={8} strokeDasharray="16 10" fill="none" /><T3 x={1560} y={410} size={40} color="#d9f2c4">PROTECTED SEA</T3></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Svg>
        <Site t={t} />
        {m === "problem" && <g><WorkBoat x={1640} y={720} s={0.9} /><Actor a="think" t={t} x={1580} y={710} s={0.5} id="site8" w={w} /></g>}
        {m === "stuff" && (["FUEL", "FOOD", "FURNITURE", "SUITCASES"] as const).map((lab, i) => {
          const at = 4 + (d * i) / 5;
          return (
            <g key={lab} transform={`translate(${380 + i * 380} 240) scale(${pop(t, at)})`}>
              <circle r={90} fill="#f4f4f0" {...O(6)} />
              {i === 0 && <path d="M0 -56 Q 40 0 40 20 Q 40 56 0 56 Q -40 56 -40 20 Q -40 0 0 -56 Z" fill="#2a2d33" />}
              {i === 1 && <g><circle r={44} fill="#f4f4f0" {...O(5)} /><circle r={26} fill="#e0a23b" /></g>}
              {i === 2 && <g><rect x={-40} y={-50} width={20} height={100} fill="#8a5a3a" {...O(4)} /><rect x={-40} y={0} width={80} height={16} fill="#8a5a3a" {...O(4)} /><line x1={36} y1={16} x2={36} y2={50} stroke="#8a5a3a" strokeWidth={10} /></g>}
              {i === 3 && <g><rect x={-46} y={-30} width={92} height={70} rx={10} fill="#3a73b8" {...O(5)} /><path d="M-16 -30 L -16 -46 L 16 -46 L 16 -30" stroke={INK} strokeWidth={6} fill="none" /></g>}
              <T3 x={0} y={140} size={34}>{lab}</T3>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

const Fuel8: Tpl = ({ t, d, p }) => {
  const count = p.mode === "count";
  const n = Math.round(ease((t - 4) / Math.max(30, d * 0.7)) * 2042);
  return (
    <AbsoluteFill>
      <Svg>
        <Site t={t} x={820} />
        {/* a tanker barge alongside with a hose to the wreck */}
        <g transform="translate(1440 650)">
          <path d="M-260 -30 L 280 -30 L 240 50 L -230 50 Q -260 30 -260 -30 Z" fill="#c94a3a" {...O(7)} />
          <rect x={-200} y={-90} width={180} height={60} rx={6} fill="#d9dde0" {...O(5)} />
          {[0, 1, 2].map((i) => <ellipse key={i} cx={60 + i * 70} cy={-44} rx={30} ry={16} fill="#9aa4ad" {...O(4)} />)}
        </g>
        <path d="M1220 600 Q 1100 520 960 560" stroke="#2a2d33" strokeWidth={16} fill="none" />
        {Array.from({ length: 5 }).map((_, i) => { const u = ((t * 1.4 + i * 12) % 60) / 60; return <circle key={i} cx={960 + u * 260} cy={560 - Math.sin(u * Math.PI) * 50 + u * 40} r={8} fill="#1d1d22" />; })}
        {count && <g transform="translate(960 230)"><rect x={-330} y={-80} width={660} height={160} rx={20} fill="#0b1426" {...O(6)} /><text x={-30} y={36} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={104} fill={YEL}>{n.toLocaleString("en-US")}</text><T3 x={250} y={30} size={60}>m³</T3></g>}
      </Svg>
    </AbsoluteFill>
  );
};

const Choice8: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "ask";
  if (m === "ask") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#f2ead8" />
          <rect x={460} y={110} width={1300} height={620} rx={16} fill="#f8f8f4" stroke="#8e99a4" strokeWidth={14} />
          <g transform={`translate(800 400) scale(${pop(t, 8)})`}><T3 x={0} y={-120} size={60} color={RED}>CUT IT UP?</T3><g transform="scale(0.3) translate(-500 200)"><Liner L={1000} water={false} name={false} /></g>{[-120, -40, 40, 120].map((x) => <line key={x} x1={x} y1={-60} x2={x} y2={80} stroke={RED} strokeWidth={6} strokeDasharray="12 8" />)}</g>
          <g transform={`translate(1420 400) scale(${pop(t, 20)})`}><T3 x={0} y={-120} size={60} color="#3f9a4f">LIFT IT WHOLE?</T3><g transform="rotate(-10) scale(0.3) translate(-500 200)"><Liner L={1000} water={false} name={false} /></g><path d="M-150 120 Q 0 40 150 120" stroke="#3f9a4f" strokeWidth={8} fill="none" /></g>
          <Actor a="think" t={t} x={260} y={1000} s={0.7} id="choice8" w={w} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "whole") {
    const k = ease(t / Math.max(40, d));
    const a = 70 * (1 - clamp01(k * 2)), fl = clamp01(k * 2 - 1);
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={640} />
          <Island x={500} y={660} s={1.1} />
          <DaySea t={t} y={640} />
          <g transform={`translate(${1000 + fl * 700} ${690 - (70 - a) * 1.6})`}><LinerEnd s={1.25} rot={a} /></g>
          <rect x={0} y={660} width={W} height={H - 660} fill={SEA} opacity={0.85} />
          {["UPRIGHT", "FLOAT", "TOW AWAY"].map((lab, i) => <g key={lab} transform={`translate(${520 + i * 440} 240) scale(${pop(t, (d * i) / 3.2)})`}><rect x={-190} y={-50} width={380} height={100} rx={50} fill="#3f9a4f" {...O(6)} /><Txt x={0} y={20} s={50} c="#fff">{`${i + 1}. ${lab}`}</Txt></g>)}
        </Svg>
      </AbsoluteFill>
    );
  }
  // cut / mess: cutters slicing the wreck, a calendar flipping, junk falling into the sea
  const mess = m === "mess";
  return (
    <AbsoluteFill>
      <Svg>
        <Site t={t} />
        {[0, 1, 2].map((i) => <line key={i} x1={880 + i * 110} y1={420} x2={940 + i * 110} y2={720} stroke={RED} strokeWidth={8} strokeDasharray="16 10" opacity={ramp(t, 4 + i * 6, 10 + i * 6)} />)}
        {!mess && <g transform="translate(1600 640)"><rect x={-150} y={-30} width={300} height={60} fill="#5a636c" {...O(6)} /><path d="M-40 -30 L -40 -320 L -300 -380" stroke="#e0a23b" strokeWidth={22} fill="none" /><path d="M-40 -30 L -40 -320 L -300 -380" stroke={INK} strokeWidth={4} fill="none" /><line x1={-300} y1={-380} x2={-300} y2={-220 + Math.sin(t * 0.1) * 20} stroke={INK} strokeWidth={4} /><rect x={-340} y={-220 + Math.sin(t * 0.1) * 20} width={80} height={50} fill="#9aa4ad" {...O(4)} /></g>}
        {mess && (
          <g>
            {Array.from({ length: 10 }).map((_, i) => { const u = ((t * 1.2 + i * 17) % 50) / 50; return <rect key={i} x={900 + rnd(i) * 300} y={560 + u * 240} width={20 + rnd(i + 3) * 20} height={14} fill={i % 2 ? "#5a636c" : "#8a5a3a"} transform={`rotate(${u * 200} ${910 + rnd(i) * 300} ${570 + u * 240})`} opacity={1 - u * 0.6} />; })}
            <ellipse cx={1050} cy={820} rx={260} ry={40} fill="#5a4a2a" opacity={0.4} />
            <g transform="translate(360 260)"><rect x={-110} y={-90} width={220} height={190} rx={12} fill="#f4f4f0" {...O(6)} /><rect x={-110} y={-90} width={220} height={50} fill={RED} {...O(6)} /><text x={0} y={60} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={80} fill={INK}>{2012 + Math.min(4, Math.floor(t / 12))}</text></g>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

const Team8: Tpl = ({ t, p }) => {
  const crew = p.mode === "crew";
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#e8e3d6" />
        {!crew && [["TITAN SALVAGE", "USA", 0], ["MICOPERI", "ITALY", 1]].map(([name, land, i]) => (
          <g key={name as string} transform={`translate(${560 + (i as number) * 800} 480) scale(${pop(t, 4 + (i as number) * 40)})`}>
            <rect x={-330} y={-200} width={660} height={400} rx={24} fill="#f8f8f4" {...O(8)} />
            {i === 0 ? <g transform="translate(0 -80)">{Array.from({ length: 7 }).map((_, q) => <rect key={q} x={-120} y={-60 + q * 17} width={240} height={17} fill={q % 2 ? "#f4f4f0" : "#c94a3a"} />)}<rect x={-120} y={-60} width={100} height={68} fill="#2c4a7a" /><rect x={-120} y={-60} width={240} height={119} fill="none" {...O(4)} /></g>
              : <g transform="translate(0 -80)"><rect x={-120} y={-60} width={80} height={120} fill="#3f9a4f" /><rect x={-40} y={-60} width={80} height={120} fill="#f4f4f0" /><rect x={40} y={-60} width={80} height={120} fill="#c94a3a" /><rect x={-120} y={-60} width={240} height={120} fill="none" {...O(4)} /></g>}
            <Txt x={0} y={90} s={60}>{name as string}</Txt>
            <Txt x={0} y={150} s={40} c="#5a636c">{land as string}</Txt>
          </g>
        ))}
        {crew && (
          <g>
            <rect x={0} y={760} width={W} height={320} fill={SEA} />
            <Quay8 x0={-40} x1={1960} y={700} h={120} />
            {Array.from({ length: 22 }).map((_, i) => {
              const x = 80 + i * 84, diver = i % 4 === 1;
              return <g key={i} transform={`translate(${x} ${700}) scale(${pop(t, 2 + i * 1.2)})`}>
                <circle cy={-64} r={18} fill="#f2d9b8" {...O(4)} />
                {diver ? <circle cy={-64} r={22} fill="#9fd3ee" opacity={0.5} {...O(4)} /> : <path d="M-20 -78 Q 0 -96 20 -78 Z" fill={["#ffd23f", "#f4f4f0", "#ff8a3a"][i % 3]} {...O(3)} />}
                <path d="M-18 -44 L 18 -44 L 14 -6 L -14 -6 Z" fill={diver ? "#1d1d22" : "#ff8a3a"} {...O(4)} />
                <path d="M-8 -6 L -8 0 M8 -6 L 8 0" stroke={INK} strokeWidth={5} />
              </g>;
            })}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

const Title8: Tpl = ({ t, w }) => (
  <AbsoluteFill>
    <Svg>
      <rect width={W} height={H} fill="#1d2a3a" />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={960} y1={480} x2={960 + Math.cos(i * 0.52 + t * 0.01) * 1400} y2={480 + Math.sin(i * 0.52 + t * 0.01) * 1400} stroke="#24476f" strokeWidth={60} />)}
      <g transform={`translate(960 440) scale(${pop(t, 6)}) rotate(-3)`}><rect x={-560} y={-120} width={1120} height={240} rx={24} fill={YEL} {...O(10)} /><Txt x={0} y={44} s={140}>PARBUCKLING</Txt></g>
      <Actor a="fingerup" t={t} x={1640} y={1060} s={0.6} id="title8" w={w} />
    </Svg>
  </AbsoluteFill>
);

// ================================================================== 7. parbuckling
/** Ship Guy rolls a barrel up a ramp with two ropes; then the barrel becomes the ship */
const Barrel8: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "roll";
  if (m === "ship") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#e8e3d6" />
          <path d="M200 900 L 1500 500 L 1500 900 Z" fill="#c9b98a" {...O(8)} />
          <g transform={`translate(860 700) rotate(${-20 - t * 0.5})`} opacity={1 - ramp(t, 4, 14)}><ellipse rx={120} ry={120} fill="#a8692e" {...O(8)} /><circle r={60} fill="none" stroke="#7a4a1e" strokeWidth={8} /></g>
          <g transform={`translate(860 760) scale(${ramp(t, 6, 16)}) rotate(${-40 + ease(t / d) * 30})`}><LinerEnd s={1} rot={0} /></g>
          <g transform="translate(1540 760)"><Actor a="amazed" t={t} x={0} y={0} s={0.55} id="barrel8s" w={w} /></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  const roll = m === "ramp" ? ease(t / Math.max(40, d)) : ease(t / Math.max(40, d)) * 0.4;
  const bx = 600 + roll * 700, by = 860 - roll * 215, br = 90;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#e8e3d6" />
        <rect x={0} y={900} width={W} height={180} fill="#9aa68a" {...O(6)} />
        <path d="M400 900 L 1500 560 L 1500 900 Z" fill="#c9b98a" {...O(8)} />
        <rect x={1500} y={560} width={420} height={340} fill="#c9b98a" {...O(8)} />
        {/* the ropes go from the top of the ramp, down under the barrel, and back up to the Ship Guy pulling */}
        <path d={`M1500 560 L ${bx + 30} ${by + br - 20} Q ${bx - br} ${by + 20} ${bx} ${by - br} L 1620 520`} stroke="#c9a87a" strokeWidth={10} fill="none" />
        <g transform={`translate(${bx} ${by}) rotate(${roll * 500})`}><circle r={br} fill="#a8692e" {...O(8)} /><circle r={50} fill="none" stroke="#7a4a1e" strokeWidth={8} /><line x1={-br} y1={0} x2={br} y2={0} stroke="#7a4a1e" strokeWidth={8} /></g>
        <Actor a="rope" t={t} x={1700} y={560} s={0.55} id="barrel8" over={{ flip: true, face: { eyes: "closed", brows: "angry", mouth: "teeth" } }} />
      </Svg>
    </AbsoluteFill>
  );
};

/** the underwater parbuckling scene: everything driven by a few numbers */
export const Parb: React.FC<{ t: number; a: number; bags?: number; plats?: number; spL?: number; spR?: number; fill?: number; chains?: number; strain?: number; rise?: number; night?: number; rust?: number }> = ({ t, a, bags = 0, plats = 0, spL = 0, spR = 0, fill = 0, chains = 0, strain = 0, rise = 0, night = 0, rust }) => {
  const sy = 470, s = 1.5, k = clamp01((68 - a) / 68);
  const kx = 760 + k * 240, ky = 640 + k * 50 - rise;
  const r = (a * Math.PI) / 180, P = (x: number, y: number) => [kx + (x * Math.cos(r) - y * Math.sin(r)) * s, ky + (x * Math.sin(r) + y * Math.cos(r)) * s];
  const box = (side: number, i: number, key: string, vis: number) => (
    <g key={key} opacity={vis}>
      <rect x={side < 0 ? -122 : 72} y={-40 - i * 72} width={50} height={66} rx={4} fill="#d06a2e" {...O(4)} />
      <rect x={side < 0 ? -118 : 76} y={-40 - i * 72 + 66 - 62 * fill} width={42} height={62 * fill} fill="#2f6f99" opacity={0.9} />
      {side < 0 && chains > 0 && <rect x={-116} y={-56 - i * 72} width={36} height={16} rx={3} fill={YEL} {...O(3)} />}
    </g>
  );
  const sky = night > 0 ? <NightSky t={t} /> : <rect width={W} height={sy} fill="#bcd9ea" />;
  return (
    <g>
      {sky}
      <rect x={0} y={sy} width={W} height={H - sy} fill="#2f6f99" />
      <rect x={0} y={sy} width={W} height={H - sy} fill="#0d2238" opacity={0.25 + night * 0.3} />
      {/* island slope, the rock shelf and deep water to the right */}
      <path d={`M0 ${sy - 160} Q 260 ${sy - 170} 420 ${sy} L 740 ${672} L 1120 ${736} L 1920 ${900} L 1920 1080 L 0 1080 Z`} fill="#8a7a5a" {...O(6)} />
      <path d={`M0 ${sy - 160} Q 260 ${sy - 170} 420 ${sy} L 0 ${sy} Z`} fill={night > 0 ? "#1d2a22" : "#6f8a4f"} />
      <T3 x={1640} y={1000} size={36} color="#9fd3ee" o={0.8}>DEEP WATER ↘</T3>
      {/* cement grout bags under the hull */}
      {Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={640 + i * 46} cy={668 + i * 2} rx={30} ry={16} fill="#c9c3b0" {...O(3)} opacity={clamp01(bags * 6 - i)} />)}
      {/* six steel platforms drilled into the seabed */}
      {Array.from({ length: 3 }).map((_, i) => {
        const v = clamp01(plats * 3 - i), x = 900 + i * 80, y = 700 + i * 12;
        return <g key={i} opacity={v}><rect x={x} y={y - 22 * v} width={70} height={22} fill="#9aa4ad" {...O(4)} /><line x1={x + 16} y1={y} x2={x + 16} y2={y + 80} stroke="#5a636c" strokeWidth={9} /><line x1={x + 54} y1={y} x2={x + 54} y2={y + 80} stroke="#5a636c" strokeWidth={9} /></g>;
      })}
      {/* the ship + sponsons, rotated together around the keel */}
      <g transform={`translate(${kx} ${ky}) rotate(${a}) scale(${s})`}>
        {[0, 1, 2].map((i) => box(-1, i, `l${i}`, clamp01(spL * 3 - i)))}
        {[0, 1, 2].map((i) => box(1, i, `r${i}`, clamp01(spR * 3 - i)))}
        <LinerEnd rot={0} rust={rust ?? clamp01((50 - a) / 30) * 0.85} />
      </g>
      {/* chains from the jacks on the sponsons, around under the hull, to anchors on the seabed */}
      {chains > 0 && [0, 1, 2].map((i) => {
        const [x1, y1] = P(-98, -52 - i * 72), [x2, y2] = P(0, 6);
        const ax = 1060 + i * 60, ay = 760 + i * 10;
        return <path key={i} d={`M${x1} ${y1} Q ${x2 - 60} ${y2 + 40} ${ax} ${ay}`} stroke={strain > 0.5 ? "#e8352b" : "#3a3f46"} strokeWidth={7 + strain * 3} strokeDasharray="12 6" fill="none" opacity={chains} />;
      })}
      {/* the sea surface in front */}
      <rect x={0} y={sy} width={W} height={6} fill="#bfe6f5" opacity={0.8} />
      {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M${((i * 197 + t * 1.2) % (W + 200)) - 100} ${sy + 4} q 22 -8 44 0 t 44 0`} stroke="#e8f6fb" strokeWidth={4} fill="none" />)}
    </g>
  );
};

const Parb8: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "slide";
  const kk = ease(t / Math.max(30, d));
  const all = { bags: 1, plats: 1, spL: 1, chains: 1 };
  let el: React.ReactNode = null;
  if (m === "slide") el = <g><Parb t={t} a={68 + Math.sin(t * 0.2) * 0.6} /><path d="M1180 760 q 120 40 260 110" stroke={RED} strokeWidth={14} fill="none" opacity={ramp(t, 6, 12)} /><path d="M1440 870 l -10 -50 m 10 50 l -50 0" stroke={RED} strokeWidth={14} opacity={ramp(t, 6, 12)} /></g>;
  else if (m === "bags") el = <g><Parb t={t} a={68} bags={kk} />{[0, 1].map((i) => <g key={i} transform={`translate(${560 + i * 160 + Math.sin(t * 0.1 + i) * 20} ${600 + i * 30})`}><ellipse rx={34} ry={14} fill="#1d1d22" /><circle cx={30} cy={-6} r={14} fill="#9fd3ee" {...O(3)} /><path d="M-30 0 l -30 -10 M-30 0 l -30 10" stroke="#ffd23f" strokeWidth={6} /></g>)}</g>;
  else if (m === "plats") el = <Parb t={t} a={68} bags={1} plats={kk} />;
  else if (m === "sponsons") el = <g><Parb t={t} a={68} bags={1} plats={1} spL={kk} /><g opacity={ramp(t, d * 0.6, d * 0.7)} transform="translate(320 330)"><rect x={-50} y={-40} width={100} height={80} fill="#f2d9a6" {...O(5)} /><path d="M-60 -40 L 0 -90 L 60 -40 Z" fill="#c94a3a" {...O(5)} /><T3 x={0} y={90} size={30}>A HOUSE</T3></g></g>;
  else if (m === "chains") el = <Parb t={t} a={68} bags={1} plats={1} spL={1} chains={kk} />;
  else if (m === "start") el = <g><Parb t={t} a={68} {...all} strain={ramp(t, 10, 20) * 0.4} /><g transform={`translate(1500 220) scale(${pop(t, 4)})`}><rect x={-260} y={-70} width={520} height={140} rx={16} fill="#0b1426" {...O(6)} /><text x={0} y={26} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={64} fill={YEL}>16.09.2013</text></g></g>;
  else if (m === "stuck") el = <g><Parb t={t} a={68 + Math.sin(t * 1.5) * 0.3} {...all} strain={0.6 + 0.4 * Math.abs(Math.sin(t * 0.3))} /><g transform="translate(1500 220)"><rect x={-200} y={-60} width={400} height={120} rx={16} fill="#0b1426" {...O(6)} /><text x={0} y={22} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={56} fill="#f4f4f0">20 MONTHS</text></g></g>;
  else if (m === "free") { const jolt = t > d * 0.6 ? Math.min(3, (t - d * 0.6) * 0.3) : Math.sin(t * 1.8) * 0.3; el = <g><Parb t={t} a={68 - jolt} {...all} strain={t > d * 0.6 ? 0.3 : 1} />{t > d * 0.6 && t < d * 0.6 + 14 && <g>{[0, 1, 2].map((i) => <path key={i} d={`M${700 + i * 40} ${560 - i * 30} l -40 -30`} stroke="#fff" strokeWidth={8} />)}</g>}</g>; }
  else if (m === "turn") { const a = 65 - kk * 25; el = <g><Parb t={t} a={a} {...all} strain={0.4} night={Math.sin(kk * Math.PI) * 0.9} /><g transform="translate(1600 220)"><circle r={90} fill="#f4f4f0" {...O(6)} /><line x1={0} y1={0} x2={0} y2={-70} stroke={RED} strokeWidth={8} transform={`rotate(${t * 18})`} /><line x1={0} y1={0} x2={0} y2={-46} stroke={INK} strokeWidth={10} transform={`rotate(${t * 1.5})`} /></g></g>; }
  else if (m === "flood") { const a = 40 - kk * 38; el = <Parb t={t} a={a} {...all} fill={clamp01(kk * 1.5)} chains={1 - kk * 0.6} strain={0} />; }
  else if (m === "upright") el = <g><Parb t={t} a={0} {...all} fill={1} chains={0.4} /><WorkBoat x={300} y={480} s={0.7} /><Actor a="cheer" t={t} x={260} y={470} s={0.42} id="up8" w={w} /><g transform={`translate(1520 220) scale(${pop(t, 4)})`}><rect x={-280} y={-70} width={560} height={140} rx={16} fill="#0b1426" {...O(6)} /><text x={0} y={26} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={60} fill={YEL}>17.09 · 04:00</text></g></g>;
  else if (m === "rust") el = <g><rect width={W} height={H} fill="#bcd9ea" /><rect x={0} y={760} width={W} height={320} fill={SEA} /><g transform="translate(960 1080) scale(3.2)"><LinerEnd rot={0} rust={1} /></g><WorkBoat x={300} y={790} s={0.7} /><Actor a="shock" t={t} x={260} y={780} s={0.42} id="rust8" w={w} /></g>;
  return <AbsoluteFill><Svg>{el}</Svg></AbsoluteFill>;
};

// ================================================================== 8. floating her home
const Float8: Tpl = ({ t, d, p }) => {
  const rise = p.mode === "rise";
  const k = ease(t / Math.max(30, d));
  return (
    <AbsoluteFill>
      <Svg>
        <Parb t={t} a={0} bags={1} plats={1} spL={1} spR={rise ? 1 : k} fill={rise ? 1 - k : 1} rise={rise ? k * 150 : 0} rust={0.85} />
        {rise && Array.from({ length: 14 }).map((_, i) => { const u = ((t * 2 + i * 13) % 60) / 60; return <circle key={i} cx={880 + (i % 2 ? 210 : -10) + rnd(i) * 30} cy={640 - u * 200} r={6 + rnd(i + 2) * 8} fill="#e8f6fb" opacity={0.7 * (1 - u)} />; })}
        {!rise && <g transform="translate(1560 230)"><rect x={-180} y={-70} width={360} height={140} rx={16} fill="#0b1426" {...O(6)} /><text x={0} y={30} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={84} fill={YEL}>{Math.round(15 + ramp(t, 4, d * 0.8) * 15)}</text></g>}
      </Svg>
    </AbsoluteFill>
  );
};

/** the tow north: Giglio -> Genoa, tugs at walking pace */
const Tow8: Tpl = ({ t, d, p }) => {
  const genoa = p.mode === "genoa";
  const route: [number, number][] = [[1040, 760], [980, 640], [930, 520], [880, 420], [760, 310], [600, 220], [470, 150]];
  const k = genoa ? 0.85 + ease(t / Math.max(30, d)) * 0.15 : ease(t / Math.max(40, d)) * 0.85;
  const seg = route.length - 1, f = k * seg, i0 = Math.min(seg - 1, Math.floor(f)), u = f - i0;
  const x = route[i0][0] + (route[i0 + 1][0] - route[i0][0]) * u, y = route[i0][1] + (route[i0 + 1][1] - route[i0][1]) * u;
  const hd = (Math.atan2(route[i0 + 1][1] - route[i0][1], route[i0 + 1][0] - route[i0][0]) * 180) / Math.PI;
  const day = 23 + Math.min(4, Math.floor(k * 4.7));
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill={SEA} />
        <g transform="translate(0 150)">
        <path d={COAST} fill="#c9b98a" {...O(6)} />
        <path d="M260 420 Q 340 380 400 440 Q 420 600 380 760 Q 330 880 280 800 Q 230 620 260 420 Z" fill="#c9b98a" {...O(5)} />
        <ellipse cx={800} cy={590} rx={50} ry={24} fill="#c9b98a" {...O(4)} />
        <ellipse cx={1040} cy={760} rx={26} ry={34} fill="#6f8a4f" {...O(4)} />
        <path d={`M${route.map(([a, b]) => `${a} ${b}`).join(" L ")}`} stroke="#fff" strokeWidth={6} strokeDasharray="18 12" fill="none" opacity={0.7} />
        <g><circle cx={PL.GENOA[0]} cy={PL.GENOA[1]} r={16} fill={RED} {...O(4)} /><T3 x={PL.GENOA[0] + 30} y={PL.GENOA[1] - 26} size={46} anchor="start">GENOA</T3></g>
        <T3 x={1000} y={830} size={34} anchor="end">GIGLIO</T3>
        <g transform={`translate(${x} ${y}) rotate(${hd})`}>
          <g transform="scale(0.12)"><LinerTop /></g>
          {[-1, 1].map((sd) => <g key={sd}><line x1={60} y1={0} x2={110} y2={sd * 18} stroke={INK} strokeWidth={3} /><ellipse cx={120} cy={sd * 18} rx={14} ry={7} fill="#c94a3a" {...O(3)} /></g>)}
        </g>
        </g>
        <rect x={0} y={0} width={W} height={156} fill="#c9b98a" />
        <g transform="translate(1560 300)"><rect x={-200} y={-80} width={400} height={160} rx={16} fill="#0b1426" {...O(6)} /><text x={0} y={-6} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={64} fill={YEL}>{`${day} JULY`}</text><text x={0} y={50} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={40} fill="#f4f4f0">2014</text></g>
      </Svg>
    </AbsoluteFill>
  );
};

/** Genoa: taking her apart, piece by piece; ~90% recycled */
const Yard8: Tpl = ({ t, d, p, w }) => {
  const rec = p.mode === "recycle";
  const k = rec ? 1 : ease(t / Math.max(30, d));
  const cut = Math.round(k * 7);
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={700} />
        <rect x={0} y={700} width={W} height={380} fill={SEA} />
        <Quay8 x0={-40} x1={1960} y={860} h={240} />
        {/* the hull getting shorter, deck by deck, block by block */}
        <defs><clipPath id="yard8"><rect x={0} y={0} width={1500 - cut * 140} height={1080} /></clipPath></defs>
        <g clipPath="url(#yard8)"><g transform="translate(120 760)"><Liner L={1300} t={t} water={false} name={false} /></g></g>
        {Array.from({ length: cut }).map((_, i) => <rect key={i} x={1480 + (i % 3) * 120} y={820 - Math.floor(i / 3) * 50} width={100} height={46} fill={["#f6f5ef", "#b8432f", "#9aa4ad"][i % 3]} {...O(4)} />)}
        {/* a crane on the quay */}
        <g transform="translate(1700 860)"><path d="M0 0 L 0 -600 L -360 -640" stroke="#e0a23b" strokeWidth={26} fill="none" /><path d="M0 0 L 0 -600 L -360 -640" stroke={INK} strokeWidth={4} fill="none" /><line x1={-340} y1={-636} x2={-340} y2={-380} stroke={INK} strokeWidth={4} /></g>
        {!rec && <g transform="translate(360 220)">{Array.from({ length: 3 }).map((_, i) => <g key={i} opacity={ramp(t, 4 + i * d * 0.25, 8 + i * d * 0.25)} transform={`translate(${i * 220} 0)`}><rect x={-90} y={-80} width={180} height={160} rx={12} fill="#f4f4f0" {...O(6)} /><rect x={-90} y={-80} width={180} height={44} fill={RED} {...O(6)} /><text x={0} y={52} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={60} fill={INK}>{2014 + i + 1}</text></g>)}</g>}
        {rec && (
          <g transform={`translate(960 330) scale(${pop(t, 4)})`}>
            <circle r={170} fill="#3f9a4f" {...O(8)} />
            {[0, 120, 240].map((r) => <path key={r} d="M0 -120 L 50 -60 L 20 -60 L 20 -10 L -20 -10 L -20 -60 L -50 -60 Z" fill="#f4f4f0" transform={`rotate(${r + t})`} />)}
            <Txt x={0} y={240} s={90}>~90%</Txt>
          </g>
        )}
        <Actor a={rec ? "cheer" : "watch"} t={t} x={1360} y={870} s={0.5} id="yard8" w={w} over={{ flip: true }} />
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES8C: Record<string, Tpl> = {
  site8: Site8, fuel8: Fuel8, choice8: Choice8, team8: Team8, title8: Title8, barrel8: Barrel8, parb8: Parb8, float8: Float8, tow8: Tow8, yard8: Yard8,
};
// keep imports used
export const _u8c = [FACES, IDLE, POSES, LAMP];
