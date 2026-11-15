// How We Ended Up · scene templates (data in -> animated scene out). ~80% of every video comes from these.
// Each template gets `uid` (unique SVG ids), `f` (local frame) and `dur` (scene length in frames). Pure functions of f.
import React from "react";
import {
  DISPLAY, Gallery, Grain, H, Headline, LabelCard, MapCat, mapHeight, MONO, Pillar, Plinth, projectEE, RoomSign, STYLE, Subtitle, T, W, WorldMap,
} from "./kit";
import { Cam, clamp01, easeBack, easeInOut, easeOut, lerp, prog, TIMING } from "./motion";
import { Exhibit, ObjectId, OBJECTS } from "./objects";
import { ChinaRoom, EuropeRoom, TodayRoom } from "./rooms";

type Base = { uid: string; f: number; dur: number };
export type Pillar6 = "eat" | "wear" | "home" | "money" | "manners" | "around";
const SIDES = [T.clay, T.slate, T.moss];
const fadeIn = (f: number, start = 0, d = 10) => easeOut(prog(f, start, d));

/** Subtitle that fades in with the scene. */
const Sub: React.FC<{ f: number; text?: string; source?: string }> = ({ f, text, source }) =>
  text ? <g opacity={fadeIn(f, 4, 8)}><Subtitle text={text} source={source} /></g> : null;

/* ---------------- 1 · exhibits: 1-3 equal plinths ---------------- */
export type ExhibitItem = { obj: ObjectId; meta: string; name: string; sub: string };
export type ExhibitsProps = { tag: string; word: string; pillar?: Pillar6; items: ExhibitItem[]; subtitle?: string; source?: string; focus?: number; focusAt?: number };
export const Exhibits: React.FC<Base & ExhibitsProps> = ({ uid, f, dur, tag, word, pillar = "eat", items, subtitle, source, focus, focusAt = 0.55 }) => {
  const n = items.length;
  const xs = n === 1 ? [960] : n === 2 ? [480, 1440] : [320, 960, 1600];
  const pw = n === 3 ? 380 : 460, top = 700;
  const push = focus === undefined ? 0 : easeInOut(prog(f, dur * focusAt, 20));
  return (
    <g>
      <Cam f={f} push={push} zoom={1.32} fx={xs[focus ?? 0]} fy={560}>
        <Gallery id={`${uid}g`} bays={SIDES.slice(0, Math.max(1, n))} />
        <g opacity={fadeIn(f, 0, 12) * (1 - push)}><Headline tag={tag} word={word} accent={T[pillar]} /></g>
        {items.map((it, i) => {
          const start = 8 + i * TIMING.stagger;
          const cardT = easeOut(prog(f, start + TIMING.cardDelay, TIMING.card));
          return (
            <g key={i}>
              <Plinth x={xs[i]} top={top} w={pw} accent={SIDES[i]} />
              <Exhibit id={it.obj} x={xs[i]} plinthTop={top} h={n === 1 ? 420 : 330} f={f} start={start} />
              <g opacity={cardT} transform={`translate(0 ${(1 - cardT) * 18})`}>
                <LabelCard x={xs[i] - 165} y={770} meta={it.meta} name={it.name} sub={it.sub} edge={SIDES[i]} />
              </g>
            </g>
          );
        })}
      </Cam>
      <Sub f={f} text={subtitle} source={source} />
    </g>
  );
};

