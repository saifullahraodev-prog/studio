// How We Ended Up · retention layer: word-synced captions, keyword pops + camera punch, hand-drawn marks,
// camera beats, re-hook chips. Timings come from tools/howwe_build.py (words in frames, local to each scene).
import React from "react";
import { DISPLAY, MONO, READ, T, W } from "./kit";
import { clamp01, easeBack, easeInOut, easeOut, lerp, prog } from "./motion";

export type Word = { w: string; f0: number; f1: number; em?: boolean };
export type CamKey = { f: number; zoom: number; fx: number; fy: number; d?: number };
export type Mark = { f: number; kind: "circle" | "underline" | "arrow"; x: number; y: number; w: number; h?: number; d?: number };

/** Camera state at frame f from a list of keys (each eases from the previous state over d frames, default 14). */
export const camAt = (f: number, keys: CamKey[]) => {
  let cur = { zoom: 1, fx: W / 2, fy: 540 };
  for (const k of [...keys].sort((a, b) => a.f - b.f)) {
    const t = easeInOut(prog(f, k.f, k.d ?? 14));
    if (t <= 0) break;
    cur = { zoom: lerp(cur.zoom, k.zoom, t), fx: lerp(cur.fx, k.fx, t), fy: lerp(cur.fy, k.fy, t) };
  }
  return cur;
};

