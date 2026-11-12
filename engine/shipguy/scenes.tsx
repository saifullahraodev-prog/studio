// The Ship Guy: first test scenes for "The Biggest Ship Ever Built" (Seawise Giant).
// Every scene is a function of the frame number only (no state), so any frame renders as a still.
import { loadFont } from "@remotion/google-fonts/Fredoka";
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Boom, Flames, H, INK, Jet, Missile, Sea, Sky, Smoke, Stickman, Tanker, TinyWorker, Towers, W, Waterline } from "./art";

export const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });

export const ease = Easing.bezier(0.33, 0, 0.2, 1);
export const ramp = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

/** Big outlined caption. Words wrapped in [brackets] turn yellow (numbers/emphasis). */
export const Caption: React.FC<{ text: string; y?: number; size?: number; pop?: number }> = ({ text, y = 860, size = 104, pop = 1 }) => {
  const parts = text.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", transform: `scale(${0.8 + 0.2 * pop})`, opacity: pop }}>
      <span style={{
        fontFamily, fontWeight: 700, fontSize: size, letterSpacing: 1, lineHeight: 1.05,
        WebkitTextStroke: `${size * 0.13}px ${INK}`, paintOrder: "stroke fill",
        textShadow: `0 ${size * 0.07}px 0 ${INK}`,
      }}>
        {parts.map((p, i) =>
          p.startsWith("[")
            ? <span key={i} style={{ color: "#ffd23f" }}>{p.slice(1, -1)}</span>
            : <span key={i} style={{ color: "#ffffff" }}>{p}</span>,
        )}
      </span>
    </div>
  );
};

/** Slow push-in on the whole frame so no shot is ever a dead still. */
export const Push: React.FC<{ t: number; from?: number; to?: number; ox?: string; children: React.ReactNode }> = ({ t, from = 1, to = 1.06, ox = "50% 50%", children }) => (
  <AbsoluteFill style={{ transform: `scale(${interpolate(t, [0, 330], [from, from + (to - from) * 2.2], { extrapolateRight: "clamp" })})`, transformOrigin: ox }}>
    {children}
  </AbsoluteFill>
);

export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

// ---------------------------------------------------------------- 1. hook: the attack (IMG 01/02)
export const Attack: React.FC<{ t: number }> = ({ t }) => {
  const shipX = 360, deckY = 640, sc = 1.2;
  const hitX = shipX + 610 * sc, hitY = deckY + 40;
  const fly = ramp(t, 0, 40); // missile flight
  const jetX = interpolate(t, [0, 150], [-160, 820]);
  const mx = interpolate(fly, [0, 1], [jetX + 120 - 40, hitX]);
  const my = interpolate(fly, [0, 1], [230, hitY]);
  const hit = t >= 40;
  const boom = ramp(t, 40, 52);
  const fire = ramp(t, 44, 90);
  return (
    <Push t={t} ox="60% 60%">
      <Svg>
        <Sky mood="dusk" horizon={600} />
        <Sea mood="dusk" horizon={600} t={t} />
        {hit && <Smoke x={hitX - 40} y={deckY - 20} t={t} size={0.9 + fire * 0.4} lean={-1} />}
        {hit && <Smoke x={shipX + 300 * sc} y={deckY - 20} t={t + 70} size={0.6 * fire + 0.01} lean={-1} />}
        <g transform={`translate(${shipX} ${deckY}) scale(${sc})`}><Tanker /></g>
        {hit && <Flames x={shipX + 470 * sc} y={deckY - 10} width={300 * fire + 10} height={110 * fire + 5} t={t} />}
        <Waterline x={shipX} y={deckY + 86} width={1015 * sc} mood="dusk" t={t} horizon={600} />
        {hit && <Flames x={hitX - 260 * fire} y={deckY + 96} width={520 * fire + 10} height={70 * fire + 5} t={t} seed={3} />}
        {!hit && <Missile x0={jetX + 60} y0={232} x1={mx} y1={my} bend={-40} />}
        {hit && <path d={`M${jetX - 120} 232 Q${(jetX + hitX) / 2} 120 ${hitX} ${hitY}`} fill="none" stroke="#fff" strokeOpacity={0.25 * (1 - fire)} strokeWidth={20} strokeLinecap="round" />}
        <g transform={`translate(${jetX} 230) scale(1.1)`}><Jet /></g>
        <g transform={`translate(${jetX - 230} 150) scale(0.8)`}><Jet /></g>
        {hit && <g opacity={1 - ramp(t, 62, 85)}><Boom x={hitX} y={hitY} r={180} p={boom} seed={2} /></g>}
      </Svg>
    </Push>
  );
};