/* ---------------- 2 · period rooms (Then tint), single diorama or split ---------------- */
export type RoomId = "europe1500" | "china1500" | "today";
const ROOMS: Record<RoomId, { C: React.FC<{ f?: number }>; x0: number; then: boolean }> = {
  europe1500: { C: EuropeRoom, x0: 0, then: true },
  china1500: { C: ChinaRoom, x0: 960, then: true },
  today: { C: ({ f }) => <TodayRoom f={f} x0={0} w={960} />, x0: 0, then: false },
};
/** One half-room drawn at screen x `at` (0 or 960), tinted if it is a "Then" room; tint washes in from the left. */
const RoomHalf: React.FC<{ uid: string; room: RoomId; at: number; f: number; wash: number }> = ({ uid, room, at, f, wash }) => {
  const r = ROOMS[room];
  const C = r.C;
  const dx = at - r.x0;
  const body = <g transform={`translate(${dx} 0)`}><C f={f} /></g>;
  if (!r.then) return <g><defs><clipPath id={`${uid}c`}><rect x={at} width={960} height={H} /></clipPath></defs><g clipPath={`url(#${uid}c)`}>{body}</g></g>;
  return (
    <g>
      <defs>
        <clipPath id={`${uid}c`}><rect x={at} width={960} height={H} /></clipPath>
        <clipPath id={`${uid}w`}><rect x={at} width={960 * wash} height={H} /></clipPath>
        <filter id={`${uid}t`}><feColorMatrix type="saturate" values={String(STYLE.line.thenSaturate)} /></filter>
      </defs>
      <g clipPath={`url(#${uid}c)`}>{body}</g>
      <g clipPath={`url(#${uid}w)`}>
        <g filter={`url(#${uid}t)`}>{body}</g>
        <rect x={at} width={960} height={H} fill={T.thenPaper} opacity={STYLE.line.thenPaperOpacity} style={{ mixBlendMode: "multiply" }} />
      </g>
    </g>
  );
};
export type PeriodProps = { left: RoomId; leftSign: string; right?: RoomId; rightSign?: string; subtitle?: string; source?: string; washIn?: boolean };
export const Period: React.FC<Base & PeriodProps> = ({ uid, f, left, leftSign, right, rightSign, subtitle, source, washIn = true }) => {
  const wash = washIn ? easeInOut(prog(f, 0, TIMING.tint)) : 1;
  if (!right) {
    // single room = a diorama box set into the gallery wall, camera slowly pushes in
    const push = easeInOut(prog(f, 10, 90)) * 0.6;
    // zoom kept small so the door sign above the diorama stays in frame
    return (
      <g>
        <Cam f={f} push={push} zoom={1.12} fx={960} fy={560}>
          <Gallery id={`${uid}g`} bays={[T.wall]} floorY={1000} />
          <rect x={440} y={110} width={1040} height={800} fill="#3A3A40" />
          <svg x={480} y={140} width={960} height={740} viewBox={`0 160 960 740`}>
            <RoomHalf uid={`${uid}a`} room={left} at={0} f={f} wash={wash} />
          </svg>
          <RoomSign x={960} y={50} text={leftSign} />
        </Cam>
        <Grain seed={7} />
        <Sub f={f} text={subtitle} source={source} />
      </g>
    );
  }
  const split = easeOut(prog(f, 0, 14));
  return (
    <g>
      <Cam f={f}>
        <RoomHalf uid={`${uid}a`} room={left} at={0} f={f} wash={wash} />
        <g transform={`translate(${(1 - split) * 960} 0)`}><RoomHalf uid={`${uid}b`} room={right} at={960} f={f} wash={wash} /></g>
        <Pillar x={960 + (1 - split) * 960} floorY={1080} />
        <RoomSign x={480} y={40} text={leftSign} />
        <g opacity={split}><RoomSign x={1440} y={40} text={rightSign ?? ""} /></g>
      </Cam>
      <Grain seed={2} />
      <Sub f={f} text={subtitle} source={source} />
    </g>
  );
};

/* ---------------- 3 · map room: frame push, categories fill in turn, optional routes ---------------- */
export type MapRoute = { from: [number, number]; to: [number, number]; at: number };
export type MapSceneProps = { tag: string; title: string; cats: Record<string, MapCat>; order: MapCat[]; legend: { cat: MapCat; label: string }[]; routes?: MapRoute[]; subtitle?: string; source?: string };
export const MapScene: React.FC<Base & MapSceneProps> = ({ uid, f, dur, tag, title, cats, order, legend, routes = [], subtitle, source }) => {
  const mw = 1240, mh = mapHeight(mw), fx = (W - mw) / 2, fy = 240;
  const push = easeInOut(prog(f, 6, 26));
  const fillStart = (i: number) => 30 + i * 26;
  const op: Partial<Record<MapCat, number>> = {};
  (["a", "b", "c", "mix"] as MapCat[]).forEach((c) => { const i = order.indexOf(c); op[c] = i < 0 ? 0 : easeOut(prog(f, fillStart(i), TIMING.mapFill)); });
  const k = mw / 1000;
  return (
    <g>
      <Cam f={f} push={push} zoom={1.15} fx={960} fy={520}>
        <Gallery id={`${uid}g`} bays={[T.wall]} floorY={1000} />
        <text x={W / 2} y={120} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={24} letterSpacing={8} fill={T.label}>{tag}</text>
        <text x={W / 2} y={178} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={56} fill={T.ink}>{title}</text>
        <rect x={fx - 54} y={fy - 34} width={mw + 108} height={mh + 68} fill="#000" opacity={0.1} transform="translate(10 12)" />
        <rect x={fx - 54} y={fy - 34} width={mw + 108} height={mh + 68} fill="#3A3A40" />
        <rect x={fx - 32} y={fy - 14} width={mw + 64} height={mh + 28} fill="#FBF8F2" />
        <WorldMap id={`${uid}m`} x={fx} y={fy} w={mw} cats={cats} catOpacity={op}>
          {routes.map((r, i) => {
            const a = projectEE(...r.from), b = projectEE(...r.to);
            const t = easeInOut(prog(f, dur * r.at, 30));
            const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 30;
            return (
              <g key={i}>
                <path d={`M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`} fill="none" stroke={T.ink} strokeWidth={2.4 / k} strokeLinecap="round" pathLength={1} strokeDasharray={`${t} 1`} />
                <circle cx={a[0]} cy={a[1]} r={4 / k} fill={T.ink} opacity={t > 0 ? 1 : 0} />
                <circle cx={b[0]} cy={b[1]} r={5 / k} fill={T.eat} stroke={T.ink} strokeWidth={1.5 / k} opacity={t >= 1 ? 1 : 0} />
              </g>
            );
          })}
        </WorldMap>
        <g transform={`translate(${W / 2 - 520} ${fy + mh + 70})`}>
          <rect x={3} y={5} width={1040} height={86} fill="#000" opacity={0.08} />
          <rect width={1040} height={86} fill={T.card} />
          {legend.map((l, i) => (
            <g key={l.cat} transform={`translate(${40 + i * 250} 26)`} opacity={op[l.cat] ?? 1}>
              {l.cat === "mix" ? <g><rect width={36} height={36} fill={T.moss} /><path d="M0 36 L36 0 L36 18 L18 36 Z M0 18 L18 0 L0 0 Z" fill={T.clay} /></g>
                : <rect width={36} height={36} fill={l.cat === "a" ? T.clay : l.cat === "b" ? T.slate : T.moss} />}
              <text x={52} y={28} fontFamily={MONO} fontWeight={600} fontSize={22} letterSpacing={3} fill={T.ink}>{l.label}</text>
            </g>
          ))}
        </g>
      </Cam>
      <Grain seed={3} />
      <Sub f={f} text={subtitle} source={source} />
    </g>
  );
};

