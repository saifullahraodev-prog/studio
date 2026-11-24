// The Ship Guy: Felicity Ace video (#7), part 2 scenes: smoke on deck one, the foam system, abandon ship, the rescue,
// why car-carrier fires are hard to stop, and the 2020 Höegh Xiamen fire. Frame-driven only. Nobody was hurt on the
// Felicity Ace, so the Ship Guy can react; the Höegh Xiamen firefighter injuries are shown plainly (no gags).
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, IDLE, POSES } from "./guy";
import { ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, clamp01, pop } from "./templates3";
import { NightSky, rnd, YEL, RED } from "./templates5";
import { DaySky, Helo, OpenSea, TopSea } from "./templates6";
import { Car, CarKind, CarTop, CAR_COLORS, O, Pctc, Txt, ease } from "./templates7";

const SMOKE = "#2a2b30";
const Flames: React.FC<{ x: number; y: number; t: number; s?: number; n?: number }> = ({ x, y, t, s = 1, n = 5 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }).map((_, i) => {
      const h = 60 + Math.abs(Math.sin(t * 0.45 + i * 1.7)) * 70;
      return <path key={i} d={`M${-50 + i * 25} 0 q 14 ${-h * 0.6} 4 ${-h} q 24 ${h * 0.4} 26 ${h} Z`} fill={i % 2 ? "#ffb03a" : "#ff6a2a"} opacity={0.95} />;
    })}
  </g>
);
const SmokeCloud: React.FC<{ t: number; k?: number; y?: number }> = ({ t, k = 1, y = 0 }) => (
  <g opacity={k}>
    {Array.from({ length: 22 }).map((_, i) => <circle key={i} cx={(rnd(i) * W + t * (1 + rnd(i + 3))) % (W + 200) - 100} cy={y + 120 + rnd(i + 7) * 500 + Math.sin(t * 0.05 + i) * 20} r={110 + rnd(i + 11) * 140} fill={SMOKE} opacity={0.85} />)}
  </g>
);
/** a car deck seen from inside: low ceiling, lights, rows of cars */
const CarDeck: React.FC<{ t: number; lights?: boolean }> = ({ t, lights = true }) => (
  <g>
    <rect width={W} height={H} fill="#4a525b" />
    <rect x={0} y={0} width={W} height={200} fill="#3a424b" />
    {Array.from({ length: 6 }).map((_, i) => <g key={i}><rect x={i * 340} y={160} width={30} height={60} fill="#2e353d" />{lights && <rect x={60 + i * 340} y={176} width={200} height={16} rx={6} fill="#fff7c2" opacity={0.85} />}</g>)}
    <rect x={0} y={820} width={W} height={260} fill="#5a636c" />
    {Array.from({ length: 8 }).map((_, i) => <g key={i} transform={`translate(${120 + i * 240} 820)`}><Car kind={(["sport", "suv", "sedan", "super"] as CarKind[])[i % 4]} c={CAR_COLORS[i % CAR_COLORS.length]} s={2.1} /></g>)}
  </g>
);
/** a crew member in a breathing mask (Actor + drawn mask over the face) */
const Masked: React.FC<{ x: number; y: number; s: number; t: number; id: string; a?: string }> = ({ x, y, s, t, id, a = "watch" }) => (
  <g>
    <Actor a={a} t={t} x={x} y={y} s={s} id={id} outfit="coverall" over={{ face: { eyes: "wide", brows: "worried", mouth: "flat" } }} />
    <g transform={`translate(${x} ${y - 455 * s}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={72} ry={62} fill="#2a2d33" opacity={0.92} {...O(6)} />
      <ellipse cx={0} cy={-10} rx={52} ry={34} fill="#9fd3ee" opacity={0.8} {...O(4)} />
      <circle cx={0} cy={44} r={18} fill="#5a636c" {...O(4)} />
    </g>
    <rect x={x - 40 * s} y={y - 330 * s} width={80 * s} height={120 * s} rx={20 * s} fill="#c9a23a" {...O(5 * s)} />
  </g>
);

// ================================================================== the deck map (decks counted from the top)
const DeckMap: Tpl = ({ t, p, w }) => {
  const m = p.mode ?? "alarm";
  // a big cross-section of the aft part of the ship: 11 car decks, numbered from the TOP down
  const x0 = 360, x1 = 1560, yTop = 150, yBot = 900, n = 11;
  const dy = (yBot - yTop) / n;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#13233d" />
        <path d={`M${x0} ${yTop - 30} L ${x1} ${yTop - 30} L ${x1} ${yBot + 80} Q ${x1} ${yBot + 160} ${x1 - 120} ${yBot + 160} L ${x0 + 120} ${yBot + 160} Q ${x0} ${yBot + 160} ${x0} ${yBot + 80} Z`} fill="#f2f0e8" {...O(8)} />
        {Array.from({ length: n }).map((_, i) => {
          const y = yTop + i * dy;
          const on = m !== "alarm" ? ramp(t, 4 + i * 2.5, 8 + i * 2.5) : 0.25;
          return (
            <g key={i}>
              <rect x={x0 + 20} y={y + 4} width={x1 - x0 - 40} height={dy - 8} fill={i === 0 ? "#ffe6c2" : "#e4e1d6"} />
              {Array.from({ length: 12 }).map((__, j) => <g key={j} transform={`translate(${x0 + 90 + j * 92} ${y + dy - 6}) scale(0.5)`}><Car kind={(["sport", "suv", "sedan"] as CarKind[])[(i + j) % 3]} c={CAR_COLORS[(i * 5 + j) % CAR_COLORS.length]} /></g>)}
              <line x1={x0} y1={y + dy} x2={x1} y2={y + dy} stroke="#9aa4ad" strokeWidth={4} />
              <T3 x={x0 - 24} y={y + dy - 14} size={34} anchor="end" color={i === 0 ? YEL : "#fff"} o={m === "alarm" ? (i === 0 ? 1 : 0.35) : on}>{`DECK ${i + 1}`}</T3>
            </g>
          );
        })}
        <T3 x={x1 - 60} y={yBot + 140} size={34} anchor="end" color="#5a636c">BOTTOM OF THE HULL</T3>
        {/* the alarm zone: deck 1, aft */}
        <rect x={x0 + 20} y={yTop + 4} width={420} height={dy - 8} fill={RED} opacity={m === "alarm" ? (Math.floor(t / 6) % 2 ? 0.75 : 0.25) : 0.6} />
        {m === "alarm" && <T3 x={x0 + 230} y={yTop + dy + 60} size={54} color={RED} s={pop(t, 4)}>SMOKE!</T3>}
        {m === "top" && (
          <g opacity={ramp(t, 4, 12)}>
            <line x1={x1 + 90} y1={yBot + 160} x2={x1 + 90} y2={yTop + 20} stroke={YEL} strokeWidth={12} />
            <path d={`M${x1 + 66} ${yTop + 40} l 24 -34 l 24 34`} fill={YEL} />
            <T3 x={x1 + 90} y={yTop - 10} size={60} color={YEL}>30+ m</T3>
          </g>
        )}
        {m === "numbers" && <Actor a="think" t={t} x={1780} y={1070} s={0.42} id="dm" w={w} />}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the bridge looking aft (no smoke) / the radio call
const BridgeInside: React.FC<{ t: number; smoke?: number; alarm?: boolean }> = ({ t, smoke = 0, alarm }) => (
  <g>
    {/* outside: looking aft along the ship's long white top deck to the funnel, sea on both sides */}
    <DaySky hz={520} />
    <rect x={0} y={520} width={W} height={560} fill="#3f86b0" />
    {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${(i * 260 + t * 0.6) % W} ${560 + (i % 3) * 30} q 16 -6 32 0`} stroke="#bfe6f5" strokeWidth={4} fill="none" />)}
    <path d="M820 520 L 1100 520 L 1560 900 L 360 900 Z" fill="#e8e6dc" stroke={INK} strokeWidth={5} />
    <path d="M960 520 L 960 900" stroke="#c9c6bb" strokeWidth={5} strokeDasharray="26 20" />
    {[0, 1, 2, 3].map((i) => { const k = (i + 1) / 5; return <rect key={i} x={960 - 380 * k - 40 + 300 * k * 0} y={520 + 380 * k - 8} width={36 + 50 * k} height={10 + 8 * k} fill="#c9c6bb" />; })}
    <path d="M846 506 L 852 456 L 888 456 L 892 508 Z" fill="#e06a2e" stroke={INK} strokeWidth={4} />
    {smoke > 0 && Array.from({ length: 12 }).map((_, i) => { const a = ((t * 0.8 + i * 20) % 240) / 240; return <circle key={i} cx={900 + Math.sin(i * 1.7) * 60 + a * 220} cy={540 - a * 480} r={50 + a * 140} fill="#2a2b30" opacity={(0.8 - a * 0.5) * smoke} />; })}
    {/* inside: window frame + console */}
    <rect x={0} y={0} width={W} height={70} fill="#2a2f35" />
    {[0, 640, 1280, 1920].map((x) => <rect key={x} x={x - 16} y={0} width={32} height={900} fill="#2a2f35" />)}
    <rect x={0} y={880} width={W} height={200} fill="#3a424b" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 6 }).map((_, i) => <g key={i}><rect x={160 + i * 280} y={910} width={200} height={90} rx={8} fill="#0b1426" stroke={INK} strokeWidth={4} /><path d={`M${180 + i * 280} 960 q 30 -30 60 0 t 60 0`} stroke="#4dff7a" strokeWidth={4} fill="none" /></g>)}
    {alarm && <g><circle cx={960} cy={40} r={36} fill={RED} opacity={Math.floor(t / 5) % 2 ? 1 : 0.35} stroke={INK} strokeWidth={5} /><rect width={W} height={H} fill={RED} opacity={Math.floor(t / 5) % 2 ? 0.14 : 0} /></g>}
  </g>
);
const LookAft: Tpl = ({ t, w }) => {
  const scan = Math.sin(t * 0.05) * 10;
  return (
    <AbsoluteFill>
      <Svg>
        <BridgeInside t={t} />
        <Actor a="watch" t={t} x={360} y={1080} s={0.85} id="laoff" outfit="officer" w={w}
          over={{ prop: "binoculars", pose: { ...IDLE, armR: [150, 140], armL: [150, 140], tilt: scan }, handR: "mitt", handL: "mitt", face: { eyes: "dot", brows: "one", mouth: "flat", lookX: 0.6 } }} />
        <g transform={`translate(1500 260) scale(${pop(t, 40)})`}><circle r={80} fill="#3f9a4f" {...O(6)} /><path d="M-34 0 L -8 26 L 38 -26" stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" /></g>
      </Svg>
    </AbsoluteFill>
  );
};
const Radio7: Tpl = ({ t, d, w }) => {
  // left: the officer on the bridge with a handheld radio; right: the sailor walking down the stairs, answering
  const k = Math.min(1, t / Math.max(30, d - 10));
  const sx = 1100 + k * 620, sy = 360 + k * 560;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={960} height={H} fill="#d9dde0" />
        <rect x={60} y={90} width={840} height={360} rx={10} fill="#9fd3ee" stroke={INK} strokeWidth={8} />
        <rect x={60} y={330} width={840} height={120} fill="#3f86b0" />
        <rect x={0} y={760} width={960} height={320} fill="#3a424b" stroke={INK} strokeWidth={6} />
        <Actor a="talk" t={t} x={480} y={1040} s={0.75} id="r7o" outfit="officer" w={w} over={{ prop: "radio", pose: { ...POSES.hold, armR: [120, 120] }, face: FACES.talk }} />
        <rect x={960} y={0} width={960} height={H} fill="#5a636c" />
        <line x1={960} y1={0} x2={960} y2={H} stroke={INK} strokeWidth={10} />
        {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={1040 + i * 90} y={380 + i * 70} width={120} height={22} fill="#8e99a4" stroke={INK} strokeWidth={3} />)}
        <path d="M1030 300 L 1900 980" stroke="#c9cfd5" strokeWidth={8} />
        <Actor a="talk" t={t} x={sx} y={sy} s={0.55} id="r7s" outfit="coverall" over={{ prop: "radio", pose: { ...POSES.hold, armR: [120, 120], legL: [-20 + Math.sin(t * 0.5) * 20, 10], legR: [20 - Math.sin(t * 0.5) * 20, 10] }, face: FACES.happy }} />
        {Array.from({ length: 3 }).map((_, i) => <path key={i} d={`M${640 + i * 46} ${520 - i * 12} q 34 -34 0 -68`} stroke={YEL} strokeWidth={9} fill="none" opacity={(Math.floor(t / 5) + i) % 3 === 0 ? 1 : 0.3} />)}
        <g transform={`translate(560 170) scale(${pop(t, 14)})`}><rect x={-260} y={-56} width={520} height={112} rx={20} fill="#f4f4f0" {...O(6)} /><Txt x={0} y={18} s={46}>"CHECK DECK ONE"</Txt></g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the door to deck one