// ---------------------------------------------------------------- 2. size: ship stood on end vs Petronas Towers
export const Upright: React.FC<{ t: number }> = ({ t }) => {
  const ground = 990;
  const shipLen = 860; // px for 458 m
  const sc = shipLen / 1012;
  const p = ramp(t, 8, 50);
  const towerH = (452 / 458) * shipLen;
  const shipX = 640;
  const count = Math.round(interpolate(ramp(t, 20, 70), [0, 1], [0, 458]));
  return (
    <Push t={t} from={1} to={1.04} ox="50% 100%">
      <Svg>
        <Sky mood="day" horizon={ground} />
        {/* far city */}
        <g fill="#9fbad3" opacity={0.7}>
          {[[90, 180], [190, 260], [300, 150], [1600, 220], [1700, 300], [1820, 170], [1040, 190], [1150, 140]].map(([x, h], i) => (
            <rect key={i} x={x} y={ground - h} width={90} height={h} />
          ))}
        </g>
        <rect x={0} y={ground} width={W} height={H - ground} fill="#7fae5a" />
        <line x1={0} y1={ground} x2={W} y2={ground} stroke={INK} strokeWidth={6} />
        <Towers x={1250} ground={ground} height={towerH} />
        <g transform={`translate(${shipX} ${ground}) rotate(${-90 * p}) scale(${sc}) translate(0 -130)`}>
          <Tanker />
        </g>
        {/* height rulers */}
        <g opacity={ramp(t, 50, 62)}>
          <line x1={700} y1={ground} x2={700} y2={ground - shipLen} stroke="#ffd23f" strokeWidth={6} strokeDasharray="18 12" />
          <line x1={680} y1={ground - shipLen} x2={720} y2={ground - shipLen} stroke="#ffd23f" strokeWidth={6} />
          <line x1={1440} y1={ground} x2={1440} y2={ground - towerH} stroke="#ffffff" strokeWidth={6} strokeDasharray="18 12" />
          <line x1={1420} y1={ground - towerH} x2={1460} y2={ground - towerH} stroke="#ffffff" strokeWidth={6} />
        </g>
      </Svg>
      <Caption text={`[${count} m]`} y={430} size={120} pop={ramp(t, 20, 30)} />
      <div style={{ position: "absolute", left: 1480, top: 1080 - 90 - towerH + 40, opacity: ramp(t, 55, 66) }}>
        <Label text="Petronas Towers" sub="452 m" />
      </div>
      <div style={{ position: "absolute", left: 90, top: 150, opacity: ramp(t, 55, 66) }}>
        <Label text="Seawise Giant" sub="(on its end)" small />
      </div>
    </Push>
  );
};

export const Label: React.FC<{ text: string; sub: string; yellow?: boolean; small?: boolean }> = ({ text, sub, yellow, small }) => (
  <div style={{ fontFamily, fontWeight: 700, color: "#fff", WebkitTextStroke: `7px ${INK}`, paintOrder: "stroke fill", lineHeight: 1.05 }}>
    <div style={{ fontSize: 46 }}>{text}</div>
    <div style={{ fontSize: small ? 36 : 60, color: yellow ? "#ffd23f" : "#fff" }}>{sub}</div>
  </div>
);

