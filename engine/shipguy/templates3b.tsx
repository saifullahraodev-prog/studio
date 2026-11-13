// The Ship Guy: Ever Given graphics templates (maps, money, dials, diagrams). See templates3.tsx.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, Tanker, W, H } from "./art";
import { FACES, Guy, IDLE, breathe } from "./guy";
import { fontFamily, ramp, Svg } from "./scenes";
import type { Tpl } from "./templates";
import { Actor, BOX, EGSide, EGTop, GREEN, SAND, T3, WATER, clamp01, pop } from "./templates3";

const NAVY = "#1f3a5f", SEA = "#7ec0de", LAND = "#efe0b6", YEL = "#ffd23f", RED = "#e8352b";
const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };

const Rays: React.FC<{ t: number; color?: string; o?: number }> = ({ t, color = "#fff", o = 0.1 }) => (
  <g transform={`translate(${W / 2} ${H / 2}) rotate(${t * 0.12})`} opacity={o}>
    {Array.from({ length: 16 }).map((_, i) => <path key={i} d="M0 0 L1400 -140 L1400 140 Z" fill={color} transform={`rotate(${i * 22.5})`} />)}
  </g>
);
const Card: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; children?: React.ReactNode }> = ({ x, y, w, h, fill = "#fff", children }) => (
  <g transform={`translate(${x} ${y})`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={24} fill={fill} stroke={INK} strokeWidth={8} />{children}</g>
);
const Num: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; color?: string; anchor?: "start" | "middle" | "end" }> = ({ x, y, size, children, color = INK, anchor = "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={fontFamily} fontWeight={700} fontSize={size} fill={color}>{children}</text>
);

// ================================================================== MAP
type LL = [number, number];
const proj = ([lon, lat]: LL): [number, number] => [150 + (lon + 22) * 12.3, 40 + (70 - lat) * 9.6];
const poly = (pts: LL[]) => pts.map((q) => proj(q).join(",")).join(" ");
const AFRICA: LL[] = [[35.5, 24], [34, 27], [33.5, 28], [32.5, 29.9], [32.3, 31.2], [31, 31.5], [30, 31.3], [25, 31.7], [20, 30.5], [15, 32], [11, 33.5], [10, 37], [3, 36.8], [0, 35.8], [-6, 35.8], [-10, 30], [-17, 21], [-17, 15], [-15, 11], [-8, 4.5], [0, 5.5], [8, 4.5], [9.5, 3], [9, -1], [12, -5], [13, -12], [12, -17], [15, -27], [18, -34.5], [20, -35], [26, -34], [31, -29.5], [35, -24], [40.5, -15], [40, -10.5], [39.5, -5], [41.5, -1.5], [46, 2], [51, 11.5], [48, 11.3], [44, 10.5], [43, 12], [39.5, 15.5], [37, 21]];
const EURASIA: LL[] = [[8, 75], [5, 62], [5, 58.5], [8, 57.6], [10, 57.7], [10.5, 56], [8.5, 55.3], [8.6, 53.6], [7, 53.4], [4.8, 52.9], [4, 51.6], [2.5, 51.1], [1.6, 50.8], [-1.5, 49.7], [-4.6, 48.4], [-1.4, 46.3], [-1.6, 43.5], [-8, 43.7], [-9.3, 43], [-9, 37], [-6, 36.2], [-2, 36.7], [3, 42.5], [8, 44], [12, 44], [16, 40], [18, 40], [20, 39], [23, 36.5], [26, 38], [27, 37], [30, 36.3], [36, 36.5], [35.5, 34], [34.5, 31.5], [34, 31], [33, 31.1], [32.5, 31.1], [32.6, 29.9], [33.5, 28.5], [34.3, 27.8], [34.5, 28.5], [35, 29.5], [35.2, 28], [36.5, 26], [38, 24], [39, 21.5], [41, 17], [43, 13], [45, 12.8], [49, 14], [52, 16], [55, 17.5], [57, 18.8], [59.5, 22.5], [56.5, 24.5], [56, 26.2], [54, 24], [51.5, 24.5], [50.5, 26], [48.5, 28.5], [48, 30], [50, 30], [52, 27.5], [56.5, 27], [58, 25.6], [61.5, 25.2], [66.5, 25.3], [68.5, 23.5], [70, 22.5], [72.8, 21], [73, 17], [74.5, 14], [76.5, 9], [77.5, 8], [78.5, 9], [80, 13], [80.3, 15.5], [83, 17.5], [86.5, 20], [88, 22], [90, 22], [91.8, 22.3], [92.5, 20.5], [94, 18], [94.5, 16], [97.5, 16.5], [98.3, 13], [98.5, 10], [98.3, 8], [100.3, 5.5], [101, 3], [103.4, 1.3], [104.2, 1.5], [103.4, 4], [103, 6], [102, 6.5], [100.5, 8], [100, 12.5], [101, 13], [103, 11], [105, 8.6], [106.6, 10.4], [109, 12], [109.3, 15], [107, 17], [106.5, 20.5], [110, 21], [125, 21], [125, 75]];
const ISLANDS: LL[][] = [
  [[-5, 50], [1.5, 51], [0, 53.5], [-3, 56], [-5, 58.5], [-6, 56], [-3, 54], [-5, 52]],
  [[95, 5.5], [98, 4], [104, -2], [106, -6], [102, -4], [97, 2]],
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
  [[80, 9.8], [81.8, 7.5], [81, 6], [79.8, 6.5]],
];
const ROUTE_SUEZ: LL[] = [[103.5, 1.2], [101, 3], [98, 6], [95, 6.2], [88, 5.5], [80, 5.5], [73, 10], [60, 13], [51, 12.5], [45, 12], [43, 13], [41, 16], [37, 21], [34, 27], [32.6, 29.8], [32.4, 31.3], [28, 33.5], [20, 35], [12, 37.5], [4, 37.5], [-6, 36], [-10, 38], [-10, 43], [-5, 48], [1, 50.5], [4.2, 51.9]];
const ROUTE_CAPE: LL[] = [[103.5, 1.2], [101, 3], [98, 6], [95, 6.2], [80, 4], [60, -8], [45, -28], [32, -36.5], [18, -37.5], [10, -28], [5, -12], [-8, 0], [-20, 14], [-19, 28], [-13, 40], [-9, 46], [-4, 49], [1, 50.5], [4.2, 51.9]];
const TURNBACK: LL[] = [[43, 12.5], [47, 9], [52, 5], [48, -5], [45, -25], [32, -36.5], [18, -37.5], [10, -28], [5, -12], [-8, 0], [-20, 14], [-19, 28], [-13, 40], [-9, 46], [-4, 49], [1, 50.5]];
const SUEZ_TO_RTM = ROUTE_SUEZ.slice(14);

const along = (pts: [number, number][], k: number): [number, number] => {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const tot = seg.reduce((a, b) => a + b, 0);
  let r = clamp01(k) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (r <= seg[i]) { const f = r / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; }
    r -= seg[i];
  }
  return pts[pts.length - 1];
};
const Route: React.FC<{ pts: LL[]; k: number; color?: string; dash?: boolean; ship?: boolean }> = ({ pts, k, color = RED, dash, ship = true }) => {
  const xy = pts.map(proj);
  const n = Math.max(2, Math.ceil(xy.length * clamp01(k)) + 1);
  const head = along(xy, k);
  const shown = xy.slice(0, Math.min(xy.length, n - 1));
  const d = [...shown, head].map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ");
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={14} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} stroke={color} strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash ? "18 14" : undefined} />
      {ship && k > 0 && <circle cx={head[0]} cy={head[1]} r={13} fill={GREEN} stroke={INK} strokeWidth={5} />}
    </g>
  );
};
const Dot: React.FC<{ ll: LL; label: string; dx?: number; dy?: number }> = ({ ll, label, dx = 0, dy = -24 }) => {
  const [x, y] = proj(ll);
  return <g><circle cx={x} cy={y} r={11} fill="#fff" stroke={INK} strokeWidth={5} /><T3 x={x + dx} y={y + dy} size={38}>{label}</T3></g>;
};
const World: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <rect width={W} height={H} fill={SEA} />
    {[EURASIA, AFRICA, ...ISLANDS].map((pp, i) => <polygon key={i} points={poly(pp)} fill={LAND} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
    {children}
  </g>
);

// Suez close-up map (screen coords)
const SuezMap: React.FC<{ t: number; canalK?: number; children?: React.ReactNode }> = ({ t, canalK = 1, children }) => {
  const cp = [[960, 300], [965, 420], [975, 520], [990, 600], [1000, 690], [1010, 780], [1020, 860]] as [number, number][];
  const n = Math.max(2, Math.round(cp.length * canalK));
  return (
    <g>
      <rect width={W} height={H} fill={SEA} />
      <path d="M0 300 Q 480 280 960 300 Q 1400 290 1920 330 V 1080 H 1300 Q 1180 980 1080 900 L 1030 870 L 1020 860 L 1000 870 Q 900 980 800 1080 H 0 Z" fill={LAND} stroke={INK} strokeWidth={6} />
      <path d="M1020 860 L 1060 880 Q 1200 980 1300 1080 L 820 1080 Q 920 980 1000 880 Z" fill={SEA} />
      <path d={cp.slice(0, n).map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ")} stroke={WATER} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={cp.slice(0, n).map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ")} stroke={INK} strokeWidth={4} fill="none" strokeDasharray="2 30" />
      {canalK > 0.6 && <ellipse cx={995} cy={650} rx={70} ry={40} fill={WATER} stroke={INK} strokeWidth={4} />}
      {canalK > 0.4 && <ellipse cx={975} cy={520} rx={26} ry={16} fill={WATER} stroke={INK} strokeWidth={3} />}
      <T3 x={960} y={230} size={56} color="#fff">MEDITERRANEAN</T3>
      <T3 x={1150} y={1040} size={48} color="#fff">RED SEA ↓</T3>
      <T3 x={560} y={640} size={64} color="#c8a96a">EGYPT</T3>
      <T3 x={1450} y={600} size={64} color="#c8a96a">SINAI</T3>
      <g><circle cx={960} cy={300} r={10} fill="#fff" stroke={INK} strokeWidth={4} /><T3 x={830} y={360} size={36}>PORT SAID</T3></g>
      <g><circle cx={1020} cy={860} r={10} fill="#fff" stroke={INK} strokeWidth={4} /><T3 x={1130} y={850} size={36}>SUEZ</T3></g>
      {children}
    </g>
  );
};
const ShipDots: React.FC<{ n: number; cx: number; cy: number; dir: 1 | -1; t: number }> = ({ n, cx, cy, dir, t }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const r = Math.sqrt(i) * 22, a = (i * 2.399) % (Math.PI);
      const x = cx + Math.cos(a) * r * 1.6, y = cy + dir * Math.sin(a) * r * 0.9;
      return <rect key={i} x={x - 9} y={y - 5} width={18} height={10} rx={3} fill={BOX[i % BOX.length]} stroke={INK} strokeWidth={2} transform={`rotate(${(rnd(i) - 0.5) * 50} ${x} ${y}) translate(0 ${Math.sin(t * 0.1 + i) * 1.5})`} />;
    })}
  </g>
);