/* ---------------- 4 · reveal: lights down, one spotlight, answer appears, lights back up ----------------
   Lights are fully up again before the outgoing transition (assumes the next scene enters with a dolly or shorter). */
export type RevealProps = { tag?: string; line: string; left?: ObjectId; right?: ObjectId; answer: { meta: string; name: string; sub: string } };
export const Reveal: React.FC<Base & RevealProps> = ({ uid, f, dur, tag = "THE ANSWER", line, left = "fork", right = "hand", answer }) => {
  const down = easeInOut(prog(f, dur * 0.12, TIMING.lightsDown)) * (1 - easeInOut(prog(f, dur - TIMING.lightsUp - TIMING.dolly, TIMING.lightsUp)));
  const flip = prog(f, dur * 0.38, 12); // "?" card flips to the answer
  const sx = flip < 0.5 ? 1 - flip * 2 : (flip - 0.5) * 2;
  const showAnswer = flip >= 0.5;
  const lineT = easeOut(prog(f, dur * 0.45, 14));
  const cone = `${960 - 90},0 ${960 + 90},0 ${960 + 300},${H} ${960 - 300},${H}`;
  return (
    <g>
      <defs>
        <mask id={`${uid}mask`}><rect width={W} height={H} fill="#fff" /><polygon points={cone} fill="#000" /></mask>
        <radialGradient id={`${uid}spot`} cx="50%" cy="0%" r="100%"><stop offset="0" stopColor={T.spot} stopOpacity={0.5} /><stop offset="1" stopColor={T.spot} stopOpacity={0} /></radialGradient>
      </defs>
      <Cam f={f}>
        <Gallery id={`${uid}g`} bays={SIDES} />
        {[320, 960, 1600].map((x, i) => <Plinth key={x} x={x} top={700} w={380} accent={SIDES[i]} />)}
        <Exhibit id={left} x={320} plinthTop={700} h={330} />
        <Exhibit id={right} x={1600} plinthTop={700} h={330} />
        <g stroke={T.line} strokeWidth={3.5}>
          <line x1={900} y1={700} x2={930} y2={420} /><line x1={1020} y1={700} x2={990} y2={420} />
        </g>
        <g transform={`translate(960 525) scale(${Math.max(0.02, sx)} 1)`}>
          <rect x={-150} y={-160} width={300} height={300} fill={T.card} stroke={T.line} strokeWidth={3.5} />
          {!showAnswer && <text x={0} y={70} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={200} fill={T.ink}>?</text>}
          {showAnswer && (
            <g>
              <rect x={-150} y={-160} width={10} height={300} fill={T.eat} />
              <text x={-118} y={-110} fontFamily={MONO} fontWeight={600} fontSize={17} letterSpacing={2} fill={T.label}>{answer.meta}</text>
              <text x={-118} y={-30} fontFamily={DISPLAY} fontWeight={900} fontSize={46} fill={T.ink}>{answer.name}</text>
              <text x={-118} y={20} fontFamily={MONO} fontSize={18} fill="#3D382F">{answer.sub}</text>
            </g>
          )}
        </g>
      </Cam>
      <rect width={W} height={H} fill={T.dark} opacity={STYLE.reveal.darkOpacity * down} mask={`url(#${uid}mask)`} />
      <polygon points={cone} fill={`url(#${uid}spot)`} opacity={down} />
      <g opacity={down}>
        <text x={W / 2} y={110} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={24} letterSpacing={8} fill={T.eat}>{tag}</text>
        <text x={W / 2} y={250} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={96} fill="#F4EEDF" stroke={T.dark} strokeWidth={6} paintOrder="stroke" opacity={lineT}>{line}</text>
      </g>
      <Grain seed={4} o={0.6} />
    </g>
  );
};

