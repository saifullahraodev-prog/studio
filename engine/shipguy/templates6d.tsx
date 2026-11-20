// The Ship Guy: carrier video (#6), part 4 scenes: the Ford (new parts, cost, sortie targets), the final landing payoff
// and the end card. Frame-driven only.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, IDLE, POSES } from "./guy";
import { CarrierHD } from "./ships_hd";
import { fontFamily, ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, clamp01, pop } from "./templates3";
import { NightSky, YEL, RED } from "./templates5";
import { ANG, CarrierTop, DECK_N, DaySky, Fighter, FighterTop, JERSEY, OpenSea, TopSea } from "./templates6";

const O = (w = 5) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
const ease = (k: number) => { const c = clamp01(k); return c * c * (3 - 2 * c); };
const Txt: React.FC<{ x: number; y: number; s: number; c?: string; a?: "start" | "middle" | "end"; o?: number; children: React.ReactNode }> = ({ x, y, s, c = INK, a = "middle", o = 1, children }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={fontFamily} fontWeight={700} fontSize={s} fill={c} opacity={o}>{children}</text>
);

// ================================================================== 9. the Ford
const Ford: Tpl = ({ t, p, w }) => {
  const st = p.step ?? "commission";
  if (st === "commission") {
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={660} />
          <OpenSea t={t} y={660} />
          <g transform={`translate(${220 - t * 0.4} 700)`}><CarrierHD w={1500} num="78" /></g>
          {/* ribbon across the bow + confetti */}
          <path d="M1500 560 Q 1620 620 1760 560" stroke={RED} strokeWidth={14} fill="none" opacity={1 - ramp(t, 30, 40)} />
          {Array.from({ length: 24 }).map((_, i) => <rect key={i} x={200 + ((i * 97) % 1500)} y={-40 + ((t * (3 + (i % 4)) + i * 50) % 700)} width={14} height={22} fill={[YEL, RED, "#3a73b8", "#4f8a5b"][i % 4]} transform={`rotate(${t * 6 + i * 30} ${200 + ((i * 97) % 1500)} ${-40 + ((t * (3 + (i % 4)) + i * 50) % 700)})`} opacity={ramp(t, 20, 30)} />)}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "cost") {
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={700} />
          <OpenSea t={t} y={700} />
          <g transform="translate(220 740) scale(0.85)"><CarrierHD w={1500} num="78" /></g>
          <g transform={`translate(1350 330) rotate(${-8 + Math.sin(t * 0.15) * 3}) scale(${pop(t, 4)})`}>
            <path d="M-300 -110 L 240 -110 L 330 0 L 240 110 L -300 110 Z" fill="#f4e2a0" {...O(9)} />
            <circle cx={240} cy={0} r={22} fill="#fff" {...O(6)} />
            <Txt x={-40} y={30} s={100}>$13 B</Txt>
          </g>
          <Actor a="shock" t={Math.max(0, t - 12)} x={300} y={1060} s={0.55} id="cost" w={w} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "parts1" || st === "parts2") {
    // top-down: the Ford's new parts light up one by one
    const lit = (a: number) => ramp(t, a, a + 8);
    const p2 = st === "parts2";
    return (
      <AbsoluteFill>
        <Svg>
          <TopSea t={t} />
          <g transform="translate(160 560) scale(1.6)">
            <CarrierTop num="78" wires={3} elevators={false} />
            {/* the Ford's 3 deck-edge elevators: 2 starboard, 1 port */}
            {p2 && <g fill="#3a424b" stroke={YEL} strokeWidth={3} opacity={lit(4)}><rect x={680} y={84} width={70} height={30} /><rect x={430} y={96} width={70} height={30} /><rect x={110} y={-124} width={70} height={28} /></g>}
            {!p2 && <g opacity={lit(4)}><line x1={640} y1={-34} x2={980} y2={-20} stroke="#5ab8ff" strokeWidth={7} /><line x1={640} y1={14} x2={985} y2={10} stroke="#5ab8ff" strokeWidth={7} /></g>}
            {!p2 && <g transform={`translate(30 30) rotate(${ANG})`} opacity={lit(26)}>{[0, 1, 2].map((i) => <line key={i} x1={120 + i * 32} y1={-40} x2={120 + i * 32} y2={40} stroke={YEL} strokeWidth={5} />)}</g>}
            {p2 && (
              <g opacity={lit(40)}>
                <rect x={560} y={64} width={90} height={36} rx={4} fill="none" stroke={RED} strokeWidth={3} strokeDasharray="8 6" />
                <rect x={430 + 0 * ease((t - 40) / 30)} y={64} width={60} height={34} rx={4} fill={YEL} {...O(3)} />
                <path d="M556 82 L 500 82 M510 74 L 500 82 L 510 90" stroke={RED} strokeWidth={4} fill="none" />
              </g>
            )}
          </g>
          {!p2 && <g><T3 x={1660} y={420} size={46} color="#5ab8ff" o={lit(4)}>EMALS</T3><T3 x={360} y={900} size={46} color={YEL} o={lit(26)}>NEW ARRESTING GEAR</T3></g>}
          {p2 && <g><T3 x={1400} y={960} size={50} color={YEL} o={lit(4)}>3 ELEVATORS</T3><T3 x={700} y={900} size={50} color={YEL} o={lit(40)}>SMALLER ISLAND, FURTHER BACK</T3></g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  // goal: many jets launching + landing at once
  return (
    <AbsoluteFill>
      <Svg>
        <TopSea t={t} />
        <g transform="translate(960 560) scale(1.1) translate(-500 0)">
          <CarrierTop num="78" wires={3} />
          {[0, 1, 2, 3].map((i) => { const k = ((t * 2 + i * 30) % 120) / 120; return <g key={i} transform={`translate(${700 + k * 800} ${-30 + (i % 2) * 40 - k * 60}) scale(0.4)`}><FighterTop /></g>; })}
          <g transform={`translate(30 30) rotate(${ANG})`}>{[0, 1, 2].map((i) => { const k = ((t * 2 + i * 40) % 120) / 120; return <g key={i} transform={`translate(${-700 + k * 900} 0) scale(0.4)`}><FighterTop /></g>; })}</g>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 9. sortie targets (design requirements, not routine)
const Sorties: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "160";
  const target = st === "160" ? 160 : 270;
  const k = ease((t - 4) / Math.max(20, d - 30));
  const shown = st === "160" || st === "270" ? Math.round(k * target) : 270;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#13233d" />
        <g transform="translate(960 420)">
          <rect x={-420} y={-170} width={840} height={340} rx={30} fill="#1d2025" {...O(8)} />
          <text x={0} y={60} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={200} fill={st === "q" || st === "testers" ? "#7d8a96" : YEL}>{shown}</text>
          <Txt x={0} y={240} s={46} c="#fff">{st === "160" ? "FLIGHTS A DAY · FOR WEEKS" : st === "270" ? "FLIGHTS IN A SHORT SURGE" : "DESIGN TARGET"}</Txt>
        </g>
        {(st === "q" || st === "testers") && (
          <g transform={`translate(1350 330) rotate(-12) scale(${pop(t, 4)})`}>
            <rect x={-230} y={-70} width={460} height={140} rx={12} fill="none" stroke={RED} strokeWidth={14} />
            <Txt x={0} y={26} s={78} c={RED}>{st === "q" ? "TARGET" : "?"}</Txt>
          </g>
        )}
        {st === "testers" && (
          <g>
            <Actor a="notes" t={t} x={420} y={1080} s={0.7} id="test1" outfit="officer" w={w} over={{ face: { eyes: "half", brows: "one", mouth: "flat", lookX: 0.6 } }} />
            <g transform={`translate(1500 900) scale(${pop(t, 10)})`}>
              <rect x={-300} y={-80} width={600} height={160} rx={18} fill="#f4f4f0" {...O(6)} />
              <Txt x={0} y={-12} s={38}>PENTAGON TEST OFFICE</Txt>
              <Txt x={0} y={44} s={38} c={RED}>"CAN IT REACH THEM?"</Txt>
            </g>
          </g>
        )}
        {st === "160" && Array.from({ length: 8 }).map((_, i) => { const kk = ((t * 2 + i * 15) % 120) / 120; return <g key={i} transform={`translate(${-100 + kk * 2100} ${820 + (i % 3) * 70}) scale(0.35)`}><FighterTop /></g>; })}
        {st === "270" && Array.from({ length: 16 }).map((_, i) => { const kk = ((t * 4 + i * 8) % 120) / 120; return <g key={i} transform={`translate(${-100 + kk * 2100} ${780 + (i % 4) * 70}) scale(0.32)`}><FighterTop /></g>; })}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== 10. the payoff
const Finale: Tpl = ({ t, d, p, w }) => {
  const st = p.step ?? "stop";
  if (st === "stop") {
    const deck = 760;
    return (
      <AbsoluteFill>
        <Svg>
          <NightSky t={t} />
          <OpenSea t={t} y={deck + 80} night />
          <rect x={0} y={deck} width={W} height={80} fill={DECK_N} {...O(6)} />
          {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={60 + i * 140} cy={deck + 8} r={5} fill="#ffd27a" />)}
          <g transform={`translate(1000 ${deck - 6}) scale(1.7)`}><Fighter gear hook flame={t < 30 ? 1 : 0.2} /></g>
          <Actor a="wave" t={t} x={1560} y={deck} s={0.5} id="dir" outfit="jersey" over={{ jersey: JERSEY.yellow, pose: { ...IDLE, armL: [150, 10], armR: [100 + Math.sin(t * 0.4) * 40, 30] }, handL: "open", handR: "open", face: FACES.confident }} />
          <Actor a="hold" t={t} x={420} y={deck} s={0.55} id="thumb" w={w} over={{ pose: { ...IDLE, armR: [100, 40] }, handR: "thumb", face: FACES.happy }} />
          <T3 x={1000} y={300} size={110} color={YEL} s={pop(t, 4)}>2.0 s</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "wide") {
    const z = 1 - 0.85 * ease(t / Math.max(20, d - 10));
    return (
      <AbsoluteFill>
        <Svg>
          <NightSky t={t} />
          <rect x={0} y={440} width={W} height={640} fill="#0f2440" />
          <g transform={`translate(960 640) scale(${z * 2.2}) translate(-500 0)`}><CarrierTop night num="68" /></g>
          {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M${(i * 211) % W} ${500 + (i * 53) % 500} q 20 -6 40 0`} stroke="#24476f" strokeWidth={4} fill="none" />)}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (st === "sum") {
    const items: [string, string][] = [["✈️", "AIRPORT"], ["⚡", "POWER STATION"], ["🏘️", "TOWN"]];
    return (
      <AbsoluteFill>
        <Svg>
          <NightSky t={t} dawn={0.6 + 0.3 * ease(t / 200)} />
          <OpenSea t={t} y={720} />
          <g transform={`translate(${240 + t * 0.4} 760) scale(0.85)`}><CarrierHD w={1500} num="68" /></g>
          {items.map(([e, l], i) => (
            <g key={l} transform={`translate(${420 + i * 540} 360) scale(${pop(t, 20 + i * 40)})`}>
              <circle r={120} fill="#f4f4f0" {...O(8)} />
              <text x={0} y={36} textAnchor="middle" fontSize={110}>{e}</text>
              <T3 x={0} y={190} size={46}>{l}</T3>
            </g>
          ))}
          <T3 x={960} y={620} size={64} color={YEL} o={ramp(t, 150, 165)}>…BUILT AROUND ONE JOB</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  // job: sunrise, a jet launches off the bow while another is caught
  const k1 = ((t * 1.4) % 90) / 90;
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} dawn={0.95} />
        <circle cx={1500} cy={640} r={140} fill="#ffd27a" opacity={0.9} />
        <OpenSea t={t} y={680} />
        <g transform="translate(260 720)"><CarrierHD w={1400} num="68" /></g>
        <g transform={`translate(${1500 + k1 * 600} ${600 - k1 * 380}) scale(0.7) rotate(-12)`}><Fighter gear={false} flame={1} /></g>
        <g transform={`translate(${-200 + ease(t / 60) * 520} ${300 + ease(t / 60) * 330}) scale(0.7) rotate(${-8 + ease(t / 60) * 8})`}><Fighter gear hook /></g>
        <T3 x={560} y={240} size={90} color={YEL} s={pop(t, 4)}>THROW</T3>
        <T3 x={1360} y={240} size={90} color={YEL} s={pop(t, 30)}>CATCH</T3>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== end card: next video (ship costs) + subscribe
const Endcard6: Tpl = ({ t, w }) => (
  <AbsoluteFill>
    <Svg>
      <rect width={W} height={H} fill="#f3f1ea" />
      {/* left: space for the YouTube end-screen video element (a ladder of ship price tags as a preview) */}
      <g transform={`translate(560 470) scale(${pop(t, 4)})`}>
        <rect x={-430} y={-250} width={860} height={500} rx={24} fill="#1d2025" {...O(10)} />
        {["$2K", "$200K", "$20M", "$2B", "$13B"].map((s, i) => (
          <g key={s} transform={`translate(${-330 + i * 165} ${170 - i * 85})`}>
            <rect x={-70} y={-34} width={140} height={68} rx={10} fill={i === 4 ? YEL : "#f4e2a0"} {...O(5)} />
            <Txt x={0} y={14} s={34}>{s}</Txt>
          </g>
        ))}
        <Txt x={0} y={-180} s={48} c="#fff">EVERY SHIP'S PRICE</Txt>
      </g>
      <g transform={`translate(1450 ${520 + Math.sin(t * 0.2) * 4})`}>
        <rect x={-300} y={-60} width={600} height={120} rx={60} fill={RED} {...O(8)} />
        <Txt x={0} y={22} s={64} c="#fff">SUBSCRIBE</Txt>
      </g>
      <Actor a="point" t={t} x={1450} y={1060} s={0.55} id="end6" w={w} flip />
    </Svg>
  </AbsoluteFill>
);

export const TEMPLATES6D: Record<string, Tpl> = { ford: Ford, sorties: Sorties, finale: Finale, endcard6: Endcard6 };
export { POSES as POSES6D };