export const MapT: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "voyage";
  if (m === "queue") {
    const total = p.count === "1" ? (t < d * 0.55 ? 369 * ramp(t, 4, d * 0.5) : 369 + 50 * ramp(t, d * 0.6, d - 4)) : p.grow === "1" ? 40 + 200 * ramp(t, 0, d) : 30 + 120 * ramp(t, 0, d);
    const nShips = Math.round(Math.min(260, total * 0.6));
    return (
      <AbsoluteFill><Svg>
        <SuezMap t={t}>
          <ShipDots n={Math.round(nShips * 0.55)} cx={960} cy={300} dir={-1} t={t} />
          <ShipDots n={Math.round(nShips * 0.45)} cx={1030} cy={950} dir={1} t={t} />
          <g transform="translate(1012 820)"><path d="M-22 -22 L22 22 M22 -22 L-22 22" stroke={INK} strokeWidth={18} strokeLinecap="round" /><path d="M-22 -22 L22 22 M22 -22 L-22 22" stroke={RED} strokeWidth={10} strokeLinecap="round" /></g>
          {p.count === "1" && <Card x={1560} y={300} w={420} h={170}><Num x={0} y={40} size={110} color={RED}>{total >= 400 ? "400+" : Math.round(total).toString()}</Num><Num x={0} y={-50} size={30}>SHIPS WAITING</Num></Card>}
        </SuezMap>
      </Svg></AbsoluteFill>
    );
  }
  if (m === "suez") {
    return <AbsoluteFill><Svg><SuezMap t={t} canalK={ramp(t, 6, d * 0.6)}>
      <g opacity={ramp(t, d * 0.55, d * 0.7)}><Card x={1500} y={300} w={300} h={140}><Num x={0} y={30} size={90} color={NAVY}>1869</Num></Card></g>
    </SuezMap></Svg></AbsoluteFill>;
  }
  if (m === "suezzoom") {
    const k = ramp(t, 6, d - 6);
    const [sx, sy] = proj([32.5, 30]);
    const z = 1 + k * 2.4;
    return (
      <AbsoluteFill><Svg>
        <g transform={`translate(${W / 2} ${H / 2 + 60}) scale(${z}) translate(${-sx} ${-sy})`}>
          <World><Route pts={ROUTE_SUEZ} k={1} ship={false} /></World>
          <circle cx={sx} cy={sy} r={30 / z + 6} fill="none" stroke={YEL} strokeWidth={8 / z + 1} />
        </g>
        <T3 x={W / 2} y={980} size={70} color={YEL} o={ramp(t, d * 0.5, d * 0.6)}>THE SUEZ CANAL</T3>
      </Svg></AbsoluteFill>
    );
  }
  const k = ramp(t, 4, d - 8);
  return (
    <AbsoluteFill><Svg>
      <World>
        {m === "voyage" && <><Route pts={ROUTE_SUEZ} k={k} /><Dot ll={[103.5, 1.2]} label="MALAYSIA" dy={50} /><Dot ll={[4.2, 51.9]} label="ROTTERDAM" dx={60} /></>}
        {m === "cape" && (
          <>
            <Route pts={ROUTE_SUEZ} k={ramp(t, 4, d * 0.5)} color={GREEN} />
            <Route pts={ROUTE_CAPE} k={ramp(t, 4, d - 4)} color={RED} dash />
            <Dot ll={[18.5, -34.4]} label="CAPE OF GOOD HOPE" dy={60} />
            <g opacity={ramp(t, d * 0.4, d * 0.5)}><Card x={1440} y={860} w={560} h={150} fill="#fff"><Num x={0} y={-10} size={44} color={RED}>AROUND AFRICA:</Num><Num x={0} y={46} size={44}>+ up to 2 weeks</Num></Card></g>
          </>
        )}
        {m === "turnback" && Array.from({ length: 5 }).map((_, i) => <Route key={i} pts={TURNBACK} k={ramp(t, 4 + i * 10, d - 4 + i * 10) * 0.95} color={RED} dash ship />)}
        {m === "turnback" && <ShipDotsLL t={t} />}
        {m === "rotterdam" && (
          <>
            <Route pts={SUEZ_TO_RTM} k={k} /><Dot ll={[4.2, 51.9]} label="ROTTERDAM" dx={60} />
            <Card x={1500} y={760} w={380} h={300}>
              <rect x={-190} y={-150} width={380} height={80} rx={20} fill={RED} stroke={INK} strokeWidth={8} />
              <Num x={0} y={-92} size={46} color="#fff">2021</Num>
              <Num x={0} y={50} size={110}>{["MAR", "APR", "MAY", "JUN", "JUL"][Math.min(4, Math.floor(k * 4.99))]}</Num>
            </Card>
          </>
        )}
      </World>
    </Svg></AbsoluteFill>
  );
};
const ShipDotsLL: React.FC<{ t: number }> = ({ t }) => {
  const [x, y] = proj([43, 12.5]);
  return <ShipDots n={24} cx={x} cy={y} dir={1} t={t} />;
};