/** Hand-drawn marks (Johnny Harris borrow): drawn on with a pen stroke, in ink. Place inside the scene's Cam. */
export const Marks: React.FC<{ f: number; marks?: Mark[]; color?: string }> = ({ f, marks = [], color = T.ink }) => (
  <g>
    {marks.map((m, i) => {
      const t = easeOut(prog(f, m.f, m.d ?? 12));
      if (t <= 0) return null;
      const h = m.h ?? m.w * 0.55;
      let d = "";
      if (m.kind === "circle") {
        // slightly overshooting hand-drawn loop
        const pts: string[] = [];
        for (let a = -0.35; a <= Math.PI * 2 + 0.45; a += 0.12) {
          const wob = 1 + 0.035 * Math.sin(a * 3 + i);
          pts.push(`${(m.x + Math.cos(a) * (m.w / 2) * wob).toFixed(1)} ${(m.y + Math.sin(a) * (h / 2) * wob * (1 + (a > Math.PI * 2 ? 0.06 : 0))).toFixed(1)}`);
        }
        d = "M" + pts.join("L");
      } else if (m.kind === "underline") {
        d = `M${m.x - m.w / 2} ${m.y} Q${m.x} ${m.y + 10} ${m.x + m.w / 2} ${m.y - 4}`;
      } else {
        const x1 = m.x - m.w, y1 = m.y - (m.h ?? 120);
        d = `M${x1} ${y1} Q${m.x - m.w * 0.2} ${y1 + 10} ${m.x} ${m.y} M${m.x - 30} ${m.y - 26} L${m.x} ${m.y} L${m.x - 38} ${m.y + 8}`;
      }
      return <path key={i} d={d} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${t} 1.2`} opacity={0.9} />;
    })}
  </g>
);

/** Split words into short caption phrases (<= 6 words, or at punctuation). */
const phrases = (words: Word[]) => {
  const out: Word[][] = [[]];
  words.forEach((w) => {
    const cur = out[out.length - 1];
    cur.push(w);
    if (cur.length >= 6 || /[.!?,…]$/.test(w.w)) out.push([]);
  });
  return out.filter((p) => p.length);
};

/** Word-by-word captions: spoken words solid, the current word underlined, upcoming words faint. */
export const KaraokeCaption: React.FC<{ f: number; words?: Word[]; dark?: boolean }> = ({ f, words = [], dark }) => {
  if (!words.length) return null;
  const ps = phrases(words);
  const cur = ps.find((p, i) => f >= p[0].f0 - 2 && f < (ps[i + 1]?.[0].f0 ?? p[p.length - 1].f1 + 18) - 2);
  if (!cur) return null;
  const a = clamp01((f - cur[0].f0 + 4) / 4);
  return (
    <g opacity={a}>
      <rect x={W / 2 - 720} y={962} width={1440} height={76} rx={12} fill={dark ? "#141A19" : "#FBF8F2"} opacity={0.9} />
      <text x={W / 2} y={1013} textAnchor="middle" fontFamily={READ} fontWeight={600} fontSize={42}>
        {cur.map((w, i) => {
          const nextF0 = cur[i + 1]?.f0 ?? w.f1 + 6;
          const now = f >= w.f0 && f < Math.min(nextF0, w.f1 + 6); // exactly one current word
          const said = f >= w.f0;
          return (
            <React.Fragment key={i}>
              {i > 0 && <tspan> </tspan>}
              <tspan fill={dark ? "#F4EEDF" : T.ink} opacity={said ? 1 : 0.35} textDecoration={now ? "underline" : undefined}>{w.w}</tspan>
            </React.Fragment>
          );
        })}
      </text>
    </g>
  );
};

/** Emphasised words pop above the caption bar (1 s), with a matching camera punch-in (see punchAt). */
export const KeywordPop: React.FC<{ f: number; words?: Word[]; accent: string }> = ({ f, words = [], accent }) => {
  const pop = [...words].reverse().find((w) => w.em && f >= w.f0 && f < w.f0 + 30);
  if (!pop) return null;
  const t = f - pop.f0;
  const s = easeBack(prog(t, 0, 8), 1.8);
  const o = 1 - prog(t, 24, 6);
  const word = pop.w.replace(/[.,!?…]$/, "").toUpperCase();
  const wpx = Math.max(220, word.length * 58 + 80);
  return (
    <g opacity={o} transform={`translate(${W / 2} 880) scale(${s})`}>
      <rect x={-wpx / 2 + 4} y={-66} width={wpx} height={104} rx={8} fill="#000" opacity={0.12} />
      <rect x={-wpx / 2} y={-70} width={wpx} height={104} rx={8} fill={T.card} />
      <rect x={-wpx / 2} y={26} width={wpx} height={8} fill={accent} />
      <text x={0} y={8} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={84} fill={T.ink}>{word}</text>
    </g>
  );
};

/** Camera punch: quick push on each emphasised word (4 frames in, 14 out). Returns a scale factor >= 1. */
export const punchAt = (f: number, words: Word[] = [], amount = 0.035) => {
  let p = 0;
  for (const w of words) {
    if (!w.em) continue;
    const t = f - w.f0;
    if (t < 0 || t > 18) continue;
    p = Math.max(p, t < 4 ? easeOut(t / 4) : 1 - easeInOut((t - 4) / 14));
  }
  return 1 + amount * p;
};

/** Camera beats: each beat eases to the next framing (alternating 1.00 / 1.05 zoom, small sideways shift) over 18 frames. */
export const beatAt = (f: number, beats: number[] = []) => {
  let z = 1, x = 0;
  beats.forEach((b, i) => {
    const t = easeInOut(prog(f, b, 18));
    const tz = i % 2 === 0 ? 1.05 : 1.0, tx = i % 2 === 0 ? (i % 4 === 0 ? -24 : 24) : 0;
    z = lerp(z, tz, t);
    x = lerp(x, tx, t);
  });
  return { z, x };
};

/** Re-hook chip ("But that's only half the story…") shown from frame `from` to the end of the scene. */
export const RehookChip: React.FC<{ f: number; from: number; text: string; accent: string }> = ({ f, from, text, accent }) => {
  const t = easeOut(prog(f, from, 10));
  if (t <= 0) return null;
  const w = Math.max(360, text.length * 17 + 90);
  return (
    <g opacity={t} transform={`translate(${60 + (1 - t) * -40} 60)`}>
      <rect width={w} height={64} rx={32} fill={T.ink} />
      <circle cx={34} cy={32} r={9} fill={accent} />
      <text x={56} y={41} fontFamily={MONO} fontWeight={600} fontSize={22} letterSpacing={3} fill="#F4EEDF">{text.toUpperCase()}</text>
    </g>
  );
};