const Door7: Tpl = ({ t, p, w }) => {
  const m = p.mode ?? "door";
  if (m === "door" || m === "shut") {
    const open = m === "door" ? ease((t - 30) / 30) : 1 - ease((t - 6) / 14);
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#8e99a4" />
          <rect x={700} y={180} width={520} height={820} fill="#111" />
          {open > 0.05 && <g opacity={open}><rect x={700} y={180} width={520} height={820} fill={SMOKE} /><circle cx={960} cy={760} r={140} fill="#ff8a3a" opacity={0.35 + 0.1 * Math.sin(t * 0.5)} /></g>}
          <g transform={`translate(700 180) scale(${1 - open * 0.75} 1)`}><rect x={0} y={0} width={520} height={820} fill="#c94a3a" {...O(8)} /><rect x={60} y={80} width={400} height={60} fill="#f4f4f0" {...O(4)} /><Txt x={260} y={124} s={40}>DECK 1</Txt><circle cx={460} cy={440} r={22} fill="#e0b13a" {...O(5)} /></g>
          <Actor a={m === "door" ? "look" : "worried"} t={t} x={m === "door" ? 1450 : 1420} y={1060} s={0.7} id="d7" outfit="coverall" w={w} over={m === "shut" ? { pose: { ...IDLE, lean: -20, armL: [80, 0], armR: [80, 0] }, face: { eyes: "wide", brows: "worried", mouth: "teeth" }, emote: "!", emoteT: t } : undefined} />
          {m === "shut" && <g opacity={Math.floor(t / 5) % 2}><circle cx={240} cy={200} r={70} fill={RED} {...O(6)} /><T3 x={240} y={330} size={46} color={RED}>FIRE ALARM</T3></g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "team" || m === "black") {
    const black = m === "black" ? ramp(t, 2, 10) : 0;
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#8e99a4" />
          <rect x={1180} y={180} width={520} height={820} fill={SMOKE} />
          {[0, 1].map((i) => {
            const walk = Math.min(1, t / 50);
            const x = 240 + i * 260 + walk * 520;
            return <Actor key={i} a="watch" t={t + i * 7} x={x} y={1060} s={0.7} id={`ft${i}`} outfit="fire"
              over={{ pose: { ...IDLE, lean: 4, armR: [40, 30], armL: [30, 20], legL: [-20 + (walk < 1 ? Math.sin(t * 0.5 + i) * 22 : 0), 10], legR: [20 - (walk < 1 ? Math.sin(t * 0.5 + i) * 22 : 0), 10] }, face: { eyes: "dot", brows: "angry", mouth: "flat" }, prop: i === 0 ? "hose" : "none" }} />;
          })}
          {/* smoke pouring out of the open door */}
          {Array.from({ length: 10 }).map((_, i) => { const a = ((t * 1.2 + i * 24) % 240) / 240; return <circle key={i} cx={1300 - a * 500} cy={500 - a * 260 + Math.sin(i) * 60} r={60 + a * 150} fill="#2a2b30" opacity={0.85 - a * 0.6} />; })}
          <rect width={W} height={H} fill="#0d0e10" opacity={black * 0.96} />
          {m === "black" && <g opacity={black}>
            {[0, 1].map((i) => <path key={i} d={`M${700 + i * 260} 600 L ${1400 + Math.sin(t * 0.1 + i) * 60} ${440 + i * 140} L ${1400 + Math.sin(t * 0.1 + i) * 60} ${560 + i * 140} Z`} fill="#fff7c2" opacity={0.12} />)}
            <circle cx={720} cy={600} r={14} fill="#fff7c2" /><circle cx={980} cy={600} r={14} fill="#fff7c2" />
            <T3 x={1300} y={420} size={110} color="#fff">???</T3>
          </g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  // open / pops / ext: inside deck one
  return (
    <AbsoluteFill>
      <Svg>
        <CarDeck t={t} />
        <Flames x={960} y={820} t={t} s={2.2} n={m === "pops" ? 8 : 5} />
        {m === "pops" && Array.from({ length: 4 }).map((_, i) => { const k = ((t + i * 11) % 22) / 22; return <circle key={i} cx={600 + i * 220} cy={700 - k * 60} r={30 + k * 90} fill="#fff3b0" opacity={(1 - k) * 0.8} />; })}
        <SmokeCloud t={t} k={m === "ext" ? 0.95 : 0.75} y={-60} />
        {m === "ext" && (
          <g>
            <Actor a="worried" t={t} x={360 - Math.max(0, t - 40) * 4} y={1060} s={0.7} id="ex7" outfit="coverall" w={w} over={{ pose: { ...IDLE, lean: -10, armR: [70, 20] }, face: { eyes: "wide", brows: "worried", mouth: "teeth" }, emote: "sweat", emoteT: t }} />
            <g transform={`translate(${470 - Math.max(0, t - 40) * 4} 760)`}><rect x={-14} y={-50} width={28} height={70} rx={10} fill={RED} {...O(4)} /><path d="M10 -50 q 30 -10 40 10" stroke={INK} strokeWidth={6} fill="none" /></g>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== boundary cooling on the weather deck
const Cool7: Tpl = ({ t, w }) => (
  <AbsoluteFill>
    <Svg>
      <DaySky hz={1080} />
      {/* the top (weather) deck */}
      <rect x={0} y={560} width={W} height={40} fill="#c9c6bb" stroke={INK} strokeWidth={6} />
      <T3 x={1700} y={540} size={34} color="#2c4a7a">TOP DECK</T3>
      {/* deck one just below, on fire */}
      <rect x={0} y={600} width={W} height={480} fill="#3a3f46" />
      <rect x={0} y={600} width={W} height={480} fill="#ff6a2a" opacity={0.18 + 0.08 * Math.sin(t * 0.3)} />
      {Array.from({ length: 7 }).map((_, i) => <g key={i} transform={`translate(${180 + i * 260} 1000)`}><Car kind={(["sport", "suv", "sedan"] as CarKind[])[i % 3]} c="#4a4f56" s={1.8} /></g>)}
      <Flames x={900} y={1000} t={t} s={2.2} n={8} />
      <T3 x={1700} y={680} size={34} color="#ffb03a">DECK 1 · FIRE</T3>
      {/* crew on the top deck spraying it */}
      {[0, 1].map((i) => {
        const x = 300 + i * 760;
        return (
          <g key={i}>
            <path d={`M${x + 120} 380 Q ${x + 260} ${330 + Math.sin(t * 0.3 + i) * 10} ${x + 420} 556`} stroke="#9fd3ee" strokeWidth={18} fill="none" opacity={0.9} />
            {Array.from({ length: 8 }).map((_, j) => { const a = ((t * 2 + j * 15 + i * 40) % 120) / 120; return <circle key={j} cx={x + 400 + Math.sin(j * 2) * 40 + a * 30} cy={550 - a * 260} r={20 + a * 40} fill="#f4f4f0" opacity={0.7 - a * 0.6} />; })}
            <Actor a="watch" t={t + i * 9} x={x} y={560} s={0.48} id={`cool${i}`} outfit="coverall" w={w}
              over={{ prop: "hose", pose: { ...IDLE, lean: -8, armR: [80, 30], armL: [70, 40], legL: [-20, 10], legR: [24, -8] }, face: FACES.confident }} />
          </g>
        );
      })}
      <T3 x={760} y={200} size={46} color="#fff" o={ramp(t, 20, 30)}>STEAM: THE DECK IS HOT</T3>
    </Svg>
  </AbsoluteFill>
);

// ================================================================== the high-expansion foam system
const Foam: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "how";
  const Fan: React.FC<{ x: number; y: number; on: boolean }> = ({ x, y, on }) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r={110} fill="#5a636c" {...O(8)} />
      <g transform={`rotate(${on ? t * 24 : 8})`}>{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={0} cy={-52} rx={26} ry={52} fill="#c9cfd5" stroke={INK} strokeWidth={4} transform={`rotate(${i * 90})`} />)}</g>
      <circle r={18} fill={INK} />
    </g>
  );
  if (m === "how" || m === "grow") {
    const g = m === "grow" ? ease((t - 4) / 40) : 0.12 + 0.1 * ease((t - 10) / 40);
    const bub = (i: number) => ({ x: 1150 + rnd(i) * (220 + g * 640), y: 560 + (rnd(i + 9) - 0.5) * (160 + g * 760), r: 26 + rnd(i + 4) * 34 });
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#13233d" />
          {/* water pipe + foam liquid tank join at a mixer, a pump pushes it to the fan */}
          <path d="M0 360 H 420 V 520" stroke="#5ab8ff" strokeWidth={34} fill="none" />
          <Txt x={160} y={320} s={40} c="#5ab8ff">SEA WATER</Txt>
          <rect x={120} y={600} width={240} height={300} rx={26} fill="#f4e2a0" {...O(7)} />
          <rect x={120} y={600 + 300 * (1 - 0.8)} width={240} height={300 * 0.8} rx={20} fill="#e0b13a" />
          <Txt x={240} y={960} s={38} c="#fff">FOAM LIQUID</Txt>
          <path d="M360 740 H 420 V 560" stroke="#e0b13a" strokeWidth={26} fill="none" />
          <circle cx={420} cy={540} r={50} fill="#3f9a9a" {...O(6)} />
          <g transform={`rotate(${t * 20} 420 540)`}><path d="M420 500 V 580 M380 540 H 460" stroke="#fff" strokeWidth={8} /></g>
          <Txt x={420} y={630} s={34} c="#fff">PUMP</Txt>
          <path d="M470 540 H 700" stroke="#cfe9b0" strokeWidth={30} />
          {Array.from({ length: 4 }).map((_, i) => <circle key={i} cx={480 + ((t * 8 + i * 60) % 220)} cy={540} r={10} fill="#e0b13a" />)}
          {/* the fan blowing air through it */}
          <g transform="translate(820 540)">
            <circle r={130} fill="#5a636c" {...O(8)} />
            <g transform={`rotate(${t * 26})`}>{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={0} cy={-60} rx={30} ry={60} fill="#c9cfd5" stroke={INK} strokeWidth={4} transform={`rotate(${i * 90})`} />)}</g>
            <circle r={20} fill={INK} />
            <Txt x={0} y={190} s={40} c="#fff">FANS</Txt>
          </g>
          {Array.from({ length: 6 }).map((_, i) => <path key={`a${i}`} d={`M${560 + ((t * 10 + i * 40) % 160)} ${420 + i * 46} h 70`} stroke="#9fd3ee" strokeWidth={6} opacity={0.7} />)}
          <path d="M950 540 H 1100" stroke="#f4f4f0" strokeWidth={80} />
          {/* foam pouring out and growing */}
          {Array.from({ length: Math.round(14 + g * 70) }).map((_, i) => { const b = bub(i); return <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#f4f8fb" stroke="#9fc3d8" strokeWidth={3} />; })}
          {m === "grow" && <T3 x={1500} y={150} size={90} color={YEL} s={pop(t, 20)}>× HUNDREDS</T3>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "bath") {
    const k = ease((t - 4) / 50);
    return (
      <AbsoluteFill>
        <Svg>
          <CarDeck t={t} />
          <Flames x={1300} y={820} t={t} s={1.6 * (1 - k)} />
          <path d={`M0 ${1080 - k * 900} ${Array.from({ length: 13 }).map((_, i) => `Q ${i * 160 + 80} ${1080 - k * 900 - 60} ${i * 160 + 160} ${1080 - k * 900}`).join(" ")} V 1080 H 0 Z`} fill="#fff" stroke="#c9d8e0" strokeWidth={6} />
          {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={rnd(i) * W} cy={1080 - k * 900 + rnd(i + 3) * 200} r={20 + rnd(i + 5) * 30} fill="#fff" stroke="#c9d8e0" strokeWidth={3} />)}
          <g opacity={ramp(t, 30, 40)}>
            <Actor a="relax" t={t} x={520} y={1080 - k * 900 + 300} s={0.6} id="bath" w={w} over={{ shadow: false, prop: "none", face: FACES.satisfied }} />
            <g transform={`translate(${720 + Math.sin(t * 0.2) * 10} ${1080 - k * 900 - 10})`}><ellipse cx={0} cy={0} rx={40} ry={28} fill={YEL} {...O(5)} /><circle cx={30} cy={-30} r={20} fill={YEL} {...O(5)} /><path d="M46 -30 l 18 4 l -18 4 Z" fill="#ff8a3a" /></g>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "pump" || m === "tank") {
    const lvl = m === "tank" ? 1 - ease((t - 4) / 50) * 0.6 : 1;
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#cfd8df" />
          <rect x={0} y={860} width={W} height={220} fill="#8e99a4" {...O(5)} />
          <g transform="translate(1200 520)">
            <rect x={-160} y={-300} width={320} height={600} rx={24} fill="#f4f4f0" {...O(8)} />
            <rect x={-140} y={280 - 560 * lvl} width={280} height={560 * lvl} rx={10} fill="#e0b13a" />
            <Txt x={0} y={-320} s={40}>FOAM TANK</Txt>
          </g>
          <g transform="translate(560 760)">
            <rect x={-160} y={-100} width={320} height={160} rx={20} fill="#3f9a9a" {...O(7)} />
            <circle cx={-60} cy={-20} r={50} fill="#2f7d7d" {...O(5)} />
            <g transform={`rotate(${t * 20} -60 -20)`}><line x1={-60} y1={-60} x2={-60} y2={20} stroke="#fff" strokeWidth={8} /></g>
            <circle cx={90} cy={-60} r={20} fill="#4dff7a" {...O(4)} />
          </g>
          <path d="M720 700 H 1040" stroke="#e0b13a" strokeWidth={26} />
          <Actor a={m === "pump" ? "fix" : "point"} t={t} x={300} y={1040} s={0.6} id="eng" outfit="coverall" w={w} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "fans") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#1d2025" />
          <rect x={360} y={200} width={1200} height={600} rx={20} fill={RED} {...O(10)} />
          {["PUMP", "FOAM", "VALVE", "FANS"].map((l, i) => {
            const on = i < 3 || false;
            return (
              <g key={l} transform={`translate(${520 + i * 290} 460)`}>
                <circle r={70} fill={on ? "#4dff7a" : "#2a2d33"} {...O(8)} />
                {on && <circle r={100} fill="#4dff7a" opacity={0.2} />}
                <Txt x={0} y={150} s={52} c="#fff">{l}</Txt>
              </g>
            );
          })}
          <circle cx={1390} cy={460} r={100} fill="none" stroke={YEL} strokeWidth={10} strokeDasharray="20 14" opacity={ramp(t, 10, 18)} />
          <Fan x={960} y={950} on={false} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "dribble") {
    return (
      <AbsoluteFill>
        <Svg>
          <CarDeck t={t} />
          <Flames x={1400} y={820} t={t} s={1.8} />
          <SmokeCloud t={t} k={0.4} y={-100} />
          <rect x={600} y={200} width={60} height={160} fill="#7d8a96" {...O(5)} />
          {Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={630 + Math.sin(i) * 6} cy={380 + ((t * 6 + i * 40) % 240)} rx={10} ry={16} fill="#e0b13a" />)}
          <ellipse cx={630} cy={800} rx={90} ry={16} fill="#e0b13a" opacity={0.8} />
          <Actor a="worried" t={t} x={300} y={1060} s={0.65} id="fp" w={w} over={{ pose: { ...IDLE, armR: [150, 150] }, handR: "open", face: { eyes: "closed", brows: "worried", mouth: "frown" } }} />
        </Svg>
      </AbsoluteFill>
    );
  }
  // breakers
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#cfd8df" />
        <rect x={700} y={140} width={900} height={760} rx={16} fill="#8e99a4" {...O(8)} />
        {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 6 }).map((__, c) => {
          const flick = (Math.floor(t / 6) + r * 6 + c) % 9 === 0;
          return <g key={`${r}${c}`} transform={`translate(${790 + c * 140} ${230 + r * 170})`}><rect x={-40} y={-60} width={80} height={120} rx={8} fill="#2a2d33" {...O(4)} /><rect x={-16} y={flick ? -50 : 0} width={32} height={50} rx={6} fill="#f4f4f0" /></g>;
        }))}
        <Actor a="fix" t={t} x={420} y={1060} s={0.7} id="brk" outfit="coverall" w={w} over={{ prop: "none", face: { eyes: "wide", brows: "worried", mouth: "teeth" }, emote: "sweat", emoteT: t }} />
        <T3 x={1150} y={1000} size={60} color={RED} o={ramp(t, 40, 50)}>STILL NOTHING</T3>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== abandon ship
const Abandon: Tpl = ({ t, p, w }) => {
  const call = p.mode === "call";
  if (!call) {
    return (
      <AbsoluteFill>
        <Svg>
          <BridgeInside t={t} smoke={1} alarm />
          <Actor a="worried" t={t} x={560} y={1080} s={0.85} id="cap7" outfit="captain" w={w}
            over={{ prop: "radio", pose: { ...POSES.hold, armR: [120, 120] }, face: { eyes: "wide", brows: "worried", mouth: "frown", lookX: 0.6 }, emote: "sweat", emoteT: t }} />
          <g transform={`translate(1360 300) scale(${pop(t, 10)})`}>
            <path d="M-330 -80 H 330 V 60 H 60 L 0 140 L 20 60 H -330 Z" fill="#f4f4f0" {...O(7)} />
            <Txt x={0} y={6} s={44} c={RED}>"FIRE OUT OF CONTROL!"</Txt>
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  // the captain on the ship's loudspeaker; crew in life jackets run to the muster station behind
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#5a636c" />
        <rect x={0} y={820} width={W} height={260} fill="#3a424b" />
        {Array.from({ length: 6 }).map((_, i) => {
          const x = ((t * 9 + i * 340) % (W + 300)) - 150;
          return (
            <g key={i} transform={`translate(${x} 840)`}>
              <line x1={-10} y1={0} x2={-4 + Math.sin(t * 0.8 + i) * 16} y2={-50} stroke={INK} strokeWidth={7} />
              <line x1={10} y1={0} x2={4 - Math.sin(t * 0.8 + i) * 16} y2={-50} stroke={INK} strokeWidth={7} />
              <rect x={-24} y={-120} width={48} height={74} rx={14} fill="#ff8a3a" stroke={INK} strokeWidth={5} />
              <circle cx={0} cy={-148} r={26} fill="#f3f1ea" stroke={INK} strokeWidth={5} />
            </g>
          );
        })}
        <rect width={W} height={H} fill={RED} opacity={Math.floor(t / 5) % 2 ? 0.22 : 0.05} />
        <g transform="translate(1700 160)"><circle r={50} fill={RED} opacity={Math.floor(t / 5) % 2 ? 1 : 0.4} {...O(6)} /></g>
        <Actor a="talk" t={t} x={760} y={1080} s={1.05} id="cap7c" outfit="captain" w={w}
          over={{ prop: "mic", pose: { ...POSES.hold, armR: [120, 120] }, face: { eyes: "half", brows: "worried", mouth: "o" } }} />
        {Array.from({ length: 3 }).map((_, i) => <path key={i} d={`M${980 + i * 50} ${430 - i * 10} q 40 -50 0 -100`} stroke="#fff" strokeWidth={10} fill="none" opacity={(Math.floor(t / 4) + i) % 3 === 0 ? 1 : 0.3} />)}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the rescue
const Tanker: React.FC = () => (
  <g>
    <path d="M0 -40 L 900 -40 Q 960 -30 970 0 L 950 40 L 20 40 Q 0 20 0 -40 Z" fill="#2c4a7a" {...O(5)} />
    <rect x={0} y={-40} width={970} height={20} fill="#c94a3a" />
    <rect x={40} y={-150} width={140} height={110} fill="#f4f4f0" {...O(4)} />
    {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={54 + i * 24} y={-130} width={16} height={12} fill="#2c4a7a" />)}
    <rect x={190} y={-60} width={700} height={20} fill="#9aa4ad" {...O(3)} />
    <Txt x={560} y={10} s={36} c="#fff">RESILIENT WARRIOR</Txt>
  </g>
);
const Rescue: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "call";
  if (m === "heli") {
    const k = ease((t - 4) / Math.max(30, d - 20));
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={700} />
          <OpenSea t={t} y={700} />
          <path d="M1300 700 Q 1500 480 1700 520 Q 1820 560 1920 520 V 700 Z" fill="#7d9a6a" {...O(6)} />
          <T3 x={1600} y={460} size={60}>FAIAL</T3>
          <g transform={`translate(${300 + k * 1200} ${360 - Math.sin(k * Math.PI) * 120}) scale(1.4)`}><Helo t={t} /></g>
          <g transform={`translate(${200 - k * 300} 760) scale(0.5)`}><Tanker /></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "ladder") {
    const per = Math.max(4, (d - 30) / 22);
    const climb = 36;
    const done = (i: number) => t - 6 - i * per > climb;
    const n = Array.from({ length: 22 }).filter((_, i) => done(i)).length;
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={760} />
          <OpenSea t={t} y={760} />
          {/* the ship's side, with the rope ladder down to the boat */}
          <rect x={0} y={0} width={760} height={800} fill={"#f2f0e8"} {...O(8)} />
          <rect x={0} y={740} width={760} height={60} fill="#5b9bd5" />
          {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={240 + (i % 3) * 80 + Math.sin(t * 0.04 + i) * 20} cy={-40 + Math.floor(i / 3) * 60} r={90} fill="#2a2b30" opacity={0.7} />)}
          <path d="M760 60 V 800 M820 60 V 800" stroke="#8a6a4a" strokeWidth={8} />
          {Array.from({ length: 21 }).map((_, i) => <line key={i} x1={760} y1={80 + i * 34} x2={820} y2={80 + i * 34} stroke="#8a6a4a" strokeWidth={8} />)}
          {Array.from({ length: 22 }).map((_, i) => {
            const k = (t - 6 - i * per) / climb;
            if (k < 0 || k > 1 || i % 3 !== 0) return null;
            return <Actor key={i} a="rope" t={t + i * 5} x={790} y={140 + k * 600} s={0.24} id={`lad${i}`} outfit="coverall" />;
          })}
          {/* the boat fills up */}
          <g transform={`translate(1060 ${800 + Math.sin(t * 0.15) * 6})`}>
            {Array.from({ length: Math.min(22, n) }).map((_, i) => <g key={i} transform={`translate(${-150 + (i % 11) * 32} ${-40 - Math.floor(i / 11) * 26})`}><circle r={15} fill="#f3f1ea" stroke={INK} strokeWidth={3} /><path d="M-15 -4 Q 0 -24 15 -4" fill="#f1f6fa" stroke={INK} strokeWidth={3} /></g>)}
            <path d="M-220 -30 L 230 -30 L 190 40 L -180 40 Z" fill="#ff8a3a" {...O(6)} />
          </g>
          <g transform="translate(1600 260)"><rect x={-220} y={-90} width={440} height={180} rx={20} fill="#0b1426" {...O(6)} /><text x={0} y={40} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={110} fill="#4dff7a">{n}/22</text></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "adrift") {
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={660} />
          <rect width={W} height={660} fill="#5d6b80" opacity={0.3} />
          <OpenSea t={t} y={680} />
          <g transform={`translate(${300 + Math.sin(t * 0.02) * 20} 690) rotate(${Math.sin(t * 0.04) * 1.2} 700 -100)`}><Pctc L={1400} fire={1} t={t} /></g>
          <g transform={`translate(1640 ${860 + Math.sin(t * 0.15) * 8})`}>
            <Actor a="look" t={t} x={0} y={0} s={0.3} id="adr" w={w} over={{ face: FACES.worried }} />
            <path d="M-70 -24 L 70 -24 L 54 14 L -54 14 Z" fill="#e0a23b" {...O(5)} />
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  // call / tanker
  const k = m === "tanker" ? ease((t - 4) / 40) : 0;
  return (
    <AbsoluteFill>
      <Svg>
        <TopSea t={t} />
        <g transform="translate(260 520) scale(0.55)"><g transform="rotate(0)"><rect x={0} y={-60} width={1000} height={120} rx={40} fill="#f2f0e8" {...O(8)} /><SmokeCloud t={t} k={0.6} y={-560} /></g></g>
        {m === "call" && Array.from({ length: 4 }).map((_, i) => { const r = (t * 9 + i * 80) % 320; return <circle key={i} cx={540} cy={520} r={r + 40} fill="none" stroke={YEL} strokeWidth={8} opacity={1 - r / 320} />; })}
        {m === "call" && <T3 x={540} y={260} size={90} color={YEL} s={pop(t, 4)}>MAYDAY</T3>}
        {m === "tanker" && <g transform={`translate(${1500 - k * 600} ${300 + k * 120}) rotate(${180 - 160 * k}) scale(0.55)`}><path d="M-480 -50 L 420 -50 Q 490 0 420 50 L -480 50 Z" fill="#2c4a7a" {...O(8)} /><rect x={-460} y={-40} width={120} height={80} fill="#f4f4f0" {...O(4)} /></g>}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== why car-carrier fires are so hard
const Why7: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "open";
  if (m === "open" || m === "spread") {
    const spread = m === "spread" ? clamp01((t - 4) / Math.max(30, d - 10)) : 0.1;
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#5a636c" />
          {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 14 }).map((__, c) => {
            const lit = c / 14 < spread + 0.08 && Math.abs(r - 2) <= 1 + spread * 2;
            return <g key={`${r}${c}`} transform={`translate(${110 + c * 130} ${200 + r * 170})`}><CarTop c={CAR_COLORS[(r * 3 + c) % CAR_COLORS.length]} glow={lit ? 1 : 0} /></g>;
          }))}
          {m === "spread" && Array.from({ length: 6 }).map((_, i) => { const x = (t * 14 + i * 340) % (W + 200) - 100; return <path key={i} d={`M${x} ${150 + i * 150} h 160 l -24 -16 m 24 16 l -24 16`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.7} />; })}
          {m === "open" && <g opacity={ramp(t, 6, 14)}><rect x={40} y={110} width={1840} height={860} fill="none" stroke={YEL} strokeWidth={10} strokeDasharray="30 20" /></g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "burn" || m === "many") {
    if (m === "many") {
      return (
        <AbsoluteFill>
          <Svg>
            <rect width={W} height={H} fill="#1d2025" />
            {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 14 }).map((__, c) => {
              const i = r * 14 + c;
              return <g key={i} transform={`translate(${130 + c * 128} ${180 + r * 140}) scale(${pop(t, 2 + i * 0.4)})`}><CarTop c={CAR_COLORS[i % CAR_COLORS.length]} glow={0.25 + 0.25 * Math.sin(t * 0.3 + i)} /></g>;
            }))}
          </Svg>
        </AbsoluteFill>
      );
    }
    const items: [string, number, number][] = [["FUEL", 700, 900], ["SEATS", 860, 760], ["PLASTIC", 1260, 760], ["TYRES", 1220, 960]];
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#e8eef2" />
          <g transform="translate(960 1000)"><Car kind="sedan" c="#f4f4f0" s={8} /></g>
          {items.map(([l, x, y], i) => (
            <g key={l} transform={`translate(${x} ${y}) scale(${pop(t, 6 + i * 14)})`}>
              <circle r={50} fill="#ff8a3a" opacity={0.7} {...O(5)} />
              <T3 x={0} y={-70} size={46} color={RED}>{l}</T3>
            </g>
          ))}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "battery" || m === "chain" || m === "relight") {
    const n = 10;
    const hot = m === "battery" ? 1 : m === "chain" ? Math.floor(ease((t - 4) / Math.max(20, d - 10)) * n) + 1 : n;
    const out = m === "relight" ? (t > 20 && t < 50 ? 1 : 0) : 0;
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#13233d" />
          <rect x={260} y={380} width={1400} height={340} rx={30} fill="#2c4a7a" {...O(8)} />
          {Array.from({ length: n }).map((_, i) => (
            <g key={i} transform={`translate(${330 + i * 132} 420)`}>
              <rect x={0} y={0} width={110} height={260} rx={16} fill={i < hot && !out ? "#ff6a2a" : "#5ab8ff"} {...O(5)} />
              {i < hot && !out && <rect x={0} y={0} width={110} height={260} rx={16} fill="#ffb03a" opacity={0.3 + 0.3 * Math.sin(t * 0.5 + i)} />}
            </g>
          ))}
          {m === "relight" && t >= 50 && <Flames x={960} y={380} t={t} s={2} />}
          {m === "relight" && t > 20 && t < 50 && <T3 x={960} y={300} size={70} color="#fff">PHEW… OUT?</T3>}
          {m === "relight" && t >= 50 && <T3 x={960} y={220} size={80} color={RED} s={pop(t, 50)}>NOPE!</T3>}
          {m !== "relight" && hot > 0 && <T3 x={330 + (hot - 1) * 132 + 55} y={340} size={60} color={YEL}>🔥</T3>}
        </Svg>
      </AbsoluteFill>
    );
  }
  // report / report2
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#d9d6cc" />
        <g transform="translate(960 560) rotate(-2)">
          <rect x={-420} y={-440} width={840} height={880} fill="#fbfaf4" {...O(8)} />
          <Txt x={0} y={-360} s={40} c="#2c4a7a">PANAMA MARITIME AUTHORITY</Txt>
          <Txt x={0} y={-310} s={34}>FELICITY ACE · R-013-2022</Txt>
          {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-340} y={-240 + i * 56} width={680 - (i % 3) * 120} height={16} fill="#c9cfd5" />)}
        </g>
        {p.mode === "report" ? (
          <g transform={`translate(960 600) rotate(-10) scale(${pop(t, 10)})`}><rect x={-380} y={-80} width={760} height={160} rx={20} fill="none" stroke={RED} strokeWidth={16} /><Txt x={0} y={30} s={90} c={RED}>NOT PREPARED</Txt></g>
        ) : (
          <g>
            {["NO SPECIAL EQUIPMENT", "NO SPECIAL PROCEDURE"].map((l, i) => <g key={l} transform={`translate(960 ${460 + i * 200}) scale(${pop(t, 4 + i * 20)})`}><rect x={-440} y={-60} width={880} height={120} rx={20} fill="#f4f4f0" {...O(6)} /><Txt x={0} y={20} s={56} c={RED}>{"✕ " + l}</Txt></g>)}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the Höegh Xiamen, Jacksonville 2020
const Xiamen: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "port";
  if (m === "port" || m === "fire") {
    const fire = m === "fire";
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill={fire ? "#5d6b80" : "#9fd3ee"} />
          {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={1000 + i * 100} y={300 + (i % 3) * 60} width={80} height={500} fill={fire ? "#3a424b" : "#7d8a96"} {...O(3)} />)}
          <rect x={0} y={760} width={W} height={320} fill="#3f86b0" />
          <rect x={0} y={760} width={W} height={60} fill="#8e99a4" {...O(5)} />
          <g transform="translate(120 760) scale(0.95)"><Pctc L={1400} t={t} fire={fire ? 1 : 0} scorch={fire ? 0.6 : 0} name={false} water={false} /></g>
          <T3 x={700} y={600} size={44} color="#2c4a7a" o={fire ? 0 : 1}>HÖEGH XIAMEN</T3>
          {fire && [0, 1, 2].map((i) => <g key={i} transform={`translate(${1500 + i * 120} 790)`}><rect x={-50} y={-50} width={100} height={50} fill={RED} {...O(4)} /><circle cx={-30} cy={0} r={12} fill={INK} /><circle cx={30} cy={0} r={12} fill={INK} /></g>)}
          {!fire && <T3 x={1500} y={240} size={60}>JACKSONVILLE, FLORIDA</T3>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "used") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#e8d6a6" />
          <rect x={0} y={780} width={W} height={300} fill="#8e99a4" {...O(5)} />
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i} transform={`translate(${200 + i * 300} 780) rotate(${(i % 2 ? 1 : -1) * 1.5})`}>
              <Car kind={(["sedan", "suv", "sport"] as CarKind[])[i % 3]} c={["#9a8a6a", "#7d8a96", "#a8584a", "#6a7a5a", "#8a8a8a", "#b0a080"][i]} s={2.3} />
              <path d="M-40 -60 l 10 8 l 8 -6" stroke={INK} strokeWidth={4} fill="none" />
            </g>
          ))}
          <g transform={`translate(1500 300) scale(${pop(t, 10)})`}><circle r={90} fill="#f4f4f0" {...O(7)} /><text x={0} y={36} textAnchor="middle" fontSize={100}>⛽</text></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "ntsb") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#d9d6cc" />
          <g transform="translate(960 560) rotate(2)">
            <rect x={-420} y={-440} width={840} height={880} fill="#fbfaf4" {...O(8)} />
            <Txt x={0} y={-360} s={44} c="#2c4a7a">NTSB</Txt>
            <Txt x={0} y={-310} s={32}>MARINE ACCIDENT REPORT · HÖEGH XIAMEN</Txt>
            {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-340} y={-240 + i * 56} width={680 - (i % 3) * 120} height={16} fill="#c9cfd5" />)}
          </g>
          <Actor a="magnify" t={t} x={1580} y={1060} s={0.6} id="ntsb" w={w} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "battery" || m === "spark") {
    const spark = m === "spark";
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#2a2d33" />
          <rect x={560} y={420} width={800} height={420} rx={30} fill="#1d2025" {...O(8)} />
          <rect x={620} y={360} width={120} height={70} rx={10} fill={RED} {...O(6)} /><Txt x={680} y={410} s={60} c="#fff">+</Txt>
          <rect x={1180} y={360} width={120} height={70} rx={10} fill="#2a2d33" {...O(6)} /><Txt x={1240} y={410} s={60} c="#fff">−</Txt>
          <Txt x={960} y={680} s={70} c="#fff">12 V</Txt>
          <path d={spark ? `M680 360 Q 600 ${220 + Math.sin(t * 0.8) * 20} 420 260` : `M680 360 Q 560 140 300 ${200 + ease(t / 30) * 300}`} stroke="#c9a23a" strokeWidth={22} fill="none" strokeLinecap="round" />
          {!spark && <g opacity={ramp(t, 20, 30)}><circle cx={300} cy={500} r={70} fill="none" stroke="#4dff7a" strokeWidth={10} /><path d="M270 500 l 20 20 l 40 -40" stroke="#4dff7a" strokeWidth={12} fill="none" /><T3 x={300} y={640} size={44} color="#4dff7a">DISCONNECTED</T3></g>}
          {spark && Array.from({ length: 10 }).map((_, i) => <line key={i} x1={440} y1={270} x2={440 + Math.cos(i * 0.63 + t) * (40 + rnd(i + t) * 80)} y2={270 + Math.sin(i * 0.63 + t) * (40 + rnd(i + 2) * 80)} stroke={YEL} strokeWidth={6} opacity={(Math.floor(t / 2) + i) % 2} />)}
          {spark && t > 30 && <Flames x={460} y={420} t={t} s={1.2} />}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "loss") {
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#3a424b" />
          <rect x={0} y={760} width={W} height={320} fill="#2c3a4a" />
          <g transform="translate(260 760)"><Pctc L={1400} t={t} scorch={1} name={false} water={false} /></g>
          <g transform={`translate(960 400) rotate(-8) scale(${pop(t, 14)})`}><rect x={-400} y={-90} width={800} height={180} rx={20} fill="none" stroke={RED} strokeWidth={18} /><Txt x={0} y={34} s={100} c={RED}>TOTAL LOSS</Txt></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  // scale: petrol pump vs lightning bolt, balanced
  const tilt = Math.sin(t * 0.08) * 4;
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#f3f1ea" />
        <rect x={930} y={420} width={60} height={520} fill="#8a6a4a" {...O(6)} />
        <g transform={`translate(960 420) rotate(${tilt})`}>
          <rect x={-520} y={-14} width={1040} height={28} rx={10} fill="#8a6a4a" {...O(6)} />
          <g transform="translate(-460 0)"><path d="M-120 0 L 120 0 L 90 100 L -90 100 Z" fill="#c9cfd5" {...O(6)} /><text x={0} y={-20} textAnchor="middle" fontSize={140}>⛽</text></g>
          <g transform="translate(460 0)"><path d="M-120 0 L 120 0 L 90 100 L -90 100 Z" fill="#c9cfd5" {...O(6)} /><text x={0} y={-20} textAnchor="middle" fontSize={140}>⚡</text></g>
        </g>
        <Actor a="shrug" t={t} x={1700} y={1060} s={0.5} id="sc7" w={w} />
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES7B: Record<string, Tpl> = {
  deckmap: DeckMap, lookaft: LookAft, radio7: Radio7, door7: Door7, cool7: Cool7, foam: Foam, abandon: Abandon, rescue: Rescue, why7: Why7, xiamen: Xiamen,
};
export { NightSky as NightSky7B };