// ================================================================== MONEY
const Bill: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}><rect x={-70} y={-34} width={140} height={68} rx={6} fill="#7cc576" stroke={INK} strokeWidth={4} /><circle r={18} fill="#5aa955" stroke={INK} strokeWidth={3} /><Num x={0} y={9} size={26}>$</Num></g>
);
export const MoneyT: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "day";
  if (m === "day") {
    const v = 9.6 * ramp(t, 4, Math.min(d - 4, 50));
    return (
      <AbsoluteFill style={{ background: NAVY }}><Svg>
        <Rays t={t} />
        {Array.from({ length: Math.round(28 * ramp(t, 0, Math.min(d, 60))) }).map((_, i) => <Bill key={i} x={260 + (i % 7) * 40 + (i % 2) * 10} y={980 - Math.floor(i / 7) * 34} r={(rnd(i) - 0.5) * 10} />)}
        {Array.from({ length: Math.round(28 * ramp(t, 0, Math.min(d, 60))) }).map((_, i) => <Bill key={`b${i}`} x={1420 + (i % 7) * 40} y={980 - Math.floor(i / 7) * 34} r={(rnd(i + 50) - 0.5) * 10} />)}
        <T3 x={960} y={560} size={220} color={YEL} s={0.9 + 0.1 * ramp(t, 0, 10)}>${v.toFixed(1)} BILLION</T3>
        <T3 x={960} y={700} size={90}>EVERY DAY</T3>
      </Svg></AbsoluteFill>
    );
  }
  if (m === "split") {
    const a = ramp(t, 4, 30), b = ramp(t, d * 0.35, d * 0.35 + 26), c = ramp(t, d * 0.75, d * 0.75 + 12);
    return (
      <AbsoluteFill style={{ background: NAVY }}><Svg>
        <Rays t={t} />
        <g transform={`translate(${960 - a * 420} 420)`} opacity={a}><path d="M200 -50 H -120 V -100 L -260 0 L -120 100 V 50 H 200 Z" fill={RED} stroke={INK} strokeWidth={8} /><Num x={40} y={18} size={64} color="#fff">$5.1B</Num><T3 x={0} y={-130} size={46}>GOING WEST</T3></g>
        <g transform={`translate(${960 + b * 420} 680)`} opacity={b}><path d="M-200 -50 H 120 V -100 L 260 0 L 120 100 V 50 H -200 Z" fill="#3a73b8" stroke={INK} strokeWidth={8} /><Num x={-40} y={18} size={64} color="#fff">$4.5B</Num><T3 x={0} y={160} size={46}>GOING EAST</T3></g>
        <g transform="translate(960 560)"><rect x={-40} y={-260} width={80} height={520} fill={WATER} stroke={INK} strokeWidth={6} /><T3 x={0} y={0} size={34} rot={-90}>SUEZ</T3></g>
        <g opacity={c}><Card x={960} y={930} w={760} h={140} fill={YEL}><Num x={0} y={26} size={80}>= $9.6B A DAY</Num></Card></g>
      </Svg></AbsoluteFill>
    );
  }
  if (m === "pct") {
    const k = ramp(t, 6, 40) * 0.12;
    const a = k * Math.PI * 2;
    return (
      <AbsoluteFill style={{ background: NAVY }}><Svg>
        <Rays t={t} />
        <g transform="translate(700 600)">
          <circle r={300} fill="#3a73b8" stroke={INK} strokeWidth={10} />
          <path d={`M0 0 L0 -300 A300 300 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * 300} ${-Math.cos(a) * 300} Z`} fill={YEL} stroke={INK} strokeWidth={8} />
          <circle r={120} fill={NAVY} stroke={INK} strokeWidth={8} />
          {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-18 + Math.cos(i * 0.63 + t * 0.02) * 210} y={-10 + Math.sin(i * 0.63 + t * 0.02) * 210} width={36} height={20} fill={BOX[i % BOX.length]} stroke={INK} strokeWidth={3} />)}
        </g>
        <T3 x={1350} y={560} size={200} color={YEL}>~{Math.round(k * 100)}%</T3>
        <T3 x={1350} y={680} size={60}>OF SEA TRADE</T3>
        <T3 x={1350} y={750} size={40} color="#bcd">(estimates)</T3>
      </Svg></AbsoluteFill>
    );
  }
  // invoice
  const step = Number(p.step ?? 1);
  const v1 = step === 1 ? 916 * ramp(t, 10, Math.min(d - 6, 70)) : 916;
  return (
    <AbsoluteFill style={{ background: "#c9d3dc" }}><Svg>
      <g transform={`translate(760 ${620 + (step === 1 ? (1 - ramp(t, 0, 14)) * 700 : 0)}) rotate(-3) scale(0.9)`}>
        <rect x={-380} y={-440} width={760} height={880} fill="#fbfaf4" stroke={INK} strokeWidth={8} />
        <rect x={-380} y={-440} width={760} height={120} fill={NAVY} />
        <Num x={0} y={-366} size={46} color="#fff">SUEZ CANAL AUTHORITY</Num>
        <Num x={-330} y={-250} size={64} anchor="start">INVOICE</Num>
        {["Salvage work", "Lost canal fees", "Reputation damage"].map((s, i) => (
          <g key={s} opacity={step === 1 ? ramp(t, 14 + i * 12, 22 + i * 12) : 1}><Num x={-330} y={-150 + i * 80} size={42} anchor="start">{s}</Num><line x1={-330} y1={-130 + i * 80} x2={330} y2={-130 + i * 80} stroke="#ccc" strokeWidth={3} /></g>
        ))}
        <Num x={-330} y={170} size={50} anchor="start">TOTAL</Num>
        <Num x={330} y={260} size={100} anchor="end" color={RED}>${Math.round(v1)},000,000</Num>
        {step >= 2 && <line x1={-40} y1={230} x2={340} y2={230} stroke={INK} strokeWidth={12} opacity={ramp(t, 8, 14)} />}
        {step >= 2 && <Num x={330} y={380} size={100} anchor="end" color={NAVY}><tspan opacity={ramp(t, 16, 24)}>${Math.round(916 - 366 * ramp(t, 16, 50))},000,000</tspan></Num>}
        {step === 3 && (
          <g transform={`translate(0 120) rotate(-14) scale(${1 + (1 - ramp(t, 6, 12)) * 1.5})`} opacity={ramp(t, 6, 10)}>
            <rect x={-330} y={-80} width={660} height={160} rx={16} fill="none" stroke={RED} strokeWidth={14} />
            <Num x={0} y={30} size={84} color={RED}>AMOUNT: SECRET</Num>
          </g>
        )}
      </g>
      {step === 3 && (
        <g transform={`translate(1450 500) scale(${pop(t, 20)})`}>
          <Card x={0} y={0} w={480} h={300}>
            <Num x={0} y={-60} size={56}>7 JULY 2021</Num>
            <Num x={0} y={20} size={56} color={GREEN}>DEAL ✓</Num>
            <Num x={0} y={100} size={44}>+ 1 new tugboat</Num>
          </Card>
        </g>
      )}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== DIAL
const Gauge: React.FC<{ v: number; max: number; red?: number; unit: string; label: string; x?: number; y?: number }> = ({ v, max, red, unit, label, x = 760, y = 700 }) => {
  const ang = (q: number) => Math.PI + (q / max) * Math.PI;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-420 0 A 420 420 0 0 1 420 0 Z" fill="#fbfaf4" stroke={INK} strokeWidth={10} />
      {red !== undefined && <path d={`M${Math.cos(ang(red)) * 400} ${Math.sin(ang(red)) * 400} A 400 400 0 0 1 400 0 L 330 0 A 330 330 0 0 0 ${Math.cos(ang(red)) * 330} ${Math.sin(ang(red)) * 330} Z`} fill="#f2a29d" />}
      {Array.from({ length: 11 }).map((_, i) => {
        const q = (i / 10) * max, a = ang(q);
        return <g key={i}><line x1={Math.cos(a) * 340} y1={Math.sin(a) * 340} x2={Math.cos(a) * 400} y2={Math.sin(a) * 400} stroke={INK} strokeWidth={8} /><Num x={Math.cos(a) * 280} y={Math.sin(a) * 280 + 16} size={40}>{Math.round(q)}</Num></g>;
      })}
      <line x1={0} y1={0} x2={Math.cos(ang(v)) * 360} y2={Math.sin(ang(v)) * 360} stroke={RED} strokeWidth={18} strokeLinecap="round" />
      <circle r={34} fill={INK} />
      <Num x={0} y={-120} size={110} color={INK}>{v.toFixed(v < 10 ? 1 : 0)}</Num>
      <Num x={0} y={-60} size={40}>{unit}</Num>
      <T3 x={0} y={110} size={60}>{label}</T3>
    </g>
  );
};
export const DialT: Tpl = ({ t, d, p }) => {
  const m = p.mode ?? "speed";
  const bg = <><rect width={W} height={H} fill={NAVY} /><Rays t={t} /></>;
  if (m === "rudder") {
    const a = t < d * 0.45 ? -20 * ramp(t, 4, 20) : -20 - 15 * ramp(t, d * 0.45, d * 0.45 + 14);
    return (
      <AbsoluteFill><Svg>{bg}
        <g transform="translate(960 720)">
          <path d="M-460 0 A 460 460 0 0 1 460 0 Z" fill="#fbfaf4" stroke={INK} strokeWidth={10} />
          <path d="M-440 0 A 440 440 0 0 1 0 -440 L 0 -360 A 360 360 0 0 0 -360 0 Z" fill="#f2a29d" />
          <path d="M0 -440 A 440 440 0 0 1 440 0 L 360 0 A 360 360 0 0 0 0 -360 Z" fill="#a9dcae" />
          {[-35, -20, -10, 0, 10, 20, 35].map((q) => { const r = (q / 35) * (Math.PI * 0.35) - Math.PI / 2; return <g key={q}><line x1={Math.cos(r) * 340} y1={Math.sin(r) * 340} x2={Math.cos(r) * 440} y2={Math.sin(r) * 440} stroke={INK} strokeWidth={8} /><Num x={Math.cos(r) * 290} y={Math.sin(r) * 290 + 14} size={38}>{Math.abs(q)}</Num></g>; })}
          <line x1={0} y1={0} x2={Math.cos((a / 35) * (Math.PI * 0.35) - Math.PI / 2) * 400} y2={Math.sin((a / 35) * (Math.PI * 0.35) - Math.PI / 2) * 400} stroke={INK} strokeWidth={20} strokeLinecap="round" />
          <circle r={34} fill={INK} />
          <T3 x={-300} y={90} size={56} color="#f2a29d">PORT (LEFT)</T3><T3 x={300} y={90} size={56} color="#a9dcae">STARBOARD</T3>
        </g>
      </Svg></AbsoluteFill>
    );
  }
  if (m === "limit") {
    return (
      <AbsoluteFill><Svg>{bg}
        <Gauge v={7 + Math.sin(t * 0.1) * 0.6} max={20} red={8.6} unit="knots" label="SPEED" x={700} />
        <g transform={`translate(1500 520) scale(${pop(t, 6)})`}>
          <circle r={230} fill="#fff" stroke={RED} strokeWidth={46} /><circle r={252} fill="none" stroke={INK} strokeWidth={8} />
          <Num x={0} y={30} size={120}>~8.6</Num><Num x={0} y={110} size={50}>knots</Num>
        </g>
      </Svg></AbsoluteFill>
    );
  }
  if (m === "wind") {
    const v = 44 * ramp(t, 4, d * 0.7) + Math.sin(t * 0.7) * 3 * ramp(t, d * 0.5, d);
    return (
      <AbsoluteFill><Svg>{bg}
        {Array.from({ length: 20 }).map((_, i) => <path key={i} d={`M${((i * 173 + t * 30) % 2200) - 200} ${180 + (i * 47) % 800} h 140`} stroke="#c8a46a" strokeWidth={8} strokeLinecap="round" opacity={0.5} />)}
        <Gauge v={Math.max(0, v)} max={60} red={40} unit="knots" label="WIND GUSTS" x={760} />
        <g opacity={ramp(t, d * 0.5, d * 0.6)}><Card x={1500} y={520} w={440} h={180}><Num x={0} y={-10} size={80}>74 km/h</Num><Num x={0} y={56} size={40}>over 70 km/h</Num></Card></g>
      </Svg></AbsoluteFill>
    );
  }
  const v = 6 + 7 * ramp(t, 4, d * 0.5);
  return (
    <AbsoluteFill><Svg>{bg}
      <Gauge v={v} max={20} red={8.6} unit="knots" label="SPEED" x={760} />
      <g opacity={ramp(t, d * 0.45, d * 0.55)}><Card x={1500} y={480} w={460} h={220}><Num x={0} y={-30} size={50} color={RED}>LIMIT</Num><Num x={0} y={60} size={100}>under 9</Num></Card></g>
    </Svg></AbsoluteFill>
  );
};