// ---------------------------------------------------------------- 3. shipyard: hull 1016 (IMG 03)
export const Shipyard: React.FC<{ t: number; close?: boolean }> = ({ t, close }) => {
  const sc = 3.2;
  const deckY = 380;
  const floor = deckY + 130 * sc + 60;
  return (
    <Push t={t} from={close ? 1.9 : 1.04} to={close ? 2.05 : 1} ox={close ? "86% 46%" : "30% 80%"}>
      <Svg>
        <Sky mood="day" horizon={floor} />
        {/* gantry crane spanning the dock */}
        <g>
          <rect x={60} y={90} width={70} height={floor - 90} fill="#d94a3a" stroke={INK} strokeWidth={6} />
          <rect x={1790} y={90} width={70} height={floor - 90} fill="#d94a3a" stroke={INK} strokeWidth={6} />
          <rect x={40} y={60} width={1840} height={70} fill="#e8b830" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 22 }).map((_, i) => (
            <line key={i} x1={60 + i * 84} y1={64} x2={102 + i * 84} y2={126} stroke={INK} strokeWidth={4} />
          ))}
          <rect x={interpolate(t, [0, 150], [900, 1040])} y={130} width={90} height={60} fill="#e8b830" stroke={INK} strokeWidth={5} />
          <line x1={interpolate(t, [0, 150], [945, 1085])} y1={190} x2={interpolate(t, [0, 150], [945, 1085])} y2={330} stroke={INK} strokeWidth={4} />
        </g>
        {/* dock floor + walls */}
        <rect x={0} y={floor} width={W} height={H - floor} fill="#9a9a94" />
        <line x1={0} y1={floor} x2={W} y2={floor} stroke={INK} strokeWidth={6} />
        {[200, 520, 840, 1160, 1480].map((x) => (
          <rect key={x} x={x} y={floor - 60} width={90} height={60} fill="#7b6a58" stroke={INK} strokeWidth={5} />
        ))}
        {/* the hull: only part of it fits */}
        <g transform={`translate(${-1400} ${deckY}) scale(${sc})`}>
          <Tanker />
        </g>
        <text x={1640} y={deckY + 150} fontFamily={fontFamily} fontWeight={700} fontSize={72} fill="#ffffff" textAnchor="end" opacity={0.9}>1016</text>
        {/* scaffolding with tiny workers: the scale cue */}
        {[300, 700, 1100].map((x, j) => (
          <g key={x}>
            <g stroke={INK} strokeWidth={4}>
              <line x1={x} y1={floor - 60} x2={x} y2={deckY + 40} />
              <line x1={x + 60} y1={floor - 60} x2={x + 60} y2={deckY + 40} />
              {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={x} y1={deckY + 60 + k * 80} x2={x + 60} y2={deckY + 60 + k * 80} />)}
            </g>
            <TinyWorker x={x + 30} y={deckY + 60 + ((j * 2 + 1) % 5) * 80} s={0.9} wave={j === 1} />
          </g>
        ))}
        <TinyWorker x={900} y={deckY - 30} s={0.8} />
        <TinyWorker x={1300} y={deckY - 30} s={0.8} wave />
        <TinyWorker x={460} y={floor + 70} s={1.1} />
        <TinyWorker x={1020} y={floor + 90} s={1.1} />
        {/* truck for scale */}
        <g transform={`translate(${interpolate(t, [0, 150], [560, 700])} ${floor + 110})`} stroke={INK} strokeWidth={4}>
          <rect x={0} y={-50} width={110} height={42} fill="#3d8bd6" />
          <rect x={110} y={-40} width={36} height={32} fill="#f2f2f2" />
          <circle cx={26} cy={-6} r={10} fill={INK} /><circle cx={124} cy={-6} r={10} fill={INK} />
        </g>
      </Svg>
      <Stickman pose="shocked-2" x={1460} y={1060} height={230} bob={Math.sin(t * 0.25) * 3} />
    </Push>
  );
};

