// The Ship Guy: carrier video (#6), part 2 scenes: the meatball, the LSO, the arresting wires, the bolter, the angled deck,
// the barricade, the coloured jerseys, primary flight control and launch/recovery cycles. Frame-driven only.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, W, H } from "./art";
import { FACES, IDLE, POSES } from "./guy";
import { fontFamily, ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, T3, clamp01, pop } from "./templates3";
import { NightSky, rnd, YEL, RED } from "./templates5";
import { ANG, CarrierTop, Crew, DECK, DECK_N, DaySky, Fighter, FighterTop, JERSEY, NAVY, OpenSea, TopSea } from "./templates6";

const O = (w = 5) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const });
const ease = (k: number) => { const c = clamp01(k); return c * c * (3 - 2 * c); };
const Txt: React.FC<{ x: number; y: number; s: number; c?: string; a?: "start" | "middle" | "end"; children: React.ReactNode }> = ({ x, y, s, c = INK, a = "middle", children }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={fontFamily} fontWeight={700} fontSize={s} fill={c}>{children}</text>
);

// ================================================================== the meatball (optical landing system)
const Meatball: Tpl = ({ t, p }) => {
  const st = p.step ?? "1";
  const off = st === "high" ? -1 : st === "low" ? 1 : 0;
  const k = ease((t - 6) / 16);
  const by = off * 120 * k;
  const Lens = (
    <g>
      <rect x={-120} y={-260} width={240} height={520} rx={20} fill="#2a2f36" {...O(8)} />
      {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={-90} y={-230 + i * 96} width={180} height={84} rx={10} fill="#141820" {...O(3)} />)}
      <circle cx={0} cy={by} r={56} fill={off > 0 && k > 0.8 ? "#ff4a3a" : "#ffb03a"} />
      <circle cx={0} cy={by} r={80} fill={off > 0 && k > 0.8 ? "#ff4a3a" : "#ffb03a"} opacity={0.25} />
      {[-1, 1].map((s) => [1, 2, 3, 4].map((j) => <g key={`${s}${j}`}><circle cx={s * (120 + j * 80)} cy={0} r={30} fill="#4dff7a" /><circle cx={s * (120 + j * 80)} cy={0} r={46} fill="#4dff7a" opacity={0.2} /></g>))}
    </g>
  );
  if (st === "1") {
    return (
      <AbsoluteFill>
        <Svg>
          <NightSky t={t} />
          <OpenSea t={t} y={760} night />
          <rect x={0} y={700} width={W} height={70} fill={DECK_N} {...O(5)} />
          <g transform={`translate(560 560) scale(${0.45 * pop(t, 4)})`}>{Lens}</g>
          <g transform={`translate(${1500 - t * 1.5} ${300 + t * 0.6}) scale(0.7) rotate(-4)`}><Fighter gear hook /></g>
          <path d={`M${1300 - t * 1.5} ${340 + t * 0.6} L 720 560`} stroke="#ffb03a" strokeWidth={4} strokeDasharray="14 12" opacity={ramp(t, 14, 24)} />
        </Svg>
      </AbsoluteFill>
    );
  }
  // close-up of the lens + a little side diagram of the glide path
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#0d1a33" />
        <g transform="translate(720 560)">{Lens}</g>
        <g transform="translate(1500 640)">
          <rect x={-300} y={-260} width={600} height={420} rx={24} fill="#f4f4f0" {...O(6)} />
          <rect x={-260} y={110} width={260} height={30} fill={DECK} {...O(4)} />
          <line x1={-20} y1={110} x2={260} y2={-200} stroke="#3f9a4f" strokeWidth={8} strokeDasharray="20 12" />
          <g transform={`translate(${170} ${-100 + off * 70 * k}) scale(0.32) rotate(-14)`}><Fighter gear hook /></g>
          <Txt x={0} y={-215} s={40} c={off === 0 ? "#3f9a4f" : off < 0 ? "#c97a1a" : RED}>{off === 0 ? "ON THE GLIDE PATH" : off < 0 ? "TOO HIGH" : "TOO LOW"}</Txt>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the landing signal officer