// ================================================================== TOWER (ship stood on end vs Empire State Building)
export const TowerT: Tpl = ({ t, d }) => {
  const k = ramp(t, 6, Math.min(d - 4, 50));
  const ppm = 2.25, ground = 1040;
  const esbH = 381 * ppm;
  return (
    <AbsoluteFill><Svg>
      <rect width={W} height={H} fill="#bfe0f2" />
      <rect y={ground} width={W} height={H - ground} fill="#9aa4ad" />
      {/* Empire State Building silhouette (roof 381 m) */}
      <g transform={`translate(1300 ${ground})`}>
        <path d={`M-120 0 V ${-esbH * 0.55} H -90 V ${-esbH * 0.8} H -50 V ${-esbH * 0.92} H -25 V ${-esbH} H 25 V ${-esbH * 0.92} H 50 V ${-esbH * 0.8} H 90 V ${-esbH * 0.55} H 120 V 0 Z`} fill="#8a96a3" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={-100} y1={-20 - i * 14} x2={100} y2={-20 - i * 14} stroke="#6d7884" strokeWidth={3} />)}
        <line x1={0} y1={-esbH} x2={0} y2={-esbH - 62 * ppm} stroke={INK} strokeWidth={6} />
        <T3 x={300} y={-esbH + 90} size={44}>EMPIRE STATE</T3>
        <T3 x={300} y={-esbH + 150} size={40} color="#fff">381 m (roof)</T3>
      </g>
      {/* the ship, rotating upright */}
      <g transform={`translate(700 ${ground}) rotate(${-90 * k})`}>
        <g transform={`scale(${(400 * ppm) / 1300}) translate(0 -230)`}><EGSide /></g>
      </g>
      <T3 x={560} y={ground - 400 * ppm * k - 30} size={60} color={YEL} o={k}>400 m</T3>
      <line x1={0} y1={ground - esbH} x2={W} y2={ground - esbH} stroke={RED} strokeWidth={4} strokeDasharray="20 14" opacity={k} />
    </Svg></AbsoluteFill>
  );
};