// ---------------------------------------------------------------- 4. stopping distance on a city map
export const Stopping: React.FC<{ t: number }> = ({ t }) => {
  const x0 = 180, x1 = 1680, y = 560;
  const p = ramp(t, 10, 100);
  const xe = x0 + (x1 - x0) * p;
  const km = (9 * p).toFixed(1);
  const shipPx = (458 / 9000) * (x1 - x0);
  // deterministic city blocks
  const blocks: React.ReactNode[] = [];
  for (let gx = 0; gx < 16; gx++) {
    for (let gy = 0; gy < 9; gy++) {
      const h = Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453;
      const r = h - Math.floor(h);
      if (gy === 4) continue; // the "road" the line runs along
      const fill = r < 0.12 ? "#8cc06b" : r < 0.2 ? "#6fb1e0" : "#e9dfc9";
      blocks.push(<rect key={`${gx}-${gy}`} x={gx * 124 + 8} y={gy * 124 + 18} width={108} height={108} rx={10} fill={fill} stroke="#c9bda4" strokeWidth={3} />);
    }
  }
  return (
    <Push t={t} from={1} to={1.03}>
      <Svg>
        <rect x={0} y={0} width={W} height={H} fill="#d8ccb2" />
        {blocks}
        {/* river */}
        <path d="M0 960 C 400 900, 700 1040, 1100 980 S 1700 900, 1920 960 L1920 1080 L0 1080 Z" fill="#6fb1e0" stroke="#4d8fbf" strokeWidth={4} />
        {/* distance line */}
        <line x1={x0} y1={y} x2={xe} y2={y} stroke={INK} strokeWidth={26} strokeLinecap="round" />
        <line x1={x0} y1={y} x2={xe} y2={y} stroke="#ffd23f" strokeWidth={14} strokeLinecap="round" />
        {Array.from({ length: 10 }).map((_, i) => {
          const tx = x0 + ((x1 - x0) * i) / 9;
          return tx <= xe + 1 ? (
            <g key={i}>
              <line x1={tx} y1={y - 30} x2={tx} y2={y + 30} stroke={INK} strokeWidth={6} />
              <text x={tx} y={y + 74} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={36} fill={INK}>{i}</text>
            </g>
          ) : null;
        })}
        {/* the ship, to scale, at the start */}
        <g transform={`translate(${x0 - shipPx / 2} ${y - 70})`}>
          <path d={`M0 -9 L${shipPx * 0.85} -9 Q${shipPx} 0 ${shipPx * 0.85} 9 L0 9 Z`} fill="#b8322a" stroke={INK} strokeWidth={4} />
          <rect x={2} y={-7} width={shipPx * 0.15} height={14} fill="#f4f1e8" />
        </g>
        <text x={x0} y={y - 100} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={30} fill={INK}>the ship (to scale)</text>
        {/* end marker */}
        <g transform={`translate(${xe} ${y})`} opacity={p > 0.02 ? 1 : 0}>
          <circle r={26} fill="#ff5a3c" stroke={INK} strokeWidth={6} />
        </g>
      </Svg>
      <Caption text={`[${km} km] to stop`} y={170} size={120} pop={ramp(t, 4, 14)} />
      <Stickman pose="scared" x={1540} y={1050} height={300} />
    </Push>
  );
};

export const SCENES = { attack: Attack, upright: Upright, shipyard: Shipyard, stopping: Stopping } as const;
export type SceneId = keyof typeof SCENES;

export const ShipGuyScene: React.FC<{ scene: SceneId }> = ({ scene }) => {
  const t = useCurrentFrame();
  const S = SCENES[scene] ?? Attack;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <S t={t} />
    </AbsoluteFill>
  );
};