const Lso: Tpl = ({ t, p, w }) => {
  const talk = p.talk === "1";
  return (
    <AbsoluteFill>
      <Svg>
        <NightSky t={t} />
        <OpenSea t={t} y={820} night />
        <rect x={0} y={760} width={W} height={70} fill={DECK_N} {...O(5)} />
        {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={120 + i * 150} cy={770} r={5} fill="#ffd27a" />)}
        <g transform={`translate(${1500 - t * 2} ${250 + t * 0.8}) scale(0.5) rotate(-4)`}><Fighter gear hook /></g>
        <circle cx={1500 - t * 2 + 105} cy={250 + t * 0.8 - 40} r={10} fill="#fff" opacity={0.9} />
        <Actor a="clipboard" t={t} x={600} y={1000} s={0.85} id="lso" outfit="jersey" w={w}
          over={{ jersey: JERSEY.white, prop: "phone", pose: { ...POSES.hold, armR: [120, 120], tilt: -6 }, face: { eyes: "dot", brows: "one", mouth: talk ? "smile" : "flat", lookX: 0.8, lookY: -0.5 } }} />
        {talk && (
          <g transform={`translate(1020 360) scale(${pop(t, 8)})`}>
            <path d="M-260 -80 H 260 V 60 H -40 L -120 140 L -100 60 H -260 Z" fill="#f4f4f0" {...O(7)} />
            <Txt x={0} y={14} s={52}>{p.say ? `"${p.say.replace(/_/g, " ")}"` : "\"ROGER BALL…\""}</Txt>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the arresting wires
const WireSide: React.FC<{ x: number; y: number; hl?: boolean; n?: number }> = ({ x, y, hl, n }) => (
  <g>
    <line x1={x - 10} y1={y} x2={x - 10} y2={y - 10} {...O(4)} /><line x1={x + 10} y1={y} x2={x + 10} y2={y - 10} {...O(4)} />
    <ellipse cx={x} cy={y - 12} rx={18} ry={7} fill={hl ? YEL : "#c7cdd3"} {...O(3)} />
    {n !== undefined && <Txt x={x} y={y + 60} s={36} c={hl ? YEL : "#fff"}>{n}</Txt>}
  </g>
);
const Wires: Tpl = ({ t, d, p, w }) => {
  const m = p.mode ?? "top";
  const n = Number(p.n ?? 4);
  const deck = 700;
  const WX = [620, 780, 940, 1100]; // side view: wire 1..4 (the stern edge is at x = 300)
  if (m === "top" || m === "count" || m === "aim") {
    const sc = 3.1;
    return (
      <AbsoluteFill>
        <Svg>
          <TopSea t={t} />
          <g transform={`translate(${-200 - t * 0.4} 760) scale(${sc})`}>
            <CarrierTop wires={0} num="68" />
            <g transform={`translate(30 30) rotate(${ANG})`}>
              {Array.from({ length: n }).map((_, i) => {
                const on = m === "top" ? ramp(t, 6 + i * 5, 10 + i * 5) : 1;
                const hl = m === "aim" && i === 2;
                return (
                  <g key={i} opacity={on}>
                    <line x1={120 + i * 32} y1={-40} x2={120 + i * 32} y2={40} stroke={hl ? YEL : "#e9edf0"} strokeWidth={hl ? 5 : 3.5} />
                    {(m !== "top") && <g transform={`translate(${120 + i * 32} -56) rotate(${-ANG})`}><circle r={11} fill={hl ? YEL : "#f4f4f0"} {...O(2)} /><Txt x={0} y={5} s={14}>{i + 1}</Txt></g>}
                  </g>
                );
              })}
              {m === "aim" && <g opacity={ramp(t, 12, 20)}><circle cx={184} cy={0} r={22 + Math.sin(t * 0.4) * 3} fill="none" stroke={YEL} strokeWidth={3} /><line x1={184} y1={-30} x2={184} y2={30} stroke={YEL} strokeWidth={2} /></g>}
            </g>
          </g>
          {m === "top" && (
            <g transform={`translate(1500 380) scale(${pop(t, 20)})`}>
              <rect x={-300} y={-120} width={600} height={240} rx={22} fill="#f4f4f0" {...O(6)} />
              <rect x={-260} y={40} width={520} height={30} fill={DECK} {...O(4)} />
              {[-140, 0, 140].map((x) => <g key={x}><line x1={x - 20} y1={40} x2={x - 30} y2={10} {...O(5)} /><line x1={x + 20} y1={40} x2={x + 30} y2={10} {...O(5)} /></g>)}
              <path d="M-260 12 Q 0 4 260 12" stroke="#7d8a96" strokeWidth={10} fill="none" />
              <Txt x={0} y={-60} s={36}>A LITTLE ABOVE THE DECK</Txt>
            </g>
          )}
        </Svg>
      </AbsoluteFill>
    );
  }
  // side-view family
  const night = p.night === "1";
  const bg = (
    <g>
      {night ? <NightSky t={t} /> : <DaySky hz={deck} />}
      <OpenSea t={t} y={deck + 80} night={night} />
      <path d={`M300 ${deck} L ${W} ${deck} L ${W} ${deck + 80} L 330 ${deck + 80} Z`} fill={night ? DECK_N : DECK} {...O(6)} />
      {night && Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={360 + i * 130} cy={deck + 8} r={5} fill="#ffd27a" />)}
      <path d={`M300 ${deck} L 330 ${deck + 80} L 270 ${deck + 260} L 240 ${deck + 260}`} fill="#6b747d" {...O(5)} />
      {WX.map((x, i) => <WireSide key={i} x={x} y={deck} hl={(m === "margin" || m === "catch") && i === 2} n={m === "margin" ? i + 1 : undefined} />)}
    </g>
  );
  if (m === "hook") {
    return (
      <AbsoluteFill>
        <Svg>
          {bg}
          <g transform={`translate(1000 ${deck - 220 + Math.sin(t * 0.1) * 6}) scale(1.8) rotate(-4)`}><Fighter gear hook /></g>
          <circle cx={1000 - 210 * 1.8} cy={deck - 220 - 4} r={100} fill="none" stroke={YEL} strokeWidth={8} opacity={ramp(t, 6, 14)} />
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "catch" || m === "miss") {
    // the jet flies in from the left, touches down near wire 1-2 and the hook grabs wire 3
    const k = clamp01((t - 4) / 40);
    const x = 200 + k * 900;
    const y = deck - 6 - Math.max(0, 1 - k * 1.6) * 200;
    const caught = x > WX[2] + 330 && m === "catch";
    const xs = caught ? WX[2] + 330 + (x - WX[2] - 330) * 0.3 : x;
    return (
      <AbsoluteFill>
        <Svg>
          {bg}
          {caught && <path d={`M${WX[2] - 30} ${deck - 12} L ${xs - 330} ${deck - 10} L ${WX[2] + 30} ${deck - 12}`} stroke={YEL} strokeWidth={6} fill="none" />}
          <g transform={`translate(${xs} ${y}) scale(1.6) rotate(${-3 * (1 - k)})`}><Fighter gear hook flame={1} /></g>
          {caught && Array.from({ length: 8 }).map((_, i) => <line key={i} x1={WX[2]} y1={deck - 10} x2={WX[2] - 30 - rnd(i) * 60} y2={deck - 40 - rnd(i + 3) * 50} stroke={YEL} strokeWidth={5} opacity={Math.max(0, 1 - (t - 30) / 20)} />)}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "margin") {
    return (
      <AbsoluteFill>
        <Svg>
          {bg}
          <line x1={WX[2]} y1={deck} x2={WX[2] - 900} y2={deck - 460} stroke="#3f9a4f" strokeWidth={8} strokeDasharray="22 14" />
          <g transform={`translate(${WX[2] - 640 + t * 2} ${deck - 330 + t * 1}) scale(0.9) rotate(-26)`}><Fighter gear hook /></g>
          <g opacity={ramp(t, 8, 16)}>
            <path d={`M300 ${deck + 120} V ${deck + 150} H ${WX[2]} V ${deck + 120}`} stroke={YEL} strokeWidth={8} fill="none" />
            <T3 x={(300 + WX[2]) / 2} y={deck + 230} size={52} color={YEL}>SAFETY MARGIN</T3>
          </g>
          <T3 x={250} y={deck - 60} size={44} color={RED} o={ramp(t, 16, 24)}>EDGE!</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "below") {
    const k = ease((t - 6) / 40);
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#39424b" />
          <rect x={0} y={0} width={W} height={300} fill={SKYTOP} />
          <rect x={0} y={260} width={W} height={50} fill={DECK} {...O(6)} />
          <g transform={`translate(${1300 + k * 300} 254) scale(1.2)`}><Fighter gear hook /></g>
          <path d={`M900 270 L ${1300 + k * 300 - 250} 262`} stroke={YEL} strokeWidth={8} />
          <path d={`M900 270 L 900 420 L 400 420 L 400 640`} stroke="#c7cdd3" strokeWidth={10} fill="none" />
          <circle cx={900} cy={300} r={22} fill="#7d8a96" {...O(4)} /><circle cx={900} cy={420} r={22} fill="#7d8a96" {...O(4)} /><circle cx={400} cy={420} r={22} fill="#7d8a96" {...O(4)} />
          {/* the big energy absorber */}
          <rect x={200} y={640} width={1500} height={200} rx={30} fill="#7d8a96" {...O(8)} />
          <rect x={300 + k * 900} y={660} width={60} height={160} fill={YEL} {...O(5)} />
          <rect x={360 + k * 900} y={720} width={1300 - k * 900} height={40} fill="#5a636c" />
          {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${1650 - i * 40} 680 q 20 ${30} 0 ${60} q -20 30 0 60`} stroke="#9fd3ee" strokeWidth={6} fill="none" opacity={k * (0.5 + 0.5 * Math.sin(t * 0.6 + i))} />)}
          <T3 x={950} y={950} size={58} o={ramp(t, 10, 18)}>ENERGY SOAKED UP BELOW DECK</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "stop") {
    // top-down: the wire stretches into a V while a ruler counts the distance
    const k = ease(t / Math.max(30, d * 0.8));
    const x = 300 + k * 1100;
    const showD = p.dist === "1", showS = p.speed === "1";
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill={DECK} />
          {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 180 - ((k * 1100) % 180)} y1={540} x2={i * 180 + 90 - ((k * 1100) % 180)} y2={540} stroke={YEL} strokeWidth={6} />)}
          <path d={`M300 140 L ${x - 120} 540 L 300 940`} stroke="#e9edf0" strokeWidth={8} fill="none" />
          <circle cx={300} cy={140} r={18} fill="#7d8a96" {...O(4)} /><circle cx={300} cy={940} r={18} fill="#7d8a96" {...O(4)} />
          <g transform={`translate(${x} 540) scale(1.7)`}><FighterTop /></g>
          {showD && <g><path d={`M300 1000 H ${x}`} stroke={YEL} strokeWidth={10} /><T3 x={(300 + x) / 2} y={980} size={60} color={YEL}>{Math.round(k * 100)} m</T3></g>}
          {showS && <g transform="translate(1600 200)"><circle r={120} fill="#f4f4f0" {...O(8)} /><Txt x={0} y={20} s={64}>240</Txt><Txt x={0} y={70} s={28}>km/h</Txt></g>}
          {!showD && !showS && <g transform={`translate(1600 200) scale(${pop(t, 6)})`}><rect x={-180} y={-80} width={360} height={160} rx={20} fill="#f4f4f0" {...O(8)} /><Txt x={0} y={-10} s={56}>20+ t</Txt><Txt x={0} y={50} s={30} c="#5a636c">MORE THAN 20 TONNES</Txt></g>}
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "pile") {
    // the jet stops dead; the Ship Guy, riding on the wing, keeps going and lands in a heap
    const fly = clamp01((t - 6) / 20);
    return (
      <AbsoluteFill>
        <Svg>
          {bg}
          <path d={`M${WX[2] - 30} ${deck - 12} L 1060 ${deck - 10} L ${WX[2] + 30} ${deck - 12}`} stroke={YEL} strokeWidth={6} fill="none" />
          <g transform={`translate(1390 ${deck - 6}) scale(1.6)`}><Fighter gear hook flame={0.5} /></g>
          <Actor a="faint" t={fly < 1 ? 0 : t - 6} x={1400 + fly * 360} y={deck - 110 - Math.sin(fly * Math.PI) * 260 + fly * 110} s={0.42} id="pile"
            over={fly < 1 ? { rot: fly * 300, face: { eyes: "wide", brows: "worried", mouth: "scream" }, pose: { ...POSES.cheer } } : { emote: "stars", emoteT: t }} />
          <T3 x={1600} y={300} size={110} color={YEL} s={pop(t, 4)}>2.0 s</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  if (m === "beat") {
    // many landings: the same cable hit again and again; the counter climbs and strands start to fray
    const n2 = Math.floor(t / 4);
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#2a2f36" />
          <path d="M0 560 Q 960 540 1920 560" stroke="#9aa4ad" strokeWidth={60} fill="none" />
          {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={i * 66} y1={534} x2={i * 66 + 50} y2={586} stroke="#6b747d" strokeWidth={8} />)}
          {Array.from({ length: Math.min(8, n2) }).map((_, i) => <path key={`f${i}`} d={`M${700 + i * 70} 540 l ${10 + rnd(i) * 30} ${-40 - rnd(i + 2) * 40}`} stroke="#c7cdd3" strokeWidth={4} fill="none" />)}
          <g transform={`translate(960 540) scale(${1 + (t % 4 < 1 ? 0.04 : 0)})`}>{t % 8 < 2 && <circle r={160} fill={YEL} opacity={0.25} />}</g>
          <T3 x={960} y={300} size={70} color={YEL}>{"LANDING #" + (100 + n2 * 7)}</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  // inspect: green jerseys check the cable with a gauge, a new cable is rolled out
  return (
    <AbsoluteFill>
      <Svg>
        {bg}
        <Actor a="magnify" t={t} x={760} y={deck + 230} s={0.62} id="ins1" outfit="jersey" w={w} over={{ jersey: JERSEY.green }} />
        <Actor a="notes" t={t} x={1150} y={deck + 230} s={0.62} id="ins2" outfit="jersey" over={{ jersey: JERSEY.green }} />
        <g transform={`translate(${1700 - ease((t - 30) / 40) * 200} ${deck - 90}) rotate(${-t * 4})`}>
          <circle r={80} fill="#8a6a4a" {...O(6)} /><circle r={52} fill="#9aa4ad" {...O(4)} /><circle r={14} fill={INK} />
        </g>
        <g transform={`translate(400 260) scale(${pop(t, 10)})`}>
          <rect x={-200} y={-70} width={400} height={140} rx={18} fill="#f4f4f0" {...O(6)} />
          <Txt x={0} y={-12} s={40}>WORN?</Txt><Txt x={0} y={44} s={40} c="#3f9a4f">→ REPLACE</Txt>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};
const SKYTOP = "#9fd3ee";

// ================================================================== the bolter (side view, day)
const Bolter: Tpl = ({ t, p }) => {
  const m = p.mode ?? "miss";
  const deck = 700, end = 1700;
  const WX = [620, 780, 940, 1100];
  const k = clamp01((t - 2) / (m === "go" ? 70 : 50));
  let x = 250 + k * 1600, y = deck - 6;
  if (m === "miss") y = deck - 6 - Math.max(0, 1 - k * 2.4) * 160;
  let rot = 0;
  if (m === "low" && x > end) { rot = Math.min(35, (x - end) * 0.15); y += Math.pow((x - end) / 18, 2); }
  if (m === "go" && x > end - 150) { y -= Math.pow((x - end + 150) / 14, 2); rot = -Math.min(14, (x - end + 150) * 0.05); }
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={deck} />
        <OpenSea t={t} y={deck + 80} />
        <path d={`M300 ${deck} L ${end} ${deck} L ${end} ${deck + 80} L 330 ${deck + 80} Z`} fill={DECK} {...O(6)} />
        {WX.map((wx, i) => <g key={i}><line x1={wx - 10} y1={deck} x2={wx - 10} y2={deck - 10} {...O(4)} /><ellipse cx={wx} cy={deck - 12} rx={18} ry={7} fill="#c7cdd3" {...O(3)} /></g>)}
        {m === "go" && <path d={`M${end} ${deck - 60} q 300 -400 0 -500 q -500 -80 -1300 120`} stroke="#fff" strokeWidth={8} fill="none" strokeDasharray="22 16" opacity={ramp(t, 40, 50)} />}
        <g transform={`translate(${x} ${y}) scale(1.4) rotate(${rot})`} opacity={m === "low" ? 0.85 : 1}>
          <Fighter gear hook flame={m === "low" ? 0 : 1} />
        </g>
        {m === "miss" && WX.map((wx, i) => x > wx + 290 && x < wx + 420 && <g key={i}>{Array.from({ length: 5 }).map((_, j) => <line key={j} x1={wx} y1={deck - 12} x2={wx - 20 - rnd(j + i) * 40} y2={deck - 40 - rnd(j * 2 + i) * 30} stroke={YEL} strokeWidth={5} />)}</g>)}
        {m === "miss" && p.label === "1" && <T3 x={960} y={330} size={150} color={YEL} s={pop(t, 2)} rot={-6}>BOLTER!</T3>}
        {m === "low" && (
          <g>
            <T3 x={420} y={300} size={60} color={RED}>LOW POWER?</T3>
            {x > end + 200 && <g><ellipse cx={end + 260} cy={deck + 110} rx={160} ry={30} fill="#fff" opacity={0.8} /><T3 x={960} y={460} size={200} color={RED} s={pop(t, 50)}>✕</T3></g>}
          </g>
        )}
        {m === "go" && <Actor a="fold" t={t} x={420} y={deck + 330} s={0.6} id="relief" over={{ face: t > 40 ? FACES.satisfied : { eyes: "wide", brows: "worried", mouth: "o" }, emote: t > 44 ? "sweat" : undefined, emoteT: t - 44 }} />}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the angled deck (top-down)
const Angled: Tpl = ({ t, p }) => {
  const m = p.mode ?? "1";
  const sc = 1.55;
  const k = clamp01((t - 6) / 50);
  return (
    <AbsoluteFill>
      <Svg>
        <TopSea t={t} />
        <g transform={`translate(180 600) scale(${sc})`}>
          <CarrierTop num="68" />
          {/* parked jets at the front (bow) */}
          {[[760, -30], [820, 10], [880, -40], [940, 0], [700, 40]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y}) scale(0.36)`}><FighterTop folded /></g>)}
          {m === "1" && (
            <g opacity={ramp(t, 4, 12)}>
              <line x1={30} y1={30} x2={700} y2={30} stroke="#fff" strokeWidth={3} strokeDasharray="10 8" />
              <path d={`M200 30 A 170 170 0 0 0 ${30 + 170 * Math.cos(ANG * Math.PI / 180)} ${30 + 170 * Math.sin(ANG * Math.PI / 180)}`} stroke={YEL} strokeWidth={5} fill="none" />
              <g transform={`translate(30 30) rotate(${ANG})`}><rect x={0} y={-46} width={640} height={92} fill={YEL} opacity={0.18 + 0.1 * Math.sin(t * 0.3)} /></g>
            </g>
          )}
          {m === "2" && (
            <g>
              {/* ghost: a straight deck would send the jet into the parked planes */}
              <g opacity={ramp(t, 4, 10) * 0.8}>
                <line x1={20} y1={0} x2={760} y2={0} stroke={RED} strokeWidth={5} strokeDasharray="14 10" />
                <T3 x={420} y={-140} size={40} color={RED}>STRAIGHT DECK = CRASH ✕</T3>
              </g>
              <g transform={`translate(30 30) rotate(${ANG})`}>
                <line x1={0} y1={0} x2={1100} y2={0} stroke="#fff" strokeWidth={4} strokeDasharray="12 10" opacity={0.7} />
                <g transform={`translate(${k * 1100} 0) scale(0.42)`}><FighterTop /></g>
              </g>
            </g>
          )}
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the barricade
const Barricade: Tpl = ({ t, p }) => {
  const st = p.step ?? "1";
  const deck = 760;
  if (st === "1") {
    return (
      <AbsoluteFill>
        <Svg>
          <DaySky hz={deck} />
          <OpenSea t={t} y={deck} />
          <g transform={`translate(${700 + t * 2} ${400 + Math.sin(t * 0.2) * 10}) scale(1.8) rotate(-3)`}>
            <Fighter gear flame={0.4} />
            <path d="M-160 -36 L -190 -10" {...O(6)} /><path d="M-196 -6 l 8 14 m -4 -18 l 14 6" stroke={RED} strokeWidth={4} />
          </g>
          <g transform={`translate(${700 + t * 2 - 330} 470) scale(${pop(t, 8)})`}>
            <circle r={60} fill={RED} {...O(6)} opacity={0.6 + 0.4 * Math.sin(t * 0.8)} /><Txt x={0} y={22} s={70} c="#fff">!</Txt>
          </g>
          <T3 x={960} y={900} size={60} color={RED} o={ramp(t, 10, 18)}>HOOK DAMAGED</T3>
        </Svg>
      </AbsoluteFill>
    );
  }
  const up = ease(t / 18);
  const k = clamp01((t - 20) / 40);
  const x = 200 + Math.min(k * 1.4, 1) * 900;
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={deck} />
        <OpenSea t={t} y={deck + 80} />
        <rect x={0} y={deck} width={W} height={80} fill={DECK} {...O(6)} />
        {/* stanchions + net of vertical straps */}
        <g transform={`translate(1350 ${deck})`}>
          <rect x={-14} y={-360 * up} width={28} height={360 * up} fill="#7d8a96" {...O(5)} />
          <rect x={286} y={-360 * up} width={28} height={360 * up} fill="#7d8a96" {...O(5)} />
          <line x1={0} y1={-340 * up} x2={300} y2={-340 * up} {...O(6)} />
          {Array.from({ length: 12 }).map((_, i) => {
            const bulge = x > 1000 ? Math.min(120, (x - 1000) * 0.8) * Math.sin(((i + 0.5) / 12) * Math.PI) : 0;
            return <path key={i} d={`M${12 + i * 24} ${-340 * up} Q ${12 + i * 24 + bulge} ${-170 * up} ${12 + i * 24} 0`} stroke="#3a73b8" strokeWidth={8} fill="none" />;
          })}
        </g>
        <g transform={`translate(${x} ${deck - 6}) scale(1.5)`}><Fighter gear flame={0.3} /></g>
        <T3 x={1500} y={300} size={56} o={ramp(t, 4, 12)}>BARRICADE NET</T3>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== a busy flight deck (side view)
const FlightDeck: Tpl = ({ t }) => {
  const deck = 760;
  const colors = ["yellow", "green", "purple", "red", "blue", "brown", "white"];
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={deck} />
        <OpenSea t={t} y={deck + 80} />
        <rect x={0} y={deck} width={W} height={80} fill={DECK} {...O(6)} />
        {[[420, 1], [1000, 0], [1560, 1]].map(([x, f], i) => (
          <g key={i}>
            <g transform={`translate(${x + (i === 1 ? Math.sin(t * 0.05) * 30 : 0)} ${deck - 6}) scale(1.05)`}><Fighter gear flame={f ? 0.6 : 0} /></g>
            {f === 1 && Array.from({ length: 4 }).map((_, j) => <path key={j} d={`M${x - 230 - j * 30} ${deck - 60 + Math.sin(t * 0.8 + j) * 8} q -20 -10 -40 0 t -40 0`} stroke="#ffb03a" strokeWidth={5} fill="none" opacity={0.6} />)}
          </g>
        ))}
        <path d={`M1120 ${deck - 30} Q 1250 ${deck + 30} 1380 ${deck - 10}`} stroke="#8a5aa8" strokeWidth={14} fill="none" />
        {Array.from({ length: 12 }).map((_, i) => {
          const c = JERSEY[colors[i % 7]];
          const x = ((i * 173 + t * (i % 2 ? 2.2 : -1.8)) % (W + 100) + W + 100) % (W + 100) - 50;
          return <Crew key={i} x={x} y={deck + 4} c={c} s={1.4} t={t + i * 7} arm={i} />;
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the jerseys
const JOBS: Record<string, { cap: string; items: [string, string][] }> = {
  yellow: { cap: "CONTROL & MOVE AIRCRAFT", items: [["🙌", "PLANE DIRECTORS"], ["🚀", "CATAPULT OFFICERS"], ["🪝", "ARRESTING GEAR OFFICERS"]] },
  green: { cap: "LAUNCH, RECOVERY, MAINTENANCE", items: [["🚀", "CATAPULTS"], ["🪝", "ARRESTING GEAR"], ["🔧", "MAINTENANCE"]] },
  purple: { cap: "FUEL", items: [["⛽", "AIRCRAFT FUEL"], ["🍇", "\"GRAPES\""]] },
  red: { cap: "WEAPONS + CRASH & SALVAGE", items: [["🚀", "BOMBS & MISSILES"], ["🧯", "CRASH & SALVAGE"]] },
  blue: { cap: "HANDLING", items: [["⛓️", "CHAINS & CHOCKS"], ["🚜", "TRACTORS"], ["🛗", "ELEVATORS"]] },
  brown: { cap: "PLANE CAPTAINS", items: [["✈️", "ONE JET EACH"], ["✅", "READY TO FLY"]] },
  white: { cap: "SAFETY JOBS", items: [["📻", "LANDING SIGNAL OFFICERS"], ["🦺", "SAFETY OBSERVERS"], ["🔍", "INSPECTORS"], ["⛑️", "MEDICAL"]] },
};
const JerseyT: Tpl = ({ t, d, p, w }) => {
  const c = p.c ?? "yellow";
  const job = JOBS[c];
  const col = JERSEY[c];
  const n = job.items.length;
  const pose = c === "yellow" ? { ...IDLE, armL: [150, 10] as [number, number], armR: [100 + Math.sin(t * 0.3) * 30, 20] as [number, number] }
    : c === "blue" ? { ...POSES.hold } : c === "white" ? { ...POSES.hold } : { ...POSES.present };
  const prop: "clipboard" | "hammer" | "none" = c === "white" ? "clipboard" : c === "green" ? "hammer" : "none";
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill={col} />
        <rect width={W} height={H} fill="#fff" opacity={c === "white" ? 0 : 0.78} />
        {c === "white" && <rect width={W} height={H} fill="#dfe6ea" />}
        <circle cx={420} cy={620} r={330} fill={col} opacity={0.55} {...O(8)} />
        <Actor a="talk" t={t} x={420} y={1010} s={1.0} id={`j${c}`} outfit="jersey" w={w} over={{ jersey: col, pose, prop, face: FACES.confident, handR: c === "yellow" ? "open" : "mitt", handL: c === "yellow" ? "open" : "mitt" }} />
        {job.items.map(([icon, label], i) => {
          const at = 6 + i * Math.max(12, (d - 30) / n);
          const y = 260 + i * (n > 3 ? 170 : 210);
          return (
            <g key={i} transform={`translate(1220 ${y}) scale(${pop(t, at)})`}>
              <rect x={-420} y={-70} width={840} height={140} rx={30} fill="#f4f4f0" {...O(7)} />
              <rect x={-420} y={-70} width={150} height={140} rx={30} fill={col} {...O(7)} />
              <text x={-345} y={30} textAnchor="middle" fontSize={80}>{icon}</text>
              <Txt x={-240} y={20} s={label.length > 18 ? 46 : 56} a="start">{label}</Txt>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};
const Jerseys: Tpl = ({ t, p, w }) => {
  const m = p.mode ?? "show";
  const colors = ["yellow", "green", "purple", "red", "blue", "brown", "white"];
  if (m === "show") {
    const cur = Math.min(6, Math.floor(t / 10));
    return (
      <AbsoluteFill>
        <Svg>
          <rect width={W} height={H} fill="#f3f1ea" />
          <line x1={900} y1={240} x2={1840} y2={240} {...O(10)} />
          {colors.map((c, i) => (
            <g key={c} transform={`translate(${960 + i * 130} 250) rotate(${Math.sin(t * 0.1 + i) * 4})`} opacity={i === cur ? 0.25 : 1}>
              <path d="M-50 0 L 50 0 L 60 30 L 40 40 L 40 200 L -40 200 L -40 40 L -60 30 Z" fill={JERSEY[c]} {...O(5)} />
              <path d="M-10 -4 q 10 -20 20 0" {...O(4)} fill="none" />
            </g>
          ))}
          <Actor a="present" t={t} x={500} y={1000} s={1} id="show" w={w}
            over={{ pose: { ...POSES.cheer, armL: [150, 10], armR: [150, 10] }, face: FACES.happy }} />
          <g transform={`translate(500 ${110 + Math.sin(t * 0.3) * 6}) scale(0.8)`}>
            <path d="M-80 0 L 80 0 L 96 50 L 64 64 L 64 300 L -64 300 L -64 64 L -96 50 Z" fill={JERSEY[colors[cur]]} {...O(6)} />
          </g>
        </Svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Svg>
        <DaySky hz={800} />
        <rect x={0} y={800} width={W} height={280} fill={DECK} {...O(6)} />
        {colors.map((c, i) => (
          <Actor key={c} a="wave" t={t + i * 5} x={220 + i * 245} y={1000} s={0.55} id={`all${c}`} outfit="jersey"
            over={{ jersey: JERSEY[c], pose: { ...IDLE, armR: [150, -20 + Math.sin(t * 0.3 + i) * 20], hipY: Math.max(0, Math.sin(t * 0.25 + i)) * 10 }, handR: "open", face: FACES.happy }} />
        ))}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== the island and primary flight control
const Island: Tpl = ({ t, p, w }) => {
  const m = p.mode ?? "zoom";
  if (m === "zoom") {
    const z = 1 + ease((t - 4) / 50) * 1.6;
    return (
      <AbsoluteFill>
        <Svg>
          <g transform={`translate(1000 300) scale(${z}) translate(-1000 -300)`}>
            <DaySky hz={900} />
            <rect x={0} y={880} width={W} height={200} fill={DECK} {...O(6)} />
            <path d="M780 880 L 790 360 L 1220 360 L 1230 880 Z" fill="#8e99a4" {...O(8)} />
            <rect x={790} y={360} width={40} height={520} fill="#000" opacity={0.08} />
            <path d="M840 360 L 860 180 L 1150 180 L 1170 360 Z" fill="#8e99a4" {...O(7)} />
            <line x1={1000} y1={180} x2={1000} y2={40} {...O(8)} /><line x1={940} y1={90} x2={1060} y2={90} {...O(6)} />
            {/* primary flight control: the glassed room near the top, looking aft over the deck */}
            <rect x={850} y={250} width={300} height={80} rx={8} fill="#9fd3ee" {...O(6)} />
            <rect x={850} y={250} width={300} height={80} rx={8} fill="#ffd27a" opacity={0.25 + 0.15 * Math.sin(t * 0.3)} />
            {[0, 1, 2].map((i) => <rect key={i} x={820} y={420 + i * 130} width={370} height={60} fill="#20334f" {...O(4)} />)}
            <text x={1000} y={720} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={110} fill="#fff">68</text>
          </g>
          <g opacity={ramp(t, 30, 40)}><path d="M1420 290 L 1200 330" stroke={YEL} strokeWidth={8} /><T3 x={1560} y={300} size={50} color={YEL}>"PRI-FLY"</T3></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  // the Air Boss in Pri-Fly, looking down at the deck
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={W} height={H} fill="#cfd8df" />
        <rect x={80} y={80} width={1760} height={560} rx={10} fill="#9fd3ee" {...O(10)} />
        <rect x={80} y={440} width={1760} height={200} fill={DECK} />
        {[300, 800, 1400].map((x, i) => <g key={i} transform={`translate(${x + (i === 1 ? t * 3 : 0)} 560) scale(0.8)`}><Fighter gear flame={i === 1 ? 0.5 : 0} /></g>)}
        <g transform={`translate(${1500 - t * 2} 220) scale(0.45)`}><Fighter gear={false} /></g>
        {[420, 960, 1500].map((x) => <line key={x} x1={x} y1={80} x2={x} y2={640} stroke="#2a2f36" strokeWidth={14} />)}
        <rect x={0} y={680} width={W} height={400} fill="#3a424b" {...O(6)} />
        {[0, 1, 2, 3].map((i) => <g key={i}><rect x={1100 + i * 190} y={720} width={160} height={110} rx={8} fill="#0b1426" {...O(4)} /><path d={`M${1120 + i * 190} 790 q 30 -40 60 0 t 60 0`} stroke="#4dff7a" strokeWidth={4} fill="none" /></g>)}
        <Actor a="talk" t={t} x={600} y={1180} s={1.25} id="boss" outfit="jersey" w={w}
          over={{ jersey: JERSEY.yellow, prop: "phone", pose: { ...POSES.hold, armR: [120, 120] }, face: FACES.confident }} />
        <g transform={`translate(1100 560) scale(${pop(t, 8)})`}><rect x={-160} y={-44} width={320} height={88} rx={16} fill="#f4f4f0" {...O(6)} /><Txt x={0} y={16} s={46}>AIR BOSS</Txt></g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== launch / recovery cycles
const Cycle: Tpl = ({ t, p }) => {
  const m = p.mode ?? "1";
  if (m === "4") {
    return (
      <AbsoluteFill>
        <Svg>
          <TopSea t={t} />
          <g transform={`translate(960 560) scale(${1.1 - 0.25 * ease(t / 80)}) translate(-500 0)`}>
            <CarrierTop num="68" />
            <g transform={`translate(${700 + ((t * 8) % 400)} -10) scale(0.4)`}><FighterTop /></g>
          </g>
          {Array.from({ length: 6 }).map((_, i) => { const a = t * 0.02 + i * 1.05; return <g key={i} transform={`translate(${960 + Math.cos(a) * 720} ${540 + Math.sin(a) * 380}) rotate(${(a * 180) / Math.PI + 90}) scale(0.5)`}><FighterTop /></g>; })}
          <g transform={`translate(1640 160) scale(${pop(t, 10)})`}><rect x={-220} y={-60} width={440} height={120} rx={20} fill="#2f6fd0" {...O(7)} /><Txt x={0} y={20} s={52} c="#fff">✈ AIRPORT</Txt></g>
        </Svg>
      </AbsoluteFill>
    );
  }
  const hand = (t / 90) * Math.PI * 2;
  return (
    <AbsoluteFill>
      <Svg>
        <TopSea t={t} />
        <g transform="translate(1080 560) scale(1.05) translate(-500 0)">
          <CarrierTop num="68" />
          {/* launches off the bow, recoveries onto the angled deck */}
          {[0, 1, 2].map((i) => { const k = ((t * 1.2 + i * 40) % 120) / 120; return <g key={`l${i}`} transform={`translate(${700 + k * 700} ${-20 - k * 40}) scale(0.4)`} opacity={1 - k * 0.5}><FighterTop /></g>; })}
          <g transform={`translate(30 30) rotate(${ANG})`}>{[0, 1].map((i) => { const k = ((t * 1.1 + i * 60) % 120) / 120; return <g key={`r${i}`} transform={`translate(${-600 + k * 800} 0) scale(0.4)`}><FighterTop /></g>; })}</g>
        </g>
        <g transform="translate(300 300)">
          <circle r={190} fill="#f4f4f0" {...O(10)} />
          {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={Math.sin(i * 0.5236) * 150} y1={-Math.cos(i * 0.5236) * 150} x2={Math.sin(i * 0.5236) * 175} y2={-Math.cos(i * 0.5236) * 175} {...O(6)} />)}
          {m === "2" && <path d={`M0 0 L 0 -170 A 170 170 0 1 1 0 170 Z`} fill={YEL} opacity={0.4 * ramp(t, 4, 20)} />}
          <line x1={0} y1={0} x2={Math.sin(hand) * 120} y2={-Math.cos(hand) * 120} {...O(10)} />
          <circle r={14} fill={INK} />
        </g>
        {m === "2" && (
          <g transform="translate(300 620)">
            {Array.from({ length: 12 }).map((_, i) => <g key={i} transform={`translate(${-160 + (i % 6) * 64} ${Math.floor(i / 6) * 70}) scale(${0.28 * pop(t, 10 + i * 2)}) rotate(-90)`}><FighterTop /></g>)}
            <T3 x={0} y={200} size={60} color={YEL} s={pop(t, 36)}>12+</T3>
          </g>
        )}
        {m === "3" && (
          <g transform={`translate(1550 220) scale(${pop(t, 2)})`}>
            <rect x={-260} y={-110} width={520} height={220} rx={16} fill="#1d2025" {...O(7)} />
            {["MISSION A  1:15", "MISSION B  1:45", "MISSION C  ?:??"].map((s, i) => <text key={i} x={-230} y={-50 + i * 60} fontFamily="monospace" fontWeight={700} fontSize={38} fill={YEL} opacity={(Math.floor(t / 4) + i) % 3 === 0 ? 0.5 : 1}>{s}</text>)}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

export const TEMPLATES6B: Record<string, Tpl> = {
  meatball: Meatball, lso: Lso, wires: Wires, bolter: Bolter, angled: Angled, barricade: Barricade, flightdeck: FlightDeck,
  jersey: JerseyT, jerseys: Jerseys, island: Island, cycle: Cycle,
};
export { NAVY as NAVY6B };