// ================================================================== BOXLINE (20,000 containers end to end vs the canal)
export const BoxlineT: Tpl = ({ t, d, p }) => {
  const step = Number(p.step ?? 1);
  const x0 = 160, x1 = 1760, ppk = (x1 - x0) / 193;
  const k = step === 1 ? ramp(t, 6, d - 6) : 1;
  const len = 120 * k * ppk;
  return (
    <AbsoluteFill style={{ background: SAND }}><Svg>
      <rect x={x0} y={600} width={x1 - x0} height={90} rx={20} fill={WATER} stroke={INK} strokeWidth={6} />
      <T3 x={960} y={660} size={50}>SUEZ CANAL · 193 km</T3>
      {Array.from({ length: Math.floor(len / 22) }).map((_, i) => <rect key={i} x={x0 + i * 22} y={500} width={20} height={70} fill={BOX[i % BOX.length]} stroke={INK} strokeWidth={2.5} />)}
      <T3 x={x0 + len / 2} y={470} size={56} color={YEL} o={ramp(t, 10, 20)}>20,000 containers ≈ {Math.round(120 * k)} km</T3>
      {step === 2 && (
        <g opacity={ramp(t, 4, 14)}>
          <path d={`M${x0} 760 v 30 H ${x0 + 120 * ppk} v -30`} stroke={YEL} strokeWidth={10} fill="none" />
          <line x1={x0 + 96.5 * ppk} y1={560} x2={x0 + 96.5 * ppk} y2={800} stroke={RED} strokeWidth={6} strokeDasharray="16 10" />
          <T3 x={x0 + 96.5 * ppk} y={545} size={40} color={RED}>half</T3>
          <T3 x={x0 + 60 * ppk} y={880} size={70} color={YEL}>MORE THAN HALF</T3>
        </g>
      )}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== DREDGER (cutter suction dredger cut-away)
export const DredgerT: Tpl = ({ t, d, p }) => {
  const step = Number(p.step ?? 1);
  const surf = 430, bed = 900;
  return (
    <AbsoluteFill><Svg>
      <rect width={W} height={surf} fill="#bfe0f2" />
      <rect y={surf} width={W} height={bed - surf} fill="#3f8fbb" />
      <path d={`M0 ${bed} Q 600 ${bed - 30} 1200 ${bed} T 1920 ${bed - 20} V 1080 H 0 Z`} fill={SAND} stroke={INK} strokeWidth={6} />
      <path d="M1500 430 L 1920 330 V 1080 H 1700 Z" fill={SAND} stroke={INK} strokeWidth={6} />
      {/* dredger */}
      <g transform={`translate(0 ${Math.sin(t * 0.08) * 4})`}>
        <path d="M220 400 L 1060 400 L 1030 470 L 250 470 Z" fill="#e8352b" stroke={INK} strokeWidth={8} />
        <rect x={300} y={300} width={180} height={100} fill="#f4f4ee" stroke={INK} strokeWidth={6} />
        <rect x={330} y={250} width={110} height={50} fill="#f4f4ee" stroke={INK} strokeWidth={6} />
        <text x={720} y={452} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={46} fill="#fff">MASHHOUR</text>
        {/* discharge pipe to the bank */}
        <path d="M900 400 Q 1200 300 1560 380" stroke="#596572" strokeWidth={26} fill="none" />
        {Array.from({ length: 14 }).map((_, i) => { const k = ((t * 0.03 + i / 14) % 1); return <circle key={i} cx={900 + 660 * k} cy={400 - Math.sin(k * Math.PI) * 70 - 20 * k} r={8} fill={SAND} stroke={INK} strokeWidth={2} />; })}
        <path d={`M1560 380 q 40 10 60 ${60 + Math.sin(t * 0.4) * 8}`} stroke="#c8a96a" strokeWidth={22} fill="none" strokeLinecap="round" />
        {/* ladder + cutter head */}
        <line x1={980} y1={440} x2={1360} y2={860} stroke="#596572" strokeWidth={34} strokeLinecap="round" />
        <line x1={980} y1={440} x2={1360} y2={860} stroke={INK} strokeWidth={4} strokeDasharray="10 16" />
        {Array.from({ length: 10 }).map((_, i) => { const k = 1 - ((t * 0.035 + i / 10) % 1); return <circle key={i} cx={980 + 380 * k} cy={440 + 420 * k} r={9} fill={SAND} stroke={INK} strokeWidth={2} />; })}
        <g transform={`translate(1370 875) rotate(${t * 9})`}>
          {Array.from({ length: 6 }).map((_, i) => <path key={i} d="M0 0 L 70 -18 L 64 18 Z" fill="#ffd23f" stroke={INK} strokeWidth={4} transform={`rotate(${i * 60})`} />)}
          <circle r={26} fill="#7d8790" stroke={INK} strokeWidth={5} />
        </g>
      </g>
      {step === 1 && <Actor a="wave" t={t} x={640} y={402} s={0.36} id="dr" />}
      {step === 2 && <g><Card x={520} y={720} w={600} h={190}><Num x={0} y={-20} size={90} color={NAVY}>{Math.round(2000 * ramp(t, 4, 40)).toLocaleString("en-US")} m³</Num><Num x={0} y={60} size={46}>every hour</Num></Card></g>}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== POOLS
export const PoolsT: Tpl = ({ t, d }) => {
  const k = ramp(t, 6, d - 10);
  return (
    <AbsoluteFill style={{ background: "#d9ecf3" }}><Svg>
      {Array.from({ length: 12 }).map((_, i) => {
        const x = 230 + (i % 4) * 300, y = 300 + Math.floor(i / 4) * 230;
        const f = clamp01(k * 12 - i);
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect x={-130} y={-80} width={260} height={160} rx={10} fill={WATER} stroke={INK} strokeWidth={6} />
            {[-40, 0, 40].map((ly) => <line key={ly} x1={-120} y1={ly} x2={120} y2={ly} stroke="#fff" strokeWidth={3} strokeDasharray="12 10" />)}
            <rect x={-127} y={77 - 154 * f} width={254} height={154 * f} fill={SAND} />
            {f > 0 && f < 1 && <path d={`M0 -150 Q 10 -110 0 ${77 - 154 * f}`} stroke="#c8a96a" strokeWidth={22} fill="none" />}
          </g>
        );
      })}
      <g transform="translate(1600 560)"><Card x={0} y={0} w={460} h={300}><Num x={0} y={-40} size={88} color={NAVY}>{Math.round(30000 * k).toLocaleString("en-US")}</Num><Num x={0} y={30} size={46}>m³ of sand</Num><Num x={0} y={100} size={50} color={GREEN}>= {Math.min(12, Math.ceil(k * 12))} pools</Num></Card></g>
    </Svg></AbsoluteFill>
  );
};

// ================================================================== MOON (supermoon -> spring tide)
export const MoonT: Tpl = ({ t, d }) => {
  const k = ramp(t, 6, d * 0.6);
  return (
    <AbsoluteFill style={{ background: "#0f1c33" }}><Svg>
      {Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 70) * 700} r={1.5 + rnd(i + 3) * 2.5} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 0.05 + i))} />)}
      <circle cx={1300} cy={380} r={170 + 90 * k} fill="#fff6d6" opacity={0.18} />
      <circle cx={1300} cy={380} r={120 + 70 * k} fill="#f4ecd0" stroke={INK} strokeWidth={8} />
      {[[-40, -30, 26], [40, 30, 18], [10, 60, 14], [-60, 40, 12]].map(([x, y, r], i) => <circle key={i} cx={1300 + x * (1 + k * 0.6)} cy={380 + y * (1 + k * 0.6)} r={r * (1 + k * 0.6)} fill="#ddd2ac" />)}
      <T3 x={1300} y={720} size={90} color={YEL} o={ramp(t, 14, 24)}>SUPERMOON</T3>
      <rect y={860 - 40 * k} width={W} height={220 + 40 * k} fill="#24476a" />
      {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M${((i * 230 + t * 2) % 2100) - 100} ${880 - 40 * k} q 25 -10 50 0 t 50 0`} stroke="#7fb3d5" strokeWidth={5} fill="none" />)}
      <T3 x={420} y={820 - 40 * k} size={46} color="#fff" o={ramp(t, d * 0.4, d * 0.5)}>closer Moon = higher tides</T3>
    </Svg></AbsoluteFill>
  );
};

// ================================================================== BANK EFFECT
export const BankT: Tpl = ({ t, d, p }) => {
  const step = Number(p.step ?? 1);
  const rot = step === 2 ? 12 * ramp(t, 10, d * 0.7) : 0;
  return (
    <AbsoluteFill style={{ background: WATER }}><Svg>
      <path d="M0 0 H 1920 V 300 Q 960 330 0 300 Z" fill={SAND} stroke={INK} strokeWidth={8} />
      <T3 x={960} y={220} size={50} color="#8a6d3a">BANK</T3>
      <g transform={`translate(960 520) rotate(${rot}) scale(3.2)`}><EGTop /></g>
      {/* fast water in the gap */}
      {Array.from({ length: 16 }).map((_, i) => {
        const x = ((i * 140 + t * 14) % 2100) - 120;
        return <path key={i} d={`M${x} ${360 + (i % 2) * 22} h 90 l -18 -12 m 18 12 l -18 12`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />;
      })}
      {Array.from({ length: 8 }).map((_, i) => <path key={`s${i}`} d={`M${((i * 260 + t * 4) % 2100) - 120} ${780 + (i % 2) * 60} h 60`} stroke="#bfe6f5" strokeWidth={6} strokeLinecap="round" />)}
      <g opacity={ramp(t, 8, 18)}><Card x={1560} y={380} w={420} h={110} fill={YEL}><Num x={0} y={18} size={52}>FAST WATER</Num></Card></g>
      <g opacity={ramp(t, step === 1 ? d * 0.55 : 4, step === 1 ? d * 0.65 : 12)}><Card x={360} y={380} w={440} h={110} fill={RED}><Num x={0} y={18} size={50} color="#fff">LOW PRESSURE</Num></Card></g>
      {step === 2 && (
        <g opacity={ramp(t, 14, 24)}>
          <path d="M420 700 v -150 l -30 30 m 30 -30 l 30 30" stroke={YEL} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <T3 x={420} y={780} size={46} color={YEL}>stern pulled in</T3>
          <path d="M1500 560 v 180 l -30 -30 m 30 30 l 30 -30" stroke={YEL} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <T3 x={1500} y={820} size={46} color={YEL}>bow pushed out</T3>
        </g>
      )}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== REPORT (Panama 2023 investigation)
export const ReportT: Tpl = ({ t, p }) => {
  const step = Number(p.step ?? 1);
  const rows = ["Wind + visibility treated as a risk", "Kept to the speed limit", "Tug escort used"];
  return (
    <AbsoluteFill style={{ background: "#c9d3dc" }}><Svg>
      <g transform={`translate(800 ${620 + (step === 1 ? (1 - ramp(t, 0, 14)) * 600 : 0)}) rotate(2) scale(0.9)`}>
        <rect x={-460} y={-460} width={920} height={920} fill="#fbfaf4" stroke={INK} strokeWidth={8} />
        <rect x={-460} y={-460} width={920} height={130} fill={NAVY} />
        <Num x={0} y={-376} size={48} color="#fff">PANAMA MARITIME AUTHORITY</Num>
        <Num x={0} y={-250} size={46}>Investigation report · EVER GIVEN</Num>
        <Num x={0} y={-190} size={40} color="#777">published 2023</Num>
        {rows.map((r, i) => {
          const on = step >= i + 2;
          const k = on ? (step === i + 2 ? ramp(t, 6, 14) : 1) : 0;
          return (
            <g key={r} transform={`translate(-400 ${-60 + i * 150})`} opacity={step === 1 ? 0.35 : 1}>
              <rect x={0} y={-50} width={80} height={80} fill="#fff" stroke={INK} strokeWidth={6} />
              <Num x={110} y={10} size={44} anchor="start">{r}</Num>
              {k > 0 && <g transform={`translate(40 -10) scale(${0.6 + 0.4 * k})`} opacity={k}><path d="M-34 -34 L34 34 M34 -34 L-34 34" stroke={RED} strokeWidth={16} strokeLinecap="round" /></g>}
            </g>
          );
        })}
      </g>
      {step === 1 && <g transform={`translate(1550 420) scale(${pop(t, 12)})`}><rect x={-150} y={-100} width={300} height={200} fill="#fff" stroke={INK} strokeWidth={6} /><rect x={0} y={-100} width={150} height={100} fill="#da121a" /><rect x={-150} y={0} width={150} height={100} fill="#072357" /><circle cx={-75} cy={-50} r={18} fill="#072357" /><circle cx={75} cy={50} r={18} fill="#da121a" /></g>}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== LAKE (held in the Great Bitter Lake)
export const LakeT: Tpl = ({ t, d, p }) => {
  const crew = p.crew === "1", cargo = p.cargo === "1";
  if (cargo) {
    const labels = ["SHOES", "TVs", "CAR PARTS", "SOFAS", "BIKES", "TOYS"];
    return (
      <AbsoluteFill style={{ background: "#f2c48a" }}><Svg>
        {labels.map((l, i) => {
          const x = 320 + (i % 3) * 640, y = 400 + Math.floor(i / 3) * 360;
          return (
            <g key={l} transform={`translate(${x} ${y + Math.sin(t * 0.08 + i) * 4})`} opacity={ramp(t, i * 4, i * 4 + 8)}>
              <rect x={-280} y={-150} width={560} height={300} fill={BOX[i % BOX.length]} stroke={INK} strokeWidth={8} />
              {Array.from({ length: 8 }).map((_, j) => <line key={j} x1={-250 + j * 70} y1={-130} x2={-250 + j * 70} y2={130} stroke={INK} strokeWidth={3} opacity={0.4} />)}
              <circle cx={-60} cy={-30} r={18} fill={INK} /><circle cx={60} cy={-30} r={18} fill={INK} />
              <path d="M-50 60 q 50 -40 100 0" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
              <T3 x={0} y={-80} size={48}>{l}</T3>
            </g>
          );
        })}
      </Svg></AbsoluteFill>
    );
  }
  if (crew) {
    const days = Math.round(20 + 80 * ramp(t, 0, d));
    return (
      <AbsoluteFill><Svg>
        <rect width={W} height={H} fill="#f2c48a" />
        <rect y={760} width={W} height={320} fill="#3f8fbb" />
        <g transform="translate(-600 520) scale(1.6)"><EGSide /></g>
        {[0, 1, 2, 3].map((i) => <Guy key={i} x={300 + i * 150} y={505} s={0.3} t={t + i * 17} id={`cw${i}`} pose={breathe({ ...IDLE, armL: [20, 10], armR: [20, 10] }, t, i * 9)} face={i % 2 ? FACES.worried : FACES.thinking} />)}
        <Actor a="fish" t={t} x={1500} y={505} s={0.42} id="fisher" />
        <g transform="translate(980 260)">
          <rect x={-200} y={-90} width={400} height={180} rx={10} fill="#3d4a5c" stroke={INK} strokeWidth={6} />
          <Num x={0} y={-30} size={36} color="#fff">DAYS STUCK</Num>
          <text x={0} y={56} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={80} fill="#fff">DAY {days}</text>
        </g>
      </Svg></AbsoluteFill>
    );
  }
  const stamp = p.stamp === "1";
  const sk = ramp(t, d * 0.45, d * 0.45 + 6);
  return (
    <AbsoluteFill><Svg>
      <rect width={W} height={H} fill="#f2c48a" />
      <path d="M0 520 Q 960 470 1920 520 V 1080 H 0 Z" fill="#3f8fbb" stroke={INK} strokeWidth={6} />
      <path d="M0 520 Q 300 440 700 500 L 0 560 Z" fill={SAND} /><path d="M1920 520 Q 1500 440 1200 500 L 1920 560 Z" fill={SAND} />
      <g transform={`translate(560 ${600 + Math.sin(t * 0.06) * 3}) scale(0.62)`}><EGSide /></g>
      <path d="M1360 700 Q 1390 820 1350 900" stroke={INK} strokeWidth={5} strokeDasharray="10 8" fill="none" />
      <T3 x={960} y={380} size={60} color="#fff">GREAT BITTER LAKE</T3>
      {stamp && sk > 0 && (
        <g transform={`translate(960 640) rotate(-12) scale(${1 + (1 - sk) * 1.8})`} opacity={sk}>
          <rect x={-330} y={-110} width={660} height={220} rx={20} fill="none" stroke={RED} strokeWidth={20} />
          <Num x={0} y={45} size={150} color={RED}>HELD</Num>
        </g>
      )}
    </Svg></AbsoluteFill>
  );
};

// ================================================================== END CARD (to the Seawise Giant video)
export const Endcard2: Tpl = ({ t, w }) => (
  <AbsoluteFill style={{ background: NAVY }}>
    <Svg>
      <Rays t={t} />
      <g transform="translate(900 200)">
        <rect x={0} y={0} width={860} height={484} rx={24} fill="#2f86c9" stroke={INK} strokeWidth={8} />
        <defs><clipPath id="thumb3"><rect x={0} y={0} width={860} height={484} rx={24} /></clipPath></defs>
        <g clipPath="url(#thumb3)">
          <rect x={0} y={0} width={860} height={270} fill="#f2a65a" />
          <g transform="translate(40 250) scale(0.66)"><Tanker /></g>
          <rect x={0} y={320} width={860} height={164} fill="#1d4e7a" />
        </g>
        <T3 x={430} y={120} size={80} color={YEL}>TOO BIG!</T3>
        <T3 x={430} y={560} size={46}>The biggest ship ever built</T3>
      </g>
      <g transform={`translate(1330 ${820 + Math.sin(t * 0.2) * 4})`}>
        <rect x={-300} y={-60} width={600} height={120} rx={60} fill={RED} stroke={INK} strokeWidth={8} />
        <Num x={0} y={22} size={64} color="#fff">SUBSCRIBE</Num>
      </g>
      <Actor a="point" t={t} x={420} y={1040} s={0.95} id="end" w={w} />
    </Svg>
  </AbsoluteFill>
);

export const TEMPLATES3B: Record<string, Tpl> = {
  map: MapT, money: MoneyT, dial: DialT, tower: TowerT, boxline: BoxlineT, dredger: DredgerT, pools: PoolsT,
  moon: MoonT, bankfx: BankT, report: ReportT, lake: LakeT, endcard2: Endcard2,
};