/* ---------------- 5 · card flip: "The story you heard" -> "Correction" ---------------- */
export type CardFlipProps = { heard: string; actual: string; source?: string };
export const CardFlip: React.FC<Base & CardFlipProps> = ({ uid, f, dur, heard, actual, source }) => {
  const flip = prog(f, dur * 0.45, 14);
  const sx = flip < 0.5 ? 1 - flip * 2 : (flip - 0.5) * 2;
  const back = flip >= 0.5;
  const enter = easeBack(prog(f, 0, 14));
  const wrap = (s: string) => {
    const words = s.split(" "), lines: string[] = [""];
    words.forEach((w) => { if ((lines[lines.length - 1] + " " + w).trim().length > 26) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + " " + w).trim(); });
    return lines;
  };
  return (
    <g>
      <Cam f={f}>
        <Gallery id={`${uid}g`} bays={[T.wall]} />
        <g transform={`translate(960 ${470 + (1 - enter) * 60}) scale(${Math.max(0.02, sx)} 1)`} opacity={clamp01(enter * 1.5)}>
          <rect x={-436} y={-266} width={880} height={540} fill="#000" opacity={0.1} />
          <rect x={-440} y={-270} width={880} height={540} fill={T.card} stroke={T.line} strokeWidth={3} />
          <rect x={-440} y={-270} width={14} height={540} fill={back ? T.money : T.manners} />
          <text x={-390} y={-200} fontFamily={MONO} fontWeight={600} fontSize={26} letterSpacing={6} fill={back ? T.money : T.manners}>{back ? "CORRECTION" : "THE STORY YOU HEARD"}</text>
          {wrap(back ? actual : heard).map((l, i) => (
            <text key={i} x={-390} y={-90 + i * 82} fontFamily={DISPLAY} fontWeight={900} fontSize={68} fill={T.ink}>{l}</text>
          ))}
          {back && source && <text x={-390} y={240} fontFamily={MONO} fontSize={18} fill={T.label}>{source}</text>}
        </g>
      </Cam>
      <Grain seed={8} />
    </g>
  );
};

/* ---------------- 6 · today room ---------------- */
export type TodayProps = { subtitle?: string; source?: string };
export const Today: React.FC<Base & TodayProps> = ({ f, dur, subtitle, source }) => (
  <g>
    <Cam f={f} push={easeInOut(prog(f, 0, dur))} zoom={1.38} fx={960} fy={600}>
      <TodayRoom f={f} />
    </Cam>
    <Grain seed={9} />
    <Sub f={f} text={subtitle} source={source} />
  </g>
);

/* ---------------- 7 · title wall ---------------- */
export type TitleWallProps = { title?: string; question: string };
export const TitleWall: React.FC<Base & TitleWallProps> = ({ uid, f, title = "How We Ended Up", question }) => {
  const a = easeOut(prog(f, 4, 18)), b = easeOut(prog(f, 18, 14));
  return (
    <g>
      <Cam f={f}>
        <Gallery id={`${uid}g`} bays={[T.wall]} />
        <rect x={W / 2 - 40} y={300 - (1 - a) * 10} width={80} height={6} fill={T.eat} opacity={a} />
        <text x={W / 2} y={470 + (1 - a) * 30} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={150} fill={T.ink} opacity={a}>{title}</text>
        <text x={W / 2} y={570} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={30} letterSpacing={6} fill={T.label} opacity={b}>{question.toUpperCase()}</text>
      </Cam>
      <Grain seed={10} />
    </g>
  );
};

export const TEMPLATES = { exhibits: Exhibits, period: Period, map: MapScene, reveal: Reveal, cardFlip: CardFlip, today: Today, titleWall: TitleWall };
export type TemplateId = keyof typeof TEMPLATES;
export { lerp };
